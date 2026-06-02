export const PHASE4_TODO_CLOSURES = [
  "T071",
  "T072",
  "T073",
  "T074",
  "T075",
  "T076",
  "T077",
  "T078",
  "T079",
  "T080",
  "T081",
  "T082",
  "T083",
  "T084",
  "T085",
  "T086",
  "T087",
  "T088",
  "T089",
  "T090",
  "T091",
  "T092",
  "T093",
  "T094",
  "T095",
  "T096",
  "T097",
  "T098",
  "T099",
  "T100"
] as const;

export const PHASE4_BROWSER_UX_RESEARCH = {
  date: "2026-05-09",
  standards: [
    {
      id: "wcag-2-2-target-size",
      source: "W3C WCAG 2.2 SC 2.5.8",
      requirement: "Pointer targets are at least 24 by 24 CSS px or have sufficient spacing.",
      implementedBy: "All critical Liarline buttons use min-h-8 or min-h-11, focus rings, and mobile-width browser tests."
    },
    {
      id: "mdn-visual-viewport",
      source: "MDN CSS viewport concepts, last modified 2026-03-09",
      requirement: "Virtual keyboards shrink the visual viewport, not necessarily the layout viewport.",
      implementedBy: "useKeyboardInset plus --keyboard-inset and dock-height scroll recovery."
    },
    {
      id: "playwright-webserver",
      source: "Playwright webServer docs",
      requirement: "Use a local webServer with baseURL and reuseExistingServer for browser release tests.",
      implementedBy: "playwright.config.ts and sequential browser gates."
    },
    {
      id: "mdn-storage-event",
      source: "MDN Window storage event, last modified 2025-05-02",
      requirement: "LocalStorage is per-origin and cross-tab changes fire storage events in other contexts.",
      implementedBy: "Locale and save keys are isolated under liarline.* and persisted without changing the TruthTable."
    }
  ]
} as const;

export const CASE_ACCEPTANCE_MATRIX = [
  {
    todoId: "T071",
    gate: "reverse_reconstruction",
    passSignal: "Resolution includes camera break, cart log, Ivo 21:10 gap, and verdict-specific reconstruction."
  },
  {
    todoId: "T072",
    gate: "player_confusion_map",
    passSignal: "Suspect, clue, motive, contradiction, and rating confusion risks have UI anchors and tests."
  },
  {
    todoId: "T073",
    gate: "quick_judge_route",
    passSignal: "The obvious route reaches first AI answer, contradiction, Ivo pressure, accusation, and resolution."
  },
  {
    todoId: "T074",
    gate: "chaotic_player_route",
    passSignal: "Random suspect/question order keeps suspicion bounded, AP valid, and accusation fairness intact."
  },
  {
    todoId: "T075",
    gate: "russian_player_route",
    passSignal: "RU run uses the same deterministic contradiction, culprit, motive, evidence, and ratings as EN."
  },
  {
    todoId: "T076",
    gate: "fallback_only_route",
    passSignal: "Fallback answer is marked guarded, spends no AP, unlocks no clue, and public copy avoids live-AI overclaim."
  },
  {
    todoId: "T077",
    gate: "final_case_acceptance",
    passSignal: "One coherent path covers contradiction, collapse, persona shift, notebook, accusation, and resolution."
  },
  {
    todoId: "T078",
    gate: "phase3_end_review",
    passSignal: "Phase 3 is closed only with executable acceptance and a restore point."
  }
] as const;

export const PLAYER_CONFUSION_MAP = [
  {
    risk: "suspect_vs_suspicion",
    mitigation: "Suspicion meter copy says suspicion is pressure, not proof; rating logic keeps Theo tempting but not correct."
  },
  {
    risk: "clue_vs_public_fact",
    mitigation: "Notebook separates opened clues, contradictions, locked evidence, and suspicion signals."
  },
  {
    risk: "motive_vs_culprit",
    mitigation: "Accusation requires explicit suspect and motive selection; motives localize by stable motive IDs."
  },
  {
    risk: "contradiction_vs_hint",
    mitigation: "Collapse UI explains camera-vs-cart without naming the final culprit as a command."
  },
  {
    risk: "rating_vs_outcome",
    mitigation: "Resolution shows outcome, detective rating, evidence score, reverse reconstruction, and missed opportunities."
  }
] as const;

export const INTERACTIVE_ELEMENT_INVENTORY = [
  "language-entry-ru",
  "language-entry-en",
  "locale-toggle-ru",
  "locale-toggle-en",
  "first-question-cta",
  "briefing-notebook-open",
  "interrogation-notebook-summary",
  "suspect-selector",
  "suggested-question-button",
  "custom-question-input",
  "send-question-button",
  "accusation-entry-button",
  "contradiction-notebook-button",
  "collapse-focus-pressure-button",
  "dead-end-hint-button",
  "notebook-close",
  "accuse-suspect-choice",
  "accuse-motive-choice",
  "accuse-evidence-choice",
  "accusation-notebook-open",
  "continue-interrogation-button",
  "final-accusation-submit",
  "restart-case-button"
] as const;

export const BUTTON_ACCEPTANCE_RULES = {
  todoIds: ["T079", "T080", "T081", "T082", "T083", "T084", "T085", "T086", "T088", "T089", "T091", "T092", "T093", "T094", "T095", "T096"] as const,
  minimumTouchTargetCssPx: 24,
  criticalTouchTargetClass: "min-h-11",
  visualRequirements: ["focus:ring-2", "disabled:", "aria-label", "aria-pressed"],
  codeRequirements: ["disabled={pendingQuestion}", "disabled={!accusationReady}", "disabled={!canSubmitAccusation}", "currentRequestAbortRef.current?.abort()"]
} as const;

export const MOBILE_VIEWPORT_ACCEPTANCE = {
  todoIds: ["T097", "T098", "T099"] as const,
  widths: [360, 375, 390, 430],
  requiredSurfaces: [
    "language-entry-screen",
    "start-interrogation-surface",
    "portrait-anchor",
    "transcript-stack",
    "compact-evidence-surface",
    "accusation-risk-screen",
    "resolution-complete-screen"
  ],
  keyboardSafeContracts: ["visualViewport", "--keyboard-inset", "--interrogation-dock-height", "scrollLatestTurnAboveDock"]
} as const;

export const LANGUAGE_PHASE_ACCEPTANCE = {
  todoId: "T100",
  phases: ["briefing", "interrogation", "notebook", "accusation", "resolution"] as const,
  invariant: "Switching RU/EN changes labels and localized text only; TruthTable IDs, unlocked clues, transcript, and accusation state remain stable."
} as const;

export const PHASE4_ANCHOR_REVIEW = {
  todoId: "T087",
  signal: "Anchor OK. Продолжаем.",
  restorePointName: "PHASE4_T071_T100_MOBILE_UX_ACCEPTANCE",
  driftFound: [] as string[],
  releaseBlockers: [
    "External demo video URL is still required for strict final Devpost readiness.",
    "Strict public URL/GitHub URL validation remains external to local T071-T100 closure."
  ]
} as const;
