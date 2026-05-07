# State

```state
current_goal: Package and harden Liarline as a clean Devpost-ready mobile AI detective game.
current_task: Harden the project toward a 100-point judge package with explicit Devpost artifact gates, self-starting browser tests, git readiness, and live-AI timeout tuning.
status: LOCAL_PACKAGE_READY_EXTERNAL_ARTIFACTS_REQUIRED
active_step: Phase 10 T201-T210 continues from a locally verified judge-readiness package: `npm run test:judge-readiness` passes in local mode and strict mode validates the three public URLs when provided.
next_step: Finalize public deployment, public GitHub remote, and demo video URL, then run strict judge readiness with `LIARLINE_STRICT_SUBMISSION=1`.
blockers: ["External Devpost artifacts are still required for a true 100 ceiling: public playable URL, public GitHub repository URL, and demo video URL."]
artifacts: ["DESIGN.md", "README.md", ".gitignore", ".npmignore", "playwright.config.ts", "docs/RELEASE.md", "docs/SUBMISSION.md", "docs/SUBMISSION_PACKAGE.md", "docs/DECISIONS.md", "docs/STATE.md", "docs/state.json", "docs/CONTEST_REQUIREMENTS_2026-05-06.md", "docs/AI_PROVIDER_STATUS_2026-05-06.md", "next.config.mjs", "package.json", "package-lock.json", "src/app/globals.css", "src/components/LiarlineGame.tsx", "src/components/ui.tsx", "src/components/NotebookDrawer.tsx", "src/i18n/dictionaries.ts", "src/game/gameEngine.ts", "src/services/aiClient.ts", "src/state/GameStore.tsx", "src/release/assetProvenance.ts", "src/release/releaseInfo.ts", "src/release/outcomeMonitor.ts", "src/release/releaseOps.ts", "src/ai/systemPrompt.ts", "src/ai/fallback.ts", "src/api/npc-turn.ts", "tools/capture-release-screenshots.ts", "tools/test-release-security.mjs", "tools/test-public-docs-safe.mjs", "tools/test-project-hygiene.mjs", "tools/test-release-contracts.mjs", "tools/test-release-monitoring.mjs", "tools/test-release-ops.mjs", "tools/test-release-postlaunch.mjs", "tools/test-release-playthrough.mjs", "tools/test-judge-readiness.mjs", "tools/release-browser.spec.ts", "tools/test-phase7-fairness.mjs", "tools/phase7-browser.spec.ts", "tools/test-phase7-polish.mjs", "tools/phase7-polish.spec.ts", "tools/test-playstyles.mjs", "tools/test-release-readiness.mjs", "tools/test-demo-route.mjs", "tools/test-ui-copy.mjs", "tools/test-mobile-ui-contract.mjs", "tools/test-visual-dna.mjs", "tools/test-game-engine.mjs", "tools/test-npc-turn.mjs", "tools/test-mobile-screen-states.mjs", "tools/mobile-browser-smoke.spec.ts", "_archive/agent-memory/docs/MASTER_TODO.md", "_archive/release-screenshots/2026-05-06/manifest.json", "_archive/runtime-logs/liarline-dock-current.png", "_archive/runtime-logs/test-results", "_archive/agent-memory/docs/DEMO_ROUTE_AI_SCRIPT_2026-05-06.md"]
updated_at: 2026-05-08 02:20 Europe/Minsk
```

## Public Package

- `README.md` explains the playable game, current scope, setup, verification commands, and guardrails.
- `docs/SUBMISSION.md` contains Devpost-ready description, AI-use explanation, demo path, judging alignment, and pre-submit checklist.
- `docs/DECISIONS.md` keeps concise public decisions only.
- `DESIGN.md` is now the root visual contract for Google Stitch or coding-agent design generation.

## Archived Internal Materials

- Full master brief, master TODO, research packs, anchor reviews, long project history, and old execution plans are stored under `_archive/agent-memory/docs/`.
- Raw generated images are stored under `_archive/raw-generated-assets/`.
- Benchmark JSON outputs are stored under `_archive/benchmark-results/`.
- Root notes and old condition files are stored under `_archive/root-notes/`.
- Dev-server logs are redirected to `_archive/runtime-logs/`.
