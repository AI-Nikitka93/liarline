import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { handleNpcTurnPayload } from "../src/api/npc-turn.ts";
import { applyNpcTurnResult, buildNpcTurnRequest, createInitialGameState } from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const REPORT_PATH = path.join(ROOT, "docs", "AI_SUSPECT_VOICE_RUN_2026-05-06.md");
const execFileAsync = promisify(execFile);

function parseEnv(raw) {
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadLocalEnv() {
  if (!existsSync(ENV_PATH)) return;
  const parsed = parseEnv(await readFile(ENV_PATH, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (!(key in process.env)) process.env[key] = value;
  }
}

function simulatedFirstTheoCollapse(state) {
  const question = "Camera failed between 21:00 and 21:15. What exact minute are you unsure about?";
  const request = buildNpcTurnRequest(state, FIRST_INTERROGATION_SUSPECT_ID, question, "en");
  return applyNpcTurnResult(state, FIRST_INTERROGATION_SUSPECT_ID, question, {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "I... I hit the camera before the theft. I panicked about the missing footage, not the cart.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 70,
      npc_mood: "nervous",
      notebook_hint: "Camera panic does not explain the cart."
    },
    meta: {
      latencyMs: 0,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  });
}

function simulatedIvoWeakRepeatContext(state) {
  const question = "Какую деталь вы недоговариваете?";
  const request = buildNpcTurnRequest(state, "suspect_ivo", question, "ru");
  return applyNpcTurnResult(state, "suspect_ivo", question, {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "Нет, я всегда считаю все вещи до сдачи. В комнате отдыха точно нет пропавшего прототипа.",
      truthfulness: "lie",
      suspicion_delta: 1,
      revealed_clue_id: null,
      contradiction_risk: 40,
      npc_mood: "panicking",
      notebook_hint: "Ответ повторяет инвентарную версию."
    },
    meta: {
      latencyMs: 0,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  });
}

function compactLine(text) {
  return text.replace(/\s+/g, " ").trim();
}

function hasInternalLeak(text) {
  return /liar_culprit|npcRole|truthTable|culpritSuspectId|trueMotiveId|\bclue[a-z0-9]{6,}\b/i.test(text);
}

function genericFlag(result) {
  const answer = result.response.answer_text.toLowerCase();
  if (answer.length < 18) return "too short";
  if (answer.length > 260) return "too long";
  if (hasInternalLeak(answer)) return "internal marker leak";
  if (/as an ai|language model|i cannot roleplay/i.test(answer)) return "model broke character";
  return "none";
}

function scenarioQualityFlag(scenario, result) {
  const answer = result.response.answer_text;
  const normalized = answer.toLowerCase();
  const baseFlag = genericFlag(result);
  if (baseFlag !== "none") return baseFlag;
  if (scenario.responseLocale === "ru" && /\b(no|wait|stop|inventory|cart|routine|prototype)\b/i.test(answer)) {
    return "mixed language";
  }
  if (/^(you|вы)\b/i.test(answer.trim()) || /\b(you saw|you heard|you cannot|вы видели|вы слышали|вы не можете)\b/i.test(answer)) {
    return "wrong dialogue perspective";
  }
  if (scenario.mustMention?.some((pattern) => !pattern.test(normalized))) {
    return "missing required game detail";
  }
  if (scenario.mustAvoid?.some((pattern) => pattern.test(normalized))) {
    return "repeated or weak denial";
  }
  return "none";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestLiveWithRetries(payload, attempts = 3) {
  const failures = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let result = await handleNpcTurnPayload(payload, { timeoutMs: 15000 });
    if (result.source !== "groq" && ["network_error", "timeout", "fetch failed"].includes(result.meta.fallbackReason || "")) {
      result = await handleNpcTurnPayload(payload, { timeoutMs: 90000, fetchImpl: powershellFetch });
    }
    if (result.source === "groq") return result;
    failures.push(result.meta.fallbackReason || "unknown");
    if (attempt < attempts) {
      const retryAfterMs = Number.parseInt(result.meta.retryAfter || "", 10) * 1000;
      await delay(Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? retryAfterMs : 2500 * attempt);
    }
  }
  throw new Error(`live Groq unavailable after ${attempts} attempts: ${failures.join(", ")}`);
}

async function powershellFetch(url, init = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "liarline-groq-"));
  const bodyPath = path.join(dir, "body.json");
  await writeFile(bodyPath, typeof init.body === "string" ? init.body : "", "utf8");
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "$headers = @{ Authorization = \"Bearer $env:GROQ_API_KEY\" }",
    "$body = Get-Content -Raw -LiteralPath $env:LIARLINE_GROQ_BODY",
    "try {",
    "  $response = Invoke-RestMethod -Uri $env:LIARLINE_GROQ_URL -Method Post -Headers $headers -ContentType 'application/json' -Body $body -TimeoutSec 75",
    "  $content = $response | ConvertTo-Json -Compress -Depth 16",
    "  $out = [ordered]@{ status = 200; body = [string]$content }",
    "} catch {",
    "  $status = 599",
    "  $content = $_.Exception.Message",
    "  if ($_.Exception.Response) {",
    "    $status = [int]$_.Exception.Response.StatusCode",
    "    $stream = $_.Exception.Response.GetResponseStream()",
    "    if ($stream) { $reader = New-Object System.IO.StreamReader($stream); $content = $reader.ReadToEnd() }",
    "  }",
    "  $out = [ordered]@{ status = $status; body = [string]$content }",
    "}",
    "$out | ConvertTo-Json -Compress -Depth 4"
  ].join("\n");

  try {
    const { stdout } = await execFileAsync("powershell", ["-NoProfile", "-Command", script], {
      env: {
        ...process.env,
        LIARLINE_GROQ_BODY: bodyPath,
        LIARLINE_GROQ_URL: url
      },
      timeout: 90000,
      windowsHide: true,
      maxBuffer: 1024 * 1024
    });
    const parsed = JSON.parse(stdout.trim());
    return new Response(parsed.body, {
      status: parsed.status,
      headers: {
        "content-type": "application/json"
      }
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

await loadLocalEnv();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is required for the live suspect voice run.");
}

const baseState = {
  ...createInitialGameState(),
  phase: "interrogation"
};
const collapsedState = simulatedFirstTheoCollapse(baseState);
const repeatedIvoState = simulatedIvoWeakRepeatContext(collapsedState);

const scenarios = [
  {
    suspectId: "suspect_ivo",
    state: collapsedState,
    question: "The cart log points at inventory. Why does that sound rehearsed?",
    expectedBeat: "protective liar under contradiction",
    mustMention: [/21:10|cart|inventory|log|count|break room/],
    mustAvoid: [/my inventory story has an uncovered gap|i cannot account|i stole|confession/]
  },
  {
    suspectId: "suspect_mara",
    state: baseState,
    question: "What part of your rivalry are you leaving out?",
    expectedBeat: "motive guardian with partial truth"
  },
  {
    suspectId: "suspect_theo",
    state: baseState,
    question: "The camera failed before the theft. What minute are you unsure about?",
    expectedBeat: "confused witness with shaky timing"
  },
  {
    suspectId: "suspect_lena",
    state: baseState,
    question: "State only what you saw about the cart.",
    expectedBeat: "direct witness with blunt facts"
  },
  {
    suspectId: "suspect_ivo",
    state: repeatedIvoState,
    question: "Какой журнал инвентаря доказывает, что вас не было у тележки в 21:10?",
    expectedBeat: "RU protective liar gives new 21:10/cart pressure answer",
    responseLocale: "ru",
    mustMention: [/21:10|тележк|инвентар|журнал|минут/],
    mustAvoid: [/всегда считаю все вещи до сдачи|комнате отдыха точно нет|моя версия.*оставляет провал|я украл|признан/]
  }
];

const rows = [];

for (const scenario of scenarios) {
  const payload = buildNpcTurnRequest(scenario.state, scenario.suspectId, scenario.question, scenario.responseLocale || "en");
  const result = await requestLiveWithRetries(payload);
  const flag = scenarioQualityFlag(scenario, result);
  if (flag !== "none") {
    throw new Error(`${scenario.suspectId} voice quality failed: ${flag}`);
  }
  rows.push({
    suspectId: scenario.suspectId,
    performanceRole: payload.npc.performanceRole,
    pressureState: payload.npc.pressureState,
    expectedBeat: scenario.expectedBeat,
    latencyMs: result.meta.latencyMs,
    answer: compactLine(result.response.answer_text),
    notebookHint: compactLine(result.response.notebook_hint),
    genericFlag: flag
  });
}

const uniqueAnswers = new Set(rows.map((row) => row.answer.slice(0, 42).toLowerCase()));
if (uniqueAnswers.size !== rows.length) {
  throw new Error("Live suspect voices are too similar at the opening phrase level.");
}

const markdown = [
  "# AI Suspect Voice Run - 2026-05-06",
  "",
  "Scope: live Groq check for all four Liarline suspects after T051-T060 hardening.",
  "",
  "| Suspect | Performance role | Pressure | Expected beat | Latency | Generic flag | Answer | Notebook hint |",
  "|---|---|---|---|---:|---|---|---|",
  ...rows.map((row) =>
    `| ${row.suspectId} | ${row.performanceRole} | ${row.pressureState} | ${row.expectedBeat} | ${row.latencyMs} ms | ${row.genericFlag} | ${row.answer.replaceAll("|", "/")} | ${row.notebookHint.replaceAll("|", "/")} |`
  ),
  "",
  "Result: all four suspects returned live Groq answers, stayed under the compact-answer budget, avoided internal markers, and had distinct opening phrasing.",
  ""
].join("\n");

await writeFile(REPORT_PATH, markdown, "utf8");

console.log(JSON.stringify({ ok: true, reportPath: REPORT_PATH, checked: rows.length, rows }, null, 2));
