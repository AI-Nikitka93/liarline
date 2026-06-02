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
  if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|youku\.com)\/[^\s]+$/i.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtube.com") {
      const id = url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})(?:\/|$)/)?.[1];
      return /^[A-Za-z0-9_-]{11}$/.test(id || "");
    }
    if (host === "youtu.be") {
      return /^[A-Za-z0-9_-]{11}$/.test(url.pathname.split("/").filter(Boolean)[0] || "");
    }
    if (host === "vimeo.com") {
      return /^\d{6,}$/.test(url.pathname.split("/").filter(Boolean)[0] || "");
    }
    return host === "youku.com";
  } catch {
    return false;
  }
}

function looksLikePlaceholderVideo(value) {
  return /placeholder|dummy|example|todo|replace|REAL_UPLOADED_LIARLINE_DEMO_VIDEO_URL/i.test(value);
}

function getEnvUrl(name) {
  const value = process.env[name]?.trim() || "";
  return value;
}

async function fetchText(url, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "liarline-judge-readiness/1.0"
      }
    });
    const text = await response.text();
    assert.ok(response.ok, `${label} must respond with 2xx/3xx status, got ${response.status}`);
    return text;
  } catch (error) {
    assert.fail(`${label} must be reachable in strict mode: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyPublicPlayableUrl(url) {
  const publicPage = await fetchText(url, "LIARLINE_PUBLIC_URL");
  assert.ok(/Liarline|AI social deduction detective game/i.test(publicPage), "LIARLINE_PUBLIC_URL must render the Liarline app");

  if (/first-question-cta|Задать первый вопрос|Ask first question/i.test(publicPage)) {
    return;
  }

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (error) {
    assert.fail(`LIARLINE_PUBLIC_URL is client-rendered and needs Playwright browser verification: ${error instanceof Error ? error.message : String(error)}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    if (await page.locator(".language-entry-screen").isVisible()) {
      await page.getByRole("button", { name: /English/ }).click();
    }
    await page.locator(".first-question-cta").first().waitFor({ state: "visible", timeout: 15000 });
    assert.deepEqual(consoleErrors, [], `LIARLINE_PUBLIC_URL browser check saw console errors: ${consoleErrors.join(" | ")}`);
  } catch (error) {
    assert.fail(`LIARLINE_PUBLIC_URL must expose the first playable action in a browser: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await browser.close();
  }
}

async function verifyDemoVideoUrl(url) {
  assert.ok(!looksLikePlaceholderVideo(url), "LIARLINE_DEMO_VIDEO_URL must be the real uploaded demo video URL, not a placeholder");
  const videoPage = await fetchText(url, "LIARLINE_DEMO_VIDEO_URL");
  assert.ok(
    !/video unavailable|this video isn't available|private video|removed by the uploader|not found/i.test(videoPage.slice(0, 500000)),
    "LIARLINE_DEMO_VIDEO_URL must be publicly playable, not private, unavailable, removed, or missing"
  );
}

const packageJson = readJson("package.json");
const scripts = packageJson.scripts || {};
const submissionPackage = await readFile("docs/SUBMISSION_PACKAGE.md", "utf8");
const submission = await readFile("docs/SUBMISSION.md", "utf8");
const readme = await readFile("README.md", "utf8");
const release = await readFile("docs/RELEASE.md", "utf8");
const state = await readFile("docs/STATE.md", "utf8");
const masterTodo = await readFile("docs/MASTER_TODO.md", "utf8");
const playwrightConfig = await readFile("playwright.config.ts", "utf8");

assert.equal(scripts["test:judge-readiness"], "node tools/test-judge-readiness.mjs");
assert.ok(scripts["test:release-browser"], "release browser gate must be scriptable");
assert.ok(scripts["test:production-layout"], "production layout gate must be scriptable");
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
assert.ok(state.includes("docs/MASTER_TODO.md"), "STATE must point at the active master TODO");
assert.ok(
    state.includes("MASTER_TODO_REOPENED_WIN_PUSH_ACTIVE") ||
    state.includes("PHASE1_T001_T010_CLOSED") ||
    state.includes("PHASE1_T011_T020_CLOSED") ||
    state.includes("PHASE2_T021_T030_CLOSED") ||
    state.includes("PHASE2_T031_T040_CLOSED") ||
    state.includes("PHASE3_T041_T070_CLOSED") ||
    state.includes("PHASE4_T071_T100_CLOSED") ||
    state.includes("PHASE5_T101_T130_CLOSED") ||
    state.includes("PHASE6_T131_T160_CLOSED") ||
    state.includes("PHASE7_T161_T190_SUBMISSION_QA_FEEDBACK_BLOCKED_BY_DEMO_VIDEO_URL") ||
    state.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED"),
  "STATE must expose a current active win-push TODO status"
);
assert.ok(masterTodo.includes("total ordinary tasks: 188"), "MASTER TODO must preserve the 188-task coverage check");
assert.ok(masterTodo.includes("anchor tasks: 17"), "MASTER TODO must preserve anchor coverage");
assert.ok(masterTodo.includes("AI answer quality"), "MASTER TODO must cover the AI quality win-push");
assert.ok(masterTodo.includes("every-button visual/code proof"), "MASTER TODO must cover paired button proof");
assert.ok(scripts["test:win-push-phase1-readiness"], "Phase 1 readiness closure must be scriptable");
assert.ok(scripts["test:win-push-phase2-ai-quality"], "Phase 2 AI-quality closure must be scriptable");
assert.ok(scripts["test:win-push-phase2-quarantine"], "Phase 2 quarantine closure must be scriptable");
assert.ok(scripts["test:win-push-phase3-provider-proof"], "Phase 3 provider/proof closure must be scriptable");
assert.ok(scripts["test:win-push-phase4-mobile-ux"], "Phase 4 mobile UX closure must be scriptable");
assert.ok(scripts["test:browser-phase4-mobile-ux"], "Phase 4 browser UX closure must be scriptable");
assert.ok(release.includes("Current risk baseline"), "RELEASE must expose the current risk baseline");
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
  assert.ok(externalChecks.demoVideoUrl, "LIARLINE_DEMO_VIDEO_URL must be a public YouTube, Vimeo, or Youku URL in strict mode");

  await verifyPublicPlayableUrl(external.playableUrl);

  const githubPage = await fetchText(external.githubUrl, "LIARLINE_GITHUB_URL");
  assert.ok(/AI-Nikitka93\/liarline|Mobile-browser AI detective game|Liarline/i.test(githubPage), "LIARLINE_GITHUB_URL must render the public Liarline repo");
  await verifyDemoVideoUrl(external.demoVideoUrl);
}

console.log(JSON.stringify({
  ok: true,
  mode: strict ? "strict_submission" : "local_package",
  scoreCeiling: Object.values(externalChecks).every(Boolean) ? 100 : 88,
  externalChecks,
  strictModeCommand: "LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
}, null, 2));
