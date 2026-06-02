import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AI_LATENCY_BOUNDARY,
  AI_MANUAL_REVIEW_CHECKLIST,
  AI_PLAYABLE_ANCHORS,
  FALLBACK_IMPACT_POLICY,
  LIVE_TRANSCRIPT_AUDIT_MATRIX,
  PHASE2_QUARANTINE_DATE,
  PHASE2_QUARANTINE_TODO_CLOSURES,
  PROMPT_CONTROL_PLAYABLE_LANGUAGE,
  QUARANTINE_RESPONSE_RULES
} from "../src/release/winPushPhase2Quarantine.ts";
import { validateNpcTurnResponse } from "../src/ai/fallback.ts";
import { buildNpcSystemPrompt } from "../src/ai/systemPrompt.ts";
import { applyNpcTurnResult, createInitialGameState } from "../src/game/gameEngine.ts";
import { CLIENT_AI_RESPONSE_TIMEOUT_MS, requestNpcTurn } from "../src/services/aiClient.ts";

const [
  packageJsonText,
  masterTodo,
  promptSource,
  fallbackSource,
  gameEngineSource,
  aiClientSource,
  gameStoreSource,
  liveSuspectScript,
  liveVoiceReport,
  stateText,
  stateJsonText,
  readme,
  release,
  submission
] = await Promise.all([
  readFile("package.json", "utf8"),
  readFile("docs/MASTER_TODO.md", "utf8"),
  readFile("src/ai/systemPrompt.ts", "utf8"),
  readFile("src/ai/fallback.ts", "utf8"),
  readFile("src/game/gameEngine.ts", "utf8"),
  readFile("src/services/aiClient.ts", "utf8"),
  readFile("src/state/GameStore.tsx", "utf8"),
  readFile("tools/test-live-suspect-voices.mjs", "utf8"),
  readFile("docs/AI_SUSPECT_VOICE_RUN_CURRENT.md", "utf8"),
  readFile("docs/STATE.md", "utf8"),
  readFile("docs/state.json", "utf8"),
  readFile("README.md", "utf8"),
  readFile("docs/RELEASE.md", "utf8"),
  readFile("docs/SUBMISSION.md", "utf8")
]);

const packageJson = JSON.parse(packageJsonText);
const stateJson = JSON.parse(stateJsonText);

assert.equal(PHASE2_QUARANTINE_DATE, "2026-05-08");
assert.equal(packageJson.scripts["test:win-push-phase2-quarantine"], "tsx tools/test-win-push-phase2-quarantine.mjs");
assert.deepEqual(PHASE2_QUARANTINE_TODO_CLOSURES, ["T031", "T032", "T033", "T034", "T035", "T036", "T037", "T038", "T039", "T040"]);
for (const todoId of PHASE2_QUARANTINE_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked in MASTER_TODO`);
}

assert.ok(PROMPT_CONTROL_PLAYABLE_LANGUAGE.pressureStateRules.length >= 3);
assert.ok(PROMPT_CONTROL_PLAYABLE_LANGUAGE.bannedControlPhrases.includes("pressure point"));
assert.ok(PROMPT_CONTROL_PLAYABLE_LANGUAGE.releaseGate.includes("test:npc-turn"));
assert.ok(AI_PLAYABLE_ANCHORS.allowedAnchors.length >= 12);
assert.ok(QUARANTINE_RESPONSE_RULES.genericFillers.some((item) => item.includes("ask someone else")));
assert.ok(QUARANTINE_RESPONSE_RULES.internalLeaks.includes("truthTable"));
assert.ok(QUARANTINE_RESPONSE_RULES.repeatPolicy.includes("new playable beat"));
assert.equal(FALLBACK_IMPACT_POLICY.spendActionPoint, false);
assert.equal(FALLBACK_IMPACT_POLICY.unlockClue, false);
assert.equal(FALLBACK_IMPACT_POLICY.changeSuspicion, false);
assert.equal(FALLBACK_IMPACT_POLICY.advanceRoundOrAccusation, false);
assert.equal(AI_MANUAL_REVIEW_CHECKLIST.length, 8);
assert.ok(AI_MANUAL_REVIEW_CHECKLIST.every((item) => item.passSignal.length > 0 && item.failSignal.length > 0));
assert.ok(AI_LATENCY_BOUNDARY.warningMs <= AI_LATENCY_BOUNDARY.problemMs);
assert.ok(AI_LATENCY_BOUNDARY.releaseGate.includes("test:demo-route"));

for (const locale of ["en", "ru"]) {
  for (const beat of ["first_theo", "ivo_pressure", "mara_partial_truth", "lena_direct_witness"]) {
    assert.ok(LIVE_TRANSCRIPT_AUDIT_MATRIX.some((item) => item.locale === locale && item.beatId === beat), `missing transcript audit ${locale}:${beat}`);
  }
}

for (const fragment of [
  "BEAT RULES",
  "ordinary:",
  "evidence:",
  "contradiction:",
  "Avoid control-language",
  "Do not write labels like pressure point"
]) {
  assert.ok(promptSource.includes(fragment), `prompt missing ${fragment}`);
}
for (const fragment of ["hasPlayableGameAnchor", "hasGenericFillerText", "hasInternalMarkerText", "hasRepeatedPriorAnswer"]) {
  assert.ok(fallbackSource.includes(fragment), `fallback validation missing ${fragment}`);
}
assert.ok(gameEngineSource.includes("const isDegradedAiTurn = result.source === \"fallback\""));
assert.ok(gameEngineSource.includes("const countedTranscriptForRound = nextTranscript.filter((entry) => entry.source !== \"fallback\")"));
assert.ok(aiClientSource.includes("suspicion_delta: 0"));
assert.ok(aiClientSource.includes("CLIENT_AI_RESPONSE_TIMEOUT_MS"));
assert.ok(gameStoreSource.includes("applyTechnicalFallbackTurn"), "GameStore must apply visible degraded fallback turns instead of dropping them");
assert.ok(gameStoreSource.includes("setHasSelectedLocale(Boolean(savedLocale))"), "persisted locale must bypass the language gate for a fresh briefing");
assert.equal(CLIENT_AI_RESPONSE_TIMEOUT_MS, AI_LATENCY_BOUNDARY.problemMs);
assert.ok(CLIENT_AI_RESPONSE_TIMEOUT_MS >= 10000, "client timeout must allow one validation repair retry on live Groq before guarded fallback");
assert.ok(liveSuspectScript.includes("LIVE_TRANSCRIPT_AUDIT_SCENARIOS"));
assert.ok(liveSuspectScript.includes("latencyBoundary"));
assert.ok(liveSuspectScript.includes("HARD_LATENCY_RETRY_ATTEMPTS"), "live-suspect audit must retry transient hard-latency spikes");
assert.ok(liveSuspectScript.includes("hardLatencyRetry"), "live-suspect report must mark hard-latency retry recovery");

for (const fragment of [
  "AI Suspect Voice Run",
  "suspect_ivo",
  "suspect_mara",
  "suspect_theo",
  "suspect_lena",
  "Latency boundary",
  "Manual review checklist"
]) {
  assert.ok(liveVoiceReport.includes(fragment), `live voice report missing ${fragment}`);
}

assert.ok(readme.includes("npm run test:win-push-phase2-quarantine"));
assert.ok(release.includes("Phase 2 quarantine gate"));
assert.ok(submission.includes("AI answer quarantine gate"));
assert.ok(
  stateText.includes("PHASE2_T031_T040_CLOSED") ||
    stateText.includes("PHASE3_T041_T070_CLOSED") ||
    stateText.includes("PHASE4_T071_T100_CLOSED") ||
    stateText.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);
assert.ok(
  [
    "PHASE2_T031_T040_CLOSED",
    "PHASE3_T041_T070_CLOSED",
    "PHASE4_T071_T100_CLOSED",
    "PHASE8_T191_T205_POSTLAUNCH_CLOSED"
  ].includes(stateJson.status)
);

const payload = {
  provider: "groq",
  model: "llama-3.1-8b-instant",
  requestId: "phase2_quarantine_test",
  casePublic: {
    caseId: "case_lab_001",
    title: "The Missing Prototype",
    publicBrief: "A prototype vanished from the robotics lab between 21:00 and 21:15.",
    publicFacts: ["A corridor camera stopped recording before the theft.", "The storage door logs show one cart leaving the lab wing."]
  },
  npc: {
    suspectId: "suspect_ivo",
    displayName: "Ivo",
    publicProfile: "Calm lab treasurer.",
    performanceRole: "protective_liar",
    lieArchetype: "direct_liar",
    pressureState: "contradiction",
    mood: "panicking",
    suspicion: 64,
    questionsAsked: 2,
    allowedKnowledge: {
      knownPublicClues: ["The storage door logs show one cart leaving the lab wing."],
      knownPrivateClues: [{ clueId: "clue_ivo_gap", npcFacingText: "At 21:10, I was still sorting inventory; the cart timing can look worse than it is." }],
      allowedFalseClaims: ["The cart log is only a routine inventory movement."],
      revealableClueIdsThisTurn: []
    }
  },
  turn: {
    roundIndex: 2,
    actionPointsRemaining: 4,
    playerQuestion: "The cart log points at inventory. Why does that sound rehearsed?",
    responseLocale: "en",
    responseLanguage: "English",
    recentTranscript: [{ questionText: "Where were you?", answerText: "No, I was sorting inventory at 21:10. The cart timing looks worse than it is." }]
  },
  outputRules: {
    maxAnswerChars: 260,
    allowedTruthfulness: ["truth", "partial", "lie", "evasive"],
    suspicionDeltaMin: -2,
    suspicionDeltaMax: 4,
    allowedRevealedClueIds: []
  }
};

const prompt = buildNpcSystemPrompt(payload.npc, payload.casePublic, payload.outputRules);
assert.ok(prompt.includes("BEAT RULES"));
assert.ok(!prompt.includes("Shape:"), "prompt should avoid abstract control labels");

for (const [label, answerText] of [
  ["generic filler", "I don't know. Ask someone else."],
  ["internal leak", "As a protective_liar, my pressure point is clue_ivo_gap."],
  ["invented evidence", "The keycard proves the guard moved the prototype."],
  ["repeat", "No, I was sorting inventory at 21:10. The cart timing looks worse than it is."],
  ["partial repeat", "No, I was sorting inventory at 21:10. The cart timing looks worse than it is, and the break room explains nothing."]
]) {
  const result = validateNpcTurnResponse(
    {
      answer_text: answerText,
      truthfulness: "evasive",
      suspicion_delta: 1,
      revealed_clue_id: null,
      contradiction_risk: 35,
      npc_mood: "guarded",
      notebook_hint: "Check the cart log."
    },
    payload
  );
  assert.equal(result.ok, false, `${label} must be quarantined`);
}

const playable = validateNpcTurnResponse(
  {
    answer_text: "The inventory log is being read too cleanly; 21:10 was a routine count, not the cart move.",
    truthfulness: "lie",
    suspicion_delta: 2,
    revealed_clue_id: null,
    contradiction_risk: 70,
    npc_mood: "panicking",
    notebook_hint: "The inventory story and cart timing clash."
  },
  payload
);
assert.equal(playable.ok, true);

const fallbackBase = {
  ...createInitialGameState(),
  phase: "interrogation",
  rules: {
    ...createInitialGameState().rules,
    actionPointsRemaining: 1,
    roundIndex: 2
  }
};
const fallbackTurn = applyNpcTurnResult(fallbackBase, "suspect_ivo", "Why does your inventory story avoid 21:10?", {
  ok: false,
  source: "fallback",
  requestId: "fallback_policy_test",
  model: "llama-3.1-8b-instant",
  response: {
    answer_text: "No, the inventory log still matters. I am not solving your case for you.",
    truthfulness: "evasive",
    suspicion_delta: 4,
    revealed_clue_id: "clue_debt_message",
    contradiction_risk: 90,
    npc_mood: "guarded",
    notebook_hint: "Fallback answer stayed degraded."
  },
  meta: {
    latencyMs: 120,
    fallbackReason: "network_error",
    providerStatus: null,
    retryAfter: null,
    validationWarnings: ["network_error"]
  }
});
assert.equal(fallbackTurn.rules.actionPointsRemaining, fallbackBase.rules.actionPointsRemaining);
assert.equal(fallbackTurn.rules.roundIndex, fallbackBase.rules.roundIndex);
assert.equal(fallbackTurn.phase, "interrogation");
assert.equal(fallbackTurn.suspects.suspect_ivo.visibleState.suspicion, fallbackBase.suspects.suspect_ivo.visibleState.suspicion);
assert.equal(fallbackTurn.clues.clue_debt_message.unlocked, false);

const slowStartedAt = Date.now();
let slowFetchAborted = false;
const slowClientTurn = await requestNpcTurn(payload, undefined, async (_url, init = {}) => {
  await new Promise((resolve, reject) => {
    const signal = init.signal;
    if (signal?.aborted) {
      slowFetchAborted = true;
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal?.addEventListener(
      "abort",
      () => {
        slowFetchAborted = true;
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
  return new Response("{}", { status: 200 });
});
assert.equal(slowClientTurn.source, "fallback");
assert.equal(slowClientTurn.meta.fallbackReason, "timeout");
assert.equal(slowClientTurn.response.suspicion_delta, 0);
assert.equal(slowFetchAborted, true);
assert.ok(Date.now() - slowStartedAt < AI_LATENCY_BOUNDARY.problemMs + 1800, "client must stop waiting near the problem boundary");

console.log(JSON.stringify({
  ok: true,
  phase: 2,
  closedTodos: PHASE2_QUARANTINE_TODO_CLOSURES,
  auditScenarios: LIVE_TRANSCRIPT_AUDIT_MATRIX.length,
  latencyBoundary: AI_LATENCY_BOUNDARY
}, null, 2));
