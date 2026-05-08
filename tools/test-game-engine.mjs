import assert from "node:assert/strict";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  canUseDeadEndHint,
  createInitialGameState,
  getLocalizedMotiveMap,
  getSuggestedQuestions,
  goToAccusation,
  returnToInterrogation,
  submitAccusation,
  useDeadEndHint
} from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";
import { localizeCase, localizeSuspect } from "../src/i18n/dictionaries.ts";

const state = createInitialGameState();

assert.equal(state.phase, "briefing");
assert.equal(state.schemaVersion, "1.0.5");
assert.equal(state.rules.actionPointsRemaining, 9);
assert.equal(state.rules.roundIndex, 0);
assert.equal(state.truthTable.culpritSuspectId, "suspect_ivo");
assert.equal(FIRST_INTERROGATION_SUSPECT_ID, "suspect_theo");
assert.equal(state.deduction.theoryConfidence, "weak");
assert.equal(state.deduction.accusationAttemptsRemaining, 1);
assert.equal(state.deduction.deadEndHintUsed, false);
assert.equal(state.deduction.deadEndHint, null);
assert.equal(state.deduction.guaranteedContradictionId, "contradiction_camera_vs_cart");
assert.deepEqual(state.deduction.geniusFactIds, ["clue_camera_fault", "public_003"]);
assert.equal(state.suspects.suspect_ivo.lieArchetype, "direct_liar");
assert.equal(state.suspects.suspect_ivo.performanceRole, "protective_liar");
assert.equal(state.suspects.suspect_lena.lieArchetype, "evader");
assert.ok(state.suspects.suspect_ivo.publicMask.includes("treasurer"));
assert.deepEqual([...new Set(Object.values(state.clues).map((clue) => clue.evidenceType))].sort(), ["message", "statement", "timeline"]);

const request = buildNpcTurnRequest(state, "suspect_ivo", "Where were you at 21:10?");
const requestText = JSON.stringify(request);
assert.equal(request.provider, "groq");
assert.equal(request.model, "llama-3.1-8b-instant");
assert.equal(request.npc.suspectId, "suspect_ivo");
assert.equal(request.npc.performanceRole, "protective_liar");
assert.equal(request.npc.lieArchetype, "direct_liar");
assert.equal(request.npc.pressureState, "ordinary");
assert.ok(request.npc.allowedKnowledge.knownPrivateClues.some((clue) => clue.clueId === "clue_ivo_gap" && !clue.npcFacingText.includes("Ivo") && /\bI\b|my/i.test(clue.npcFacingText)));
assert.ok(!request.npc.allowedKnowledge.knownPrivateClues.some((clue) => clue.clueId === "clue_debt_message"));
assert.equal(request.turn.responseLocale, "en");
assert.equal(request.turn.responseLanguage, "English");
assert.equal(request.turn.recentTranscript.length, 0);
assert.ok(!requestText.includes("culpritSuspectId"));
assert.ok(!requestText.includes("trueMotiveId"));
assert.ok(!requestText.includes("trueTimeline"));
assert.ok(!requestText.includes("isCulprit"));
assert.ok(!requestText.includes("liar_culprit"));

const ruCase = localizeCase(state.case, "ru");
const ruSuspect = localizeSuspect(state.suspects.suspect_ivo, "ru");
const ruRequest = buildNpcTurnRequest(state, "suspect_ivo", "Где вы были в 21:10?", "ru");
const ruRequestText = JSON.stringify(ruRequest);
assert.equal(ruCase.title, "Пропавший прототип");
assert.equal(ruSuspect.displayName, "Иво");
assert.equal(ruRequest.turn.responseLocale, "ru");
assert.equal(ruRequest.turn.responseLanguage, "Russian");
assert.equal(ruRequest.casePublic.title, "Пропавший прототип");
assert.equal(ruRequest.npc.displayName, "Иво");
assert.ok(ruRequest.npc.allowedKnowledge.knownPrivateClues.some((clue) => clue.clueId === "clue_ivo_gap" && !clue.npcFacingText.includes("Иво") && /я|мой|меня/i.test(clue.npcFacingText)));
assert.ok(ruRequestText.includes("Пропавший прототип"));
assert.ok(!ruRequestText.includes("culpritSuspectId"));
assert.ok(!ruRequestText.includes("trueMotiveId"));
assert.ok(!ruRequestText.includes("liar_culprit"));

const ruQuestions = getSuggestedQuestions({ ...state, phase: "interrogation" }, "suspect_ivo", "ru");
assert.ok(ruQuestions[0].startsWith("Ваша версия"));
assert.ok(ruQuestions.every((question) => !question.includes("Where were you")));

const firstTheoQuestions = getSuggestedQuestions({ ...state, phase: "interrogation" }, FIRST_INTERROGATION_SUSPECT_ID, "ru");
assert.ok(firstTheoQuestions[0].startsWith("Коридорная камера"));
assert.ok(firstTheoQuestions[0].includes("что с ней произошло") || firstTheoQuestions[0].includes("Что с ней произошло"));
const firstTheoRequest = buildNpcTurnRequest(state, FIRST_INTERROGATION_SUSPECT_ID, firstTheoQuestions[0], "ru");
assert.equal(firstTheoRequest.npc.suspectId, "suspect_theo");
assert.equal(firstTheoRequest.npc.performanceRole, "confused_witness");
assert.equal(firstTheoRequest.npc.mood, "nervous");
assert.ok(firstTheoRequest.npc.allowedKnowledge.knownPrivateClues.some((clue) => clue.clueId === "clue_camera_fault"));

const firstTheoTurn = applyNpcTurnResult({ ...state, phase: "interrogation" }, FIRST_INTERROGATION_SUSPECT_ID, firstTheoQuestions[0], {
  ok: true,
  source: "groq",
  requestId: firstTheoRequest.requestId,
  model: firstTheoRequest.model,
  response: {
    answer_text: "I... I bumped the camera before the theft, but that is not the same as moving a cart.",
    truthfulness: "partial",
    suspicion_delta: 3,
    revealed_clue_id: null,
    contradiction_risk: 68,
    npc_mood: "nervous",
    notebook_hint: "Theo's camera panic does not explain the cart log."
  },
  meta: {
    latencyMs: 364,
    fallbackReason: null,
    providerStatus: 200,
    retryAfter: null,
    validationWarnings: []
  }
});
assert.equal(firstTheoTurn.clues.clue_camera_fault.unlocked, true);
assert.deepEqual(firstTheoTurn.playerNotebook.unlockedClueIds, ["clue_camera_fault"]);
assert.ok(firstTheoTurn.playerNotebook.contradictions.includes("contradiction_camera_vs_cart"));
assert.equal(firstTheoTurn.deduction.collapseTriggered, true);
assert.equal(firstTheoTurn.deduction.theoryConfidence, "strong");
assert.equal(firstTheoTurn.deduction.personaShiftSuspectId, "suspect_ivo");
assert.equal(firstTheoTurn.deduction.deadEndHintUsed, false);
assert.equal(firstTheoTurn.deduction.deadEndHint, null);
assert.equal(firstTheoTurn.suspects.suspect_ivo.visibleState.mood, "panicking");
assert.equal(firstTheoTurn.suspects.suspect_ivo.visibleState.suspicion, 53);
assert.equal(firstTheoTurn.suspects.suspect_theo.visibleState.suspicion, 15);
assert.ok(firstTheoTurn.deduction.suspicionSignals.some((signal) => signal.signalId === "signal_theo_timeline_mismatch" && signal.resolved));
assert.ok(firstTheoTurn.deduction.suspicionSignals.some((signal) => signal.signalId === "signal_ivo_detail_unverified" && !signal.resolved));
assert.ok(firstTheoTurn.deduction.suspicionSignals.some((signal) => signal.signalId === "signal_mara_statement_conflict" && !signal.resolved));
const postCollapseIvoRequest = buildNpcTurnRequest(firstTheoTurn, "suspect_ivo", "Why does the cart log point back to you?");
assert.equal(postCollapseIvoRequest.npc.pressureState, "contradiction");
assert.equal(postCollapseIvoRequest.npc.mood, "panicking");
assert.ok(postCollapseIvoRequest.npc.allowedKnowledge.allowedFalseClaims.some((claim) => claim.includes("inventory") || claim.includes("инвентар")));

const deadEndCandidate = {
  ...firstTheoTurn,
  rules: {
    ...firstTheoTurn.rules,
    actionPointsRemaining: 5
  },
  transcript: [
    ...firstTheoTurn.transcript,
    { ...firstTheoTurn.transcript[0], turnId: "turn_dead_end_1", questionText: "What detail can I check next?" },
    { ...firstTheoTurn.transcript[0], turnId: "turn_dead_end_2", questionText: "Who benefits from the cart gap?" }
  ]
};
assert.equal(canUseDeadEndHint(state), false);
assert.equal(canUseDeadEndHint(firstTheoTurn), false);
assert.equal(canUseDeadEndHint(deadEndCandidate), true);
const hintedState = useDeadEndHint(deadEndCandidate, "ru");
assert.equal(hintedState.deduction.deadEndHintUsed, true);
assert.ok(hintedState.deduction.deadEndHint);
assert.equal(canUseDeadEndHint(hintedState), false);
assert.equal(hintedState.rules.actionPointsRemaining, deadEndCandidate.rules.actionPointsRemaining);
assert.deepEqual(hintedState.playerNotebook.unlockedClueIds, deadEndCandidate.playerNotebook.unlockedClueIds);
assert.equal(hintedState.truthTable.culpritSuspectId, deadEndCandidate.truthTable.culpritSuspectId);
assert.ok(!/suspect_ivo|motive_debt|culprit|motive|винов|мотив|доказ/i.test(hintedState.deduction.deadEndHint));

const aiConfessionTurn = applyNpcTurnResult(firstTheoTurn, "suspect_ivo", "Just admit it.", {
  ok: true,
  source: "groq",
  requestId: "turn_confession_should_not_win",
  model: postCollapseIvoRequest.model,
  response: {
    answer_text: "Fine, I did it. I stole the prototype because of the debt.",
    truthfulness: "lie",
    suspicion_delta: 99,
    revealed_clue_id: "clue_debt_message",
    contradiction_risk: 100,
    npc_mood: "panicking",
    notebook_hint: "Confession is not proof."
  },
  meta: {
    latencyMs: 300,
    fallbackReason: null,
    providerStatus: 200,
    retryAfter: null,
    validationWarnings: ["simulated confession"]
  }
});
assert.equal(aiConfessionTurn.phase, "interrogation");
assert.equal(aiConfessionTurn.resolution.outcome, null);
assert.equal(aiConfessionTurn.clues.clue_debt_message.unlocked, false);
assert.equal(aiConfessionTurn.suspects.suspect_ivo.visibleState.suspicion, 57);
assert.ok(aiConfessionTurn.transcript.at(-1).answerText.includes("I stole"));

const ruMotives = getLocalizedMotiveMap(state, "ru");
assert.equal(ruMotives.motive_debt.label, "Давление долгов");

const interrogationState = {
  ...state,
  phase: "interrogation"
};

const updated = applyNpcTurnResult(interrogationState, "suspect_ivo", "Where were you at 21:10?", {
  ok: true,
  source: "groq",
  requestId: request.requestId,
  model: request.model,
  response: {
    answer_text: "I was reviewing inventory, but I cannot explain every minute.",
    truthfulness: "lie",
    suspicion_delta: 4,
    revealed_clue_id: "clue_ivo_gap",
    contradiction_risk: 52,
    npc_mood: "defensive",
    notebook_hint: "Ivo avoided the exact minute."
  },
  meta: {
    latencyMs: 364,
    fallbackReason: null,
    providerStatus: 200,
    retryAfter: null,
    validationWarnings: []
  }
});

assert.equal(updated.rules.actionPointsRemaining, 8);
assert.equal(updated.suspects.suspect_ivo.visibleState.questionsAsked, 1);
assert.equal(updated.suspects.suspect_ivo.visibleState.suspicion, 39);
assert.equal(updated.clues.clue_ivo_gap.unlocked, true);
assert.deepEqual(updated.playerNotebook.unlockedClueIds, ["clue_ivo_gap"]);
assert.equal(updated.transcript.length, 1);
assert.equal(updated.transcript[0].source, "groq");
assert.equal(updated.transcript[0].latencyMs, 364);
assert.equal(updated.transcript[0].providerStatus, 200);
assert.equal(updated.transcript[0].fallbackReason, null);

const illegalReveal = applyNpcTurnResult(updated, "suspect_ivo", "What is your motive?", {
  ok: true,
  source: "groq",
  requestId: "turn_illegal",
  model: request.model,
  response: {
    answer_text: "I am not discussing motive.",
    truthfulness: "evasive",
    suspicion_delta: 2,
    revealed_clue_id: "clue_camera_fault",
    contradiction_risk: 22,
    npc_mood: "controlled",
    notebook_hint: ""
  },
  meta: {
    latencyMs: 400,
    fallbackReason: null,
    providerStatus: 200,
    retryAfter: null,
    validationWarnings: []
  }
});

assert.equal(illegalReveal.clues.clue_camera_fault.unlocked, false);
assert.equal(illegalReveal.rules.actionPointsRemaining, 7);

const degradedTurn = applyNpcTurnResult(illegalReveal, "suspect_ivo", "Can the case continue if the connection drops?", {
  ok: false,
  source: "fallback",
  requestId: "turn_degraded_network",
  model: request.model,
  response: {
    answer_text: "No, stop twisting the inventory log. I counted stock, not prototypes.",
    truthfulness: "evasive",
    suspicion_delta: 4,
    revealed_clue_id: "clue_debt_message",
    contradiction_risk: 40,
    npc_mood: "controlled",
    notebook_hint: "Answer stayed evasive."
  },
  meta: {
    latencyMs: 120,
    fallbackReason: "network_error",
    providerStatus: null,
    retryAfter: null,
    validationWarnings: ["network_error"]
  }
});
assert.equal(degradedTurn.rules.actionPointsRemaining, illegalReveal.rules.actionPointsRemaining);
assert.equal(degradedTurn.suspects.suspect_ivo.visibleState.suspicion, illegalReveal.suspects.suspect_ivo.visibleState.suspicion);
assert.equal(degradedTurn.clues.clue_debt_message.unlocked, false);
assert.equal(degradedTurn.phase, "interrogation");
assert.equal(degradedTurn.transcript.at(-1).source, "fallback");

const accusationReady = {
  ...illegalReveal,
  transcript: [...illegalReveal.transcript, illegalReveal.transcript[0]]
};
const accusationPreview = goToAccusation(accusationReady);
assert.equal(accusationPreview.phase, "accusation");
const resumedInterrogation = returnToInterrogation(accusationPreview);
assert.equal(resumedInterrogation.phase, "interrogation");

const winState = submitAccusation(illegalReveal, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
});
assert.equal(winState.phase, "resolution");
assert.equal(winState.resolution.outcome, "perfect_win");
assert.equal(winState.deduction.accusationAttemptsRemaining, 0);
assert.equal(winState.resolution.detectiveRating, "careful");
assert.deepEqual(winState.resolution.reverseReconstructionStepIds, [
  "recon_camera_break",
  "recon_cart_log",
  "recon_ivo_gap",
  "recon_final_verdict"
]);

const sharpState = submitAccusation(firstTheoTurn, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
});
assert.equal(sharpState.resolution.outcome, "perfect_win");
assert.equal(sharpState.resolution.detectiveRating, "sharp");

const lossState = submitAccusation(illegalReveal, {
  accusedSuspectId: "suspect_mara",
  selectedMotiveId: "motive_rivalry",
  selectedEvidenceClueIds: []
});
assert.equal(lossState.resolution.outcome, "loss");
assert.equal(lossState.resolution.detectiveRating, "misled");
assert.ok(lossState.resolution.reverseReconstructionStepIds.includes("recon_wrong_verdict"));

const partialState = submitAccusation(illegalReveal, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_rivalry",
  selectedEvidenceClueIds: ["clue_ivo_gap"]
});
assert.equal(partialState.resolution.outcome, "partial_win");
assert.equal(partialState.resolution.detectiveRating, "reckless");
assert.equal(partialState.resolution.evidenceScore, 1);

const ruWinState = submitAccusation(illegalReveal, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
}, "ru");
assert.equal(ruWinState.phase, "resolution");
assert.equal(ruWinState.resolution.finalText, "Вы назвали вора, мотив и достаточные улики. Дело держится.");

console.log("game engine tests passed");
