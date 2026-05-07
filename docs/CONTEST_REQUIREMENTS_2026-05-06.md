# AI Game Week Contest Requirements

Verification date: 2026-05-06.

Closed scope: T013, T155.

Source:
- https://ai-game-week-29908.devpost.com/
- https://ai-game-week-29908.devpost.com/rules

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
