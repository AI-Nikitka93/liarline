export type ContestCriterion = {
  name: "AI Integration" | "Creativity & Fun" | "Technical Execution" | "Mobile Support";
  weight: number;
  liarlineProof: string;
  verificationCommand: string;
  riskIfWeak: string;
};

export type Phase1TodoClosure = {
  todoId: `T${string}`;
  status: "closed";
  changedSurface: string;
  verification: string;
};

export const PHASE1_VERIFICATION_DATE = "2026-05-08" as const;

export const PHASE1_SOURCE_OF_TRUTH = {
  activeMasterPlan: "docs/MASTER_TODO.md",
  archivedClosedLedger: "_archive/agent-memory/docs/MASTER_TODO.md",
  activeStatus: "MASTER_TODO_REOPENED_WIN_PUSH_ACTIVE",
  rule:
    "The current win-push backlog starts from docs/MASTER_TODO.md; archived T001-T220 entries are historical evidence only and must not be treated as the active queue."
} as const;

export const PHASE1_CURRENT_AUDIT = {
  verifiedWorking: [
    "Next.js mobile web app shell exists and builds through the production build gate.",
    "Deterministic engine owns AP spend, clue unlock, contradiction, accusation, rating, and corrupted-save recovery.",
    "Groq NPC-turn serverless path exists with schema validation and visible fallback behavior.",
    "RU/EN dictionaries and LocalStorage locale persistence are wired into the playable client.",
    "Release browser, mobile UI, visual DNA, public-doc safety, and judge-readiness gates are scriptable."
  ],
  assumptionBoundaries: [
    "Strict Devpost readiness still depends on a real public demo video URL.",
    "Live AI quality remains freshness-sensitive and must be retested before recording or submission.",
    "One polished case is the release promise; season, trial mode, multiplayer, voice, and procedural cases remain excluded."
  ],
  verificationCommands: [
    "npm run build",
    "npm run test:game-engine",
    "npm run test:npc-turn",
    "npm run test:demo-route",
    "npm run test:release-browser",
    "npm run test:judge-readiness"
  ]
} as const;

export const CONTEST_REQUIREMENTS_2026_05_08 = {
  sourceUrls: [
    "https://ai-game-week-29908.devpost.com/",
    "https://ai-game-week-29908.devpost.com/rules",
    "https://help.devpost.com/article/122-how-to-enter-a-submission",
    "https://help.devpost.com/article/126-know-your-submission-steps"
  ],
  deadline: "May 10, 2026 at 5:00 PM Baku time / AZST",
  hackingWindow: "May 3, 2026 9:00 AM to May 10, 2026 5:00 PM Baku time",
  eligibility: ["students worldwide", "solo or teams up to 3", "project built during the hackathon period"],
  submissionFields: [
    "playable mobile-browser game link",
    "public demo video, 1-3 minutes for this hackathon",
    "GitHub repository with code",
    "short description explaining AI use",
    "Devpost project overview, story, built-with tags, screenshots or gallery as useful"
  ],
  hardRequirements: [
    "mobile browser playable",
    "no app download",
    "meaningful AI use",
    "late submissions are not accepted"
  ]
} as const;

export const CONTEST_CRITERIA_ALIGNMENT: ContestCriterion[] = [
  {
    name: "AI Integration",
    weight: 30,
    liarlineProof: "AI performs suspect dialogue while deterministic state owns truth and outcome.",
    verificationCommand: "npm run test:npc-turn && npm run test:demo-route",
    riskIfWeak: "Generic chat, hidden-truth leakage, or fallback footage described as live AI costs the largest score area."
  },
  {
    name: "Creativity & Fun",
    weight: 25,
    liarlineProof: "The fun loop is catching a lying AI suspect through evidence, contradiction, and final accusation.",
    verificationCommand: "npm run test:release-playthrough",
    riskIfWeak: "If the proof chain is unclear, the project reads as a chatbot instead of a social deduction game."
  },
  {
    name: "Technical Execution",
    weight: 25,
    liarlineProof: "Next.js, serverless AI proxy, LocalStorage persistence, validation, fallback, and deterministic engine gates are executable.",
    verificationCommand: "npm run build && npm run test:game-engine && npm run test:release-security",
    riskIfWeak: "Runtime errors, stale public claims, duplicated submits, or unsafe secrets can block a judge run."
  },
  {
    name: "Mobile Support",
    weight: 20,
    liarlineProof: "The release is a mobile-first browser game with no download step and keyboard-aware action surfaces.",
    verificationCommand: "npm run test:mobile-ui && npm run test:release-browser",
    riskIfWeak: "A covered action dock, unreadable Russian copy, or stale public URL directly violates the contest requirement."
  }
];

export const SCORE_RISK_BASELINE = [
  {
    area: "AI quality",
    risk: "First live answers can sound generic, repeat a thought, or miss the pressure beat.",
    mitigation: "Keep AI as actor, validate response shape/content, run live-suspect and demo-route regressions before recording."
  },
  {
    area: "Mobile UI",
    risk: "Keyboard, sticky dock, or long localized labels can hide critical actions.",
    mitigation: "Use the mobile UI, release browser, and narrow-screen gates after any layout change."
  },
  {
    area: "Proof clarity",
    risk: "Judge may see suspicion but miss why camera failure cannot explain cart movement.",
    mitigation: "Keep contradiction visible in Notebook, Accusation, Resolution, and demo route."
  },
  {
    area: "Submission completeness",
    risk: "Missing public demo video URL keeps strict Devpost readiness below a complete-submission ceiling.",
    mitigation: "Run strict judge readiness only after public game, GitHub, and demo-video URLs are set."
  },
  {
    area: "Scope truth",
    risk: "Old season/trial/procedural language can overpromise beyond the one-case playable release.",
    mitigation: "Public docs and tests must keep future scope explicitly excluded."
  }
] as const;

export const AI_GAME_PRACTICES_2026_05_08 = {
  sourceUrls: [
    "https://arxiv.org/abs/2604.04703",
    "https://arxiv.org/abs/2604.10107",
    "https://www.reddit.com/r/aigamedev/comments/1t5aixp/i_spent_3_years_trying_to_fix_the_biggest_problem/",
    "https://www.reddit.com/r/aigamedev/comments/1scmap1/i_tracked_games_that_shipped_with_ai_npcs_heres/",
    "https://www.reddit.com/r/aigamedev/comments/1sf9xec/i_think_most_ai_npc_projects_are_solving_the/",
    "https://github.com/orgs/community/discussions/163655"
  ],
  meaningfulForLiarline: [
    "AI output must change how the player reads a suspect, not replace evidence or scoring.",
    "Game state must remain executable and bounded outside the LLM.",
    "NPC prompts should receive only allowed knowledge for the selected suspect and state.",
    "Open-ended text needs validation, fallback, and short player actions to limit cognitive load.",
    "Latency must be represented as an intentional thinking state, not a frozen UI."
  ],
  referencesToAdoptWithoutScopeExpansion: [
    "Bounded autonomy: keep model behavior inside explicit game-state interfaces.",
    "Simulation-under-dialogue pattern: deterministic state first, AI narration/performance second.",
    "Option-first interrogation plus optional custom question keeps mobile friction low.",
    "Visible degraded mode lets fallback remain playable without fake live-AI claims."
  ],
  antiPatterns: [
    "generic AI chat with no consequence",
    "long tutorial before the first AI beat",
    "unclear proof chain",
    "indistinguishable suspect voices",
    "hidden truth or future state inside the live prompt",
    "model jargon or internal IDs in player-facing text",
    "fake intelligence claims where deterministic state or fallback actually did the work"
  ]
} as const;

export const IDEA_ANCHOR_PHASE1_GUARDRAILS = {
  mustStay: [
    "one polished case",
    "AI suspects perform, evidence convicts",
    "first AI answer, contradiction, persona shift, Notebook, accusation, Resolution"
  ],
  blockedUntilFirstCaseStable: [
    "second case",
    "season map",
    "full trial mode",
    "procedural case generation",
    "multiplayer",
    "voice or video interrogation"
  ],
  acceptedNextWork:
    "Only strengthen Interrogation, Suspicion, Contradiction, Notebook, Accusation, Resolution, AI quality, mobile proof, visual clarity, or submission proof."
} as const;

export const PHASE1_TODO_CLOSURES: Phase1TodoClosure[] = [
  {
    todoId: "T001",
    status: "closed",
    changedSurface: "src/release/winPushPhase1.ts + docs/STATE.md",
    verification: "test:win-push-phase1 audits working evidence and assumption boundaries"
  },
  {
    todoId: "T002",
    status: "closed",
    changedSurface: "source-of-truth contract",
    verification: "test:win-push-phase1 asserts docs/MASTER_TODO.md is active"
  },
  {
    todoId: "T003",
    status: "closed",
    changedSurface: "archived-ledger separation contract",
    verification: "test:win-push-phase1 blocks archived T001-T220 from active queue semantics"
  },
  {
    todoId: "T004",
    status: "closed",
    changedSurface: "contest requirements refreshed to 2026-05-08",
    verification: "test:win-push-phase1 checks deadline, eligibility, fields, weights, and mobile requirement"
  },
  {
    todoId: "T005",
    status: "closed",
    changedSurface: "criteria alignment matrix",
    verification: "test:win-push-phase1 checks all contest criteria and proof commands"
  },
  {
    todoId: "T006",
    status: "closed",
    changedSurface: "score-risk baseline",
    verification: "test:win-push-phase1 checks risk coverage for AI, mobile, proof, submission, and scope"
  },
  {
    todoId: "T007",
    status: "closed",
    changedSurface: "2026 AI-game practices contract",
    verification: "test:win-push-phase1 checks bounded state, validation, fallback, and cognitive-load rules"
  },
  {
    todoId: "T008",
    status: "closed",
    changedSurface: "reference adoption list",
    verification: "test:win-push-phase1 checks references strengthen Liarline without scope expansion"
  },
  {
    todoId: "T009",
    status: "closed",
    changedSurface: "AI-game anti-pattern list",
    verification: "test:win-push-phase1 checks generic chat, unclear proof, voice sameness, and fake intelligence blockers"
  },
  {
    todoId: "T010",
    status: "closed",
    changedSurface: "IDEA ANCHOR guardrails",
    verification: "test:win-push-phase1 checks blocked season/trial/procedural drift"
  }
];
