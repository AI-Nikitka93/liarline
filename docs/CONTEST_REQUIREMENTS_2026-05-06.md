# AI Game Week Contest Requirements

Verification date: 2026-05-08.

Closed scope: T013, T155.
Latest refresh closed scope: T001-T010.

Source:
- https://ai-game-week-29908.devpost.com/
- https://ai-game-week-29908.devpost.com/rules
- https://help.devpost.com/article/122-how-to-enter-a-submission
- https://help.devpost.com/article/126-know-your-submission-steps

## Current Contest Facts

- Hackathon: AI Game Week.
- Format: online, public Devpost hackathon.
- Deadline shown on Devpost: May 10, 2026 at 5:00 PM AZST.
- Rules page says hacking period runs from May 3, 2026 at 9:00 AM to May 10, 2026 at 5:00 PM Baku time.
- Rules page says late submissions will not be accepted.
- Eligibility: students worldwide, solo or teams up to 3.
- Project must be started and completed during the hackathon period.
- Game must be playable in a mobile browser with no downloads.
- AI must be used meaningfully.
- Submission requires a working game link, demo video, GitHub repository/code, and short description explaining AI tools used.
- Overview page lists "What to Submit":
  - A playable game link that works on mobile browser.
  - A demo video (1-3 minutes) showing the game.
  - A GitHub repo with code.
  - A short description explaining AI tools used.
- Prize categories include Best Game Overall, Best Design, Best AI Use, and Best Mobile Support.
- Judging criteria on the overview page:
  - AI Integration: 30%.
  - Creativity & Fun: 25%.
  - Technical Execution: 25%.
  - Mobile Support: 20%.
- Rules page says judging considers AI usage, creativity, technical execution, mobile playability, and demo quality.
- Devpost submission flow requires a project overview, story/details, built-with tags, a public video demo link when required, try-it links or challenge-specific links, and final submit before the deadline.

## Liarline Compliance State

Ready:
- Mobile browser target exists.
- No app download is needed.
- AI use is gameplay-facing through suspect interrogation.
- Serverless proxy avoids client-side Groq key exposure.
- GitHub/code artifact can be prepared from the repo.
- Demo story is clear: AI suspects can lie, but only evidence can convict.

Needs final proof before submission:
- Public deployed URL must be tested on a real phone.
- Demo video must show the first AI answer, contradiction, accusation, and resolution.
- Devpost write-up must not promise the future three-case season as playable.
- Submission copy must explain deterministic truth table and fallback so judges understand reliability.
- Final build must pass complete playthrough to Resolution.
- GitHub repository must be clean of secrets and local-only drafts before publishing.

## Submission Description Guardrail

Allowed to say:
- "One polished case."
- "AI performs suspect dialogue."
- "The local game engine decides truth and outcome."
- "Playable in a mobile browser."

Do not say yet:
- "Three-case season."
- "Full evidence board system."
- "Mini-court trial."
- "Voice or video interrogation."

## Phase 1 Source-of-Truth Decision

- Active master plan: `docs/MASTER_TODO.md`.
- Archived closed ledger: `_archive/agent-memory/docs/MASTER_TODO.md`.
- The old closed T001-T220 ledger is historical evidence only. It is not the current task queue.
- Current win-push work starts from the reopened `docs/MASTER_TODO.md` and must not treat old archived checkboxes as active completion.

## Current Score-Risk Baseline

- AI quality: first live answers can still sound generic, repeat a thought, or miss the pressure beat; verify with `npm run test:npc-turn`, `npm run test:live-suspects`, and `npm run test:demo-route`.
- Mobile UI: keyboard, sticky dock, and long RU/EN labels can hide critical actions; verify with `npm run test:mobile-ui` and `npm run test:release-browser`.
- Proof clarity: the judge must understand why camera failure does not explain cart movement; verify with `npm run test:release-playthrough`.
- Submission completeness: the public demo video URL is still an external blocker for strict Devpost readiness; verify with strict `npm run test:judge-readiness` only after all public URLs exist.
- Scope truth: one polished case is the only playable promise; public docs must keep season, full trial, multiplayer, voice, and procedural cases out of current claims.

## 2026 AI-Game Practice Refresh

Fresh references checked on 2026-05-08:

- arXiv `Bounded Autonomy: Controlling LLM Characters in Live Multiplayer Games` reinforces bounded interfaces, action grounding, and fallback rather than unrestricted model agency.
- arXiv `The Double-Edged Sword of Open-Ended Interaction` reinforces that open-ended LLM NPCs can increase cognitive load and reduce usability/trust when not scenario-bounded.
- Recent r/aigamedev discussions repeatedly identify contradictions, forgotten state, context drift, hidden-information leaks, quality/context control, and pure chatbot gameplay as real failure modes.
- GitHub community discussion on conversational brain-teaser games reports multi-turn drift from fixed game context as a game-logic breaker.

Liarline adoption:

- Keep deterministic state underneath AI dialogue.
- Give live NPC prompts only allowed suspect/state knowledge.
- Keep mobile interactions short and option-first, with custom question as a controlled extension.
- Validate output, reject generic or leaking answers, and keep fallback visible and playable.
- Use AI to perform pressure, hesitation, evasion, and persona shift; never let AI decide truth, clues, win, or loss.

Anti-patterns now blocked for this release:

- Generic AI chat with no game consequence.
- Long tutorial before the first AI beat.
- Unclear proof chain.
- Indistinguishable NPC voices.
- Hidden truth or future state inside the live prompt.
- Player-facing model jargon, internal IDs, or service fields.
- Fake live-AI claims when fallback or deterministic state produced the result.
