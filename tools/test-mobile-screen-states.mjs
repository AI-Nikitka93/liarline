import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const game = await readFile("src/components/LiarlineGame.tsx", "utf8");
const notebook = await readFile("src/components/NotebookDrawer.tsx", "utf8");
const globals = await readFile("src/app/globals.css", "utf8");
const dictionaries = await readFile("src/i18n/dictionaries.ts", "utf8");
const engine = await readFile("src/game/gameEngine.ts", "utf8");

const screenStateMarkers = [
  "empty-chat-state",
  "thinking-scan",
  "role=\"alert\"",
  "aiSourceFallback",
  "degradedAiTitle",
  "contradiction-action-card",
  "contradiction-reveal-stage",
  "collapse-impact-line",
  "persona-shift-card",
  "persona-reaction-line",
  "accusation-risk-screen",
  "selected-evidence-counter",
  "final-risk-warning",
  "resolution-complete-screen",
  "truth-summary-card",
  "missed-opportunity-card",
  "restart-case-button"
];

for (const marker of screenStateMarkers) {
  assert.ok(game.includes(marker), `game screen state missing ${marker}`);
}

for (const marker of ["compact-evidence-surface", "suspicion-signal-board", "suspicion-signal-card", "role=\"dialog\""]) {
  assert.ok(notebook.includes(marker), `notebook state missing ${marker}`);
}

for (const marker of [":focus-visible", "prefers-reduced-motion", "prefers-contrast", "overflow-wrap: anywhere"]) {
  assert.ok(globals.includes(marker), `accessibility CSS missing ${marker}`);
}

for (const outcome of ["perfect_win", "partial_win", "loss"]) {
  assert.ok(dictionaries.includes(outcome), `localized outcome missing ${outcome}`);
  assert.ok(engine.includes(`"${outcome}"`), `engine outcome missing ${outcome}`);
}

for (const requiredCopy of ["missedOpportunities", "proofReady", "proofIncomplete", "signalUnresolved", "signalResolved"]) {
  assert.ok(dictionaries.includes(requiredCopy), `dictionary missing ${requiredCopy}`);
}

console.log("mobile screen state QA passed");
