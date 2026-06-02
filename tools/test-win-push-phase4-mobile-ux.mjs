import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateNpcTurnResponse } from "../src/ai/fallback.ts";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  canGoToAccusation,
  canUseDeadEndHint,
  createInitialGameState,
  goToAccusation,
  getLocalizedMotiveMap,
  returnToInterrogation,
  startInterrogation,
  submitAccusation,
  unlockClue,
  useDeadEndHint
} from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";
import { dictionaries, getDictionary } from "../src/i18n/dictionaries.ts";
import {
  BUTTON_ACCEPTANCE_RULES,
  CASE_ACCEPTANCE_MATRIX,
  INTERACTIVE_ELEMENT_INVENTORY,
  LANGUAGE_PHASE_ACCEPTANCE,
  MOBILE_VIEWPORT_ACCEPTANCE,
  PHASE4_ANCHOR_REVIEW,
  PHASE4_BROWSER_UX_RESEARCH,
  PHASE4_TODO_CLOSURES,
  PLAYER_CONFUSION_MAP
} from "../src/release/winPushPhase4MobileUx.ts";

function liveTurn(request, overrides = {}) {
  return {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "I can tie that to the camera, cart, and 21:10 timeline without guessing.",
      truthfulness: "partial",
      suspicion_delta: 2,
      revealed_clue_id: null,
      contradiction_risk: 50,
      npc_mood: "guarded",
      notebook_hint: "Compare the camera problem with the cart movement.",
      ...overrides.response
    },
    meta: {
      latencyMs: 320,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: [],
      ...overrides.meta
    }
  };
}

function fallbackTurn(request, reason = "timeout") {
  return {
    ok: false,
    source: "fallback",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "I know I sound shaky. The minute is blurred, not the whole night.",
      truthfulness: "evasive",
      suspicion_delta: 0,
      revealed_clue_id: null,
      contradiction_risk: 10,
      npc_mood: request.npc.mood,
      notebook_hint: "The answer felt evasive."
    },
    meta: {
      latencyMs: 1500,
      fallbackReason: reason,
      providerStatus: null,
      retryAfter: null,
      validationWarnings: [reason]
    }
  };
}

function ask(state, suspectId, question, locale = "en", overrides = {}) {
  const request = buildNpcTurnRequest(state, suspectId, question, locale);
  return applyNpcTurnResult(state, suspectId, question, liveTurn(request, overrides));
}

function runQuickJudgeRoute(locale = "en") {
  let state = startInterrogation(createInitialGameState());
  const dictionary = getDictionary(locale);
  state = ask(
    state,
    FIRST_INTERROGATION_SUSPECT_ID,
    dictionary.questions.base(state, state.suspects[FIRST_INTERROGATION_SUSPECT_ID])[0],
    locale,
    {
      response: {
        answer_text:
          locale === "ru"
            ? "Я задел камеру до кражи, но это не объясняет тележку позже."
            : "I bumped the camera before the theft, but that does not explain the cart later.",
        revealed_clue_id: "clue_camera_fault",
        suspicion_delta: 3,
        contradiction_risk: 82,
        npc_mood: "shaken"
      }
    }
  );
  assert.equal(state.deduction.collapseTriggered, true);
  assert.equal(state.deduction.personaShiftSuspectId, "suspect_ivo");

  state = ask(state, "suspect_ivo", locale === "ru" ? "Что было с тележкой в 21:10?" : "What happened with the cart at 21:10?", locale, {
    response: {
      answer_text:
        locale === "ru"
          ? "Нет, я разбирал инвентарь; 21:10 выглядит хуже из-за тележки."
          : "No, I was sorting inventory; 21:10 looks worse because of the cart.",
      suspicion_delta: 4,
      contradiction_risk: 75,
      npc_mood: "panicking"
    }
  });
  state = ask(state, "suspect_lena", locale === "ru" ? "Что вы слышали у склада?" : "What did you hear near storage?", locale, {
    response: {
      answer_text:
        locale === "ru"
          ? "Я слышала тележку у двери склада. Это факт, не теория."
          : "I heard the cart near the storage door. That is fact, not theory.",
      suspicion_delta: 1,
      contradiction_risk: 45,
      npc_mood: "impatient"
    }
  });

  state = unlockClue(unlockClue(state, "clue_ivo_gap"), "clue_debt_message");
  assert.equal(canGoToAccusation(state), true);
  state = goToAccusation(state);
  assert.equal(state.phase, "accusation");
  return submitAccusation(
    state,
    {
      accusedSuspectId: "suspect_ivo",
      selectedMotiveId: "motive_debt",
      selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
    },
    locale
  );
}

assert.deepEqual(PHASE4_TODO_CLOSURES, Array.from({ length: 30 }, (_, index) => `T${String(index + 71).padStart(3, "0")}`));
assert.equal(CASE_ACCEPTANCE_MATRIX.length, 8);
assert.equal(PHASE4_ANCHOR_REVIEW.signal, "Anchor OK. Продолжаем.");
assert.equal(PHASE4_ANCHOR_REVIEW.driftFound.length, 0);
assert.ok(PHASE4_BROWSER_UX_RESEARCH.standards.length >= 4);
assert.ok(MOBILE_VIEWPORT_ACCEPTANCE.widths.includes(375));
assert.ok(LANGUAGE_PHASE_ACCEPTANCE.phases.includes("resolution"));
assert.ok(PLAYER_CONFUSION_MAP.some((item) => item.risk === "motive_vs_culprit"));
assert.ok(INTERACTIVE_ELEMENT_INVENTORY.length >= 20);

const [componentSource, notebookSource, storeSource, mobileUiTest, browserSmoke, releaseBrowser, masterTodo, stateMarkdown] = await Promise.all([
  readFile("src/components/LiarlineGame.tsx", "utf8"),
  readFile("src/components/NotebookDrawer.tsx", "utf8"),
  readFile("src/state/GameStore.tsx", "utf8"),
  readFile("tools/test-mobile-ui-contract.mjs", "utf8"),
  readFile("tools/mobile-browser-smoke.spec.ts", "utf8"),
  readFile("tools/release-browser.spec.ts", "utf8"),
  readFile("docs/MASTER_TODO.md", "utf8"),
  readFile("docs/STATE.md", "utf8")
]);

for (const todoId of PHASE4_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked in MASTER_TODO`);
}

for (const fragment of [
  "data-testid=\"suggested-question-button\"",
  "data-testid=\"custom-question-input\"",
  "data-testid=\"accusation-entry-button\"",
  "data-testid=\"final-accusation-submit\"",
  "aria-pressed",
  "const trimmedQuestion = question.trim()",
  "useState(\"\")",
  "latestTranscriptEntry?.source === \"fallback\"",
  "disabled={pendingQuestion}",
  "disabled={!accusationReady}",
  "disabled={!canSubmitAccusation}",
  "risk-acknowledge-checkbox",
  "one-hint-button",
  "portrait-anchor",
  "case-progress-rail"
]) {
  assert.ok(componentSource.includes(fragment), `component contract missing ${fragment}`);
}
assert.ok(notebookSource.includes("compact-evidence-surface"), "notebook drawer must expose compact evidence surface");
assert.ok(notebookSource.includes("aria-modal=\"true\""), "notebook drawer must be modal for mobile open/close checks");

for (const fragment of BUTTON_ACCEPTANCE_RULES.codeRequirements) {
  assert.ok(componentSource.includes(fragment) || storeSource.includes(fragment), `button code rule missing ${fragment}`);
}
for (const fragment of MOBILE_VIEWPORT_ACCEPTANCE.keyboardSafeContracts) {
  assert.ok(componentSource.includes(fragment) || mobileUiTest.includes(fragment), `mobile viewport rule missing ${fragment}`);
}
assert.ok(browserSmoke.includes("375") && browserSmoke.includes("390") && browserSmoke.includes("430"));
assert.ok(releaseBrowser.includes("Reverse reconstruction"));
assert.ok(storeSource.includes("runVersionRef.current += 1"));
assert.ok(storeSource.includes("currentRequestAbortRef.current?.abort()"));

const perfect = runQuickJudgeRoute("en");
assert.equal(perfect.phase, "resolution");
assert.equal(perfect.resolution.outcome, "perfect_win");
assert.equal(perfect.resolution.detectiveRating, "sharp");
assert.deepEqual(perfect.resolution.reverseReconstructionStepIds, [
  "recon_camera_break",
  "recon_cart_log",
  "recon_ivo_gap",
  "recon_final_verdict"
]);
const reconstructionText = perfect.resolution.reverseReconstructionStepIds
  .map((stepId) => dictionaries.en.reverseReconstruction[stepId])
  .join(" ")
  .toLowerCase();
for (const fragment of ["camera", "cart", "ivo", "verdict"]) {
  assert.ok(reconstructionText.includes(fragment), `reverse reconstruction missing ${fragment}`);
}

const ruPerfect = runQuickJudgeRoute("ru");
assert.equal(ruPerfect.resolution.outcome, perfect.resolution.outcome);
assert.equal(ruPerfect.truthTable.culpritSuspectId, perfect.truthTable.culpritSuspectId);
assert.equal(ruPerfect.truthTable.trueMotiveId, perfect.truthTable.trueMotiveId);
assert.deepEqual(ruPerfect.truthTable.validEvidenceForPerfectWin, perfect.truthTable.validEvidenceForPerfectWin);
const ruReconstructionText = ruPerfect.resolution.reverseReconstructionStepIds
  .map((stepId) => dictionaries.ru.reverseReconstruction[stepId])
  .join(" ");
assert.ok(/камера|тележ|иво|мотив/i.test(ruReconstructionText));

let chaotic = startInterrogation(createInitialGameState());
for (const [index, suspectId] of ["suspect_mara", "suspect_lena", "suspect_ivo", "suspect_theo", "suspect_ivo"].entries()) {
  chaotic = ask(chaotic, suspectId, `Chaotic but valid question ${index + 1}?`, "en", {
    response: {
      answer_text: "That answer stays inside the lab, cart, camera, and timing facts.",
      suspicion_delta: index % 2 === 0 ? 4 : -2,
      contradiction_risk: 20 + index
    }
  });
  for (const suspect of Object.values(chaotic.suspects)) {
    assert.ok(suspect.visibleState.suspicion >= chaotic.rules.suspicionMin);
    assert.ok(suspect.visibleState.suspicion <= chaotic.rules.suspicionMax);
  }
}
assert.ok(chaotic.rules.actionPointsRemaining >= 0);
assert.ok(chaotic.transcript.length >= 5);

const fallbackBase = startInterrogation(createInitialGameState());
const fallbackRequest = buildNpcTurnRequest(fallbackBase, FIRST_INTERROGATION_SUSPECT_ID, "Camera?", "en");
const fallbackState = applyNpcTurnResult(
  fallbackBase,
  FIRST_INTERROGATION_SUSPECT_ID,
  "Camera?",
  fallbackTurn(fallbackRequest, "timeout")
);
assert.equal(fallbackState.rules.actionPointsRemaining, fallbackBase.rules.actionPointsRemaining);
assert.equal(fallbackState.suspects[FIRST_INTERROGATION_SUSPECT_ID].visibleState.questionsAsked, 0);
assert.equal(fallbackState.playerNotebook.unlockedClueIds.length, 0);
assert.equal(fallbackState.transcript.at(-1)?.source, "fallback");
assert.equal(canGoToAccusation(fallbackState), false);

const maraFlatDenialRequest = buildNpcTurnRequest(startInterrogation(createInitialGameState()), "suspect_mara", "Что вы скрываете про 21:05?", "ru");
const maraFlatDenial = validateNpcTurnResponse(
  {
    answer_text: "Мне стыдно, я видела прототип после 21:05, но это не связано с кражей.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 30,
    npc_mood: "defensive",
    notebook_hint: "Прототип после 21:05."
  },
  maraFlatDenialRequest
);
assert.equal(maraFlatDenial.ok, false, "flat RU motive denial must fail quarantine");

const maraAmbiguousDenial = validateNpcTurnResponse(
  {
    answer_text: "Я горжусь своей работой, но не скажу, что это связано с прототипом после 21:05.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 30,
    npc_mood: "defensive",
    notebook_hint: "Прототип после 21:05."
  },
  maraFlatDenialRequest
);
assert.equal(maraAmbiguousDenial.ok, false, "ambiguous RU motive denial must fail quarantine");

const weakFirstTheo = validateNpcTurnResponse(
  {
    answer_text: "Uh, the minute... I'm not sure about 21:10, exactly.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 40,
    npc_mood: "nervous",
    notebook_hint: "Timing uncertainty."
  },
  buildNpcTurnRequest(startInterrogation(createInitialGameState()), "suspect_theo", "What happened to the camera?", "en")
);
assert.equal(weakFirstTheo.ok, false, "first Theo answer must include camera anchor");

const wrongTimeFirstTheo = validateNpcTurnResponse(
  {
    answer_text: "Я не уверен в 21:10. Я повредил коридорную камеру до кражи.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 40,
    npc_mood: "nervous",
    notebook_hint: "Камера до кражи."
  },
  buildNpcTurnRequest(startInterrogation(createInitialGameState()), "suspect_theo", "Что произошло с камерой?", "ru")
);
assert.equal(wrongTimeFirstTheo.ok, false, "first Theo answer must include a valid timing anchor");

const conflictingTimeFirstTheo = validateNpcTurnResponse(
  {
    answer_text: "I remember the camera stopped around 21:05, actually 21:10.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 40,
    npc_mood: "nervous",
    notebook_hint: "Camera timing."
  },
  buildNpcTurnRequest(startInterrogation(createInitialGameState()), "suspect_theo", "What happened to the camera?", "en")
);
assert.equal(conflictingTimeFirstTheo.ok, false, "first Theo answer must not use the cart minute");

const selfExoneratingMara = validateNpcTurnResponse(
  {
    answer_text: "Я видела прототип после 21:05, и это доказывает, что я не могла его украсть.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 30,
    npc_mood: "defensive",
    notebook_hint: "Прототип после 21:05."
  },
  maraFlatDenialRequest
);
assert.equal(selfExoneratingMara.ok, false, "Mara must not self-exonerate theft");

const weakLenaNoDoor = validateNpcTurnResponse(
  {
    answer_text: "Тележку я видела в коридоре, но не знаю, когда именно.",
    truthfulness: "truth",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 20,
    npc_mood: "impatient",
    notebook_hint: "Тележка в коридоре."
  },
  buildNpcTurnRequest(startInterrogation(createInitialGameState()), "suspect_lena", "Что вы видели?", "ru")
);
assert.equal(weakLenaNoDoor.ok, false, "direct witness cart answer must include storage-door anchor");

const weakIvoNormality = validateNpcTurnResponse(
  {
    answer_text: "Нет, я точно не видел проблем с журналом в 21:10. Время тележки и комната отдыха выглядят нормально.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 40,
    npc_mood: "panicking",
    notebook_hint: "Проверьте журнал тележки"
  },
  buildNpcTurnRequest(runQuickJudgeRoute("ru"), "suspect_ivo", "Что с журналом тележки в 21:10?", "ru")
);
assert.equal(weakIvoNormality.ok, false, "weak RU normal-looking pressure answer must fail quarantine");

const weakIvoMinimizer = validateNpcTurnResponse(
  {
    answer_text: "Wait, I was sorting inventory at 21:10, nothing more.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 40,
    npc_mood: "panicking",
    notebook_hint: "Inventory timing."
  },
  buildNpcTurnRequest(runQuickJudgeRoute("en"), "suspect_ivo", "What happened with the cart at 21:10?", "en")
);
assert.equal(weakIvoMinimizer.ok, false, "weak EN minimizer pressure answer must fail quarantine");

const weakIvoEmbeddedNothing = validateNpcTurnResponse(
  {
    answer_text: "Нет, я точно не видел в журнале тележки ничего необычного в 21:10.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 40,
    npc_mood: "panicking",
    notebook_hint: "Проверьте журнал тележки"
  },
  buildNpcTurnRequest(runQuickJudgeRoute("ru"), "suspect_ivo", "Что с журналом тележки в 21:10?", "ru")
);
assert.equal(weakIvoEmbeddedNothing.ok, false, "embedded RU generic nothing-unusual pressure answer must fail quarantine");

let hintState = runQuickJudgeRoute("en");
hintState = {
  ...hintState,
  phase: "interrogation",
  rules: { ...hintState.rules, actionPointsRemaining: 6 },
  deduction: { ...hintState.deduction, deadEndHintUsed: false, deadEndHint: null },
  transcript: hintState.transcript.slice(0, 3)
};
assert.equal(canUseDeadEndHint(hintState), true);
hintState = useDeadEndHint(hintState, "en");
assert.ok(hintState.deduction.deadEndHint?.toLowerCase().includes("compare"));
assert.ok(!/culprit|ivo|debt/i.test(hintState.deduction.deadEndHint || ""));

const accusationState = goToAccusation(unlockClue(unlockClue(runQuickJudgeRoute("en"), "clue_ivo_gap"), "clue_debt_message"));
const returned = returnToInterrogation({ ...accusationState, phase: "accusation", rules: { ...accusationState.rules, actionPointsRemaining: 4 } });
assert.equal(returned.phase, "interrogation");
assert.equal(returned.rules.actionPointsRemaining, 4);
assert.equal(returned.transcript.length, accusationState.transcript.length);

for (const locale of ["en", "ru"]) {
  const dictionary = getDictionary(locale);
  assert.ok(dictionary.ui.accusationMissingSelection.length > 10);
  assert.ok(dictionary.ui.submitDisabledRisk.toLowerCase().includes(locale === "ru" ? "риск" : "risk"));
  assert.ok(dictionary.ui.aiSourceFallback.length > 6);
  assert.ok(!/fallback|api|json|network|фолбэк|апи|джсон/i.test(dictionary.ui.aiSourceFallback));
  assert.ok(Object.keys(getLocalizedMotiveMap(createInitialGameState(), locale)).includes("motive_debt"));
}

assert.ok(
  stateMarkdown.includes("PHASE4_T071_T100_CLOSED") ||
    stateMarkdown.includes("T071-T100") ||
    stateMarkdown.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);

console.log(
  JSON.stringify(
    {
      ok: true,
      phase: 4,
      closedTodos: PHASE4_TODO_CLOSURES,
      interactiveElements: INTERACTIVE_ELEMENT_INVENTORY.length,
      viewportWidths: MOBILE_VIEWPORT_ACCEPTANCE.widths
    },
    null,
    2
  )
);
