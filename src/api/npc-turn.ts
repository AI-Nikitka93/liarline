import type { ChatMessage, NpcTurnRequest, NpcTurnResult } from "../ai/contracts.ts";
import { buildFallbackResponse, safeJsonParse, validateNpcTurnRequest, validateNpcTurnResponse } from "../ai/fallback.ts";
import { buildNpcSystemPrompt, buildNpcUserPrompt } from "../ai/systemPrompt.ts";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 15000;

type HandlerOptions = {
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

type GroqError = Error & {
  status?: number;
  retryAfter?: string | null;
  providerBody?: unknown;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function buildMessages(payload: NpcTurnRequest): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: buildNpcSystemPrompt(payload.npc, payload.casePublic, payload.outputRules)
    }
  ];

  for (const entry of payload.turn.recentTranscript.slice(-2)) {
    messages.push({
      role: "user",
      content: entry.questionText
    });
    messages.push({
      role: "assistant",
      content: JSON.stringify({
        answer_text: entry.answerText,
        truthfulness: "partial",
        suspicion_delta: 0,
        revealed_clue_id: null,
        contradiction_risk: 0,
        npc_mood: payload.npc.mood,
        notebook_hint: ""
      })
    });
  }

  messages.push({
    role: "user",
    content: buildNpcUserPrompt(payload)
  });

  return messages;
}

function createAbortSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 700) };
  }
}

function normalizeFailureReason(error: unknown): {
  reason: string;
  status: number | null;
  retryAfter: string | null;
} {
  if (error instanceof Error && error.name === "AbortError") {
    return { reason: "timeout", status: null, retryAfter: null };
  }

  const maybeGroqError = error as Partial<GroqError>;
  if (maybeGroqError.status === 429) {
    return {
      reason: "rate_limit",
      status: 429,
      retryAfter: maybeGroqError.retryAfter || null
    };
  }

  return {
    reason: error instanceof Error ? error.message : "unknown_error",
    status: typeof maybeGroqError.status === "number" ? maybeGroqError.status : null,
    retryAfter: maybeGroqError.retryAfter || null
  };
}

async function callGroq(payload: NpcTurnRequest, options: Required<Pick<HandlerOptions, "apiKey" | "timeoutMs" | "fetchImpl">>): Promise<{
  content: string;
  status: number;
  retryAfter: string | null;
}> {
  const timer = createAbortSignal(options.timeoutMs);
  try {
    const response = await options.fetchImpl(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${options.apiKey}`,
        "content-type": "application/json"
      },
      signal: timer.signal,
      body: JSON.stringify({
        model: payload.model,
        messages: buildMessages(payload),
        response_format: { type: "json_object" },
        temperature: 0.55,
        top_p: 0.9,
        max_completion_tokens: 180,
        stream: false
      })
    });

    const body = await readJsonResponse(response);
    const retryAfter = response.headers.get("retry-after");

    if (!response.ok) {
      const error = new Error(`Groq request failed with ${response.status}`);
      const groqError = error as GroqError;
      groqError.status = response.status;
      groqError.retryAfter = retryAfter;
      groqError.providerBody = body;
      throw groqError;
    }

    const content =
      typeof (body as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content ===
      "string"
        ? String((body as { choices: Array<{ message: { content: string } }> }).choices[0].message.content)
        : "";

    if (!content) {
      const error = new Error("Groq response did not include message content");
      const groqError = error as GroqError;
      groqError.status = response.status;
      groqError.retryAfter = retryAfter;
      groqError.providerBody = body;
      throw groqError;
    }

    return {
      content,
      status: response.status,
      retryAfter
    };
  } finally {
    timer.clear();
  }
}

export async function handleNpcTurnPayload(rawPayload: unknown, options: HandlerOptions = {}): Promise<NpcTurnResult> {
  const startedAt = Date.now();
  const requestValidation = validateNpcTurnRequest(rawPayload);

  if (!requestValidation.ok) {
    const fallbackPayload = {
      provider: "groq",
      model: "llama-3.1-8b-instant",
      requestId: "invalid_request",
      npc: {
        performanceRole: "confused_witness",
        mood: "guarded"
      },
      turn: {
        responseLocale: "en"
      }
    } as NpcTurnRequest;

    return {
      ok: false,
      source: "fallback",
      requestId: "invalid_request",
      model: "llama-3.1-8b-instant",
      response: buildFallbackResponse(fallbackPayload, "invalid_request"),
      meta: {
        latencyMs: Date.now() - startedAt,
        fallbackReason: requestValidation.errors.join("; "),
        providerStatus: null,
        retryAfter: null,
        validationWarnings: requestValidation.errors
      }
    };
  }

  const payload = requestValidation.value;
  const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!apiKey) {
    return {
      ok: false,
      source: "fallback",
      requestId: payload.requestId,
      model: payload.model,
      response: buildFallbackResponse(payload, "missing_api_key"),
      meta: {
        latencyMs: Date.now() - startedAt,
        fallbackReason: "missing_api_key",
        providerStatus: null,
        retryAfter: null,
        validationWarnings: ["process.env.GROQ_API_KEY is not set"]
      }
    };
  }

  try {
    const providerResponse = await callGroq(payload, {
      apiKey,
      timeoutMs,
      fetchImpl
    });
    const parsed = safeJsonParse(providerResponse.content);
    const validation = validateNpcTurnResponse(parsed, payload);

    if (!validation.ok) {
      return {
        ok: false,
        source: "fallback",
        requestId: payload.requestId,
        model: payload.model,
        response: buildFallbackResponse(payload, "invalid_model_json"),
        meta: {
          latencyMs: Date.now() - startedAt,
          fallbackReason: "invalid_model_json",
          providerStatus: providerResponse.status,
          retryAfter: providerResponse.retryAfter,
          validationWarnings: validation.warnings
        }
      };
    }

    return {
      ok: true,
      source: "groq",
      requestId: payload.requestId,
      model: payload.model,
      response: validation.value,
      meta: {
        latencyMs: Date.now() - startedAt,
        fallbackReason: null,
        providerStatus: providerResponse.status,
        retryAfter: providerResponse.retryAfter,
        validationWarnings: validation.warnings
      }
    };
  } catch (error) {
    const failure = normalizeFailureReason(error);
    return {
      ok: false,
      source: "fallback",
      requestId: payload.requestId,
      model: payload.model,
      response: buildFallbackResponse(payload, failure.reason),
      meta: {
        latencyMs: Date.now() - startedAt,
        fallbackReason: failure.reason,
        providerStatus: failure.status,
        retryAfter: failure.retryAfter,
        validationWarnings: []
      }
    };
  }
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request body" }, 400);
  }

  const result = await handleNpcTurnPayload(payload);
  return jsonResponse(result, result.ok ? 200 : 200);
}
