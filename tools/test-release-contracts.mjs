import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ASSETS } from "../src/game/assets.ts";
import {
  anchorReview,
  phaseEndReview,
  phase9AnchorReview,
  phase9EndReview,
  releaseGoNoGoChecklist,
  releaseVersionNotes
} from "../src/release/releaseInfo.ts";
import { assetProvenance, referenceMaterialProvenance } from "../src/release/assetProvenance.ts";

const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const masterTodo = await readFile("_archive/agent-memory/docs/MASTER_TODO.md", "utf8");

const assetPaths = [
  ASSETS.caseHero,
  ASSETS.interrogationBackground,
  ASSETS.evidencePaper,
  ...Object.values(ASSETS.suspectPortraits)
];

for (const assetPath of assetPaths) {
  const record = assetProvenance.find((entry) => entry.releasePath === assetPath);
  assert.ok(record, `missing provenance for ${assetPath}`);
  assert.equal(record.licenseStatus, "project-owned generated asset");
  assert.equal(record.approvedForRelease, true);
  assert.ok(record.audit.includes("no visible watermark"), `${assetPath} missing watermark audit`);
}

assert.ok(referenceMaterialProvenance.length >= 3, "reference material provenance must list reference-only sources");
assert.ok(referenceMaterialProvenance.every((entry) => entry.usage === "reference only, no copied asset or layout"));

assert.equal(releaseVersionNotes.version, "0.1.0");
assert.ok(releaseVersionNotes.includedMechanics.includes("Interrogation"));
assert.ok(releaseVersionNotes.includedMechanics.includes("Resolution"));
assert.ok(releaseVersionNotes.excludedFutureFeatures.includes("three-case season"));
assert.ok(releaseVersionNotes.excludedFutureFeatures.includes("full trial system"));

assert.equal(releaseGoNoGoChecklist.status, "GO");
assert.ok(releaseGoNoGoChecklist.requiredChecks.includes("npm run build"));
assert.ok(releaseGoNoGoChecklist.requiredChecks.includes("npm run test:release-playthrough"));
assert.ok(releaseGoNoGoChecklist.requiredChecks.includes("npm run test:release-postlaunch"));
assert.ok(releaseGoNoGoChecklist.manualRollback.includes("Restart"));
assert.ok(releaseGoNoGoChecklist.blockers.every((blocker) => blocker.status !== "open"));

assert.equal(anchorReview.status, "Anchor OK");
assert.ok(anchorReview.lastOrdinaryItems.includes("T171"));
assert.ok(anchorReview.lastOrdinaryItems.includes("T180"));
assert.equal(phaseEndReview.phase, 8);
assert.equal(phaseEndReview.status, "closed");
assert.equal(phase9AnchorReview.status, "Anchor OK");
assert.ok(phase9AnchorReview.lastOrdinaryItems.includes("T196"));
assert.equal(phase9EndReview.phase, 9);
assert.equal(phase9EndReview.status, "closed");

for (const fragment of [
  "Release 0.1.0",
  "Included mechanics",
  "Consciously excluded future scope",
  "Go / No-Go",
  "Manual rollback",
  "Asset provenance",
  "Outcome monitoring"
]) {
  assert.ok(releaseDoc.includes(fragment), `docs/RELEASE.md missing ${fragment}`);
}

for (const todoId of ["T171", "T172", "T173", "T174", "T175", "T176"]) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be closed`);
}

console.log("release contracts passed");
