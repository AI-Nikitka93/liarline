# AI Provider Status

Verification date: 2026-05-08.

Closed scope: T014-T016.

Additional closed scope: T041-T046 provider backup and secret-safety decisions.

Sources:
- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq `llama-3.1-8b-instant`: https://console.groq.com/docs/model/llama-3.1-8b-instant
- Groq `llama-3.3-70b-versatile`: https://console.groq.com/docs/model/llama-3.3-70b-versatile
- Groq status: https://status.groq.com/
- Google Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- OpenRouter limits: https://openrouter.ai/docs/api/reference/limits
- Hugging Face Inference Providers pricing: https://huggingface.co/docs/inference-providers/pricing
- Mistral rate-limit tiers: https://docs.mistral.ai/deployment/laplateforme/tier/
- Runtime smoke: `npm run test:npc-turn`
- Live suspect smoke: `npm run test:live-suspects`

## Selected Provider

Primary provider remains Groq.

## Primary Live Gameplay Model

Model: `llama-3.1-8b-instant`

Official status checked:
- Listed in Groq docs on 2026-05-08.
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
- `npm run test:npc-turn` returned a live Groq result.
- `npm run test:live-suspects` returned distinct live answers for all four suspects plus RU Ivo pressure.

Decision:
- Keep as primary live gameplay model.
- Keep compact prompts and short outputs.
- Keep visible source labels and safe fallback.
- Keep deterministic truth independent from provider output.

## Offline / Enrichment Model

Model: `llama-3.3-70b-versatile`

Official status checked:
- Listed in Groq docs on 2026-05-08.
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

Decision:
- Use only for offline case enrichment or pre-game content generation.
- Do not use in live interrogation.

## Current Provider Health

- Groq status page reports fully operational and no known system issues during this refresh.
- Groq rate limits are organization-level and volatile.
- A 429 must keep the game playable through fallback and must not be described as live AI.

## Backup AI Landscape

Google Gemini API:
- Official docs expose structured outputs, function calling, per-project rate limits, and a free usage tier.
- Risk: free-tier limits vary by project/account and community reports show unexpected 429s.
- Decision: backup experiment only, not wired into release.

OpenRouter free models:
- Official docs expose 20 RPM for free model variants and daily limits that depend on credit history.
- Risk: model/provider choice is variable and upstream providers can throttle.
- Decision: backup experiment only, not wired into release.

Hugging Face Inference Providers:
- Official docs expose routed provider access and monthly free credits.
- Risk: tiny free credit, provider-specific behavior, and no verified Liarline live route.
- Decision: offline enrichment only unless separately proven.

Mistral La Plateforme:
- Official docs say the free API tier has restrictive rate limits and production projects should upgrade.
- Risk: workspace-specific limits and no verified Liarline live route.
- Decision: backup experiment only, not wired into release.

## Provider Decision

No provider switch now: `no_provider_switch_before_submission`.

Reason:
- Groq primary live path is verified locally.
- Primary model still supports JSON Object Mode.
- The current implementation handles timeout, invalid JSON, and rate-limit fallback.
- Switching providers before submission would add more risk than value.
- Backup-provider experiments stay off in production until `npm run test:win-push-phase3-provider-proof`, `npm run test:npc-turn`, `npm run test:demo-route`, and `npm run test:live-suspects` pass for the candidate without printing secrets.

No-go:
- Primary model removed or loses structured output support.
- Status page shows active API outage during final recording.
- Runtime smoke returns only fallback in repeated attempts while the demo claims live AI.
- Rate-limit failures prevent reaching the first AI answer and pressure response.
