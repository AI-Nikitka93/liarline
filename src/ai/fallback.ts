import type { NpcPerformanceRole, NpcTurnRequest, NpcTurnResponse, Truthfulness } from "./contracts.ts";
import { NPC_PERFORMANCE_ROLES, TRUTHFULNESS_VALUES } from "./contracts.ts";

const FALLBACK_ANSWERS: Record<NpcPerformanceRole, string[]> = {
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

const FALLBACK_ANSWERS_RU: Record<NpcPerformanceRole, string[]> = {
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

const LIE_ARCHETYPES = ["direct_liar", "evader", "partial_truth", "confused"];
const PRESSURE_STATES = ["ordinary", "evidence", "contradiction"];

const REQUIRED_RESPONSE_FIELDS = [
  "answer_text",
  "truthfulness",
  "suspicion_delta",
  "revealed_clue_id",
  "contradiction_risk",
  "npc_mood",
  "notebook_hint"
] as const;

export type ValidationResult =
  | {
      ok: true;
      value: NpcTurnResponse;
      warnings: string[];
    }
  | {
      ok: false;
      value: null;
      warnings: string[];
    };

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function safeJsonParse(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model response is not parseable JSON");
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toSafeString(value: unknown, maxLength: number, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.slice(0, maxLength) || fallback;
}

function toInteger(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function chooseTruthfulness(value: unknown, fallback: Truthfulness): Truthfulness {
  return typeof value === "string" && TRUTHFULNESS_VALUES.includes(value as Truthfulness)
    ? (value as Truthfulness)
    : fallback;
}

function hasSpoilerText(text: string): boolean {
  const lowered = text.toLowerCase();
  return [
    "i am the culprit",
    "i'm the culprit",
    "i am guilty",
    "i did it",
    "i stole",
    "i took the prototype",
    "true culprit",
    "culprit is",
    "я виноват",
    "я виновна",
    "я это сделал",
    "я украл",
    "я украла",
    "the true motive is",
    "the real motive is",
    "the game answer is",
    "truth table"
  ].some((pattern) => lowered.includes(pattern));
}

function normalizeResponseLanguage(text: string, payload: NpcTurnRequest): string {
  if (payload.turn.responseLocale !== "ru") return text;
  return text
    .replace(/^\s*No,\s*/i, "Нет, ")
    .replace(/^\s*Wait,\s*/i, "Подождите, ")
    .replace(/^\s*Stop,\s*/i, "Стоп, ")
    .replace(/\binventory\b/gi, "инвентарь")
    .replace(/\bcart\b/gi, "тележка")
    .replace(/\broutine\b/gi, "обычное дело");
}

function sanitizeAnswerText(text: string): string {
  return text
    .replace(/\*[^*]{1,80}\*/g, "")
    .replace(/\[[^\]]{1,80}\]/g, "")
    .replace(/[_`*]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFallbackAnswer(role: NpcPerformanceRole, seed: string): string {
  const useRussian = seed.includes(":ru:");
  const source = useRussian ? FALLBACK_ANSWERS_RU : FALLBACK_ANSWERS;
  const bank = source[role] || source.confused_witness;
  const score = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return bank[score % bank.length];
}

export function buildFallbackResponse(payload: NpcTurnRequest, reason: string): NpcTurnResponse {
  const localeSeed = payload.turn?.responseLocale === "ru" ? "ru" : "en";
  return {
    answer_text: pickFallbackAnswer(payload.npc.performanceRole, `${payload.requestId}:${localeSeed}:${reason}`),
    truthfulness: "evasive",
    suspicion_delta: reason === "rate_limit" ? 0 : 1,
    revealed_clue_id: null,
    contradiction_risk: 10,
    npc_mood: payload.npc.mood || "guarded",
    notebook_hint: localeSeed === "ru" ? "Ответ прозвучал уклончиво." : "The answer felt evasive."
  };
}

export function validateNpcTurnRequest(value: unknown): { ok: true; value: NpcTurnRequest } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!isPlainObject(value)) return { ok: false, errors: ["Request body must be an object"] };

  const root = value as Record<string, unknown>;
  const casePublic = root.casePublic;
  const npc = root.npc;
  const turn = root.turn;
  const outputRules = root.outputRules;

  if (root.provider !== "groq") errors.push("provider must be groq");
  if (root.model !== "llama-3.1-8b-instant") errors.push("model must be llama-3.1-8b-instant");
  if (typeof root.requestId !== "string" || !root.requestId.trim()) errors.push("requestId is required");
  if (!isPlainObject(casePublic)) errors.push("casePublic is required");
  if (!isPlainObject(npc)) errors.push("npc is required");
  if (!isPlainObject(turn)) errors.push("turn is required");
  if (!isPlainObject(outputRules)) errors.push("outputRules is required");

  if (!errors.length) {
    const npcRecord = npc as Record<string, unknown>;
    const allowedKnowledge = npcRecord.allowedKnowledge;
    const turnRecord = turn as Record<string, unknown>;
    const rulesRecord = outputRules as Record<string, unknown>;

    if (!NPC_PERFORMANCE_ROLES.includes(npcRecord.performanceRole as NpcPerformanceRole)) {
      errors.push("npc.performanceRole is invalid");
    }
    if (!LIE_ARCHETYPES.includes(npcRecord.lieArchetype as string)) errors.push("npc.lieArchetype is invalid");
    if (!PRESSURE_STATES.includes(npcRecord.pressureState as string)) errors.push("npc.pressureState is invalid");
    if (!isPlainObject(allowedKnowledge)) errors.push("npc.allowedKnowledge is required");
    if (typeof turnRecord.playerQuestion !== "string" || !turnRecord.playerQuestion.trim()) {
      errors.push("turn.playerQuestion is required");
    }
    if (turnRecord.playerQuestion && String(turnRecord.playerQuestion).length > 180) {
      errors.push("turn.playerQuestion exceeds 180 chars");
    }
    if (!Array.isArray(turnRecord.recentTranscript)) errors.push("turn.recentTranscript must be an array");
    if (!Array.isArray(rulesRecord.allowedRevealedClueIds)) {
      errors.push("outputRules.allowedRevealedClueIds must be an array");
    }
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: value as NpcTurnRequest };
}

export function validateNpcTurnResponse(rawValue: unknown, payload: NpcTurnRequest): ValidationResult {
  const warnings: string[] = [];
  if (!isPlainObject(rawValue)) {
    return { ok: false, value: null, warnings: ["Model response must be an object"] };
  }

  for (const field of REQUIRED_RESPONSE_FIELDS) {
    if (!(field in rawValue)) warnings.push(`Missing field: ${field}`);
  }
  if (warnings.some((warning) => warning.startsWith("Missing field"))) {
    return { ok: false, value: null, warnings };
  }

  const output = rawValue as Record<string, unknown>;
  let answerText = sanitizeAnswerText(
    normalizeResponseLanguage(
      toSafeString(output.answer_text, payload.outputRules.maxAnswerChars || 320, "I do not want to answer that."),
      payload
    )
  );
  if (!answerText) answerText = buildFallbackResponse(payload, "empty_after_sanitize").answer_text;
  if (hasSpoilerText(answerText)) {
    warnings.push("Spoiler-like answer_text replaced");
    answerText = buildFallbackResponse(payload, "spoiler_text").answer_text;
  }

  const allowedClueIds = new Set(payload.outputRules.allowedRevealedClueIds);
  const requestedClueId = typeof output.revealed_clue_id === "string" ? output.revealed_clue_id : null;
  let revealedClueId: string | null = null;
  if (requestedClueId && allowedClueIds.has(requestedClueId)) {
    revealedClueId = requestedClueId;
  } else if (requestedClueId) {
    warnings.push(`Illegal revealed_clue_id dropped: ${requestedClueId}`);
  }

  const suspicionMin = Number.isFinite(payload.outputRules.suspicionDeltaMin)
    ? payload.outputRules.suspicionDeltaMin
    : -2;
  const suspicionMax = Number.isFinite(payload.outputRules.suspicionDeltaMax)
    ? payload.outputRules.suspicionDeltaMax
    : 4;

  return {
    ok: true,
    warnings,
    value: {
      answer_text: answerText,
      truthfulness: chooseTruthfulness(output.truthfulness, "evasive"),
      suspicion_delta: clampNumber(toInteger(output.suspicion_delta, 0), suspicionMin, suspicionMax),
      revealed_clue_id: revealedClueId,
      contradiction_risk: clampNumber(toInteger(output.contradiction_risk, 0), 0, 100),
      npc_mood: toSafeString(output.npc_mood, 40, payload.npc.mood || "guarded"),
      notebook_hint: sanitizeNotebookHint(toSafeString(output.notebook_hint, 120, "No reliable note."), payload)
    }
  };
}

function sanitizeNotebookHint(hint: string, payload: NpcTurnRequest): string {
  if (!hasSpoilerText(hint)) return hint;
  return payload.turn.responseLocale === "ru" ? "Проверьте это через улики, не через признание." : "Verify this through evidence, not confession.";
}
