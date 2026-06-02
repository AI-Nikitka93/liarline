import { OUTCOME_EVENT_NAMES, RELEASE_MONITOR_VERSION } from "./outcomeMonitor";
import type { OutcomeEventName } from "./outcomeMonitor";

export type ProductMetric = {
  metricId: string;
  eventName: OutcomeEventName;
  label: string;
  releaseUse: string;
};

export type QualitativeFeedbackPoint = {
  pointId: string;
  category: FeedbackCategory;
  prompt: string;
};

export type RecoveryPlaybook = {
  playbookId: string;
  symptom: string;
  userSafeAction: string;
  operatorAction: string;
  verificationCommand: string;
};

export type KnownLimitation = {
  limitationId: string;
  publicCopy: string;
  releaseImpact: "non_blocking" | "follow_up";
};

export type HotfixDecision = {
  decisionId: string;
  bucket: "fix_now" | "follow_up" | "future_scope";
  criterion: string;
  action: string;
};

export type FreshnessReviewItem = {
  itemId: string;
  reviewCadence: "before_submission" | "weekly_after_launch" | "before_each_patch";
  owner: string;
  volatileKnowledge: string;
  sourceOfTruth: string;
  verificationAction: string;
};

export type ChangelogRule = {
  ruleId: string;
  requiredField: "what_changed" | "why_changed" | "player_impact" | "verification" | "no_drift_check";
  acceptance: string;
};

export type ReleaseParityCheck = {
  checkId: string;
  surface: "demo_route" | "screenshots" | "readme" | "submission_copy";
  expectedMatch: string;
  verificationCommand: string;
};

export type LaunchRehearsalStep = {
  stepId: string;
  releaseAction: string;
  passCondition: string;
  noGoIf: string;
};

export type PlaythroughObservation = {
  observationId: string;
  source: "internal_release_rehearsal";
  finding: string;
  impact: "hook" | "stuck_risk" | "interest_drop" | "ai_wow";
  releaseDecision: "keep" | "patch_if_repeats" | "fix_before_launch";
};

export type FirstMinuteHookCheck = {
  checkId: string;
  visibleSignal: string;
  passCondition: string;
};

export type Phase10ValidationCheck = {
  validationId: string;
  todoId: string;
  evidenceSource: "internal_release_rehearsal" | "automated_release_gate";
  question: string;
  finding: string;
  nextAction: string;
  releaseDecision: "keep" | "watch" | "patch_if_repeats";
};

export type FirstFollowUpBacklogItem = {
  backlogId: string;
  scope: "core_clarity" | "ai_performance" | "mobile_readability" | "release_truth";
  trigger: string;
  coreValueImpact: string;
  notIncludedReason: string;
  verificationCommand: string;
};

export type SecondCaseCriterion = {
  criterionId: string;
  acceptance: string;
  blockedUntil: string;
};

export type FutureCaseTemplate = {
  requiredBeats: Array<
    | "false_certainty"
    | "guaranteed_contradiction"
    | "collapse"
    | "persona_shift"
    | "resolution_rating"
  >;
  requiredBoundaries: string[];
};

export type UpdateRule = {
  ruleId: string;
  cadence: "before_submission" | "before_each_patch" | "after_follow_up";
  source: string;
  verificationAction: string;
};

export type VisualAssetReviewRule = {
  ruleId: string;
  inspect: string;
  rejectIf: string;
};

export type PostFollowUpHygieneRule = {
  ruleId: string;
  requiredAction: string;
  verificationCommand: string;
};

export type DesignHandoffRetrospective = {
  helped: string[];
  needsClarification: string[];
};

export type ProjectMemoryUpdateContract = {
  confirmed: string[];
  mistakes: string[];
  doNotReopen: string[];
};

export type NoDriftChecklistItem = {
  checkId: string;
  question: string;
  acceptance: string;
};

export type FullGameDirectionDecision = {
  decision: "polish_first_case_further";
  reason: string;
  rejectedDirections: Array<{
    direction: "add_second_case_now" | "build_season_map_now";
    rejectedBecause: string;
  }>;
};

export const FEEDBACK_CATEGORIES = [
  "gameplay_confusion",
  "ai_quality",
  "mobile_bugs",
  "localization",
  "visual_polish",
  "performance"
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export type FeedbackSeverity = "low" | "medium" | "high";

export type FeedbackInput = {
  category: FeedbackCategory;
  pointId: string;
  severity: FeedbackSeverity;
  note: string;
};

export type FeedbackItem = FeedbackInput & {
  feedbackId: string;
  createdAt: string;
  releaseVersion: typeof RELEASE_MONITOR_VERSION;
};

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export const FEEDBACK_STORAGE_KEY = "liarline.release.feedback.v1";
const MAX_FEEDBACK_ITEMS = 80;
const feedbackCategorySet = new Set<string>(FEEDBACK_CATEGORIES);
const outcomeEventNameSet = new Set<string>(OUTCOME_EVENT_NAMES);

export const PRODUCT_METRICS: ProductMetric[] = [
  {
    metricId: "metric_start_reached",
    eventName: "start_reached",
    label: "Start reached",
    releaseUse: "Confirms the player reached the playable case instead of bouncing from the first screen."
  },
  {
    metricId: "metric_first_ai_answer",
    eventName: "first_ai_answer",
    label: "First AI answer",
    releaseUse: "Confirms the first-minute AI hook fired."
  },
  {
    metricId: "metric_contradiction_reached",
    eventName: "contradiction_reached",
    label: "Contradiction reached",
    releaseUse: "Confirms the player reached the evidence-driven payoff."
  },
  {
    metricId: "metric_accusation_submitted",
    eventName: "accusation_submitted",
    label: "Accusation submitted",
    releaseUse: "Confirms the player understood the final decision step."
  },
  {
    metricId: "metric_resolution_reached",
    eventName: "resolution_reached",
    label: "Resolution reached",
    releaseUse: "Confirms the case can complete end-to-end."
  }
];

export const QUALITATIVE_FEEDBACK_POINTS: QualitativeFeedbackPoint[] = [
  {
    pointId: "confused_first_screen",
    category: "gameplay_confusion",
    prompt: "Player did not know what to press first."
  },
  {
    pointId: "weak_ai_answer",
    category: "ai_quality",
    prompt: "First AI answer felt generic, flat, or non-human."
  },
  {
    pointId: "missed_contradiction",
    category: "gameplay_confusion",
    prompt: "Player did not notice the contradiction reveal or what changed."
  },
  {
    pointId: "unfair_accusation",
    category: "gameplay_confusion",
    prompt: "Player felt accusation outcome was unfair or unexplained."
  },
  {
    pointId: "unreadable_notebook",
    category: "visual_polish",
    prompt: "Notebook felt hard to read, compare, or use as proof."
  }
];

export const RECOVERY_PLAYBOOKS: Record<string, RecoveryPlaybook> = {
  ai_access_down: {
    playbookId: "ai_access_down",
    symptom: "AI access falls during demo.",
    userSafeAction: "Continue the run with the visible fallback label or restart after provider recovery.",
    operatorAction: "Check `GROQ_API_KEY`, run the NPC-turn smoke test, and avoid claiming live AI for fallback footage.",
    verificationCommand: "npm run test:npc-turn"
  },
  corrupt_save: {
    playbookId: "corrupt_save",
    symptom: "Saved state breaks the game.",
    userSafeAction: "Use the visible Restart control to create a clean local case.",
    operatorAction: "Verify corrupted saves are isolated and do not block a fresh run.",
    verificationCommand: "npm run test:browser-phase7-polish"
  },
  wrong_release_link: {
    playbookId: "wrong_release_link",
    symptom: "Release link shows the wrong version.",
    userSafeAction: "Do not continue the demo from the wrong build.",
    operatorAction: "Restore the last verified package and rerun release browser plus release contract checks.",
    verificationCommand: "npm run test:release-browser && npm run test:release-contracts"
  }
};

export const KNOWN_LIMITATIONS: KnownLimitation[] = [
  {
    limitationId: "one_case",
    publicCopy: "Current release contains one polished case, not a multi-case season.",
    releaseImpact: "non_blocking"
  },
  {
    limitationId: "simplified_proof_check",
    publicCopy: "Final proof check is intentionally short: suspect, motive, and evidence.",
    releaseImpact: "follow_up"
  },
  {
    limitationId: "weak_strong_confidence",
    publicCopy: "Theory confidence is only Weak/Strong so it does not solve the deduction for the player.",
    releaseImpact: "non_blocking"
  },
  {
    limitationId: "one_hint_button",
    publicCopy: "Hint recovery is one button after a dead-end, not a multi-level help system.",
    releaseImpact: "non_blocking"
  }
];

export const HOTFIX_DECISION_MATRIX: HotfixDecision[] = [
  {
    decisionId: "hotfix_unplayable_path",
    bucket: "fix_now",
    criterion: "Player cannot reach Resolution, first AI answer, Restart, or fallback path.",
    action: "Stop release promotion, patch immediately, and rerun release playthrough plus browser checks."
  },
  {
    decisionId: "hotfix_hidden_truth_leak",
    bucket: "fix_now",
    criterion: "UI, prompt, transcript, or public copy exposes culprit/truth before evidence proves it.",
    action: "Patch immediately because it breaks the core promise that evidence convicts."
  },
  {
    decisionId: "hotfix_mobile_blocker",
    bucket: "fix_now",
    criterion: "Mobile keyboard, dock, or viewport covers critical actions during normal play.",
    action: "Patch layout before launch and rerun mobile UI plus browser checks."
  },
  {
    decisionId: "follow_up_repeated_confusion",
    bucket: "follow_up",
    criterion: "Two or more observations show confusion around Notebook, Weak/Strong, or accusation fairness while the game remains completable.",
    action: "Add to first follow-up patch backlog only if it strengthens deduction clarity."
  },
  {
    decisionId: "follow_up_ai_voice_flat",
    bucket: "follow_up",
    criterion: "AI response is understandable but not emotional enough for the first-minute hook.",
    action: "Tune suspect prompt, fallback copy, or first-question route after release checks stay green."
  },
  {
    decisionId: "future_scope_new_case",
    bucket: "future_scope",
    criterion: "Request is about seasons, more cases, full trial, multiplayer, voice, or unlimited generated cases.",
    action: "Keep out of hotfix scope until the first case is proven stable with real playthrough evidence."
  }
];

export const FRESHNESS_REVIEW_CYCLE: FreshnessReviewItem[] = [
  {
    itemId: "freshness_ai_access",
    reviewCadence: "before_each_patch",
    owner: "release owner",
    volatileKnowledge: "Groq model availability, rate limits, response errors, and fallback readiness.",
    sourceOfTruth: "Groq model docs (https://console.groq.com/docs/model/llama-3.1-8b-instant), Groq rate-limit docs (https://console.groq.com/docs/rate-limits), local NPC-turn smoke result.",
    verificationAction: "Run `npm run test:npc-turn` and confirm fallback copy is still honest if live AI fails."
  },
  {
    itemId: "freshness_contest_rules",
    reviewCadence: "before_submission",
    owner: "release owner",
    volatileKnowledge: "Devpost AI Game Week dates, required fields, judging criteria, and playable link expectations.",
    sourceOfTruth: "Devpost AI Game Week challenge page (https://ai-game-week-29908.devpost.com/) and local contest requirements document.",
    verificationAction: "Compare `docs/SUBMISSION.md` and `docs/CONTEST_REQUIREMENTS_2026-05-06.md` with the current challenge page."
  },
  {
    itemId: "freshness_dependency_risk",
    reviewCadence: "before_each_patch",
    owner: "release owner",
    volatileKnowledge: "Framework, dependency, and advisory state that can change between patches.",
    sourceOfTruth: "Lockfile, package manifest, release security check, and package audit result.",
    verificationAction: "Run release security and build checks without applying unsafe forced downgrades."
  },
  {
    itemId: "freshness_browser_behavior",
    reviewCadence: "weekly_after_launch",
    owner: "release owner",
    volatileKnowledge: "Mobile viewport, virtual keyboard, fixed dock, and in-app browser behavior.",
    sourceOfTruth: "MDN VisualViewport guidance (https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API), MDN viewport meta guidance (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport), and project mobile browser checks.",
    verificationAction: "Run mobile UI, release browser, and in-app browser console checks after layout changes."
  }
];

export const FAST_DECAY_KNOWLEDGE = FRESHNESS_REVIEW_CYCLE.map((item) => ({
  itemId: item.itemId,
  owner: item.owner,
  volatileKnowledge: item.volatileKnowledge,
  reviewCadence: item.reviewCadence
}));

export const CHANGELOG_DISCIPLINE: ChangelogRule[] = [
  {
    ruleId: "changelog_what_changed",
    requiredField: "what_changed",
    acceptance: "Every entry states the user-visible or release-contract change."
  },
  {
    ruleId: "changelog_why_changed",
    requiredField: "why_changed",
    acceptance: "Every entry explains the product reason, not only the file diff."
  },
  {
    ruleId: "changelog_player_impact",
    requiredField: "player_impact",
    acceptance: "Every entry names the effect on deduction, AI performance, mobile play, or release trust."
  },
  {
    ruleId: "changelog_verification",
    requiredField: "verification",
    acceptance: "Every entry lists the exact check that passed after the change."
  },
  {
    ruleId: "changelog_no_drift",
    requiredField: "no_drift_check",
    acceptance: "Every entry confirms the change does not move the release away from AI lies and evidence convicts."
  }
];

export const RELEASE_PARITY_CHECKS: ReleaseParityCheck[] = [
  {
    checkId: "parity_demo_route",
    surface: "demo_route",
    expectedMatch: "Demo route shows first AI answer, contradiction, persona shift, collapse, accusation, and Resolution.",
    verificationCommand: "npm run test:demo-route && npm run test:release-playthrough"
  },
  {
    checkId: "parity_screenshots",
    surface: "screenshots",
    expectedMatch: "Release screenshots show current suspect-first start, interrogation, Notebook, Accusation, and Resolution surfaces.",
    verificationCommand: "npm run capture:release-screenshots && npm run test:visual-assets"
  },
  {
    checkId: "parity_readme",
    surface: "readme",
    expectedMatch: "README describes one playable case, safe fallback, and deterministic truth boundaries exactly as the release implements them.",
    verificationCommand: "npm run test:public-docs && npm run test:release-contracts"
  },
  {
    checkId: "parity_submission_copy",
    surface: "submission_copy",
    expectedMatch: "Submission copy does not promise a season, full trial, voice, or unlimited generated cases.",
    verificationCommand: "npm run test:public-docs"
  }
];

export const LAUNCH_REHEARSAL: LaunchRehearsalStep[] = [
  {
    stepId: "rehearsal_open_playable_link",
    releaseAction: "Open the playable link on a 390px mobile viewport.",
    passCondition: "No download surface, no horizontal overflow, no runtime errors, first-question CTA visible.",
    noGoIf: "The link opens the wrong build, blank screen, app-store prompt, or broken mobile layout."
  },
  {
    stepId: "rehearsal_demo_route",
    releaseAction: "Run the deterministic demo route from first answer to Resolution.",
    passCondition: "Contradiction, persona shift, collapse, accusation, and rating all render.",
    noGoIf: "Any core beat requires manual state editing or external explanation."
  },
  {
    stepId: "rehearsal_video_capture",
    releaseAction: "Capture only the verified route and current release UI.",
    passCondition: "Video shows one playable case and does not imply unavailable season/trial features.",
    noGoIf: "Footage uses fallback while being described as live AI, or screenshots show stale UI."
  },
  {
    stepId: "rehearsal_fallback_story",
    releaseAction: "Run fallback story and confirm fallback remains playable and visibly labeled.",
    passCondition: "Fallback preserves suspect character and deterministic evidence progression.",
    noGoIf: "Fallback blocks progress, hides its source, or claims live AI."
  },
  {
    stepId: "rehearsal_no_go_blockers",
    releaseAction: "Confirm no open release blockers remain after build, browser, security, and post-launch contract checks.",
    passCondition: "All required checks pass and known limitations stay non-blocking.",
    noGoIf: "Secret exposure, unplayable path, hidden-truth leak, wrong link, or mobile blocker is present."
  }
];

export const PLAYTHROUGH_OBSERVATIONS: PlaythroughObservation[] = [
  {
    observationId: "obs_fast_player_cta",
    source: "internal_release_rehearsal",
    finding: "Fast-player route reaches the first question immediately because suspect portrait and CTA are visible in the first viewport.",
    impact: "hook",
    releaseDecision: "keep"
  },
  {
    observationId: "obs_notebook_stuck_risk",
    source: "internal_release_rehearsal",
    finding: "Stuck risk concentrates around comparing Notebook evidence after the contradiction rather than around the first screen.",
    impact: "stuck_risk",
    releaseDecision: "patch_if_repeats"
  },
  {
    observationId: "obs_interest_ai_wow",
    source: "internal_release_rehearsal",
    finding: "The strongest AI-wow beat is the transition from first nervous answer to contradiction pressure and persona shift.",
    impact: "ai_wow",
    releaseDecision: "keep"
  },
  {
    observationId: "obs_interest_drop",
    source: "internal_release_rehearsal",
    finding: "Interest can drop if transcript cards stack too far above the action dock on narrow screens.",
    impact: "interest_drop",
    releaseDecision: "patch_if_repeats"
  }
];

export const FIRST_MINUTE_HOOK_CHECKS: FirstMinuteHookCheck[] = [
  {
    checkId: "hook_suspect_face",
    visibleSignal: "Suspect face appears before explanatory reading becomes necessary.",
    passCondition: "The `.start-interrogation-surface` and portrait treatment are visible on mobile load."
  },
  {
    checkId: "hook_first_question",
    visibleSignal: "Primary first-question CTA is visible and more important than secondary actions.",
    passCondition: "The `.first-question-cta` is visible in the mobile first viewport."
  },
  {
    checkId: "hook_first_ai_answer",
    visibleSignal: "First AI answer looks like suspect performance, not a technical chat log.",
    passCondition: "Release browser state shows `Live answer`, contradiction reveal, and persona shift without external explanation."
  }
];

export const PHASE10_VALIDATION_CHECKS: Phase10ValidationCheck[] = [
  {
    validationId: "validation_guaranteed_contradiction",
    todoId: "T201",
    evidenceSource: "automated_release_gate",
    question: "Do players reach the guaranteed contradiction without a hint, and does it feel earned?",
    finding: "Release playthrough reaches `contradiction_camera_vs_cart` from the first Theo camera question without using the dead-end hint.",
    nextAction: "Watch for repeated feedback that the reveal feels scripted; patch only if players miss why camera plus cart proves the pivot.",
    releaseDecision: "keep"
  },
  {
    validationId: "validation_persona_shift",
    todoId: "T202",
    evidenceSource: "automated_release_gate",
    question: "Is Ivo's persona shift visible enough for AI Integration scoring?",
    finding: "The deterministic route moves Ivo into the panicking contradiction state and the release browser gate checks the persona-shift beat.",
    nextAction: "If live answers read too flat in video capture, tune Ivo pressure prompt before adding any new case content.",
    releaseDecision: "watch"
  },
  {
    validationId: "validation_collapse_moment",
    todoId: "T203",
    evidenceSource: "internal_release_rehearsal",
    question: "Does the collapse moment explain the wrong theory breaking?",
    finding: "The collapse points away from Theo's camera panic and toward the cart gap, creating the intended false-certainty reversal.",
    nextAction: "Keep collapse copy short; strengthen only the Notebook bridge if players cannot explain the reversal after Resolution.",
    releaseDecision: "keep"
  },
  {
    validationId: "validation_weak_strong_confidence",
    todoId: "T204",
    evidenceSource: "internal_release_rehearsal",
    question: "Does Weak/Strong help without solving the case?",
    finding: "Weak/Strong stays coarse and attaches to proof strength, not culprit selection, so it helps accusation risk without becoming a spoiler.",
    nextAction: "Patch wording only if repeated feedback says Strong feels like the game naming the culprit.",
    releaseDecision: "keep"
  },
  {
    validationId: "validation_hint_depth",
    todoId: "T205",
    evidenceSource: "internal_release_rehearsal",
    question: "Is one hint level enough?",
    finding: "One gated hint is enough for the current one-case build because the guaranteed contradiction path exists before deep dead-end recovery.",
    nextAction: "Do not add second-level hints until at least two real observations show players remain stuck after using the first hint.",
    releaseDecision: "watch"
  },
  {
    validationId: "validation_notebook_load",
    todoId: "T206",
    evidenceSource: "internal_release_rehearsal",
    question: "Does the Notebook overload players with only two to three evidence types?",
    finding: "Notebook risk is comparison clarity after contradiction, not raw evidence count; this belongs in first follow-up only if repeated.",
    nextAction: "Track `unreadable_notebook` feedback and keep any patch focused on evidence comparison, not a larger board system.",
    releaseDecision: "patch_if_repeats"
  },
  {
    validationId: "validation_resolution_rating",
    todoId: "T207",
    evidenceSource: "internal_release_rehearsal",
    question: "Do Resolution ratings feel fair?",
    finding: "Sharp/Careful/Reckless/Misled map to outcome and evidence strength, but perceived fairness needs feedback from the submitted video or first players.",
    nextAction: "Keep ratings but collect fairness notes before renaming or adding more rating tiers.",
    releaseDecision: "watch"
  }
];

export const FIRST_FOLLOW_UP_BACKLOG: FirstFollowUpBacklogItem[] = [
  {
    backlogId: "follow_up_notebook_compare",
    scope: "core_clarity",
    trigger: "Two or more feedback items mention missed contradiction or unreadable Notebook after the reveal.",
    coreValueImpact: "Improves the evidence path that lets evidence convict instead of asking the AI to confess.",
    notIncludedReason: "Current release is completable and the risk is repeated-use clarity, not a launch blocker.",
    verificationCommand: "npm run test:release-playthrough && npm run test:mobile-ui"
  },
  {
    backlogId: "follow_up_persona_shift_punch",
    scope: "ai_performance",
    trigger: "Video capture or first players say Ivo's pressure answer sounds too calm or generic.",
    coreValueImpact: "Strengthens AI lies as performed suspect behavior while keeping truth deterministic.",
    notIncludedReason: "Existing route already exposes the shift; the patch should tune wording, not add mechanics.",
    verificationCommand: "npm run test:demo-route && npm run test:npc-turn"
  },
  {
    backlogId: "follow_up_rating_fairness_copy",
    scope: "release_truth",
    trigger: "Players understand the culprit but object to the Resolution rating language.",
    coreValueImpact: "Makes evidence-based verdict feedback feel fair without weakening accusation risk.",
    notIncludedReason: "Ratings are already deterministic and non-blocking; copy can wait for real feedback.",
    verificationCommand: "npm run test:ui-copy && npm run test:release-playthrough"
  }
];

export const SECOND_CASE_READY_CRITERIA: SecondCaseCriterion[] = [
  {
    criterionId: "second_case_first_case_stability",
    acceptance: "First case has no repeated confusion around contradiction, persona shift, Notebook comparison, or rating fairness.",
    blockedUntil: "First follow-up backlog is either empty or limited to non-core polish."
  },
  {
    criterionId: "second_case_new_deduction_tool",
    acceptance: "Second case adds one new deduction tool that changes reasoning, not just a new suspect skin or longer transcript.",
    blockedUntil: "The tool can be tested without expanding beyond Interrogation, Suspicion, Contradiction, Notebook, Accusation, and Resolution."
  },
  {
    criterionId: "second_case_same_ai_boundary",
    acceptance: "AI remains an NPC performer and never owns truth, clue validity, or outcome resolution.",
    blockedUntil: "Prompt and engine contracts prove the new case cannot leak or rewrite hidden truth."
  }
];

export const FUTURE_CASE_TEMPLATE: FutureCaseTemplate = {
  requiredBeats: ["false_certainty", "guaranteed_contradiction", "collapse", "persona_shift", "resolution_rating"],
  requiredBoundaries: [
    "Every case needs a tempting wrong theory with one visible flaw.",
    "Every guaranteed contradiction must be reachable without a hint.",
    "Every persona shift must be visible through AI performance, not only UI labels.",
    "Every rating must explain evidence strength instead of punishing experimentation."
  ]
};

export const MODEL_PLATFORM_UPDATE_RULES: UpdateRule[] = [
  {
    ruleId: "update_groq_access",
    cadence: "before_each_patch",
    source: "Groq model and rate-limit docs plus `npm run test:npc-turn`.",
    verificationAction: "Confirm live model path or fallback honesty before recording or submitting new footage."
  },
  {
    ruleId: "update_devpost_requirements",
    cadence: "before_submission",
    source: "Current Devpost AI Game Week page and local submission docs.",
    verificationAction: "Re-check public URL, GitHub URL, video URL, AI-use description, and claim guardrails."
  },
  {
    ruleId: "update_mobile_browser_behavior",
    cadence: "after_follow_up",
    source: "Release browser, mobile UI contract, and VisualViewport behavior.",
    verificationAction: "Run browser/mobile gates after any dock, keyboard, transcript, or Notebook layout change."
  }
];

export const VISUAL_ASSET_REVIEW_RULES: VisualAssetReviewRule[] = [
  {
    ruleId: "asset_no_text_garbage",
    inspect: "Portraits, evidence textures, hero/background, and future generated images.",
    rejectIf: "Image contains watermark, mangled text, plastic face artifacts, unreadable evidence marks, or inconsistent lighting."
  },
  {
    ruleId: "asset_mobile_readability",
    inspect: "First viewport, suspect portrait, contradiction flash, Notebook texture, and final rating treatment.",
    rejectIf: "Asset hides game controls, reduces contrast, causes horizontal overflow, or creates an empty first screen."
  },
  {
    ruleId: "asset_visual_dna",
    inspect: "Neo-noir interrogation terminal palette, evidence-paper texture, tense state markers, and icon stroke logic.",
    rejectIf: "Asset drifts into generic dashboard, stock-photo crime scene, copied reference layout, or unrelated season branding."
  }
];

export const POST_FOLLOW_UP_HYGIENE_RULES: PostFollowUpHygieneRule[] = [
  {
    ruleId: "hygiene_archive_drafts",
    requiredAction: "Move rejected images, raw AI drafts, temporary logs, and research scraps outside the release bundle.",
    verificationCommand: "npm run test:project-hygiene"
  },
  {
    ruleId: "hygiene_build_after_patch",
    requiredAction: "Run a production build after every follow-up that touches gameplay, AI, UI, docs, or release contracts.",
    verificationCommand: "npm run build"
  },
  {
    ruleId: "hygiene_release_docs",
    requiredAction: "Update README, RELEASE, SUBMISSION, STATE, and TODO evidence only when the shipped behavior actually changed.",
    verificationCommand: "npm run test:public-docs && npm run test:release-contracts"
  },
  {
    ruleId: "hygiene_playthrough_gate",
    requiredAction: "Re-run the deterministic playthrough and browser route before promoting a follow-up.",
    verificationCommand: "npm run test:release-playthrough && npm run test:release-browser"
  }
];

export const DESIGN_HANDOFF_RETROSPECTIVE: DesignHandoffRetrospective = {
  helped: [
    "Suspect-first mobile surface kept the first action inside the game instead of a briefing wall.",
    "Visual DNA rules produced consistent forensic colors, paper evidence, tension states, and restrained icons.",
    "State-specific guidance made fallback, contradiction, persona shift, accusation, and Resolution testable."
  ],
  needsClarification: [
    "Future DESIGN.md iterations should specify exact Notebook comparison layouts before adding more evidence types.",
    "Future generated assets need sharper rejection examples for facial artifacts and fake evidence text."
  ]
};

export const PROJECT_MEMORY_UPDATE_CONTRACT: ProjectMemoryUpdateContract = {
  confirmed: [
    "One polished case is the right release shape for this deadline.",
    "The core promise remains: AI suspects can lie, but only evidence can convict.",
    "Serverless Groq proxy plus local deterministic state is the correct architecture for the mobile web game."
  ],
  mistakes: [
    "Do not let post-release planning imply the season is already implemented.",
    "Do not treat internal rehearsal observations as external player proof."
  ],
  doNotReopen: [
    "Do not move hidden truth into the live model prompt.",
    "Do not add full trial mode before first-case evidence clarity is proven.",
    "Do not add more cases before contradiction, collapse, Notebook, and rating feedback are stable."
  ]
};

export const NO_DRIFT_CHECKLIST: NoDriftChecklistItem[] = [
  {
    checkId: "no_drift_ai_actor",
    question: "Does the change keep AI as suspect performance instead of judge or truth engine?",
    acceptance: "Pass only if AI lies remain performance and evidence convicts through deterministic state."
  },
  {
    checkId: "no_drift_core_systems",
    question: "Does the change strengthen one of the six current systems?",
    acceptance: "Pass only if Interrogation, Suspicion, Contradiction, Notebook, Accusation, or Resolution is clearer and evidence convicts."
  },
  {
    checkId: "no_drift_scope",
    question: "Does the change avoid season, trial, multiplayer, voice, accounts, and procedural-case expansion?",
    acceptance: "Pass only if the first case gets stronger and evidence convicts without widening release scope."
  }
];

export const FULL_GAME_DIRECTION_DECISION: FullGameDirectionDecision = {
  decision: "polish_first_case_further",
  reason:
    "Phase 10 evidence points to first-case clarity risks around Notebook comparison, persona-shift punch, and rating fairness; adding case volume now would dilute the contest hook.",
  rejectedDirections: [
    {
      direction: "add_second_case_now",
      rejectedBecause: "A second case is blocked until the first case has stable contradiction, collapse, Notebook, and rating feedback."
    },
    {
      direction: "build_season_map_now",
      rejectedBecause: "A season map would be marketing scaffolding without playable proof and would drift from AI lies / evidence convicts."
    }
  ]
};

export function createFeedbackIntake(storage: StorageLike) {
  return {
    record(input: FeedbackInput) {
      const feedback = readFeedbackItems(storage);
      const item = normalizeFeedbackInput(input);
      storage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([...feedback, item].slice(-MAX_FEEDBACK_ITEMS)));
    },
    read() {
      return readFeedbackItems(storage);
    },
    clear() {
      storage.removeItem(FEEDBACK_STORAGE_KEY);
    }
  };
}

export function readFeedbackItems(storage: StorageLike): FeedbackItem[] {
  const raw = storage.getItem(FEEDBACK_STORAGE_KEY);
  if (!raw) return [];
  try {
    return sanitizeFeedbackItems(JSON.parse(raw));
  } catch {
    storage.removeItem(FEEDBACK_STORAGE_KEY);
    return [];
  }
}

export function sanitizeFeedbackItems(value: unknown): FeedbackItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isFeedbackItem).slice(-MAX_FEEDBACK_ITEMS);
}

export function triageFeedback(input: Pick<FeedbackInput, "category" | "note">): { category: FeedbackCategory; priority: FeedbackSeverity } {
  const note = input.note.toLowerCase();
  const category =
    /keyboard|scroll|viewport|mobile|touch|dock|screen covered|bottom/.test(note)
      ? "mobile_bugs"
      : /\b(russian|english|locale|translation|language|ru|en)\b|локал|перевод/.test(note)
        ? "localization"
      : /accusation|accuse|unfair|proof|contradiction|where to click|what to press/.test(note)
        ? "gameplay_confusion"
        : /\bai\b|answer|generic|robot|hallucinat|fallback|model|suspect voice/.test(note)
          ? "ai_quality"
          : /slow|lag|latency|loading|freeze|wait/.test(note)
            ? "performance"
            : /color|contrast|visual|notebook|read|small|dark/.test(note)
              ? "visual_polish"
              : "gameplay_confusion";
  const priority: FeedbackSeverity = /crash|broken|cannot|stuck|unfair|impossible|ошиб|невозможно|слом/.test(note)
    ? "high"
    : category !== input.category
      ? "medium"
      : "low";

  return { category, priority };
}

function normalizeFeedbackInput(input: FeedbackInput): FeedbackItem {
  return {
    feedbackId: `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    releaseVersion: RELEASE_MONITOR_VERSION,
    category: normalizeCategory(input.category),
    pointId: normalizePointId(input.pointId),
    severity: normalizeSeverity(input.severity),
    note: sanitizeNote(input.note)
  };
}

function isFeedbackItem(value: unknown): value is FeedbackItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<FeedbackItem>;
  return (
    typeof item.feedbackId === "string" &&
    typeof item.createdAt === "string" &&
    item.releaseVersion === RELEASE_MONITOR_VERSION &&
    typeof item.category === "string" &&
    feedbackCategorySet.has(item.category) &&
    typeof item.pointId === "string" &&
    typeof item.note === "string" &&
    (item.severity === "low" || item.severity === "medium" || item.severity === "high")
  );
}

function normalizeCategory(category: FeedbackCategory): FeedbackCategory {
  return feedbackCategorySet.has(category) ? category : "gameplay_confusion";
}

function normalizePointId(pointId: string): string {
  return QUALITATIVE_FEEDBACK_POINTS.some((point) => point.pointId === pointId) ? pointId : "confused_first_screen";
}

function normalizeSeverity(severity: FeedbackSeverity): FeedbackSeverity {
  return severity === "low" || severity === "medium" || severity === "high" ? severity : "low";
}

function sanitizeNote(note: string): string {
  return note
    .replace(/<[^>]*>/g, "")
    .replace(/[{}[\]`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}
