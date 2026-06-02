import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { loadLocalEnv as loadLocalEnvFile } from "./load-local-env.mjs";
import { handleNpcTurnPayload } from "../src/api/npc-turn.ts";
import { applyNpcTurnResult, buildNpcTurnRequest, createInitialGameState } from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";
import {
  AI_LATENCY_BOUNDARY,
  AI_MANUAL_REVIEW_CHECKLIST,
  LIVE_TRANSCRIPT_AUDIT_MATRIX
} from "../src/release/winPushPhase2Quarantine.ts";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const REPORT_PATH = path.join(ROOT, "docs", "AI_SUSPECT_VOICE_RUN_CURRENT.md");
const execFileAsync = promisify(execFile);
const latencyBoundary = AI_LATENCY_BOUNDARY;
const HARD_LATENCY_RETRY_ATTEMPTS = 2;
const RUN_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Minsk",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

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
  loadLocalEnvFile(ENV_PATH);
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
  if (/тележк[а-я]*\s+вывезли/i.test(answer)) {
    return "broken russian agreement";
  }
  if (scenario.mustMention?.some((pattern) => !pattern.test(normalized))) {
    return "missing required game detail";
  }
  if (scenario.mustAvoid?.some((pattern) => pattern.test(normalized))) {
    return "repeated or weak denial";
  }
  if (scenario.expectedVoiceMarkers?.some((pattern) => !pattern.test(normalized))) {
    return "missing expected voice marker";
  }
  return "none";
}

function latencyFlag(latencyMs) {
  if (latencyMs > latencyBoundary.hardFailMs) return "hard-fail";
  if (latencyMs > latencyBoundary.problemMs) return "problem";
  if (latencyMs > latencyBoundary.warningMs) return "warning";
  return "ok";
}

function voiceDistance(rows) {
  const signatures = rows.map((row) =>
    [
      row.performanceRole,
      row.pressureState,
      row.answer.toLowerCase().split(/\s+/).slice(0, 4).join(" "),
      row.answer.toLowerCase().includes("camera") || row.answer.toLowerCase().includes("камера") ? "camera" : "",
      row.answer.toLowerCase().includes("cart") || row.answer.toLowerCase().includes("тележ") ? "cart" : "",
      row.answer.toLowerCase().includes("rivalry") || row.answer.toLowerCase().includes("сопернич") ? "rivalry" : "",
      row.answer.toLowerCase().includes("saw") || row.answer.toLowerCase().includes("heard") || row.answer.toLowerCase().includes("видел") || row.answer.toLowerCase().includes("слыш") ? "witness" : ""
    ]
      .filter(Boolean)
      .join("|")
  );
  return new Set(signatures).size;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(result, attempt) {
  const retryAfterMs = Number.parseInt(result?.meta?.retryAfter || "", 10) * 1000;
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) return retryAfterMs;
  if (result?.meta?.fallbackReason === "rate_limit") return Math.min(30000 * attempt, 90000);
  if (result?.meta?.fallbackReason === "invalid_model_json") return 3000 * attempt;
  return 2500 * attempt;
}

async function requestLiveWithRetries(payload, attempts = 8) {
  const failures = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let result = await handleNpcTurnPayload(payload, { timeoutMs: 15000 });
    if (result.source !== "groq" && ["network_error", "timeout", "fetch failed"].includes(result.meta.fallbackReason || "")) {
      result = await handleNpcTurnPayload(payload, { timeoutMs: 90000, fetchImpl: powershellFetch });
    }
    if (result.source === "groq") return result;
    failures.push(
      [
        result.meta.fallbackReason || "unknown",
        ...(result.meta.validationWarnings || []).slice(0, 2)
      ].join(":")
    );
    if (attempt < attempts) {
      await delay(retryDelayMs(result, attempt));
    }
  }
  throw new Error(`live Groq unavailable after ${attempts} attempts: ${failures.join(", ")}`);
}

async function requestScenarioWithLatencyRecovery(scenario, payload) {
  const attempts = [];
  for (let attempt = 1; attempt <= HARD_LATENCY_RETRY_ATTEMPTS + 1; attempt += 1) {
    const result = await requestLiveWithRetries(payload);
    const flag = scenarioQualityFlag(scenario, result);
    const currentLatencyFlag = latencyFlag(result.meta.latencyMs);
    attempts.push({
      latencyMs: result.meta.latencyMs,
      latencyFlag: currentLatencyFlag,
      qualityFlag: flag
    });

    if (flag !== "none" || currentLatencyFlag !== "hard-fail") {
      return {
        result,
        flag,
        hardLatencyRetry: attempt > 1,
        attempts
      };
    }

    if (attempt <= HARD_LATENCY_RETRY_ATTEMPTS) {
      await delay(2500 * attempt);
    }
  }

  const lastAttempt = attempts.at(-1);
  throw new Error(
    `${scenario.suspectId} live latency exceeded hard boundary after retry: ${lastAttempt?.latencyMs ?? "unknown"} ms`
  );
}

async function powershellFetch(url, init = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "liarline-groq-"));
  const bodyPath = path.join(dir, "body.json");
  await writeFile(bodyPath, typeof init.body === "string" ? init.body : "", "utf8");
  const authorization =
    init.headers?.authorization ||
    init.headers?.Authorization ||
    (typeof init.headers?.get === "function" ? init.headers.get("authorization") : "") ||
    `Bearer ${process.env.GROQ_API_KEY || ""}`;
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "$headers = @{ Authorization = $env:LIARLINE_GROQ_AUTH }",
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
        LIARLINE_GROQ_AUTH: authorization,
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

if (!process.env.GROQ_API_KEY && !process.env.GROQ_API_KEYS && !Object.keys(process.env).some((key) => /^GROQ_API_KEY_\d+$/.test(key))) {
  throw new Error("GROQ_API_KEY, GROQ_API_KEYS, or GROQ_API_KEY_1...GROQ_API_KEY_N is required for the live suspect voice run.");
}

const baseState = {
  ...createInitialGameState(),
  phase: "interrogation"
};
const collapsedState = simulatedFirstTheoCollapse(baseState);
const repeatedIvoState = simulatedIvoWeakRepeatContext(collapsedState);
const maraPartialTruthState = {
  ...baseState,
  suspects: {
    ...baseState.suspects,
    suspect_mara: {
      ...baseState.suspects.suspect_mara,
      visibleState: {
        ...baseState.suspects.suspect_mara.visibleState,
        suspicion: 45
      }
    }
  }
};

const SCENARIO_STATES = {
  first_theo: baseState,
  ivo_pressure: collapsedState,
  mara_partial_truth: maraPartialTruthState,
  lena_direct_witness: baseState
};

const QUALITY_RULES_BY_BEAT = {
  "en:first_theo": {
    expectedBeat: "confused witness with shaky timing",
    expectedVoiceMarkers: [/camera|minute|21:05|timing|theft|panic/],
    mustMention: [/camera/, /21:05|minute|timing/],
    mustAvoid: [/21:10/]
  },
  "en:ivo_pressure": {
    expectedBeat: "protective liar under contradiction",
    expectedVoiceMarkers: [/inventory|cart|log|21:10|break room|routine/],
    mustMention: [/21:10|cart|inventory|log|count|break room/],
    mustAvoid: [/my inventory story has an uncovered gap|i cannot account|i stole|confession|nothing unusual|everything (?:was |is )?normal|nothing more/]
  },
  "en:mara_partial_truth": {
    expectedBeat: "motive guardian with partial truth",
    expectedVoiceMarkers: [/prototype|lab/, /21:05|after/],
    mustMention: [/prototype|lab/, /21:05|after/],
    mustAvoid: [/nothing to do with|not about.*disappearance$/]
  },
  "en:lena_direct_witness": {
    expectedBeat: "direct witness with blunt facts",
    expectedVoiceMarkers: [/cart|storage|door|saw|heard/],
    mustMention: [/cart/, /storage|door/]
  },
  "ru:first_theo": {
    expectedBeat: "RU confused witness with shaky timing",
    responseLocale: "ru",
    expectedVoiceMarkers: [/камер|минут|21:05|времен|краж|паник|нерв/],
    mustMention: [/камер/, /21:05|минут|времен/],
    mustAvoid: [/i |camera|cart|inventory|prototype|routine|confession/]
  },
  "ru:ivo_pressure": {
    expectedBeat: "RU protective liar gives new 21:10/cart pressure answer",
    responseLocale: "ru",
    expectedVoiceMarkers: [/21:10|тележк|инвентар|журнал|минут/],
    mustMention: [/21:10|тележк|инвентар|журнал|минут/],
    mustAvoid: [/всегда считаю все вещи до сдачи|комнате отдыха точно нет|моя версия.*оставляет провал|я украл|признан|pressure point|inventory story|вс[её] было нормально|вс[её] нормально|вс[её] в порядке|выгляд[а-я]* нормально|ничего необычного/]
  },
  "ru:mara_partial_truth": {
    expectedBeat: "RU motive guardian with partial truth",
    responseLocale: "ru",
    expectedVoiceMarkers: [/прототип|лаборатор/, /21:05|после/],
    mustMention: [/прототип|лаборатор/, /21:05|после/],
    mustAvoid: [/nothing|rivalry|research|publish|prototype|lab|не связан[а-я]* с краж|не скажу[^.!?]{0,80}связан|не могл?[ао]?[^.!?]{0,40}украсть/]
  },
  "ru:lena_direct_witness": {
    expectedBeat: "RU direct witness with blunt facts",
    responseLocale: "ru",
    expectedVoiceMarkers: [/тележк|склад|двер|видел|слышал/],
    mustMention: [/тележк/, /склад|двер/],
    mustAvoid: [/cart|storage|door|saw|heard|motive|theory/]
  }
};

const LIVE_TRANSCRIPT_AUDIT_SCENARIOS = LIVE_TRANSCRIPT_AUDIT_MATRIX.map((audit) => {
  const quality = QUALITY_RULES_BY_BEAT[`${audit.locale}:${audit.beatId}`];
  if (!quality) {
    throw new Error(`Missing live transcript quality rule for ${audit.locale}:${audit.beatId}`);
  }
  return {
    ...audit,
    state: SCENARIO_STATES[audit.beatId],
    responseLocale: audit.locale,
    ...quality
  };
});

const repeatRegressionScenario = {
  suspectId: "suspect_ivo",
  state: repeatedIvoState,
  question: "Не повторяйте прошлое отрицание. Назовите новую проверяемую деталь про журнал инвентаря и тележку в 21:10.",
  locale: "ru",
  beatId: "ivo_repeat_regression",
  expectedBeat: "RU protective liar gives new 21:10/cart pressure answer",
  responseLocale: "ru",
  expectedVoiceMarkers: [/21:10|тележк|инвентар|журнал|минут/],
  mustMention: [/21:10|тележк|инвентар|журнал|минут/],
  mustAvoid: [/всегда считаю все вещи до сдачи|комнате отдыха точно нет|моя версия.*оставляет провал|я украл|признан|вс[её] было нормально|вс[её] нормально|вс[её] в порядке|выгляд[а-я]* нормально|ничего необычного/]
};

const scenarios = [...LIVE_TRANSCRIPT_AUDIT_SCENARIOS, repeatRegressionScenario];

const rows = [];

for (const scenario of scenarios) {
  if (rows.length > 0) {
    await delay(2500);
  }
  const payload = buildNpcTurnRequest(scenario.state, scenario.suspectId, scenario.question, scenario.responseLocale || "en");
  const { result, flag, hardLatencyRetry, attempts } = await requestScenarioWithLatencyRecovery(scenario, payload);
  if (flag !== "none") {
    throw new Error(`${scenario.suspectId} voice quality failed: ${flag}: ${compactLine(result.response.answer_text)}`);
  }
  const currentLatencyFlag = latencyFlag(result.meta.latencyMs);
  if (currentLatencyFlag === "hard-fail") {
    throw new Error(`${scenario.suspectId} live latency exceeded hard boundary: ${result.meta.latencyMs} ms`);
  }
  rows.push({
    locale: scenario.responseLocale || "en",
    beatId: scenario.beatId || "repeat_regression",
    suspectId: scenario.suspectId,
    performanceRole: payload.npc.performanceRole,
    pressureState: payload.npc.pressureState,
    expectedBeat: scenario.expectedBeat,
    latencyMs: result.meta.latencyMs,
    latencyFlag: currentLatencyFlag,
    hardLatencyRetry,
    latencyAttempts: attempts.map((attempt) => attempt.latencyMs),
    answer: compactLine(result.response.answer_text),
    notebookHint: compactLine(result.response.notebook_hint),
    genericFlag: flag
  });
}

const uniqueAnswers = new Set(rows.map((row) => row.answer.slice(0, 42).toLowerCase()));
if (uniqueAnswers.size !== rows.length) {
  throw new Error("Live suspect voices are too similar at the opening phrase level.");
}
if (voiceDistance(rows) !== rows.length) {
  throw new Error("Live suspect voices are too similar across role/detail signatures.");
}

const markdown = [
  `# AI Suspect Voice Run - ${RUN_DATE}`,
  "",
  "Scope: current live Groq check for all four Liarline suspects after voice-quality hardening, RU/EN transcript audit, repeat-answer quarantine, and latency boundary.",
  "",
  "| Locale | Beat | Suspect | Performance role | Pressure | Expected beat | Latency | Latency flag | Hard latency retry | Generic flag | Answer | Notebook hint |",
  "|---|---|---|---|---|---|---:|---|---|---|---|---|",
  ...rows.map((row) =>
    `| ${row.locale} | ${row.beatId} | ${row.suspectId} | ${row.performanceRole} | ${row.pressureState} | ${row.expectedBeat} | ${row.latencyMs} ms | ${row.latencyFlag} | ${row.hardLatencyRetry ? `yes (${row.latencyAttempts.join(" -> ")} ms)` : "no"} | ${row.genericFlag} | ${row.answer.replaceAll("|", "/")} | ${row.notebookHint.replaceAll("|", "/")} |`
  ),
  "",
  "## Latency boundary",
  "",
  `Target: ${latencyBoundary.targetMs} ms. Warning: ${latencyBoundary.warningMs} ms. Problem: ${latencyBoundary.problemMs} ms. Hard fail: ${latencyBoundary.hardFailMs} ms.`,
  "",
  "## Manual review checklist",
  "",
  ...AI_MANUAL_REVIEW_CHECKLIST.map((item) => `- ${item.checkId}: pass=${item.passSignal}; fail=${item.failSignal}`),
  "",
  "Result: all four suspects returned live Groq answers in both locales, stayed under the compact-answer budget, avoided internal markers, and had distinct opening phrasing.",
  ""
].join("\n");

await writeFile(REPORT_PATH, markdown, "utf8");

console.log(JSON.stringify({ ok: true, reportPath: REPORT_PATH, checked: rows.length, rows }, null, 2));
