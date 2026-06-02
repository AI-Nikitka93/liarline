import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AI_GAME_PRACTICES_2026_05_08,
  CONTEST_CRITERIA_ALIGNMENT,
  CONTEST_REQUIREMENTS_2026_05_08,
  IDEA_ANCHOR_PHASE1_GUARDRAILS,
  PHASE1_CURRENT_AUDIT,
  PHASE1_SOURCE_OF_TRUTH,
  PHASE1_TODO_CLOSURES,
  PHASE1_VERIFICATION_DATE,
  SCORE_RISK_BASELINE
} from "../src/release/winPushPhase1.ts";

function includesAll(source, expected, label) {
  for (const fragment of expected) {
    assert.ok(source.includes(fragment), `${label} missing: ${fragment}`);
  }
}

const [packageJsonText, masterTodo, state, stateJsonText, contestDoc, readme, submission, release, judgePacket] =
  await Promise.all([
    readFile("package.json", "utf8"),
    readFile("docs/MASTER_TODO.md", "utf8"),
    readFile("docs/STATE.md", "utf8"),
    readFile("docs/state.json", "utf8"),
    readFile("docs/CONTEST_REQUIREMENTS_2026-05-06.md", "utf8"),
    readFile("README.md", "utf8"),
    readFile("docs/SUBMISSION.md", "utf8"),
    readFile("docs/RELEASE.md", "utf8"),
    readFile("docs/JUDGE_FINAL_PACKET_2026-05-08.md", "utf8")
  ]);

const packageJson = JSON.parse(packageJsonText);
const stateJson = JSON.parse(stateJsonText);

assert.equal(PHASE1_VERIFICATION_DATE, "2026-05-08");
assert.equal(packageJson.scripts["test:win-push-phase1"], "tsx tools/test-win-push-phase1.mjs");

assert.equal(PHASE1_SOURCE_OF_TRUTH.activeMasterPlan, "docs/MASTER_TODO.md");
assert.ok(PHASE1_SOURCE_OF_TRUTH.rule.includes("archived T001-T220"));
assert.ok(
  state.includes("PHASE1_T001_T010_CLOSED") ||
    state.includes("PHASE1_T011_T020_CLOSED") ||
    state.includes("PHASE2_T021_T030_CLOSED") ||
    state.includes("PHASE2_T031_T040_CLOSED") ||
    state.includes("PHASE3_T041_T070_CLOSED") ||
    state.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);
assert.ok([
  "PHASE1_T001_T010_CLOSED",
  "PHASE1_T011_T020_CLOSED",
  "PHASE2_T021_T030_CLOSED",
  "PHASE2_T031_T040_CLOSED",
  "PHASE3_T041_T070_CLOSED",
  "PHASE8_T191_T205_POSTLAUNCH_CLOSED"
].includes(stateJson.status));
assert.ok(
  stateJson.next_step.includes("T011") ||
    stateJson.next_step.includes("T021") ||
    stateJson.next_step.includes("T031") ||
    stateJson.next_step.includes("T041") ||
    stateJson.next_step.includes("T071") ||
    stateJson.next_step.includes("demo video")
);

for (const todo of PHASE1_TODO_CLOSURES) {
  assert.equal(todo.status, "closed", `${todo.todoId} must be closed in the contract`);
  assert.ok(masterTodo.includes(`[x] ${todo.todoId}`), `${todo.todoId} must be checked in docs/MASTER_TODO.md`);
  assert.ok(todo.changedSurface.length > 5, `${todo.todoId} must name a changed surface`);
  assert.ok(todo.verification.includes("test:win-push-phase1"), `${todo.todoId} must be covered by this gate`);
}
assert.equal(PHASE1_TODO_CLOSURES.length, 10);
assert.ok(masterTodo.includes("[x] T010A"), "stale live voice evidence repair must be closed");
assert.ok(packageJson.scripts["test:live-suspects"].includes("tools/test-live-suspect-voices.mjs"));
assert.ok(state.includes("docs/AI_SUSPECT_VOICE_RUN_CURRENT.md"), "STATE must track the current live voice evidence file");

includesAll(contestDoc, [
  "Verification date: 2026-05-08.",
  "Latest refresh closed scope: T001-T010.",
  "Deadline shown on Devpost: May 10, 2026 at 5:00 PM AZST.",
  "hacking period runs from May 3, 2026 at 9:00 AM to May 10, 2026 at 5:00 PM Baku time",
  "A playable game link",
  "A demo video (1-3 minutes)",
  "A GitHub repo with code",
  "A short description explaining AI tools used",
  "AI Integration: 30%",
  "Creativity & Fun: 25%",
  "Technical Execution: 25%",
  "Mobile Support: 20%",
  "2026 AI-Game Practice Refresh",
  "Current Score-Risk Baseline",
  "Phase 1 Source-of-Truth Decision"
], "contest requirements refresh");

assert.equal(CONTEST_REQUIREMENTS_2026_05_08.deadline, "May 10, 2026 at 5:00 PM Baku time / AZST");
assert.ok(CONTEST_REQUIREMENTS_2026_05_08.hardRequirements.includes("mobile browser playable"));
assert.ok(CONTEST_REQUIREMENTS_2026_05_08.submissionFields.includes("GitHub repository with code"));
assert.ok(CONTEST_REQUIREMENTS_2026_05_08.submissionFields.some((field) => field.includes("1-3 minutes")));

assert.equal(CONTEST_CRITERIA_ALIGNMENT.reduce((sum, criterion) => sum + criterion.weight, 0), 100);
for (const criterion of ["AI Integration", "Creativity & Fun", "Technical Execution", "Mobile Support"]) {
  assert.ok(CONTEST_CRITERIA_ALIGNMENT.some((entry) => entry.name === criterion), `missing criterion ${criterion}`);
}
assert.ok(CONTEST_CRITERIA_ALIGNMENT.every((entry) => entry.verificationCommand.includes("npm run")));

for (const area of ["AI quality", "Mobile UI", "Proof clarity", "Submission completeness", "Scope truth"]) {
  assert.ok(SCORE_RISK_BASELINE.some((entry) => entry.area === area), `missing score risk area ${area}`);
}

includesAll(PHASE1_CURRENT_AUDIT.verifiedWorking.join("\n"), [
  "Next.js mobile web app shell",
  "Deterministic engine",
  "Groq NPC-turn",
  "RU/EN dictionaries"
], "current audit");
assert.ok(PHASE1_CURRENT_AUDIT.assumptionBoundaries.some((entry) => entry.includes("demo video URL")));

for (const source of [
  "https://arxiv.org/abs/2604.04703",
  "https://arxiv.org/abs/2604.10107",
  "https://github.com/orgs/community/discussions/163655"
]) {
  assert.ok(AI_GAME_PRACTICES_2026_05_08.sourceUrls.includes(source), `missing AI practice source ${source}`);
}
includesAll(AI_GAME_PRACTICES_2026_05_08.meaningfulForLiarline.join("\n"), [
  "Game state must remain executable",
  "only allowed knowledge",
  "validation, fallback",
  "cognitive load"
], "AI-game practices");
includesAll(AI_GAME_PRACTICES_2026_05_08.antiPatterns.join("\n"), [
  "generic AI chat",
  "unclear proof chain",
  "indistinguishable suspect voices",
  "hidden truth",
  "fake intelligence claims"
], "AI-game anti-patterns");

assert.ok(IDEA_ANCHOR_PHASE1_GUARDRAILS.mustStay.includes("one polished case"));
assert.ok(IDEA_ANCHOR_PHASE1_GUARDRAILS.blockedUntilFirstCaseStable.includes("procedural case generation"));
assert.ok(IDEA_ANCHOR_PHASE1_GUARDRAILS.blockedUntilFirstCaseStable.includes("full trial mode"));

for (const doc of [readme, submission, release, judgePacket]) {
  includesAll(doc, ["one", "AI", "evidence"], "public one-case AI/evidence claim");
  assert.ok(!/three-case season is playable|supports unlimited case generation|supports multiplayer/i.test(doc));
}
assert.ok(submission.includes("The AI is an actor, not the judge."));
assert.ok(judgePacket.includes("AI suspects can lie, but only evidence can convict."));

console.log(JSON.stringify({
  ok: true,
  phase: 1,
  closedTodos: PHASE1_TODO_CLOSURES.map((todo) => todo.todoId),
  extraClosedTodos: ["T010A"],
  verificationDate: PHASE1_VERIFICATION_DATE,
  criteriaWeight: CONTEST_CRITERIA_ALIGNMENT.reduce((sum, criterion) => sum + criterion.weight, 0)
}, null, 2));
