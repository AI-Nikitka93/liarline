import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CHANGELOG_DISCIPLINE,
  FAST_DECAY_KNOWLEDGE,
  FIRST_MINUTE_HOOK_CHECKS,
  FIRST_FOLLOW_UP_BACKLOG,
  FULL_GAME_DIRECTION_DECISION,
  FUTURE_CASE_TEMPLATE,
  MODEL_PLATFORM_UPDATE_RULES,
  FRESHNESS_REVIEW_CYCLE,
  HOTFIX_DECISION_MATRIX,
  LAUNCH_REHEARSAL,
  NO_DRIFT_CHECKLIST,
  PHASE10_VALIDATION_CHECKS,
  PLAYTHROUGH_OBSERVATIONS,
  POST_FOLLOW_UP_HYGIENE_RULES,
  PROJECT_MEMORY_UPDATE_CONTRACT,
  RELEASE_PARITY_CHECKS,
  SECOND_CASE_READY_CRITERIA,
  VISUAL_ASSET_REVIEW_RULES,
  DESIGN_HANDOFF_RETROSPECTIVE
} from "../src/release/releaseOps.ts";
import {
  phase10AnchorReview,
  phase10EndReview,
  phase9AnchorReview,
  phase9EndReview,
  releaseGoNoGoChecklist
} from "../src/release/releaseInfo.ts";

const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const readme = await readFile("README.md", "utf8");
const activeMasterTodo = await readFile("docs/MASTER_TODO.md", "utf8");

for (const bucket of ["fix_now", "follow_up", "future_scope"]) {
  assert.ok(HOTFIX_DECISION_MATRIX.some((item) => item.bucket === bucket), `hotfix matrix missing ${bucket}`);
}

for (const itemId of ["freshness_ai_access", "freshness_contest_rules", "freshness_dependency_risk", "freshness_browser_behavior"]) {
  const item = FRESHNESS_REVIEW_CYCLE.find((entry) => entry.itemId === itemId);
  assert.ok(item, `freshness cycle missing ${itemId}`);
  assert.ok(item.owner.length > 0, `${itemId} missing owner`);
  assert.ok(item.sourceOfTruth.length > 0, `${itemId} missing source of truth`);
  assert.ok(FAST_DECAY_KNOWLEDGE.some((entry) => entry.itemId === itemId), `fast-decay list missing ${itemId}`);
}

for (const requiredField of ["what_changed", "why_changed", "player_impact", "verification", "no_drift_check"]) {
  assert.ok(
    CHANGELOG_DISCIPLINE.some((entry) => entry.requiredField === requiredField),
    `changelog discipline missing ${requiredField}`
  );
}

for (const surface of ["demo_route", "screenshots", "readme", "submission_copy"]) {
  assert.ok(RELEASE_PARITY_CHECKS.some((entry) => entry.surface === surface), `parity check missing ${surface}`);
}

for (const stepId of [
  "rehearsal_open_playable_link",
  "rehearsal_demo_route",
  "rehearsal_video_capture",
  "rehearsal_fallback_story",
  "rehearsal_no_go_blockers"
]) {
  const step = LAUNCH_REHEARSAL.find((entry) => entry.stepId === stepId);
  assert.ok(step, `launch rehearsal missing ${stepId}`);
  assert.ok(step.passCondition.length > 0, `${stepId} missing pass condition`);
  assert.ok(step.noGoIf.length > 0, `${stepId} missing no-go condition`);
}

for (const impact of ["hook", "stuck_risk", "interest_drop", "ai_wow"]) {
  assert.ok(PLAYTHROUGH_OBSERVATIONS.some((entry) => entry.impact === impact), `observation missing ${impact}`);
}

for (const checkId of ["hook_suspect_face", "hook_first_question", "hook_first_ai_answer"]) {
  assert.ok(FIRST_MINUTE_HOOK_CHECKS.some((entry) => entry.checkId === checkId), `first-minute hook missing ${checkId}`);
}

for (const validationId of [
  "validation_guaranteed_contradiction",
  "validation_persona_shift",
  "validation_collapse_moment",
  "validation_weak_strong_confidence",
  "validation_hint_depth",
  "validation_notebook_load",
  "validation_resolution_rating"
]) {
  const validation = PHASE10_VALIDATION_CHECKS.find((entry) => entry.validationId === validationId);
  assert.ok(validation, `phase 10 validation missing ${validationId}`);
  assert.ok(validation.finding.length > 0, `${validationId} missing finding`);
  assert.ok(validation.nextAction.length > 0, `${validationId} missing next action`);
}

assert.ok(
  FIRST_FOLLOW_UP_BACKLOG.every((item) => item.coreValueImpact.length > 0 && item.notIncludedReason.length > 0),
  "follow-up backlog items must explain core value impact and non-inclusion reason"
);
assert.ok(
  FIRST_FOLLOW_UP_BACKLOG.every((item) => item.scope !== "future_season"),
  "first follow-up backlog must not contain season expansion work"
);
assert.ok(
  SECOND_CASE_READY_CRITERIA.some((item) => item.criterionId === "second_case_new_deduction_tool"),
  "second-case criteria must require a new deduction tool"
);
assert.ok(FUTURE_CASE_TEMPLATE.requiredBeats.includes("false_certainty"));
assert.ok(FUTURE_CASE_TEMPLATE.requiredBeats.includes("resolution_rating"));
assert.ok(MODEL_PLATFORM_UPDATE_RULES.every((item) => item.verificationAction.length > 0));
assert.ok(VISUAL_ASSET_REVIEW_RULES.every((item) => item.rejectIf.length > 0));
assert.ok(DESIGN_HANDOFF_RETROSPECTIVE.helped.length >= 3);
assert.ok(DESIGN_HANDOFF_RETROSPECTIVE.needsClarification.length >= 1);
assert.ok(PROJECT_MEMORY_UPDATE_CONTRACT.confirmed.length >= 3);
assert.ok(PROJECT_MEMORY_UPDATE_CONTRACT.doNotReopen.length >= 3);
assert.ok(NO_DRIFT_CHECKLIST.every((item) => item.acceptance.includes("evidence convicts")));
assert.equal(FULL_GAME_DIRECTION_DECISION.decision, "polish_first_case_further");
assert.ok(FULL_GAME_DIRECTION_DECISION.rejectedDirections.some((item) => item.direction === "add_second_case_now"));
assert.ok(POST_FOLLOW_UP_HYGIENE_RULES.length >= 4, "post-follow-up hygiene needs build/docs/archive checks");

assert.ok(releaseGoNoGoChecklist.requiredChecks.includes("npm run test:release-postlaunch"));
assert.equal(phase9AnchorReview.status, "Anchor OK");
assert.equal(phase9AnchorReview.noDrift, true);
assert.equal(phase9EndReview.phase, 9);
assert.equal(phase9EndReview.status, "closed");
assert.equal(phase10AnchorReview.status, "Anchor OK");
assert.equal(phase10AnchorReview.noDrift, true);
assert.equal(phase10EndReview.phase, 10);
assert.equal(phase10EndReview.status, "closed");

for (const fragment of [
  "Hotfix criteria",
  "Freshness review cycle",
  "Fastest-aging external knowledge",
  "Post-release changelog discipline",
  "Release parity checks",
  "Launch rehearsal",
  "First playthrough observations",
  "First-minute hook check",
  "Phase 10 validation checks",
  "First follow-up patch backlog",
  "Second-case readiness criteria",
  "Post-follow-up hygiene",
  "Full-game direction decision"
]) {
  assert.ok(releaseDoc.includes(fragment), `docs/RELEASE.md missing ${fragment}`);
}

assert.ok(readme.includes("npm run test:release-postlaunch"), "README missing post-launch check");

assert.ok(activeMasterTodo.includes("[x] T010"), "active IDEA ANCHOR guardrail task must be closed");
assert.ok(activeMasterTodo.includes("do not drift into"), "active master TODO must preserve no-drift guardrails");
assert.ok(activeMasterTodo.includes("total ordinary tasks: 188"), "active master TODO must preserve coverage count");

console.log("release postlaunch passed");
