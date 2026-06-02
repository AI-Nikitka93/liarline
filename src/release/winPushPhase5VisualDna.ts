export const PHASE5_TODO_CLOSURES = [
  "T101",
  "T102",
  "T103",
  "T104",
  "T105",
  "T106",
  "T107",
  "T108",
  "T109",
  "T110",
  "T111",
  "T112",
  "T113",
  "T114",
  "T115",
  "T116",
  "T117",
  "T118",
  "T119",
  "T120",
  "T121",
  "T122",
  "T123",
  "T124",
  "T125",
  "T126",
  "T127",
  "T128",
  "T129",
  "T130"
] as const;

export const LOCALE_VISUAL_ACCEPTANCE = {
  todoIds: ["T101", "T102", "T103", "T104", "T105", "T106", "T107"] as const,
  storageKeys: ["liarline.locale.v1", "liarline.save.v1"] as const,
  invariants: [
    "Locale persistence is separated from game-state persistence.",
    "Switching RU/EN never mutates truthTable, transcript, unlocked clues, selected accusation data, or resolution outcome.",
    "Long RU strings must wrap inside buttons, dock, cards, notebook, accusation risk, and resolution cards.",
    "Loading, empty, error, and degraded AI states are styled as playable witness-room states.",
    "Color-coded states always include text labels or aria labels.",
    "One-handed route remains available at 360-430px widths."
  ],
  verificationCommands: [
    "npm run test:win-push-phase5-visual-dna",
    "npm run test:browser-phase5-visual-dna",
    "npm run test:mobile-ui",
    "npm run test:mobile-states"
  ]
} as const;

export const PHASE5_VISUAL_RESEARCH = {
  date: "2026-05-09",
  sources: [
    {
      id: "w3c-wcag-2-2-target-size",
      source: "W3C WCAG 2.2 SC 2.5.8 Target Size",
      appliedRule: "Keep touch targets at or above the local 44px control target and never rely on color alone."
    },
    {
      id: "mdn-visual-viewport",
      source: "MDN Viewport concepts, modified 2026-03-09",
      appliedRule: "Treat mobile keyboards as visual-viewport changes and keep the action dock above the keyboard."
    },
    {
      id: "mdn-storage-event",
      source: "MDN Window storage event, modified 2025-05-02",
      appliedRule: "Keep locale and save persistence under stable localStorage keys and test cross-session reload behavior."
    },
    {
      id: "playwright-webserver",
      source: "Playwright webServer docs",
      appliedRule: "Run mobile browser acceptance against a local server with deterministic route interception."
    },
    {
      id: "design-md-repos",
      source: "GitHub REST evidence for google-labs-code/design.md, VoltAgent/awesome-design-md, kzhrknt/awesome-design-md-jp, bergside/awesome-design-skills, shaom/brand-to-design-md-skill, hasi98/designpull",
      appliedRule: "DESIGN.md stays a compact production visual contract; raw research stays in docs/visual or _archive."
    }
  ]
} as const;

export const PHASE5_SCREEN_VISUAL_CONTRACT = {
  todoIds: ["T113", "T114", "T115", "T116", "T117", "T118", "T119", "T120"] as const,
  requiredClasses: [
    "first-viewport-visual-lock",
    "suspect-first-hero",
    "interrogation-composition-panel",
    "transcript-evidence-thread",
    "contradiction-reveal-stage",
    "persona-shift-card",
    "compact-evidence-surface",
    "final-risk-stage",
    "final-proof-ledger",
    "resolution-verdict-stage",
    "verdict-reconstruction-card",
    "rating-stamp"
  ],
  screenRoles: [
    "Briefing shows suspect, case risk, and first action before any marketing copy.",
    "Interrogation groups suspect pressure, transcript, questions, AP, and notebook into a single playable hierarchy.",
    "Contradiction reveal is a visual event with board link, suspicion shift, and next action.",
    "Persona shift changes portrait, border, pressure copy, and AI voice target.",
    "Notebook reads as working deduction evidence, not settings.",
    "Accusation reads as final risk and proof ledger, not a generic form.",
    "Resolution explains verdict, reconstruction, evidence strength, and missed opportunities."
  ]
} as const;

export const DESIGN_HANDOFF_REPOS = [
  "google-labs-code/design.md",
  "VoltAgent/awesome-design-md",
  "kzhrknt/awesome-design-md-jp",
  "bergside/awesome-design-skills",
  "shaom/brand-to-design-md-skill",
  "hasi98/designpull"
] as const;

export const PHASE5_ASSET_ACCEPTANCE = {
  todoIds: ["T125", "T126", "T127", "T128", "T129"] as const,
  assetWorkflow: "single-asset generation, one curated selection per role, explicit rejection rules, mobile crop/contrast proof",
  requiredAssetChecks: [
    "no visible watermark",
    "no readable fake text",
    "mobile crop safe",
    "style consistent",
    "no story spoiler",
    "within public PNG size budget"
  ],
  futureIllustrationRules: [
    "Generate only one role at a time with a dedicated brief.",
    "Reject cheap AI-look: plastic faces, fake text, mismatched lighting, or generic bokeh.",
    "Never add evidence props that are not in the deterministic case.",
    "Small gameplay inserts must clarify deduction; they must not become a gallery."
  ]
} as const;

export const PHASE5_ANCHOR_REVIEW = {
  todoIds: ["T108", "T109", "T130"] as const,
  signal: "Anchor OK. Продолжаем.",
  phaseSignal: "Фаза 4 закрыта. Переходим к фазе 5",
  restorePointName: "PHASE5_T101_T130_VISUAL_DNA_HANDOFF",
  driftFound: [] as string[],
  releaseBlockers: [
    "External demo video URL is still required for strict final Devpost readiness.",
    "Strict public URL/GitHub URL validation remains external to local T101-T130 closure."
  ]
} as const;
