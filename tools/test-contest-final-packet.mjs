import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packet = await readFile("docs/JUDGE_FINAL_PACKET_2026-05-08.md", "utf8");
const submissionPackage = await readFile("docs/SUBMISSION_PACKAGE.md", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));

for (const fragment of [
  "FINAL 100 GATE",
  "Rule-to-proof map",
  "Devpost paste fields",
  "60-second judge path",
  "Video recording checklist",
  "External blockers",
  "Do not claim"
]) {
  assert.ok(packet.includes(fragment), `judge final packet missing ${fragment}`);
}

for (const command of [
  "npm run build",
  "npm run test:npc-turn",
  "npm run test:demo-route",
  "npm run test:demo-video-package",
  "npm run test:release-browser",
  "npm run test:production-layout",
  "npm run test:judge-readiness"
]) {
  assert.ok(packet.includes(command), `judge final packet missing command ${command}`);
}

const doNotClaimSection = packet.slice(packet.indexOf("## Do not claim"));
for (const forbidden of ["Three-case season", "Unlimited case generation", "Voice interrogation", "Video interrogation", "Multiplayer"]) {
  assert.ok(doNotClaimSection.includes(forbidden), `judge final packet must explicitly reject ${forbidden}`);
}

for (const overclaim of ["three-case season is playable", "supports unlimited case generation", "supports multiplayer"]) {
  assert.ok(!packet.toLowerCase().includes(overclaim), `judge final packet overclaims ${overclaim}`);
}

assert.ok(submissionPackage.includes("docs/JUDGE_FINAL_PACKET_2026-05-08.md"), "submission package must point to final packet");
assert.equal(packageJson.scripts["test:contest-final-packet"], "node tools/test-contest-final-packet.mjs");

console.log("contest final packet tests passed");
