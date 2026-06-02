# Liarline Submission Package

Verification date: 2026-05-09.

Purpose: keep the Devpost package judge-ready without mixing local build truth with external submission fields.

## 100-point judge gate

Run this local package gate before publishing or updating the Devpost entry:

```bash
npm run test:judge-readiness
npm run test:contest-final-packet
npm run test:win-push-phase7-submission
```

The gate checks:

- Local project is a git repository.
- `.env.local` remains ignored.
- README, release notes, contest requirements, and Devpost copy exist.
- Browser tests can start the local mobile release server themselves.
- Devpost-required external fields are named and validated when strict mode is enabled.
- `docs/JUDGE_FINAL_PACKET_2026-05-08.md` stays aligned with the contest rules, demo route, paste-ready fields, and no-overclaim boundaries.

Strict mode is the final submission check:

```bash
LIARLINE_PUBLIC_URL=https://liarline.vercel.app \
LIARLINE_GITHUB_URL=https://github.com/AI-Nikitka93/liarline \
LIARLINE_DEMO_VIDEO_URL="$REAL_UPLOADED_LIARLINE_DEMO_VIDEO_URL" \
LIARLINE_STRICT_SUBMISSION=1 \
npm run test:judge-readiness
```

On Windows PowerShell:

```powershell
$env:LIARLINE_PUBLIC_URL="https://liarline.vercel.app"
$env:LIARLINE_GITHUB_URL="https://github.com/AI-Nikitka93/liarline"
$env:LIARLINE_DEMO_VIDEO_URL=$env:REAL_UPLOADED_LIARLINE_DEMO_VIDEO_URL
$env:LIARLINE_STRICT_SUBMISSION="1"
npm run test:judge-readiness
```

## Playable mobile link

Required for Devpost: a public HTTPS link that opens the game directly in a mobile browser with no app download.

Current playable link:

- https://liarline.vercel.app

Acceptance:

- Opens on a real phone or a 390px mobile viewport.
- First-question CTA is visible without reading long instructions.
- No horizontal overflow.
- No app-store or download surface.
- `/api/npc-turn` can reach Groq when `GROQ_API_KEY` is configured on the host.
- Fallback is visible and playable if Groq times out or rate-limits.

Local proof:

```bash
npm run build
npm run test:demo-video-package
npm run test:release-browser
npm run test:production-layout
npm run test:browser-smoke
```

## Demo video package

Required for Devpost: a public 1-3 minute video URL showing the current game.

Current local upload candidates:

- `docs/videos/liarline-demo-en-v1.mp4` - primary English Devpost video, recorded from `https://liarline.vercel.app/`.
- `docs/videos/liarline-demo-ru-v1.mp4` - Russian companion video.

Local proof:

```bash
npm run test:demo-video-package
```

Passing this gate proves the local video files, manifests, captions, audio stream, keyframes, current production deploy id, and no-overclaim boundary. It does not prove Devpost strict readiness until the selected video is uploaded and `LIARLINE_DEMO_VIDEO_URL` points at the public video URL.

## GitHub repository

Required for Devpost: public repo with current code.

Current GitHub repository:

- https://github.com/AI-Nikitka93/liarline

Acceptance:

- Repo is public before submission.
- `.env.local`, `_archive/`, `.next/`, `node_modules/`, and `test-results/` are not committed.
- README explains setup, live AI key, fallback behavior, and one-case scope.
- Public docs do not promise future features as playable.

Local proof:

```bash
git status --short
npm run test:release-security
npm run test:public-docs
npm run test:project-hygiene
```

## Demo video

Required for Devpost: 1-3 minutes showing the actual playable game.

Current demo video URL:

- Not uploaded yet. This remains the final external blocker for a true strict 100-point package.

Required beats:

- First AI wow: a suspect gives a compact live answer.
- Deterministic contradiction reveal.
- Persona shift under pressure.
- Notebook/evidence record.
- Final accusation with suspect, motive, and evidence.
- Resolution and detective rating.

No-go:

- Do not describe fallback footage as live Groq.
- Do not imply a three-case season, full trial system, voice, video interrogation, multiplayer, or unlimited generated cases.
- Do not record stale UI from an old build.

Local proof:

```bash
npm run test:demo-route
npm run test:release-playthrough
```

## Devpost short description

Paste-ready version:

Liarline is a mobile-browser AI detective game where suspects can lie in live dialogue, but only evidence can convict. The player interrogates four suspects, catches a contradiction, builds a notebook, and makes one final accusation in a polished one-case mystery.

## Final submission packet

short description:

Liarline is a mobile-browser AI social deduction detective game where suspects can lie, but only evidence can convict.

What it does:

Players interrogate four AI-performed suspects in one playable prototype-theft case, catch a guaranteed contradiction, compare Notebook evidence, and make one final accusation.

AI use:

Groq `llama-3.1-8b-instant` performs compact NPC dialogue through `/api/npc-turn`. The hidden truth table, clue unlocks, AP spend, accusation result, and resolution stay deterministic in the local game engine.

Built with:

Next.js App Router, React, Tailwind CSS v4, Lucide React, Groq API, LocalStorage persistence, Playwright, and Node release gates.

Demo route:

Start first question, show first live AI answer, connect camera-vs-cart contradiction, pressure Ivo after persona shift, open Notebook, submit Ivo/debt/two clues, show Resolution.

No-overclaim boundary:

Current release is one playable case. It does not include multiplayer, voice/video interrogation, accounts, unlimited generated cases, a full trial system, or a playable multi-case season.

Demo video script:

The 1-3 minute recording must show first AI answer inside the first 20 seconds, contradiction, persona shift, Notebook, accusation, and Resolution. Do not record old screenshots or fallback-run footage as live AI. Strict readiness still needs a real demo video URL in `LIARLINE_DEMO_VIDEO_URL`.

## AI use explanation

Paste-ready version:

Groq `llama-3.1-8b-instant` performs short suspect dialogue during interrogation. The model receives public case facts, one suspect profile, allowed knowledge, and the player question. It never receives the hidden truth table. The deterministic game engine validates the response and owns clue unlocks, suspicion changes, contradiction state, accusation outcome, rating, and resolution. If AI is unavailable, Liarline shows a visible fallback answer and keeps the case playable without pretending it was live AI.

## Final score ceiling

- Local package complete, but no public URL/video/GitHub env values: ceiling is 88 because Devpost may treat the submission as incomplete.
- Strict mode passes with playable URL, GitHub URL, and demo video URL: ceiling is 100 from a packaging/compliance standpoint.

The game quality still depends on the recorded demo route and live provider behavior during the final capture.
