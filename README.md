# Liarline

Liarline is a mobile-browser AI detective game built for Devpost AI Game Week.

The hook is simple: AI suspects can lie, but only evidence can convict. The language model performs suspect dialogue, while the deterministic game engine keeps the hidden truth table, clue unlocks, accusation result, and win/loss logic under local control.

Playable release: https://liarline.vercel.app

## Current Playable Scope

- One polished detective case.
- Four suspects with different pressure behavior.
- Mobile-first interrogation UI.
- Live AI suspect answers through a server-side Groq proxy.
- Deterministic clue, contradiction, suspicion, accusation, and resolution rules.
- RU/EN localization switch with saved locale.
- LocalStorage save state.
- Safe fallback answers when AI is unavailable or returns invalid output.

## Contest Fit

- Playable in a mobile browser.
- No app download required.
- AI is part of gameplay, not decoration.
- The hidden truth is never delegated to the AI model.
- Submission story: the player interrogates suspects, catches contradictions, and proves the case through evidence.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

For live AI interrogation, create `.env.local` from `.env.example` and set:

```bash
GROQ_API_KEY=your_key_here
```

Without a valid key, the game still uses safe fallback answers so the flow does not break.

## Verification

```bash
npm run build
npm run test:game-engine
npm run test:npc-turn
npm run test:demo-route
npm run capture:release-screenshots
npm run test:ui-copy
npm run test:mobile-ui
npm run test:visual-dna
npm run test:visual-assets
npm run test:release-security
npm run test:public-docs
npm run test:project-hygiene
npm run test:release-contracts
npm run test:release-monitoring
npm run test:release-ops
npm run test:release-postlaunch
npm run test:release-playthrough
npm run test:release-browser
npm run test:contest-final-packet
npm run test:judge-readiness
```

## AI Boundary

- The model performs suspects only.
- The hidden truth table stays in the local game state.
- The engine decides clue unlocks, contradiction, suspicion changes, accusation result, rating, and resolution.
- Fallback answers are visibly marked and do not spend action points, unlock clues, or move suspicion.

## Troubleshooting

- AI unavailable: confirm `GROQ_API_KEY` exists in `.env.local`, then run `npm run test:npc-turn`. The game remains playable through guarded fallback if the provider is unavailable.
- Fallback appears during demo: do not describe that run as live AI. Restart and retry after the provider recovers.
- Broken or stale progress: press `Restart` in the top bar. Corrupted saves are isolated and a clean local case starts.
- Browser layout issue: run `npm run test:browser-smoke` and check a 390px-wide viewport first.
- Localization issue: switch RU/EN in-game and run `npm run test:ui-copy` plus `npm run test:browser-phase7-polish`.
- Release package hygiene: run `npm run test:release-security`, `npm run test:public-docs`, and `npm run test:project-hygiene` before publishing or submitting.
- Release go/no-go: run `npm run test:release-contracts`, `npm run test:release-playthrough`, `npm run test:release-browser`, `npm run test:release-monitoring`, and `npm run test:release-postlaunch`.
- Release ops: run `npm run test:release-ops` before using feedback, triage, limitations, or recovery playbooks in a submission workflow.
- Post-launch readiness: run `npm run test:release-postlaunch` before hotfix, freshness, changelog, parity, rehearsal, or first-observation decisions.
- Judge readiness: run `npm run test:contest-final-packet` plus `npm run test:judge-readiness` for the local package gate; run judge readiness with `LIARLINE_STRICT_SUBMISSION=1` plus public game, GitHub, and demo-video URLs before final Devpost submission.

## Key Files

- `src/app/` - Next.js App Router shell and API wrapper.
- `src/components/` - mobile game UI.
- `src/game/` - deterministic game state and rules.
- `src/state/GameStore.tsx` - LocalStorage-backed game store.
- `src/ai/` - AI contracts, prompt generation, validation, fallback.
- `src/i18n/dictionaries.ts` - RU/EN copy and localized case data.
- `docs/GAME_ARCHITECTURE.md` - architecture and AI contract.
- `docs/visual-spec.md` - mobile visual direction.
- `docs/MASTER_TODO.md` - active win-push plan for AI quality, mobile/button proof, visual differentiation, release, and post-launch hardening.
- `docs/SUBMISSION.md` - Devpost submission copy and demo path.
- `docs/SUBMISSION_PACKAGE.md` - 100-point judge gate, required Devpost URLs, paste-ready copy, and strict submission check.
- `docs/JUDGE_FINAL_PACKET_2026-05-08.md` - final rule-to-proof map, Devpost paste fields, video checklist, and no-overclaim boundary.
- `docs/RELEASE.md` - release version notes, go/no-go checklist, asset provenance, outcome monitoring, hotfix criteria, freshness cycle, launch rehearsal, and first-observation rules.
- `DESIGN.md` - Stitch/coding-agent visual handoff.

## Public Scope Guardrail

This repo should describe the playable one-case game honestly. Future ideas such as a multi-case season, larger evidence board, or deeper trial system are product direction, not current submission promises.
