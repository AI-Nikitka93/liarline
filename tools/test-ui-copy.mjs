import assert from "node:assert/strict";
import { dictionaries } from "../src/i18n/dictionaries.ts";

for (const locale of ["en", "ru"]) {
  const dictionary = dictionaries[locale];
  const thinking = `${dictionary.ui.analyzingResponse} ${dictionary.ui.thinkingLine}`.toLowerCase();
  assert.ok(!/\b(ai|npc|loading|form|technology)\b|ии|нпс|загруз|форма|технолог/.test(thinking));

  const cost = dictionary.ui.questionActionCost;
  assert.ok(cost.includes("1"));
  assert.ok(locale === "ru" ? cost.includes("ОД") : cost.toLowerCase().includes("ap"));

  const apRule = dictionary.ui.actionPointsRule(8, 9);
  assert.ok(apRule.includes("8"));
  assert.ok(apRule.includes("9"));

  const accuseGate = dictionary.ui.accuseLocked(1, 3);
  assert.ok(accuseGate.includes("1"));
  assert.ok(accuseGate.includes("3"));

  assert.ok(dictionary.ui.firstQuestionCost.includes("1"));
  assert.ok(dictionary.ui.suspicionMeaning.length > 20);
  assert.ok(dictionary.ui.theoryMeaning.length > 20);
  assert.ok(dictionary.ui.weakStrongRule.includes(dictionary.ui.weakTheory));
  assert.ok(dictionary.ui.weakStrongRule.includes(dictionary.ui.strongTheory));

  const hintCopy = `${dictionary.ui.deadEndHintButton} ${dictionary.ui.deadEndHintReason} ${dictionary.ui.deadEndHintText}`.toLowerCase();
  assert.ok(!/culprit|motive|suspect_ivo|motive_debt|винов|мотив|иво|долг|доказ/.test(hintCopy));
  assert.ok(hintCopy.includes(locale === "ru" ? "что сравнить" : "what to compare"));

  const proofCopy = `${dictionary.ui.proofChecks} ${dictionary.ui.proofSuspect} ${dictionary.ui.proofMotive} ${dictionary.ui.proofEvidence}`.toLowerCase();
  assert.ok(proofCopy.includes(locale === "ru" ? "провер" : "check"));
  assert.ok(dictionary.ui.proofReady.length > 8);
  assert.ok(dictionary.ui.proofIncomplete.length > 8);
  assert.ok(dictionary.ui.selectedEvidenceWarning.length > 30);

  const riskCopy = `${dictionary.ui.finalSubmitRisk} ${dictionary.ui.acknowledgeRiskLabel} ${dictionary.ui.submitDisabledRisk}`.toLowerCase();
  assert.ok(riskCopy.includes(locale === "ru" ? "финал" : "final"));
  assert.ok(riskCopy.includes("1") || riskCopy.includes(locale === "ru" ? "одна" : "one"));

  const recoveryCopy = `${dictionary.ui.noActionReturn} ${dictionary.ui.safeRestartLine} ${dictionary.ui.degradedAiTitle} ${dictionary.ui.degradedAiBody}`.toLowerCase();
  assert.ok(recoveryCopy.includes(locale === "ru" ? "заново" : "restart"));
  assert.ok(recoveryCopy.includes(locale === "ru" ? "дело" : "case"));

  const visualCopy = `${dictionary.ui.visualThesisBadge} ${dictionary.ui.coreHookLine}`.toLowerCase();
  assert.ok(locale === "ru" ? visualCopy.includes("допрос") : visualCopy.includes("interrogat"));
  assert.ok(dictionary.ui.suspicionSignalsNotebookHint.length > 35);
  assert.ok(dictionary.ui.contradictionActionBody.length > 45);
  assert.ok(dictionary.ui.collapseImpactLine.length > 45);
  assert.ok(dictionary.ui.personaReactionLine.length > 30);
  assert.ok(dictionary.missedOpportunities.length >= 3);

  const atmosphereCopy = [
    dictionary.ui.aiSourceLive,
    dictionary.ui.aiSourceFallback,
    dictionary.ui.aiLatencyUnknown,
    dictionary.ui.degradedAiTitle,
    dictionary.ui.degradedAiBody,
    dictionary.ui.connectionFallback,
    dictionary.ui.fallbackReason("timeout"),
    dictionary.ui.fallbackReason("rate_limit"),
    dictionary.ui.fallbackReason("invalid_model_json"),
    dictionary.ui.fallbackReason("network_error")
  ].join(" ").toLowerCase();
  assert.ok(!/\bgroq\b|\bnpc\b|\bjson\b|\bapi\b|\bnetwork\b|\bfallback\b|грок|нпс|джсон|апи|фолбэк|сеть/.test(atmosphereCopy));

  const ratingTitles = Object.values(dictionary.detectiveRatings).map((rating) => rating.title).join(" ");
  if (locale === "ru") {
    assert.ok(!/\b(Sharp|Careful|Reckless|Misled)\b/.test(ratingTitles));
  }

  assert.ok(dictionary.ui.visualThesisBadge.length <= 24);
  assert.ok(dictionary.ui.briefingPremise.length <= (locale === "ru" ? 95 : 85));
  assert.ok(dictionary.ui.firstQuestionSetup.length <= (locale === "ru" ? 95 : 85));

  const ivoQuestionCopy = [
    ...dictionary.questions.base({}, { suspectId: "suspect_ivo" }),
    ...dictionary.questions.pressure({}, { suspectId: "suspect_ivo" }, null),
    ...dictionary.questions.final({}, { suspectId: "suspect_ivo" })
  ].join(" ");
  assert.ok(!/What detail are you leaving out|Give me one detail|Какую деталь вы недоговариваете|Назовите одну деталь/i.test(ivoQuestionCopy));
  assert.ok(ivoQuestionCopy.includes(locale === "ru" ? "21:10" : "21:10"));
}

console.log("ui copy tests passed");
