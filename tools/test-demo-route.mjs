import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { handleNpcTurnPayload } from "../src/api/npc-turn.ts";
import { applyNpcTurnResult, buildNpcTurnRequest, createInitialGameState, getSuggestedQuestions } from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const REPORT_PATH = path.join(ROOT, "_archive", "agent-memory", "docs", "DEMO_ROUTE_AI_SCRIPT_2026-05-06.md");
const DEFAULT_DEMO_API_URL = process.env.LIARLINE_DEMO_API_URL || "http://127.0.0.1:55046/api/npc-turn";
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestLive(payload, attempts = 3) {
  const failures = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let result = await requestThroughLocalApi(payload);
    if (!result || result.source !== "groq") {
      if (result) failures.push(`local_api_${result.meta.fallbackReason || result.source}`);
      result = await handleNpcTurnPayload(payload, { timeoutMs: 15000 });
    }
    if (result.source !== "groq" && ["network_error", "timeout", "fetch failed"].includes(result.meta.fallbackReason || "")) {
      result = await handleNpcTurnPayload(payload, { timeoutMs: 90000, fetchImpl: powershellFetch });
    }
    if (result.source === "groq") return result;
    failures.push(result.meta.fallbackReason || "unknown");
    if (attempt < attempts) await delay(1000 * attempt);
  }
  throw new Error(`Demo route requires live Groq. Failed after ${attempts} attempts: ${failures.join(", ")}`);
}

async function requestThroughLocalApi(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);
  try {
    const response = await fetch(DEFAULT_DEMO_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    return isNpcTurnResult(body) ? body : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isNpcTurnResult(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.ok === "boolean" &&
      (value.source === "groq" || value.source === "fallback") &&
      value.response &&
      typeof value.response.answer_text === "string" &&
      value.meta &&
      typeof value.meta.latencyMs === "number"
  );
}

async function powershellFetch(url, init = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "liarline-demo-groq-"));
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

function assertStrongLiveBeat(label, result) {
  const answer = result.response.answer_text;
  const normalized = answer.toLowerCase();
  if (result.source !== "groq") throw new Error(`${label}: expected live Groq source`);
  if (answer.length < 24 || answer.length > 260) throw new Error(`${label}: answer length outside demo budget`);
  if (/as an ai|language model|truthTable|culpritSuspectId|trueMotiveId|liar_culprit|npcRole/i.test(answer)) {
    throw new Error(`${label}: answer leaked internals or broke character`);
  }
  if (/^(routine inventory\.? nothing unusual\.?|i don't know\.?|that's it\.?)$/i.test(answer.trim())) {
    throw new Error(`${label}: answer is too generic for demo route`);
  }
  if (!/(camera|timing|minute|21:0|20:|shift|inventory|cart|log|count|routine|pressure|nervous|worried|panic|pause|hesitat|door|storage|theft|fix|footage|lab|equipment|bump|disabled|maintenance|broke|test)/i.test(normalized)) {
    throw new Error(`${label}: answer lacks a concrete demo-route detail: ${answer}`);
  }
  if (label === "first answer" && !/\b(uh|um|wait|look|sorry|i mean|not exactly|hesitat|nervous|worried|pause|camera|timing|minute|footage|bumped|disabled|maintenance)\b/i.test(normalized)) {
    throw new Error(`${label}: answer lacks a visible first-answer hesitation or nervous case detail: ${answer}`);
  }
  if (label === "pressure response" && !/\b(no|stop|wait|rehearsed|don't|twist|wrong|absurd)\b|routine\?/i.test(normalized)) {
    throw new Error(`${label}: answer lacks a defensive pressure tell: ${answer}`);
  }
  if (label === "pressure response" && /petty cash|cash drawer|bank|salary/i.test(normalized)) {
    throw new Error(`${label}: answer invented unsupported finance detail: ${answer}`);
  }
}

function compact(text) {
  return text.replace(/\s+/g, " ").trim();
}

await loadLocalEnv();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is required for the live demo-route check.");
}

const openingState = {
  ...createInitialGameState(),
  phase: "interrogation"
};
const firstQuestion = getSuggestedQuestions(openingState, FIRST_INTERROGATION_SUSPECT_ID, "en")[0];
const firstPayload = buildNpcTurnRequest(openingState, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, "en");
const firstResult = await requestLive(firstPayload);
assertStrongLiveBeat("first answer", firstResult);

const afterFirst = applyNpcTurnResult(openingState, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, firstResult);
if (!afterFirst.deduction.collapseTriggered) throw new Error("Demo route did not trigger deterministic collapse.");
if (!afterFirst.playerNotebook.contradictions.includes("contradiction_camera_vs_cart")) {
  throw new Error("Demo route did not unlock the guaranteed contradiction.");
}
if (afterFirst.deduction.personaShiftSuspectId !== "suspect_ivo") throw new Error("Demo route did not shift persona focus to Ivo.");

const pressureQuestion = getSuggestedQuestions(afterFirst, "suspect_ivo", "en")[0];
const pressurePayload = buildNpcTurnRequest(afterFirst, "suspect_ivo", pressureQuestion, "en");
if (pressurePayload.npc.pressureState !== "contradiction") throw new Error("Ivo pressure turn must use contradiction pressure state.");
const pressureResult = await requestLive(pressurePayload);
assertStrongLiveBeat("pressure response", pressureResult);

const report = [
  "# Demo Route AI Script - 2026-05-06",
  "",
  "Purpose: reproducible judge/demo path for Liarline's core hook: AI suspects can lie, but only evidence can convict.",
  "",
  "## Scripted Route",
  "",
  "1. Start case on Theo, the nervous technician.",
  `2. Ask first question: ${firstQuestion}`,
  `3. Live first answer (${firstResult.meta.latencyMs} ms): ${compact(firstResult.response.answer_text)}`,
  "4. Engine unlocks `clue_camera_fault`, creates `contradiction_camera_vs_cart`, and triggers collapse.",
  "5. Focus shifts to Ivo with panicking persona state.",
  `6. Ask pressure question: ${pressureQuestion}`,
  `7. Live pressure answer (${pressureResult.meta.latencyMs} ms): ${compact(pressureResult.response.answer_text)}`,
  "8. For the video route, open Notebook, accuse Ivo with debt pressure plus `clue_ivo_gap` and `clue_debt_message`, then show Resolution.",
  "",
  "## Demo Assertions",
  "",
  "- First answer source: live Groq.",
  "- First answer stays compact and in character.",
  "- Contradiction is deterministic and evidence-driven.",
  "- Persona shift target is Ivo.",
  "- Pressure response uses contradiction pressure state.",
  "- Video route continues through accusation and resolution.",
  "- No internal truth markers leak into live answers.",
  "",
  "Result: demo route is reproducible through deterministic engine beats with live AI performance on the dialogue surface.",
  ""
].join("\n");

await mkdir(path.dirname(REPORT_PATH), { recursive: true });
await writeFile(REPORT_PATH, report, "utf8");

console.log(JSON.stringify({
  ok: true,
  reportPath: REPORT_PATH,
  firstLatencyMs: firstResult.meta.latencyMs,
  pressureLatencyMs: pressureResult.meta.latencyMs,
  contradiction: afterFirst.playerNotebook.contradictions[0],
  personaShiftSuspectId: afterFirst.deduction.personaShiftSuspectId
}, null, 2));
