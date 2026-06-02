import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ARTIFACT_HYGIENE_RULES,
  CHANGELOG_DISCIPLINE_RULES,
  DEMO_DAY_RECOVERY_SCENARIOS,
  DO_NOT_REOPEN_ITEMS,
  EVIDENCE_FOLLOW_UP_BACKLOG,
  FAST_DECAY_KNOWLEDGE_MAP,
  FRESHNESS_REVIEW_CYCLES,
  FUTURE_CASE_TEMPLATE,
  HOTFIX_DECISION_RULES,
  PHASE8_ANCHOR_REVIEW,
  PHASE8_END_REVIEW,
  PHASE8_TODO_CLOSURES,
  POST_LAUNCH_READINESS,
  SECOND_CASE_THRESHOLD
} from "../src/release/winPushPhase8PostLaunch.ts";

const masterTodo = await readFile("docs/MASTER_TODO.md", "utf8");
const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const readme = await readFile("README.md", "utf8");
const stateDoc = await readFile("docs/STATE.md", "utf8");
const restorePoint = await readFile("docs/RESTORE_POINT_2026-05-09_PHASE8.md", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const projectHygieneTest = await readFile("tools/test-project-hygiene.mjs", "utf8");
const feedbackSource = await readFile("src/release/feedbackIntake.ts", "utf8");

assert.deepEqual(PHASE8_TODO_CLOSURES, [
  "T191",
  "T192",
  "T193",
  "T194",
  "T195",
  "T196",
  "T197",
  "T198",
  "T199",
  "T200",
  "T201",
  "T202",
  "T203",
  "T204",
  "T205"
]);

for (const blockerId of [
  "unplayable_path",
  "broken_first_ai_answer",
  "truth_leak",
  "broken_fallback",
  "broken_restart",
  "mobile_blocker"
]) {
  const rule = HOTFIX_DECISION_RULES.find((item) => item.blockerId === blockerId);
  assert.ok(rule, `missing hotfix rule ${blockerId}`);
  assert.equal(rule.lane, "hotfix");
  assert.ok(rule.detectWith.length > 0, `${blockerId} missing detection`);
  assert.ok(rule.fixBeforeAnythingElse.length > 0, `${blockerId} missing action`);
}

for (const scenarioId of ["ai_outage", "public_url_stale", "bad_save", "broken_mobile_layout", "fallback_only_recording"]) {
  const scenario = DEMO_DAY_RECOVERY_SCENARIOS.find((item) => item.scenarioId === scenarioId);
  assert.ok(scenario, `missing recovery scenario ${scenarioId}`);
  assert.ok(scenario.operatorSteps.length >= 2, `${scenarioId} needs actionable steps`);
  assert.ok(scenario.noGoIf.length > 0, `${scenarioId} needs no-go rule`);
}

for (const cycleId of ["ai_provider_facts", "contest_submission_facts", "visual_browser_behavior"]) {
  const cycle = FRESHNESS_REVIEW_CYCLES.find((item) => item.cycleId === cycleId);
  assert.ok(cycle, `missing freshness cycle ${cycleId}`);
  assert.ok(cycle.sources.every((source) => /^https?:\/\//.test(source) || source.startsWith("npm run")), `${cycleId} has non-actionable source`);
  assert.ok(cycle.updateTargets.length > 0, `${cycleId} missing update targets`);
}

for (const factId of ["provider_status", "rate_limits", "contest_fields", "mobile_keyboard_behavior", "submission_packet"]) {
  const fact = FAST_DECAY_KNOWLEDGE_MAP.find((item) => item.factId === factId);
  assert.ok(fact, `missing fast-decay knowledge ${factId}`);
  assert.ok(fact.refreshIn.includes("before"), `${factId} must define when to refresh`);
  assert.ok(fact.sourceOfTruth.length > 0, `${factId} missing source of truth`);
}

for (const itemId of ["notebook_clarity", "persona_shift_punch", "rating_fairness", "ai_generic_answer_rate"]) {
  const item = EVIDENCE_FOLLOW_UP_BACKLOG.find((entry) => entry.itemId === itemId);
  assert.ok(item, `missing follow-up backlog item ${itemId}`);
  assert.ok(item.evidenceSource.length > 0, `${itemId} missing evidence source`);
  assert.ok(item.acceptanceSignal.length > 0, `${itemId} missing acceptance`);
}

assert.equal(SECOND_CASE_THRESHOLD.decision, "do_not_start_second_case_yet");
assert.ok(SECOND_CASE_THRESHOLD.requiredStableSignals.includes("Notebook comparison clarity"));
assert.ok(SECOND_CASE_THRESHOLD.requiredStableSignals.includes("rating fairness"));
assert.ok(FUTURE_CASE_TEMPLATE.requiredBeats.includes("false_certainty"));
assert.ok(FUTURE_CASE_TEMPLATE.requiredBeats.includes("evidence_based_resolution"));

for (const doNotReopen of ["hidden_truth_in_prompt", "full_trial_mode", "multiplayer", "voice", "accounts", "procedural_cases"]) {
  assert.ok(DO_NOT_REOPEN_ITEMS.some((item) => item.itemId === doNotReopen), `missing do-not-reopen ${doNotReopen}`);
}

for (const field of ["playerImpact", "proof", "noDriftCheck", "affectedReleaseDocs"]) {
  assert.ok(CHANGELOG_DISCIPLINE_RULES.requiredFields.includes(field), `changelog missing ${field}`);
}

for (const artifact of ["raw_ai_outputs", "rejected_assets", "logs", "research_scraps"]) {
  assert.ok(ARTIFACT_HYGIENE_RULES.some((item) => item.artifactId === artifact), `missing artifact hygiene ${artifact}`);
}

assert.equal(POST_LAUNCH_READINESS.feedbackIntake, true);
assert.equal(POST_LAUNCH_READINESS.triage, true);
assert.equal(POST_LAUNCH_READINESS.hotfixRules, true);
assert.equal(POST_LAUNCH_READINESS.recovery, true);
assert.equal(POST_LAUNCH_READINESS.freshnessCycles, true);
assert.equal(POST_LAUNCH_READINESS.scopeDriftGuard, true);

assert.equal(PHASE8_ANCHOR_REVIEW.status, "Anchor OK. Продолжаем.");
assert.equal(PHASE8_ANCHOR_REVIEW.noDrift, true);
assert.equal(PHASE8_END_REVIEW.phase, 8);
assert.equal(PHASE8_END_REVIEW.signal, "Фаза 8 закрыта. Переходим к финальному submit/post-launch циклу");
assert.ok(PHASE8_END_REVIEW.inheritedExternalBlockers.includes("real_demo_video_url"));

for (const todoId of PHASE8_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked in MASTER_TODO`);
}

for (const fragment of [
  "Phase 8 post-launch readiness",
  "Hotfix decision rules",
  "Demo day recovery",
  "Freshness review cycles",
  "Evidence-only first follow-up backlog",
  "Second-case threshold",
  "Future case template",
  "Do not reopen",
  "Changelog discipline",
  "Post-release artifact hygiene"
]) {
  assert.ok(releaseDoc.includes(fragment), `RELEASE missing ${fragment}`);
}

assert.ok(readme.includes("npm run test:win-push-phase8-postlaunch"));
assert.ok(readme.includes("post-launch readiness"));
assert.equal(packageJson.scripts["test:win-push-phase8-postlaunch"], "tsx tools/test-win-push-phase8-postlaunch.mjs");
assert.ok(stateDoc.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED"));
assert.ok(restorePoint.includes("PHASE8_T191_T205_POSTLAUNCH_READINESS"));
assert.ok(projectHygieneTest.includes("_archive"));
assert.ok(feedbackSource.includes("FEEDBACK_CATEGORIES"));

console.log("win push phase8 post-launch tests passed");
