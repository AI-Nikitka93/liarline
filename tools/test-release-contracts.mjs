import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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

const liveVoiceScript = await readFile("tools/test-live-suspect-voices.mjs", "utf8");
const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const activeMasterTodo = await readFile("docs/MASTER_TODO.md", "utf8");

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

for (const todoId of ["T001", "T002", "T003", "T004", "T005", "T006", "T007", "T008", "T009", "T010"]) {
  assert.ok(activeMasterTodo.includes(`[x] ${todoId}`), `${todoId} must be closed in the active win-push ledger`);
}
assert.ok(activeMasterTodo.includes("total ordinary tasks: 188"), "active MASTER TODO must preserve coverage count");
assert.ok(liveVoiceScript.includes("AI_SUSPECT_VOICE_RUN_CURRENT.md"), "live voice run must write current evidence");
assert.ok(!liveVoiceScript.includes("AI_SUSPECT_VOICE_RUN_2026-05-06.md"), "live voice run must not keep stale dated evidence path");
assert.equal(existsSync("docs/AI_SUSPECT_VOICE_RUN_2026-05-06.md"), false, "stale dated live voice evidence must be removed");
assert.equal(existsSync("docs/AI_SUSPECT_VOICE_RUN_CURRENT.md"), true, "current live voice evidence must exist");

console.log("release contracts passed");
