import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  canGoToAccusation,
  canUseDeadEndHint,
  createInitialGameState,
  getSuggestedQuestions,
  goToAccusation,
  submitAccusation,
  useDeadEndHint
} from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";
import { getDictionary } from "../src/i18n/dictionaries.ts";

function liveTurn(request, response = {}) {
  return {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "I... the camera broke before the theft, but the cart moved later.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 76,
      npc_mood: "nervous",
      notebook_hint: "Camera panic does not explain the cart log.",
      ...response
    },
    meta: {
      latencyMs: 390,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  };
}

function transcriptEntry(id, suspectId = "suspect_ivo") {
  return {
    turnId: id,
    roundIndex: 1,
    suspectId,
    questionText: "What detail can be checked?",
    answerText: "The answer leaves a timeline gap.",
    revealedClueId: null,
    suspicionDeltaApplied: 1,
    createdAt: new Date().toISOString(),
    source: "groq",
    latencyMs: 320,
    providerStatus: 200,
    fallbackReason: null,
    truthfulness: "evasive",
    contradictionRisk: 50,
    notebookHint: "Compare the timeline."
  };
}

const base = { ...createInitialGameState(), phase: "interrogation" };
const firstQuestion = getSuggestedQuestions(base, FIRST_INTERROGATION_SUSPECT_ID, "en")[0];
const firstRequest = buildNpcTurnRequest(base, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, "en");
const collapsed = applyNpcTurnResult(base, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, liveTurn(firstRequest));

assert.equal(collapsed.deduction.collapseTriggered, true);
assert.ok(collapsed.playerNotebook.contradictions.includes("contradiction_camera_vs_cart"));
assert.ok(collapsed.clues.clue_camera_fault.unlocked);
assert.ok(collapsed.case.publicFacts.some((fact) => fact.factId === "public_003"));
assert.equal(collapsed.deduction.collapseFocusSuspectId, "suspect_ivo");
assert.equal(collapsed.deduction.personaShiftSuspectId, "suspect_ivo");

const ui = getDictionary("en").ui;
assert.ok(ui.collapseBody.includes("camera"));
assert.ok(ui.collapseBody.includes("cart"));
assert.ok(ui.collapseImpactLine.includes("board"));
assert.ok(!/Ivo is guilty|culprit|murderer/i.test(ui.strongTheory));
assert.ok(!/Ivo is guilty|culprit|murderer/i.test(ui.weakTheory));
assert.ok(!/Ivo is guilty|culprit|murderer/i.test(ui.theoryMeaning));
assert.ok(!/Ivo is guilty|culprit|murderer/i.test(ui.weakStrongRule));

const beforeDeadEnd = {
  ...collapsed,
  rules: {
    ...collapsed.rules,
    actionPointsRemaining: 7
  },
  transcript: [collapsed.transcript[0], transcriptEntry("hint_wait_1"), transcriptEntry("hint_wait_2")]
};
assert.equal(canUseDeadEndHint(beforeDeadEnd), false);
const deadEndReady = {
  ...beforeDeadEnd,
  rules: {
    ...beforeDeadEnd.rules,
    actionPointsRemaining: 6
  }
};
assert.equal(canUseDeadEndHint(deadEndReady), true);
const hinted = useDeadEndHint(deadEndReady, "en");
assert.equal(hinted.deduction.deadEndHintUsed, true);
assert.ok(hinted.deduction.deadEndHint);
assert.ok(!/Ivo|culprit|guilty|debt pressure/i.test(hinted.deduction.deadEndHint));

const trappedNoAp = {
  ...createInitialGameState(),
  phase: "interrogation",
  rules: {
    ...createInitialGameState().rules,
    actionPointsRemaining: 0
  },
  transcript: []
};
assert.equal(canGoToAccusation(trappedNoAp), true);
assert.equal(goToAccusation(trappedNoAp).phase, "accusation");
const noApResolution = submitAccusation(goToAccusation(trappedNoAp), {
  accusedSuspectId: "suspect_theo",
  selectedMotiveId: "motive_panic",
  selectedEvidenceClueIds: []
});
assert.equal(noApResolution.phase, "resolution");
assert.equal(noApResolution.resolution.outcome, "loss");

const gameUi = await readFile("src/components/LiarlineGame.tsx", "utf8");
const topUi = await readFile("src/components/ui.tsx", "utf8");
const notebookUi = await readFile("src/components/NotebookDrawer.tsx", "utf8");
const globals = await readFile("src/app/globals.css", "utf8");
assert.ok(gameUi.includes("title={dictionary.ui.openNotebook}"));
assert.ok(gameUi.includes("{dictionary.ui.sendQuestion} · {dictionary.ui.questionActionCost}"));
assert.ok(topUi.includes("aria-label={dictionary.ui.restartGame}"));
assert.ok(topUi.includes("<span>{dictionary.ui.restartGame}</span>"));
assert.ok(notebookUi.includes("aria-label={dictionary.ui.closeNotebook}"));
assert.ok(globals.includes("--safe-bottom"));
assert.ok(globals.includes("--keyboard-inset"));
assert.ok(globals.includes("overflow-x: hidden"));
assert.ok(globals.includes(".mobile-action-dock"));

console.log("phase 7 polish tests passed");
