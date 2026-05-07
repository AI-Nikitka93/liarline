import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";

function readJson(path) {
  return JSON.parse(execFileSync("node", ["-e", `process.stdout.write(JSON.stringify(require(${JSON.stringify(`./${path}`)})))`], {
    encoding: "utf8"
  }));
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function looksLikeUrl(value) {
  return /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(value);
}

function looksLikeVideoUrl(value) {
  return /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|loom\.com|drive\.google\.com)\/[^\s]+$/i.test(value);
}

function getEnvUrl(name) {
  const value = process.env[name]?.trim() || "";
  return value;
}

const packageJson = readJson("package.json");
const scripts = packageJson.scripts || {};
const submissionPackage = await readFile("docs/SUBMISSION_PACKAGE.md", "utf8");
const submission = await readFile("docs/SUBMISSION.md", "utf8");
const readme = await readFile("README.md", "utf8");
const release = await readFile("docs/RELEASE.md", "utf8");
const state = await readFile("docs/STATE.md", "utf8");
const playwrightConfig = await readFile("playwright.config.ts", "utf8");

assert.equal(scripts["test:judge-readiness"], "node tools/test-judge-readiness.mjs");
assert.ok(scripts["test:release-browser"], "release browser gate must be scriptable");
assert.ok(scripts["test:npc-turn"], "NPC-turn gate must be scriptable");

assert.equal(git(["rev-parse", "--is-inside-work-tree"]), "true", "project must be a git repository before GitHub submission");
const ignoredEnv = git(["check-ignore", ".env.local"]);
assert.equal(ignoredEnv, ".env.local", ".env.local must stay ignored");

for (const path of ["README.md", "docs/SUBMISSION.md", "docs/RELEASE.md", "docs/CONTEST_REQUIREMENTS_2026-05-06.md"]) {
  assert.ok(existsSync(path), `${path} must exist`);
  assert.ok(statSync(path).size > 1000, `${path} is suspiciously small`);
}

for (const fragment of [
  "Playable mobile link",
  "GitHub repository",
  "Demo video",
  "Devpost short description",
  "AI use explanation",
  "100-point judge gate",
  "LIARLINE_PUBLIC_URL",
  "LIARLINE_GITHUB_URL",
  "LIARLINE_DEMO_VIDEO_URL",
  "Strict mode"
]) {
  assert.ok(submissionPackage.includes(fragment), `docs/SUBMISSION_PACKAGE.md missing ${fragment}`);
}

for (const fragment of [
  "The AI is an actor, not the judge.",
  "Do not claim yet",
  "first AI wow",
  "contradiction reveal",
  "persona shift"
]) {
  assert.ok(submission.includes(fragment), `docs/SUBMISSION.md missing ${fragment}`);
}

assert.ok(readme.includes("npm run test:judge-readiness"), "README must expose the judge-readiness gate");
assert.ok(release.includes("Judge readiness"), "RELEASE must include judge readiness");
assert.ok(state.includes("T201-T210"), "STATE must keep the Phase 10 focus visible");
assert.ok(playwrightConfig.includes("webServer"), "Playwright must start the local server for browser release tests");
assert.ok(playwrightConfig.includes("55046"), "Playwright config must preserve the release-browser base port");

const external = {
  playableUrl: getEnvUrl("LIARLINE_PUBLIC_URL"),
  githubUrl: getEnvUrl("LIARLINE_GITHUB_URL"),
  demoVideoUrl: getEnvUrl("LIARLINE_DEMO_VIDEO_URL")
};

const externalChecks = {
  playableUrl: looksLikeUrl(external.playableUrl),
  githubUrl: /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/i.test(external.githubUrl),
  demoVideoUrl: looksLikeVideoUrl(external.demoVideoUrl)
};

const strict = process.env.LIARLINE_STRICT_SUBMISSION === "1";
if (strict) {
  assert.ok(externalChecks.playableUrl, "LIARLINE_PUBLIC_URL must be a public https URL in strict mode");
  assert.ok(externalChecks.githubUrl, "LIARLINE_GITHUB_URL must be a GitHub repo URL in strict mode");
  assert.ok(externalChecks.demoVideoUrl, "LIARLINE_DEMO_VIDEO_URL must be a supported video URL in strict mode");
}

console.log(JSON.stringify({
  ok: true,
  mode: strict ? "strict_submission" : "local_package",
  scoreCeiling: Object.values(externalChecks).every(Boolean) ? 100 : 88,
  externalChecks,
  strictModeCommand: "LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
}, null, 2));
