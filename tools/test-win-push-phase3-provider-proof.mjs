import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AI_BOUNDARY_COPY,
  AI_QUALITY_EVIDENCE_EXAMPLES,
  BAD_AI_ANSWER_QUARANTINE,
  BACKUP_PROVIDER_CANDIDATES_2026_05_08,
  BACKUP_PROVIDER_DECISION_RECORD,
  FIRST_CASE_PROOF_CHAIN,
  MOTIVE_PARITY_RULES,
  PHASE3_PROVIDER_PROOF_DATE,
  PHASE3_PROVIDER_PROOF_TODO_CLOSURES,
  PROVIDER_TEST_MATRIX,
  SECRET_HANDLING_POLICY
} from "../src/release/winPushPhase3ProviderProof.ts";
import { validateNpcTurnResponse } from "../src/ai/fallback.ts";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  canGoToAccusation,
  createInitialGameState,
  getLocalizedMotiveMap,
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
      latencyMs: 360,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: [],
      ...overrides.meta
    },
    ...overrides
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
        ? "Я задел камеру до кражи, но тележку это не объясняет."
        : "I hit the camera before the theft, but that does not explain the cart.",
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

const [
  packageJsonText,
  masterTodo,
  stateText,
  stateJsonText,
  readme,
  release,
  submission,
  providerStatus,
  liveSuspectScript,
  liveVoiceReport,
  demoRouteScript,
  aiClientSource,
  fallbackSource,
  gameEngineSource,
  gameUiSource,
  dictionarySource
] = await Promise.all([
  readFile("package.json", "utf8"),
  readFile("docs/MASTER_TODO.md", "utf8"),
  readFile("docs/STATE.md", "utf8"),
  readFile("docs/state.json", "utf8"),
  readFile("README.md", "utf8"),
  readFile("docs/RELEASE.md", "utf8"),
  readFile("docs/SUBMISSION.md", "utf8"),
  readFile("docs/AI_PROVIDER_STATUS_CURRENT.md", "utf8"),
  readFile("tools/test-live-suspect-voices.mjs", "utf8"),
  readFile("docs/AI_SUSPECT_VOICE_RUN_CURRENT.md", "utf8"),
  readFile("tools/test-demo-route.mjs", "utf8"),
  readFile("src/services/aiClient.ts", "utf8"),
  readFile("src/ai/fallback.ts", "utf8"),
  readFile("src/game/gameEngine.ts", "utf8"),
  readFile("src/components/LiarlineGame.tsx", "utf8"),
  readFile("src/i18n/dictionaries.ts", "utf8")
]);

const packageJson = JSON.parse(packageJsonText);
const stateJson = JSON.parse(stateJsonText);

assert.equal(PHASE3_PROVIDER_PROOF_DATE, "2026-05-08");
assert.equal(packageJson.scripts["test:win-push-phase3-provider-proof"], "tsx tools/test-win-push-phase3-provider-proof.mjs");
assert.deepEqual(PHASE3_PROVIDER_PROOF_TODO_CLOSURES, [
  "T041",
  "T042",
  "T043",
  "T044",
  "T045",
  "T046",
  "T047",
  "T048",
  "T049",
  "T050",
  "T051",
  "T052",
  "T053",
  "T054",
  "T055",
  "T056",
  "T057",
  "T058",
  "T059",
  "T060",
  "T061",
  "T062",
  "T063",
  "T064",
  "T065",
  "T066",
  "T067",
  "T068",
  "T069",
  "T070"
]);

for (const todoId of PHASE3_PROVIDER_PROOF_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked in MASTER_TODO`);
}

assert.equal(BACKUP_PROVIDER_CANDIDATES_2026_05_08.length >= 4, true);
for (const candidate of BACKUP_PROVIDER_CANDIDATES_2026_05_08) {
  assert.ok(candidate.provider.length > 0);
  assert.ok(["strong", "partial", "weak"].includes(candidate.structuredOutput));
  assert.ok(["fast", "medium", "unknown"].includes(candidate.firstAnswerSpeed));
  assert.ok(["usable", "tight", "unstable"].includes(candidate.freeLimitRisk));
  assert.ok(["low", "medium", "high"].includes(candidate.suddenUnavailabilityRisk));
  assert.ok(candidate.releaseDecision.includes("no production switch") || candidate.releaseDecision.includes("primary"));
}
assert.ok(BACKUP_PROVIDER_DECISION_RECORD.primaryLiveAi.provider === "Groq");
assert.ok(BACKUP_PROVIDER_DECISION_RECORD.backupExperiment.defaultEnabled === false);
assert.ok(BACKUP_PROVIDER_DECISION_RECORD.localFallback.degradedButPlayable === true);
assert.ok(PROVIDER_TEST_MATRIX.every((item) => item.requiresEnvOnly === true && !/key|token|secret/i.test(item.exampleCommand)));
assert.ok(SECRET_HANDLING_POLICY.forbiddenOutputs.includes("raw API keys"));
assert.ok(SECRET_HANDLING_POLICY.allowedStorage.includes(".env.local"));
assert.ok(providerStatus.includes("no_provider_switch_before_submission"));
assert.ok(providerStatus.includes("OpenRouter"));
assert.ok(providerStatus.includes("Gemini"));
assert.ok(providerStatus.includes("Hugging Face"));

assert.ok(liveSuspectScript.includes("LIVE_TRANSCRIPT_AUDIT_SCENARIOS"));
assert.ok(liveVoiceReport.includes("ivo_repeat_regression"));
assert.ok(demoRouteScript.includes("personaShiftSuspectId"));
assert.ok(BAD_AI_ANSWER_QUARANTINE.releaseGate.includes("test:win-push-phase3-provider-proof"));
assert.ok(AI_QUALITY_EVIDENCE_EXAMPLES.pass.length >= 4);
assert.ok(AI_QUALITY_EVIDENCE_EXAMPLES.fail.length >= 4);
assert.ok(AI_BOUNDARY_COPY.player.includes("AI suspects"));
assert.ok(AI_BOUNDARY_COPY.devpost.includes("engine owns truth"));

for (const [label, answerText] of [
  ["generic", "I don't know. Ask someone else."],
  ["not game", "This is a fascinating mystery, detective."],
  ["repeat", "No, I was sorting inventory at 21:10. The cart timing looks worse than it is."]
]) {
  const payload = buildNpcTurnRequest(runGuaranteedOpening().afterFirst, "suspect_ivo", "Why does your inventory story avoid 21:10?", label === "mixed ru" ? "ru" : "en");
  payload.turn.recentTranscript = [{ questionText: "Where were you?", answerText: "No, I was sorting inventory at 21:10. The cart timing looks worse than it is." }];
  const result = validateNpcTurnResponse({
    answer_text: answerText,
    truthfulness: "evasive",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 20,
    npc_mood: "guarded",
    notebook_hint: "Check timing."
  }, payload);
  assert.equal(result.ok, false, `${label} must fail quarantine`);
}

const mixedRuPayload = buildNpcTurnRequest(runGuaranteedOpening("ru").afterFirst, "suspect_ivo", "Почему версия про инвентарь избегает 21:10?", "ru");
const mixedRuResult = validateNpcTurnResponse({
  answer_text: "No, я считал inventory рядом с cart.",
  truthfulness: "evasive",
  suspicion_delta: 1,
  revealed_clue_id: null,
  contradiction_risk: 20,
  npc_mood: "guarded",
  notebook_hint: "Проверить лог тележки."
}, mixedRuPayload);
assert.equal(mixedRuResult.ok, true);
assert.ok(!/^No,|\binventory\b|\bcart\b|\bprototype\b/i.test(mixedRuResult.value.answer_text), "recoverable RU mix must be localized");

const partialPhraseRepeatPayload = buildNpcTurnRequest(runGuaranteedOpening("ru").afterFirst, "suspect_ivo", "Какой журнал инвентаря доказывает, что вас не было у тележки в 21:10?", "ru");
partialPhraseRepeatPayload.turn.recentTranscript = [{
  questionText: "Какую деталь вы недоговариваете?",
  answerText: "Нет, я всегда считаю все вещи до сдачи. В комнате отдыха точно нет пропавшего прототипа."
}];
const partialPhraseRepeat = validateNpcTurnResponse({
  answer_text: "Нет, я не говорил, что был у тележки в 21:10. В комнате отдыха точно нет пропавшего прототипа.",
  truthfulness: "lie",
  suspicion_delta: 1,
  revealed_clue_id: null,
  contradiction_risk: 35,
  npc_mood: "panicking",
  notebook_hint: "Повторяет прежнее отрицание."
}, partialPhraseRepeatPayload);
assert.equal(partialPhraseRepeat.ok, false, "shared four-word denial phrase must fail repeat quarantine");

const embeddedGeneric = validateNpcTurnResponse({
  answer_text: "No, I was sorting inventory at 21:10. Nothing unusual.",
  truthfulness: "lie",
  suspicion_delta: 1,
  revealed_clue_id: null,
  contradiction_risk: 35,
  npc_mood: "panicking",
  notebook_hint: "Generic ending."
}, buildNpcTurnRequest(runGuaranteedOpening().afterFirst, "suspect_ivo", "Why does your inventory story avoid 21:10?", "en"));
assert.equal(embeddedGeneric.ok, false, "embedded generic filler phrase must fail quarantine");

const embeddedRuGeneric = validateNpcTurnResponse({
  answer_text: "Нет, я разбирал инвентарь в комнате отдыха, в 21:10 всё было нормально.",
  truthfulness: "lie",
  suspicion_delta: 1,
  revealed_clue_id: null,
  contradiction_risk: 35,
  npc_mood: "panicking",
  notebook_hint: "Слабое отрицание."
}, buildNpcTurnRequest(runGuaranteedOpening("ru").afterFirst, "suspect_ivo", "Почему версия про инвентарь избегает 21:10?", "ru"));
assert.equal(embeddedRuGeneric.ok, false, "embedded RU generic normality phrase must fail quarantine");

const brokenRuAgreement = validateNpcTurnResponse({
  answer_text: "Тележка вывезли из лаборатории. Это видно из логов двери склада.",
  truthfulness: "truth",
  suspicion_delta: 1,
  revealed_clue_id: null,
  contradiction_risk: 20,
  npc_mood: "direct",
  notebook_hint: "Проверьте логи двери склада."
}, buildNpcTurnRequest(runGuaranteedOpening("ru").afterFirst, "suspect_lena", "Что было у двери склада?", "ru"));
assert.equal(brokenRuAgreement.ok, false, "broken RU subject-verb agreement must fail validation");

const { afterFirst } = runGuaranteedOpening();
assert.equal(afterFirst.clues.clue_camera_fault.unlocked, true);
assert.ok(afterFirst.playerNotebook.contradictions.includes("contradiction_camera_vs_cart"));
assert.equal(afterFirst.deduction.collapseTriggered, true);
assert.equal(afterFirst.deduction.personaShiftSuspectId, "suspect_ivo");
assert.ok(FIRST_CASE_PROOF_CHAIN.cameraVsCart.explanation.includes("cart"));
assert.ok(FIRST_CASE_PROOF_CHAIN.falseCertaintyPath.guardrail.includes("Theo"));
assert.ok(FIRST_CASE_PROOF_CHAIN.ivoGuiltPath.requiredSignals.includes("clue_ivo_gap"));
assert.ok(FIRST_CASE_PROOF_CHAIN.supportingSuspects.mara.usefulBeat.includes("21:05"));
assert.ok(FIRST_CASE_PROOF_CHAIN.supportingSuspects.lena.usefulBeat.includes("cart"));
assert.ok(FIRST_CASE_PROOF_CHAIN.suspicionVsProof.rule.includes("Suspicion is pressure"));

const noContradiction = startInterrogationState();
const threeNoCoreTurns = ["suspect_mara", "suspect_lena", "suspect_ivo"].reduce((current, suspectId, index) => {
  const question = `Non-core question ${index + 1}?`;
  const request = buildNpcTurnRequest(current, suspectId, question, "en");
  return applyNpcTurnResult(current, suspectId, question, groqTurn(request, {
    response: {
      answer_text: "I can answer that, but it does not connect the camera and cart.",
      truthfulness: "partial",
      suspicion_delta: 1,
      revealed_clue_id: null,
      contradiction_risk: 20,
      npc_mood: "guarded",
      notebook_hint: "No core contradiction yet."
    }
  }));
}, noContradiction);
assert.equal(threeNoCoreTurns.transcript.length, 3);
assert.equal(threeNoCoreTurns.deduction.collapseTriggered, false);
assert.equal(canGoToAccusation(threeNoCoreTurns), false);
assert.equal(goToAccusation(threeNoCoreTurns).phase, "interrogation");

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
const ivoQuestionTwo = getSuggestedQuestions(afterIvoGap, "suspect_ivo", "en")[0];
const ivoRequestTwo = buildNpcTurnRequest(afterIvoGap, "suspect_ivo", ivoQuestionTwo, "en");
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
assert.equal(readyToAccuse.clues.clue_ivo_gap.unlocked, true);
assert.equal(readyToAccuse.clues.clue_debt_message.unlocked, true);
assert.equal(canGoToAccusation(readyToAccuse), true);
assert.equal(goToAccusation(readyToAccuse).phase, "accusation");

const perfect = submitAccusation(readyToAccuse, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
});
assert.equal(perfect.resolution.outcome, "perfect_win");
assert.equal(perfect.resolution.detectiveRating, "sharp");
assert.ok(perfect.resolution.reverseReconstructionStepIds.includes("recon_final_verdict"));

const partial = submitAccusation(readyToAccuse, {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_rivalry",
  selectedEvidenceClueIds: ["clue_ivo_gap"]
});
assert.equal(partial.resolution.outcome, "partial_win");
assert.equal(partial.resolution.detectiveRating, "reckless");

const loss = submitAccusation(readyToAccuse, {
  accusedSuspectId: "suspect_theo",
  selectedMotiveId: "motive_panic",
  selectedEvidenceClueIds: ["clue_camera_fault"]
});
assert.equal(loss.resolution.outcome, "loss");
assert.equal(loss.resolution.detectiveRating, "misled");

const hintReady = {
  ...readyToAccuse,
  rules: {
    ...readyToAccuse.rules,
    actionPointsRemaining: readyToAccuse.rules.actionPointsMax - 3
  }
};
assert.ok(FIRST_CASE_PROOF_CHAIN.deadEndRecovery.hintText.en.includes("Compare"));
assert.ok(FIRST_CASE_PROOF_CHAIN.deadEndRecovery.hintText.ru.includes("Сравните"));
assert.ok(!/Ivo|Иво|culprit|винов/i.test(FIRST_CASE_PROOF_CHAIN.deadEndRecovery.hintText.en));
assert.ok(hintReady.deduction.collapseTriggered);

const cameraOnly = unlockClue(startInterrogationState(), "clue_camera_fault");
assert.equal(cameraOnly.deduction.collapseTriggered, true);
const ivoOnly = unlockClue(startInterrogationState(), "clue_ivo_gap");
assert.equal(ivoOnly.deduction.collapseTriggered, false);

for (const clue of Object.values(createInitialGameState().clues)) {
  assert.ok(!/culprit|guilty|винов|преступник/i.test(clue.publicText), `${clue.clueId} is too direct`);
  assert.ok(/\b(21:10|21:05|cart|camera|money|prototype|storage|door|debt|тележ|камер|деньг|прототип|склад|долг)/i.test(clue.publicText), `${clue.clueId} is too vague`);
}

assert.ok(gameUiSource.includes("finalSubmitRisk"));
assert.ok(gameUiSource.includes("acknowledgedRisk"));
assert.ok(gameUiSource.includes("disabled={!canSubmitAccusation}"));
assert.ok(gameUiSource.includes("accusationMissingSelection"));
assert.ok(gameEngineSource.includes("countedTranscriptForAccusation"));
assert.ok(gameEngineSource.includes("state.deduction.collapseTriggered"));
assert.ok(fallbackSource.includes("hasRepeatedPriorAnswer"));
assert.ok(aiClientSource.includes("CLIENT_AI_RESPONSE_TIMEOUT_MS"));

const ruMotives = getLocalizedMotiveMap(createInitialGameState(), "ru");
const enMotives = getLocalizedMotiveMap(createInitialGameState(), "en");
for (const motiveId of Object.keys(enMotives)) {
  assert.equal(enMotives[motiveId].ownerSuspectId, ruMotives[motiveId].ownerSuspectId);
  assert.equal(enMotives[motiveId].isTrue, ruMotives[motiveId].isTrue);
  assert.ok(MOTIVE_PARITY_RULES.motiveIds.includes(motiveId));
}
assert.ok(!/Debt pressure[\s\S]*Давление долгов[\s\S]*Research rivalry[\s\S]*Давление долгов/.test(dictionarySource));

assert.ok(readme.includes("npm run test:win-push-phase3-provider-proof"));
assert.ok(release.includes("Phase 3 provider/proof gate"));
assert.ok(submission.includes(AI_BOUNDARY_COPY.devpost));
assert.ok(
  stateText.includes("PHASE3_T041_T070_CLOSED") ||
    stateText.includes("PHASE4_T071_T100_CLOSED") ||
    stateText.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);
assert.ok(["PHASE3_T041_T070_CLOSED", "PHASE4_T071_T100_CLOSED", "PHASE8_T191_T205_POSTLAUNCH_CLOSED"].includes(stateJson.status));

console.log(JSON.stringify({
  ok: true,
  phase: 3,
  closedTodos: PHASE3_PROVIDER_PROOF_TODO_CLOSURES,
  providerCandidates: BACKUP_PROVIDER_CANDIDATES_2026_05_08.length,
  proofChain: FIRST_CASE_PROOF_CHAIN.id
}, null, 2));
