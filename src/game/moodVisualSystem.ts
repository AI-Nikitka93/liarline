export const MOOD_VISUAL_SYSTEM = {
  controlled: {
    className: "mood-controlled",
    tone: "neutral",
    cue: "steady line, low contrast, no pulse",
    noiseBudget: "low"
  },
  nervous: {
    className: "mood-nervous",
    tone: "forensic",
    cue: "amber timing rail and one restrained hesitation marker",
    noiseBudget: "low"
  },
  defensive: {
    className: "mood-defensive",
    tone: "signal",
    cue: "tight red border, no heavy motion",
    noiseBudget: "low"
  },
  impatient: {
    className: "mood-impatient",
    tone: "cyan",
    cue: "cool clipped chip and sharper metadata",
    noiseBudget: "low"
  },
  shaken: {
    className: "mood-shaken",
    tone: "forensic-signal",
    cue: "amber/red split rail after contradiction",
    noiseBudget: "medium"
  },
  panicking: {
    className: "mood-panicking",
    tone: "signal",
    cue: "red pressure label plus short transform/opacity pulse",
    noiseBudget: "medium"
  }
} as const;

export type MoodVisualId = keyof typeof MOOD_VISUAL_SYSTEM;

export function getMoodVisual(mood: string) {
  return MOOD_VISUAL_SYSTEM[mood as MoodVisualId] ?? MOOD_VISUAL_SYSTEM.controlled;
}
