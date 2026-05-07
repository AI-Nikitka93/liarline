import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function text(path) {
  return readFile(path, "utf8");
}

function includesAll(source, expected, label) {
  for (const fragment of expected) {
    assert.ok(source.includes(fragment), `${label} missing: ${fragment}`);
  }
}

const [
  packageJson,
  contest,
  provider,
  submission,
  acceptance,
  playtest,
  demoRoute,
  todo
] = await Promise.all([
  text("package.json"),
  text("docs/CONTEST_REQUIREMENTS_2026-05-06.md"),
  text("docs/AI_PROVIDER_STATUS_2026-05-06.md"),
  text("docs/SUBMISSION.md"),
  text("_archive/agent-memory/docs/RELEASE_ACCEPTANCE_CHECKLIST_2026-05-06.md"),
  text("_archive/agent-memory/docs/PLAYTEST_STYLES_2026-05-06.md"),
  text("tools/test-demo-route.mjs"),
  text("_archive/agent-memory/docs/MASTER_TODO.md")
]);

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["test:playstyles"], "tsx tools/test-playstyles.mjs");
assert.equal(scripts["test:release-readiness"], "node tools/test-release-readiness.mjs");

includesAll(contest, [
  "Closed scope: T013, T155.",
  "https://ai-game-week-29908.devpost.com/",
  "https://ai-game-week-29908.devpost.com/rules",
  "A playable game link",
  "A demo video (1-3 minutes)",
  "A GitHub repo with code",
  "A short description explaining AI tools used",
  "mobile browser"
], "contest requirements");

includesAll(provider, [
  "Closed scope: T014, T156.",
  "https://status.groq.com/",
  "Fully operational",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "30 RPM",
  "429",
  "fallback"
], "provider status");

includesAll(submission, [
  "The AI is an actor, not the judge.",
  "one playable case",
  "The local game engine decides truth, evidence unlocks, suspicion changes, accusation outcome, rating, and resolution.",
  "first AI wow",
  "contradiction reveal",
  "persona shift",
  "collapse",
  "accusation",
  "resolution",
  "Do not claim yet"
], "submission");

includesAll(acceptance, [
  "Closed scope: T152.",
  "Game release-pass",
  "AI release-pass",
  "UI release-pass",
  "Mobile release-pass",
  "Localization release-pass",
  "Fallback release-pass",
  "No-go blockers",
  "npm run build"
], "acceptance");

includesAll(playtest, [
  "Closed scope: T151.",
  "Rushed Player",
  "Careful Player",
  "Mistaken Player",
  "AI suspects can lie, but only evidence can convict"
], "playtest");

includesAll(demoRoute, [
  "first answer",
  "contradiction",
  "Persona shift",
  "resolution"
], "demo route script");

includesAll(todo, [
  "[x] T151",
  "[x] T152",
  "[x] T153",
  "[x] T154",
  "[x] T155",
  "[x] T156",
  "[x] T157",
  "[x] T158",
  "[x] T159",
  "[x] T160"
], "master todo closure");

console.log("release readiness checks passed");
