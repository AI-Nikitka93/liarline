import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  createInitialGameState,
  getSuggestedQuestions,
  goToAccusation,
  submitAccusation,
  unlockClue
} from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";

function groqTurn(request, overrides = {}) {
  return {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "I need a second. The timing looks clean until you put it next to the cart log.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 55,
      npc_mood: "nervous",
      notebook_hint: "Compare the answer with the timeline before accusing.",
      ...overrides.response
    },
    meta: {
      latencyMs: 364,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: [],
      ...overrides.meta
    },
    ...overrides
  };
}

function fallbackTurn(request, reason = "network_error") {
  return {
    ok: false,
    source: "fallback",
    requestId: request.requestId,
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
      latencyMs: 90,
      fallbackReason: reason,
      providerStatus: null,
      retryAfter: null,
      validationWarnings: [reason]
    }
  };
}

function startInterrogationState() {
  return {
    ...createInitialGameState(),
    phase: "interrogation"
  };
}

function runGuaranteedOpening(locale = "en") {
  const opening = startInterrogationState();
  const firstQuestion = getSuggestedQuestions(opening, FIRST_INTERROGATION_SUSPECT_ID, locale)[0];
  const request = buildNpcTurnRequest(opening, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, locale);
  const afterFirst = applyNpcTurnResult(opening, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, groqTurn(request, {
    response: {
      answer_text: locale === "ru"
        ? "Я... я задел камеру до кражи, но тележку это не объясняет."
        : "I... I hit the camera before the theft, but that does not explain the cart.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 76,
      npc_mood: "nervous",
      notebook_hint: "Camera panic does not explain the later cart movement."
    }
  }));
  return { opening, firstQuestion, request, afterFirst };
}

const { afterFirst } = runGuaranteedOpening();
assert.equal(afterFirst.phase, "interrogation");
assert.equal(afterFirst.clues.clue_camera_fault.unlocked, true);
assert.ok(afterFirst.playerNotebook.contradictions.includes("contradiction_camera_vs_cart"));
assert.equal(afterFirst.deduction.collapseTriggered, true);
assert.equal(afterFirst.deduction.personaShiftSuspectId, "suspect_ivo");
assert.equal(afterFirst.deduction.theoryConfidence, "strong");
assert.ok(afterFirst.deduction.suspicionSignals.some((signal) => signal.signalId === "signal_theo_timeline_mismatch" && signal.resolved));
assert.ok(afterFirst.deduction.suspicionSignals.some((signal) => signal.signalId === "signal_ivo_detail_unverified" && !signal.resolved));

const ivoQuestionOne = getSuggestedQuestions(afterFirst, "suspect_ivo", "en")[0];
const ivoRequestOne = buildNpcTurnRequest(afterFirst, "suspect_ivo", ivoQuestionOne, "en");
const afterIvoGap = applyNpcTurnResult(afterFirst, "suspect_ivo", ivoQuestionOne, groqTurn(ivoRequestOne, {
  response: {
    answer_text: "No, I was counting inventory. The cart log only makes that sound worse than it was.",
    truthfulness: "lie",
    suspicion_delta: 4,
    revealed_clue_id: "clue_ivo_gap",
    contradiction_risk: 82,
    npc_mood: "panicking",
    notebook_hint: "Ivo still avoids the exact 21:10 movement."
  }
}));
assert.equal(afterIvoGap.clues.clue_ivo_gap.unlocked, true);
assert.equal(afterIvoGap.rules.actionPointsRemaining, 7);

const ivoQuestionTwo = getSuggestedQuestions(afterIvoGap, "suspect_ivo", "en")[0];
const ivoRequestTwo = buildNpcTurnRequest(afterIvoGap, "suspect_ivo", ivoQuestionTwo, "en");
assert.ok(ivoRequestTwo.outputRules.allowedRevealedClueIds.includes("clue_debt_message"));
const readyToAccuse = applyNpcTurnResult(afterIvoGap, "suspect_ivo", ivoQuestionTwo, groqTurn(ivoRequestTwo, {
  response: {
    answer_text: "Stop. The message was private, and it has nothing to do with that cart.",
    truthfulness: "evasive",
    suspicion_delta: 3,
    revealed_clue_id: "clue_debt_message",
    contradiction_risk: 88,
    npc_mood: "panicking",
    notebook_hint: "The money message ties pressure to the missing prototype."
  }
}));
assert.equal(readyToAccuse.transcript.length, 3);
assert.equal(readyToAccuse.clues.clue_debt_message.unlocked, true);
assert.equal(goToAccusation(readyToAccuse).phase, "accusation");
const happyResolution = submitAccusation(readyToAccuse, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
});
assert.equal(happyResolution.phase, "resolution");
assert.equal(happyResolution.resolution.outcome, "perfect_win");
assert.equal(happyResolution.resolution.detectiveRating, "sharp");
assert.deepEqual(happyResolution.resolution.reverseReconstructionStepIds, [
  "recon_camera_break",
  "recon_cart_log",
  "recon_ivo_gap",
  "recon_final_verdict"
]);

const falseCertaintyState = {
  ...startInterrogationState(),
  playerNotebook: {
    ...createInitialGameState().playerNotebook,
    unlockedClueIds: ["clue_camera_fault"],
    contradictions: []
  },
  clues: {
    ...createInitialGameState().clues,
    clue_camera_fault: {
      ...createInitialGameState().clues.clue_camera_fault,
      unlocked: true
    }
  },
  transcript: [
    {
      turnId: "wrong_path_1",
      roundIndex: 0,
      suspectId: "suspect_theo",
      questionText: "What happened to the camera?",
      answerText: "I broke it before the theft.",
      revealedClueId: "clue_camera_fault",
      suspicionDeltaApplied: 3,
      createdAt: new Date().toISOString(),
      source: "groq",
      latencyMs: 360,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "partial",
      contradictionRisk: 70,
      notebookHint: "Camera panic is tempting but incomplete."
    },
    {
      turnId: "wrong_path_2",
      roundIndex: 0,
      suspectId: "suspect_theo",
      questionText: "Did you move the prototype?",
      answerText: "No. I only touched equipment.",
      revealedClueId: null,
      suspicionDeltaApplied: 1,
      createdAt: new Date().toISOString(),
      source: "groq",
      latencyMs: 340,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "truth",
      contradictionRisk: 50,
      notebookHint: "This still needs another fact."
    },
    {
      turnId: "wrong_path_3",
      roundIndex: 1,
      suspectId: "suspect_mara",
      questionText: "Could Theo be covering the theft?",
      answerText: "He was panicking, but that does not place the cart.",
      revealedClueId: null,
      suspicionDeltaApplied: 0,
      createdAt: new Date().toISOString(),
      source: "groq",
      latencyMs: 350,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "partial",
      contradictionRisk: 45,
      notebookHint: "The cart still matters."
    }
  ]
};
assert.equal(falseCertaintyState.deduction.theoryConfidence, "weak");
assert.ok(falseCertaintyState.deduction.suspicionSignals.some((signal) => signal.signalId === "signal_theo_timeline_mismatch" && !signal.resolved));
const wrongResolution = submitAccusation(falseCertaintyState, {
  accusedSuspectId: "suspect_theo",
  selectedMotiveId: "motive_panic",
  selectedEvidenceClueIds: ["clue_camera_fault"]
});
assert.equal(wrongResolution.resolution.outcome, "loss");
assert.equal(wrongResolution.resolution.detectiveRating, "misled");
assert.ok(wrongResolution.resolution.reverseReconstructionStepIds.includes("recon_wrong_verdict"));

const partialResolution = submitAccusation(readyToAccuse, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_rivalry",
  selectedEvidenceClueIds: ["clue_ivo_gap"]
});
assert.equal(partialResolution.resolution.outcome, "partial_win");
assert.equal(partialResolution.resolution.detectiveRating, "reckless");
assert.equal(partialResolution.resolution.evidenceScore, 1);

const fallbackBase = startInterrogationState();
const fallbackRequest = buildNpcTurnRequest(fallbackBase, "suspect_ivo", "Why does your inventory story avoid 21:10?", "en");
const fallbackState = applyNpcTurnResult(fallbackBase, "suspect_ivo", fallbackRequest.turn.playerQuestion, fallbackTurn(fallbackRequest));
assert.equal(fallbackState.phase, "interrogation");
assert.equal(fallbackState.rules.actionPointsRemaining, fallbackBase.rules.actionPointsRemaining);
assert.equal(fallbackState.suspects.suspect_ivo.visibleState.suspicion, fallbackBase.suspects.suspect_ivo.visibleState.suspicion);
assert.equal(fallbackState.clues.clue_debt_message.unlocked, false);
assert.equal(fallbackState.transcript.at(-1).source, "fallback");
assert.equal(fallbackState.transcript.at(-1).fallbackReason, "network_error");

const requestText = JSON.stringify(buildNpcTurnRequest(afterFirst, "suspect_ivo", ivoQuestionOne, "en"));
assert.ok(!/culpritSuspectId|trueMotiveId|trueTimeline|isCulprit|liar_culprit|npcRole/.test(requestText));
assert.ok(!JSON.stringify(afterFirst.transcript).includes("culpritSuspectId"));
const gameUi = await readFile("src/components/LiarlineGame.tsx", "utf8");
const notebookUi = await readFile("src/components/NotebookDrawer.tsx", "utf8");
const systemPrompt = await readFile("src/ai/systemPrompt.ts", "utf8");
assert.ok(!/isCulprit|liar_culprit/.test(gameUi));
assert.ok(!/culpritSuspectId|trueMotiveId|trueTimeline|isCulprit|liar_culprit/.test(notebookUi));
assert.ok(!/culpritSuspectId|trueMotiveId|trueTimeline|isCulprit|liar_culprit/.test(systemPrompt));

const noCameraState = unlockClue(startInterrogationState(), "clue_ivo_gap");
assert.equal(noCameraState.deduction.collapseTriggered, false);
assert.equal(noCameraState.playerNotebook.contradictions.length, 0);
const missingPublicCartFactState = {
  ...startInterrogationState(),
  case: {
    ...createInitialGameState().case,
    publicFacts: createInitialGameState().case.publicFacts.filter((fact) => fact.factId !== "public_003")
  }
};
const cameraOnlyWithoutCartFact = unlockClue(missingPublicCartFactState, "clue_camera_fault");
assert.equal(cameraOnlyWithoutCartFact.clues.clue_camera_fault.unlocked, true);
assert.equal(cameraOnlyWithoutCartFact.deduction.collapseTriggered, false);
assert.equal(cameraOnlyWithoutCartFact.playerNotebook.contradictions.length, 0);

const storeCode = await readFile("src/state/GameStore.tsx", "utf8");
const aiClientCode = await readFile("src/services/aiClient.ts", "utf8");
assert.ok(storeCode.includes("currentRequestAbortRef"));
assert.ok(storeCode.includes("new AbortController()"));
assert.ok(storeCode.includes("currentRequestAbortRef.current?.abort()"));
assert.ok(storeCode.includes("requestNpcTurn(payload, requestController.signal)"));
assert.ok(aiClientCode.includes("signal?: AbortSignal"));
assert.ok(aiClientCode.includes("signal,"));

console.log("phase 7 fairness tests passed");
