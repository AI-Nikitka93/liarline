import { request as httpsRequest } from "node:https";
import type { ChatMessage, NpcTurnRequest, NpcTurnResult } from "../ai/contracts.ts";
import { buildFallbackResponse, safeJsonParse, validateNpcTurnRequest, validateNpcTurnResponse } from "../ai/fallback.ts";
import { buildNpcSystemPrompt, buildNpcUserPrompt } from "../ai/systemPrompt.ts";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 15000;

type HandlerOptions = {
  apiKey?: string;
  apiKeys?: string[];
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

function buildMessages(payload: NpcTurnRequest, repairWarnings: string[] = []): ChatMessage[] {
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

  if (repairWarnings.length > 0) {
    messages.push({
      role: "user",
      content: buildRepairPrompt(payload, repairWarnings)
    });
  }

  return messages;
}

function buildRepairPrompt(payload: NpcTurnRequest, repairWarnings: string[]): string {
  const firstCameraRepair =
    payload.npc.performanceRole === "confused_witness" &&
    payload.npc.allowedKnowledge.knownPrivateClues.some((clue) => clue.clueId === "clue_camera_fault");
  const localeHint =
    payload.turn.responseLocale === "ru"
      ? "Use Russian only. answer_text must explicitly include камера and 21:05 or минута. Example shape: Я... повредил камеру до кражи, около 21:05."
      : "Use English only. answer_text must explicitly include camera and 21:05 or minute. Example shape: Uh, I damaged the camera before the theft, around 21:05.";

  return JSON.stringify(
    {
      repair: "Previous model response failed validation",
      validatorWarnings: repairWarnings.slice(0, 6),
      requiredAnchor: firstCameraRepair
        ? localeHint
        : "Use one concrete allowed case anchor from knownPrivateClues, public facts, or allowed false claims.",
      instruction:
        "Return a fresh JSON object only. Keep the same active NPC, same requested language, one concrete allowed case anchor, no generic filler, no hidden answer, no accusation advice, no extra fields."
    },
    null,
    0
  );
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

async function groqFetch(url: string, init: RequestInit, fetchImpl: typeof fetch): Promise<Response> {
  if (fetchImpl !== fetch) {
    return fetchImpl(url, init);
  }
  return nodeHttpsJsonFetch(url, init);
}

function nodeHttpsJsonFetch(url: string, init: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const headers = new Headers(init.headers);
    const request = httpsRequest(
      target,
      {
        method: init.method || "GET",
        headers: Object.fromEntries(headers.entries())
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const responseHeaders = new Headers();
          for (const [key, value] of Object.entries(response.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) responseHeaders.append(key, item);
            } else if (typeof value === "string") {
              responseHeaders.set(key, value);
            }
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: response.statusCode || 599,
              headers: responseHeaders
            })
          );
        });
      }
    );

    const abort = () => {
      const error = new DOMException("Aborted", "AbortError");
      request.destroy(error);
      reject(error);
    };

    init.signal?.addEventListener("abort", abort, { once: true });
    request.on("error", (error) => {
      init.signal?.removeEventListener("abort", abort);
      reject(error);
    });
    request.on("close", () => {
      init.signal?.removeEventListener("abort", abort);
    });

    if (typeof init.body === "string") {
      request.write(init.body);
    } else if (init.body instanceof Uint8Array) {
      request.write(init.body);
    }
    request.end();
  });
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

function splitApiKeyList(value: string | undefined): string[] {
  return (value ?? "")
    .split(/[\s,;]+/)
    .map((key) => key.trim())
    .filter(Boolean);
}

function resolveNumberedApiKeys(): string[] {
  return Object.entries(process.env)
    .filter(([key, value]) => /^GROQ_API_KEY_\d+$/.test(key) && Boolean(value?.trim()))
    .sort(([left], [right]) => {
      const leftIndex = Number.parseInt(left.replace("GROQ_API_KEY_", ""), 10);
      const rightIndex = Number.parseInt(right.replace("GROQ_API_KEY_", ""), 10);
      return leftIndex - rightIndex;
    })
    .map(([, value]) => value?.trim() ?? "")
    .filter(Boolean);
}

function resolveGroqApiKeys(options: HandlerOptions): string[] {
  const keys = [
    options.apiKey,
    ...(options.apiKeys ?? []),
    process.env.GROQ_API_KEY,
    ...splitApiKeyList(process.env.GROQ_API_KEYS),
    ...resolveNumberedApiKeys()
  ]
    .map((key) => key?.trim() ?? "")
    .filter(Boolean);

  return Array.from(new Set(keys));
}

function shouldTryNextGroqKey(failure: { status: number | null }, keyIndex: number, keyCount: number): boolean {
  if (keyIndex >= keyCount - 1) return false;
  if (failure.status === 401 || failure.status === 403 || failure.status === 429) return true;
  return typeof failure.status === "number" && failure.status >= 500 && failure.status <= 599;
}

function buildFailoverWarnings(failures: Array<{ reason: string; status: number | null }>): string[] {
  if (failures.length === 0) return [];
  return [
    `Groq key failover used after ${failures.length} provider failure${failures.length === 1 ? "" : "s"}: ${failures
      .map((failure) => failure.reason)
      .join(", ")}`
  ];
}

function selectFinalFailure(failures: Array<{ reason: string; status: number | null; retryAfter: string | null }>): {
  reason: string;
  status: number | null;
  retryAfter: string | null;
} {
  const rateLimit = failures.find((failure) => failure.reason === "rate_limit");
  return rateLimit ?? failures.at(-1) ?? { reason: "unknown_error", status: null, retryAfter: null };
}

async function callGroq(
  payload: NpcTurnRequest,
  options: Required<Pick<HandlerOptions, "apiKey" | "timeoutMs" | "fetchImpl">> & { repairWarnings?: string[] }
): Promise<{
  content: string;
  status: number;
  retryAfter: string | null;
}> {
  const timer = createAbortSignal(options.timeoutMs);
  try {
    const response = await groqFetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${options.apiKey}`,
        "content-type": "application/json"
      },
      signal: timer.signal,
      body: JSON.stringify({
        model: payload.model,
        messages: buildMessages(payload, options.repairWarnings ?? []),
        response_format: { type: "json_object" },
        temperature: options.repairWarnings?.length ? 0.25 : 0.55,
        top_p: 0.9,
        max_completion_tokens: 180,
        stream: false
      })
    }, options.fetchImpl);

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

function parseAndValidateProviderContent(content: string, payload: NpcTurnRequest) {
  try {
    return validateNpcTurnResponse(safeJsonParse(content), payload);
  } catch (error) {
    return {
      ok: false as const,
      value: null,
      warnings: [error instanceof Error ? error.message : "Model response is not parseable JSON"]
    };
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
  const apiKeys = resolveGroqApiKeys(options);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (apiKeys.length === 0) {
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
        validationWarnings: ["Set GROQ_API_KEY, GROQ_API_KEYS, or GROQ_API_KEY_1...GROQ_API_KEY_N on the server."]
      }
    };
  }

  const failoverFailures: Array<{ reason: string; status: number | null; retryAfter: string | null }> = [];

  for (const [keyIndex, apiKey] of apiKeys.entries()) {
    try {
      let providerResponse = await callGroq(payload, {
        apiKey,
        timeoutMs,
        fetchImpl
      });
      let validation = parseAndValidateProviderContent(providerResponse.content, payload);

      if (!validation.ok) {
        const firstValidationWarnings = validation.warnings;
        providerResponse = await callGroq(payload, {
          apiKey,
          timeoutMs,
          fetchImpl,
          repairWarnings: firstValidationWarnings
        });
        validation = parseAndValidateProviderContent(providerResponse.content, payload);

        if (!validation.ok) {
          const fallbackReason =
            firstValidationWarnings.includes("Model response is not parseable JSON") &&
            validation.warnings.includes("Model response is not parseable JSON")
              ? "Model response is not parseable JSON"
              : "invalid_model_json";
          failoverFailures.push({
            reason: fallbackReason,
            status: providerResponse.status,
            retryAfter: providerResponse.retryAfter
          });
          if (keyIndex < apiKeys.length - 1) {
            continue;
          }
          return {
            ok: false,
            source: "fallback",
            requestId: payload.requestId,
            model: payload.model,
            response: buildFallbackResponse(payload, "invalid_model_json"),
            meta: {
              latencyMs: Date.now() - startedAt,
              fallbackReason,
              providerStatus: providerResponse.status,
              retryAfter: providerResponse.retryAfter,
              validationWarnings: [
                ...buildFailoverWarnings(failoverFailures),
                `model_validation_retry: ${firstValidationWarnings.join("; ")}`,
                ...validation.warnings
              ]
            }
          };
        }

        validation = {
          ...validation,
          warnings: [
            `model_validation_retry: ${firstValidationWarnings.join("; ")}`,
            ...validation.warnings
          ]
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
          validationWarnings: [...buildFailoverWarnings(failoverFailures), ...validation.warnings]
        }
      };
    } catch (error) {
      const failure = normalizeFailureReason(error);
      failoverFailures.push(failure);
      if (shouldTryNextGroqKey(failure, keyIndex, apiKeys.length)) {
        continue;
      }

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
          validationWarnings: buildFailoverWarnings(failoverFailures.slice(0, -1))
        }
      };
    }
  }

  const finalFailure = selectFinalFailure(failoverFailures);
  return {
    ok: false,
    source: "fallback",
    requestId: payload.requestId,
    model: payload.model,
    response: buildFallbackResponse(payload, finalFailure.reason),
    meta: {
      latencyMs: Date.now() - startedAt,
      fallbackReason: finalFailure.reason,
      providerStatus: finalFailure.status,
      retryAfter: finalFailure.retryAfter,
      validationWarnings: buildFailoverWarnings(failoverFailures)
    }
  };
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
