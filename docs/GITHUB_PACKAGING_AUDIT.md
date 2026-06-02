# Liarline GitHub Packaging Audit

Verification date: 2026-05-09.

This audit packages the repository as a judge-facing GitHub surface for Devpost AI Game Week. GitHub platform details were refreshed against official GitHub Docs on 2026-05-09 for community profile files, issue forms, social preview guidance, licensing notes, and CODEOWNERS locations.

Primary references:

- GitHub Docs: [About community profiles for public repositories](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories)
- GitHub Docs: [Syntax for issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- GitHub Docs: [Customizing your repository's social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
- GitHub Docs: [Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- GitHub Docs: [About code owners](https://docs.github.com/articles/about-code-owners)

## Repository Classification

Primary type: `AI / LLM / agent repository`.

Secondary type: `SaaS / app repository`.

Reason: Liarline is a playable mobile web app where live AI is part of the interaction loop, but the product value depends on deterministic game-state fairness and a clear judge/demo route.

## Repo Packaging Audit

| Area | Status | Action |
|---|---:|---|
| First 30 seconds | Improved | README now opens with hook, playable release, judge snapshot, and visual preview. |
| Runnable quickstart | Present | README keeps `npm install`, `npm run dev`, and Groq env setup near the top. |
| AI trust boundary | Improved | README now states actor-not-judge boundary and includes a simple Mermaid flow. |
| Contest proof routing | Improved | README links directly to Devpost draft, architecture, release notes, final judge packet, and packaging audit. |
| Visual signal | Improved | Added `docs/assets/liarline-social-preview.jpg` for README and GitHub social preview upload. |
| License clarity | Improved | Added `LICENSE` with source-available contest/demo posture; README does not call the repo open source. |
| Community health | Improved | Added contributing, support, security, conduct, PR template, issue forms, and CODEOWNERS. |
| Metadata | Manual GitHub UI step remains | Repository description, topics, homepage, and social preview need to be set in GitHub UI or `gh`. |
| Releases | Partial | `docs/RELEASE.md` exists; a GitHub Release tag is still a manual/publication step. |

## README Structure Plan

1. `Hero block`: name, hook, concise product description, primary links, preview image.
2. `Judge Snapshot`: table of the exact contest-relevant state.
3. `What It Does`: short capability list.
4. `Why It Matters`: differentiates actor AI from deterministic fairness.
5. `Quickstart`: local run and Groq key setup.
6. `Verification`: core commands only, with deep gates routed to docs.
7. `AI Boundary`: Mermaid flow and hidden-truth guardrail.
8. `Demo Route`: reproducible judge path.
9. `Project Map`: high-signal paths.
10. `Scope Guardrail`: prevents overclaiming.
11. `Contributing / Support / Security / License`: trust surfaces.

## Required / Recommended Files Matrix

| File | Status | Why it matters |
|---|---:|---|
| `README.md` | Done | Main judge-facing landing page. |
| `LICENSE` | Done | Makes the non-open-source contest/demo posture explicit. |
| `CONTRIBUTING.md` | Done | Tells contributors how to set up, test, and keep claims honest. |
| `SECURITY.md` | Done | Gives a private reporting route and secret-handling expectations. |
| `CODE_OF_CONDUCT.md` | Done | Sets basic collaboration behavior for public repo interactions. |
| `SUPPORT.md` | Done | Separates bugs, questions, security, and Devpost/demo support paths. |
| `CHANGELOG.md` | Done | Gives judges and reviewers a quick release history. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Done | Structured bug intake for reproducible game/UI/AI failures. |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Done | Keeps future ideas separated from current contest scope. |
| `.github/ISSUE_TEMPLATE/docs_update.yml` | Done | Routes claim/doc fixes without mixing them with gameplay bugs. |
| `.github/ISSUE_TEMPLATE/config.yml` | Done | Disables blank issue drift and routes support/security correctly. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Done | Keeps PRs focused on rationale, tests, risks, screenshots, and scope. |
| `.github/CODEOWNERS` | Done | Routes all files to the repository owner. |
| `CITATION.cff` | Not added | Not a research artifact or dataset. |
| `.github/FUNDING.yml` | Not added | Not an active public funding surface. |
| `GOVERNANCE.md` | Not added | Single-maintainer contest repo; too much ceremony. |

## Recommended Repository Metadata

Description:

```txt
Mobile AI detective game where suspects lie in live dialogue, but deterministic evidence decides the case.
```

Homepage:

```txt
https://liarline.vercel.app
```

Topics:

```txt
ai-game, detective-game, social-deduction, nextjs, react, tailwindcss, groq, mobile-web, devpost, game-jam
```

Social preview:

Upload `docs/assets/liarline-social-preview.jpg` in GitHub repository settings. It is a 1280x640 JPG under 1 MB, matching GitHub's current social preview guidance.

## Open Gaps / Not Yet Implemented

- GitHub repository metadata must still be applied in the GitHub UI or with `gh repo edit`.
- GitHub social preview upload is a manual repository setting; the image file is prepared.
- No CI badge is shown because there is no repository-native GitHub Actions workflow in this checkout.
- No GitHub Release has been created in this pass.
- The repo is clearly published for judging/portfolio review, not licensed as reusable open source.
