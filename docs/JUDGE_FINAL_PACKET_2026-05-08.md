# Liarline Judge Final Packet - 2026-05-08

Purpose: keep the final Devpost submission at a strict 100 ceiling after the external demo video URL is available. This file is for final review, video recording, and paste-ready submission checks.

## FINAL 100 GATE

Run before final Devpost submit:

```bash
npm run build
npm run test:game-engine
npm run test:npc-turn
npm run test:live-suspects
npm run test:demo-route
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

Strict final gate after uploading video:

```powershell
$env:LIARLINE_PUBLIC_URL="https://liarline.vercel.app"
$env:LIARLINE_GITHUB_URL="https://github.com/AI-Nikitka93/liarline"
$env:LIARLINE_DEMO_VIDEO_URL="https://youtu.be/YOUR_VIDEO_ID"
$env:LIARLINE_STRICT_SUBMISSION="1"
npm run test:judge-readiness
```

Passing local gates without `LIARLINE_DEMO_VIDEO_URL` proves local package quality only. It does not prove a complete Devpost submission.

## Rule-to-proof map

| Contest rule / score area | Submission proof | Local proof command |
|---|---|---|
| Playable mobile browser game, no downloads | `https://liarline.vercel.app` opens directly to the game | `npm run test:release-browser` |
| Meaningful AI use | Groq `llama-3.1-8b-instant` performs suspect dialogue in the interrogation loop | `npm run test:npc-turn` and `npm run test:live-suspects` |
| Technical execution | Deterministic engine owns truth, clue unlocks, AP, accusation, and resolution | `npm run build` and `npm run test:game-engine` |
| Creativity and fun | Judge route shows AI suspect answer, contradiction, persona shift, accusation, and rating | `npm run test:demo-route` and `npm run test:release-playthrough` |
| Mobile support | Mobile dock, keyboard-safe actions, visual states, and no download surface | `npm run test:mobile-ui` and `npm run test:release-browser` |
| Submission quality | README, Devpost copy, AI-use explanation, and no-overclaim boundary | `npm run test:public-docs` and `npm run test:contest-final-packet` |

## Devpost paste fields

Short description:

Liarline is a mobile-browser AI detective game where suspects can lie in live dialogue, but only evidence can convict. The player interrogates four suspects, catches a contradiction, builds a notebook, and makes one final accusation in a polished one-case mystery.

AI use:

Groq `llama-3.1-8b-instant` performs short suspect dialogue during interrogation. The model receives public case facts, one suspect profile, allowed knowledge, recent conversation, and the player question. It never receives the hidden truth table. The deterministic game engine validates the response and owns clue unlocks, suspicion changes, contradiction state, accusation outcome, rating, and resolution. If AI is unavailable, Liarline shows a visible fallback answer and keeps the case playable without pretending it was live AI.

Built with:

Next.js App Router, React, Tailwind CSS v4, Lucide React, Groq, LocalStorage, Playwright, TypeScript.

## 60-second judge path

1. Open the mobile link and show there is no download step.
2. Tap the first question and let the first AI suspect answer appear.
3. Point out the core boundary: the AI performs a suspect, but the engine owns truth.
4. Show the camera-vs-cart contradiction reveal.
5. Switch pressure to Ivo and show the persona shift.
6. Open the notebook so the evidence is visible.
7. Submit final accusation with suspect, motive, and evidence.
8. Show resolution and detective rating.

## Video recording checklist

- Record in a phone-sized viewport or real phone browser.
- Keep the first AI answer in the first 20 seconds.
- Show the visible contradiction payoff, not only a transcript.
- Show the notebook/evidence record before accusation.
- Show final resolution and detective rating.
- If the run uses fallback, label it honestly and do not call it live AI.
- Do not record stale UI from an old build.
- Keep final video between 1 and 3 minutes.

## External blockers

- Demo video must be uploaded to a supported public URL.
- Devpost profile/form must honestly satisfy student-only eligibility and team size rules.
- Final GitHub repo must include the current code state intended for judging.

## Do not claim

- Three-case season.
- Full trial system.
- Voice interrogation.
- Video interrogation.
- Unlimited case generation.
- Multiplayer.
- That fallback footage is live Groq.

## Final judge framing

Lead with this sentence:

AI suspects can lie, but only evidence can convict.

Then prove it in the demo: live suspect performance first, deterministic contradiction second, evidence-based accusation third.
