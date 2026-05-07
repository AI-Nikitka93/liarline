import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CHANGELOG_DISCIPLINE,
  FAST_DECAY_KNOWLEDGE,
  FIRST_MINUTE_HOOK_CHECKS,
  FRESHNESS_REVIEW_CYCLE,
  HOTFIX_DECISION_MATRIX,
  LAUNCH_REHEARSAL,
  PLAYTHROUGH_OBSERVATIONS,
  RELEASE_PARITY_CHECKS
} from "../src/release/releaseOps.ts";
import { phase9AnchorReview, phase9EndReview, releaseGoNoGoChecklist } from "../src/release/releaseInfo.ts";

const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const readme = await readFile("README.md", "utf8");
const masterTodo = await readFile("_archive/agent-memory/docs/MASTER_TODO.md", "utf8");

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

assert.ok(releaseGoNoGoChecklist.requiredChecks.includes("npm run test:release-postlaunch"));
assert.equal(phase9AnchorReview.status, "Anchor OK");
assert.equal(phase9AnchorReview.noDrift, true);
assert.equal(phase9EndReview.phase, 9);
assert.equal(phase9EndReview.status, "closed");

for (const fragment of [
  "Hotfix criteria",
  "Freshness review cycle",
  "Fastest-aging external knowledge",
  "Post-release changelog discipline",
  "Release parity checks",
  "Launch rehearsal",
  "First playthrough observations",
  "First-minute hook check"
]) {
  assert.ok(releaseDoc.includes(fragment), `docs/RELEASE.md missing ${fragment}`);
}

assert.ok(readme.includes("npm run test:release-postlaunch"), "README missing post-launch check");

for (const todoId of ["T191", "T192", "T193", "T194", "T195", "T196", "T197", "T198", "T199", "T200"]) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be closed`);
}

console.log("release postlaunch passed");
