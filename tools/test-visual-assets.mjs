import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const assets = [
  "public/assets/case-lab-hero.png",
  "public/assets/interrogation-bg.png",
  "public/assets/evidence-paper.png",
  "public/assets/suspect-ivo.png",
  "public/assets/suspect-mara.png",
  "public/assets/suspect-theo.png",
  "public/assets/suspect-lena.png"
];

function readPngDimensions(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", "asset is not a PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

for (const assetPath of assets) {
  const buffer = await readFile(assetPath);
  const fileStat = await stat(assetPath);
  const dimensions = readPngDimensions(buffer);
  assert.ok(fileStat.size > 100_000, `${assetPath} is too small for current production asset`);
  assert.ok(fileStat.size < 3_000_000, `${assetPath} is too large for current mobile budget`);
  assert.ok(dimensions.width >= 900, `${assetPath} width below mobile-crop budget`);
  assert.ok(dimensions.height >= 900, `${assetPath} height below mobile-crop budget`);
}

const auditPaths = [
  "docs/visual/ASSET_AUDIT_2026-05-06.md",
  "_archive/agent-memory/docs/visual/ASSET_AUDIT_2026-05-06.md"
];

let audit = "";
for (const auditPath of auditPaths) {
  try {
    audit = await readFile(auditPath, "utf8");
    break;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

assert.ok(audit, "visual asset audit is missing from docs or local archive");
for (const assetPath of assets) {
  assert.ok(audit.includes(assetPath), `asset audit missing ${assetPath}`);
}
assert.ok(audit.includes("approved for current mobile use"), "asset audit must state current usability");
assert.ok(audit.includes("no visible watermark"), "asset audit must check watermark risk");

console.log("visual asset tests passed");
