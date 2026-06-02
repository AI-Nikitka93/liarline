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
npm run test:demo-video-package
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
npm run test:production-layout
npm run test:contest-final-packet
npm run test:judge-readiness
npm run test:win-push-phase1
npm run test:win-push-phase1-readiness
npm run test:win-push-phase2-ai-quality
npm run test:win-push-phase2-quarantine
npm run test:win-push-phase3-provider-proof
```

Strict final gate after uploading video:

```powershell
$env:LIARLINE_PUBLIC_URL="https://liarline.vercel.app"
$env:LIARLINE_GITHUB_URL="https://github.com/AI-Nikitka93/liarline"
$env:LIARLINE_DEMO_VIDEO_URL=$env:REAL_UPLOADED_LIARLINE_DEMO_VIDEO_URL
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
| Demo video package | Local EN/RU video package is 1-3 minutes, recorded from current production alias, narrated, captioned, and no-overclaim | `npm run test:demo-video-package` |
| Mobile support | Mobile dock, keyboard-safe actions, visual states, 44px tap targets, and no download surface | `npm run test:mobile-ui`, `npm run test:release-browser`, and `npm run test:production-layout` |
| Submission quality | README, Devpost copy, AI-use explanation, and no-overclaim boundary | `npm run test:public-docs` and `npm run test:contest-final-packet` |
| Current contest/source truth | 2026-05-08 Devpost facts, active TODO source, score-risk baseline, AI-game anti-patterns, and no-drift anchor | `npm run test:win-push-phase1` |
| Current readiness truth | `docs/AI_PROVIDER_STATUS_CURRENT.md`, external dependency map, backup AI decision, skill-stack decision, and risk baseline are current for 2026-05-08 | `npm run test:win-push-phase1-readiness` |
| AI actor quality | Failure-mode quarantine, suspect voice rubrics, first Theo wow, Ivo persona shift, Mara/Lena voice distance, and no final-answer model language | `npm run test:win-push-phase2-ai-quality` |
| AI answer quarantine | Playable prompt language, allowed game anchors, generic/internal/repeat rejection, non-impacting fallback, bilingual transcript audit, manual review checklist, and latency boundary | `npm run test:win-push-phase2-quarantine` |
| Provider and proof-chain fairness | Backup-provider no-switch decision, secret-safe matrix, live regressions, camera-vs-cart proof chain, accusation risk, rating fairness, and motive parity | `npm run test:win-push-phase3-provider-proof` |

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
- Use `docs/videos/liarline-demo-en-v1.mp4` as the primary upload candidate after `npm run test:demo-video-package` passes.

## External blockers

- Demo video package exists locally, but the selected video must still be uploaded to a supported public URL.
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
