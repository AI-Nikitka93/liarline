import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildFallbackResponse, validateNpcTurnResponse } from "../src/ai/fallback.ts";
import { buildNpcSystemPrompt, buildNpcUserPrompt } from "../src/ai/systemPrompt.ts";
import { handleNpcTurnPayload } from "../src/api/npc-turn.ts";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");

function parseEnv(raw) {
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadLocalEnv() {
  if (!existsSync(ENV_PATH)) return;
  const parsed = parseEnv(await readFile(ENV_PATH, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (!(key in process.env)) process.env[key] = value;
  }
}

function buildMockRequest() {
  return {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    requestId: `test_${Date.now()}`,
    casePublic: {
      caseId: "case_lab_001",
      title: "The Missing Prototype",
      publicBrief: "A prototype vanished from the lab between 21:00 and 21:15.",
      publicFacts: [
        "The prototype was last checked before 21:00.",
        "A corridor camera stopped recording before the theft."
      ]
    },
    npc: {
      suspectId: "suspect_ivo",
      displayName: "Ivo",
      publicProfile: "Calm lab treasurer who claims he was reviewing inventory.",
      performanceRole: "protective_liar",
      lieArchetype: "direct_liar",
      pressureState: "ordinary",
      mood: "controlled",
      suspicion: 37,
      questionsAsked: 1,
      allowedKnowledge: {
        knownPublicClues: [],
        knownPrivateClues: [
          {
            clueId: "clue_ivo_gap",
            npcFacingText: "You cannot account for several minutes near 21:10."
          }
        ],
        allowedFalseClaims: [
          "I was in the break room.",
          "Mara had more access than I did."
        ],
        revealableClueIdsThisTurn: ["clue_ivo_gap"]
      }
    },
    turn: {
      roundIndex: 1,
      actionPointsRemaining: 6,
      playerQuestion: "Where were you between 21:00 and 21:15, and why should I trust you?",
      responseLocale: "en",
      responseLanguage: "English",
      recentTranscript: [
        {
          questionText: "Did you see Mara near the lab?",
          answerText: "Mara was acting strange, but I did not follow her."
        }
      ]
    },
    outputRules: {
      maxAnswerChars: 260,
      allowedTruthfulness: ["truth", "partial", "lie", "evasive"],
      suspicionDeltaMin: -2,
      suspicionDeltaMax: 4,
      allowedRevealedClueIds: ["clue_ivo_gap"]
    }
  };
}

await loadLocalEnv();

const payload = buildMockRequest();
const npcHandlerSource = await readFile(path.join(ROOT, "src", "api", "npc-turn.ts"), "utf8");
if (!npcHandlerSource.includes("const DEFAULT_TIMEOUT_MS = 15000")) {
  throw new Error("NPC turn default timeout must be 15000 ms so current Groq latency does not degrade normal demo turns.");
}

const systemPrompt = buildNpcSystemPrompt(payload.npc, payload.casePublic, payload.outputRules);
const userPrompt = buildNpcUserPrompt(payload);

if (!systemPrompt.includes("You must respond ONLY with a valid JSON object")) {
  throw new Error("System prompt is missing required JSON-only instruction.");
}

if (!systemPrompt.includes("answer_text: max 260 chars")) {
  throw new Error("System prompt does not enforce the request compactness limit.");
}

if (!systemPrompt.includes("voiceStyle") || !systemPrompt.includes("A confession is not a win condition")) {
  throw new Error("System prompt does not enforce distinct voice and no-confession boundaries.");
}

if (!systemPrompt.includes("No generic filler")) {
  throw new Error("System prompt does not reject generic filler answers.");
}

if (!userPrompt.includes("English")) {
  throw new Error("User prompt does not carry response language instructions.");
}

if (systemPrompt.includes("truthTable") || systemPrompt.includes("culpritSuspectId") || systemPrompt.includes("trueMotiveId")) {
  throw new Error("System prompt leaks forbidden truth-table vocabulary.");
}

if (JSON.stringify(payload).includes("liar_culprit") || systemPrompt.includes("liar_culprit") || systemPrompt.includes("npcRole")) {
  throw new Error("Live NPC request leaks internal culprit role markers.");
}

const ruPayload = {
  ...payload,
  requestId: `${payload.requestId}_ru`,
  turn: {
    ...payload.turn,
    responseLocale: "ru",
    responseLanguage: "Russian",
    playerQuestion: "Где вы были в 21:10?"
  }
};
const ruUserPrompt = buildNpcUserPrompt(ruPayload);
if (!ruUserPrompt.includes("Russian")) {
  throw new Error("RU user prompt does not force Russian response language.");
}
if (ruUserPrompt.includes('"No,"') || ruUserPrompt.includes('"Wait,"')) {
  throw new Error("RU user prompt still allows English contradiction interjections.");
}

const panickedFallback = buildFallbackResponse(
  {
    ...payload,
    npc: {
      ...payload.npc,
      mood: "panicking",
      pressureState: "contradiction"
    }
  },
  "timeout"
);
if (!panickedFallback.answer_text.includes("No, stop")) {
  throw new Error("Protective liar fallback does not preserve panicked character.");
}

const spoilerValidation = validateNpcTurnResponse(
  {
    answer_text: "Fine, I did it. I stole the prototype because the debt forced me.",
    truthfulness: "lie",
    suspicion_delta: 99,
    revealed_clue_id: "clue_not_allowed",
    contradiction_risk: 101,
    npc_mood: "panicking",
    notebook_hint: "The true culprit is Ivo and the motive is debt."
  },
  payload
);
if (!spoilerValidation.ok) {
  throw new Error("Spoiler-like model response should be sanitized, not crash validation.");
}
if (
  spoilerValidation.value.answer_text.includes("I stole") ||
  spoilerValidation.value.notebook_hint.includes("true culprit") ||
  spoilerValidation.value.answer_text.length > payload.outputRules.maxAnswerChars ||
  spoilerValidation.value.revealed_clue_id !== null ||
  spoilerValidation.value.suspicion_delta !== payload.outputRules.suspicionDeltaMax ||
  spoilerValidation.value.contradiction_risk !== 100
) {
  throw new Error("Spoiler/invalid model response was not sanitized correctly.");
}

const mixedRuValidation = validateNpcTurnResponse(
  {
    answer_text: "No, я считал inventory. Это routine cart movement.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 42,
    npc_mood: "defensive",
    notebook_hint: "Проверить лог тележки."
  },
  ruPayload
);
if (!mixedRuValidation.ok) {
  throw new Error("Mixed-language RU response should be normalized, not rejected.");
}
if (/^No,|\binventory\b|\bcart\b|\broutine\b/i.test(mixedRuValidation.value.answer_text)) {
  throw new Error("Mixed-language RU response was not normalized.");
}

const stageDirectionValidation = validateNpcTurnResponse(
  {
    answer_text: "Uh, the camera stopped at 20:59. *gulps* I mean, before the theft.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 44,
    npc_mood: "nervous",
    notebook_hint: "Camera timing sounds shaky."
  },
  payload
);
if (!stageDirectionValidation.ok) {
  throw new Error("Stage-direction response should be sanitized, not rejected.");
}
if (/[*_`]/.test(stageDirectionValidation.value.answer_text) || /gulps/i.test(stageDirectionValidation.value.answer_text)) {
  throw new Error("Stage directions or markdown markers were not sanitized from answer_text.");
}

const result = await handleNpcTurnPayload(payload, {
  timeoutMs: Number.parseInt(process.env.TEST_NPC_TIMEOUT_MS || "15000", 10)
});

const invalidJsonResult = await handleNpcTurnPayload(payload, {
  apiKey: "test-key",
  timeoutMs: 1000,
  fetchImpl: async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: "not json"
            }
          }
        ]
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      }
    )
});

if (invalidJsonResult.source !== "fallback" || invalidJsonResult.meta.fallbackReason !== "Model response is not parseable JSON") {
  throw new Error("Invalid JSON fallback path failed.");
}

const rateLimitResult = await handleNpcTurnPayload(payload, {
  apiKey: "test-key",
  timeoutMs: 1000,
  fetchImpl: async () =>
    new Response(
      JSON.stringify({
        error: {
          message: "Rate limit reached"
        }
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": "2"
        }
      }
    )
});

if (rateLimitResult.source !== "fallback" || rateLimitResult.meta.fallbackReason !== "rate_limit") {
  throw new Error("429 fallback path failed.");
}

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      source: result.source,
      requestId: result.requestId,
      model: result.model,
      response: result.response,
      meta: result.meta,
      fallbackChecks: {
        invalidJson: invalidJsonResult.meta.fallbackReason,
        rateLimit: rateLimitResult.meta.fallbackReason
      }
    },
    null,
    2
  )
);
