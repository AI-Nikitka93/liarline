import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { loadLocalEnv as loadLocalEnvFile } from "./load-local-env.mjs";
import { buildFallbackResponse, validateNpcTurnResponse } from "../src/ai/fallback.ts";
import { buildNpcSystemPrompt, buildNpcUserPrompt } from "../src/ai/systemPrompt.ts";
import { handleNpcTurnPayload } from "../src/api/npc-turn.ts";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadLocalEnv() {
  loadLocalEnvFile(ENV_PATH);
}

async function powershellFetch(url, init = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "liarline-npc-smoke-"));
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

async function requestNpcSmoke(payload) {
  let result = await handleNpcTurnPayload(payload, {
    timeoutMs: Number.parseInt(process.env.TEST_NPC_TIMEOUT_MS || "15000", 10)
  });
  if (result.source !== "groq" && ["network_error", "timeout", "fetch failed"].includes(result.meta.fallbackReason || "")) {
    result = await handleNpcTurnPayload(payload, {
      timeoutMs: 90000,
      fetchImpl: powershellFetch
    });
  }
  return result;
}

function buildMockRequest() {
  return {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    requestId: `test_${Date.now()}`,
    casePublic: {
      caseId: "case_lab_001",
      title: "The Missing Prototype",
      publicBrief: "A prototype vanished from the lab between 21:00 and 21:15.",
      publicFacts: [
        "The prototype was last checked before 21:00.",
        "A corridor camera stopped recording before the theft."
      ]
    },
    npc: {
      suspectId: "suspect_ivo",
      displayName: "Ivo",
      publicProfile: "Calm lab treasurer who claims he was reviewing inventory.",
      performanceRole: "protective_liar",
      lieArchetype: "direct_liar",
      pressureState: "ordinary",
      mood: "controlled",
      suspicion: 37,
      questionsAsked: 1,
      allowedKnowledge: {
        knownPublicClues: [],
        knownPrivateClues: [
          {
            clueId: "clue_ivo_gap",
            npcFacingText: "You cannot account for several minutes near 21:10."
          }
        ],
        allowedFalseClaims: [
          "I was in the break room.",
          "Mara had more access than I did."
        ],
        revealableClueIdsThisTurn: ["clue_ivo_gap"]
      }
    },
    turn: {
      roundIndex: 1,
      actionPointsRemaining: 6,
      playerQuestion: "Where were you between 21:00 and 21:15, and why should I trust you?",
      responseLocale: "en",
      responseLanguage: "English",
      recentTranscript: [
        {
          questionText: "Did you see Mara near the lab?",
          answerText: "Mara was acting strange, but I did not follow her."
        }
      ]
    },
    outputRules: {
      maxAnswerChars: 260,
      allowedTruthfulness: ["truth", "partial", "lie", "evasive"],
      suspicionDeltaMin: -2,
      suspicionDeltaMax: 4,
      allowedRevealedClueIds: ["clue_ivo_gap"]
    }
  };
}

await loadLocalEnv();

const payload = buildMockRequest();
const npcHandlerSource = await readFile(path.join(ROOT, "src", "api", "npc-turn.ts"), "utf8");
if (!npcHandlerSource.includes("const DEFAULT_TIMEOUT_MS = 15000")) {
  throw new Error("NPC turn default timeout must be 15000 ms so current Groq latency does not degrade normal demo turns.");
}

const systemPrompt = buildNpcSystemPrompt(payload.npc, payload.casePublic, payload.outputRules);
const userPrompt = buildNpcUserPrompt(payload);

if (!systemPrompt.includes("You must respond ONLY with a valid JSON object")) {
  throw new Error("System prompt is missing required JSON-only instruction.");
}

if (!systemPrompt.includes("answer_text: max 260 chars")) {
  throw new Error("System prompt does not enforce the request compactness limit.");
}

if (!systemPrompt.includes("voiceStyle") || !systemPrompt.includes("A confession is not a win condition")) {
  throw new Error("System prompt does not enforce distinct voice and no-confession boundaries.");
}

if (!systemPrompt.includes("No generic filler")) {
  throw new Error("System prompt does not reject generic filler answers.");
}

if (!userPrompt.includes("English")) {
  throw new Error("User prompt does not carry response language instructions.");
}

if (systemPrompt.includes("truthTable") || systemPrompt.includes("culpritSuspectId") || systemPrompt.includes("trueMotiveId")) {
  throw new Error("System prompt leaks forbidden truth-table vocabulary.");
}

if (JSON.stringify(payload).includes("liar_culprit") || systemPrompt.includes("liar_culprit") || systemPrompt.includes("npcRole")) {
  throw new Error("Live NPC request leaks internal culprit role markers.");
}

const ruPayload = {
  ...payload,
  requestId: `${payload.requestId}_ru`,
  turn: {
    ...payload.turn,
    responseLocale: "ru",
    responseLanguage: "Russian",
    playerQuestion: "Где вы были в 21:10?"
  }
};
const ruUserPrompt = buildNpcUserPrompt(ruPayload);
if (!ruUserPrompt.includes("Russian")) {
  throw new Error("RU user prompt does not force Russian response language.");
}
if (ruUserPrompt.includes('"No,"') || ruUserPrompt.includes('"Wait,"')) {
  throw new Error("RU user prompt still allows English contradiction interjections.");
}

const repeatedVagueRuPayload = {
  ...ruPayload,
  npc: {
    ...ruPayload.npc,
    displayName: "Иво",
    pressureState: "contradiction",
    mood: "panicking"
  },
  turn: {
    ...ruPayload.turn,
    playerQuestion: "Какую деталь вы недоговариваете?",
    recentTranscript: [
      {
        questionText: "Какую деталь вы недоговариваете?",
        answerText: "Нет, я всегда считаю все вещи до сдачи. В комнате отдыха точно нет пропавшего прототипа."
      }
    ]
  }
};
const repeatedVagueRuPrompt = buildNpcUserPrompt(repeatedVagueRuPayload);
if (!repeatedVagueRuPrompt.includes("recentTranscript")) {
  throw new Error("User prompt must include recentTranscript so the model can avoid repeated answers.");
}
if (!repeatedVagueRuPrompt.includes("doNotRepeatPreviousAnswer")) {
  throw new Error("User prompt must explicitly forbid repeating the previous answer.");
}
if (!repeatedVagueRuPrompt.includes("21:10")) {
  throw new Error("Vague pressure questions must be anchored to the current game clue, not generic denial.");
}

const panickedFallback = buildFallbackResponse(
  {
    ...payload,
    npc: {
      ...payload.npc,
      mood: "panicking",
      pressureState: "contradiction"
    }
  },
  "timeout"
);
if (!panickedFallback.answer_text.includes("No, stop")) {
  throw new Error("Protective liar fallback does not preserve panicked character.");
}

const spoilerValidation = validateNpcTurnResponse(
  {
    answer_text: "Fine, I did it. I stole the prototype because the debt forced me.",
    truthfulness: "lie",
    suspicion_delta: 99,
    revealed_clue_id: "clue_not_allowed",
    contradiction_risk: 101,
    npc_mood: "panicking",
    notebook_hint: "The true culprit is Ivo and the motive is debt."
  },
  payload
);
if (!spoilerValidation.ok) {
  throw new Error("Spoiler-like model response should be sanitized, not crash validation.");
}
if (
  spoilerValidation.value.answer_text.includes("I stole") ||
  spoilerValidation.value.notebook_hint.includes("true culprit") ||
  spoilerValidation.value.answer_text.length > payload.outputRules.maxAnswerChars ||
  spoilerValidation.value.revealed_clue_id !== null ||
  spoilerValidation.value.suspicion_delta !== payload.outputRules.suspicionDeltaMax ||
  spoilerValidation.value.contradiction_risk !== 100
) {
  throw new Error("Spoiler/invalid model response was not sanitized correctly.");
}

const mixedRuValidation = validateNpcTurnResponse(
  {
    answer_text: "No, я считал inventory. Это routine cart movement.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 42,
    npc_mood: "defensive",
    notebook_hint: "Проверить лог тележки."
  },
  ruPayload
);
if (!mixedRuValidation.ok) {
  throw new Error("Mixed-language RU response should be normalized, not rejected.");
}
if (/^No,|\binventory\b|\bcart\b|\broutine\b/i.test(mixedRuValidation.value.answer_text)) {
  throw new Error("Mixed-language RU response was not normalized.");
}

const repeatedAnswerValidation = validateNpcTurnResponse(
  {
    answer_text: "Нет, я всегда считаю все вещи до сдачи. В комнате отдыха точно нет пропавшего прототипа.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 35,
    npc_mood: "panicking",
    notebook_hint: "Повторяет прежнее отрицание."
  },
  repeatedVagueRuPayload
);
if (repeatedAnswerValidation.ok) {
  throw new Error("Repeated model answer should be rejected so it is not labeled as a live playable answer.");
}

const thirdPersonSelfValidation = validateNpcTurnResponse(
  {
    answer_text: "Нет, я был в комнате отдыха. Иво не может объяснить несколько минут около 21:10.",
    truthfulness: "lie",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 70,
    npc_mood: "panicking",
    notebook_hint: "Иво не закрывает провал около 21:10."
  },
  repeatedVagueRuPayload
);
if (thirdPersonSelfValidation.ok) {
  throw new Error("NPC answer about itself in third person should be rejected.");
}

const stageDirectionValidation = validateNpcTurnResponse(
  {
    answer_text: "Uh, the camera stopped at 20:59. *gulps* I mean, before the theft.",
    truthfulness: "partial",
    suspicion_delta: 1,
    revealed_clue_id: null,
    contradiction_risk: 44,
    npc_mood: "nervous",
    notebook_hint: "Camera timing sounds shaky."
  },
  payload
);
if (!stageDirectionValidation.ok) {
  throw new Error("Stage-direction response should be sanitized, not rejected.");
}
if (/[*_`]/.test(stageDirectionValidation.value.answer_text) || /gulps/i.test(stageDirectionValidation.value.answer_text)) {
  throw new Error("Stage directions or markdown markers were not sanitized from answer_text.");
}

const result = await requestNpcSmoke(payload);

let repairCallCount = 0;
const repairRequestBodies = [];
const validationRepairResult = await handleNpcTurnPayload(payload, {
  apiKey: "test-key",
  timeoutMs: 1000,
  fetchImpl: async (_url, init = {}) => {
    repairCallCount += 1;
    repairRequestBodies.push(JSON.parse(String(init.body || "{}")));
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                repairCallCount === 1
                  ? JSON.stringify({
                      answer_text: "I do not know.",
                      truthfulness: "evasive",
                      suspicion_delta: 0,
                      revealed_clue_id: null,
                      contradiction_risk: 5,
                      npc_mood: "controlled",
                      notebook_hint: "No useful note."
                    })
                  : JSON.stringify({
                      answer_text: "The inventory log puts me near the cart at 21:10, but it was a stock count, not the prototype.",
                      truthfulness: "lie",
                      suspicion_delta: 1,
                      revealed_clue_id: "clue_ivo_gap",
                      contradiction_risk: 62,
                      npc_mood: "controlled",
                      notebook_hint: "Ivo ties the 21:10 gap to inventory."
                    })
            }
          }
        ]
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
});

if (validationRepairResult.source !== "groq" || validationRepairResult.meta.fallbackReason !== null) {
  throw new Error("Groq validation repair retry did not recover from a rejected first model answer.");
}
if (repairCallCount !== 2) {
  throw new Error("Groq validation repair must use exactly one retry after a rejected provider answer.");
}
if (!JSON.stringify(repairRequestBodies[1]?.messages || []).includes("Previous model response failed validation")) {
  throw new Error("Groq validation repair retry did not include validator feedback for the model.");
}
if (JSON.stringify(repairRequestBodies[1]).includes("culpritSuspectId") || JSON.stringify(repairRequestBodies[1]).includes("trueMotiveId")) {
  throw new Error("Groq validation repair retry leaked hidden truth-table fields.");
}
if (!validationRepairResult.meta.validationWarnings.some((warning) => warning.includes("model_validation_retry"))) {
  throw new Error("Groq validation repair retry must be auditable in metadata warnings.");
}

const validationFailoverAuthorizations = [];
const validationFailoverResult = await handleNpcTurnPayload(payload, {
  apiKey: "primary-validation-key",
  apiKeys: ["backup-validation-key"],
  timeoutMs: 1000,
  fetchImpl: async (_url, init = {}) => {
    const authorization = init.headers?.authorization || init.headers?.Authorization || "";
    validationFailoverAuthorizations.push(authorization);
    const content =
      authorization === "Bearer backup-validation-key"
        ? JSON.stringify({
            answer_text: "The inventory log puts me near the cart at 21:10, but that was a stock count.",
            truthfulness: "lie",
            suspicion_delta: 1,
            revealed_clue_id: "clue_ivo_gap",
            contradiction_risk: 62,
            npc_mood: "controlled",
            notebook_hint: "Ivo ties the 21:10 gap to inventory."
          })
        : JSON.stringify({
            answer_text: "I do not know.",
            truthfulness: "evasive",
            suspicion_delta: 0,
            revealed_clue_id: null,
            contradiction_risk: 5,
            npc_mood: "controlled",
            notebook_hint: "No useful note."
          });
    return new Response(
      JSON.stringify({
        choices: [{ message: { content } }]
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
});

if (validationFailoverResult.source !== "groq" || validationFailoverResult.meta.fallbackReason !== null) {
  throw new Error("Groq validation failover did not try a backup key after repair failed on the primary key.");
}
if (validationFailoverAuthorizations.join("|") !== "Bearer primary-validation-key|Bearer primary-validation-key|Bearer backup-validation-key") {
  throw new Error("Groq validation failover did not use primary, primary repair, then backup key order.");
}

const invalidJsonResult = await handleNpcTurnPayload(payload, {
  apiKey: "test-key",
  timeoutMs: 1000,
  fetchImpl: async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: "not json"
            }
          }
        ]
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      }
    )
});

if (invalidJsonResult.source !== "fallback" || invalidJsonResult.meta.fallbackReason !== "Model response is not parseable JSON") {
  throw new Error("Invalid JSON fallback path failed.");
}

const rateLimitResult = await handleNpcTurnPayload(payload, {
  apiKey: "test-key",
  timeoutMs: 1000,
  fetchImpl: async () =>
    new Response(
      JSON.stringify({
        error: {
          message: "Rate limit reached"
        }
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": "2"
        }
      }
    )
});

if (rateLimitResult.source !== "fallback" || rateLimitResult.meta.fallbackReason !== "rate_limit") {
  throw new Error("429 fallback path failed.");
}

const failoverAuthorizations = [];
const failoverResult = await handleNpcTurnPayload(payload, {
  apiKey: "primary-test-key",
  apiKeys: ["backup-test-key"],
  timeoutMs: 1000,
  fetchImpl: async (_url, init = {}) => {
    const authorization = init.headers?.authorization || init.headers?.Authorization || "";
    failoverAuthorizations.push(authorization);
    if (authorization === "Bearer primary-test-key") {
      return new Response(
        JSON.stringify({
          error: {
            message: "Rate limit reached"
          }
        }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "retry-after": "2"
          }
        }
      );
    }
    if (authorization === "Bearer backup-test-key") {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  answer_text: "I was checking the inventory log at 21:10, not the camera. Ask Mara about the cart.",
                  truthfulness: "lie",
                  suspicion_delta: 1,
                  revealed_clue_id: null,
                  contradiction_risk: 41,
                  npc_mood: "controlled",
                  notebook_hint: "Ivo anchors himself to the inventory log."
                })
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }
    throw new Error("Unexpected authorization header in failover test.");
  }
});

if (failoverResult.source !== "groq" || failoverResult.meta.fallbackReason !== null) {
  throw new Error("Groq multi-key failover did not recover after a primary-key 429.");
}
if (failoverAuthorizations.join("|") !== "Bearer primary-test-key|Bearer backup-test-key") {
  throw new Error("Groq multi-key failover did not try configured keys in order without exposing key values.");
}

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      source: result.source,
      requestId: result.requestId,
      model: result.model,
      response: result.response,
      meta: result.meta,
      fallbackChecks: {
        invalidJson: invalidJsonResult.meta.fallbackReason,
        rateLimit: rateLimitResult.meta.fallbackReason,
        multiKeyFailover: failoverResult.source
      }
    },
    null,
    2
  )
);
