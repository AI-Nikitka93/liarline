import type { NpcTurnRequest, NpcTurnResponse, NpcTurnResult } from "../ai/contracts.ts";
import { AI_LATENCY_BOUNDARY } from "../release/winPushPhase2Quarantine";

export const CLIENT_AI_RESPONSE_TIMEOUT_MS = AI_LATENCY_BOUNDARY.problemMs;

const FALLBACK_ANSWERS: Record<string, string[]> = {
  protective_liar: [
    "No, stop twisting the inventory log. I counted stock, not prototypes.",
    "No, stop. The cart was routine inventory movement, not a confession."
  ],
  motive_guardian: [
    "Do not drag my rivalry into this. It was ugly, not criminal.",
    "I will answer the lab question, not the part that embarrasses me."
  ],
  direct_witness: [
    "I saw what I saw. Do not ask me to decorate it.",
    "That is the whole useful detail. Anything else would be guessing."
  ],
  confused_witness: [
    "I know I sound shaky. The minute is blurred, not the whole night.",
    "I mixed the timing up. That is panic, not a plan."
  ]
};

const FALLBACK_ANSWERS_RU: Record<string, string[]> = {
  protective_liar: [
    "Нет, хватит выворачивать журнал инвентаря. Я считал запасы, не прототипы.",
    "Нет, хватит. Тележка была обычным движением инвентаря, не признанием."
  ],
  motive_guardian: [
    "Не притягивайте сюда моё соперничество. Это было неприятно, но не преступно.",
    "Я отвечу про лабораторию, а не про то, что меня выставляет плохо."
  ],
  direct_witness: [
    "Я видела то, что видела. Украшать это не буду.",
    "Это вся полезная деталь. Остальное будет догадкой."
  ],
  confused_witness: [
    "Я понимаю, что звучит нервно. Минута смазалась, не весь вечер.",
    "Я перепутал время. Это паника, а не план."
  ]
};

export async function requestNpcTurn(payload: NpcTurnRequest, signal?: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<NpcTurnResult> {
  const startedAt = Date.now();
  const requestSignal = createClientTimeoutSignal(signal);
  try {
    const response = await fetchImpl("/api/npc-turn", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      signal: requestSignal.signal,
      body: JSON.stringify(payload)
    });
    const body = (await response.json()) as unknown;
    if (!response.ok || !isNpcTurnResult(body)) {
      return buildClientFallback(payload, response.ok ? "invalid_proxy_json" : `proxy_${response.status}`, Date.now() - startedAt);
    }
    return body;
  } catch {
    return buildClientFallback(payload, requestSignal.timedOut ? "timeout" : "network_error", Date.now() - startedAt);
  } finally {
    requestSignal.clear();
  }
}

function createClientTimeoutSignal(externalSignal?: AbortSignal): {
  signal: AbortSignal;
  timedOut: boolean;
  clear: () => void;
} {
  const controller = new AbortController();
  const state = { timedOut: false };
  const timeoutId = globalThis.setTimeout(() => {
    state.timedOut = true;
    controller.abort();
  }, CLIENT_AI_RESPONSE_TIMEOUT_MS);
  const abortFromExternal = () => controller.abort();

  if (externalSignal?.aborted) {
    abortFromExternal();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternal, { once: true });
  }

  return {
    signal: controller.signal,
    get timedOut() {
      return state.timedOut;
    },
    clear: () => {
      globalThis.clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromExternal);
    }
  };
}

function buildClientFallback(payload: NpcTurnRequest, reason: string, latencyMs: number): NpcTurnResult {
  return {
    ok: false,
    source: "fallback",
    requestId: payload.requestId,
    model: payload.model,
    response: buildFallbackResponse(payload, reason),
    meta: {
      latencyMs,
      fallbackReason: reason,
      providerStatus: null,
      retryAfter: null,
      validationWarnings: [reason]
    }
  };
}

function buildFallbackResponse(payload: NpcTurnRequest, reason: string): NpcTurnResponse {
  const locale = payload.turn.responseLocale === "ru" ? "ru" : "en";
  const source = locale === "ru" ? FALLBACK_ANSWERS_RU : FALLBACK_ANSWERS;
  const bank = source[payload.npc.performanceRole] || source.confused_witness;
  const index = Math.abs(`${payload.requestId}:${reason}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % bank.length;
  return {
    answer_text: bank[index],
    truthfulness: "evasive",
    suspicion_delta: 0,
    revealed_clue_id: null,
    contradiction_risk: 10,
    npc_mood: payload.npc.mood || "guarded",
    notebook_hint: locale === "ru" ? "Ответ прозвучал уклончиво." : "The answer felt evasive."
  };
}

function isNpcTurnResult(value: unknown): value is NpcTurnResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<NpcTurnResult>;
  return (
    typeof result.ok === "boolean" &&
    (result.source === "groq" || result.source === "fallback") &&
    typeof result.requestId === "string" &&
    Boolean(result.response) &&
    typeof result.response?.answer_text === "string" &&
    typeof result.response?.suspicion_delta === "number"
  );
}
