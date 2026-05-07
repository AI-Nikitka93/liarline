export type NpcRole = "liar_culprit" | "hides_motive" | "honest_witness" | "confused_innocent";

export type NpcPerformanceRole = "protective_liar" | "motive_guardian" | "direct_witness" | "confused_witness";

export type Truthfulness = "truth" | "partial" | "lie" | "evasive";

export type NpcTurnRequest = {
  provider: "groq";
  model: "llama-3.1-8b-instant";
  requestId: string;
  casePublic: {
    caseId: string;
    title: string;
    publicBrief: string;
    publicFacts: string[];
  };
  npc: {
    suspectId: string;
    displayName: string;
    publicProfile: string;
    performanceRole: NpcPerformanceRole;
    lieArchetype: "direct_liar" | "evader" | "partial_truth" | "confused";
    pressureState: "ordinary" | "evidence" | "contradiction";
    mood: string;
    suspicion: number;
    questionsAsked: number;
    allowedKnowledge: {
      knownPublicClues: string[];
      knownPrivateClues: Array<{
        clueId: string;
        npcFacingText: string;
      }>;
      allowedFalseClaims: string[];
      revealableClueIdsThisTurn: string[];
    };
  };
  turn: {
    roundIndex: number;
    actionPointsRemaining: number;
    playerQuestion: string;
    responseLocale?: "en" | "ru";
    responseLanguage?: string;
    recentTranscript: Array<{
      questionText: string;
      answerText: string;
    }>;
  };
  outputRules: {
    maxAnswerChars: number;
    allowedTruthfulness: Truthfulness[];
    suspicionDeltaMin: number;
    suspicionDeltaMax: number;
    allowedRevealedClueIds: string[];
  };
};

export type NpcTurnResponse = {
  answer_text: string;
  truthfulness: Truthfulness;
  suspicion_delta: number;
  revealed_clue_id: string | null;
  contradiction_risk: number;
  npc_mood: string;
  notebook_hint: string;
};

export type NpcTurnSource = "groq" | "fallback";

export type NpcTurnResult = {
  ok: boolean;
  source: NpcTurnSource;
  requestId: string;
  model: string;
  response: NpcTurnResponse;
  meta: {
    latencyMs: number;
    fallbackReason: string | null;
    providerStatus: number | null;
    retryAfter: string | null;
    validationWarnings: string[];
  };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const NPC_ROLES: NpcRole[] = [
  "liar_culprit",
  "hides_motive",
  "honest_witness",
  "confused_innocent"
];

export const NPC_PERFORMANCE_ROLES: NpcPerformanceRole[] = [
  "protective_liar",
  "motive_guardian",
  "direct_witness",
  "confused_witness"
];

export const TRUTHFULNESS_VALUES: Truthfulness[] = ["truth", "partial", "lie", "evasive"];
