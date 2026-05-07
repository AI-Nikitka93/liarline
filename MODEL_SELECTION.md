# Model Selection for AI Game Week

Date: 2026-05-05
Game direction: Liarline - mobile AI social deduction detective.

## Decision

Primary live gameplay model:

```txt
Provider: Groq
Model: llama-3.1-8b-instant
Use: live NPC interrogation, short JSON turns, mobile gameplay
```

Why:
- Focused Groq benchmark: 5/5 valid JSON responses.
- Average latency: 825 ms.
- Best reliability under repeated calls.
- Good enough NPC deception output for a turn-based detective game.

Secondary / quality model:

```txt
Provider: Groq
Model: llama-3.3-70b-versatile
Use: offline case generation, final verdict text, richer suspect profiles
```

Why:
- First cross-provider benchmark showed excellent quality and 100% JSON on 2/2 runs.
- Focused 5-run benchmark degraded to 60% JSON success / network failures, so it is not safe as the primary live model.

Do not use as primary live model right now:

```txt
Groq meta-llama/llama-4-scout-17b-16e-instruct
Groq qwen/qwen3-32b
NVIDIA NIM free hosted models
OpenRouter free models
```

Reason:
- Llama 4 Scout was valid in the first run but too slow for repeated live calls and failed in the focused run.
- Qwen failed strict JSON mode on Groq.
- NVIDIA had many timeout/degraded/internal server errors.
- OpenRouter free models are useful as fallback but too rate-limited and inconsistent for core gameplay.

## Benchmark Evidence

All-provider run:

| Rank | Provider | Model | JSON | Avg Latency | Score |
|---:|---|---|---:|---:|---:|
| 1 | Groq | llama-3.3-70b-versatile | 100% | 1048 ms | 121 |
| 2 | Groq | llama-3.1-8b-instant | 100% | 896 ms | 121 |
| 3 | OpenRouter | openai/gpt-oss-20b:free | 100% | 3253 ms | 102 |
| 4 | Groq | meta-llama/llama-4-scout-17b-16e-instruct | 100% | 5816 ms | 72 |
| 5 | NVIDIA | meta/llama-3.3-70b-instruct | 100% | 7291 ms | 66 |

Focused Groq run:

| Rank | Model | Runs | JSON | Avg Latency | Score |
|---:|---|---:|---:|---:|---:|
| 1 | llama-3.1-8b-instant | 5 | 100% | 825 ms | 122 |
| 2 | llama-3.3-70b-versatile | 5 | 60% | 10641 ms | 28 |
| 3 | meta-llama/llama-4-scout-17b-16e-instruct | 5 | 0% | 20000 ms | -35 |
| 4 | qwen/qwen3-32b | 5 | 0% | 20000 ms | -35 |

## Implementation Recommendation

Use a two-model routing strategy:

1. During active play, call `llama-3.1-8b-instant`.
2. Before a case starts, optionally use `llama-3.3-70b-versatile` once to generate richer case material, then cache it.
3. Keep deterministic game state as source of truth. The model only acts as an NPC performer.
4. Require compact JSON from every live call.
5. Add local fallback responses for rate-limit or timeout failures.

## Files

- Full first run: archived locally outside the public package.
- Latest focused run: archived locally outside the public package.
- Benchmark script: `tools/model-benchmark.mjs`
