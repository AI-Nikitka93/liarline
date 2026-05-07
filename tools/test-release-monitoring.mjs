import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createOutcomeMonitor,
  OUTCOME_EVENT_NAMES,
  sanitizeOutcomeEvents
} from "../src/release/outcomeMonitor.ts";

const storage = new Map();
const gameStoreSource = await readFile("src/state/GameStore.tsx", "utf8");
const monitor = createOutcomeMonitor({
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key)
});

assert.ok(OUTCOME_EVENT_NAMES.includes("ai_fail"));
assert.ok(OUTCOME_EVENT_NAMES.includes("fallback_used"));
assert.ok(OUTCOME_EVENT_NAMES.includes("stuck"));
assert.ok(OUTCOME_EVENT_NAMES.includes("reset"));
assert.ok(OUTCOME_EVENT_NAMES.includes("accusation_fail"));
assert.ok(gameStoreSource.includes("getBrowserOutcomeMonitor"), "GameStore must integrate release outcome monitor");
assert.ok(gameStoreSource.includes('recordOutcome("fallback_used"'), "fallback outcome must be recorded");
assert.ok(gameStoreSource.includes('recordOutcome("stuck"'), "stuck outcome must be recorded");
assert.ok(gameStoreSource.includes('recordOutcome("accusation_fail"'), "accusation failure must be recorded");

monitor.record("start_reached", { phase: "briefing", locale: "ru" });
monitor.record("first_ai_answer", { source: "groq", latencyMs: 451 });
monitor.record("fallback_used", { reason: "network_error" });
monitor.record("stuck", { phase: "interrogation", actionPointsRemaining: 0 });
monitor.record("reset", { phase: "interrogation" });
monitor.record("accusation_fail", { accusedSuspectId: "suspect_mara" });
monitor.record("resolution_reached", { outcome: "loss" });

const events = monitor.read();
assert.equal(events.length, 7);
assert.deepEqual(events.map((event) => event.name), [
  "start_reached",
  "first_ai_answer",
  "fallback_used",
  "stuck",
  "reset",
  "accusation_fail",
  "resolution_reached"
]);
assert.ok(events.every((event) => typeof event.createdAt === "string" && event.createdAt.includes("T")));
assert.ok(events.every((event) => event.releaseVersion === "0.1.0"));

const sanitized = sanitizeOutcomeEvents([
  ...events,
  {
    name: "unknown",
    createdAt: "bad",
    releaseVersion: "x",
    details: { secret: "should not survive" }
  }
]);
assert.equal(sanitized.length, 7);

monitor.clear();
assert.deepEqual(monitor.read(), []);

console.log("release monitoring passed");
