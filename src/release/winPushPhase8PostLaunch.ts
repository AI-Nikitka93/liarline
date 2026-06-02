export const PHASE8_TODO_CLOSURES = [
  "T191",
  "T192",
  "T193",
  "T194",
  "T195",
  "T196",
  "T197",
  "T198",
  "T199",
  "T200",
  "T201",
  "T202",
  "T203",
  "T204",
  "T205"
] as const;

export const HOTFIX_DECISION_RULES = [
  {
    blockerId: "unplayable_path",
    lane: "hotfix",
    detectWith: ["npm run test:release-playthrough", "npm run test:release-browser"],
    fixBeforeAnythingElse: "Restore first-question -> contradiction -> accusation -> resolution route before any polish.",
    noGoIf: "The route cannot reach Resolution from a clean save on a phone-width viewport."
  },
  {
    blockerId: "broken_first_ai_answer",
    lane: "hotfix",
    detectWith: ["npm run test:demo-route", "npm run test:live-suspects"],
    fixBeforeAnythingElse: "Tune prompt/validator/model key failover until first answer is concrete, in-language, non-generic, and live-labeled only when source is Groq.",
    noGoIf: "First live answer is generic, fallback-only, mixed-language, or disconnected from the camera/cart hook."
  },
  {
    blockerId: "truth_leak",
    lane: "hotfix",
    detectWith: ["npm run test:npc-turn", "npm run test:phase7"],
    fixBeforeAnythingElse: "Stop release and remove hidden truth, culprit, motive, role, or internal marker from prompts, UI, transcript, and docs.",
    noGoIf: "Any player-facing or model-facing surface exposes hidden truth-table data."
  },
  {
    blockerId: "broken_fallback",
    lane: "hotfix",
    detectWith: ["npm run test:npc-turn", "npm run test:browser-phase7"],
    fixBeforeAnythingElse: "Restore playable guarded fallback with no AP spend, no clue unlock, and honest source label.",
    noGoIf: "Fallback blocks play, spends AP, opens clues, shifts suspicion, or claims live AI."
  },
  {
    blockerId: "broken_restart",
    lane: "hotfix",
    detectWith: ["npm run test:mobile-ui", "npm run test:browser-phase7-polish"],
    fixBeforeAnythingElse: "Fix abort, clean local state reset, corrupt-save quarantine, and visible restart route.",
    noGoIf: "Restart leaves pending AI, corrupted save, wrong locale, or impossible navigation state."
  },
  {
    blockerId: "mobile_blocker",
    lane: "hotfix",
    detectWith: ["npm run test:browser-smoke", "npm run test:browser-phase7-submission"],
    fixBeforeAnythingElse: "Fix touch target, keyboard inset, dock overlap, horizontal overflow, or hidden critical action.",
    noGoIf: "Critical path is visually present but unreachable on phone-width viewport."
  }
] as const;

export const DEMO_DAY_RECOVERY_SCENARIOS = [
  {
    scenarioId: "ai_outage",
    operatorSteps: [
      "Check Groq status and run `npm run test:npc-turn`.",
      "Use honest fallback mode only if the demo states it is degraded.",
      "Do not upload fallback-only footage as live AI."
    ],
    noGoIf: "Video or copy describes fallback footage as live Groq."
  },
  {
    scenarioId: "public_url_stale",
    operatorSteps: [
      "Open https://liarline.vercel.app in a clean mobile browser session.",
      "Run strict public URL check through `npm run test:judge-readiness` with the public URL set.",
      "Redeploy or rollback if the live site does not match the current local route."
    ],
    noGoIf: "Public URL shows old UI, missing feedback panel, or broken first-question CTA."
  },
  {
    scenarioId: "bad_save",
    operatorSteps: [
      "Use top-bar Restart to force a clean local case.",
      "If needed, clear only `liarline.save.v1`; do not clear locale unless localization is the bug.",
      "Confirm corrupt save is quarantined rather than reused."
    ],
    noGoIf: "A bad save can trap the player outside briefing/interrogation/accusation/resolution."
  },
  {
    scenarioId: "broken_mobile_layout",
    operatorSteps: [
      "Run `npm run test:browser-smoke` and inspect 390x844.",
      "Prioritize dock/keyboard/tap target fixes over visual polish.",
      "Retest both briefing and interrogation scroll."
    ],
    noGoIf: "Any critical action is covered, too small, or off-screen."
  },
  {
    scenarioId: "fallback_only_recording",
    operatorSteps: [
      "Delete the take from final live-AI submission material.",
      "Retry after provider health and `npm run test:demo-route` pass.",
      "If fallback is intentionally shown, label it as degraded mode."
    ],
    noGoIf: "Fallback is the only recorded route while the submission claims live AI."
  }
] as const;

export const FRESHNESS_REVIEW_CYCLES = [
  {
    cycleId: "ai_provider_facts",
    cadence: "before every demo recording and hotfix",
    sources: [
      "https://console.groq.com/docs/model/llama-3.1-8b-instant",
      "https://console.groq.com/docs/rate-limits",
      "https://status.groq.com/",
      "npm run test:npc-turn",
      "npm run test:live-suspects"
    ],
    updateTargets: ["docs/AI_PROVIDER_STATUS_CURRENT.md", "docs/RELEASE.md", "docs/STATE.md"]
  },
  {
    cycleId: "contest_submission_facts",
    cadence: "before deadline day, immediately before submit, and after submit",
    sources: [
      "https://ai-game-week-29908.devpost.com/",
      "https://help.devpost.com/article/126-know-your-submission-steps",
      "https://help.devpost.com/article/145-how-do-i-set-up-the-submission-period",
      "npm run test:judge-readiness"
    ],
    updateTargets: ["docs/SUBMISSION_PACKAGE.md", "docs/SUBMISSION.md", "docs/RELEASE.md"]
  },
  {
    cycleId: "visual_browser_behavior",
    cadence: "after every UI patch",
    sources: [
      "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts",
      "https://web.dev/articles/bfcache",
      "npm run test:browser-smoke",
      "npm run test:browser-phase7-submission"
    ],
    updateTargets: ["docs/visual-spec.md", "docs/RELEASE.md", "src/hooks/useKeyboardInset.ts"]
  }
] as const;

export const FAST_DECAY_KNOWLEDGE_MAP = [
  {
    factId: "provider_status",
    refreshIn: "before demo recording and before final submit",
    sourceOfTruth: "Groq status page plus live smoke tests"
  },
  {
    factId: "rate_limits",
    refreshIn: "before live recording, after any 429, and before changing key strategy",
    sourceOfTruth: "Groq rate-limit docs plus local failover warnings"
  },
  {
    factId: "contest_fields",
    refreshIn: "before final submit and after any Devpost message",
    sourceOfTruth: "Devpost AI Game Week page and Devpost submission help"
  },
  {
    factId: "mobile_keyboard_behavior",
    refreshIn: "before UI release and after browser/iOS/Android reports",
    sourceOfTruth: "MDN viewport docs, browser smoke, and device/viewport checks"
  },
  {
    factId: "submission_packet",
    refreshIn: "before publishing, after upload, and after every strict readiness failure",
    sourceOfTruth: "docs/SUBMISSION_PACKAGE.md and strict judge-readiness"
  }
] as const;

export const EVIDENCE_FOLLOW_UP_BACKLOG = [
  {
    itemId: "notebook_clarity",
    evidenceSource: "local feedback category `notebook_clarity`, missed contradiction notes, and browser-resolution feedback entries",
    acceptanceSignal: "Players can explain why camera panic is not enough and where the cart gap points."
  },
  {
    itemId: "persona_shift_punch",
    evidenceSource: "live-suspect audits and player notes mentioning Ivo pressure feels too calm",
    acceptanceSignal: "Ivo's post-contradiction answer visibly changes tone without confessing."
  },
  {
    itemId: "rating_fairness",
    evidenceSource: "feedback category `unfair_accusation` and Resolution rating objections",
    acceptanceSignal: "Players can predict why a result is Sharp, Reckless, or Misled from selected proof."
  },
  {
    itemId: "ai_generic_answer_rate",
    evidenceSource: "`npm run test:live-suspects`, `npm run test:demo-route`, and feedback category `ai_quality`",
    acceptanceSignal: "Repeated/generic answer rate stays below one accepted live answer per recording route."
  }
] as const;

export const SECOND_CASE_THRESHOLD = {
  decision: "do_not_start_second_case_yet",
  requiredStableSignals: [
    "Notebook comparison clarity",
    "persona-shift recognition",
    "rating fairness",
    "AI generic-answer rate",
    "restart/fallback/mobile reliability"
  ],
  minimumEvidence: "At least 5 external playthrough notes or judge/demo observations with no repeated first-case blocker."
} as const;

export const FUTURE_CASE_TEMPLATE = {
  status: "template_only_not_current_release",
  requiredBeats: ["false_certainty", "guaranteed_contradiction", "collapse", "persona_shift", "evidence_based_resolution"],
  requiredBoundaries: [
    "AI performs suspects only.",
    "Truth table stays deterministic.",
    "Every case needs one tempting wrong theory and one guaranteed contradiction.",
    "Resolution must explain evidence, not model opinion."
  ]
} as const;

export const DO_NOT_REOPEN_ITEMS = [
  {
    itemId: "hidden_truth_in_prompt",
    reason: "Would break the actor-not-judge architecture and invite truth leaks."
  },
  {
    itemId: "full_trial_mode",
    reason: "Expands the game before first-case deduction clarity is stable."
  },
  {
    itemId: "multiplayer",
    reason: "Adds networking and moderation scope outside the judge route."
  },
  {
    itemId: "voice",
    reason: "Adds permissions, latency, and fallback complexity before text route is fully submitted."
  },
  {
    itemId: "accounts",
    reason: "Adds privacy/security surface without improving the current one-case proof loop."
  },
  {
    itemId: "procedural_cases",
    reason: "Risks toy mystery generation and weak evidence logic before one-case quality is proven."
  }
] as const;

export const CHANGELOG_DISCIPLINE_RULES = {
  requiredFields: ["playerImpact", "proof", "noDriftCheck", "affectedReleaseDocs"],
  rejectIf: [
    "Claims completion without fresh command output.",
    "Describes future scope as shipped.",
    "Changes public copy without updating submission/release docs.",
    "Adds behavior without a player-facing reason."
  ]
} as const;

export const ARTIFACT_HYGIENE_RULES = [
  {
    artifactId: "raw_ai_outputs",
    location: "_archive/agent-memory/ or runtime logs only",
    releaseRule: "Never pack raw provider responses, transcripts with keys, or failed generations into public bundle."
  },
  {
    artifactId: "rejected_assets",
    location: "_archive/raw-generated-assets/",
    releaseRule: "Only curated referenced PNGs remain in public/assets."
  },
  {
    artifactId: "logs",
    location: "_archive/runtime-logs/",
    releaseRule: "No dev-server logs, Playwright traces, or temporary screenshots in npm pack."
  },
  {
    artifactId: "research_scraps",
    location: "_archive/agent-memory/docs/ or concise source-backed release docs",
    releaseRule: "Do not turn research scraps into public product claims."
  }
] as const;

export const POST_LAUNCH_READINESS = {
  feedbackIntake: true,
  triage: true,
  hotfixRules: true,
  recovery: true,
  freshnessCycles: true,
  scopeDriftGuard: true,
  strictSubmissionStillRequires: "real_demo_video_url"
} as const;

export const PHASE8_ANCHOR_REVIEW = {
  status: "Anchor OK. Продолжаем.",
  noDrift: true,
  restorePointName: "PHASE8_T191_T205_POSTLAUNCH_READINESS",
  direction: "Post-launch support strengthens first-case clarity instead of opening season/trial/multiplayer scope."
} as const;

export const PHASE8_END_REVIEW = {
  phase: 8,
  signal: "Фаза 8 закрыта. Переходим к финальному submit/post-launch циклу",
  inheritedExternalBlockers: ["real_demo_video_url"],
  closed: [
    "hotfix rules",
    "demo-day recovery",
    "freshness cycles",
    "evidence-only backlog",
    "second-case threshold",
    "future-case template",
    "do-not-reopen guardrail",
    "changelog discipline",
    "artifact hygiene"
  ]
} as const;
