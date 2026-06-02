import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  DESIGN_HANDOFF_REPOS,
  LOCALE_VISUAL_ACCEPTANCE,
  PHASE5_ANCHOR_REVIEW,
  PHASE5_ASSET_ACCEPTANCE,
  PHASE5_SCREEN_VISUAL_CONTRACT,
  PHASE5_TODO_CLOSURES,
  PHASE5_VISUAL_RESEARCH
} from "../src/release/winPushPhase5VisualDna.ts";
import { ASSET_BRIEF_IDS, ASSET_BRIEFS } from "../src/game/assetBriefs.ts";
import { ASSET_CURATION } from "../src/game/assetCuration.ts";
import { ICON_SYSTEM } from "../src/game/iconSystem.ts";

const [
  masterTodo,
  stateMarkdown,
  store,
  game,
  notebook,
  globals,
  dictionaries,
  design,
  phase5Findings,
  phase5AssetBriefs,
  evidenceRaw
] = await Promise.all([
  readFile("docs/MASTER_TODO.md", "utf8"),
  readFile("docs/STATE.md", "utf8"),
  readFile("src/state/GameStore.tsx", "utf8"),
  readFile("src/components/LiarlineGame.tsx", "utf8"),
  readFile("src/components/NotebookDrawer.tsx", "utf8"),
  readFile("src/app/globals.css", "utf8"),
  readFile("src/i18n/dictionaries.ts", "utf8"),
  readFile("DESIGN.md", "utf8"),
  readFile("docs/visual/PHASE5_VISUAL_FINDINGS_2026-05-09.md", "utf8"),
  readFile("docs/visual/ASSET_BRIEFS_2026-05-09.md", "utf8"),
  readFile("_archive/agent-memory/design-evidence/github-design-evidence-2026-05-09.json", "utf8")
]);

assert.equal(PHASE5_TODO_CLOSURES.length, 30, "Phase 5 must close exactly 30 TODO items");
for (const todoId of PHASE5_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} is not checked in MASTER_TODO`);
}
assert.ok(
  stateMarkdown.includes("PHASE5_T101_T130_CLOSED") ||
    stateMarkdown.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED"),
  "STATE must record Phase 5 closure or a later active closure state"
);

for (const key of LOCALE_VISUAL_ACCEPTANCE.storageKeys) {
  assert.ok(store.includes(key), `GameStore missing storage key ${key}`);
}
assert.ok(store.includes("setLocaleState(nextLocale)") && !store.includes("setState((current) => localizeGameState"), "locale switch must not mutate saved game state");
assert.ok(store.includes("currentRequestAbortRef.current?.abort()"), "restart/pending request abort guard missing");

for (const phrase of [
  "long pause",
  "guarded mode",
  "Guarded answer",
  "The room stays fair",
  "Осторожная пауза",
  "Дело продолжается честно"
]) {
  assert.ok(dictionaries.includes(phrase), `gameplay copy missing ${phrase}`);
}

for (const marker of PHASE5_SCREEN_VISUAL_CONTRACT.requiredClasses) {
  assert.ok(game.includes(marker) || notebook.includes(marker) || globals.includes(`.${marker}`), `visual marker missing ${marker}`);
}

for (const marker of [
  "role=\"status\"",
  "aria-live=\"polite\"",
  "aria-live=\"assertive\"",
  "aria-modal=\"true\"",
  "aria-pressed",
  "aria-label"
]) {
  assert.ok(`${game}\n${notebook}`.includes(marker), `accessibility marker missing ${marker}`);
}
for (const cssMarker of [":focus-visible", "prefers-reduced-motion", "prefers-contrast", "overflow-wrap: anywhere", "min-h-11"]) {
  assert.ok(`${globals}\n${game}`.includes(cssMarker), `accessibility/mobile CSS marker missing ${cssMarker}`);
}

for (const source of PHASE5_VISUAL_RESEARCH.sources) {
  assert.ok(source.appliedRule.length > 20, `${source.id} applied rule too thin`);
}
for (const repo of DESIGN_HANDOFF_REPOS) {
  assert.ok(phase5Findings.includes(repo) || evidenceRaw.includes(repo), `design repo evidence missing ${repo}`);
}
assert.ok(phase5Findings.includes("Patterns To Use") && phase5Findings.includes("Patterns To Reject"), "visual findings must separate usable patterns and anti-patterns");
assert.ok(design.includes("Production rule") && design.includes("Implementation markers"), "DESIGN.md must be an actionable production visual contract");
assert.ok(design.includes("Phase 5 current evidence"), "DESIGN.md must point to current Phase 5 evidence");

for (const assetId of ASSET_BRIEF_IDS) {
  const brief = ASSET_BRIEFS[assetId];
  const curation = ASSET_CURATION[assetId];
  assert.equal(curation.status, "approved", `${String(assetId)} must have current curation`);
  assert.equal(curation.path, brief.path, `${String(assetId)} curation path mismatch`);
  for (const check of Object.values(curation.checks)) assert.equal(check, true, `${String(assetId)} curation check missing`);
  assert.ok(brief.styleBrief.length > 40, `${String(assetId)} brief is too thin`);
  assert.ok(brief.rejectionRules.length >= 1, `${String(assetId)} rejection rules missing`);
  await stat(`public${brief.path}`);
}
for (const check of PHASE5_ASSET_ACCEPTANCE.requiredAssetChecks) {
  assert.ok(phase5AssetBriefs.toLowerCase().includes(check.split(" ")[0]), `asset guideline missing ${check}`);
}
assert.equal(ICON_SYSTEM.family, "lucide-react");
assert.ok(ICON_SYSTEM.rules.some((rule) => rule.includes("44px")), "icon hit target rule missing");

const evidence = JSON.parse(evidenceRaw);
assert.equal(evidence.asOfDate, "2026-05-09");
assert.equal(evidence.source, "GitHub REST API");
assert.ok(evidence.secretHandling.includes("No token value"), "GitHub evidence must not store tokens");
assert.equal(evidence.repos.length, DESIGN_HANDOFF_REPOS.length);

assert.equal(PHASE5_ANCHOR_REVIEW.signal, "Anchor OK. Продолжаем.");
assert.equal(PHASE5_ANCHOR_REVIEW.driftFound.length, 0);
assert.ok(PHASE5_ANCHOR_REVIEW.restorePointName.includes("PHASE5_T101_T130"));
await stat("docs/RESTORE_POINT_2026-05-09_PHASE5.md");

console.log(
  JSON.stringify(
    {
      ok: true,
      phase: 5,
      closedTodos: PHASE5_TODO_CLOSURES,
      visualMarkers: PHASE5_SCREEN_VISUAL_CONTRACT.requiredClasses.length,
      assetBriefs: ASSET_BRIEF_IDS.length,
      designRepos: evidence.repos.length
    },
    null,
    2
  )
);
