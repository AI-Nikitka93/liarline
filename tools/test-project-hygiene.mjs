import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();

async function walk(dir, ignored = new Set()) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full, ignored));
    if (entry.isFile()) out.push(full);
  }
  return out;
}

const gitignore = await readFile(".gitignore", "utf8");
const npmignore = await readFile(".npmignore", "utf8");
for (const required of ["_archive/", "test-results/", ".playwright-mcp/", "liarline-dock-current.png"]) {
  assert.ok(gitignore.includes(required), `.gitignore must include ${required}`);
  assert.ok(npmignore.includes(required), `.npmignore must include ${required}`);
}

for (const required of ["docs/videos/raw-v1/*-raw.webm", "docs/videos/raw-v1/video-*/"]) {
  assert.ok(gitignore.includes(required), `.gitignore must include ${required}`);
  assert.ok(npmignore.includes(required), `.npmignore must include ${required}`);
}

async function gitCheckIgnored(file) {
  try {
    await execFileAsync("git", ["check-ignore", "-q", file], { timeout: 120000, windowsHide: true });
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 1) return false;
    throw error;
  }
}

for (const ignoredCapture of [
  "docs/videos/raw-v1/liarline-demo-en-v1-raw.webm",
  "docs/videos/raw-v1/liarline-demo-ru-v1-raw.webm",
  "docs/videos/raw-v1/video-en/capture.webm",
  "docs/videos/raw-v1/video-ru/capture.webm"
]) {
  assert.equal(await gitCheckIgnored(ignoredCapture), true, `raw demo capture must be git-ignored: ${ignoredCapture}`);
}
for (const releaseVideo of [
  "docs/videos/liarline-demo-en-v1.mp4",
  "docs/videos/liarline-demo-ru-v1.mp4"
]) {
  assert.equal(await gitCheckIgnored(releaseVideo), false, `upload-ready release video must not be git-ignored: ${releaseVideo}`);
}
assert.equal(existsSync("liarline-dock-current.png"), false, "root screenshot draft must be archived");

const srcText = (await Promise.all((await walk("src")).map((file) => readFile(file, "utf8")))).join("\n");
const publicAssets = await walk(path.join("public", "assets"));
const orphanAssets = [];
for (const asset of publicAssets) {
  const publicPath = `/${asset.replaceAll("\\", "/").replace(/^public\//, "")}`;
  if (!srcText.includes(publicPath)) orphanAssets.push(publicPath);
}
assert.deepEqual(orphanAssets, []);

const publicFiles = await walk("public");
const publicBytes = (await Promise.all(publicFiles.map(async (file) => (await stat(file)).size))).reduce((sum, size) => sum + size, 0);
assert.ok(publicBytes < 16_000_000, `public asset budget exceeded: ${publicBytes}`);

if (existsSync(".next")) {
  const buildFiles = await walk(".next", new Set(["cache"]));
  const forbiddenBuildFiles = buildFiles
    .map((file) => file.replaceAll("\\", "/"))
    .filter((file) => /_archive|raw-generated-assets|test-results|\.env|liarline-dock-current|ChatGPT Image/i.test(file));
  assert.deepEqual(forbiddenBuildFiles, []);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const allProjectText = (await Promise.all(
  (await walk(root, new Set(["node_modules", ".next", "_archive", ".git", "test-results", ".playwright-mcp"])))
    .filter((file) => /\.(?:ts|tsx|js|mjs|cjs|json|css)$/i.test(file))
    .map((file) => readFile(file, "utf8"))
)).join("\n");
const dependencyNames = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies });
const protectedToolingDeps = new Set(["next", "react", "react-dom", "typescript", "tailwindcss", "@tailwindcss/postcss", "eslint", "eslint-config-next", "@types/node", "@types/react", "@types/react-dom"]);
const unused = dependencyNames.filter((name) => !protectedToolingDeps.has(name) && !allProjectText.includes(`"${name}"`) && !allProjectText.includes(`'${name}'`));
assert.deepEqual(unused, []);

const packCommand = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "npm";
const packArgs = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm pack --dry-run --json"]
  : ["pack", "--dry-run", "--json"];
const { stdout } = await execFileAsync(packCommand, packArgs, { timeout: 120000, windowsHide: true, maxBuffer: 1024 * 1024 * 10 });
const pack = JSON.parse(stdout)[0];
const packedFiles = pack.files.map((file) => file.path);
const forbiddenPacked = packedFiles.filter((file) => /(^|\/)(?:_archive|test-results|\.next|node_modules|\.env(?:$|\.local)|\.playwright-mcp)|liarline-dock-current|ChatGPT Image/i.test(file));
assert.deepEqual(forbiddenPacked, []);

console.log(JSON.stringify({
  ok: true,
  publicFiles: publicFiles.length,
  publicBytes,
  packedFiles: packedFiles.length,
  packedSize: pack.size
}, null, 2));
