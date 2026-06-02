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
  release,
  playstyleGate,
  demoRoute,
  activeTodo
] = await Promise.all([
  text("package.json"),
  text("docs/CONTEST_REQUIREMENTS_2026-05-06.md"),
  text("docs/AI_PROVIDER_STATUS_CURRENT.md"),
  text("docs/SUBMISSION.md"),
  text("docs/RELEASE.md"),
  text("tools/test-playstyles.mjs"),
  text("tools/test-demo-route.mjs"),
  text("docs/MASTER_TODO.md")
]);

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["test:playstyles"], "tsx tools/test-playstyles.mjs");
assert.equal(scripts["test:release-readiness"], "node tools/test-release-readiness.mjs");
assert.equal(scripts["test:production-layout"], "node tools/test-production-layout.mjs");
assert.equal(scripts["test:demo-video-package"], "node tools/test-demo-video-package.mjs");

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
  "Closed scope: T014-T016.",
  "https://status.groq.com/",
  "fully operational",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "30 RPM",
  "429",
  "fallback",
  "No provider switch now"
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

includesAll(release, [
  "Judge readiness",
  "Current risk baseline",
  "npm run build",
  "npm run test:judge-readiness",
  "npm run test:demo-video-package",
  "Consciously excluded future scope",
  "Fallback"
], "release");

includesAll(playstyleGate, [
  "Rushed Player",
  "Careful Player",
  "Mistaken Player",
  "AI suspects can lie, but only evidence can convict"
], "playstyle gate");

includesAll(demoRoute, [
  "first answer",
  "contradiction",
  "Persona shift",
  "resolution"
], "demo route script");

includesAll(activeTodo, [
  "[x] T001",
  "[x] T002",
  "[x] T003",
  "[x] T004",
  "[x] T005",
  "[x] T006",
  "[x] T007",
  "[x] T008",
  "[x] T009",
  "[x] T010",
  "docs/MASTER_TODO.md` становится живым мастер-планом"
], "active master todo closure");

console.log("release readiness checks passed");
