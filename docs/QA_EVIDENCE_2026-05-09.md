# QA Evidence 2026-05-09

Scope: T161-T190.

## Judge Routes

- T161 first-minute judge: covered by `npm run test:release-browser` and `npm run test:browser-phase7-submission`; judge sees first AI answer, hook, contradiction/persona-shift next action.
- T162 full-playthrough judge: covered by `npm run test:phase7`, `npm run test:release-playthrough`, and `npm run test:release-browser`; route reaches first AI wow, contradiction, persona shift, Notebook, accusation, Resolution.
- T163 wrong-player: covered by `npm run test:phase7`; wrong accusation resolves as explainable loss, not a bug.
- T164 partial-player: covered by `npm run test:phase7` and `npm run test:browser-phase7-submission`; right suspect with weak proof gives partial/reckless result.
- T165 phone check: automated closest pass is 390x844 viewport with touch-sized controls in `npm run test:mobile-ui`, `npm run test:browser-smoke`, and `npm run test:browser-phase7-submission`.

## Proof Policy

- T166 final QA evidence report: this file maps completed checks to commands and external dependencies.
- T167 release items require proof: test output, browser proof, screenshot, live route, or documented manual check.
- live checks depend on configured keys: `GROQ_API_KEY`, `GROQ_API_KEYS`, or `GROQ_API_KEY_1...N`.
- External strict checks depend on `LIARLINE_PUBLIC_URL`, `LIARLINE_GITHUB_URL`, and `LIARLINE_DEMO_VIDEO_URL`.

## Current External State

- Public game URL: `https://liarline.vercel.app`.
- GitHub repo URL: `https://github.com/AI-Nikitka93/liarline`.
- Demo video URL: not provided yet; strict final judge readiness remains blocked by `LIARLINE_DEMO_VIDEO_URL`.
