# Liarline Agent Entry

Goal: build a mobile-browser AI social deduction detective game for Devpost AI Game Week.

Core direction: Liarline, a turn-based detective game where AI acts as NPC dialogue performer while deterministic client-side state decides truth, clues, win, and loss.

Stack:
- Mobile web: Next.js App Router, React, Tailwind CSS v4, Lucide React.
- Live NPC model: Groq `llama-3.1-8b-instant`.
- Offline case/model enrichment: Groq `llama-3.3-70b-versatile`.
- Persistence: LocalStorage first.
- Localization: separated RU/EN dictionaries with LocalStorage locale persistence.
- AI access: serverless HTTP proxy to Groq, no WebSockets.

Key commands:
- `npm run dev` - start the Next.js app locally.
- `npm run build` - production build/type check.
- `npm run test:game-engine` - verify deterministic state, TruthTable guard, clue unlock, AP spend, and accusation resolution.
- `npm run bench:models` - benchmark available AI models.
- `npm run test:npc-turn` - smoke test the Groq NPC-turn integration and fallback paths.
- `npm run test:live-suspects` - live Groq voice differentiation run for all four suspects.
- `npm run test:ui-copy` - verify interrogation thinking copy and AP-cost language.
- `npm run test:mobile-ui` - verify mobile keyboard/dock/risk/fallback UI contracts.
- `npm run test:visual-dna` - verify visual evidence, pattern boundaries, visual elements, and implemented CSS/UI classes.
- `npm run test:visual-assets` - verify current PNG assets, dimensions, size budget, and audit coverage.
- `npm run test:demo-route` - verify the reproducible judge/demo AI route through first answer, contradiction, and persona shift.
- `node sync_state.mjs` - regenerate `docs/state.json` from `docs/STATE.md`.

Project memory:
- `docs/STATE.md` - current source of truth.
- `README.md` - public project overview and local run instructions.
- `docs/SUBMISSION.md` - Devpost copy, demo route, AI-use explanation, and claim guardrails.
- `docs/DECISIONS.md` - concise public product and engineering decisions.
- `docs/CONTEST_REQUIREMENTS_2026-05-06.md` - current AI Game Week requirements and submission guardrails.
- `docs/AI_PROVIDER_STATUS_2026-05-06.md` - current Groq model/rate-limit/fallback status.
- `docs/GAME_ARCHITECTURE.md` - game architecture and AI contracts.
- `docs/visual-spec.md` - visual direction and mobile design rules.
- `docs/MASTER_TODO.md` - active win-push master plan for AI quality, button proof, visual polish, final submission, and post-launch resilience.
- `_archive/agent-memory/docs/` - local-only archived research, anchor reviews, old execution plans, and detailed project history.
- `MODEL_SELECTION.md` - benchmark-backed model decision.
- `src/api/npc-turn.ts` - serverless Groq NPC-turn handler.
- `src/ai/` - non-spoiler NPC performance contracts, prompt, response validation, fallback logic.
- `src/game/` - deterministic game state, seed case, deduction/collapse state, visual element contracts, and engine rules.
- `src/i18n/dictionaries.ts` - Russian and English UI/game copy, localized case data, questions, and AI response language labels.
- `src/state/GameStore.tsx` - client store and LocalStorage persistence.
- `src/components/` - mobile UI screens and shared display components.
- `src/hooks/useKeyboardInset.ts` - mobile virtual-keyboard inset hook for sticky interrogation actions.
- `src/app/` - Next.js App Router shell and `/api/npc-turn` route wrapper.
