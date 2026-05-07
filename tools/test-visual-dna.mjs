import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function readVisualArtifact(fileName) {
  const paths = [`docs/visual/${fileName}`, `_archive/agent-memory/docs/visual/${fileName}`];
  for (const artifactPath of paths) {
    try {
      return await readFile(artifactPath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  assert.fail(`visual artifact is missing: ${fileName}`);
}

const evidence = await readVisualArtifact("VISUAL_EVIDENCE_2026-05-06.md");
const lazyweb = await readVisualArtifact("LAZYWEB_WORKFLOW_CHECK_2026-05-06.md");
const references = await readVisualArtifact("REFERENCE_SET_2026-05-06.md");
const patterns = await readVisualArtifact("PATTERN_BOUNDARIES_2026-05-06.md");
const pipeline = await readVisualArtifact("ASSET_PIPELINE_2026-05-06.md");
const missing = await readVisualArtifact("MISSING_VISUAL_ELEMENTS_2026-05-06.md");
const globals = await readFile("src/app/globals.css", "utf8");
const game = await readFile("src/components/LiarlineGame.tsx", "utf8");
const ui = await readFile("src/components/ui.tsx", "utf8");
const visualElements = await readFile("src/game/visualElements.ts", "utf8");

for (const required of ["Return of the Obra Dinn", "Her Story", "The Case of the Golden Idol", "L.A. Noire", "anti-pattern"]) {
  assert.ok(evidence.includes(required), `visual evidence missing ${required}`);
}

assert.ok(lazyweb.includes("SKIP") || lazyweb.includes("NOT INSTALLED"), "Lazyweb check must record safe install/use decision");
assert.ok(lazyweb.includes("no secrets") || lazyweb.includes("without secrets"), "Lazyweb check must forbid stored secrets");

for (const screen of ["Briefing", "Suspect card", "Transcript", "Notebook", "Accusation", "Resolution"]) {
  assert.ok(references.includes(screen), `reference set missing ${screen}`);
}

assert.ok(patterns.includes("Inspiration") && patterns.includes("Do not copy"), "pattern boundaries must separate inspiration and forbidden copying");
assert.ok(pipeline.includes("single-asset") && pipeline.includes("reject"), "asset pipeline must include single-asset generation and rejection rules");

for (const element of ["contradiction_flash", "suspicion_state", "persona_shift_state", "final_rating_stamp", "hint_marker"]) {
  assert.ok(missing.includes(element), `missing element list lacks ${element}`);
  assert.ok(visualElements.includes(element), `visualElements contract lacks ${element}`);
}

for (const className of [
  "portrait-anchor",
  "visual-event-rail",
  "contradiction-flash",
  "rating-stamp",
  "hint-marker",
  "evidence-paper-surface",
  "suspicion-signal-card",
  "contradiction-action-card",
  "persona-shift-card",
  "missed-opportunity-card"
]) {
  assert.ok(globals.includes(`.${className}`), `globals missing ${className}`);
}

assert.ok(game.includes("visual-event-rail"), "game UI must render visual event rail");
assert.ok(game.includes("contradiction-flash"), "game UI must render contradiction flash treatment");
assert.ok(game.includes("contradiction-action-card"), "game UI must render contradiction as a large action");
assert.ok(game.includes("collapse-impact-line"), "game UI must render collapse impact line");
assert.ok(game.includes("persona-reaction-line"), "game UI must render persona reaction line");
assert.ok(game.includes("rating-stamp"), "resolution must render rating stamp treatment");
assert.ok(game.includes("missed-opportunity-card"), "resolution must render missed opportunities");
assert.ok(ui.includes("portrait-anchor"), "portrait component styling must be applied");

console.log("visual DNA tests passed");
