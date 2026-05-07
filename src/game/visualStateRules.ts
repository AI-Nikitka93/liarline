export const VISUAL_STATE_RULES = {
  calm: {
    className: "border-line-700 text-text-200",
    cue: "stable border, no glow, neutral pressure label",
    gameMeaning: "No strong pressure signal; never means innocent."
  },
  nervous: {
    className: "border-forensic-500 text-forensic-500",
    cue: "amber rail, restrained jitter only on new answer",
    gameMeaning: "Timing or detail may be unstable; player should verify."
  },
  aggressive: {
    className: "border-signal-500 text-signal-500",
    cue: "red chip and sharper card shadow",
    gameMeaning: "Pressure response is escalating; not an automatic guilt proof."
  },
  panicking: {
    className: "persona-pulse border-signal-500 shadow-signal text-signal-500",
    cue: "portrait pulse, red border, pressure-state label",
    gameMeaning: "Persona shift has triggered; use evidence or contradiction."
  },
  fallback: {
    className: "border-cyan-400 bg-cyan-400/10 text-cyan-300",
    cue: "system-colored tag with explicit degraded-AI copy",
    gameMeaning: "No AP, clue, or suspicion progress should be silently invented."
  },
  live_ai: {
    className: "border-cyan-400 bg-cyan-400/10 text-cyan-300",
    cue: "live source tag with latency",
    gameMeaning: "AI performed the line; engine still owns truth."
  },
  contradiction_found: {
    className: "contradiction-flash visual-event-rail border-signal-500 shadow-signal",
    cue: "red/amber event block, notebook update, suspicion movement",
    gameMeaning: "The player found a real evidence conflict."
  }
} as const;

export type VisualStateId = keyof typeof VISUAL_STATE_RULES;
