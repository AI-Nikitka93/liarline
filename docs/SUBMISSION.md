# Liarline Devpost Submission Draft

Verification date: 2026-05-06.

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

## Playable Release Summary

- Current release scope: one playable case.
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

## Judging Alignment

- AI Integration: AI answers are part of the interrogation loop, while deterministic validation prevents hallucinations from deciding the case.
- Creativity & Fun: the core fantasy is catching a lying AI suspect with evidence.
- Technical Execution: client-side state, server-side AI proxy, schema validation, fallback handling, and repeatable demo route.
- Mobile Support: mobile-first layout, safe-area handling, touch-sized actions, compact chat, and keyboard-aware interrogation controls.

## Required Pre-Submit Checklist

- Production build passes.
- Game opens on a real phone or phone-sized browser viewport.
- Demo route reaches resolution without manual fixes.
- Live AI path works with `GROQ_API_KEY`.
- Fallback path remains playable without exposing internal errors.
- Public copy does not overpromise future scope.
