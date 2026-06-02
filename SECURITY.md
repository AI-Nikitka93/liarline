# Security Policy

## Supported Surface

This repository currently supports the latest contest/demo build on the default branch.

## Reporting A Vulnerability

Do not open a public issue for vulnerabilities, leaked secrets, provider-key exposure, or exploit paths.

Report privately to the repository owner through GitHub's private contact path or direct maintainer contact. Include:

- affected file or route;
- reproduction steps;
- expected impact;
- whether any secret, token, or private data may be exposed.

## Secret Handling

- Groq credentials must stay server-side in environment variables.
- Browser code must call only the internal `/api/npc-turn` route.
- `.env.local` and other local secret files must not be committed.
- Logs, screenshots, and public docs must not include raw provider keys or personal data.

## AI Safety Boundary

Security and fairness both depend on the same boundary: the live NPC model performs dialogue only. The deterministic engine owns the truth table, clue unlocks, accusation scoring, and resolution.
