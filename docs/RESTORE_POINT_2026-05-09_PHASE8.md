# Restore Point 2026-05-09 Phase 8

Name: `PHASE8_T191_T205_POSTLAUNCH_READINESS`.

Includes:
- Hotfix decision rules for unplayable route, broken first AI answer, truth leak, fallback, restart, and mobile blockers.
- Demo-day recovery playbook for AI outage, stale public URL, bad save, mobile layout break, and fallback-only recording.
- Freshness cycles for AI provider facts, contest/submission facts, and visual/browser behavior.
- Evidence-only follow-up backlog and second-case threshold.
- Future-case template, do-not-reopen guardrails, changelog discipline, and post-release artifact hygiene.

Integrity checks:
- `npm run test:win-push-phase8-postlaunch`
- `npm run test:release-postlaunch`
- `npm run test:project-hygiene`
- `npm run build`

Rollback target:
- If post-launch rules drift into season/trial/multiplayer/procedural scope, keep gameplay code intact and revert only Phase 8 release-contract/doc changes back to this restore point.
