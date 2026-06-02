export type ExternalDependency = {
  dependencyId: string;
  surface: "contest" | "deployment" | "video" | "ai_provider" | "browser" | "repository";
  sourceOfTruth: string;
  failureMode: string;
  verificationCommand: string;
  releaseImpact: "blocker" | "score_risk" | "operational_risk";
};

export type BackupCandidate = {
  provider: "Groq alternate model" | "Google Gemini API" | "OpenRouter free models" | "Hugging Face Inference Providers" | "Mistral La Plateforme";
  structuredOutput: "usable" | "provider_or_model_dependent" | "not_verified_for_release";
  firstTokenRisk: "low" | "medium" | "high";
  freeLimitRisk: "low" | "medium" | "high";
  decision: "primary_live_candidate" | "backup_experiment_only" | "offline_enrichment_only" | "exclude_from_release";
  reason: string;
};

export type SkillDecision = {
  skillId: string;
  keep: boolean;
  releaseUse: string;
  riskBoundary: string;
};

export const PHASE1_READINESS_DATE = "2026-05-08" as const;

export const PUBLIC_CLAIM_AUDIT = {
  checkedFiles: [
    "README.md",
    "docs/SUBMISSION.md",
    "docs/RELEASE.md",
    "docs/JUDGE_FINAL_PACKET_2026-05-08.md"
  ],
  allowedClaims: [
    "one polished playable case",
    "mobile browser game with no download step",
    "Groq live suspect dialogue through server-side proxy",
    "deterministic engine owns truth, clues, suspicion, accusation, rating, and resolution",
    "visible fallback path is playable but not live AI"
  ],
  forbiddenClaims: [
    "three-case season is playable",
    "full trial system is implemented",
    "voice or video interrogation is available",
    "multiplayer is available",
    "unlimited or procedural case generation is available",
    "fallback footage proves live Groq"
  ],
  verificationCommand: "npm run test:public-docs && npm run test:contest-final-packet && npm run test:judge-readiness"
} as const;

export const EXTERNAL_DEPENDENCY_MAP: ExternalDependency[] = [
  {
    dependencyId: "dep_contest_rules",
    surface: "contest",
    sourceOfTruth: "https://ai-game-week-29908.devpost.com/ and https://ai-game-week-29908.devpost.com/rules",
    failureMode: "Deadline, eligibility, required fields, or scoring weights change before final submit.",
    verificationCommand: "npm run test:win-push-phase1 && npm run test:win-push-phase1-readiness",
    releaseImpact: "blocker"
  },
  {
    dependencyId: "dep_public_deploy",
    surface: "deployment",
    sourceOfTruth: "LIARLINE_PUBLIC_URL strict judge-readiness env value",
    failureMode: "Public URL is stale, unreachable, desktop-only, or does not expose the first playable action.",
    verificationCommand: "LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness",
    releaseImpact: "blocker"
  },
  {
    dependencyId: "dep_demo_video",
    surface: "video",
    sourceOfTruth: "LIARLINE_DEMO_VIDEO_URL strict judge-readiness env value",
    failureMode: "Video is missing, private, too long, stale UI, or calls fallback footage live AI.",
    verificationCommand: "LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness",
    releaseImpact: "blocker"
  },
  {
    dependencyId: "dep_groq_live",
    surface: "ai_provider",
    sourceOfTruth: "Groq model docs, Groq rate-limit docs, Groq status, and local NPC/live-suspect smoke tests.",
    failureMode: "Primary model removed, JSON mode changes, rate limits hit, status outage, or latency breaks first AI beat.",
    verificationCommand: "npm run test:npc-turn && npm run test:live-suspects && npm run test:demo-route",
    releaseImpact: "score_risk"
  },
  {
    dependencyId: "dep_mobile_browser",
    surface: "browser",
    sourceOfTruth: "Playwright mobile viewport gates and MDN VisualViewport/viewport guidance.",
    failureMode: "Keyboard, fixed dock, safe area, or viewport overflow hides actions on phone-width screens.",
    verificationCommand: "npm run test:mobile-ui && npm run test:release-browser && npm run test:browser-smoke",
    releaseImpact: "score_risk"
  },
  {
    dependencyId: "dep_github_repo",
    surface: "repository",
    sourceOfTruth: "LIARLINE_GITHUB_URL strict judge-readiness env value and local secret/hygiene checks.",
    failureMode: "Repo URL missing, private when judges need access, or contains secrets/local-only artifacts.",
    verificationCommand: "npm run test:release-security && npm run test:project-hygiene && LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness",
    releaseImpact: "blocker"
  }
];

export const FASTEST_AGING_KNOWLEDGE = [
  {
    itemId: "aging_contest",
    volatileFact: "Devpost deadline, eligibility, submit fields, demo-video requirement, and judging weights.",
    refreshBefore: "every final run and strict submission",
    ownerSurface: "docs/CONTEST_REQUIREMENTS_2026-05-06.md and src/release/winPushPhase1.ts"
  },
  {
    itemId: "aging_ai_provider",
    volatileFact: "Groq model availability, rate limits, JSON mode, status page, and live latency.",
    refreshBefore: "every video recording, AI prompt patch, or final submit",
    ownerSurface: "docs/AI_PROVIDER_STATUS_CURRENT.md and src/release/winPushPhase1Readiness.ts"
  },
  {
    itemId: "aging_backup_models",
    volatileFact: "Free-tier model availability, per-key/project quotas, structured-output support, and provider throttling.",
    refreshBefore: "before any backup-provider implementation",
    ownerSurface: "BACKUP_AI_CANDIDATES"
  },
  {
    itemId: "aging_mobile_browser",
    volatileFact: "Mobile viewport, VisualViewport, virtual keyboard, and sticky dock behavior.",
    refreshBefore: "after every UI/layout patch",
    ownerSurface: "mobile browser and smoke tests"
  },
  {
    itemId: "aging_public_claims",
    volatileFact: "Public README, submission, release, and judge-packet claims compared with shipped behavior.",
    refreshBefore: "after every gameplay, AI, UI, or packaging change",
    ownerSurface: "PUBLIC_CLAIM_AUDIT"
  }
] as const;

export const AI_PROVIDER_STATUS_CURRENT = {
  verificationDate: PHASE1_READINESS_DATE,
  sources: [
    "https://console.groq.com/docs/model/llama-3.1-8b-instant",
    "https://console.groq.com/docs/model/llama-3.3-70b-versatile",
    "https://console.groq.com/docs/rate-limits",
    "https://status.groq.com/",
    "npm run test:npc-turn",
    "npm run test:live-suspects"
  ],
  primary: {
    provider: "Groq",
    model: "llama-3.1-8b-instant",
    status: "primary_live",
    officialCapabilities: ["Tool Use", "JSON Object Mode", "131072 context window", "~560 tps"],
    freePlanLimits: {
      rpm: 30,
      rpd: 14400,
      tpm: 6000,
      tpd: 500000
    },
    localProof: ["test:npc-turn returned source=groq", "test:live-suspects returned distinct live voices"]
  },
  enrichment: {
    provider: "Groq",
    model: "llama-3.3-70b-versatile",
    status: "offline_enrichment_only",
    officialCapabilities: ["Tool Use", "JSON Object Mode", "131072 context window", "32768 max output tokens", "~280 tps"],
    freePlanLimits: {
      rpm: 30,
      rpd: 1000,
      tpm: 12000,
      tpd: 100000
    },
    reason: "Higher quality but heavier live risk; keep out of the first-turn mobile interrogation path."
  },
  statusPage: "Groq status page reported fully operational with no known system issues during the refresh.",
  noGoIf: [
    "primary model disappears or loses JSON Object Mode",
    "status page shows active API outage while recording/submitting",
    "live smoke repeatedly falls back while submission copy claims live AI",
    "429/rate limits block first answer and pressure answer in the demo route"
  ]
} as const;

export const BACKUP_AI_CANDIDATES: BackupCandidate[] = [
  {
    provider: "Groq alternate model",
    structuredOutput: "usable",
    firstTokenRisk: "low",
    freeLimitRisk: "medium",
    decision: "offline_enrichment_only",
    reason: "Same provider and API shape; useful for enrichment, but not a provider-failure fallback."
  },
  {
    provider: "Google Gemini API",
    structuredOutput: "usable",
    firstTokenRisk: "medium",
    freeLimitRisk: "high",
    decision: "backup_experiment_only",
    reason: "Official docs expose structured outputs/function calling and per-project rate limits, but free-tier quotas vary and forum reports show 429 surprises."
  },
  {
    provider: "OpenRouter free models",
    structuredOutput: "provider_or_model_dependent",
    firstTokenRisk: "medium",
    freeLimitRisk: "high",
    decision: "backup_experiment_only",
    reason: "Good model variety and OpenAI-compatible routing, but free model limits/provider throttling are volatile and model choice can change."
  },
  {
    provider: "Hugging Face Inference Providers",
    structuredOutput: "provider_or_model_dependent",
    firstTokenRisk: "high",
    freeLimitRisk: "high",
    decision: "offline_enrichment_only",
    reason: "Useful ecosystem and credits, but routed-provider behavior and tiny free credit are not a safe live judge path."
  },
  {
    provider: "Mistral La Plateforme",
    structuredOutput: "usable",
    firstTokenRisk: "medium",
    freeLimitRisk: "high",
    decision: "backup_experiment_only",
    reason: "Official docs say free tier is restrictive and production projects should upgrade; do not wire into release without separate live proof."
  }
];

export const BACKUP_AI_DECISION = {
  releaseDecision: "no_provider_switch_before_submission",
  liveFallbackAllowed: ["none until a candidate passes the same NPC-turn, live-suspect, demo-route, security, and browser gates as Groq"],
  experimentAllowed: ["Google Gemini API", "OpenRouter free models", "Mistral La Plateforme"],
  offlineOnly: ["Groq llama-3.3-70b-versatile", "Hugging Face Inference Providers"],
  excludedFromClaims: ["any untested backup provider", "client-side API keys", "fallback described as live AI"],
  reason: "The current serverless Groq path is verified and bounded; adding an unproven provider now increases submission risk."
} as const;

export const SKILL_STACK_DECISIONS: SkillDecision[] = [
  {
    skillId: "superpowers:verification-before-completion",
    keep: true,
    releaseUse: "Mandatory final proof before any completion claim.",
    riskBoundary: "Process-only; does not add runtime dependency or secrets."
  },
  {
    skillId: "browser-use:browser / Playwright",
    keep: true,
    releaseUse: "Runtime/mobile console and viewport verification.",
    riskBoundary: "Local verification only; no player-facing dependency."
  },
  {
    skillId: "vercel deployment skills",
    keep: true,
    releaseUse: "Use only when deploying or verifying public Vercel URLs.",
    riskBoundary: "Do not create thread automation or publish secrets."
  },
  {
    skillId: "broad autoskills installation",
    keep: false,
    releaseUse: "No new skill bundle required for this repo size and deadline.",
    riskBoundary: "Avoid expanding tool surface before final submission unless a concrete failing gate requires it."
  }
];

export const CODEBASE_INTELLIGENCE_DECISION = {
  decision: "use_precise_search_not_global_index",
  observedProjectFiles: 85,
  reason:
    "The release surface is small enough for rg, targeted file reads, TypeScript contracts, and Playwright gates; a new index layer would add setup drift without improving judge-readiness.",
  revisitIf: [
    "repo grows beyond several hundred source/docs/test files",
    "second case introduces duplicated state/data contracts",
    "cross-repo packaging starts requiring semantic dependency analysis"
  ],
  currentTools: ["rg", "targeted TypeScript contracts", "npm script gates", "Playwright"]
} as const;

export const CURRENT_RISK_BASELINE_TABLE = [
  {
    area: "AI quality",
    currentState: "Live Groq path works, but answer quality is volatile.",
    releaseRisk: "Generic or weak first answer lowers AI Integration.",
    verification: "npm run test:npc-turn && npm run test:live-suspects && npm run test:demo-route"
  },
  {
    area: "mobile UI",
    currentState: "Mobile-first gates pass for current viewports.",
    releaseRisk: "Keyboard or dock regression can block final actions.",
    verification: "npm run test:mobile-ui && npm run test:release-browser && npm run test:browser-smoke"
  },
  {
    area: "language parity",
    currentState: "RU/EN copy gates exist and saved locale is part of the game state.",
    releaseRisk: "Mixed-language AI/copy can make the case feel unfinished.",
    verification: "npm run test:ui-copy && npm run test:live-suspects"
  },
  {
    area: "buttons",
    currentState: "Critical actions are covered by mobile/browser/release playthrough gates.",
    releaseRisk: "Duplicate submit, hidden disabled state, or stale restart state can break the judge route.",
    verification: "npm run test:release-playthrough && npm run test:release-browser"
  },
  {
    area: "visual proof",
    currentState: "Visual DNA/assets are verified and current screenshots are reproducible.",
    releaseRisk: "Stale footage or generic UI weakens Best Design.",
    verification: "npm run test:visual-dna && npm run test:visual-assets"
  },
  {
    area: "final submission",
    currentState: "Local package gate passes; strict external URLs are still required.",
    releaseRisk: "Missing public URL, repo URL, or video URL blocks a complete Devpost submission.",
    verification: "LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
  },
  {
    area: "demo video",
    currentState: "Script and route exist, but public video URL is not in env.",
    releaseRisk: "No demo video means strict readiness remains capped.",
    verification: "LIARLINE_DEMO_VIDEO_URL=<public video URL> LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
  }
] as const;

export const PHASE1_READINESS_TODO_CLOSURES = [
  "T011",
  "T012",
  "T013",
  "T014",
  "T015",
  "T016",
  "T017",
  "T018",
  "T019",
  "T020"
] as const;
