export const RELEASE_MONITOR_STORAGE_KEY = "liarline.release.outcomes.v1";
export const RELEASE_MONITOR_VERSION = "0.1.0";
const MAX_RELEASE_OUTCOME_EVENTS = 80;

export const OUTCOME_EVENT_NAMES = [
  "start_reached",
  "first_ai_answer",
  "contradiction_reached",
  "ai_fail",
  "fallback_used",
  "stuck",
  "reset",
  "accusation_submitted",
  "accusation_fail",
  "resolution_reached"
] as const;

export type OutcomeEventName = (typeof OUTCOME_EVENT_NAMES)[number];

export type OutcomeEvent = {
  name: OutcomeEventName;
  createdAt: string;
  releaseVersion: typeof RELEASE_MONITOR_VERSION;
  details: Record<string, string | number | boolean | null>;
};

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const outcomeEventNameSet = new Set<string>(OUTCOME_EVENT_NAMES);

export function createOutcomeMonitor(storage: StorageLike) {
  return {
    record(name: OutcomeEventName, details: Record<string, unknown> = {}) {
      const events = readOutcomeEvents(storage);
      const nextEvent: OutcomeEvent = {
        name,
        createdAt: new Date().toISOString(),
        releaseVersion: RELEASE_MONITOR_VERSION,
        details: sanitizeDetails(details)
      };
      const nextEvents = [...events, nextEvent].slice(-MAX_RELEASE_OUTCOME_EVENTS);
      storage.setItem(RELEASE_MONITOR_STORAGE_KEY, JSON.stringify(nextEvents));
    },
    read() {
      return readOutcomeEvents(storage);
    },
    clear() {
      storage.removeItem(RELEASE_MONITOR_STORAGE_KEY);
    }
  };
}

export function sanitizeOutcomeEvents(value: unknown): OutcomeEvent[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isOutcomeEvent).slice(-MAX_RELEASE_OUTCOME_EVENTS);
}

export function readOutcomeEvents(storage: StorageLike): OutcomeEvent[] {
  const raw = storage.getItem(RELEASE_MONITOR_STORAGE_KEY);
  if (!raw) return [];
  try {
    return sanitizeOutcomeEvents(JSON.parse(raw));
  } catch {
    storage.removeItem(RELEASE_MONITOR_STORAGE_KEY);
    return [];
  }
}

export function getBrowserOutcomeMonitor() {
  if (typeof window === "undefined") return null;
  try {
    return createOutcomeMonitor(window.localStorage);
  } catch {
    return null;
  }
}

function isOutcomeEvent(value: unknown): value is OutcomeEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<OutcomeEvent>;
  return (
    typeof event.name === "string" &&
    outcomeEventNameSet.has(event.name) &&
    typeof event.createdAt === "string" &&
    typeof event.releaseVersion === "string" &&
    event.releaseVersion === RELEASE_MONITOR_VERSION &&
    Boolean(event.details) &&
    typeof event.details === "object"
  );
}

function sanitizeDetails(details: Record<string, unknown>): OutcomeEvent["details"] {
  const safe: OutcomeEvent["details"] = {};
  for (const [key, value] of Object.entries(details).slice(0, 12)) {
    if (!/^[a-zA-Z0-9_.-]{1,48}$/.test(key)) continue;
    if (typeof value === "string") safe[key] = value.slice(0, 120);
    if (typeof value === "number" && Number.isFinite(value)) safe[key] = value;
    if (typeof value === "boolean" || value === null) safe[key] = value;
  }
  return safe;
}
