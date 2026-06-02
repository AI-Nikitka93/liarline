# Restore Point - 2026-05-09

name: PHASE4_T071_T100_MOBILE_UX_ACCEPTANCE

Scope:
- T071-T078: final case reconstruction, confusion map, quick/chaotic/RU/fallback playtests, phase 3 end review.
- T079-T100: mobile UX controls, button code and visual behavior, pending state, source labels, Notebook, Accusation, Restart, scrolling, portraits, RU/EN phase switching.

Integrity checks:
- `npm run test:win-push-phase4-mobile-ux`
- `npm run test:browser-phase4-mobile-ux`
- `npm run test:mobile-ui`
- `npm run test:browser-smoke`
- `npm run build`

Rollback target:
- Return to the last verified T041-T070 state if these checks fail and cannot be fixed locally.
