import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  PHASE6_QA_ACCEPTANCE_MATRIX,
  PHASE6_TODO_CLOSURES,
  PHASE6_VISUAL_SYSTEM_RESEARCH,
  PHASE6_VISUAL_SYSTEM_STATUS,
  VISUAL_REGRESSION_PROOF_ARTIFACTS
} from "../src/release/winPushPhase6Qa.ts";
import { SCENARIO_IMAGE_INSERTS } from "../src/game/scenarioVisuals.ts";
import { MOOD_VISUAL_SYSTEM } from "../src/game/moodVisualSystem.ts";
import { BUTTON_ROLE_SYSTEM, MICRO_EVENT_SYSTEM } from "../src/game/interactionVisualSystem.ts";

const expectedTodos = Array.from({ length: 30 }, (_, index) => `T${index + 131}`);
assert.deepEqual(PHASE6_TODO_CLOSURES, expectedTodos, "T131-T160 closure list must be exact and ordered");

const masterTodo = await readFile("docs/MASTER_TODO.md", "utf8");
for (const todoId of expectedTodos) {
  assert.match(masterTodo, new RegExp(`\\[x\\] ${todoId}\\b`), `${todoId} is not closed in MASTER_TODO`);
}

const state = await readFile("docs/STATE.md", "utf8");
assert.ok(
  state.includes("PHASE6_T131_T160_CLOSED") ||
    state.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED"),
  "STATE.md must record Phase 6 closure or a later active closure state"
);

for (const key of ["briefing_tension", "first_ai_hesitation", "contradiction_reveal", "persona_shift", "accusation_risk", "resolution"]) {
  const insert = SCENARIO_IMAGE_INSERTS[key];
  assert.ok(insert, `missing scenario insert ${key}`);
  assert.ok(insert.assetPath.startsWith("/assets/"), `${key} must use shipped release assets`);
  assert.equal(insert.panelScale, "small-gameplay-panel", `${key} must stay a gameplay panel, not gallery art`);
  assert.ok(insert.deductionUse.length > 20, `${key} needs a real deduction purpose`);
}

for (const mood of ["controlled", "nervous", "defensive", "impatient", "shaken", "panicking"]) {
  const visual = MOOD_VISUAL_SYSTEM[mood];
  assert.ok(visual, `missing mood visual ${mood}`);
  assert.ok(visual.className.includes("mood-"), `${mood} must map to a concrete class`);
  assert.ok(visual.noiseBudget !== "high", `${mood} must stay restrained`);
}

for (const role of ["firstQuestion", "send", "notebook", "accuse", "finalSubmit", "restart"]) {
  assert.ok(BUTTON_ROLE_SYSTEM[role], `missing button role ${role}`);
  assert.ok(BUTTON_ROLE_SYSTEM[role].className.includes("role-button-"), `${role} needs a role class`);
}

for (const eventId of ["clueOpened", "contradictionFound", "personaShift", "apSpent", "finalAccusation", "resolutionRating"]) {
  const event = MICRO_EVENT_SYSTEM[eventId];
  assert.ok(event, `missing micro event ${eventId}`);
  assert.ok(event.properties.every((property) => ["opacity", "transform", "box-shadow"].includes(property)), `${eventId} uses unsafe animation properties`);
}

for (const source of ["W3C WCAG 2.2", "MDN prefers-reduced-motion", "web.dev animation performance", "Playwright screenshots", "Next.js Image fill"]) {
  assert.ok(PHASE6_VISUAL_SYSTEM_RESEARCH.sources.some((entry) => entry.source.includes(source)), `research missing ${source}`);
}

for (const phase of ["Briefing", "Interrogation", "Notebook", "Accusation", "Resolution", "Fallback", "Restart"]) {
  const row = PHASE6_QA_ACCEPTANCE_MATRIX.find((item) => item.phase === phase);
  assert.ok(row, `QA matrix missing ${phase}`);
  assert.ok(row.functionalChecks.length >= 2, `${phase} functional checks too thin`);
  assert.ok(row.visualChecks.length >= 2, `${phase} visual checks too thin`);
  assert.ok(row.proofCommands.length >= 1, `${phase} proof command missing`);
}

assert.ok(PHASE6_VISUAL_SYSTEM_STATUS.visualEffectsBudget.maxAnimatedProperties.length <= 3, "visual budget must be small");
assert.ok(PHASE6_VISUAL_SYSTEM_STATUS.visualEffectsBudget.reducedMotionRequired, "reduced-motion support is required");
assert.ok(PHASE6_VISUAL_SYSTEM_STATUS.anchor.restorePointName === "PHASE6_T131_T160_QA_VISUAL_SYSTEM", "restore point name mismatch");

for (const proof of VISUAL_REGRESSION_PROOF_ARTIFACTS) {
  const fileStat = await stat(proof.path);
  assert.ok(fileStat.size > 1000, `${proof.path} is empty or broken`);
  assert.ok(proof.path.startsWith("_archive/release-screenshots/phase6-2026-05-09/"), `${proof.path} must stay out of release bundle`);
}

const globals = await readFile("src/app/globals.css", "utf8");
for (const className of [
  "scenario-insert-panel",
  "mood-controlled",
  "mood-nervous",
  "mood-defensive",
  "mood-impatient",
  "mood-shaken",
  "mood-panicking",
  "role-button-first-question",
  "role-button-send",
  "role-button-notebook",
  "role-button-accuse",
  "role-button-final-submit",
  "role-button-restart",
  "micro-clue-opened",
  "micro-ap-spent"
]) {
  assert.ok(globals.includes(`.${className}`), `globals missing ${className}`);
}

console.log(JSON.stringify({
  ok: true,
  phase: "T131-T160",
  scenarioInserts: Object.keys(SCENARIO_IMAGE_INSERTS).length,
  moods: Object.keys(MOOD_VISUAL_SYSTEM).length,
  qaRows: PHASE6_QA_ACCEPTANCE_MATRIX.length,
  proofArtifacts: VISUAL_REGRESSION_PROOF_ARTIFACTS.length
}, null, 2));
