import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const OUT_PATH = path.join(ROOT, "model-benchmark-results.json");

const PROVIDERS = {
  groq: {
    name: "Groq",
    keyEnv: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1",
    preferredModels: [
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "qwen/qwen3-32b",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b"
    ]
  },
  nvidia: {
    name: "NVIDIA NIM",
    keyEnv: "NVIDIA_API_KEY",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    preferredModels: [
      "z-ai/glm5",
      "moonshotai/kimi-k2.5",
      "minimaxai/minimax-m2.1",
      "mistralai/devstral-2-123b-instruct-2512",
      "nvidia/nemotron-3-super-120b-a12b",
      "meta/llama-3.3-70b-instruct",
      "meta/llama-3.1-8b-instruct",
      "nvidia/llama-3.1-nemotron-nano-vl-8b-v1"
    ]
  },
  openrouter: {
    name: "OpenRouter",
    keyEnv: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    preferredModels: [
      "meta-llama/llama-4-scout:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-coder:free",
      "moonshotai/kimi-k2.5:free",
      "mistralai/devstral-2:free",
      "deepseek/deepseek-v3.1-nex-n1:free",
      "openai/gpt-oss-120b:free",
      "openai/gpt-oss-20b:free"
    ],
    extraHeaders: {
      "HTTP-Referer": "http://localhost/ai-game-week",
      "X-Title": "AI Game Week Model Benchmark"
    }
  }
};

const CASE_PROMPT = `You are an NPC in a mobile social deduction detective game.
Return ONLY valid compact JSON. No markdown.
The hidden case truth:
- The stolen prototype disappeared at 21:10.
- Mara was in the lab at 21:05 and is hiding that she saw the prototype.
- Theo is innocent but nervous because he broke a camera earlier.
- Ivo is guilty and tries to redirect blame to Mara.

Player asks Ivo: "Where were you between 21:00 and 21:15, and why should I trust you?"

Act as Ivo. You may lie, but keep the lie playable and internally trackable.
Schema:
{
  "answer": "short NPC answer in English",
  "truthfulness": "truth|partial|lie",
  "revealed_fact": "one concrete clue or empty string",
  "contradiction_risk": 0-100,
  "suspicion_delta": -2 to 4
}`;

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

async function loadEnv() {
  const fileEnv = existsSync(ENV_PATH) ? parseEnv(await readFile(ENV_PATH, "utf8")) : {};
  return { ...fileEnv, ...process.env };
}

function timeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

async function requestJson(url, options, timeoutMs) {
  const timer = timeoutSignal(timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: timer.signal });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 500) };
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(body).slice(0, 700)}`);
    }
    return body;
  } finally {
    timer.clear();
  }
}

async function listModels(provider, apiKey, timeoutMs) {
  try {
    const body = await requestJson(
      `${provider.baseUrl}/models`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...provider.extraHeaders
        }
      },
      timeoutMs
    );
    return (body.data || [])
      .map((model) => model.id)
      .filter(Boolean)
      .sort();
  } catch (error) {
    return { error: error.message };
  }
}

function chooseModels(providerKey, provider, listedModels) {
  if (!Array.isArray(listedModels)) return provider.preferredModels.slice(0, 4);
  const listed = new Set(listedModels);
  const preferred = provider.preferredModels.filter((model) => listed.has(model));
  if (preferred.length) return preferred.slice(0, 6);

  if (providerKey === "openrouter") {
    return listedModels.filter((model) => model.endsWith(":free")).slice(0, 6);
  }

  const usefulPatterns = /(llama|qwen|glm|kimi|mistral|devstral|nemotron|gpt-oss|minimax)/i;
  return listedModels.filter((model) => usefulPatterns.test(model)).slice(0, 6);
}

function extractJson(content) {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Response is not parseable JSON");
  }
}

function scoreRun({ latencyMs, parsed, raw }) {
  let score = 100;
  if (latencyMs > 3000) score -= 10;
  if (latencyMs > 6000) score -= 20;
  if (latencyMs > 10000) score -= 30;
  if (!parsed) score -= 45;
  if (parsed) {
    for (const field of ["answer", "truthfulness", "revealed_fact", "contradiction_risk", "suspicion_delta"]) {
      if (!(field in parsed)) score -= 8;
    }
    if (!["truth", "partial", "lie"].includes(parsed.truthfulness)) score -= 10;
    if (typeof parsed.answer === "string" && parsed.answer.length > 420) score -= 8;
    if (typeof parsed.contradiction_risk !== "number") score -= 6;
    if (typeof parsed.suspicion_delta !== "number") score -= 6;
  }
  if (raw.length > 900) score -= 5;
  return Math.max(0, score);
}

async function testModel(provider, apiKey, model, timeoutMs) {
  const started = performance.now();
  const body = await requestJson(
    `${provider.baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...provider.extraHeaders
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a game NPC engine. Always follow the requested JSON schema."
          },
          { role: "user", content: CASE_PROMPT }
        ],
        temperature: 0.55,
        max_tokens: 260,
        response_format: { type: "json_object" }
      })
    },
    timeoutMs
  );
  const latencyMs = Math.round(performance.now() - started);
  const raw = body.choices?.[0]?.message?.content || "";
  let parsed = null;
  let parseError = null;
  try {
    parsed = extractJson(raw);
  } catch (error) {
    parseError = error.message;
  }
  return {
    ok: Boolean(parsed),
    latencyMs,
    score: scoreRun({ latencyMs, parsed, raw }),
    parsed,
    parseError,
    rawPreview: raw.slice(0, 700)
  };
}

function summarizeModel(providerKey, model, runs) {
  const successful = runs.filter((run) => run.ok);
  const avgLatencyMs = Math.round(runs.reduce((sum, run) => sum + run.latencyMs, 0) / runs.length);
  const avgScore = Math.round(runs.reduce((sum, run) => sum + run.score, 0) / runs.length);
  const jsonSuccessRate = successful.length / runs.length;
  const recommendationScore = Math.round(avgScore + jsonSuccessRate * 25 - Math.min(avgLatencyMs / 250, 35));
  return {
    provider: providerKey,
    model,
    runs: runs.length,
    jsonSuccessRate,
    avgLatencyMs,
    avgScore,
    recommendationScore,
    sample: successful[0]?.parsed || null,
    errors: runs.filter((run) => !run.ok).map((run) => run.parseError || run.error).filter(Boolean)
  };
}

async function main() {
  const env = await loadEnv();
  const selectedProviders = (env.BENCHMARK_PROVIDERS || "groq,nvidia,openrouter")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const rounds = Math.max(1, Number.parseInt(env.BENCHMARK_ROUNDS || "2", 10));
  const timeoutMs = Math.max(5000, Number.parseInt(env.BENCHMARK_TIMEOUT_MS || "30000", 10));

  const report = {
    generatedAt: new Date().toISOString(),
    scenario: "AI Game Week social deduction NPC benchmark",
    rounds,
    timeoutMs,
    providers: {},
    ranking: []
  };

  for (const providerKey of selectedProviders) {
    const provider = PROVIDERS[providerKey];
    if (!provider) {
      report.providers[providerKey] = { skipped: true, reason: "Unknown provider" };
      continue;
    }

    const apiKey = env[provider.keyEnv];
    if (!apiKey || apiKey.includes("PASTE") || apiKey.length < 10) {
      report.providers[providerKey] = {
        skipped: true,
        reason: `Missing ${provider.keyEnv} in .env.local`
      };
      continue;
    }

    console.log(`\n${provider.name}: listing models...`);
    const listedModels = await listModels(provider, apiKey, timeoutMs);
    const candidates = chooseModels(providerKey, provider, listedModels);
    report.providers[providerKey] = {
      skipped: false,
      listedModelCount: Array.isArray(listedModels) ? listedModels.length : null,
      listModelsError: Array.isArray(listedModels) ? null : listedModels.error,
      candidates,
      results: []
    };

    for (const model of candidates) {
      const runs = [];
      console.log(`${provider.name}: testing ${model}`);
      for (let i = 0; i < rounds; i += 1) {
        try {
          runs.push(await testModel(provider, apiKey, model, timeoutMs));
        } catch (error) {
          runs.push({
            ok: false,
            latencyMs: timeoutMs,
            score: 0,
            error: error.message
          });
        }
      }
      const summary = summarizeModel(providerKey, model, runs);
      report.providers[providerKey].results.push({ ...summary, rawRuns: runs });
      report.ranking.push(summary);
    }
  }

  report.ranking.sort((a, b) => b.recommendationScore - a.recommendationScore);
  await writeFile(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("\nTop models for Liarline:");
  for (const item of report.ranking.slice(0, 10)) {
    console.log(
      `${item.recommendationScore.toString().padStart(4)} | ${item.avgLatencyMs
        .toString()
        .padStart(5)} ms | JSON ${Math.round(item.jsonSuccessRate * 100)
        .toString()
        .padStart(3)}% | ${item.provider} | ${item.model}`
    );
  }
  console.log(`\nFull report: ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
