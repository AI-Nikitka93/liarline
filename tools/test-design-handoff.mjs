import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { ASSET_BRIEF_IDS, ASSET_BRIEFS } from "../src/game/assetBriefs.ts";
import { ASSET_CURATION } from "../src/game/assetCuration.ts";
import { ICON_SYSTEM, iconClass } from "../src/game/iconSystem.ts";
import { VISUAL_STATE_RULES } from "../src/game/visualStateRules.ts";

const design = await readFile("DESIGN.md", "utf8");
const evidenceRaw = await readFile("_archive/agent-memory/design-evidence/github-design-evidence-2026-05-09.json", "utf8");
const evidence = JSON.parse(evidenceRaw);
const phase5Findings = await readFile("docs/visual/PHASE5_VISUAL_FINDINGS_2026-05-09.md", "utf8");
const phase5AssetBriefs = await readFile("docs/visual/ASSET_BRIEFS_2026-05-09.md", "utf8");

for (const section of [
  "Product Summary",
  "Visual DNA",
  "Design Tokens",
  "Screen Inventory",
  "Reusable Components",
  "State Rules",
  "Asset Production",
  "Accessibility",
  "Non-goals"
]) {
  assert.ok(design.includes(section), `DESIGN.md missing section: ${section}`);
}

for (const phrase of [
  "AI suspects can lie, but only evidence can convict",
  "Neo-Noir Interrogation Terminal",
  "first-viewport-visual-lock",
  "final-proof-ledger",
  "resolution-verdict-stage",
  "Interrogation",
  "Contradiction",
  "Notebook",
  "Accusation",
  "Resolution",
  "Google Stitch"
]) {
  assert.ok(design.includes(phrase), `DESIGN.md missing required phrase: ${phrase}`);
}

for (const assetId of ASSET_BRIEF_IDS) {
  const brief = ASSET_BRIEFS[assetId];
  const curation = ASSET_CURATION[assetId];
  assert.ok(brief.path, `${String(assetId)} missing path`);
  assert.ok(brief.styleBrief.length > 40, `${String(assetId)} style brief too thin`);
  assert.ok(brief.compositionRules.length >= 2, `${String(assetId)} composition rules too thin`);
  assert.ok(brief.rejectionRules.length >= 1, `${String(assetId)} rejection rules missing`);
  assert.equal(curation.status, "approved", `${String(assetId)} must be curated`);
  assert.equal(curation.path, brief.path, `${String(assetId)} curation path mismatch`);
  assert.equal(curation.checks.noWatermark, true, `${String(assetId)} watermark check missing`);
  await stat(`public${brief.path}`);
}

assert.equal(ICON_SYSTEM.family, "lucide-react");
assert.equal(ICON_SYSTEM.strokeWidth, 2);
assert.ok(iconClass("danger").includes("text-signal-500"), "danger icon state mismatch");
assert.ok(ICON_SYSTEM.rules.some((rule) => rule.includes("44px")), "icon hit target rule missing");

for (const state of ["calm", "nervous", "aggressive", "panicking", "fallback", "live_ai", "contradiction_found"]) {
  assert.ok(VISUAL_STATE_RULES[state], `visual state missing: ${state}`);
  assert.ok(VISUAL_STATE_RULES[state].className, `visual state class missing: ${state}`);
  assert.ok(VISUAL_STATE_RULES[state].gameMeaning, `visual state meaning missing: ${state}`);
}

assert.equal(evidence.source, "GitHub REST API");
assert.equal(evidence.asOfDate, "2026-05-09");
assert.ok(
  ["unauthenticated_public", "env_token_present_redacted", "gh_cli_token_present_redacted"].includes(evidence.authMode),
  "unsafe GitHub auth mode"
);
assert.ok(evidence.secretHandling.includes("No token value"), "secret handling must be explicit");
assert.ok(evidence.repos.length >= 6, "design evidence repo coverage too low");
assert.ok(evidence.repos.some((repo) => repo.fullName === "VoltAgent/awesome-design-md"), "VoltAgent evidence missing");
assert.ok(phase5Findings.includes("Patterns To Use") && phase5Findings.includes("Patterns To Reject"));
assert.ok(phase5AssetBriefs.includes("Case Lab Hero") && phase5AssetBriefs.includes("Future AI Illustration Rules"));

console.log("design handoff tests passed");
