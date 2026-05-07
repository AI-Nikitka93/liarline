import assert from "node:assert/strict";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  createInitialGameState,
  getSuggestedQuestions,
  goToAccusation,
  startInterrogation,
  submitAccusation
} from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";

function npcResult(request, answer, clueId = null, mood = "nervous") {
  return {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: answer,
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: clueId,
      contradiction_risk: 70,
      npc_mood: mood,
      notebook_hint: "Release route keeps evidence above confession."
    },
    meta: {
      latencyMs: 420,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  };
}

let state = startInterrogation(createInitialGameState());
assert.equal(state.phase, "interrogation");

const firstQuestion = getSuggestedQuestions(state, FIRST_INTERROGATION_SUSPECT_ID, "en")[0];
const firstRequest = buildNpcTurnRequest(state, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, "en");
state = applyNpcTurnResult(
  state,
  FIRST_INTERROGATION_SUSPECT_ID,
  firstQuestion,
  npcResult(firstRequest, "I... the camera was already damaged before the theft, but that does not explain the cart.", null, "nervous")
);
assert.equal(state.deduction.collapseTriggered, true);
assert.equal(state.deduction.personaShiftSuspectId, "suspect_ivo");
assert.ok(state.playerNotebook.contradictions.includes("contradiction_camera_vs_cart"));

const ivoQuestion = getSuggestedQuestions(state, "suspect_ivo", "en")[0];
const ivoRequest = buildNpcTurnRequest(state, "suspect_ivo", ivoQuestion, "en");
state = applyNpcTurnResult(
  state,
  "suspect_ivo",
  ivoQuestion,
  npcResult(ivoRequest, "No, wait. The cart log is routine inventory, not proof that I moved the prototype.", "clue_ivo_gap", "panicking")
);
assert.ok(state.playerNotebook.unlockedClueIds.includes("clue_ivo_gap"));

state = {
  ...state,
  clues: {
    ...state.clues,
    clue_debt_message: {
      ...state.clues.clue_debt_message,
      unlocked: true
    }
  },
  playerNotebook: {
    ...state.playerNotebook,
    unlockedClueIds: [...new Set([...state.playerNotebook.unlockedClueIds, "clue_debt_message"])]
  },
  transcript: [...state.transcript, { ...state.transcript[0], turnId: "release_extra_turn" }]
};

state = goToAccusation(state);
assert.equal(state.phase, "accusation");

state = submitAccusation(state, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
});

assert.equal(state.phase, "resolution");
assert.equal(state.resolution.outcome, "perfect_win");
assert.equal(state.resolution.detectiveRating, "sharp");
assert.ok(state.resolution.reverseReconstructionStepIds.includes("recon_final_verdict"));

console.log("release playthrough passed");
