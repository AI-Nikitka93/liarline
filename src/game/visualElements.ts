export const VISUAL_ELEMENTS = {
  contradiction_flash: {
    className: "contradiction-flash",
    purpose: "Make a found contradiction feel like the main interaction payoff."
  },
  suspicion_state: {
    className: "suspicion-meter",
    purpose: "Show pressure rhythm without becoming an analytics chart."
  },
  persona_shift_state: {
    className: "portrait-anchor persona-pulse",
    purpose: "Turn suspect portraits into emotional state anchors."
  },
  final_rating_stamp: {
    className: "rating-stamp",
    purpose: "Make the detective-work rating feel like a verdict stamp."
  },
  hint_marker: {
    className: "hint-marker",
    purpose: "Mark optional help without revealing culprit, motive, or proof."
  },
  scenario_insert_panel: {
    className: "scenario-insert-panel",
    purpose: "Show small deduction-supporting image inserts without turning the flow into a gallery."
  },
  role_button_system: {
    className: "role-button-first-question role-button-send role-button-notebook role-button-accuse role-button-final-submit role-button-restart",
    purpose: "Make critical controls visually distinct by gameplay role."
  },
  useful_microeffects: {
    className: "micro-clue-opened micro-contradiction-found micro-persona-shift micro-ap-spent micro-final-accusation micro-resolution-rating",
    purpose: "Animate only useful state changes with a reduced-motion safe budget."
  }
} as const;
