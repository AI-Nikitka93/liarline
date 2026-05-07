import type { NpcPerformanceRole, NpcRole, NpcTurnResult } from "../ai/contracts.ts";

export type GamePhase = "briefing" | "interrogation" | "accusation" | "resolution";

export type Outcome = "perfect_win" | "partial_win" | "loss";

export type DetectiveRating = "sharp" | "careful" | "reckless" | "misled";

export type LieArchetype = "direct_liar" | "evader" | "partial_truth" | "confused";

export type TheoryConfidence = "weak" | "strong";

export type EvidenceType = "timeline" | "statement" | "message";

export type PublicFact = {
  factId: string;
  text: string;
};

export type CaseData = {
  caseId: string;
  title: string;
  publicBrief: string;
  setting: string;
  timeWindow: {
    start: string;
    end: string;
  };
  publicFacts: PublicFact[];
};

export type GameRules = {
  maxRounds: number;
  roundIndex: number;
  actionPointsMax: number;
  actionPointsRemaining: number;
  minimumQuestionsBeforeAccusation: number;
  maxQuestionsPerSuspect: number;
  maxQuestionChars: number;
  recentTranscriptLimitPerNpc: number;
  suspicionMin: number;
  suspicionMax: number;
};

export type TimelineEvent = {
  time: string;
  actorSuspectId: string;
  event: string;
  clueId: string;
};

export type Motive = {
  label: string;
  ownerSuspectId: string;
  isTrue: boolean;
};

export type TruthTable = {
  culpritSuspectId: string;
  trueMotiveId: string;
  trueTimeline: TimelineEvent[];
  validEvidenceForPerfectWin: string[];
  motiveMap: Record<string, Motive>;
};

export type PressureUnlock = {
  afterSuspicionAtLeast: number;
  unlockClueId: string;
};

export type Suspect = {
  suspectId: string;
  displayName: string;
  publicProfile: string;
  publicMask: string;
  lieArchetype: LieArchetype;
  performanceRole: NpcPerformanceRole;
  npcRole: NpcRole;
  isCulprit: boolean;
  publicMotiveIds: string[];
  privateKnowledge: {
    knowsClueIds: string[];
    mustNotRevealClueIdsBeforePressure: string[];
    allowedFalseClaims: string[];
    pressureUnlocks: PressureUnlock[];
  };
  visibleState: {
    suspicion: number;
    questionsAsked: number;
    revealedClueIds: string[];
    mood: string;
  };
};

export type Clue = {
  clueId: string;
  publicText: string;
  evidenceType: EvidenceType;
  sourceSuspectIds: string[];
  unlocked: boolean;
  isCritical: boolean;
};

export type Notebook = {
  unlockedClueIds: string[];
  suspectNotes: Record<string, string[]>;
  contradictions: string[];
};

export type TranscriptEntry = {
  turnId: string;
  roundIndex: number;
  suspectId: string;
  questionText: string;
  answerText: string;
  revealedClueId: string | null;
  suspicionDeltaApplied: number;
  createdAt: string;
  source: NpcTurnResult["source"];
  latencyMs: number;
  providerStatus: number | null;
  fallbackReason: string | null;
  truthfulness: string;
  contradictionRisk: number;
  notebookHint: string;
};

export type Accusation = {
  submitted: boolean;
  accusedSuspectId: string | null;
  selectedMotiveId: string | null;
  selectedEvidenceClueIds: string[];
};

export type Resolution = {
  outcome: Outcome | null;
  culpritCorrect: boolean | null;
  motiveCorrect: boolean | null;
  evidenceScore: number;
  finalText: string | null;
  detectiveRating: DetectiveRating | null;
  reverseReconstructionStepIds: string[];
};

export type SuspicionSignal = {
  signalId: string;
  suspectId: string;
  relatedFactIds: string[];
  resolved: boolean;
};

export type DeductionState = {
  guaranteedContradictionId: string;
  geniusFactIds: string[];
  triggeredContradictionIds: string[];
  collapseTriggered: boolean;
  collapseFocusSuspectId: string | null;
  personaShiftSuspectId: string | null;
  theoryConfidence: TheoryConfidence;
  accusationAttemptsRemaining: number;
  deadEndHintUsed: boolean;
  deadEndHint: string | null;
  suspicionSignals: SuspicionSignal[];
};

export type GameState = {
  schemaVersion: "1.0.5";
  saveId: string;
  createdAt: string;
  updatedAt: string;
  rngSeed: string;
  phase: GamePhase;
  case: CaseData;
  rules: GameRules;
  truthTable: TruthTable;
  suspects: Record<string, Suspect>;
  clues: Record<string, Clue>;
  deduction: DeductionState;
  playerNotebook: Notebook;
  transcript: TranscriptEntry[];
  accusation: Accusation;
  resolution: Resolution;
};

export type AccusationInput = {
  accusedSuspectId: string;
  selectedMotiveId: string;
  selectedEvidenceClueIds: string[];
};
