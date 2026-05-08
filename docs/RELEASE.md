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
- Final packet gate: `npm run test:contest-final-packet`.
- Strict Devpost gate: set `LIARLINE_PUBLIC_URL`, `LIARLINE_GITHUB_URL`, `LIARLINE_DEMO_VIDEO_URL`, and `LIARLINE_STRICT_SUBMISSION=1`, then run `npm run test:judge-readiness`.
- Strict mode validates URL format and live reachability for the public game and GitHub repository; the video URL still has to be the actual uploaded 1-3 minute demo.
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

## Phase 10 validation checks

- Guaranteed contradiction: release playthrough reaches `contradiction_camera_vs_cart` from the first Theo camera question without using a hint; watch only for repeated feedback that it feels too scripted.
- Persona shift: Ivo shifts into a panicking contradiction state on the demo route; tune pressure wording only if video or first players say the shift is too subtle.
- Collapse moment: the case pivot explains that Theo's camera panic is not enough and the cart gap matters more.
- Weak/Strong confidence: stays coarse and tied to proof strength, not culprit identity.
- Hint depth: one gated hint remains enough for the current one-case release; add a second level only after repeated stuck-after-hint evidence.
- Notebook load: current risk is comparison clarity after contradiction, not too many evidence types.
- Resolution rating: keep Sharp/Careful/Reckless/Misled, but collect fairness notes before changing names or tiers.

## First follow-up patch backlog

- Notebook comparison clarity: patch if repeated feedback mentions missed contradiction or unreadable Notebook after reveal.
- Persona-shift punch: patch if Ivo's pressure answer feels too calm or generic in video or first-player feedback.
- Rating fairness copy: patch if players understand the culprit but object to Resolution rating language.

This backlog intentionally excludes season expansion, new cases, full trial mode, multiplayer, voice, accounts, and procedural case generation.

## Second-case readiness criteria

- First case has no repeated confusion around contradiction, persona shift, Notebook comparison, or rating fairness.
- Second case adds one new deduction tool that changes reasoning, not just a new suspect skin or longer transcript.
- AI remains an NPC performer and never owns truth, clue validity, or outcome resolution.

## Future case template

- Required beats: false certainty, guaranteed contradiction, collapse, persona shift, and resolution rating.
- Required boundary: every case must have a tempting wrong theory with one visible flaw.
- Required boundary: every guaranteed contradiction must be reachable without a hint.
- Required boundary: every persona shift must be visible through AI performance, not only UI labels.

## Model and platform update rules

- Before each patch: re-check Groq access and `npm run test:npc-turn`.
- Before submission: re-check Devpost fields, public URL, GitHub URL, video URL, and AI-use wording.
- After follow-up UI changes: re-run mobile/browser gates for dock, keyboard, transcript, and Notebook behavior.

## Visual asset review rules

- Reject future assets with watermarks, mangled text, plastic faces, unreadable evidence marks, or inconsistent lighting.
- Reject assets that hide controls, reduce contrast, create overflow, or make the first screen look empty.
- Reject visual drift into generic dashboard, copied reference layout, or unrelated season branding.

## Post-follow-up hygiene

- Archive rejected images, raw AI drafts, temporary logs, and research scraps outside the release bundle.
- Run `npm run build` after gameplay, AI, UI, docs, or release-contract changes.
- Update README, RELEASE, SUBMISSION, STATE, and TODO evidence only when shipped behavior actually changed.
- Re-run deterministic playthrough and browser route before promoting a follow-up.

## DESIGN.md retrospective

- Helped: suspect-first mobile surface, visual DNA rules, and state-specific fallback/contradiction/persona-shift/Resolution guidance.
- Needs clarification: exact Notebook comparison layouts before more evidence types, plus sharper rejection examples for generated face and evidence-text artifacts.

## Project memory update

- Confirmed: one polished case is the right release shape for this deadline.
- Confirmed: AI suspects can lie, but only evidence can convict.
- Confirmed: serverless Groq proxy plus deterministic client state is the correct mobile web architecture.
- Do not reopen: hidden truth in live model prompt, full trial mode before first-case clarity, or extra cases before contradiction/collapse/Notebook/rating feedback is stable.

## No-drift checklist

- AI remains suspect performance, not judge or truth engine.
- Every follow-up strengthens Interrogation, Suspicion, Contradiction, Notebook, Accusation, or Resolution.
- First-case clarity beats season, trial, multiplayer, voice, accounts, and procedural-case expansion.

## Full-game direction decision

Decision: polish the first case further.

Rejected:

- Add second case now: blocked until first-case contradiction, collapse, Notebook, and rating feedback are stable.
- Build season map now: would be marketing scaffolding without playable proof and would drift from AI lies / evidence convicts.

The old Phase 10 ledger is closed. Current follow-up work starts from `docs/MASTER_TODO.md`, which reopens the project around AI answer quality, button-level proof, RU/EN parity, visual differentiation, strict submission proof, and post-launch resilience.
