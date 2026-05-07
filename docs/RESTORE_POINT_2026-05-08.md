# Liarline Restore Point - 2026-05-08

Purpose: preserve a known-good recovery point for the Devpost AI Game Week release package.

## Protected State

- Public playable URL: https://liarline.vercel.app
- Public GitHub repo: https://github.com/AI-Nikitka93/liarline
- Restore tag: `restore-2026-05-08-judge-ready`
- Expected branch: `master`

## What Is Protected

- Source code.
- Public docs.
- Release and submission package docs.
- Playwright browser gates.
- Judge-readiness gate.
- Public visual assets.
- Package lockfile and dependency override that removes the PostCSS audit advisory.

## What Is Not Backed Up

The following stay local or generated and are intentionally not committed:

- `.env.local`
- `.vercel/`
- `.next/`
- `node_modules/`
- `test-results/`
- `_archive/`

Recreate `.env.local` from `.env.example` and set `GROQ_API_KEY` again if restoring on a new machine.

## Restore From GitHub

```powershell
git clone https://github.com/AI-Nikitka93/liarline.git
cd liarline
git checkout restore-2026-05-08-judge-ready
npm install
npm run build
npm run test:judge-readiness
```

## Restore Current Workspace To This Point

Use this only when you intentionally want to discard later tracked changes:

```powershell
git fetch origin --tags
git checkout master
git reset --hard restore-2026-05-08-judge-ready
npm install
npm run build
```

## Restore From Local Bundle

If GitHub is unavailable, use the local bundle stored under `_archive/backups/`:

```powershell
git clone _archive/backups/liarline-restore-2026-05-08-judge-ready.bundle liarline-restored
cd liarline-restored
git checkout master
npm install
npm run build
```

## Final Gate After Restore

```powershell
npm run test:judge-readiness
npm run test:release-browser
npm audit --audit-level=moderate
```
