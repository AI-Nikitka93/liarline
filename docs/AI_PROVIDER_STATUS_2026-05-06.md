# AI Provider Status

Verification date: 2026-05-06.

Closed scope: T014, T156.

Sources:
- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq `llama-3.1-8b-instant`: https://console.groq.com/docs/model/llama-3.1-8b-instant
- Groq `llama-3.3-70b-versatile`: https://console.groq.com/docs/model/llama-3.3-70b-versatile
- Groq status: https://status.groq.com/
- Local benchmark: `MODEL_SELECTION.md`
- Runtime smoke: `npm run test:npc-turn`

## Selected Provider

Primary provider remains Groq.

## Primary Live Gameplay Model

Model: `llama-3.1-8b-instant`

Official status checked:
- Listed in Groq docs on 2026-05-06.
- Supports JSON Object Mode.
- Supports tool use.
- Official model page shows approximate token speed around 560 tps.
- Official context window: 131,072 tokens.
- Free plan rate limits page lists:
  - 30 RPM.
  - 14.4K RPD.
  - 6K TPM.
  - 500K TPD.

Local status:
- `MODEL_SELECTION.md` selected it for live NPC turns after 5/5 valid JSON responses and 825 ms average latency in focused benchmark.
- Browser smoke on 2026-05-06 produced a live Groq answer in 444 ms after one timeout fallback.

Decision:
- Keep as primary live gameplay model.
- Keep compact prompts and short outputs.
- Keep 15 second live-turn timeout and fallback; the earlier 8 second ceiling degraded normal demo turns when Groq responses landed around 12 seconds.
- Keep live dialogue under the free-plan token budget; the official free-plan limit is 6K TPM for this model.

## Offline / Enrichment Model

Model: `llama-3.3-70b-versatile`

Official status checked:
- Listed in Groq docs on 2026-05-06.
- Supports JSON Object Mode.
- Supports tool use.
- Official model page shows approximate token speed around 280 tps.
- Official context window: 131,072 tokens.
- Official max output tokens: 32,768.
- Free plan rate limits page lists:
  - 30 RPM.
  - 1K RPD.
  - 12K TPM.
  - 100K TPD.

Local status:
- Earlier all-provider run showed high quality.
- Focused run degraded to 60% JSON success and high latency.

Decision:
- Use only for offline case enrichment or pre-game content generation.
- Do not use in live interrogation.

## Fallback Risk

Observed:
- Groq Status reported Fully operational on 2026-05-06, with no known issues affecting systems.
- `npm run test:npc-turn` completed through safe timeout fallback on 2026-05-06.
- Invalid JSON and 429 fallback checks were verified.
- Browser smoke showed both a timeout fallback path and a live Groq response path.

Required guard:
- Keep live AI source labels visible.
- Never hide fallback as live Groq.
- Keep deterministic truth independent from provider output.
- Before submission, run `npm run test:npc-turn` and one browser live turn again.
- Treat official Groq rate limits as organization-level and volatile; if a 429 appears, the app must stay playable through fallback.

## Release Provider Check

Pass:
- Official model pages still list `llama-3.1-8b-instant` and `llama-3.3-70b-versatile`.
- Both model pages still list JSON Object Mode.
- Official rate-limit page still lists free-plan limits for both selected models.
- Official status page reports no active system issue.

No-go:
- Primary model removed or loses structured output support.
- Status page shows active API outage during final recording.
- Runtime smoke returns only fallback in repeated attempts while the demo claims live AI.
- Rate-limit failures prevent reaching the first AI answer and pressure response.

## Provider Decision

No provider switch now.

Reason:
- Groq still exposes both selected models.
- Primary model still supports JSON Object Mode.
- The current implementation already handles timeout, invalid JSON, and rate limit fallback.
- Switching providers would create more risk than value before the hackathon deadline.
