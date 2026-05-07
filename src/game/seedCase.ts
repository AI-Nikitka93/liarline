import type { GameState } from "./types";

const NOW = "2026-05-05T00:00:00.000Z";
export const FIRST_INTERROGATION_SUSPECT_ID = "suspect_theo";

export const seedGameState: GameState = {
  schemaVersion: "1.0.5",
  saveId: "save_2026_05_05_liarline_001",
  createdAt: NOW,
  updatedAt: NOW,
  rngSeed: "case_lab_001",
  phase: "briefing",
  case: {
    caseId: "case_lab_001",
    title: "The Missing Prototype",
    publicBrief: "A prototype vanished from the robotics lab between 21:00 and 21:15. Four people had access, but only one had the motive and the gap.",
    setting: "University robotics lab",
    timeWindow: {
      start: "21:00",
      end: "21:15"
    },
    publicFacts: [
      {
        factId: "public_001",
        text: "The prototype was last checked before 21:00."
      },
      {
        factId: "public_002",
        text: "A corridor camera stopped recording before the theft."
      },
      {
        factId: "public_003",
        text: "The storage door logs show one cart leaving the lab wing."
      }
    ]
  },
  rules: {
    maxRounds: 3,
    roundIndex: 0,
    actionPointsMax: 9,
    actionPointsRemaining: 9,
    minimumQuestionsBeforeAccusation: 3,
    maxQuestionsPerSuspect: 3,
    maxQuestionChars: 180,
    recentTranscriptLimitPerNpc: 2,
    suspicionMin: 0,
    suspicionMax: 100
  },
  truthTable: {
    culpritSuspectId: "suspect_ivo",
    trueMotiveId: "motive_debt",
    trueTimeline: [
      {
        time: "21:03",
        actorSuspectId: "suspect_theo",
        event: "Theo accidentally damages the corridor camera.",
        clueId: "clue_camera_fault"
      },
      {
        time: "21:07",
        actorSuspectId: "suspect_mara",
        event: "Mara sees the prototype still in the lab.",
        clueId: "clue_mara_saw_prototype"
      },
      {
        time: "21:10",
        actorSuspectId: "suspect_ivo",
        event: "Ivo removes the prototype with the lab cart.",
        clueId: "clue_ivo_gap"
      }
    ],
    validEvidenceForPerfectWin: ["clue_ivo_gap", "clue_debt_message"],
    motiveMap: {
      motive_debt: {
        label: "Debt pressure",
        ownerSuspectId: "suspect_ivo",
        isTrue: true
      },
      motive_rivalry: {
        label: "Research rivalry",
        ownerSuspectId: "suspect_mara",
        isTrue: false
      },
      motive_panic: {
        label: "Camera accident cover-up",
        ownerSuspectId: "suspect_theo",
        isTrue: false
      }
    }
  },
  suspects: {
    suspect_ivo: {
      suspectId: "suspect_ivo",
      displayName: "Ivo",
      publicProfile: "Calm lab treasurer who claims he was reviewing inventory.",
      publicMask: "Orderly treasurer with a clean inventory story.",
      lieArchetype: "direct_liar",
      performanceRole: "protective_liar",
      npcRole: "liar_culprit",
      isCulprit: true,
      publicMotiveIds: ["motive_debt"],
      privateKnowledge: {
        knowsClueIds: ["clue_ivo_gap", "clue_debt_message"],
        mustNotRevealClueIdsBeforePressure: ["clue_debt_message"],
        allowedFalseClaims: [
          "I was counting inventory in the break room.",
          "Mara had more access than I did.",
          "The cart log is only a routine inventory movement."
        ],
        pressureUnlocks: [
          {
            afterSuspicionAtLeast: 55,
            unlockClueId: "clue_debt_message"
          }
        ]
      },
      visibleState: {
        suspicion: 35,
        questionsAsked: 0,
        revealedClueIds: [],
        mood: "controlled"
      }
    },
    suspect_mara: {
      suspectId: "suspect_mara",
      displayName: "Mara",
      publicProfile: "Ambitious researcher who was near the lab that evening.",
      publicMask: "Rival researcher hiding an embarrassing reason to be nearby.",
      lieArchetype: "partial_truth",
      performanceRole: "motive_guardian",
      npcRole: "hides_motive",
      isCulprit: false,
      publicMotiveIds: ["motive_rivalry"],
      privateKnowledge: {
        knowsClueIds: ["clue_mara_saw_prototype", "clue_mara_rivalry"],
        mustNotRevealClueIdsBeforePressure: ["clue_mara_rivalry"],
        allowedFalseClaims: ["I left earlier than I did."],
        pressureUnlocks: [
          {
            afterSuspicionAtLeast: 45,
            unlockClueId: "clue_mara_saw_prototype"
          }
        ]
      },
      visibleState: {
        suspicion: 25,
        questionsAsked: 0,
        revealedClueIds: [],
        mood: "defensive"
      }
    },
    suspect_theo: {
      suspectId: "suspect_theo",
      displayName: "Theo",
      publicProfile: "Nervous technician responsible for lab equipment.",
      publicMask: "Nervous technician whose panic makes the first wrong theory tempting.",
      lieArchetype: "confused",
      performanceRole: "confused_witness",
      npcRole: "confused_innocent",
      isCulprit: false,
      publicMotiveIds: ["motive_panic"],
      privateKnowledge: {
        knowsClueIds: ["clue_camera_fault"],
        mustNotRevealClueIdsBeforePressure: [],
        allowedFalseClaims: ["I do not remember the exact minute."],
        pressureUnlocks: [
          {
            afterSuspicionAtLeast: 35,
            unlockClueId: "clue_camera_fault"
          }
        ]
      },
      visibleState: {
        suspicion: 20,
        questionsAsked: 0,
        revealedClueIds: [],
        mood: "nervous"
      }
    },
    suspect_lena: {
      suspectId: "suspect_lena",
      displayName: "Lena",
      publicProfile: "Direct witness who dislikes drama and wants the case closed.",
      publicMask: "Impatient witness who gives facts but refuses speculation.",
      lieArchetype: "evader",
      performanceRole: "direct_witness",
      npcRole: "honest_witness",
      isCulprit: false,
      publicMotiveIds: [],
      privateKnowledge: {
        knowsClueIds: ["clue_lena_heard_cart"],
        mustNotRevealClueIdsBeforePressure: [],
        allowedFalseClaims: [],
        pressureUnlocks: []
      },
      visibleState: {
        suspicion: 10,
        questionsAsked: 0,
        revealedClueIds: [],
        mood: "impatient"
      }
    }
  },
  clues: {
    clue_ivo_gap: {
      clueId: "clue_ivo_gap",
      publicText: "Ivo cannot account for several minutes near 21:10.",
      evidenceType: "timeline",
      sourceSuspectIds: ["suspect_ivo", "suspect_lena"],
      unlocked: false,
      isCritical: true
    },
    clue_debt_message: {
      clueId: "clue_debt_message",
      publicText: "A message hints Ivo needed money urgently.",
      evidenceType: "message",
      sourceSuspectIds: ["suspect_ivo"],
      unlocked: false,
      isCritical: true
    },
    clue_mara_saw_prototype: {
      clueId: "clue_mara_saw_prototype",
      publicText: "Mara saw the prototype after 21:05.",
      evidenceType: "statement",
      sourceSuspectIds: ["suspect_mara"],
      unlocked: false,
      isCritical: false
    },
    clue_camera_fault: {
      clueId: "clue_camera_fault",
      publicText: "Theo broke the camera before the theft.",
      evidenceType: "timeline",
      sourceSuspectIds: ["suspect_theo"],
      unlocked: false,
      isCritical: false
    },
    clue_lena_heard_cart: {
      clueId: "clue_lena_heard_cart",
      publicText: "Lena heard a cart roll toward the storage door.",
      evidenceType: "statement",
      sourceSuspectIds: ["suspect_lena"],
      unlocked: false,
      isCritical: false
    }
  },
  deduction: {
    guaranteedContradictionId: "contradiction_camera_vs_cart",
    geniusFactIds: ["clue_camera_fault", "public_003"],
    triggeredContradictionIds: [],
    collapseTriggered: false,
    collapseFocusSuspectId: null,
    personaShiftSuspectId: null,
    theoryConfidence: "weak",
    accusationAttemptsRemaining: 1,
    deadEndHintUsed: false,
    deadEndHint: null,
    suspicionSignals: [
      {
        signalId: "signal_theo_timeline_mismatch",
        suspectId: "suspect_theo",
        relatedFactIds: ["clue_camera_fault", "public_003"],
        resolved: false
      },
      {
        signalId: "signal_ivo_detail_unverified",
        suspectId: "suspect_ivo",
        relatedFactIds: ["public_003", "clue_ivo_gap"],
        resolved: false
      },
      {
        signalId: "signal_mara_statement_conflict",
        suspectId: "suspect_mara",
        relatedFactIds: ["clue_mara_saw_prototype", "clue_ivo_gap"],
        resolved: false
      }
    ]
  },
  playerNotebook: {
    unlockedClueIds: [],
    suspectNotes: {
      suspect_ivo: [],
      suspect_mara: [],
      suspect_theo: [],
      suspect_lena: []
    },
    contradictions: []
  },
  transcript: [],
  accusation: {
    submitted: false,
    accusedSuspectId: null,
    selectedMotiveId: null,
    selectedEvidenceClueIds: []
  },
  resolution: {
    outcome: null,
    culpritCorrect: null,
    motiveCorrect: null,
    evidenceScore: 0,
    finalText: null,
    detectiveRating: null,
    reverseReconstructionStepIds: []
  }
};
