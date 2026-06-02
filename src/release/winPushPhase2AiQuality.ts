export type AiFailureMode = {
  failureModeId:
    | "off_question"
    | "generic_filler"
    | "role_loss"
    | "language_mix"
    | "invented_evidence"
    | "weak_pressure"
    | "repeat"
    | "spoiler_or_judge";
  playerImpact: string;
  runtimeGuard: string;
  releaseGate: string;
};

export type SuspectVoiceTarget = {
  suspectId: "suspect_theo" | "suspect_ivo" | "suspect_mara" | "suspect_lena";
  performanceRole: "confused_witness" | "protective_liar" | "motive_guardian" | "direct_witness";
  coreVoice: string;
  mustIncludeAllowedGameDetail: string[];
  mustAvoid: string[];
};

export type JudgeRouteAiBeat = {
  todoId: "T025" | "T026" | "T027" | "T028";
  suspectId: SuspectVoiceTarget["suspectId"];
  requiredBeat: string;
  mustDo: string[];
  mustNotDo: string[];
  verification: string;
};

export const PHASE2_AI_QUALITY_DATE = "2026-05-08" as const;

export const RESTORE_POINT_T021 = {
  name: "PHASE1_T001_T020_ANCHOR_OK",
  includes: [
    "T001-T020 checked in docs/MASTER_TODO.md",
    "PHASE1_T011_T020_CLOSED state snapshot",
    "current Groq provider status and live-suspect evidence",
    "Phase 1 release/readiness gates and strict external blocker boundary"
  ],
  integrityCommands: [
    "npm run test:win-push-phase1",
    "npm run test:win-push-phase1-readiness",
    "npm run test:judge-readiness",
    "git status --short"
  ],
  rollbackTarget:
    "Use docs/STATE.md status PHASE1_T011_T020_CLOSED plus git diff for this workspace; external URLs are not part of this restore point."
} as const;

export const PHASE1_ANCHOR_REVIEW = {
  resultLine: "Anchor OK. Продолжаем.",
  checkedTodoIds: [
    "T001",
    "T002",
    "T003",
    "T004",
    "T005",
    "T006",
    "T007",
    "T008",
    "T009",
    "T010",
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
  ],
  coreValueCheck: "All closed work protects the one-case evidence-first loop: AI suspects perform, evidence convicts.",
  correctEndStateCheck:
    "Closed work strengthens first AI answer, contradiction, persona shift, mobile/browser readiness, honest public claims, provider readiness, and submission proof.",
  doNotDriftCheck:
    "No closed task adds season, trial mode, multiplayer, voice/video interrogation, procedural generation, hidden-truth prompting, or fake live-AI claims.",
  driftFound: [],
  restorePointName: RESTORE_POINT_T021.name
} as const;

export const PHASE1_END_REVIEW = {
  closedSummary:
    "T001-T020 plus T010A closed current audit, source of truth, contest freshness, public-claim truth, provider status, backup decision, skill/codebase decisions, and risk baseline.",
  anchorFit:
    "The phase moves Liarline toward one polished mobile AI detective case with deterministic evidence-first payoff.",
  releaseBlockers: [
    {
      blocker: "public demo video URL",
      owner: "external",
      strictGate: "LIARLINE_DEMO_VIDEO_URL + LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
    },
    {
      blocker: "public game and GitHub URLs for strict final Devpost gate",
      owner: "external",
      strictGate: "LIARLINE_PUBLIC_URL + LIARLINE_GITHUB_URL + LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
    }
  ],
  signal: "Фаза 1 закрыта. Переходим к фазе 2"
} as const;

export const AI_FAILURE_MODES: AiFailureMode[] = [
  {
    failureModeId: "off_question",
    playerImpact: "The answer feels detached from the asked clue or pressure.",
    runtimeGuard: "User prompt passes requiredAnswerAnchor and recent question context.",
    releaseGate: "npm run test:npc-turn && npm run test:live-suspects"
  },
  {
    failureModeId: "generic_filler",
    playerImpact: "The first AI beat reads like a chatbot refusal instead of a suspect.",
    runtimeGuard: "Response validation rejects generic filler without a playable game anchor.",
    releaseGate: "npm run test:win-push-phase2-ai-quality"
  },
  {
    failureModeId: "role_loss",
    playerImpact: "Suspects blur together or speak as narrator/system.",
    runtimeGuard: "Prompt carries role-specific voiceStyle and validation rejects third-person self-talk.",
    releaseGate: "npm run test:npc-turn && npm run test:live-suspects"
  },
  {
    failureModeId: "language_mix",
    playerImpact: "RU/EN mode feels unfinished or machine-translated.",
    runtimeGuard: "RU prompt forbids English interjections and validation normalizes common inventory/cart leaks.",
    releaseGate: "npm run test:live-suspects && npm run test:ui-copy"
  },
  {
    failureModeId: "invented_evidence",
    playerImpact: "The player can chase non-existent keycards, guards, or extra causes.",
    runtimeGuard: "Validation rejects forbidden invented evidence nouns outside the current case.",
    releaseGate: "npm run test:win-push-phase2-ai-quality"
  },
  {
    failureModeId: "weak_pressure",
    playerImpact: "Contradiction turns do not create the promised persona shift.",
    runtimeGuard: "Pressure prompt requires a defensive correction and compact new pressure line.",
    releaseGate: "npm run test:demo-route && npm run test:live-suspects"
  },
  {
    failureModeId: "repeat",
    playerImpact: "The interrogation feels stalled and fake.",
    runtimeGuard: "Recent transcript is included and validation rejects repeated prior answers.",
    releaseGate: "npm run test:npc-turn && npm run test:live-suspects"
  },
  {
    failureModeId: "spoiler_or_judge",
    playerImpact: "The model solves the case instead of the player proving it.",
    runtimeGuard: "Prompt and validation block culprit, motive, evidence-selection, and final-accusation language.",
    releaseGate: "npm run test:win-push-phase2-ai-quality && npm run test:game-engine"
  }
];

export const SUSPECT_VOICE_TARGETS: SuspectVoiceTarget[] = [
  {
    suspectId: "suspect_theo",
    performanceRole: "confused_witness",
    coreVoice: "nervous, self-correcting, timing-focused, useful but not decisive",
    mustIncludeAllowedGameDetail: ["camera", "minute", "before theft", "panic"],
    mustAvoid: ["confession", "cart certainty", "culprit claim", "calm inventory voice"]
  },
  {
    suspectId: "suspect_ivo",
    performanceRole: "protective_liar",
    coreVoice: "controlled mask cracking into defensive inventory/cart pressure",
    mustIncludeAllowedGameDetail: ["inventory", "cart", "21:10", "routine movement"],
    mustAvoid: ["direct confession", "debt reveal before allowed pressure", "final accusation"]
  },
  {
    suspectId: "suspect_mara",
    performanceRole: "motive_guardian",
    coreVoice: "proud, defensive, partial-truth guardian of rivalry motive",
    mustIncludeAllowedGameDetail: ["rivalry", "prototype", "after 21:05", "lab"],
    mustAvoid: ["Theo-like panic", "Ivo-like inventory control", "generic denial"]
  },
  {
    suspectId: "suspect_lena",
    performanceRole: "direct_witness",
    coreVoice: "blunt, factual, impatient, refuses speculation",
    mustIncludeAllowedGameDetail: ["cart", "storage door", "saw or heard", "no speculation"],
    mustAvoid: ["motive theory", "decorative mystery narration", "hidden culprit"]
  }
];

export const AI_ANSWER_QUALITY_RUBRIC = SUSPECT_VOICE_TARGETS.map((target) => ({
  suspectId: target.suspectId,
  passDefinition:
    "Short mobile-readable answer with role voice, one allowed case detail, useful pressure movement, no spoiler, no internal marker, no repeated beat.",
  mustIncludeAllowedGameDetail: target.mustIncludeAllowedGameDetail,
  mustAvoid: target.mustAvoid,
  gate: "npm run test:win-push-phase2-ai-quality && npm run test:live-suspects"
}));

export const JUDGE_ROUTE_AI_BEATS: JudgeRouteAiBeat[] = [
  {
    todoId: "T025",
    suspectId: "suspect_theo",
    requiredBeat: "first AI wow: nervous camera/timing answer that tempts the wrong theory and leads into camera-vs-cart contradiction",
    mustDo: ["sound nervous", "name camera or timing", "stay short", "avoid solving theft"],
    mustNotDo: ["confess", "generic narration", "claim cart certainty"],
    verification: "npm run test:demo-route && npm run test:live-suspects"
  },
  {
    todoId: "T026",
    suspectId: "suspect_ivo",
    requiredBeat: "persona shift: controlled mask cracks under inventory/cart contradiction without confession",
    mustDo: ["defensive opening", "address inventory/cart", "show pressure", "avoid final answer"],
    mustNotDo: ["confess", "generic narration", "tell player to accuse Ivo"],
    verification: "npm run test:demo-route && npm run test:live-suspects"
  },
  {
    todoId: "T027",
    suspectId: "suspect_mara",
    requiredBeat: "partial-truth motive guardian: rivalry matters emotionally but does not equal theft",
    mustDo: ["separate rivalry from theft", "sound proud/defensive", "include prototype/lab detail"],
    mustNotDo: ["confess", "generic narration", "sound like Theo or Ivo"],
    verification: "npm run test:live-suspects"
  },
  {
    todoId: "T028",
    suspectId: "suspect_lena",
    requiredBeat: "direct witness: blunt cart/storage fact with no speculative motive theory",
    mustDo: ["state observed cart fact", "stay blunt", "refuse speculation"],
    mustNotDo: ["confess", "generic narration", "invent motive"],
    verification: "npm run test:live-suspects"
  }
];

export const MINIMUM_VOICE_DISTANCE = {
  requiredDistinctDimensions: [
    "sentence rhythm",
    "emotional temperature",
    "case-detail focus",
    "pressure reaction",
    "speculation boundary"
  ],
  releaseGate:
    "npm run test:win-push-phase2-ai-quality && npm run test:live-suspects; live answers must keep distinct opening phrasing and role-specific markers.",
  failureResponse: "Treat as release-blocking AI quality regression, not a subjective copy nit."
} as const;

export const AI_ACTOR_NOT_JUDGE_CONTRACT = {
  hiddenTruthSentToModel: false,
  modelMayResolveAccusation: false,
  modelMayUnlockCluesWithoutEngineValidation: false,
  enforcedBy: [
    "src/api/npc-turn.ts",
    "src/ai/systemPrompt.ts",
    "src/ai/fallback.ts",
    "src/game/gameEngine.ts",
    "tools/test-win-push-phase2-ai-quality.mjs"
  ],
  forbiddenPlayerFacingLanguage: [
    "you should accuse",
    "final accusation",
    "the culprit is",
    "select this evidence",
    "truth table",
    "culpritSuspectId",
    "trueMotiveId"
  ],
  releaseGate: "npm run test:npc-turn && npm run test:win-push-phase2-ai-quality && npm run test:game-engine"
} as const;

export const PHASE2_AI_QUALITY_TODO_CLOSURES = [
  "T021",
  "T022",
  "T023",
  "T024",
  "T025",
  "T026",
  "T027",
  "T028",
  "T029",
  "T030"
] as const;
