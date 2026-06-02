import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const workflowPath = ".github/workflows/release-readiness.yml";

assert.ok(existsSync(workflowPath), "release readiness GitHub Actions workflow must exist");

const workflow = await readFile(workflowPath, "utf8");
const releaseReadiness = await readFile("tools/test-release-readiness.mjs", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const scripts = packageJson.scripts || {};

assert.equal(scripts["test:ci-workflow"], "node tools/test-ci-workflow.mjs");

for (const fragment of [
  "name: Release Readiness",
  "pull_request:",
  "push:",
  "branches: [master, codex/restore-point-2026-05-08-ai-game-week]",
  "container: mcr.microsoft.com/playwright:v1.59.1-noble",
  "actions/setup-node@v4",
  "node-version: 24",
  "npm ci",
  "npm run build",
  "npm run test:release-readiness",
  "npm run test:contest-final-packet",
  "npm run test:judge-readiness",
  "npm run test:demo-video-package",
  "npm run test:project-hygiene",
  "npm run test:release-security",
  "npm run test:public-docs",
  "npx playwright test tools/release-browser.spec.ts tools/mobile-browser-smoke.spec.ts tools/phase7-submission.spec.ts"
]) {
  assert.ok(workflow.includes(fragment), `release readiness workflow missing: ${fragment}`);
}

for (const forbidden of [
  "LIARLINE_STRICT_SUBMISSION=1",
  "GROQ_API_KEY:",
  "GROQ_API_KEYS:",
  "LIARLINE_DEMO_VIDEO_URL:",
  "npx playwright install",
  "npm run test:live-suspects"
]) {
  assert.ok(!workflow.includes(forbidden), `release readiness workflow must not require external secret/live-only gate: ${forbidden}`);
}

assert.ok(
  !releaseReadiness.includes("_archive/"),
  "release readiness CI must not depend on local-only _archive files"
);

console.log("CI workflow checks passed");
