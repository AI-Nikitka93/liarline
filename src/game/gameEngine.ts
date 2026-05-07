import type { NpcTurnRequest, NpcTurnResult } from "../ai/contracts.ts";
import type { Locale } from "../i18n/dictionaries";
import {
  getDictionary,
  localizeCase,
  localizeClue,
  localizeMotive,
  localizeSuspect,
  localizeTimelineEvent
} from "../i18n/dictionaries";
import { FIRST_INTERROGATION_SUSPECT_ID, seedGameState } from "./seedCase";
import type { AccusationInput, DetectiveRating, GameState, Outcome, Suspect, TranscriptEntry } from "./types";

const SAVE_SCHEMA_VERSION = "1.0.5";
const GUARANTEED_CONTRADICTION_ID = "contradiction_camera_vs_cart";
const GUARANTEED_CAMERA_CLUE_ID = "clue_camera_fault";
const CART_PUBLIC_FACT_ID = "public_003";

export function cloneGameState(state: GameState): GameState {
  return structuredClone(state);
}

export function createInitialGameState(): GameState {
  const createdAt = new Date().toISOString();
  return {
    ...cloneGameState(seedGameState),
    createdAt,
    updatedAt: createdAt
  };
}

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const maybeState = value as Partial<GameState>;
  return (
    maybeState.schemaVersion === SAVE_SCHEMA_VERSION &&
    typeof maybeState.saveId === "string" &&
    typeof maybeState.phase === "string" &&
    Boolean(maybeState.case) &&
    Boolean(maybeState.rules) &&
    Boolean(maybeState.truthTable) &&
    Boolean(maybeState.suspects) &&
    Boolean(maybeState.clues) &&
    Boolean(maybeState.deduction)
  );
}

export function startInterrogation(state: GameState): GameState {
  if (state.phase !== "briefing") return state;
  return touchState({
    ...state,
    phase: "interrogation"
  });
}

export function goToAccusation(state: GameState): GameState {
  const minimumMet = state.transcript.length >= state.rules.minimumQuestionsBeforeAccusation;
  const noActionPointsLeft = state.rules.actionPointsRemaining <= 0;
  if (state.phase !== "interrogation" || (!minimumMet && !noActionPointsLeft)) return state;
  return touchState({
    ...state,
    phase: "accusation"
  });
}

export function returnToInterrogation(state: GameState): GameState {
  if (state.phase !== "accusation" || state.rules.actionPointsRemaining <= 0) return state;
  return touchState({
    ...state,
    phase: "interrogation"
  });
}

export function getSuspectList(state: GameState): Suspect[] {
  return Object.values(state.suspects);
}

export function getActiveSuspect(state: GameState, suspectId: string): Suspect {
  const suspect = state.suspects[suspectId];
  if (!suspect) throw new Error(`Unknown suspect: ${suspectId}`);
  return suspect;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getRecentTranscriptForSuspect(state: GameState, suspectId: string): Array<{ questionText: string; answerText: string }> {
  return state.transcript
    .filter((entry) => entry.suspectId === suspectId)
    .slice(-state.rules.recentTranscriptLimitPerNpc)
    .map((entry) => ({
      questionText: entry.questionText,
      answerText: entry.answerText
    }));
}

export function getRevealableClueIds(state: GameState, suspectId: string): string[] {
  const suspect = getActiveSuspect(state, suspectId);
  const pressureUnlocked = new Set(
    suspect.privateKnowledge.pressureUnlocks
      .filter((unlock) => suspect.visibleState.suspicion >= unlock.afterSuspicionAtLeast)
      .map((unlock) => unlock.unlockClueId)
  );

  return suspect.privateKnowledge.knowsClueIds.filter((clueId) => {
    const clue = state.clues[clueId];
    if (!clue || clue.unlocked) return false;
    const lockedUntilPressure = suspect.privateKnowledge.mustNotRevealClueIdsBeforePressure.includes(clueId);
    return !lockedUntilPressure || pressureUnlocked.has(clueId);
  });
}

export function buildNpcTurnRequest(state: GameState, suspectId: string, questionText: string, locale: Locale = "en"): NpcTurnRequest {
  const suspect = localizeSuspect(getActiveSuspect(state, suspectId), locale);
  const localizedCase = localizeCase(state.case, locale);
  const normalizedQuestion = normalizeQuestion(questionText, state.rules.maxQuestionChars);
  const revealableClueIds = getRevealableClueIds(state, suspectId);
  const dictionary = getDictionary(locale);

  return {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    requestId: `turn_${Date.now()}_${state.transcript.length + 1}`,
    casePublic: {
      caseId: localizedCase.caseId,
      title: localizedCase.title,
      publicBrief: localizedCase.publicBrief,
      publicFacts: localizedCase.publicFacts.slice(0, 6).map((fact) => fact.text)
    },
    npc: {
      suspectId: suspect.suspectId,
      displayName: suspect.displayName,
      publicProfile: suspect.publicMask,
      performanceRole: suspect.performanceRole,
      lieArchetype: suspect.lieArchetype,
      pressureState: getPressureState(state, suspect.suspectId),
      mood: suspect.visibleState.mood,
      suspicion: suspect.visibleState.suspicion,
      questionsAsked: suspect.visibleState.questionsAsked,
      allowedKnowledge: {
        knownPublicClues: state.playerNotebook.unlockedClueIds
          .filter((clueId) => suspect.privateKnowledge.knowsClueIds.includes(clueId))
          .map((clueId) => state.clues[clueId] ? localizeClue(state.clues[clueId], locale).publicText : null)
          .filter((text): text is string => Boolean(text))
          .slice(0, 6),
        knownPrivateClues: suspect.privateKnowledge.knowsClueIds
          .map((clueId) => state.clues[clueId])
          .filter((clue) => Boolean(clue))
          .slice(0, 3)
          .map((clue) => localizeClue(clue, locale))
          .map((clue) => ({
            clueId: clue.clueId,
            npcFacingText: clue.publicText.slice(0, 160)
          })),
        allowedFalseClaims: suspect.privateKnowledge.allowedFalseClaims.slice(0, 4),
        revealableClueIdsThisTurn: revealableClueIds.slice(0, 2)
      }
    },
    turn: {
      roundIndex: state.rules.roundIndex,
      actionPointsRemaining: state.rules.actionPointsRemaining,
      playerQuestion: normalizedQuestion,
      responseLocale: locale,
      responseLanguage: dictionary.aiResponseLanguage,
      recentTranscript: getRecentTranscriptForSuspect(state, suspectId)
    },
    outputRules: {
      maxAnswerChars: 260,
      allowedTruthfulness: ["truth", "partial", "lie", "evasive"],
      suspicionDeltaMin: -2,
      suspicionDeltaMax: 4,
      allowedRevealedClueIds: revealableClueIds.slice(0, 2)
    }
  };
}

export function validateQuestionAction(state: GameState, suspectId: string, questionText: string, locale: Locale = "en"): string | null {
  const suspect = state.suspects[suspectId];
  const question = questionText.trim();
  const validation = getDictionary(locale).validation;

  if (state.phase !== "interrogation") return validation.interrogationUnavailable;
  if (state.rules.actionPointsRemaining <= 0) return validation.noActionPoints;
  if (state.rules.roundIndex >= state.rules.maxRounds) return validation.roundsFinished;
  if (!suspect) return validation.suspectMissing;
  if (suspect.visibleState.questionsAsked >= state.rules.maxQuestionsPerSuspect) {
    return validation.suspectQuestionCap;
  }
  if (!question) return validation.emptyQuestion;
  if (question.length > state.rules.maxQuestionChars) {
    return validation.questionTooLong(state.rules.maxQuestionChars);
  }
  return null;
}

export function applyNpcTurnResult(
  state: GameState,
  suspectId: string,
  questionText: string,
  result: NpcTurnResult
): GameState {
  const suspect = getActiveSuspect(state, suspectId);
  const allowedRevealedClueIds = new Set(getRevealableClueIds(state, suspectId));
  const response = result.response;
  const isDegradedAiTurn = result.source === "fallback";
  const modelRevealedClueId =
    response.revealed_clue_id && allowedRevealedClueIds.has(response.revealed_clue_id)
      ? response.revealed_clue_id
      : null;
  const engineGuaranteedClueId =
    shouldGuaranteeFirstContradictionClue(state, suspectId, questionText) && allowedRevealedClueIds.has(GUARANTEED_CAMERA_CLUE_ID)
      ? GUARANTEED_CAMERA_CLUE_ID
      : null;
  const revealedClueId = isDegradedAiTurn ? null : modelRevealedClueId || engineGuaranteedClueId;
  const suspicionDelta = isDegradedAiTurn ? 0 : clamp(response.suspicion_delta, -2, 4);
  const newSuspicion = clamp(
    suspect.visibleState.suspicion + suspicionDelta,
    state.rules.suspicionMin,
    state.rules.suspicionMax
  );
  const nextClues = cloneRecord(state.clues);
  const nextNotebook = cloneGameState(state).playerNotebook;
  const nextSuspects = cloneRecord(state.suspects);
  let nextDeduction = structuredClone(state.deduction);
  const nextSuspect = structuredClone(suspect);
  const now = new Date().toISOString();

  if (revealedClueId && nextClues[revealedClueId]) {
    nextClues[revealedClueId] = {
      ...nextClues[revealedClueId],
      unlocked: true
    };
    if (!nextNotebook.unlockedClueIds.includes(revealedClueId)) {
      nextNotebook.unlockedClueIds = [...nextNotebook.unlockedClueIds, revealedClueId];
    }
    if (!nextSuspect.visibleState.revealedClueIds.includes(revealedClueId)) {
      nextSuspect.visibleState.revealedClueIds = [...nextSuspect.visibleState.revealedClueIds, revealedClueId];
    }
  }

  if (response.notebook_hint.trim()) {
    nextNotebook.suspectNotes = {
      ...nextNotebook.suspectNotes,
      [suspectId]: [...(nextNotebook.suspectNotes[suspectId] || []), response.notebook_hint.trim()].slice(-4)
    };
  }

  nextSuspect.visibleState = {
    ...nextSuspect.visibleState,
    suspicion: newSuspicion,
    questionsAsked: nextSuspect.visibleState.questionsAsked + 1,
    mood: response.npc_mood || nextSuspect.visibleState.mood
  };
  nextSuspects[suspectId] = nextSuspect;

  if (shouldTriggerGuaranteedContradiction(state, nextNotebook, nextDeduction)) {
    const deductionEvent = applyGuaranteedContradiction(nextSuspects, nextNotebook, nextDeduction, state);
    nextDeduction = deductionEvent.deduction;
  }

  const transcriptEntry: TranscriptEntry = {
    turnId: result.requestId,
    roundIndex: state.rules.roundIndex,
    suspectId,
    questionText: normalizeQuestion(questionText, state.rules.maxQuestionChars),
    answerText: response.answer_text,
    revealedClueId,
    suspicionDeltaApplied: suspicionDelta,
    createdAt: now,
    source: result.source,
    latencyMs: result.meta.latencyMs,
    providerStatus: result.meta.providerStatus,
    fallbackReason: result.meta.fallbackReason,
    truthfulness: response.truthfulness,
    contradictionRisk: response.contradiction_risk,
    notebookHint: response.notebook_hint
  };

  const nextTranscript = [...state.transcript, transcriptEntry];
  const actionPointsRemaining = isDegradedAiTurn ? state.rules.actionPointsRemaining : Math.max(0, state.rules.actionPointsRemaining - 1);
  const roundIndex = Math.min(state.rules.maxRounds, Math.floor(nextTranscript.length / 3));
  const shouldAccuse = actionPointsRemaining <= 0 || roundIndex >= state.rules.maxRounds;

  return touchState({
    ...state,
    phase: shouldAccuse ? "accusation" : state.phase,
    rules: {
      ...state.rules,
      actionPointsRemaining,
      roundIndex
    },
    suspects: nextSuspects,
    clues: nextClues,
    deduction: nextDeduction,
    playerNotebook: nextNotebook,
    transcript: nextTranscript
  });
}

export function unlockClue(state: GameState, clueId: string): GameState {
  const clue = state.clues[clueId];
  if (!clue || clue.unlocked) return state;
  const nextClues = {
    ...state.clues,
    [clueId]: {
      ...clue,
      unlocked: true
    }
  };
  const nextNotebook = {
    ...structuredClone(state.playerNotebook),
    unlockedClueIds: [...state.playerNotebook.unlockedClueIds, clueId]
  };
  const nextSuspects = cloneRecord(state.suspects);
  let nextDeduction = structuredClone(state.deduction);

  if (shouldTriggerGuaranteedContradiction(state, nextNotebook, nextDeduction)) {
    const deductionEvent = applyGuaranteedContradiction(nextSuspects, nextNotebook, nextDeduction, state);
    nextDeduction = deductionEvent.deduction;
  }

  return touchState({
    ...state,
    suspects: nextSuspects,
    clues: nextClues,
    playerNotebook: nextNotebook,
    deduction: nextDeduction
  });
}

export function submitAccusation(state: GameState, input: AccusationInput, locale: Locale = "en"): GameState {
  const culpritCorrect = input.accusedSuspectId === state.truthTable.culpritSuspectId;
  const motiveCorrect = input.selectedMotiveId === state.truthTable.trueMotiveId;
  const validEvidence = new Set(state.truthTable.validEvidenceForPerfectWin);
  const evidenceScore = input.selectedEvidenceClueIds.filter((clueId) => validEvidence.has(clueId)).length;
  const outcome: Outcome = culpritCorrect && motiveCorrect && evidenceScore >= 2
    ? "perfect_win"
    : culpritCorrect
      ? "partial_win"
      : "loss";
  const detectiveRating = getDetectiveRating(outcome, state, evidenceScore);

  return touchState({
    ...state,
    phase: "resolution",
    deduction: {
      ...state.deduction,
      accusationAttemptsRemaining: 0
    },
    accusation: {
      submitted: true,
      accusedSuspectId: input.accusedSuspectId,
      selectedMotiveId: input.selectedMotiveId,
      selectedEvidenceClueIds: input.selectedEvidenceClueIds
    },
    resolution: {
      outcome,
      culpritCorrect,
      motiveCorrect,
      evidenceScore,
      finalText: getResolutionText(outcome, locale),
      detectiveRating,
      reverseReconstructionStepIds: getReverseReconstructionStepIds(outcome)
    }
  });
}

export function getSuggestedQuestions(state: GameState, suspectId: string, locale: Locale = "en"): string[] {
  const suspect = localizeSuspect(getActiveSuspect(state, suspectId), locale);
  const round = state.rules.roundIndex;
  const localizedState = {
    ...state,
    case: localizeCase(state.case, locale)
  };
  const unlockedClues = state.playerNotebook.unlockedClueIds
    .map((clueId) => state.clues[clueId] ? localizeClue(state.clues[clueId], locale).publicText : null)
    .filter((text): text is string => Boolean(text));
  const dictionary = getDictionary(locale);
  const base = dictionary.questions.base(localizedState, suspect);
  const pressure = dictionary.questions.pressure(localizedState, suspect, unlockedClues[0] || null);
  const final = dictionary.questions.final(localizedState, suspect);
  const pool = round <= 0 ? base : round === 1 ? pressure : final;
  return pool.map((question) => question.slice(0, state.rules.maxQuestionChars));
}

export function canGoToAccusation(state: GameState): boolean {
  return (
    state.phase === "interrogation" &&
    (state.transcript.length >= state.rules.minimumQuestionsBeforeAccusation || state.rules.actionPointsRemaining <= 0)
  );
}

export function canUseDeadEndHint(state: GameState): boolean {
  return (
    state.phase === "interrogation" &&
    state.deduction.collapseTriggered &&
    !state.deduction.deadEndHintUsed &&
    state.transcript.length >= state.rules.minimumQuestionsBeforeAccusation &&
    state.rules.actionPointsRemaining <= state.rules.actionPointsMax - 3
  );
}

export function useDeadEndHint(state: GameState, locale: Locale = "en"): GameState {
  if (!canUseDeadEndHint(state)) return state;
  return touchState({
    ...state,
    deduction: {
      ...state.deduction,
      deadEndHintUsed: true,
      deadEndHint: getDictionary(locale).ui.deadEndHintText
    }
  });
}

function touchState(state: GameState): GameState {
  return {
    ...state,
    updatedAt: new Date().toISOString()
  };
}

function getPressureState(state: GameState, suspectId: string): "ordinary" | "evidence" | "contradiction" {
  if (state.deduction.collapseTriggered && state.deduction.personaShiftSuspectId === suspectId) return "contradiction";
  const suspect = state.suspects[suspectId];
  if (!suspect) return "ordinary";
  return suspect.visibleState.revealedClueIds.length > 0 || state.playerNotebook.unlockedClueIds.some((clueId) => state.clues[clueId]?.sourceSuspectIds.includes(suspectId))
    ? "evidence"
    : "ordinary";
}

function shouldGuaranteeFirstContradictionClue(state: GameState, suspectId: string, questionText: string): boolean {
  if (suspectId !== FIRST_INTERROGATION_SUSPECT_ID) return false;
  const suspect = state.suspects[suspectId];
  if (!suspect || suspect.visibleState.questionsAsked > 0) return false;
  if (state.clues[GUARANTEED_CAMERA_CLUE_ID]?.unlocked) return false;
  const normalized = questionText.toLowerCase();
  return normalized.includes("camera") || normalized.includes("камера");
}

function shouldTriggerGuaranteedContradiction(
  state: GameState,
  notebook: GameState["playerNotebook"],
  deduction: GameState["deduction"]
): boolean {
  return (
    notebook.unlockedClueIds.includes(GUARANTEED_CAMERA_CLUE_ID) &&
    state.case.publicFacts.some((fact) => fact.factId === CART_PUBLIC_FACT_ID) &&
    !deduction.triggeredContradictionIds.includes(GUARANTEED_CONTRADICTION_ID)
  );
}

function applyGuaranteedContradiction(
  suspects: GameState["suspects"],
  notebook: GameState["playerNotebook"],
  deduction: GameState["deduction"],
  state: GameState
): { deduction: GameState["deduction"] } {
  if (!notebook.contradictions.includes(GUARANTEED_CONTRADICTION_ID)) {
    notebook.contradictions = [...notebook.contradictions, GUARANTEED_CONTRADICTION_ID];
  }

  const theo = suspects.suspect_theo;
  const ivo = suspects.suspect_ivo;
  const mara = suspects.suspect_mara;
  const lena = suspects.suspect_lena;

  if (theo) {
    theo.visibleState = {
      ...theo.visibleState,
      suspicion: clamp(theo.visibleState.suspicion - 8, state.rules.suspicionMin, state.rules.suspicionMax),
      mood: "shaken"
    };
  }

  if (ivo) {
    ivo.visibleState = {
      ...ivo.visibleState,
      suspicion: clamp(ivo.visibleState.suspicion + 18, state.rules.suspicionMin, state.rules.suspicionMax),
      mood: "panicking"
    };
  }

  if (mara) {
    mara.visibleState = {
      ...mara.visibleState,
      suspicion: clamp(mara.visibleState.suspicion - 3, state.rules.suspicionMin, state.rules.suspicionMax)
    };
  }

  if (lena) {
    lena.visibleState = {
      ...lena.visibleState,
      suspicion: clamp(lena.visibleState.suspicion - 2, state.rules.suspicionMin, state.rules.suspicionMax)
    };
  }

  notebook.suspectNotes = {
    ...notebook.suspectNotes,
    suspect_ivo: [...(notebook.suspectNotes.suspect_ivo || []), "The cart log matters more than Theo's broken camera."].slice(-4),
    suspect_theo: [...(notebook.suspectNotes.suspect_theo || []), "Camera panic explains missing footage, not the cart leaving later."].slice(-4)
  };

  return {
    deduction: {
      ...deduction,
      triggeredContradictionIds: [...deduction.triggeredContradictionIds, GUARANTEED_CONTRADICTION_ID],
      collapseTriggered: true,
      collapseFocusSuspectId: "suspect_ivo",
      personaShiftSuspectId: "suspect_ivo",
      theoryConfidence: "strong",
      suspicionSignals: deduction.suspicionSignals.map((signal) =>
        signal.signalId === "signal_theo_timeline_mismatch"
          ? { ...signal, resolved: true }
          : signal
      )
    }
  };
}

function cloneRecord<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, structuredClone(value)])) as Record<string, T>;
}

function normalizeQuestion(questionText: string, maxLength: number): string {
  return questionText.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function getLocalizedMotiveMap(state: GameState, locale: Locale): GameState["truthTable"]["motiveMap"] {
  return Object.fromEntries(
    Object.entries(state.truthTable.motiveMap).map(([motiveId, motive]) => [motiveId, localizeMotive(motiveId, motive, locale)])
  );
}

export function getLocalizedTimeline(state: GameState, locale: Locale): GameState["truthTable"]["trueTimeline"] {
  return state.truthTable.trueTimeline.map((event) => localizeTimelineEvent(event, locale));
}

function getResolutionText(outcome: Outcome, locale: Locale): string {
  return getDictionary(locale).resolutionText[outcome];
}

function getDetectiveRating(outcome: Outcome, state: GameState, evidenceScore: number): DetectiveRating {
  if (outcome === "perfect_win" && state.deduction.triggeredContradictionIds.includes(GUARANTEED_CONTRADICTION_ID)) {
    return "sharp";
  }
  if (outcome === "perfect_win") return "careful";
  if (outcome === "partial_win" || evidenceScore > 0) return "reckless";
  return "misled";
}

function getReverseReconstructionStepIds(outcome: Outcome): string[] {
  if (outcome === "loss") {
    return [
      "recon_camera_break",
      "recon_cart_log",
      "recon_ivo_gap",
      "recon_wrong_verdict"
    ];
  }
  return [
    "recon_camera_break",
    "recon_cart_log",
    "recon_ivo_gap",
    "recon_final_verdict"
  ];
}
