export const PHASE6_TODO_CLOSURES = [
  "T131",
  "T132",
  "T133",
  "T134",
  "T135",
  "T136",
  "T137",
  "T138",
  "T139",
  "T140",
  "T141",
  "T142",
  "T143",
  "T144",
  "T145",
  "T146",
  "T147",
  "T148",
  "T149",
  "T150",
  "T151",
  "T152",
  "T153",
  "T154",
  "T155",
  "T156",
  "T157",
  "T158",
  "T159",
  "T160"
] as const;

export const PHASE6_VISUAL_SYSTEM_RESEARCH = {
  date: "2026-05-09",
  sources: [
    {
      source: "W3C WCAG 2.2 SC 2.5.8 Target Size",
      appliedRule: "Interactive targets keep at least the local 44px game target, exceeding the 24px WCAG minimum."
    },
    {
      source: "MDN prefers-reduced-motion CSS media feature",
      appliedRule: "Motion is useful only when states remain readable with reduced motion enabled."
    },
    {
      source: "web.dev animation performance guidance",
      appliedRule: "Gameplay microeffects are limited to transform, opacity, and restrained box-shadow."
    },
    {
      source: "Playwright screenshots and visual comparisons documentation",
      appliedRule: "Visual proof artifacts are generated from browser routes and stored outside the release bundle."
    },
    {
      source: "Next.js Image fill parent position GitHub issue/discussion evidence",
      appliedRule: "Every fill image sits in an explicit relative, dimensioned parent to avoid runtime warnings."
    },
    {
      source: "Reddit/field reports on responsive next/image and mobile animation jank",
      appliedRule: "Avoid gallery-style full-page image churn and avoid motion tied to layout-changing properties."
    }
  ]
} as const;

export const PHASE6_QA_ACCEPTANCE_MATRIX = [
  {
    phase: "Briefing",
    functionalChecks: ["locale selected", "first question starts AI turn", "restart resets saved game"],
    visualChecks: ["first viewport has suspect/risk/action", "briefing insert is small and non-spoiler"],
    proofCommands: ["npm run test:browser-phase6-qa", "npm run test:browser-smoke"]
  },
  {
    phase: "Interrogation",
    functionalChecks: ["AP spend only on accepted live turns", "duplicate submit blocked", "stale AI ignored after restart"],
    visualChecks: ["mood states visible", "dock stays above keyboard", "scenario panels do not overflow"],
    proofCommands: ["npm run test:browser-phase6-qa", "npm run test:browser-phase7"]
  },
  {
    phase: "Notebook",
    functionalChecks: ["clues and contradictions match deterministic unlocks", "locked clues stay redacted"],
    visualChecks: ["paper surface readable", "signals are labeled beyond color"],
    proofCommands: ["npm run test:mobile-states", "npm run test:visual-dna"]
  },
  {
    phase: "Accusation",
    functionalChecks: ["suspect/motive required", "final submit disabled until risk acknowledged"],
    visualChecks: ["risk panel is distinct", "proof ledger is readable at 360px"],
    proofCommands: ["npm run test:browser-phase6-qa", "npm run test:release-playthrough"]
  },
  {
    phase: "Resolution",
    functionalChecks: ["perfect/partial/loss outcomes render", "restart returns to clean briefing"],
    visualChecks: ["rating stamp visible", "reconstruction explains the verdict"],
    proofCommands: ["npm run test:browser-phase6-qa", "npm run test:release-browser"]
  },
  {
    phase: "Fallback",
    functionalChecks: ["missing key/rate-limit/timeout/invalid JSON remain playable", "fallback never spends AP"],
    visualChecks: ["fallback labels never claim live AI", "slow AI has visible waiting state"],
    proofCommands: ["npm run test:npc-turn", "npm run test:browser-phase7"]
  },
  {
    phase: "Restart",
    functionalChecks: ["restart aborts pending request", "corrupt save is quarantined", "locale persists"],
    visualChecks: ["restart button is role-specific", "desktop shell stays mobile-width"],
    proofCommands: ["npm run test:browser-phase7-polish", "npm run test:mobile-ui"]
  }
] as const;

export const PHASE6_VISUAL_SYSTEM_STATUS = {
  scenarioPanels: "implemented as gameplay inserts only; no gallery mode",
  moodSystem: "six mood classes with restrained state cues",
  buttonSystem: "critical controls have role-specific classes and feedback states",
  typographyRhythm: "hero, panel, metadata, transcript, and buttons keep fixed non-viewport-scaled sizes",
  colorDiscipline: "amber=evidence, red=risk/contradiction, cyan=system/live/fallback, paper=evidence texture",
  visualEffectsBudget: {
    maxAnimatedProperties: ["opacity", "transform", "box-shadow"],
    reducedMotionRequired: true,
    noDecorativeAiMagic: true
  },
  anchor: {
    signal: "Anchor OK. Продолжаем.",
    phaseSignal: "Фаза 5 закрыта. Переходим к фазе 6",
    restorePointName: "PHASE6_T131_T160_QA_VISUAL_SYSTEM",
    releaseBlockers: [
      "Strict Devpost readiness still requires external playable URL, GitHub URL, and demo video URL.",
      "Real-device manual phone check remains external to local browser acceptance."
    ]
  }
} as const;

export const VISUAL_REGRESSION_PROOF_ARTIFACTS = [
  {
    path: "_archive/release-screenshots/phase6-2026-05-09/briefing.png",
    phase: "Briefing"
  },
  {
    path: "_archive/release-screenshots/phase6-2026-05-09/interrogation.png",
    phase: "Interrogation"
  },
  {
    path: "_archive/release-screenshots/phase6-2026-05-09/accusation.png",
    phase: "Accusation"
  },
  {
    path: "_archive/release-screenshots/phase6-2026-05-09/resolution.png",
    phase: "Resolution"
  }
] as const;
