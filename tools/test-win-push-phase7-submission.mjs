import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CURRENT_EXTERNAL_RELEASE_URLS,
  DEMO_VIDEO_SCRIPT_BEATS,
  FINAL_SUBMISSION_PACKET_2026_05_09,
  JUDGE_QA_ROUTE_MATRIX,
  PHASE7_ANCHOR_REVIEW,
  PHASE7_END_REVIEW,
  PHASE7_RELEASE_DECISION,
  PHASE7_TODO_CLOSURES,
  RELEASE_HYGIENE_AUDIT,
  SUBMISSION_RESEARCH_2026_05_09
} from "../src/release/winPushPhase7Submission.ts";
import {
  FEEDBACK_CATEGORIES,
  createFeedbackEntry,
  getFeedbackBacklogSummary,
  sanitizeFeedbackText,
  triageFeedback
} from "../src/release/feedbackIntake.ts";

const masterTodo = await readFile("docs/MASTER_TODO.md", "utf8");
const stateDoc = await readFile("docs/STATE.md", "utf8");
const readme = await readFile("README.md", "utf8");
const releaseDoc = await readFile("docs/RELEASE.md", "utf8");
const submissionDoc = await readFile("docs/SUBMISSION.md", "utf8");
const submissionPackage = await readFile("docs/SUBMISSION_PACKAGE.md", "utf8");
const qaEvidence = await readFile("docs/QA_EVIDENCE_2026-05-09.md", "utf8");
const restorePoint = await readFile("docs/RESTORE_POINT_2026-05-09_PHASE7.md", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const gameUi = await readFile("src/components/LiarlineGame.tsx", "utf8");
const envLoader = await readFile("tools/load-local-env.mjs", "utf8");
const npcTurnTest = await readFile("tools/test-npc-turn.mjs", "utf8");
const demoRouteTest = await readFile("tools/test-demo-route.mjs", "utf8");
const liveSuspectsTest = await readFile("tools/test-live-suspect-voices.mjs", "utf8");

assert.deepEqual(PHASE7_TODO_CLOSURES, [
  "T161",
  "T162",
  "T163",
  "T164",
  "T165",
  "T166",
  "T167",
  "T168",
  "T169",
  "T170",
  "T171",
  "T172",
  "T173",
  "T174",
  "T175",
  "T176",
  "T177",
  "T178",
  "T179",
  "T180",
  "T181",
  "T182",
  "T183",
  "T184",
  "T185",
  "T186",
  "T187",
  "T188",
  "T189",
  "T190"
]);

for (const routeId of ["first_minute_judge", "full_playthrough_judge", "wrong_player", "partial_player", "phone_touch_viewport"]) {
  const route = JUDGE_QA_ROUTE_MATRIX.find((item) => item.routeId === routeId);
  assert.ok(route, `QA matrix missing ${routeId}`);
  assert.ok(route.proofCommands.length > 0, `${routeId} missing proof commands`);
  assert.ok(route.acceptance.length > 0, `${routeId} missing acceptance`);
}

assert.ok(JUDGE_QA_ROUTE_MATRIX.find((item) => item.routeId === "first_minute_judge")?.acceptance.some((item) => item.includes("first AI answer")));
assert.ok(JUDGE_QA_ROUTE_MATRIX.find((item) => item.routeId === "full_playthrough_judge")?.acceptance.some((item) => item.includes("Resolution")));
assert.ok(JUDGE_QA_ROUTE_MATRIX.find((item) => item.routeId === "wrong_player")?.acceptance.some((item) => item.includes("not a bug")));
assert.ok(JUDGE_QA_ROUTE_MATRIX.find((item) => item.routeId === "partial_player")?.acceptance.some((item) => item.includes("partial")));
assert.ok(JUDGE_QA_ROUTE_MATRIX.find((item) => item.routeId === "phone_touch_viewport")?.acceptance.some((item) => item.includes("390x844")));

for (const source of ["Devpost AI Game Week page", "Devpost help", "Groq model docs", "Groq rate-limit docs", "Groq status page"]) {
  assert.ok(SUBMISSION_RESEARCH_2026_05_09.some((item) => item.source === source), `research missing ${source}`);
}
assert.ok(CURRENT_EXTERNAL_RELEASE_URLS.publicGameUrl === "https://liarline.vercel.app");
assert.ok(CURRENT_EXTERNAL_RELEASE_URLS.githubRepoUrl === "https://github.com/AI-Nikitka93/liarline");
assert.equal(CURRENT_EXTERNAL_RELEASE_URLS.demoVideoStatus, "external_blocker_real_url_required");

for (const field of ["shortDescription", "whatItDoes", "aiUse", "builtWith", "demoRoute", "noOverclaimBoundary"]) {
  assert.ok(FINAL_SUBMISSION_PACKET_2026_05_09[field]?.length > 20, `final packet missing ${field}`);
}
const finalPacketText = JSON.stringify(FINAL_SUBMISSION_PACKET_2026_05_09).toLowerCase();
for (const overclaim of ["season is playable", "supports unlimited generated cases", "supports multiplayer", "supports voice interrogation"]) {
  assert.ok(!finalPacketText.includes(overclaim), `final packet overclaims ${overclaim}`);
}
assert.ok(finalPacketText.includes("does not include multiplayer"), "final packet must explicitly reject current multiplayer scope");

for (const beat of ["first_ai_answer_under_20s", "contradiction", "persona_shift", "notebook", "accusation", "resolution"]) {
  const scriptBeat = DEMO_VIDEO_SCRIPT_BEATS.find((item) => item.beatId === beat);
  assert.ok(scriptBeat, `demo script missing ${beat}`);
  assert.ok(scriptBeat.visibleProof.length > 0, `${beat} missing visible proof`);
  assert.ok(scriptBeat.doNotRecordIf.length > 0, `${beat} missing no-record guard`);
}

for (const audit of ["secret_hygiene", "dead_code", "orphan_assets", "dependencies", "release_bundle", "ignore_rules"]) {
  const entry = RELEASE_HYGIENE_AUDIT.find((item) => item.auditId === audit);
  assert.ok(entry, `hygiene audit missing ${audit}`);
  assert.ok(entry.verificationCommands.length > 0, `${audit} missing verification`);
  assert.ok(entry.releaseAction.length > 0, `${audit} missing release action`);
}

assert.equal(PHASE7_ANCHOR_REVIEW.status, "Anchor OK. Продолжаем.");
assert.equal(PHASE7_ANCHOR_REVIEW.noDrift, true);
assert.ok(PHASE7_ANCHOR_REVIEW.restorePointName.includes("PHASE7"));
assert.equal(PHASE7_RELEASE_DECISION.decision, "patch_before_submit");
assert.ok(PHASE7_RELEASE_DECISION.remainingBlockers.includes("real_demo_video_url"));
assert.equal(PHASE7_END_REVIEW.phase, 7);
assert.equal(PHASE7_END_REVIEW.signal, "Фаза 7 не закрыта. Стоп. Вот что мешает: real_demo_video_url");

for (const category of [
  "ai_quality",
  "missed_contradiction",
  "notebook_clarity",
  "unfair_accusation",
  "mobile_bug",
  "localization_issue"
]) {
  assert.ok(FEEDBACK_CATEGORIES.some((item) => item.category === category), `feedback category missing ${category}`);
  assert.ok(["hotfix", "follow_up_patch", "future_scope"].includes(triageFeedback({ category, severity: "medium" }).lane));
}
assert.equal(triageFeedback({ category: "mobile_bug", severity: "high" }).lane, "hotfix");
assert.equal(triageFeedback({ category: "unfair_accusation", severity: "high" }).lane, "hotfix");
assert.equal(triageFeedback({ category: "notebook_clarity", severity: "medium" }).lane, "follow_up_patch");
assert.equal(triageFeedback({ category: "ai_quality", severity: "low" }).lane, "future_scope");
assert.equal(sanitizeFeedbackText("secret sk-abc1234567890 email test@example.com\nok").includes("sk-"), false);
const feedbackEntry = createFeedbackEntry({
  category: "missed_contradiction",
  severity: "medium",
  note: "The camera clue did not feel connected to the cart.",
  locale: "en",
  outcome: "partial_win",
  detectiveRating: "reckless",
  transcriptLength: 3,
  viewport: "390x844"
});
assert.equal(feedbackEntry.triageLane, "follow_up_patch");
assert.ok(feedbackEntry.note.includes("camera clue"));
const backlogSummary = getFeedbackBacklogSummary([feedbackEntry]);
assert.equal(backlogSummary.follow_up_patch, 1);

for (const command of [
  "npm run test:win-push-phase7-submission",
  "npm run test:browser-phase7-submission",
  "npm run test:project-hygiene",
  "npm run test:release-security"
]) {
  assert.ok(packageJson.scripts[command.replace("npm run ", "")], `package missing ${command}`);
}

assert.ok(gameUi.includes("FeedbackPanel"), "resolution UI must include player feedback intake");
assert.ok(gameUi.includes("saveFeedbackEntry"), "feedback intake must save locally");
assert.ok(gameUi.includes("data-testid=\"feedback-panel\""), "feedback panel must be testable");
assert.ok(envLoader.includes(".env.local"), "local env loader must read .env.local");
assert.ok(npcTurnTest.includes("load-local-env.mjs"), "npc-turn test must load local env keys");
assert.ok(demoRouteTest.includes("load-local-env.mjs"), "demo-route test must load local env keys");
assert.ok(liveSuspectsTest.includes("load-local-env.mjs"), "live-suspect test must load local env keys");

for (const fragment of [
  "T161-T190",
  "first-minute judge",
  "full-playthrough judge",
  "wrong-player",
  "partial-player",
  "390x844",
  "LIARLINE_DEMO_VIDEO_URL",
  "live checks depend on configured keys"
]) {
  assert.ok(qaEvidence.includes(fragment), `QA evidence missing ${fragment}`);
}

for (const fragment of [
  "short description",
  "What it does",
  "AI use",
  "Built with",
  "Demo route",
  "No-overclaim boundary",
  "Demo video script",
  "real demo video URL"
]) {
  assert.ok(submissionPackage.includes(fragment), `submission package missing ${fragment}`);
}
for (const stalePlaceholder of ["YOUR_VIDEO_ID", "your-public-game-url", "your-user", "your-video", "your-real-video-url"]) {
  assert.equal(readme.includes(stalePlaceholder), false, `README contains stale placeholder ${stalePlaceholder}`);
  assert.equal(submissionPackage.includes(stalePlaceholder), false, `submission package contains stale placeholder ${stalePlaceholder}`);
  assert.equal(releaseDoc.includes(stalePlaceholder), false, `release doc contains stale placeholder ${stalePlaceholder}`);
}

for (const fragment of [
  "npm run test:win-push-phase7-submission",
  "Feedback intake",
  "one playable case",
  "GROQ_API_KEYS",
  "GROQ_API_KEY_1"
]) {
  assert.ok(readme.includes(fragment), `README missing ${fragment}`);
}

for (const fragment of [
  "Phase 7 release decision",
  "real_demo_video_url",
  "Feedback intake",
  "patch_before_submit"
]) {
  assert.ok(releaseDoc.includes(fragment), `release doc missing ${fragment}`);
}

assert.ok(submissionDoc.includes("one playable case"), "submission doc must state one-case scope");
assert.ok(submissionDoc.includes("does not include multiplayer"), "submission doc must reject multiplayer as current scope");
assert.ok(restorePoint.includes("PHASE7_T161_T190_SUBMISSION_QA_FEEDBACK"));
assert.ok(restorePoint.includes("npm run test:win-push-phase7-submission"));
assert.ok(
  stateDoc.includes("PHASE7_T161_T190_SUBMISSION_QA_FEEDBACK_BLOCKED_BY_DEMO_VIDEO_URL") ||
    stateDoc.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);

for (const todoId of PHASE7_TODO_CLOSURES.filter((id) => !["T184", "T188"].includes(id))) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked when locally closed`);
}
assert.ok(masterTodo.includes("[ ] T184"), "T184 must remain unchecked until a real demo video URL exists");
assert.ok(masterTodo.includes("[ ] T188"), "T188 must remain unchecked while T184 is externally blocked");
assert.ok(masterTodo.includes("real_demo_video_url"), "master TODO must carry exact blocker");

console.log("win push phase7 submission/feedback tests passed");
