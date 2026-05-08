import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docs = [
  "README.md",
  "DESIGN.md",
  "MODEL_SELECTION.md",
  ...(await readdir("docs")).filter((file) => file.endsWith(".md")).map((file) => path.join("docs", file))
];

const forbidden = [
  { name: "github token", pattern: /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/i },
  { name: "raw secret key", pattern: /^(?:export\s+)?[A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*[^\S\r\n]*=[^\S\r\n]*(?!your_key_here|<[^>]+>|$)[^\s#]+/im },
  { name: "windows absolute private path", pattern: /\b[A-Z]:\\(?!Projects\\Konkurs\\AI Game Week\\public\b)/i },
  { name: "raw compact clue token in judge evidence", pattern: /\bclue[a-z0-9]{6,}\b/i }
];

const findings = [];
for (const file of docs) {
  const body = await readFile(path.join(root, file), "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(body)) findings.push(`${file}: ${rule.name}`);
  }
}

assert.deepEqual(findings, []);
console.log("public docs safety scan passed");
