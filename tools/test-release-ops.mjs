import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { OUTCOME_EVENT_NAMES } from "../src/release/outcomeMonitor.ts";
import {
  createFeedbackIntake,
  FEEDBACK_CATEGORIES,
  KNOWN_LIMITATIONS,
  PRODUCT_METRICS,
  QUALITATIVE_FEEDBACK_POINTS,
  RECOVERY_PLAYBOOKS,
  triageFeedback
} from "../src/release/releaseOps.ts";

const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const masterTodo = await readFile("_archive/agent-memory/docs/MASTER_TODO.md", "utf8");

const requiredMetrics = ["start_reached", "first_ai_answer", "contradiction_reached", "accusation_submitted", "resolution_reached"];
for (const eventName of requiredMetrics) {
  assert.ok(OUTCOME_EVENT_NAMES.includes(eventName), `outcome monitor missing ${eventName}`);
  assert.ok(PRODUCT_METRICS.some((metric) => metric.eventName === eventName), `product metrics missing ${eventName}`);
}

for (const pointId of [
  "confused_first_screen",
  "weak_ai_answer",
  "missed_contradiction",
  "unfair_accusation",
  "unreadable_notebook"
]) {
  assert.ok(QUALITATIVE_FEEDBACK_POINTS.some((point) => point.pointId === pointId), `missing feedback point ${pointId}`);
}

for (const playbookId of ["ai_access_down", "corrupt_save", "wrong_release_link"]) {
  const playbook = RECOVERY_PLAYBOOKS[playbookId];
  assert.ok(playbook, `missing playbook ${playbookId}`);
  assert.ok(playbook.userSafeAction.length > 0, `${playbookId} missing user-safe action`);
  assert.ok(playbook.operatorAction.length > 0, `${playbookId} missing operator action`);
  assert.ok(playbook.verificationCommand.length > 0, `${playbookId} missing verification command`);
}

assert.ok(KNOWN_LIMITATIONS.some((item) => item.limitationId === "one_case"));
assert.ok(KNOWN_LIMITATIONS.some((item) => item.limitationId === "simplified_proof_check"));
assert.ok(KNOWN_LIMITATIONS.some((item) => item.limitationId === "weak_strong_confidence"));
assert.ok(KNOWN_LIMITATIONS.some((item) => item.limitationId === "one_hint_button"));
assert.ok(KNOWN_LIMITATIONS.every((item) => item.publicCopy.length > 0 && item.releaseImpact !== "blocker"));

const storage = new Map();
const intake = createFeedbackIntake({
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key)
});

intake.record({
  category: "gameplay_confusion",
  pointId: "confused_first_screen",
  severity: "medium",
  note: "I did not know what to press first. <script>alert(1)</script>"
});
intake.record({
  category: "ai_quality",
  pointId: "weak_ai_answer",
  severity: "high",
  note: "AI sounded generic and did not feel like a nervous witness."
});

const feedback = intake.read();
assert.equal(feedback.length, 2);
assert.ok(feedback[0].note.includes("I did not know what to press first."));
assert.ok(!feedback[0].note.includes("<script>"));
assert.ok(feedback.every((item) => item.releaseVersion === "0.1.0"));

assert.equal(triageFeedback({ note: "keyboard covers the bottom buttons on mobile", category: "gameplay_confusion" }).category, "mobile_bugs");
assert.equal(triageFeedback({ note: "Russian copy mixed with English labels", category: "gameplay_confusion" }).category, "localization");
assert.equal(triageFeedback({ note: "the first suspect answer felt generic", category: "gameplay_confusion" }).category, "ai_quality");
assert.equal(triageFeedback({ note: "final accusation felt unfair", category: "ai_quality" }).category, "gameplay_confusion");
assert.equal(triageFeedback({ note: "the page felt slow", category: "visual_polish" }).category, "performance");

for (const fragment of [
  "Product metrics",
  "Qualitative feedback points",
  "Recovery playbooks",
  "Known limitations",
  "Feedback intake",
  "Triage procedure",
  "AI access falls during demo",
  "Saved state breaks the game",
  "Release link shows the wrong version"
]) {
  assert.ok(releaseDoc.includes(fragment), `docs/RELEASE.md missing ${fragment}`);
}

for (const todoId of ["T181", "T182", "T183", "T184", "T185", "T186", "T187", "T188", "T189", "T190"]) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be closed`);
}

console.log("release ops passed");
