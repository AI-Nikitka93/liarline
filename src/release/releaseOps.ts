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
