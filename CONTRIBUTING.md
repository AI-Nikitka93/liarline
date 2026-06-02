# Contributing

Liarline is a contest/demo repository. Contributions should keep the one-case Devpost build stable, playable, and honest.

## Local Setup

```bash
npm install
npm run dev
```

For live AI testing, copy `.env.example` to `.env.local` and set a server-only Groq key:

```bash
GROQ_API_KEY=your_key_here
```

Never commit `.env.local`, raw API keys, provider tokens, local screenshots, or generated archives.

## Before Opening A PR

Run the smallest useful check set for your change:

```bash
npm run build
npm run test:game-engine
npm run test:npc-turn
npm run test:demo-route
npm run test:ui-copy
npm run test:mobile-ui
```

For release-facing or judge-facing changes, also run:

```bash
npm run test:public-docs
npm run test:project-hygiene
npm run test:contest-final-packet
npm run test:judge-readiness
```

## Scope Rules

- Keep public copy honest: one playable case, mobile browser, live AI suspect dialogue, deterministic game engine.
- Do not claim multiplayer, voice/video interrogation, unlimited generated cases, accounts, or a playable multi-case season.
- Do not move the hidden truth table into live AI prompts.
- Do not make fallback-only behavior look like live AI.
- Keep RU/EN copy parity when changing player-facing text.

## Pull Requests

Use the PR template. Include summary, rationale, test evidence, risk notes, and screenshots for UI changes.
