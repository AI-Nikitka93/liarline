# Release 0.1.0

Release date: 2026-05-07.

## Included mechanics

- Interrogation.
- Suspicion.
- Contradiction.
- Notebook.
- Accusation.
- Resolution.
- AI suspect performance with safe fallback.
- RU/EN localization.

## Consciously excluded future scope

- Three-case season.
- Full trial system.
- Large evidence board.
- Voice or video interrogation.
- Multiplayer.
- Unlimited generated cases.

## Go / No-Go

Status: GO.

Required checks:

- `npm run build`
- `npm run test:game-engine`
- `npm run test:release-playthrough`
- `npm run test:release-browser`
- `npm run test:release-monitoring`
- `npm run test:release-contracts`
- `npm run test:judge-readiness`
- `npm run test:release-security`
- `npm run test:project-hygiene`

Closed blockers:

- Unsafe secret exposure.
- Unplayable fallback path.
- Mobile browser requires app download.
- AI decides hidden truth.

Manual rollback:

- Use the in-game `Restart` control for a clean local case.
- If live AI fails during the demo, keep the playable fallback run or restore the last verified package.

## Asset provenance

- All release PNGs under `public/assets/` are curated generated assets owned by this project.
- Raw generations and rejected drafts stay under `_archive/raw-generated-assets/`.
- Release assets passed watermark, mobile readability, size, and public bundle checks.
- Reference materials are inspiration only: no copied asset, layout, text, or brand surface is included in the release.

## Outcome monitoring

The release records local outcome events in browser storage for debugging and post-demo triage:

- `start_reached`
- `first_ai_answer`
- `contradiction_reached`
- `ai_fail`
- `fallback_used`
- `stuck`
- `reset`
- `accusation_submitted`
- `accusation_fail`
- `resolution_reached`

The monitor stores only compact gameplay outcomes, not prompts, secrets, raw AI responses, or personal data.

## Product metrics

- `start_reached`: the player reached the playable case.
- `first_ai_answer`: the first AI performance beat fired.
- `contradiction_reached`: the evidence-driven payoff was reached.
- `accusation_submitted`: the final decision step was used.
- `resolution_reached`: the case completed.

## Qualitative feedback points

- `confused_first_screen`: the player did not know what to press first.
- `weak_ai_answer`: the first AI answer felt generic or non-human.
- `missed_contradiction`: the contradiction reveal was missed or misunderstood.
- `unfair_accusation`: the accusation result felt unfair.
- `unreadable_notebook`: the Notebook was difficult to read or use.

## Recovery playbooks

AI access falls during demo:

- User-safe action: continue with the visible fallback label or restart after provider recovery.
- Operator action: check `GROQ_API_KEY`, run `npm run test:npc-turn`, and do not describe fallback footage as live AI.

Saved state breaks the game:

- User-safe action: use `Restart` for a clean local case.
- Operator action: verify corrupted saves are isolated with `npm run test:browser-phase7-polish`.

Release link shows the wrong version:

- User-safe action: stop the demo from that build.
- Operator action: restore the last verified package and run `npm run test:release-browser && npm run test:release-contracts`.

## Known limitations

- One case: current release is one polished case, not a multi-case season.
- Simplified proof check: final proof uses suspect, motive, and evidence.
- Weak/Strong confidence: confidence stays coarse so it does not solve the case for the player.
- One hint button: recovery is intentionally small and only appears after a dead-end.

## Feedback intake

- Feedback intake is local and lightweight.
- It records category, feedback point, severity, and a short sanitized note.
- It does not create a support platform, account system, public inbox, or external analytics dependency.
- It must not store raw AI answers, prompts, secrets, personal data, or full transcripts.

## Triage procedure

- Gameplay confusion: unclear first screen, missed contradiction, unfair accusation.
- AI quality: generic answer, weak persona, fallback confusion.
- Mobile bugs: keyboard, scroll, dock, viewport, touch problems.
- Localization: mixed RU/EN labels or unnatural translation.
- Visual polish: contrast, Notebook readability, clutter, hierarchy.
- Performance: slow load, lag, long waiting states.

## Hotfix criteria

- Fix now: unplayable path to Resolution, hidden truth leak, broken first AI answer, broken Restart, broken fallback, or mobile blocker covering critical actions.
- Follow-up: repeated confusion around Notebook, Weak/Strong, accusation fairness, or AI voice when the game remains completable.
- Future scope: more cases, full trial, multiplayer, voice, unlimited generated cases, or any feature outside the six release systems.

## Freshness review cycle

- AI access: before each patch, re-check Groq model availability, rate limits, response errors, fallback copy, and `npm run test:npc-turn` against `https://console.groq.com/docs/model/llama-3.1-8b-instant` and `https://console.groq.com/docs/rate-limits`.
- Contest rules: before submission, re-check Devpost AI Game Week requirements against `https://ai-game-week-29908.devpost.com/`, `docs/SUBMISSION.md`, and `docs/CONTEST_REQUIREMENTS_2026-05-06.md`.
- Dependency risk: before each patch, re-check lockfile, package manifest, security check, and build without unsafe forced downgrades.
- Browser behavior: weekly after launch and after layout changes, re-check mobile viewport, virtual keyboard, fixed dock, and in-app browser behavior against MDN VisualViewport / viewport guidance and project browser checks.

## Fastest-aging external knowledge

- Groq model/rate-limit status.
- Devpost challenge requirements and submission fields.
- Dependency/security advisory state.
- Mobile browser viewport and keyboard behavior.

## Post-release changelog discipline

Each post-release entry must include:

- What changed.
- Why it changed.
- Player impact.
- Verification command.
- No-drift check against: AI suspects can lie, but only evidence can convict.

## Release parity checks

- Demo route must match first AI answer, contradiction, persona shift, collapse, accusation, and Resolution.
- Screenshots must show the current release UI, not old briefing or stale mock screens.
- README must describe exactly one playable case, safe fallback, and deterministic truth boundaries.
- Submission copy must not promise a season, full trial, voice, or unlimited generated cases.

## Launch rehearsal

- Open the playable link on a 390px mobile viewport.
- Run the deterministic demo route from first answer to Resolution.
- Capture only verified current release footage.
- Run fallback story and confirm it remains playable and visibly labeled.
- Confirm no no-go blocker remains after build, browser, security, and post-launch checks.

## Judge readiness

- Local gate: `npm run test:judge-readiness`.
- Strict Devpost gate: set `LIARLINE_PUBLIC_URL`, `LIARLINE_GITHUB_URL`, `LIARLINE_DEMO_VIDEO_URL`, and `LIARLINE_STRICT_SUBMISSION=1`, then run `npm run test:judge-readiness`.
- Local package without public URL, GitHub URL, and demo video URL has an honest score ceiling of 88 because Devpost can treat missing external artifacts as incomplete.
- Strict mode passing with the three public artifacts raises the packaging/compliance ceiling to 100; the video still must show current release UI and must not call fallback footage live AI.

## First playthrough observations

- Fast-player route reaches the first question immediately through the suspect-first CTA.
- Stuck risk concentrates around Notebook comparison after contradiction.
- Strongest AI-wow beat is first nervous answer into contradiction pressure and persona shift.
- Interest can drop if transcript cards stack too far above the action dock on narrow screens.

## First-minute hook check

- Suspect face is visible before explanation-heavy reading.
- First-question CTA is visible and primary.
- First AI answer reads as suspect performance and leads into contradiction/persona shift without external explanation.
