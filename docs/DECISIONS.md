# Liarline Decisions

This file keeps only public-facing product and engineering decisions. Full internal planning history is archived under `_archive/agent-memory/docs/`.

## Core Product

- Liarline is submitted as one polished mobile-browser detective case.
- The public hook is: AI suspects can lie, but only evidence can convict.
- The player experience starts with interrogation, not a long briefing.
- The first release focuses on six core systems: Interrogation, Suspicion, Contradiction, Notebook, Accusation, Resolution.
- Future season, deeper trial, and larger evidence-board ideas are not presented as current playable scope.

## AI Boundary

- AI performs suspect dialogue only.
- The hidden truth table stays in deterministic game state.
- AI does not receive the real culprit/motive table.
- Model output is parsed and validated before it affects gameplay.
- Broken AI output, timeout, or rate limit produces a safe in-character fallback instead of breaking the game.

## Technical Direction

- Next.js App Router is the application shell.
- The client calls only the internal `/api/npc-turn` route.
- Groq credentials are read from server env only: `GROQ_API_KEY`, optional `GROQ_API_KEYS`, and optional numbered `GROQ_API_KEY_1...N`.
- `/api/npc-turn` fails over to the next configured Groq key on rate limits, temporary provider errors, or invalid/revoked-key responses.
- LocalStorage is the save mechanism for the hackathon build.
- RU/EN localization is handled through separated dictionaries.

## Visual Direction

- Mobile-first neo-noir interrogation terminal.
- CSS/DOM, typography, portraits, evidence textures, borders, and motion carry the visual style.
- No complex custom illustration dependency is required for the current release.
- Public assets live under `public/assets/`.
- Raw generated assets and rejected visual drafts stay out of the public bundle.

## Release Boundary

- Release `0.1.0` includes the one-case game and excludes the future season, full trial system, and larger evidence board from current claims.
- Visual assets in `public/assets/` are project-owned curated generated assets with raw generations archived outside the public bundle.
- Release monitoring is local outcome logging only: gameplay milestones and failure categories, not prompts, secrets, personal data, or raw AI responses.
- Manual rollback for this release is a clean in-game restart or restoring the last verified package if the published link drifts.
