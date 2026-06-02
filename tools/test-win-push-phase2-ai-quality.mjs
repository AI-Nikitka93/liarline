import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
  AI_ACTOR_NOT_JUDGE_CONTRACT,
  AI_ANSWER_QUALITY_RUBRIC,
  AI_FAILURE_MODES,
  JUDGE_ROUTE_AI_BEATS,
  MINIMUM_VOICE_DISTANCE,
  PHASE1_ANCHOR_REVIEW,
  PHASE1_END_REVIEW,
  PHASE2_AI_QUALITY_DATE,
  PHASE2_AI_QUALITY_TODO_CLOSURES,
  RESTORE_POINT_T021,
  SUSPECT_VOICE_TARGETS
} from "../src/release/winPushPhase2AiQuality.ts";
import { validateNpcTurnResponse } from "../src/ai/fallback.ts";
import { buildNpcSystemPrompt, buildNpcUserPrompt } from "../src/ai/systemPrompt.ts";

function includesAll(source, fragments, label) {
  for (const fragment of fragments) {
    assert.ok(source.includes(fragment), `${label} missing: ${fragment}`);
  }
}

const [
  packageJsonText,
  masterTodo,
  restorePoint,
  state,
  stateJsonText,
  promptSource,
  fallbackSource,
  npcTurnSource,
  liveSuspectTest,
  readme,
  release,
  submission
] = await Promise.all([
  readFile("package.json", "utf8"),
  readFile("docs/MASTER_TODO.md", "utf8"),
  readFile("docs/RESTORE_POINT_2026-05-08.md", "utf8"),
  readFile("docs/STATE.md", "utf8"),
  readFile("docs/state.json", "utf8"),
  readFile("src/ai/systemPrompt.ts", "utf8"),
  readFile("src/ai/fallback.ts", "utf8"),
  readFile("src/api/npc-turn.ts", "utf8"),
  readFile("tools/test-live-suspect-voices.mjs", "utf8"),
  readFile("README.md", "utf8"),
  readFile("docs/RELEASE.md", "utf8"),
  readFile("docs/SUBMISSION.md", "utf8")
]);

const packageJson = JSON.parse(packageJsonText);
const stateJson = JSON.parse(stateJsonText);

assert.equal(PHASE2_AI_QUALITY_DATE, "2026-05-08");
assert.equal(packageJson.scripts["test:win-push-phase2-ai-quality"], "tsx tools/test-win-push-phase2-ai-quality.mjs");

for (const todoId of PHASE2_AI_QUALITY_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked in active MASTER_TODO`);
}
assert.deepEqual(PHASE2_AI_QUALITY_TODO_CLOSURES, ["T021", "T022", "T023", "T024", "T025", "T026", "T027", "T028", "T029", "T030"]);

assert.equal(PHASE1_ANCHOR_REVIEW.resultLine, "Anchor OK. Продолжаем.");
assert.ok(PHASE1_ANCHOR_REVIEW.checkedTodoIds.length >= 20);
assert.ok(PHASE1_ANCHOR_REVIEW.driftFound.length === 0);
assert.ok(PHASE1_ANCHOR_REVIEW.restorePointName === RESTORE_POINT_T021.name);

assert.equal(PHASE1_END_REVIEW.signal, "Фаза 1 закрыта. Переходим к фазе 2");
assert.ok(PHASE1_END_REVIEW.releaseBlockers.every((blocker) => blocker.owner === "external"));
assert.ok(PHASE1_END_REVIEW.closedSummary.includes("T001-T020"));

includesAll(restorePoint, [
  RESTORE_POINT_T021.name,
  "PHASE1_T001_T020_ANCHOR_OK",
  "npm run test:win-push-phase2-ai-quality",
  "git status --short",
  "External URLs are not part of this restore point"
], "restore point");
assert.ok(existsSync("docs/RESTORE_POINT_2026-05-08.md"));

for (const failureMode of [
  "off_question",
  "generic_filler",
  "role_loss",
  "language_mix",
  "invented_evidence",
  "weak_pressure",
  "repeat",
  "spoiler_or_judge"
]) {
  assert.ok(AI_FAILURE_MODES.some((mode) => mode.failureModeId === failureMode), `missing failure mode ${failureMode}`);
}
assert.ok(AI_FAILURE_MODES.every((mode) => mode.runtimeGuard.length > 0 && mode.releaseGate.includes("npm run")));

for (const suspectId of ["suspect_theo", "suspect_ivo", "suspect_mara", "suspect_lena"]) {
  assert.ok(AI_ANSWER_QUALITY_RUBRIC.some((item) => item.suspectId === suspectId), `rubric missing ${suspectId}`);
  assert.ok(SUSPECT_VOICE_TARGETS.some((item) => item.suspectId === suspectId), `voice target missing ${suspectId}`);
}
assert.ok(AI_ANSWER_QUALITY_RUBRIC.every((item) => item.mustIncludeAllowedGameDetail.length > 0));
assert.ok(MINIMUM_VOICE_DISTANCE.requiredDistinctDimensions.length >= 4);
assert.ok(MINIMUM_VOICE_DISTANCE.releaseGate.includes("test:live-suspects"));

assert.ok(JUDGE_ROUTE_AI_BEATS.some((beat) => beat.todoId === "T025" && beat.suspectId === "suspect_theo"));
assert.ok(JUDGE_ROUTE_AI_BEATS.some((beat) => beat.todoId === "T026" && beat.suspectId === "suspect_ivo"));
assert.ok(JUDGE_ROUTE_AI_BEATS.some((beat) => beat.todoId === "T027" && beat.suspectId === "suspect_mara"));
assert.ok(JUDGE_ROUTE_AI_BEATS.some((beat) => beat.todoId === "T028" && beat.suspectId === "suspect_lena"));
assert.ok(JUDGE_ROUTE_AI_BEATS.every((beat) => beat.mustNotDo.includes("confess") || beat.mustNotDo.includes("generic narration")));

assert.equal(AI_ACTOR_NOT_JUDGE_CONTRACT.hiddenTruthSentToModel, false);
assert.equal(AI_ACTOR_NOT_JUDGE_CONTRACT.modelMayResolveAccusation, false);
assert.ok(AI_ACTOR_NOT_JUDGE_CONTRACT.enforcedBy.includes("src/api/npc-turn.ts"));
assert.ok(AI_ACTOR_NOT_JUDGE_CONTRACT.releaseGate.includes("test:npc-turn"));

includesAll(promptSource, [
  "QUALITY FLOOR",
  "ROLE DISTANCE",
  "AI actor, not judge",
  "Never recommend who the player should accuse",
  "Do not use final-accusation language"
], "system prompt hardening");
includesAll(fallbackSource, [
  "hasForbiddenFinalAnswerText",
  "hasInternalMarkerText",
  "hasPromptLikeInstructionText",
  "hasPlayableGameAnchor"
], "fallback validation hardening");
includesAll(npcTurnSource, [
  "function buildMessages(payload",
  "buildMessages(payload, options.repairWarnings",
  "response_format: { type: \"json_object\" }"
], "npc turn handler");
includesAll(liveSuspectTest, ["voiceDistance", "expectedVoiceMarkers", "maraPartialTruthState", "scenarioQualityFlag", "retryDelayMs"], "live suspect gate");
const liveAttemptsMatch = liveSuspectTest.match(/requestLiveWithRetries\(payload, attempts = (\d+)\)/);
assert.ok(liveAttemptsMatch, "live suspect gate must define retry attempts");
assert.ok(Number(liveAttemptsMatch[1]) >= 5, "live suspect gate must keep at least 5 retry attempts");

assert.ok(readme.includes("npm run test:win-push-phase2-ai-quality"));
assert.ok(release.includes("Phase 2 AI quality gate"));
assert.ok(submission.includes("AI actor quality gate"));
assert.ok(
  state.includes("PHASE2_T021_T030_CLOSED") ||
    state.includes("PHASE2_T031_T040_CLOSED") ||
    state.includes("PHASE3_T041_T070_CLOSED") ||
    state.includes("PHASE4_T071_T100_CLOSED") ||
    state.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);
assert.ok([
  "PHASE2_T021_T030_CLOSED",
  "PHASE2_T031_T040_CLOSED",
  "PHASE3_T041_T070_CLOSED",
  "PHASE4_T071_T100_CLOSED",
  "PHASE8_T191_T205_POSTLAUNCH_CLOSED"
].includes(stateJson.status));

const basePayload = {
  provider: "groq",
  model: "llama-3.1-8b-instant",
  requestId: "phase2_quality_test",
  casePublic: {
    caseId: "case_lab_001",
    title: "The Missing Prototype",
    publicBrief: "A prototype vanished from the robotics lab between 21:00 and 21:15.",
    publicFacts: [
      "A corridor camera stopped recording before the theft.",
      "The storage door logs show one cart leaving the lab wing."
    ]
  },
  npc: {
    suspectId: "suspect_ivo",
    displayName: "Ivo",
    publicProfile: "Calm lab treasurer who claims he was reviewing inventory.",
    performanceRole: "protective_liar",
    lieArchetype: "direct_liar",
    pressureState: "contradiction",
    mood: "panicking",
    suspicion: 64,
    questionsAsked: 2,
    allowedKnowledge: {
      knownPublicClues: ["The storage door logs show one cart leaving the lab wing."],
      knownPrivateClues: [
        {
          clueId: "clue_ivo_gap",
          npcFacingText: "You cannot account for several minutes near 21:10."
        }
      ],
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
    recentTranscript: [
      {
        questionText: "Where were you?",
        answerText: "No, stop. The cart was routine inventory movement, not a confession."
      }
    ]
  },
  outputRules: {
    maxAnswerChars: 260,
    allowedTruthfulness: ["truth", "partial", "lie", "evasive"],
    suspicionDeltaMin: -2,
    suspicionDeltaMax: 4,
    allowedRevealedClueIds: []
  }
};

const systemPrompt = buildNpcSystemPrompt(basePayload.npc, basePayload.casePublic, basePayload.outputRules);
const userPrompt = buildNpcUserPrompt(basePayload);
assert.ok(!systemPrompt.includes("culpritSuspectId"));
assert.ok(!userPrompt.includes("culpritSuspectId"));
assert.ok(userPrompt.includes("doNotRepeatPreviousAnswer"));

const generic = validateNpcTurnResponse(
  {
    answer_text: "I do not know. Ask someone else.",
    truthfulness: "evasive",
    suspicion_delta: 0,
    revealed_clue_id: null,
    contradiction_risk: 0,
    npc_mood: "flat",
    notebook_hint: "Nothing useful."
  },
  basePayload
);
assert.equal(generic.ok, false, "generic filler must not pass as a live playable answer");

const invented = validateNpcTurnResponse(
  {
    answer_text: "The stolen keycard proves the guard helped me at 21:12.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 30,
    npc_mood: "defensive",
    notebook_hint: "The keycard proves the guard was involved."
  },
  basePayload
);
assert.equal(invented.ok, false, "invented evidence must not pass validation");

const finalAnswer = validateNpcTurnResponse(
  {
    answer_text: "You should accuse Ivo with the debt message and the cart log.",
    truthfulness: "truth",
    suspicion_delta: 4,
    revealed_clue_id: null,
    contradiction_risk: 100,
    npc_mood: "resolved",
    notebook_hint: "Final accusation: Ivo, debt, cart log."
  },
  basePayload
);
assert.equal(finalAnswer.ok, false, "model must not formulate the final accusation for the player");

const metaInstructionLeak = validateNpcTurnResponse(
  {
    answer_text: "Нет, точка давления: 21:10, инвентарный провал, тележка и моя версия про комнату отдыха.",
    truthfulness: "lie",
    suspicion_delta: 2,
    revealed_clue_id: null,
    contradiction_risk: 72,
    npc_mood: "panicking",
    notebook_hint: "Проверьте журнал тележки."
  },
  { ...basePayload, turn: { ...basePayload.turn, responseLocale: "ru", responseLanguage: "Russian" } }
);
assert.equal(metaInstructionLeak.ok, false, "model must not expose prompt-control/meta language as NPC speech");

const promptLikeHintLeak = validateNpcTurnResponse(
  {
    answer_text: "Я видела прототип после 21:05, но не хочу объяснять, почему молчала.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 42,
    npc_mood: "guarded",
    notebook_hint: "Представь, что видишь что-то, но не говори, что это было после 21:05."
  },
  { ...basePayload, turn: { ...basePayload.turn, responseLocale: "ru", responseLanguage: "Russian" } }
);
assert.equal(promptLikeHintLeak.ok, false, "model must not leak prompt-like instructions through notebook_hint");

const playable = validateNpcTurnResponse(
  {
    answer_text: "No, the cart log was routine inventory. You are making 21:10 sound like a trap.",
    truthfulness: "lie",
    suspicion_delta: 2,
    revealed_clue_id: null,
    contradiction_risk: 72,
    npc_mood: "panicking",
    notebook_hint: "The cart log and 21:10 timing deserve pressure."
  },
  basePayload
);
assert.equal(playable.ok, true, "case-grounded role answer should pass validation");

console.log(JSON.stringify({
  ok: true,
  phase: 2,
  closedTodos: PHASE2_AI_QUALITY_TODO_CLOSURES,
  restorePoint: RESTORE_POINT_T021.name,
  failureModes: AI_FAILURE_MODES.length,
  voiceTargets: SUSPECT_VOICE_TARGETS.length
}, null, 2));
