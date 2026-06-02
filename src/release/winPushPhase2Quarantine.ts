export const PHASE2_QUARANTINE_DATE = "2026-05-08" as const;

export const PHASE2_QUARANTINE_TODO_CLOSURES = [
  "T031",
  "T032",
  "T033",
  "T034",
  "T035",
  "T036",
  "T037",
  "T038",
  "T039",
  "T040"
] as const;

export const PROMPT_CONTROL_PLAYABLE_LANGUAGE = {
  rule:
    "Prompt text uses short situational beat rules, not abstract labels, so the model writes playable suspect speech rather than exposing control language.",
  pressureStateRules: [
    {
      pressureState: "ordinary",
      beat: "answer the question with one case object or emotion, then stop"
    },
    {
      pressureState: "evidence",
      beat: "react to the shown evidence, add one cracked detail, then stop"
    },
    {
      pressureState: "contradiction",
      beat: "open defensively, correct one detail, push back without confessing"
    }
  ],
  bannedControlPhrases: ["pressure point", "required answer anchor", "expected beat", "voice marker", "playable beat", "точка давления"],
  releaseGate: "npm run test:npc-turn && npm run test:win-push-phase2-quarantine"
} as const;

export const AI_PLAYABLE_ANCHORS = {
  allowedAnchors: [
    "camera",
    "cart",
    "prototype",
    "lab",
    "inventory",
    "storage door",
    "21:05",
    "21:10",
    "rivalry",
    "timing panic",
    "break room",
    "routine movement",
    "defensive dodge",
    "visible emotion",
    "minute correction"
  ],
  requiredPerAnswer:
    "Every release-quality live answer needs one object, time, clue, emotion, or allowed dodge tied to the question.",
  releaseGate: "npm run test:win-push-phase2-quarantine && npm run test:live-suspects"
} as const;

export const QUARANTINE_RESPONSE_RULES = {
  genericFillers: ["I don't know", "ask someone else", "nothing unusual", "I have nothing to say", "я не знаю", "ничего необычного"],
  internalLeaks: ["truthTable", "culpritSuspectId", "trueMotiveId", "npcRole", "allowedKnowledge", "clue_"],
  inventedEvidence: ["keycard", "guard", "fingerprint", "weapon", "blood", "locker", "phone record"],
  repeatPolicy: "A repeated suspect answer must become fallback or fail; the next live line needs a new playable beat.",
  releaseGate: "npm run test:win-push-phase2-quarantine"
} as const;

export const FALLBACK_IMPACT_POLICY = {
  label: "degraded but playable",
  spendActionPoint: false,
  unlockClue: false,
  changeSuspicion: false,
  advanceRoundOrAccusation: false,
  countAgainstSuspectQuestionCap: false,
  allowedImpact: ["visible transcript entry", "fallback source label", "operator outcome event"],
  releaseGate: "npm run test:game-engine && npm run test:win-push-phase2-quarantine"
} as const;

export const LIVE_TRANSCRIPT_AUDIT_MATRIX = [
  {
    locale: "en",
    beatId: "first_theo",
    suspectId: "suspect_theo",
    question: "The camera failed before the theft. What minute are you unsure about?",
    passSignal: "mentions camera/timing with nervous uncertainty",
    failSignal: "generic denial, no camera, or solved theft"
  },
  {
    locale: "en",
    beatId: "ivo_pressure",
    suspectId: "suspect_ivo",
    question: "The cart log points at inventory. Why does that sound rehearsed?",
    passSignal: "defensive inventory/cart/21:10 pressure without confession",
    failSignal: "confession, final accusation, or no cart/inventory detail"
  },
  {
    locale: "en",
    beatId: "mara_partial_truth",
    suspectId: "suspect_mara",
    question: "What part of your rivalry are you leaving out about seeing the prototype after 21:05?",
    passSignal: "rivalry plus prototype/lab plus after 21:05 partial truth",
    failSignal: "only says not theft, or sounds like Theo/Ivo"
  },
  {
    locale: "en",
    beatId: "lena_direct_witness",
    suspectId: "suspect_lena",
    question: "State only what you saw about the cart.",
    passSignal: "short cart/storage observation with no theory",
    failSignal: "motive speculation or mystery narration"
  },
  {
    locale: "ru",
    beatId: "first_theo",
    suspectId: "suspect_theo",
    question: "Камера отключилась до кражи. В какой минуте ты не уверен?",
    passSignal: "камера/минута/нервная поправка без английских слов",
    failSignal: "английские термины, признание или нет детали камеры"
  },
  {
    locale: "ru",
    beatId: "ivo_pressure",
    suspectId: "suspect_ivo",
    question: "Какой журнал инвентаря доказывает, что вас не было у тележки в 21:10?",
    passSignal: "21:10 plus тележка/инвентарь defensive lie",
    failSignal: "служебная точка давления, признание или финальный ответ"
  },
  {
    locale: "ru",
    beatId: "mara_partial_truth",
    suspectId: "suspect_mara",
    question: "Что вы скрываете в соперничестве про прототип после 21:05?",
    passSignal: "соперничество plus прототип/лаборатория/после 21:05",
    failSignal: "только отрицание или смешение EN/RU"
  },
  {
    locale: "ru",
    beatId: "lena_direct_witness",
    suspectId: "suspect_lena",
    question: "Скажите только, что вы видели про тележку.",
    passSignal: "тележка/складская дверь фактом без теории",
    failSignal: "мотив, догадка или generic narration"
  }
] as const;

export const AI_MANUAL_REVIEW_CHECKLIST = [
  {
    checkId: "question_understood",
    passSignal: "answer clearly responds to the asked question",
    failSignal: "answer could fit any question"
  },
  {
    checkId: "case_detail_present",
    passSignal: "contains an allowed object, time, clue, emotion, or dodge",
    failSignal: "no camera/cart/prototype/lab/inventory/timing/emotion"
  },
  {
    checkId: "role_voice_present",
    passSignal: "suspect voice matches Theo/Ivo/Mara/Lena rubric",
    failSignal: "voice could belong to any suspect"
  },
  {
    checkId: "no_spoiler",
    passSignal: "does not solve culprit, motive, evidence, win, or loss",
    failSignal: "tells player who/what to accuse"
  },
  {
    checkId: "no_internal_marker",
    passSignal: "no model, role, clue id, prompt, JSON, truth-table, or control-language leak",
    failSignal: "mentions role labels, clue IDs, pressure point, or system text"
  },
  {
    checkId: "language_clean",
    passSignal: "RU or EN stays in selected language",
    failSignal: "mixed inventory/cart/prototype terms in RU or Russian in EN"
  },
  {
    checkId: "new_beat",
    passSignal: "repeated question gets a new detail, correction, dodge, or emotion",
    failSignal: "same denial or same sentence as last answer"
  },
  {
    checkId: "latency_acceptable",
    passSignal: "answer returns below problem boundary or the client converts the turn to visible degraded fallback",
    failSignal: "long wait past problem boundary without answer, fallback, or usable state"
  }
] as const;

export const AI_LATENCY_BOUNDARY = {
  targetMs: 1500,
  warningMs: 4000,
  problemMs: 10000,
  hardFailMs: 15000,
  uiContract:
    "Below warning: feels live. Warning-to-problem: acceptable with thinking UI and one validation repair retry. Above problem: client uses visible fallback while server/live smoke can still prove provider behavior.",
  releaseGate: "npm run test:demo-route && npm run test:live-suspects && npm run test:mobile-ui"
} as const;
