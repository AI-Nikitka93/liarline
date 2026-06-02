# Phase 5 Visual Findings - 2026-05-09

Scope: T110-T124 visual research, DESIGN.md handoff, and evidence boundaries for Liarline.

## Patterns To Use

- Mobile detective UI must open with a playable suspect/action, not a marketing hero.
- Evidence UI works best as small physical-feeling slips, contradiction rails, and proof ledgers.
- Game feedback needs clear state change: pending answer, guarded fallback, contradiction, persona shift, final risk, and verdict.
- DESIGN.md should be compact enough for Google Stitch or coding agents: product, tokens, screens, components, states, assets, accessibility, non-goals.
- GitHub design-reference collection must store only repo metadata and never token values.

## Patterns To Reject

- Generic AI dashboard layout, provider/status panels as primary UI, purple gradients, and decorative glow.
- Copied brand layouts from DESIGN.md catalogs.
- Fake police clutter, large evidence-board scope, or trial UI that the current game does not ship.
- Asset generation in packs without a per-asset brief and rejection pass.
- Images with watermarks, readable fake text, plastic faces, distorted hands/faces, or truth spoilers.

## Applied To Code

- `first-viewport-visual-lock` and `suspect-first-hero` keep the first screen suspect/action first.
- `interrogation-composition-panel` and `transcript-evidence-thread` keep interrogation readable.
- `contradiction-reveal-stage`, `persona-shift-card`, and `visual-event-rail` turn deduction changes into events.
- `compact-evidence-surface` keeps Notebook as a deduction tool.
- `final-risk-stage` and `final-proof-ledger` make accusation feel final.
- `resolution-verdict-stage` and `verdict-reconstruction-card` close the story with outcome proof.

## Sources Checked

- W3C WCAG 2.2 target size guidance.
- MDN viewport and storage event behavior.
- Playwright webServer behavior.
- GitHub REST metadata for `google-labs-code/design.md`, `VoltAgent/awesome-design-md`, `kzhrknt/awesome-design-md-jp`, `bergside/awesome-design-skills`, `shaom/brand-to-design-md-skill`, and `hasi98/designpull`.
