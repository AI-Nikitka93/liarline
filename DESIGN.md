# Liarline DESIGN.md

Updated: 2026-05-06.
Purpose: AI-readable visual contract for Google Stitch and coding agents.

## Product Summary

Liarline is a mobile-browser AI social deduction detective game. The core promise is: AI suspects can lie, but only evidence can convict. The interface should feel like a compact interrogation terminal in the player's hand, not a generic AI chat app.

Current playable scope is one polished case with four suspects, limited action points, live AI suspect dialogue, deterministic contradiction play, notebook evidence, risky accusation, and resolution.

Core systems that every visual decision must support: Interrogation, Suspicion, Contradiction, Notebook, Accusation, Resolution.

## Users And Primary Jobs

- Hackathon judges opening the game on a mobile browser.
- Players who need to understand the fantasy in the first minute.
- Demo viewers who must immediately see why AI matters.
- Future AI/design agents that need stable visual rules without reading the full internal archive.

Primary jobs:

- Start interrogation immediately.
- Ask a suspect a question.
- Notice suspicion and pressure changes.
- Catch a contradiction.
- Use notebook evidence.
- Make a final accusation.
- Understand the verdict.

## Platforms

- Mobile browser first, target width 375-430px.
- Desktop may center the mobile shell but must not become a dashboard layout.
- Touch targets must be at least 44px.
- Keyboard-safe interrogation composer is required.

## Visual DNA

Direction: Neo-Noir Interrogation Terminal.

The UI is dark, sharp, readable, and tense. It uses forensic amber for playable evidence/actions, signal red only for danger or contradiction, cyan for system/focus states, and rare warm paper texture for clue slips.

Do:

- Use suspect portraits as emotional anchors.
- Keep the first screen suspect-first.
- Make contradiction reveal a visual event.
- Show AI source honestly without turning the screen into an API dashboard.
- Use mono labels for case metadata and evidence tags.

Do not:

- Use generic SaaS cards.
- Use decorative purple gradients.
- Build a marketing landing page.
- Add fake police UI clutter.
- Use AI-glow as the main design idea.

## Design Tokens

Fonts:

- UI: Inter.
- Metadata: Space Mono.

Colors:

- `ink-950 #080A0D` app background.
- `ink-900 #0D1117` shell/header.
- `ink-850 #11161D` panels.
- `ink-800 #171E27` raised controls.
- `line-700 #2A3441` default border.
- `line-500 #455363` active border.
- `text-50 #F3F0E8` primary text.
- `text-400 #A7B0BC` muted text.
- `forensic-500 #F5B84B` evidence/action amber.
- `signal-500 #FF3B45` contradiction/danger red.
- `cyan-400 #64D2FF` focus/system.
- `green-400 #58D68D` verified evidence.
- `paper-300 #E8D8B6` clue-paper texture only.

Radii and shadow:

- Cards/buttons: 8px.
- Heavy terminal shadow only on major panels.
- Red glow only for persona shift, contradiction, or failure.

## Navigation

The game has four main phases:

- Briefing.
- Interrogation.
- Accusation.
- Resolution.

Notebook is a drawer reachable during interrogation and accusation. Language switch remains available without hiding primary game actions.

## Screen Inventory

### Briefing

First viewport starts with a suspect portrait, case pressure, and one dominant action: ask the first question. The suspect roster sits below, but the player should not need to read every case fact before entering play.

### Interrogation

Contains top case strip, suspect dossier card, suspicion bar, theory/contradiction panel, transcript, suggested questions, custom input, AP pips, notebook button, and accusation button.

### Notebook

Bottom drawer with clue slips, contradictions, and suspect notes. It should feel like evidence handling, not a settings panel.

### Accusation

Finite selection screen for suspect, motive, evidence, risk acknowledgement, and final submit. It is not a mini-court.

### Resolution

Verdict, detective rating, truth reconstruction, real culprit/motive, timeline, and replay action.

## Reusable Components

- `TopStrip`: phase, case number, AP summary, restart.
- `NpcMoodFrame`: suspect card with portrait, lie type, mood, suspicion.
- `SuspicionMeter`: numeric pressure, label, threshold bar.
- `ActionPointPips`: visual AP budget.
- `NotebookDrawer`: clue and contradiction drawer.
- `PrimaryButton`: amber action.
- `SecondaryButton`: dark utility action.
- `ChoiceButton`: accusation selection.
- `GameIcon`: use the Lucide system with 2px stroke, 20-22px icons, 44px hit targets.

## State Rules

- `calm`: stable border, no glow, neutral pressure.
- `nervous`: amber rail, readable uncertainty, not proof of guilt.
- `aggressive`: red chip/border, pressure rising.
- `panicking`: portrait pulse, red border, clear persona shift.
- `fallback`: cyan system tag, clear degraded-AI copy, no hidden progress.
- `live_ai`: cyan source badge with latency; the engine still owns truth.
- `contradiction_found`: red/amber event block, notebook update, suspicion movement, next action.

## Asset Production

Each generated asset needs its own brief and rejection criteria. Do not generate a whole pack in one vague prompt.

Current asset roles:

- Case lab hero: briefing pressure image.
- Interrogation background: dark terminal atmosphere.
- Evidence paper: clue slip texture.
- Suspect portraits: Ivo, Mara, Theo, Lena.

Curation rules:

- Reject watermarks.
- Reject readable fake text.
- Reject plastic faces or distorted facial features.
- Reject style drift between portraits.
- Reject assets that reveal truth too directly.
- Check mobile crops before approval.

## Copy And Tone

Tone is tense, concise, and playable. The game should say what the player can do, not explain the technology first.

Avoid:

- long lore walls;
- model/provider jargon in player-facing primary flow;
- fake certainty;
- raw internal IDs before resolution.

## Accessibility

- Minimum 44px touch targets.
- Chat/body text should stay at 14px or larger.
- Suspicion and mood need text labels, not color only.
- Focus rings must be visible.
- Reduced motion must preserve state meaning.
- Drawer must have visible close controls, not swipe only.

## Technical Constraints

- Next.js App Router.
- Tailwind CSS v4 theme variables.
- Lucide React icons only.
- No WebSockets for gameplay.
- Client must not call Groq directly.
- Local game engine owns truth and verdict.
- RU/EN dictionaries remain separated.

## Non-goals

- No full trial system in the current release.
- No three-case season claim for the current submission.
- No generic AI dashboard skin.
- No unlimited chat.
- No hidden truth exposure to AI.
- No decorative generated images that require artist cleanup before use.

## Reference Evidence Used

- Google Labs `design.md` ecosystem: use DESIGN.md as an agent-readable visual contract.
- VoltAgent `awesome-design-md`: use structured design sections, but do not copy brand UI.
- GitHub REST API documentation: use environment-based authorization when collecting public design evidence, without printing or storing tokens.
