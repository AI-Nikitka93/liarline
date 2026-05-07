import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "_archive", "agent-memory", "design-evidence");
const OUT_PATH = path.join(OUT_DIR, "github-design-evidence-2026-05-06.json");

const repos = [
  "google-labs-code/design.md",
  "VoltAgent/awesome-design-md",
  "kzhrknt/awesome-design-md-jp",
  "bergside/awesome-design-skills",
  "shaom/brand-to-design-md-skill",
  "hasi98/designpull"
];

const execFileAsync = promisify(execFile);

async function getGitHubToken() {
  const envToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  if (envToken) return { token: envToken, authMode: "env_token_present_redacted" };

  try {
    const { stdout } = await execFileAsync("gh", ["auth", "token"], {
      windowsHide: true,
      timeout: 10000,
      maxBuffer: 1024 * 64
    });
    const ghToken = stdout.trim();
    if (ghToken) return { token: ghToken, authMode: "gh_cli_token_present_redacted" };
  } catch {
    // Fall back to public unauthenticated requests.
  }

  return { token: "", authMode: "unauthenticated_public" };
}

const auth = await getGitHubToken();

function headers() {
  const base = {
    accept: "application/vnd.github+json",
    "user-agent": "liarline-design-evidence",
    "x-github-api-version": "2022-11-28"
  };
  if (auth.token) return { ...base, authorization: `Bearer ${auth.token}` };
  return base;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: headers() });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { parseError: true };
  }
  return { status: response.status, body };
}

function pickRepoFields(fullName, response) {
  if (response.status !== 200 || !response.body) {
    return {
      fullName,
      status: response.status,
      available: false,
      reason: response.body?.message || "unavailable"
    };
  }

  const repo = response.body;
  return {
    fullName,
    status: response.status,
    available: true,
    htmlUrl: repo.html_url,
    description: repo.description,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
    license: repo.license?.spdx_id || "UNKNOWN",
    topics: repo.topics || []
  };
}

const collectedAt = new Date().toISOString();
const results = [];

for (const repoName of repos) {
  const repoResponse = await fetchJson(`https://api.github.com/repos/${repoName}`);
  results.push(pickRepoFields(repoName, repoResponse));
}

const output = {
  collectedAt,
  source: "GitHub REST API",
  authMode: auth.authMode,
  secretHandling: "No token value is printed, written, or stored.",
  repos: results,
  appliedToLiarline: [
    "Keep DESIGN.md at project root for agent/Stitch readability.",
    "Use structured sections: product, visual DNA, tokens, screens, components, states, assets, accessibility, non-goals.",
    "Use references as evidence, not as copied UI.",
    "Keep generated asset workflow single-asset and curated."
  ]
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, outPath: OUT_PATH, authMode: output.authMode, repoCount: results.length }, null, 2));
