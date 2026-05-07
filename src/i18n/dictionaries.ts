import type { Clue, DetectiveRating, GameState, LieArchetype, Motive, Outcome, PublicFact, Suspect, TimelineEvent } from "../game/types";

export type Locale = "en" | "ru";

type Dictionary = {
  localeName: string;
  aiResponseLanguage: string;
  phaseLabels: Record<GameState["phase"], string>;
  ui: {
    round: string;
    actionPointsShort: string;
    actionPointsAria: (remaining: number, total: number) => string;
    evidenceScene: string;
    window: string;
    suspects: string;
    publicFacts: string;
    startInterrogation: string;
    askFirstQuestion: string;
    firstPressureTarget: string;
    visualThesisBadge: string;
    coreHookLine: string;
    briefingPremise: string;
    firstQuestionSetup: string;
    openNotebook: string;
    closeNotebook: string;
    activeSuspect: string;
    emptyChat: string;
    analyzingResponse: string;
    thinkingLine: string;
    firstQuestionCost: string;
    questionActionCost: string;
    actionPointsRule: (remaining: number, total: number) => string;
    accuseLocked: (answered: number, needed: number) => string;
    clueOpened: string;
    customQuestionAria: string;
    sendQuestion: string;
    accuse: string;
    finalAccusation: string;
    culpritStep: string;
    motiveStep: string;
    evidenceStep: string;
    noEvidence: string;
    submitAccusation: string;
    resolution: string;
    culprit: string;
    motive: string;
    evidenceScore: string;
    truthTimeline: string;
    npcRolesRevealed: string;
    newCase: string;
    restartGame: string;
    continueInterrogation: string;
    notebook: string;
    clues: string;
    openedClues: string;
    redacted: string;
    critical: string;
    noOpenedClues: string;
    connectionFallback: string;
    waitCurrentAnswer: string;
    minimumQuestions: (count: number) => string;
    truthTableLabel: string;
    portraitAlt: (name: string) => string;
    questionShort: string;
    aiSourceLive: string;
    aiSourceFallback: string;
    aiLatency: (latencyMs: number) => string;
    aiLatencyUnknown: string;
    fallbackReason: (reason: string) => string;
    lieType: string;
    theory: string;
    weakTheory: string;
    strongTheory: string;
    suspicionMeaning: string;
    theoryMeaning: string;
    weakStrongRule: string;
    suspicionSignals: string;
    suspicionSignalsNotebook: string;
    suspicionSignalsNotebookHint: string;
    signalUnresolved: string;
    signalResolved: string;
    contradictionFound: string;
    contradictionAction: string;
    contradictionActionAvailable: string;
    contradictionActionBody: string;
    contradictionPayoff: string;
    contradictionNotebookUpdated: string;
    contradictionSuspicionShifted: string;
    contradictionPersonaShifted: string;
    boardLinkLabel: string;
    suspicionShiftLabel: string;
    theoryShiftLabel: string;
    collapseTitle: string;
    collapseBody: string;
    collapseImpactLine: string;
    collapseNextTitle: string;
    collapseNextNotebook: string;
    collapseNextPressure: string;
    deadEndHintButton: string;
    deadEndHintReason: string;
    deadEndHintText: string;
    personaShift: string;
    personaReactionLine: string;
    pressureState: string;
    accusationRisk: string;
    attemptsRemaining: (count: number) => string;
    finalSubmitRisk: string;
    acknowledgeRiskLabel: string;
    submitDisabledRisk: string;
    noActionReturn: string;
    safeRestartLine: string;
    evidenceType: string;
    proofChecks: string;
    proofSuspect: string;
    proofMotive: string;
    proofEvidence: string;
    proofEvidenceSelected: (count: number) => string;
    proofReady: string;
    proofIncomplete: string;
    selectedEvidenceWarning: string;
    detectiveRating: string;
    reverseReconstruction: string;
    missedOpportunity: string;
    missedOpportunityPerfect: string;
    degradedAiTitle: string;
    degradedAiBody: string;
    caseProgressLabel: string;
    caseBeatStatement: string;
    caseBeatContradiction: string;
    caseBeatPressure: string;
    caseBeatAccusation: string;
    caseBeatResolution: string;
    caseBeatCurrent: string;
    caseBeatDone: string;
    caseBeatLocked: string;
    suspectSelectAria: (name: string, suspicion: number) => string;
  };
  suspicion: {
    label: string;
    calm: string;
    uneasy: string;
    nervous: string;
    breaking: string;
  };
  moods: Record<string, string>;
  roles: Record<string, string>;
  detectiveRatings: Record<DetectiveRating, { title: string; body: string }>;
  reverseReconstruction: Record<string, string>;
  lieArchetypes: Record<LieArchetype, string>;
  evidenceTypes: Record<Clue["evidenceType"], string>;
  contradictions: Record<string, { title: string; body: string }>;
  suspicionSignals: Record<string, string>;
  missedOpportunities: string[];
  resolutionTitles: Record<Outcome, string>;
  resolutionText: Record<Outcome, string>;
  validation: {
    interrogationUnavailable: string;
    noActionPoints: string;
    roundsFinished: string;
    suspectMissing: string;
    suspectQuestionCap: string;
    emptyQuestion: string;
    questionTooLong: (max: number) => string;
  };
  case: {
    title: string;
    publicBrief: string;
    setting: string;
    publicFacts: Record<string, string>;
  };
  suspects: Record<string, { displayName: string; publicProfile: string; publicMask: string; falseClaims: string[] }>;
  clues: Record<string, string>;
  motives: Record<string, string>;
  timeline: Record<string, string>;
  questions: {
    base: (state: GameState, suspect: Suspect) => string[];
    pressure: (state: GameState, suspect: Suspect, firstUnlockedClue: string | null) => string[];
    final: (state: GameState, suspect: Suspect) => string[];
  };
};

export const DEFAULT_LOCALE: Locale = "ru";

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    localeName: "English",
    aiResponseLanguage: "English",
    phaseLabels: {
      briefing: "Briefing",
      interrogation: "Interrogation",
      accusation: "Final Accusation",
      resolution: "Resolution"
    },
    ui: {
      round: "Round",
      actionPointsShort: "AP",
      actionPointsAria: (remaining, total) => `Action points ${remaining} of ${total}`,
      evidenceScene: "Evidence scene",
      window: "Window",
      suspects: "Suspects",
      publicFacts: "Public facts",
      startInterrogation: "Start interrogation",
      askFirstQuestion: "Ask first question",
      firstPressureTarget: "First pressure target",
      visualThesisBadge: "Interrogate first",
      coreHookLine: "AI suspects can lie. Only evidence can convict.",
      briefingPremise: "The camera died before the theft. Theo's timeline is already shaking.",
      firstQuestionSetup: "Get his first story. Then test it against the cart log.",
      openNotebook: "Open notebook",
      closeNotebook: "Close notebook",
      activeSuspect: "Active suspect",
      emptyChat: "Choose a question. AI performs the NPC, but the local Truth Table decides victory.",
      analyzingResponse: "READING THE PAUSE",
      thinkingLine: "The room goes quiet. Watch the story tighten.",
      firstQuestionCost: "Costs 1 AP",
      questionActionCost: "-1 AP",
      actionPointsRule: (remaining, total) => `Each question costs 1 AP. ${remaining}/${total} remain.`,
      accuseLocked: (answered, needed) => `Accusation opens after ${needed} answers. Current: ${answered}.`,
      clueOpened: "clue opened",
      customQuestionAria: "Short question to the suspect",
      sendQuestion: "Send question",
      accuse: "Accuse",
      finalAccusation: "Final Accusation",
      culpritStep: "1. Culprit",
      motiveStep: "2. Motive",
      evidenceStep: "3. Evidence",
      noEvidence: "No evidence is open. You can accuse, but the evidence chain will be weak.",
      submitAccusation: "Submit accusation",
      resolution: "Resolution",
      culprit: "Culprit",
      motive: "Motive",
      evidenceScore: "Evidence score",
      truthTimeline: "Truth timeline",
      npcRolesRevealed: "NPC roles revealed",
      newCase: "New case",
      restartGame: "Restart",
      continueInterrogation: "Back to interrogation",
      notebook: "Notebook",
      clues: "Clues",
      openedClues: "Opened clues",
      redacted: "Redacted",
      critical: "critical",
      noOpenedClues: "No opened clues yet. Pressure contradictions during interrogation.",
      connectionFallback: "The witness stalls. No progress was applied.",
      waitCurrentAnswer: "Wait for the current answer.",
      minimumQuestions: (count) => `Ask at least ${count} questions first.`,
      truthTableLabel: "Truth Table",
      portraitAlt: (name) => `${name} portrait`,
      questionShort: "Q",
      aiSourceLive: "Live answer",
      aiSourceFallback: "Guarded answer",
      aiLatency: (latencyMs) => `pause ${latencyMs} ms`,
      aiLatencyUnknown: "pause unknown",
      fallbackReason: (reason) => {
        const labels: Record<string, string> = {
          timeout: "long pause",
          rate_limit: "room pressure",
          missing_api_key: "silent room",
          invalid_model_json: "broken answer",
          invalid_request: "blocked question",
          network_error: "lost signal"
        };
        return `guarded mode: ${labels[reason] ?? reason.replaceAll("_", " ")}`;
      },
      lieType: "Lie type",
      theory: "Theory",
      weakTheory: "Weak",
      strongTheory: "Strong",
      suspicionMeaning: "Suspicion is pressure on a person. It shows who is cracking, not who is proven guilty.",
      theoryMeaning: "Theory is proof strength. Weak means the story is plausible; Strong means evidence has broken a version.",
      weakStrongRule: "Only two grades exist: Weak or Strong. They never name the answer for you.",
      suspicionSignals: "Suspicion signals",
      suspicionSignalsNotebook: "Suspicion signals",
      suspicionSignalsNotebookHint: "These are alarms, not answers. Compare them with evidence before accusing.",
      signalUnresolved: "unchecked",
      signalResolved: "checked",
      contradictionFound: "Contradiction found",
      contradictionAction: "Catch contradiction",
      contradictionActionAvailable: "Contradiction action ready",
      contradictionActionBody: "Use the board link as pressure: camera failure and cart movement cannot both support the same clean story.",
      contradictionPayoff: "You connected two incompatible facts. The board, pressure, and suspect behavior all change together.",
      contradictionNotebookUpdated: "Notebook updated",
      contradictionSuspicionShifted: "Suspicion shifted",
      contradictionPersonaShifted: "Persona shifted",
      boardLinkLabel: "Board link connected",
      suspicionShiftLabel: "Suspicion moved",
      theoryShiftLabel: "Theory strengthened",
      collapseTitle: "THEORY COLLAPSE",
      collapseBody: "Theo's camera panic explains the missing footage, but not the cart that left later. Ivo becomes the new pressure target.",
      collapseImpactLine: "The clean first theory breaks here. The next answer should be tested against the board, not trusted as a confession.",
      collapseNextTitle: "Next move",
      collapseNextNotebook: "Open the notebook and compare the timeline gap.",
      collapseNextPressure: "Pressure the suspect whose clean story now has an unchecked minute.",
      deadEndHintButton: "Ask for one hint",
      deadEndHintReason: "Available after the trail stalls. It points to what to compare, not who to accuse.",
      deadEndHintText: "Compare the open clue with the cart timeline, then ask about the unchecked minute. Do not trust a clean story until the time gap is explained.",
      personaShift: "Persona shift",
      personaReactionLine: "Wait. That is not what I meant. You are mixing the cart log with the camera problem.",
      pressureState: "Pressure state",
      accusationRisk: "Accusation risk",
      attemptsRemaining: (count) => `${count} attempt${count === 1 ? "" : "s"} remaining`,
      finalSubmitRisk: "Final means final: 1 wrong accusation creates a wrong-outcome ending.",
      acknowledgeRiskLabel: "I understand this is the one final accusation.",
      submitDisabledRisk: "Confirm the final risk before submitting.",
      noActionReturn: "No action points remain. Restart from the top bar to try a new line.",
      safeRestartLine: "Restart is always available from the top bar and starts a clean local case.",
      evidenceType: "Type",
      proofChecks: "Proof checks",
      proofSuspect: "Suspect check",
      proofMotive: "Motive check",
      proofEvidence: "Evidence check",
      proofEvidenceSelected: (count) => `${count}/2 evidence selected`,
      proofReady: "Evidence chain ready",
      proofIncomplete: "Evidence chain weak",
      selectedEvidenceWarning: "A weak chain can still accuse, but it can only produce a partial or wrong-feeling result.",
      detectiveRating: "Detective work",
      reverseReconstruction: "Reverse reconstruction",
      missedOpportunity: "What you could still use",
      missedOpportunityPerfect: "No major gap left open. Replay to catch the panic earlier.",
      degradedAiTitle: "Guarded pause",
      degradedAiBody: "The room stays fair. No action point, clue, or suspicion shift is applied for this guarded answer.",
      caseProgressLabel: "Case pressure",
      caseBeatStatement: "Statement",
      caseBeatContradiction: "Contradiction",
      caseBeatPressure: "Pressure",
      caseBeatAccusation: "Accusation",
      caseBeatResolution: "Verdict",
      caseBeatCurrent: "current",
      caseBeatDone: "done",
      caseBeatLocked: "locked",
      suspectSelectAria: (name, suspicion) => `Select ${name}. Suspicion ${suspicion}.`
    },
    suspicion: {
      label: "Suspicion",
      calm: "Calm",
      uneasy: "Uneasy",
      nervous: "Nervous",
      breaking: "Breaking"
    },
    moods: {
      controlled: "controlled",
      defensive: "defensive",
      nervous: "nervous",
      impatient: "impatient",
      guarded: "guarded",
      evasive: "evasive",
      angry: "angry",
      shaken: "shaken",
      panicking: "panicking"
    },
    roles: {
      liar_culprit: "Liar / culprit",
      hides_motive: "Hides motive",
      honest_witness: "Honest witness",
      confused_innocent: "Confused innocent"
    },
    detectiveRatings: {
      sharp: {
        title: "Sharp",
        body: "You broke the false theory, named the right suspect, and backed it with enough evidence."
      },
      careful: {
        title: "Careful",
        body: "You reached the right full answer, but the route missed the strongest contradiction beat."
      },
      reckless: {
        title: "Reckless",
        body: "You pointed at the right suspect, but the proof chain was not strong enough."
      },
      misled: {
        title: "Misled",
        body: "You followed a plausible wrong theory past the evidence."
      }
    },
    reverseReconstruction: {
      recon_camera_break: "Theo broke the camera before the theft, creating a tempting false suspect.",
      recon_cart_log: "The cart log proves the prototype still moved after the camera problem.",
      recon_ivo_gap: "Ivo's inventory story leaves the 21:10 gap exposed.",
      recon_final_verdict: "With motive and evidence aligned, Ivo is the only version that holds.",
      recon_wrong_verdict: "The accusation missed the cart gap and let the wrong theory lead."
    },
    lieArchetypes: {
      direct_liar: "direct liar",
      evader: "evader",
      partial_truth: "partial truth",
      confused: "confused"
    },
    evidenceTypes: {
      timeline: "timeline",
      statement: "statement",
      message: "message"
    },
    contradictions: {
      contradiction_camera_vs_cart: {
        title: "Camera break vs cart log",
        body: "The broken camera explains why footage is missing, but the cart still left the lab wing later."
      }
    },
    suspicionSignals: {
      signal_theo_timeline_mismatch: "timeline mismatch?",
      signal_ivo_detail_unverified: "detail unverified",
      signal_mara_statement_conflict: "statement conflict?"
    },
    missedOpportunities: [
      "Ask Theo why a broken camera does not explain the cart leaving later.",
      "Compare Ivo's inventory story with the 21:10 cart movement before accusing.",
      "Use the contradiction action before treating suspicion as proof."
    ],
    resolutionTitles: {
      perfect_win: "CASE CLOSED",
      partial_win: "PARTIAL TRUTH",
      loss: "WRONG ACCUSATION"
    },
    resolutionText: {
      perfect_win: "You named the thief, the motive, and enough evidence. The case holds.",
      partial_win: "You found the culprit, but the motive or evidence chain is weak.",
      loss: "The accusation misses the culprit. The truth table does not bend."
    },
    validation: {
      interrogationUnavailable: "Interrogation is not available right now.",
      noActionPoints: "No action points remain.",
      roundsFinished: "Interrogation rounds are finished.",
      suspectMissing: "Suspect not found.",
      suspectQuestionCap: "This suspect has already answered the maximum number of questions.",
      emptyQuestion: "Question cannot be empty.",
      questionTooLong: (max) => `Question is too long. Maximum ${max} characters.`
    },
    case: {
      title: "The Missing Prototype",
      publicBrief:
        "A prototype vanished from the robotics lab between 21:00 and 21:15. Four people had access, but only one had the motive and the gap.",
      setting: "University robotics lab",
      publicFacts: {
        public_001: "The prototype was last checked before 21:00.",
        public_002: "A corridor camera stopped recording before the theft.",
        public_003: "The storage door logs show one cart leaving the lab wing."
      }
    },
    suspects: {
      suspect_ivo: {
        displayName: "Ivo",
        publicProfile: "Calm lab treasurer who claims he was reviewing inventory.",
        publicMask: "Orderly treasurer with a clean inventory story.",
        falseClaims: [
          "I was counting inventory in the break room.",
          "Mara had more access than I did.",
          "The cart log is only a routine inventory movement."
        ]
      },
      suspect_mara: {
        displayName: "Mara",
        publicProfile: "Ambitious researcher who was near the lab that evening.",
        publicMask: "Rival researcher hiding an embarrassing reason to be nearby.",
        falseClaims: ["I left earlier than I did."]
      },
      suspect_theo: {
        displayName: "Theo",
        publicProfile: "Nervous technician responsible for lab equipment.",
        publicMask: "Nervous technician whose panic makes the first wrong theory tempting.",
        falseClaims: ["I do not remember the exact minute."]
      },
      suspect_lena: {
        displayName: "Lena",
        publicProfile: "Direct witness who dislikes drama and wants the case closed.",
        publicMask: "Impatient witness who gives facts but refuses speculation.",
        falseClaims: []
      }
    },
    clues: {
      clue_ivo_gap: "Ivo cannot account for several minutes near 21:10.",
      clue_debt_message: "A message hints Ivo needed money urgently.",
      clue_mara_saw_prototype: "Mara saw the prototype after 21:05.",
      clue_camera_fault: "Theo broke the camera before the theft.",
      clue_lena_heard_cart: "Lena heard a cart roll toward the storage door."
    },
    motives: {
      motive_debt: "Debt pressure",
      motive_rivalry: "Research rivalry",
      motive_panic: "Camera accident cover-up"
    },
    timeline: {
      clue_camera_fault: "Theo accidentally damages the corridor camera.",
      clue_mara_saw_prototype: "Mara sees the prototype still in the lab.",
      clue_ivo_gap: "Ivo removes the prototype with the lab cart."
    },
    questions: {
      base: (state, suspect) => [
        suspect.suspectId === "suspect_theo"
          ? "The corridor camera failed before the theft. What happened to it?"
          : suspect.suspectId === "suspect_ivo"
            ? "Your inventory story puts you near the cart log. What exactly did you count?"
            : suspect.suspectId === "suspect_mara"
              ? "You say you left early. What did you actually see after 21:05?"
              : "You keep redirecting to facts. What did you hear near the storage door?",
        "Who had the strongest reason to touch the prototype?",
        "What detail are you leaving out?"
      ],
      pressure: (_state, suspect, firstUnlockedClue) => [
        suspect.suspectId === "suspect_ivo"
          ? "The cart left after the camera broke. Why does your inventory story still avoid 21:10?"
          : suspect.suspectId === "suspect_mara"
            ? "Give me the part you skipped: was the prototype still there after 21:05?"
            : suspect.suspectId === "suspect_theo"
              ? "Your panic explains the camera. What does it not explain?"
              : "Stop redirecting. Name the sound and the direction you heard.",
        firstUnlockedClue ? `This clue bothers me: ${firstUnlockedClue}. What do you say?` : "What would another suspect say about you?",
        "Give me one detail that can be checked."
      ],
      final: () => [
        "What is the one minute in your story I should verify?",
        "If you are innocent, who benefits from your confusion?",
        "Last chance: correct anything you said before."
      ]
    }
  },
  ru: {
    localeName: "Русский",
    aiResponseLanguage: "Russian",
    phaseLabels: {
      briefing: "Вводное дело",
      interrogation: "Допрос",
      accusation: "Обвинение",
      resolution: "Развязка"
    },
    ui: {
      round: "Раунд",
      actionPointsShort: "ОД",
      actionPointsAria: (remaining, total) => `Очки действий: ${remaining} из ${total}`,
      evidenceScene: "Место дела",
      window: "Окно",
      suspects: "Подозреваемые",
      publicFacts: "Публичные факты",
      startInterrogation: "Начать допрос",
      askFirstQuestion: "Задать первый вопрос",
      firstPressureTarget: "Первый под давлением",
      visualThesisBadge: "Сразу допрос",
      coreHookLine: "AI-подозреваемые могут лгать. Обвиняют только улики.",
      briefingPremise: "Камера умерла до кражи. Хронология Тео уже дрожит.",
      firstQuestionSetup: "Возьмите первую версию. Затем проверьте её логом тележки.",
      openNotebook: "Открыть записную книжку",
      closeNotebook: "Закрыть записную книжку",
      activeSuspect: "Активный подозреваемый",
      emptyChat: "Выберите вопрос. ИИ играет NPC, но победу определяет локальная таблица истины.",
      analyzingResponse: "СЧИТЫВАЕМ ПАУЗУ",
      thinkingLine: "Комната стихает. Смотрите, как версия сжимается.",
      firstQuestionCost: "Стоит 1 ОД",
      questionActionCost: "-1 ОД",
      actionPointsRule: (remaining, total) => `Каждый вопрос стоит 1 ОД. Осталось ${remaining}/${total}.`,
      accuseLocked: (answered, needed) => `Обвинение откроется после ${needed} ответов. Сейчас: ${answered}.`,
      clueOpened: "улика открыта",
      customQuestionAria: "Короткий вопрос подозреваемому",
      sendQuestion: "Отправить вопрос",
      accuse: "Обвинить",
      finalAccusation: "Финальное обвинение",
      culpritStep: "1. Виновный",
      motiveStep: "2. Мотив",
      evidenceStep: "3. Улики",
      noEvidence: "Открытых улик нет. Обвинить можно, но доказательная цепочка будет слабой.",
      submitAccusation: "Выдвинуть обвинение",
      resolution: "Развязка",
      culprit: "Виновный",
      motive: "Мотив",
      evidenceScore: "Сила улик",
      truthTimeline: "Истинная хронология",
      npcRolesRevealed: "Роли NPC раскрыты",
      newCase: "Новое дело",
      restartGame: "Заново",
      continueInterrogation: "Вернуться к допросу",
      notebook: "Записная книжка",
      clues: "Улики",
      openedClues: "Открытые улики",
      redacted: "Скрыто",
      critical: "критично",
      noOpenedClues: "Пока нет открытых улик. Давите на противоречия в допросе.",
      connectionFallback: "Свидетель тянет время. Прогресс не применён.",
      waitCurrentAnswer: "Дождитесь текущего ответа.",
      minimumQuestions: (count) => `Нужно задать минимум ${count} вопроса.`,
      truthTableLabel: "таблица истины",
      portraitAlt: (name) => `Портрет: ${name}`,
      questionShort: "В",
      aiSourceLive: "Живой ответ",
      aiSourceFallback: "Осторожный ответ",
      aiLatency: (latencyMs) => `пауза ${latencyMs} мс`,
      aiLatencyUnknown: "пауза неизвестна",
      fallbackReason: (reason) => {
        const labels: Record<string, string> = {
          timeout: "долгая пауза",
          rate_limit: "давление в комнате",
          missing_api_key: "тихая комната",
          invalid_model_json: "сорванный ответ",
          invalid_request: "вопрос заблокирован",
          network_error: "сигнал пропал"
        };
        return `осторожный режим: ${labels[reason] ?? reason.replaceAll("_", " ")}`;
      },
      lieType: "Тип лжи",
      theory: "Версия",
      weakTheory: "Слабая",
      strongTheory: "Сильная",
      suspicionMeaning: "Подозрение — это давление на человека. Оно показывает, кто трещит, но не доказывает ответ.",
      theoryMeaning: "Версия — это сила цепочки. Слабая значит правдоподобно; сильная значит улика сломала историю.",
      weakStrongRule: "Есть только две грубые оценки: Слабая или Сильная. Они не называют ответ за вас.",
      suspicionSignals: "Сигналы подозрения",
      suspicionSignalsNotebook: "Сигналы подозрения",
      suspicionSignalsNotebookHint: "Это тревоги, а не ответы. Сравните их с уликами перед обвинением.",
      signalUnresolved: "не проверено",
      signalResolved: "проверено",
      contradictionFound: "Противоречие найдено",
      contradictionAction: "Поймать противоречие",
      contradictionActionAvailable: "Действие противоречия готово",
      contradictionActionBody: "Используйте связь на доске как давление: сбой камеры и движение тележки не поддерживают одну чистую версию.",
      contradictionPayoff: "Вы связали два несовместимых факта. Доска, давление и поведение подозреваемого меняются вместе.",
      contradictionNotebookUpdated: "Записная книжка обновлена",
      contradictionSuspicionShifted: "Подозрение смещено",
      contradictionPersonaShifted: "Поведение изменилось",
      boardLinkLabel: "Связь на доске проведена",
      suspicionShiftLabel: "Подозрение сдвинулось",
      theoryShiftLabel: "Версия усилилась",
      collapseTitle: "ВЕРСИЯ РУХНУЛА",
      collapseBody: "Паника Тео из-за камеры объясняет пропавшую запись, но не тележку, которая уехала позже. Новая цель давления — Иво.",
      collapseImpactLine: "Первая чистая версия ломается здесь. Следующий ответ нужно проверять доской, а не принимать как признание.",
      collapseNextTitle: "Следующий ход",
      collapseNextNotebook: "Откройте записную книжку и сравните провал в хронологии.",
      collapseNextPressure: "Давите на того, чья чистая история теперь оставила непроверенную минуту.",
      deadEndHintButton: "Попросить одну подсказку",
      deadEndHintReason: "Доступна после тупика. Подсказывает, что сравнить, а не кого обвинять.",
      deadEndHintText: "Сравните открытую улику с хронологией тележки, затем спросите про непроверенную минуту. Чистая история не считается надёжной, пока провал во времени не объяснён.",
      personaShift: "Смена поведения",
      personaReactionLine: "Подождите. Я не это имел в виду. Вы смешиваете лог тележки с проблемой камеры.",
      pressureState: "Состояние давления",
      accusationRisk: "Риск обвинения",
      attemptsRemaining: (count) => `Осталось попыток: ${count}`,
      finalSubmitRisk: "Финал есть финал: 1 неверное обвинение ведёт к ошибочной развязке.",
      acknowledgeRiskLabel: "Я понимаю, что это одно финальное обвинение.",
      submitDisabledRisk: "Подтвердите риск финала перед отправкой.",
      noActionReturn: "Очки действий закончились. Начните заново через верхнюю панель, чтобы проверить другую линию.",
      safeRestartLine: "Заново всегда доступно в верхней панели и запускает чистое локальное дело.",
      evidenceType: "Тип",
      proofChecks: "Проверки обвинения",
      proofSuspect: "Проверка подозреваемого",
      proofMotive: "Проверка причины",
      proofEvidence: "Проверка улик",
      proofEvidenceSelected: (count) => `Выбрано улик: ${count}/2`,
      proofReady: "Цепочка улик готова",
      proofIncomplete: "Цепочка улик слабая",
      selectedEvidenceWarning: "Слабая цепочка всё ещё позволяет обвинить, но может дать только частичную или ошибочную развязку.",
      detectiveRating: "Работа детектива",
      reverseReconstruction: "Обратная реконструкция",
      missedOpportunity: "Что ещё можно было использовать",
      missedOpportunityPerfect: "Главный провал закрыт. Переиграйте, чтобы поймать панику раньше.",
      degradedAiTitle: "Осторожная пауза",
      degradedAiBody: "Дело продолжается честно. За осторожный ответ не списываются очки, не открываются улики и не меняется подозрение.",
      caseProgressLabel: "Давление дела",
      caseBeatStatement: "Показание",
      caseBeatContradiction: "Противоречие",
      caseBeatPressure: "Давление",
      caseBeatAccusation: "Обвинение",
      caseBeatResolution: "Вердикт",
      caseBeatCurrent: "сейчас",
      caseBeatDone: "готово",
      caseBeatLocked: "закрыто",
      suspectSelectAria: (name, suspicion) => `Выбрать ${name}. Подозрение ${suspicion}.`
    },
    suspicion: {
      label: "Подозрение",
      calm: "Спокоен",
      uneasy: "Напряжён",
      nervous: "Нервничает",
      breaking: "На грани"
    },
    moods: {
      controlled: "сдержан",
      defensive: "защищается",
      nervous: "нервничает",
      impatient: "нетерпелив",
      guarded: "насторожен",
      evasive: "уклоняется",
      angry: "злится",
      shaken: "потрясён",
      panicking: "паникует"
    },
    roles: {
      liar_culprit: "Лжец / виновный",
      hides_motive: "Скрывает мотив",
      honest_witness: "Честный свидетель",
      confused_innocent: "Путающийся невиновный"
    },
    detectiveRatings: {
      sharp: {
        title: "Остро",
        body: "Вы сломали ложную версию, назвали верного подозреваемого и подкрепили это достаточными уликами."
      },
      careful: {
        title: "Аккуратно",
        body: "Вы нашли полный ответ, но прошли мимо самого сильного момента противоречия."
      },
      reckless: {
        title: "Рискованно",
        body: "Вы указали на правильного подозреваемого, но доказательная цепочка была слишком слабой."
      },
      misled: {
        title: "Сбит с версии",
        body: "Вы пошли за правдоподобной ложной версией дальше, чем позволяли улики."
      }
    },
    reverseReconstruction: {
      recon_camera_break: "Тео сломал камеру до кражи, из-за чего стал удобной ложной целью.",
      recon_cart_log: "Лог тележки доказывает, что прототип всё равно вывезли после проблемы с камерой.",
      recon_ivo_gap: "Версия Иво про инвентарь оставляет открытым провал около 21:10.",
      recon_final_verdict: "Когда мотив и улики сходятся, держится только версия с Иво.",
      recon_wrong_verdict: "Обвинение пропустило провал с тележкой и пошло за ложной версией."
    },
    lieArchetypes: {
      direct_liar: "прямой лжец",
      evader: "уклонист",
      partial_truth: "частичная правда",
      confused: "путаник"
    },
    evidenceTypes: {
      timeline: "хронология",
      statement: "показание",
      message: "сообщение"
    },
    contradictions: {
      contradiction_camera_vs_cart: {
        title: "Сбой камеры против тележки",
        body: "Сломанная камера объясняет отсутствие записи, но тележка всё равно уехала из крыла лаборатории позже."
      }
    },
    suspicionSignals: {
      signal_theo_timeline_mismatch: "сбой хронологии?",
      signal_ivo_detail_unverified: "деталь не проверена",
      signal_mara_statement_conflict: "конфликт показаний?"
    },
    missedOpportunities: [
      "Спросите Тео, почему сломанная камера не объясняет тележку, уехавшую позже.",
      "Сравните историю Иво про инвентарь с движением тележки около 21:10 до обвинения.",
      "Используйте действие противоречия до того, как принимать подозрение за доказательство."
    ],
    resolutionTitles: {
      perfect_win: "ДЕЛО ЗАКРЫТО",
      partial_win: "ЧАСТЬ ПРАВДЫ",
      loss: "ОШИБОЧНОЕ ОБВИНЕНИЕ"
    },
    resolutionText: {
      perfect_win: "Вы назвали вора, мотив и достаточные улики. Дело держится.",
      partial_win: "Вы нашли виновного, но мотив или доказательная цепочка слабы.",
      loss: "Обвинение промахнулось мимо виновного. Таблица истины не меняется."
    },
    validation: {
      interrogationUnavailable: "Допрос сейчас недоступен.",
      noActionPoints: "Очки действий закончились.",
      roundsFinished: "Раунды допроса завершены.",
      suspectMissing: "Подозреваемый не найден.",
      suspectQuestionCap: "Этот подозреваемый уже ответил на максимум вопросов.",
      emptyQuestion: "Вопрос не может быть пустым.",
      questionTooLong: (max) => `Вопрос слишком длинный. Максимум ${max} символов.`
    },
    case: {
      title: "Пропавший прототип",
      publicBrief:
        "Прототип исчез из лаборатории робототехники между 21:00 и 21:15. Доступ был у четверых, но только у одного сходятся мотив и провал в алиби.",
      setting: "Университетская лаборатория робототехники",
      publicFacts: {
        public_001: "Прототип в последний раз проверяли до 21:00.",
        public_002: "Камера в коридоре перестала писать до кражи.",
        public_003: "Логи двери склада показывают, что из крыла лаборатории вывезли одну тележку."
      }
    },
    suspects: {
      suspect_ivo: {
        displayName: "Иво",
        publicProfile: "Сдержанный казначей лаборатории, утверждает, что проверял инвентарь.",
        publicMask: "Аккуратный казначей с чистой историей про инвентарь.",
        falseClaims: [
          "Я считал инвентарь в комнате отдыха.",
          "У Мары было больше доступа, чем у меня.",
          "Журнал тележки показывает обычное движение инвентаря."
        ]
      },
      suspect_mara: {
        displayName: "Мара",
        publicProfile: "Амбициозная исследовательница, которая была рядом с лабораторией вечером.",
        publicMask: "Соперница, скрывающая неловкую причину быть рядом.",
        falseClaims: ["Я ушла раньше, чем на самом деле."]
      },
      suspect_theo: {
        displayName: "Тео",
        publicProfile: "Нервный техник, отвечающий за оборудование лаборатории.",
        publicMask: "Нервный техник, чья паника делает первую ложную версию убедительной.",
        falseClaims: ["Я не помню точную минуту."]
      },
      suspect_lena: {
        displayName: "Лена",
        publicProfile: "Прямой свидетель, не любит драму и хочет закрыть дело.",
        publicMask: "Нетерпеливый свидетель: даёт факты, но отказывается гадать.",
        falseClaims: []
      }
    },
    clues: {
      clue_ivo_gap: "Иво не может объяснить несколько минут около 21:10.",
      clue_debt_message: "Сообщение намекает, что Иво срочно нужны деньги.",
      clue_mara_saw_prototype: "Мара видела прототип после 21:05.",
      clue_camera_fault: "Тео сломал камеру до кражи.",
      clue_lena_heard_cart: "Лена слышала, как тележка покатилась к двери склада."
    },
    motives: {
      motive_debt: "Давление долгов",
      motive_rivalry: "Научное соперничество",
      motive_panic: "Попытка скрыть аварию с камерой"
    },
    timeline: {
      clue_camera_fault: "Тео случайно повреждает коридорную камеру.",
      clue_mara_saw_prototype: "Мара видит, что прототип всё ещё в лаборатории.",
      clue_ivo_gap: "Иво вывозит прототип на лабораторной тележке."
    },
    questions: {
      base: (state, suspect) => [
        suspect.suspectId === "suspect_theo"
          ? "Коридорная камера отказала до кражи. Что с ней произошло?"
          : suspect.suspectId === "suspect_ivo"
            ? "Ваша версия про инвентарь рядом с логом тележки. Что именно вы считали?"
            : suspect.suspectId === "suspect_mara"
              ? "Вы говорите, что ушли рано. Что вы на самом деле видели после 21:05?"
              : "Вы всё время возвращаете разговор к фактам. Что вы слышали у двери склада?",
        "У кого была самая сильная причина трогать прототип?",
        "Какую деталь вы недоговариваете?"
      ],
      pressure: (_state, suspect, firstUnlockedClue) => [
        suspect.suspectId === "suspect_ivo"
          ? "Тележка уехала после поломки камеры. Почему ваша версия про инвентарь избегает 21:10?"
          : suspect.suspectId === "suspect_mara"
            ? "Назовите часть, которую вы пропустили: прототип всё ещё был там после 21:05?"
            : suspect.suspectId === "suspect_theo"
              ? "Ваша паника объясняет камеру. Чего она не объясняет?"
              : "Хватит уходить в общие факты. Назовите звук и направление.",
        firstUnlockedClue ? `Меня тревожит эта улика: ${firstUnlockedClue}. Что скажете?` : "Что другой подозреваемый сказал бы о вас?",
        "Назовите одну деталь, которую можно проверить."
      ],
      final: () => [
        "Какую одну минуту в вашей истории мне проверить?",
        "Если вы невиновны, кому выгодна ваша путаница?",
        "Последний шанс: исправьте то, что сказали раньше."
      ]
    }
  }
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function localizePublicFact(fact: PublicFact, locale: Locale): PublicFact {
  return {
    ...fact,
    text: getDictionary(locale).case.publicFacts[fact.factId] ?? fact.text
  };
}

export function localizeCase(gameCase: GameState["case"], locale: Locale): GameState["case"] {
  const dictionary = getDictionary(locale);
  return {
    ...gameCase,
    title: dictionary.case.title,
    publicBrief: dictionary.case.publicBrief,
    setting: dictionary.case.setting,
    publicFacts: gameCase.publicFacts.map((fact) => localizePublicFact(fact, locale))
  };
}

export function localizeSuspect(suspect: Suspect, locale: Locale): Suspect {
  const localized = getDictionary(locale).suspects[suspect.suspectId];
  return {
    ...suspect,
    displayName: localized?.displayName ?? suspect.displayName,
    publicProfile: localized?.publicProfile ?? suspect.publicProfile,
    publicMask: localized?.publicMask ?? suspect.publicMask,
    privateKnowledge: {
      ...suspect.privateKnowledge,
      allowedFalseClaims: localized?.falseClaims ?? suspect.privateKnowledge.allowedFalseClaims
    }
  };
}

export function localizeClue(clue: Clue, locale: Locale): Clue {
  return {
    ...clue,
    publicText: getDictionary(locale).clues[clue.clueId] ?? clue.publicText
  };
}

export function localizeMotive(motiveId: string, motive: Motive, locale: Locale): Motive {
  return {
    ...motive,
    label: getDictionary(locale).motives[motiveId] ?? motive.label
  };
}

export function localizeTimelineEvent(event: TimelineEvent, locale: Locale): TimelineEvent {
  return {
    ...event,
    event: getDictionary(locale).timeline[event.clueId] ?? event.event
  };
}

export function localizeGameState(state: GameState, locale: Locale): GameState {
  return {
    ...state,
    case: localizeCase(state.case, locale),
    truthTable: {
      ...state.truthTable,
      trueTimeline: state.truthTable.trueTimeline.map((event) => localizeTimelineEvent(event, locale)),
      motiveMap: Object.fromEntries(
        Object.entries(state.truthTable.motiveMap).map(([motiveId, motive]) => [
          motiveId,
          localizeMotive(motiveId, motive, locale)
        ])
      )
    },
    suspects: Object.fromEntries(
      Object.entries(state.suspects).map(([suspectId, suspect]) => [suspectId, localizeSuspect(suspect, locale)])
    ),
    clues: Object.fromEntries(Object.entries(state.clues).map(([clueId, clue]) => [clueId, localizeClue(clue, locale)]))
  };
}
