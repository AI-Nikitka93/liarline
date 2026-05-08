"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AccusationInput, GameState } from "../game/types";
import type { Locale } from "../i18n/dictionaries";
import { DEFAULT_LOCALE, getDictionary } from "../i18n/dictionaries";
import { getBrowserOutcomeMonitor } from "../release/outcomeMonitor";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  canGoToAccusation,
  createInitialGameState,
  getSuggestedQuestions,
  goToAccusation,
  isGameState,
  returnToInterrogation,
  startInterrogation,
  submitAccusation,
  unlockClue,
  useDeadEndHint,
  validateQuestionAction
} from "../game/gameEngine";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../game/seedCase";
import { requestNpcTurn } from "../services/aiClient";

const SAVE_KEY = "liarline.save.v1";
const LOCALE_KEY = "liarline.locale.v1";

type GameStoreValue = {
  state: GameState;
  selectedSuspectId: string;
  notebookOpen: boolean;
  pendingQuestion: boolean;
  uiError: string | null;
  locale: Locale;
  hasSelectedLocale: boolean;
  setLocale: (locale: Locale) => void;
  setSelectedSuspectId: (suspectId: string) => void;
  setNotebookOpen: (open: boolean) => void;
  startGame: () => void;
  startFirstQuestion: () => Promise<void>;
  resetGame: () => void;
  askQuestion: (questionText: string) => Promise<void>;
  unlockClueById: (clueId: string) => void;
  revealDeadEndHint: () => void;
  goAccuse: () => void;
  goBackToInterrogation: () => void;
  submitFinalAccusation: (input: AccusationInput) => void;
};

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialGameState());
  const [selectedSuspectId, setSelectedSuspectId] = useState(FIRST_INTERROGATION_SUSPECT_ID);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hasSelectedLocale, setHasSelectedLocale] = useState(false);
  const pendingQuestionRef = useRef(false);
  const runVersionRef = useRef(0);
  const currentRequestAbortRef = useRef<AbortController | null>(null);

  const recordOutcome = (name: Parameters<NonNullable<ReturnType<typeof getBrowserOutcomeMonitor>>["record"]>[0], details: Record<string, unknown> = {}) => {
    getBrowserOutcomeMonitor()?.record(name, details);
  };

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(LOCALE_KEY);
    if (savedLocale === "en" || savedLocale === "ru") {
      setLocaleState(savedLocale);
      setHasSelectedLocale(true);
    }

    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isGameState(parsed)) {
        setState(parsed);
        setSelectedSuspectId(parsed.phase === "briefing" ? FIRST_INTERROGATION_SUSPECT_ID : Object.keys(parsed.suspects)[0] || FIRST_INTERROGATION_SUSPECT_ID);
        return;
      }
      moveCorruptSave(raw);
    } catch {
      moveCorruptSave(raw);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!hasSelectedLocale) return;
    window.localStorage.setItem(LOCALE_KEY, locale);
  }, [hasSelectedLocale, locale]);

  const value = useMemo<GameStoreValue>(
    () => ({
      state,
      selectedSuspectId,
      notebookOpen,
      pendingQuestion,
      uiError,
      locale,
      hasSelectedLocale,
      setLocale: (nextLocale) => {
        setLocaleState(nextLocale);
        setHasSelectedLocale(true);
        setUiError(null);
      },
      setSelectedSuspectId: (suspectId) => {
        if (state.suspects[suspectId]) {
          setSelectedSuspectId(suspectId);
          setUiError(null);
        }
      },
      setNotebookOpen,
      startGame: () => {
        setSelectedSuspectId(FIRST_INTERROGATION_SUSPECT_ID);
        setState((current) => startInterrogation(current));
        setUiError(null);
        recordOutcome("start_reached", { phase: "interrogation", locale });
      },
      startFirstQuestion: async () => {
        if (pendingQuestionRef.current) {
          setUiError(getDictionary(locale).ui.waitCurrentAnswer);
          return;
        }

        const interrogationState = startInterrogation(state);
        const firstQuestion = getSuggestedQuestions(interrogationState, FIRST_INTERROGATION_SUSPECT_ID, locale)[0];
        const validationError = validateQuestionAction(interrogationState, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, locale);
        if (validationError) {
          setUiError(validationError);
          return;
        }

        const payload = buildNpcTurnRequest(interrogationState, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, locale);
        const requestRunVersion = runVersionRef.current;
        const requestController = new AbortController();
        currentRequestAbortRef.current?.abort();
        currentRequestAbortRef.current = requestController;
        setSelectedSuspectId(FIRST_INTERROGATION_SUSPECT_ID);
        setState(interrogationState);
        recordOutcome("start_reached", { phase: "interrogation", locale });
        pendingQuestionRef.current = true;
        setPendingQuestion(true);
        setUiError(null);
        try {
          const result = await requestNpcTurn(payload, requestController.signal);
          if (requestRunVersion !== runVersionRef.current || requestController.signal.aborted) {
            return;
          }
          const nextState = applyNpcTurnResult(interrogationState, FIRST_INTERROGATION_SUSPECT_ID, firstQuestion, result);
          setState(nextState);
          recordOutcome("first_ai_answer", { source: result.source, latencyMs: result.meta.latencyMs });
          if (result.source === "fallback") {
            recordOutcome("fallback_used", { reason: result.meta.fallbackReason || "unknown" });
            recordOutcome("ai_fail", { reason: result.meta.fallbackReason || "unknown" });
          }
          if (!interrogationState.deduction.collapseTriggered && nextState.deduction.collapseTriggered) {
            recordOutcome("contradiction_reached", { contradictionId: nextState.deduction.guaranteedContradictionId });
          }
          if (nextState.deduction.collapseTriggered && nextState.deduction.collapseFocusSuspectId) {
            setSelectedSuspectId(nextState.deduction.collapseFocusSuspectId);
          }
          if (!result.ok) {
            setUiError(getDictionary(locale).ui.connectionFallback);
          }
        } finally {
          if (requestRunVersion === runVersionRef.current) {
            if (currentRequestAbortRef.current === requestController) {
              currentRequestAbortRef.current = null;
            }
            pendingQuestionRef.current = false;
            setPendingQuestion(false);
          }
        }
      },
      resetGame: () => {
        runVersionRef.current += 1;
        currentRequestAbortRef.current?.abort();
        currentRequestAbortRef.current = null;
        const freshState = createInitialGameState();
        setState(freshState);
        setSelectedSuspectId(FIRST_INTERROGATION_SUSPECT_ID);
        setNotebookOpen(false);
        pendingQuestionRef.current = false;
        setPendingQuestion(false);
        setUiError(null);
        recordOutcome("reset", { phase: state.phase });
      },
      askQuestion: async (questionText) => {
        const validationError = validateQuestionAction(state, selectedSuspectId, questionText, locale);
        if (pendingQuestionRef.current) {
          setUiError(getDictionary(locale).ui.waitCurrentAnswer);
          return;
        }
        if (validationError) {
          setUiError(validationError);
          return;
        }

        const payload = buildNpcTurnRequest(state, selectedSuspectId, questionText, locale);
        const requestRunVersion = runVersionRef.current;
        const requestController = new AbortController();
        currentRequestAbortRef.current?.abort();
        currentRequestAbortRef.current = requestController;
        pendingQuestionRef.current = true;
        setPendingQuestion(true);
        setUiError(null);
        try {
          const result = await requestNpcTurn(payload, requestController.signal);
          if (requestRunVersion !== runVersionRef.current || requestController.signal.aborted) {
            return;
          }
          const nextState = applyNpcTurnResult(state, selectedSuspectId, questionText, result);
          setState(nextState);
          if (state.transcript.length === 0 && nextState.transcript.length > 0) {
            recordOutcome("first_ai_answer", { source: result.source, latencyMs: result.meta.latencyMs });
          }
          if (result.source === "fallback") {
            recordOutcome("fallback_used", { reason: result.meta.fallbackReason || "unknown" });
            recordOutcome("ai_fail", { reason: result.meta.fallbackReason || "unknown" });
          }
          if (!state.deduction.collapseTriggered && nextState.deduction.collapseTriggered) {
            recordOutcome("contradiction_reached", { contradictionId: nextState.deduction.guaranteedContradictionId });
          }
          if (!state.deduction.collapseTriggered && nextState.deduction.collapseTriggered && nextState.deduction.collapseFocusSuspectId) {
            setSelectedSuspectId(nextState.deduction.collapseFocusSuspectId);
          }
          if (!result.ok) {
            setUiError(getDictionary(locale).ui.connectionFallback);
          }
        } finally {
          if (requestRunVersion === runVersionRef.current) {
            if (currentRequestAbortRef.current === requestController) {
              currentRequestAbortRef.current = null;
            }
            pendingQuestionRef.current = false;
            setPendingQuestion(false);
          }
        }
      },
      unlockClueById: (clueId) => setState((current) => unlockClue(current, clueId)),
      revealDeadEndHint: () => {
        setState((current) => useDeadEndHint(current, locale));
        setUiError(null);
      },
      goAccuse: () => {
        if (!canGoToAccusation(state)) {
          setUiError(getDictionary(locale).ui.minimumQuestions(state.rules.minimumQuestionsBeforeAccusation));
          recordOutcome("stuck", {
            phase: state.phase,
            transcriptLength: state.transcript.length,
            actionPointsRemaining: state.rules.actionPointsRemaining
          });
          return;
        }
        setState((current) => goToAccusation(current));
        setUiError(null);
      },
      goBackToInterrogation: () => {
        setState((current) => returnToInterrogation(current));
        setUiError(null);
      },
      submitFinalAccusation: (input) => {
        setState((current) => {
          const nextState = submitAccusation(current, input, locale);
          recordOutcome("accusation_submitted", {
            accusedSuspectId: input.accusedSuspectId,
            evidenceCount: input.selectedEvidenceClueIds.length
          });
          if (nextState.resolution.outcome === "loss") {
            recordOutcome("accusation_fail", { accusedSuspectId: input.accusedSuspectId });
          }
          recordOutcome("resolution_reached", {
            outcome: nextState.resolution.outcome,
            detectiveRating: nextState.resolution.detectiveRating
          });
          return nextState;
        });
        setUiError(null);
      }
    }),
    [hasSelectedLocale, locale, notebookOpen, pendingQuestion, selectedSuspectId, state, uiError]
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore() {
  const value = useContext(GameStoreContext);
  if (!value) throw new Error("useGameStore must be used inside GameStoreProvider");
  return value;
}

function moveCorruptSave(raw: string) {
  window.localStorage.setItem(`liarline.save.corrupt.${Date.now()}`, raw);
  window.localStorage.removeItem(SAVE_KEY);
}
