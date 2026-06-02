import { ASSETS } from "./assets";

export const SCENARIO_IMAGE_INSERTS = {
  briefing_tension: {
    assetPath: ASSETS.caseHero,
    panelScale: "small-gameplay-panel",
    screen: "Briefing",
    className: "scenario-briefing-tension",
    deductionUse: "Frames the lab, first suspect, and time-window pressure before the first question.",
    forbiddenUse: "Do not introduce extra clue props or act as a gallery image."
  },
  first_ai_hesitation: {
    assetPath: ASSETS.interrogationBackground,
    panelScale: "small-gameplay-panel",
    screen: "Interrogation",
    className: "scenario-first-ai-hesitation",
    deductionUse: "Makes the AI pause visible while preserving that no clue is awarded until the engine accepts the turn.",
    forbiddenUse: "Do not imply live AI success while a fallback or pending state is active."
  },
  contradiction_reveal: {
    assetPath: ASSETS.evidencePaper,
    panelScale: "small-gameplay-panel",
    screen: "Interrogation",
    className: "scenario-contradiction-reveal",
    deductionUse: "Pairs the camera/cart contradiction with a paper-board visual cue so the player sees why the theory changed.",
    forbiddenUse: "Do not show culprit or motive spoilers."
  },
  persona_shift: {
    assetPath: ASSETS.suspectPortraits.suspect_ivo,
    panelScale: "small-gameplay-panel",
    screen: "Interrogation",
    className: "scenario-persona-shift",
    deductionUse: "Turns Ivo's pressure shift into a focused suspect panel without declaring guilt.",
    forbiddenUse: "Do not make panic equal proof."
  },
  accusation_risk: {
    assetPath: ASSETS.evidencePaper,
    panelScale: "small-gameplay-panel",
    screen: "Accusation",
    className: "scenario-accusation-risk",
    deductionUse: "Reinforces that accusation is a signed proof chain, not another casual dialogue choice.",
    forbiddenUse: "Do not hide required selections or risk acknowledgement."
  },
  resolution: {
    assetPath: ASSETS.caseHero,
    panelScale: "small-gameplay-panel",
    screen: "Resolution",
    className: "scenario-resolution",
    deductionUse: "Supports the reverse reconstruction and detective rating as the case close-out.",
    forbiddenUse: "Do not promise additional cases or modes."
  }
} as const;

export type ScenarioInsertId = keyof typeof SCENARIO_IMAGE_INSERTS;

export function getScenarioInsert(id: ScenarioInsertId) {
  return SCENARIO_IMAGE_INSERTS[id];
}
