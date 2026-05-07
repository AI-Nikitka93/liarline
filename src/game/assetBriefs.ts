import { ASSETS } from "./assets";

export type AssetBrief = {
  assetId: keyof typeof ASSET_BRIEFS;
  path: string;
  role: "hero" | "background" | "texture" | "portrait";
  screenUse: string;
  styleBrief: string;
  compositionRules: string[];
  rejectionRules: string[];
};

export const ASSET_BRIEFS = {
  caseLabHero: {
    path: ASSETS.caseHero,
    role: "hero",
    screenUse: "Briefing dossier image behind the first suspect/case pressure.",
    styleBrief:
      "Neo-noir university robotics lab, dark evidence-room lighting, forensic amber highlights, no cinematic detective cliches.",
    compositionRules: [
      "Leave a dark lower third for readable title text.",
      "Show lab/prototype atmosphere without adding new story evidence.",
      "Keep contrast high enough for mobile crop."
    ],
    rejectionRules: [
      "Reject readable fake text, watermarks, glossy stock-photo look, weapons, police badges, or new clue props.",
      "Reject low-contrast images that cannot hold white/amber UI text."
    ]
  },
  interrogationBackground: {
    path: ASSETS.interrogationBackground,
    role: "background",
    screenUse: "Interrogation phase background under dark overlay.",
    styleBrief:
      "Digital interrogation terminal texture: subdued lab monitors, dark glass, soft scanline pressure, no decorative bokeh.",
    compositionRules: [
      "Must stay readable under an 86-90% ink overlay.",
      "No strong focal point behind chat bubbles.",
      "Should add atmosphere without competing with suspects."
    ],
    rejectionRules: [
      "Reject bright gradients, visible words, UI screenshots, fantasy sci-fi clutter, or noisy textures.",
      "Reject images that create horizontal scroll/crop issues on 375px width."
    ]
  },
  evidencePaper: {
    path: ASSETS.evidencePaper,
    role: "texture",
    screenUse: "Notebook clue slips and evidence-paper surface.",
    styleBrief:
      "Forensic paper slip texture, warm aged paper, subtle grain, suitable for short clue cards on a dark terminal.",
    compositionRules: [
      "Texture must be low-frequency and not reduce text contrast.",
      "No visible printed text unless fully abstract and unreadable.",
      "Should work behind dark overlay or amber ink."
    ],
    rejectionRules: [
      "Reject fake legible handwriting, official seals, watermarks, or high-noise stains.",
      "Reject paper tones that dominate the entire dark palette."
    ]
  },
  suspectIvo: {
    path: ASSETS.suspectPortraits.suspect_ivo,
    role: "portrait",
    screenUse: "Ivo suspect card and pressure/persona shift focus.",
    styleBrief:
      "Controlled lab treasurer, restrained expression, clean but tense portrait lighting, potential panic under red UI overlay.",
    compositionRules: [
      "Face centered for 56px and 80px crops.",
      "Eyes must remain readable at mobile size.",
      "Background should be dark and low-detail."
    ],
    rejectionRules: [
      "Reject plastic skin, asymmetrical eyes, extra fingers, badges, text, logos, or overt villain styling.",
      "Reject portraits that reveal guilt directly instead of preserving doubt."
    ]
  },
  suspectMara: {
    path: ASSETS.suspectPortraits.suspect_mara,
    role: "portrait",
    screenUse: "Mara suspect card as partial-truth motive guardian.",
    styleBrief:
      "Ambitious researcher, defensive confidence, sharp lab light, ambiguous enough to feel suspicious but not guilty.",
    compositionRules: [
      "Face centered for compact suspect grid.",
      "Readable expression under amber border state.",
      "No extra story props."
    ],
    rejectionRules: [
      "Reject glamour-photo style, fake readable lab labels, distorted jewelry, watermarks, or melodramatic villain cues."
    ]
  },
  suspectTheo: {
    path: ASSETS.suspectPortraits.suspect_theo,
    role: "portrait",
    screenUse: "First-screen suspect anchor and nervous false-certainty path.",
    styleBrief:
      "Nervous technician, human hesitation, worried timing tell, plausible red herring without looking like a culprit reveal.",
    compositionRules: [
      "Must hold the first viewport as the immediate game hook.",
      "Expression should support hesitation and self-correction.",
      "Crop must work in both hero and small card usage."
    ],
    rejectionRules: [
      "Reject clownish panic, horror expressions, visible text artifacts, impossible glasses, or too-obvious innocence."
    ]
  },
  suspectLena: {
    path: ASSETS.suspectPortraits.suspect_lena,
    role: "portrait",
    screenUse: "Lena suspect card as direct witness / evader.",
    styleBrief:
      "Impatient witness, blunt and factual, direct eye contact, low-drama portrait that contrasts with nervous suspects.",
    compositionRules: [
      "Readable eyes and silhouette at 56px.",
      "Neutral-to-cool palette compatible with cyan focus states.",
      "No bright costume or unrelated environment."
    ],
    rejectionRules: [
      "Reject fashion editorial look, fake text, warped face, exaggerated anger, or visual style drift from other portraits."
    ]
  }
} as const satisfies Record<string, Omit<AssetBrief, "assetId">>;

export const ASSET_BRIEF_IDS = Object.keys(ASSET_BRIEFS) as Array<keyof typeof ASSET_BRIEFS>;
