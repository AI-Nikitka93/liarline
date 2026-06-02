export const BUTTON_ROLE_SYSTEM = {
  firstQuestion: {
    className: "role-button-first-question",
    role: "primary start action",
    icon: "MessageSquare",
    visualState: "forensic fill with first-action stack"
  },
  send: {
    className: "role-button-send",
    role: "dialogue submit",
    icon: "Send",
    visualState: "compact cyan/forensic action"
  },
  notebook: {
    className: "role-button-notebook",
    role: "evidence tool",
    icon: "BookOpen",
    visualState: "paper/evidence outline"
  },
  accuse: {
    className: "role-button-accuse",
    role: "risk transition",
    icon: "Gavel",
    visualState: "signal outline until proof-ready"
  },
  finalSubmit: {
    className: "role-button-final-submit",
    role: "irreversible final decision",
    icon: "AlertTriangle",
    visualState: "solid signal only after risk acknowledged"
  },
  restart: {
    className: "role-button-restart",
    role: "reset/recovery",
    icon: "RotateCcw",
    visualState: "neutral reset outline or full-width close-out"
  }
} as const;

export const BUTTON_FEEDBACK_STATES = {
  waitingAi: "button-state-waiting-ai",
  liveAnswer: "button-state-live-answer",
  fallback: "button-state-fallback",
  contradiction: "button-state-contradiction",
  lockedAccusation: "button-state-locked-accusation",
  finalRisk: "button-state-final-risk",
  disabled: "button-state-disabled"
} as const;

export const MICRO_EVENT_SYSTEM = {
  clueOpened: {
    className: "micro-clue-opened",
    trigger: "new clue slip enters notebook/transcript",
    properties: ["opacity", "transform", "box-shadow"]
  },
  contradictionFound: {
    className: "micro-contradiction-found",
    trigger: "deduction collapse becomes strong",
    properties: ["opacity", "transform", "box-shadow"]
  },
  personaShift: {
    className: "micro-persona-shift",
    trigger: "Ivo pressure state changes",
    properties: ["opacity", "transform", "box-shadow"]
  },
  apSpent: {
    className: "micro-ap-spent",
    trigger: "accepted live turn spends AP",
    properties: ["opacity", "transform"]
  },
  finalAccusation: {
    className: "micro-final-accusation",
    trigger: "risk-acknowledged accusation submit",
    properties: ["opacity", "transform", "box-shadow"]
  },
  resolutionRating: {
    className: "micro-resolution-rating",
    trigger: "detective rating appears",
    properties: ["opacity", "transform", "box-shadow"]
  }
} as const;
