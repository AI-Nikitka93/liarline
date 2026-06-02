import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
  AI_PROVIDER_STATUS_CURRENT,
  BACKUP_AI_CANDIDATES,
  BACKUP_AI_DECISION,
  CODEBASE_INTELLIGENCE_DECISION,
  CURRENT_RISK_BASELINE_TABLE,
  EXTERNAL_DEPENDENCY_MAP,
  FASTEST_AGING_KNOWLEDGE,
  PHASE1_READINESS_DATE,
  PHASE1_READINESS_TODO_CLOSURES,
  PUBLIC_CLAIM_AUDIT,
  SKILL_STACK_DECISIONS
} from "../src/release/winPushPhase1Readiness.ts";

function includesAll(source, fragments, label) {
  for (const fragment of fragments) {
    assert.ok(source.includes(fragment), `${label} missing: ${fragment}`);
  }
}

const [
  packageJsonText,
  masterTodo,
  readme,
  submission,
  release,
  judgePacket,
  providerStatus,
  state,
  stateJsonText
] = await Promise.all([
  readFile("package.json", "utf8"),
  readFile("docs/MASTER_TODO.md", "utf8"),
  readFile("README.md", "utf8"),
  readFile("docs/SUBMISSION.md", "utf8"),
  readFile("docs/RELEASE.md", "utf8"),
  readFile("docs/JUDGE_FINAL_PACKET_2026-05-08.md", "utf8"),
  readFile("docs/AI_PROVIDER_STATUS_CURRENT.md", "utf8"),
  readFile("docs/STATE.md", "utf8"),
  readFile("docs/state.json", "utf8")
]);

const packageJson = JSON.parse(packageJsonText);
const stateJson = JSON.parse(stateJsonText);

assert.equal(PHASE1_READINESS_DATE, "2026-05-08");
assert.equal(packageJson.scripts["test:win-push-phase1-readiness"], "tsx tools/test-win-push-phase1-readiness.mjs");

for (const todoId of PHASE1_READINESS_TODO_CLOSURES) {
  assert.ok(masterTodo.includes(`[x] ${todoId}`), `${todoId} must be checked in active MASTER_TODO`);
}
assert.equal(PHASE1_READINESS_TODO_CLOSURES.length, 10);

for (const file of PUBLIC_CLAIM_AUDIT.checkedFiles) {
  assert.ok(existsSync(file), `${file} must exist for public claim audit`);
}
for (const doc of [readme, submission, release, judgePacket]) {
  includesAll(doc, ["one", "AI", "evidence"], "public release claim");
  for (const forbidden of PUBLIC_CLAIM_AUDIT.forbiddenClaims) {
    assert.ok(!doc.toLowerCase().includes(forbidden.toLowerCase()), `public doc contains forbidden claim: ${forbidden}`);
  }
}
assert.ok(PUBLIC_CLAIM_AUDIT.verificationCommand.includes("test:judge-readiness"));

for (const surface of ["contest", "deployment", "video", "ai_provider", "browser", "repository"]) {
  assert.ok(EXTERNAL_DEPENDENCY_MAP.some((item) => item.surface === surface), `dependency map missing ${surface}`);
}
assert.ok(EXTERNAL_DEPENDENCY_MAP.some((item) => item.releaseImpact === "blocker"));
assert.ok(EXTERNAL_DEPENDENCY_MAP.every((item) => item.verificationCommand.length > 0));

for (const itemId of ["aging_contest", "aging_ai_provider", "aging_backup_models", "aging_mobile_browser", "aging_public_claims"]) {
  assert.ok(FASTEST_AGING_KNOWLEDGE.some((item) => item.itemId === itemId), `fast-aging knowledge missing ${itemId}`);
}

includesAll(providerStatus, [
  "Verification date: 2026-05-08.",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "JSON Object Mode",
  "30 RPM",
  "14.4K RPD",
  "6K TPM",
  "500K TPD",
  "Google Gemini API",
  "OpenRouter free models",
  "Hugging Face Inference Providers",
  "Mistral La Plateforme",
  "No provider switch now"
], "provider status");

assert.equal(AI_PROVIDER_STATUS_CURRENT.primary.model, "llama-3.1-8b-instant");
assert.ok(AI_PROVIDER_STATUS_CURRENT.primary.officialCapabilities.includes("JSON Object Mode"));
assert.equal(AI_PROVIDER_STATUS_CURRENT.primary.freePlanLimits.rpm, 30);
assert.equal(AI_PROVIDER_STATUS_CURRENT.primary.freePlanLimits.rpd, 14400);
assert.equal(AI_PROVIDER_STATUS_CURRENT.enrichment.model, "llama-3.3-70b-versatile");
assert.equal(AI_PROVIDER_STATUS_CURRENT.enrichment.status, "offline_enrichment_only");
assert.ok(AI_PROVIDER_STATUS_CURRENT.noGoIf.some((item) => item.includes("JSON Object Mode")));

for (const provider of [
  "Groq alternate model",
  "Google Gemini API",
  "OpenRouter free models",
  "Hugging Face Inference Providers",
  "Mistral La Plateforme"
]) {
  assert.ok(BACKUP_AI_CANDIDATES.some((item) => item.provider === provider), `backup candidate missing ${provider}`);
}
assert.equal(BACKUP_AI_DECISION.releaseDecision, "no_provider_switch_before_submission");
assert.deepEqual(BACKUP_AI_DECISION.liveFallbackAllowed, [
  "none until a candidate passes the same NPC-turn, live-suspect, demo-route, security, and browser gates as Groq"
]);

assert.ok(SKILL_STACK_DECISIONS.some((item) => item.skillId === "superpowers:verification-before-completion" && item.keep));
assert.ok(SKILL_STACK_DECISIONS.some((item) => item.skillId === "broad autoskills installation" && !item.keep));
assert.ok(SKILL_STACK_DECISIONS.every((item) => item.riskBoundary.length > 0));

assert.equal(CODEBASE_INTELLIGENCE_DECISION.decision, "use_precise_search_not_global_index");
assert.ok(CODEBASE_INTELLIGENCE_DECISION.observedProjectFiles <= 120);
assert.ok(CODEBASE_INTELLIGENCE_DECISION.currentTools.includes("rg"));

for (const area of [
  "AI quality",
  "mobile UI",
  "language parity",
  "buttons",
  "visual proof",
  "final submission",
  "demo video"
]) {
  assert.ok(CURRENT_RISK_BASELINE_TABLE.some((item) => item.area === area), `risk baseline missing ${area}`);
}
assert.ok(CURRENT_RISK_BASELINE_TABLE.every((item) => item.verification.includes("npm run") || item.verification.includes("LIARLINE_")));

assert.ok(readme.includes("npm run test:win-push-phase1-readiness"));
assert.ok(release.includes("Current risk baseline"));
assert.ok(submission.includes("Strict external blocker"));
assert.ok(judgePacket.includes("docs/AI_PROVIDER_STATUS_CURRENT.md"));
assert.ok(
  state.includes("PHASE1_T011_T020_CLOSED") ||
    state.includes("PHASE2_T021_T030_CLOSED") ||
    state.includes("PHASE2_T031_T040_CLOSED") ||
    state.includes("PHASE3_T041_T070_CLOSED") ||
    state.includes("PHASE8_T191_T205_POSTLAUNCH_CLOSED")
);
assert.ok([
  "PHASE1_T011_T020_CLOSED",
  "PHASE2_T021_T030_CLOSED",
  "PHASE2_T031_T040_CLOSED",
  "PHASE3_T041_T070_CLOSED",
  "PHASE8_T191_T205_POSTLAUNCH_CLOSED"
].includes(stateJson.status));

console.log(JSON.stringify({
  ok: true,
  phase: 1,
  closedTodos: [...PHASE1_READINESS_TODO_CLOSURES],
  provider: AI_PROVIDER_STATUS_CURRENT.primary.model,
  backupDecision: BACKUP_AI_DECISION.releaseDecision
}, null, 2));
