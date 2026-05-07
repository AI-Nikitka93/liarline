import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set(["node_modules", ".next", ".git", "_archive", ".playwright-mcp", "test-results"]);
const ignoredFiles = new Set(["package-lock.json", ".env", ".env.local"]);
const secretPatterns = [
  { name: "github token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g },
  { name: "github pat", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: "openai key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "groq key", pattern: /\bgsk_[A-Za-z0-9_-]{20,}\b/g },
  { name: "bearer token", pattern: /Bearer\s+[A-Za-z0-9._-]{24,}/gi },
  { name: "raw env api secret", pattern: /^(?:export\s+)?[A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD)[A-Z0-9_]*[^\S\r\n]*=[^\S\r\n]*(?!your_key_here|<[^>]+>|$)[^\s#]+/gm }
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    if (entry.isFile() && !ignoredFiles.has(entry.name)) files.push(full);
  }
  return files;
}

function isTextFile(file) {
  return /\.(?:ts|tsx|js|mjs|json|md|css|svg|yml|yaml|toml|txt|example|gitignore|npmignore)$/i.test(file) || path.basename(file).startsWith(".");
}

const gitignore = await readFile(".gitignore", "utf8");
assert.ok(gitignore.includes(".env.local"), ".env.local must be ignored");
assert.ok(gitignore.includes("_archive/"), "_archive must be ignored");
assert.ok(gitignore.includes("test-results/"), "test-results must be ignored");

const findings = [];
for (const file of (await walk(root)).filter(isTextFile)) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const fileStat = await stat(file);
  if (fileStat.size > 1_500_000) continue;
  const body = await readFile(file, "utf8");
  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    const matches = [...body.matchAll(pattern)];
    if (matches.length) findings.push(`${rel}: ${name}`);
  }
}

assert.deepEqual(findings, []);
console.log("release security scan passed");
