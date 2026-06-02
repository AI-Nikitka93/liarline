# Liarline Devpost Submission Draft

Verification date: 2026-05-08.

## Short Description

Liarline is a mobile-browser AI detective game where suspects can lie in live dialogue, but the truth is controlled by a deterministic game engine. The player interrogates four suspects, catches contradictions, gathers evidence, and makes one final accusation in one playable case.

## What It Does

- Opens directly in a mobile browser.
- Starts with a suspect interrogation instead of a long tutorial.
- Uses live AI to perform short suspect answers.
- Keeps the real culprit, motive, clue unlocks, and win/loss checks outside the model.
- Shows suspicion shifts, contradiction reveals, pressure states, and a final detective rating.
- Supports Russian and English localization.
- Falls back safely if the AI provider times out, rate-limits, or returns invalid JSON.

## AI Use

The AI is an actor, not the judge. Groq `llama-3.1-8b-instant` generates compact suspect dialogue from the current suspect profile, allowed knowledge, recent conversation, and selected player question. The model never receives the hidden truth table. The local game engine validates the response and decides whether clues unlock, suspicion changes, or the accusation succeeds.

The local game engine decides truth, evidence unlocks, suspicion changes, accusation outcome, rating, and resolution. AI output can make a suspect sound nervous, evasive, defensive, or panicked, but it cannot convict anyone by itself.

AI actor quality gate: suspect answers are checked for role voice, concrete case detail, language consistency, no invented evidence, no repeated filler, and no final-accusation wording before they count as release-quality live AI.

## Playable Release Summary

- Current release scope: one playable case.
- Devpost/current copy must say one playable case, not a playable season.
- Core loop: interrogate suspects, compare evidence, catch a contradiction, accuse with proof, see resolution.
- Main hook: AI suspects can lie, but only evidence can convict.
- Future direction: a larger season can exist later, but it is not claimed as playable in this submission.

## Demo Video Path

1. Open the game on a mobile-width screen.
2. Press the first interrogation action and show the first AI wow: a nervous answer with a concrete case detail.
3. Let the deterministic game engine trigger the collapse from camera failure vs cart movement.
4. Show the contradiction reveal as a visible action payoff.
5. Show the persona shift: Ivo changes from controlled to panicking under pressure.
6. Open the notebook and show the evidence/contradiction record.
7. Make the final accusation with suspect, motive, and evidence.
8. Show the resolution, truth reconstruction, and detective rating.

Recommended video length: 1-3 minutes.

## Short Demo Script

- Start: "This is a one-case mobile AI detective game. The AI performs suspects, but the engine owns truth."
- First AI wow: ask Theo about the camera and show hesitation, emotion, and a timeline hint.
- Collapse: show that the camera story cannot explain the cart log.
- Contradiction reveal: use the contradiction as pressure, not just a note.
- Persona shift: switch to Ivo and show a panicked pressure answer.
- Accusation: select Ivo, debt pressure, and the two evidence items.
- Resolution: show Sharp/Careful/Reckless/Misled style rating and reverse reconstruction.

## Demo Video Route

- Use the reproducible route guarded by `npm run test:demo-route`.
- Required beats: first AI wow, contradiction reveal, persona shift, collapse, accusation, resolution.
- If live Groq is unstable during recording, show the fallback label honestly and do not describe that run as live AI.

## Current Submission Claims

Safe to claim:

- One playable case.
- Mobile browser game.
- Live AI suspect dialogue.
- Deterministic truth table and accusation result.
- RU/EN localization.
- Safe fallback handling.

Do not claim yet:

- Three-case season.
- Full trial system.
- Voice or video interrogation.
- Unlimited case generation.
- Multiplayer.

This release does not include multiplayer, voice/video interrogation, accounts, unlimited generated cases, a full trial system, or a playable multi-case season.

## Judging Alignment

- AI Integration: AI answers are part of the interrogation loop, while deterministic validation prevents hallucinations from deciding the case.
- Creativity & Fun: the core fantasy is catching a lying AI suspect with evidence.
- Technical Execution: client-side state, server-side AI proxy, schema validation, fallback handling, and repeatable demo route.
- Mobile Support: mobile-first layout, safe-area handling, touch-sized actions, compact chat, and keyboard-aware interrogation controls.

## Current Score-Risk Guardrail

- Highest scoring risk: live AI answers that sound generic, leak state, or miss the first-minute pressure beat.
- Mobile risk: sticky actions, keyboard inset, and long RU/EN labels must remain usable on phone-width screens.
- Proof risk: the demo must make camera-vs-cart evidence visible before accusation.
- Submission risk: strict Devpost readiness is incomplete until the public demo video URL exists.
- Scope risk: this submission stays one polished case; no season, full trial, multiplayer, voice, or procedural case generation is claimed as playable.
- Strict external blocker: the local package is usable now, but complete Devpost readiness still requires public game URL, GitHub URL, and demo video URL in `LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness`.
- Backup AI boundary: no backup provider is claimed as production live fallback until it passes the same NPC-turn, live-suspect, demo-route, security, and browser gates as Groq.

## Required Pre-Submit Checklist

- Production build passes.
- Game opens on a real phone or phone-sized browser viewport.
- Demo route reaches resolution without manual fixes.
- Live AI path works with `GROQ_API_KEY`.
- Fallback path remains playable without exposing internal errors.
- Public copy does not overpromise future scope.
- `npm run test:win-push-phase1` passes after any contest, source-of-truth, AI-practice, score-risk, or anchor wording change.
- `npm run test:win-push-phase1-readiness` passes after any public-claim, provider, backup, dependency, skill-stack, codebase-intelligence, or risk-baseline change.
- `npm run test:win-push-phase2-ai-quality` passes after any NPC prompt, validation, suspect voice, judge-route AI beat, or actor-not-judge change.
- `npm run test:win-push-phase2-quarantine` passes after any AI answer quarantine, playable-anchor, fallback-impact, transcript-audit, or latency-boundary change.
- AI answer quarantine gate: generic filler, internal control leaks, invented evidence, repeated live answers, fallback side effects, bilingual transcript quality, and live latency are executable release checks, not manual claims.
- `npm run test:win-push-phase3-provider-proof` passes after any backup-provider, secret-safe test matrix, proof-chain, accusation, rating, outcome, or motive-localization change.
- Groq performs suspect dialogue, but the deterministic engine owns truth, clues, accusation scoring, detective rating, and win/loss.
