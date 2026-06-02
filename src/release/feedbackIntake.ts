import type { DetectiveRating, Outcome } from "../game/types";
import type { Locale } from "../i18n/dictionaries";

export const FEEDBACK_STORAGE_KEY = "liarline.feedback.v1";

export type FeedbackCategory =
  | "ai_quality"
  | "missed_contradiction"
  | "notebook_clarity"
  | "unfair_accusation"
  | "mobile_bug"
  | "localization_issue";

export type FeedbackSeverity = "low" | "medium" | "high";
export type FeedbackTriageLane = "hotfix" | "follow_up_patch" | "future_scope";

export type FeedbackEntry = {
  id: string;
  createdAt: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  triageLane: FeedbackTriageLane;
  note: string;
  locale: Locale;
  outcome: Outcome | null;
  detectiveRating: DetectiveRating | null;
  transcriptLength: number;
  viewport: string;
};

export const FEEDBACK_CATEGORIES: Array<{
  category: FeedbackCategory;
  defaultSeverity: FeedbackSeverity;
  playerSignal: string;
}> = [
  {
    category: "ai_quality",
    defaultSeverity: "low",
    playerSignal: "generic, off-tone, repeated, mixed-language, or slow live AI answer"
  },
  {
    category: "missed_contradiction",
    defaultSeverity: "medium",
    playerSignal: "player saw the camera-vs-cart link but did not understand the next move"
  },
  {
    category: "notebook_clarity",
    defaultSeverity: "medium",
    playerSignal: "clues, contradictions, or proof chain were hard to compare on phone"
  },
  {
    category: "unfair_accusation",
    defaultSeverity: "high",
    playerSignal: "resolution felt unfair, unexplained, or inconsistent with selected proof"
  },
  {
    category: "mobile_bug",
    defaultSeverity: "high",
    playerSignal: "tap target, dock, keyboard, scroll, or viewport issue blocked play"
  },
  {
    category: "localization_issue",
    defaultSeverity: "medium",
    playerSignal: "RU/EN meaning mismatch or mixed language in player-facing text"
  }
];

export const TRIAGE_RULES: Array<{
  lane: FeedbackTriageLane;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  reason: string;
}> = [
  {
    lane: "hotfix",
    category: "mobile_bug",
    severity: "high",
    reason: "Mobile blockers can make the judge/player path unplayable."
  },
  {
    lane: "hotfix",
    category: "unfair_accusation",
    severity: "high",
    reason: "Fairness issues undermine the deterministic deduction promise."
  },
  {
    lane: "follow_up_patch",
    category: "missed_contradiction",
    severity: "medium",
    reason: "Improve the contradiction and next-action cues without expanding scope."
  },
  {
    lane: "follow_up_patch",
    category: "notebook_clarity",
    severity: "medium",
    reason: "Improve evidence comparison and proof-chain readability."
  },
  {
    lane: "follow_up_patch",
    category: "localization_issue",
    severity: "medium",
    reason: "Fix meaning parity and mixed-language player-facing copy."
  },
  {
    lane: "future_scope",
    category: "ai_quality",
    severity: "low",
    reason: "Track lower-impact AI style polish without changing the release route."
  }
];

type FeedbackInput = {
  category: FeedbackCategory;
  severity?: FeedbackSeverity;
  note?: string;
  locale: Locale;
  outcome: Outcome | null;
  detectiveRating: DetectiveRating | null;
  transcriptLength: number;
  viewport: string;
};

export function sanitizeFeedbackText(value: string): string {
  return value
    .replace(/sk-[a-zA-Z0-9_-]{8,}/g, "[redacted-key]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

export function triageFeedback(input: {
  category: FeedbackCategory;
  severity?: FeedbackSeverity;
}): { lane: FeedbackTriageLane; reason: string } {
  const categoryConfig = FEEDBACK_CATEGORIES.find((item) => item.category === input.category);
  const severity = input.severity ?? categoryConfig?.defaultSeverity ?? "medium";

  if (severity === "high" && (input.category === "mobile_bug" || input.category === "unfair_accusation")) {
    const rule = TRIAGE_RULES.find((item) => item.category === input.category && item.lane === "hotfix");
    return { lane: "hotfix", reason: rule?.reason ?? "High-severity blocker." };
  }

  if (severity === "low" && input.category === "ai_quality") {
    const rule = TRIAGE_RULES.find((item) => item.category === "ai_quality" && item.lane === "future_scope");
    return { lane: "future_scope", reason: rule?.reason ?? "Track for later polish." };
  }

  const followUpRule = TRIAGE_RULES.find((item) => item.category === input.category && item.lane === "follow_up_patch");
  return {
    lane: followUpRule?.lane ?? "follow_up_patch",
    reason: followUpRule?.reason ?? "Review after first player evidence."
  };
}

export function createFeedbackEntry(input: FeedbackInput): FeedbackEntry {
  const categoryConfig = FEEDBACK_CATEGORIES.find((item) => item.category === input.category);
  const severity = input.severity ?? categoryConfig?.defaultSeverity ?? "medium";
  const triage = triageFeedback({ category: input.category, severity });

  return {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    category: input.category,
    severity,
    triageLane: triage.lane,
    note: sanitizeFeedbackText(input.note ?? ""),
    locale: input.locale,
    outcome: input.outcome,
    detectiveRating: input.detectiveRating,
    transcriptLength: input.transcriptLength,
    viewport: input.viewport
  };
}

export function saveFeedbackEntry(entry: FeedbackEntry, storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null): FeedbackEntry[] {
  if (!storage) return [entry];

  const existing = readFeedbackEntries(storage);
  const next = [entry, ...existing].slice(0, 50);
  storage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function readFeedbackEntries(storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null): FeedbackEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFeedbackEntry).slice(0, 50);
  } catch {
    return [];
  }
}

export function getFeedbackBacklogSummary(entries: FeedbackEntry[]): Record<FeedbackTriageLane, number> {
  return entries.reduce<Record<FeedbackTriageLane, number>>(
    (summary, entry) => {
      summary[entry.triageLane] += 1;
      return summary;
    },
    { hotfix: 0, follow_up_patch: 0, future_scope: 0 }
  );
}

function isFeedbackEntry(value: unknown): value is FeedbackEntry {
  const entry = value as Partial<FeedbackEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.createdAt === "string" &&
    FEEDBACK_CATEGORIES.some((item) => item.category === entry.category) &&
    ["low", "medium", "high"].includes(entry.severity ?? "") &&
    ["hotfix", "follow_up_patch", "future_scope"].includes(entry.triageLane ?? "")
  );
}
