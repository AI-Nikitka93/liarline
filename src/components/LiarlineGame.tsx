"use client";

import { AlertTriangle, BookOpen, Check, FileText, Fingerprint, Gavel, MessageSquare, RotateCcw, Send, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS, getSuspectPortrait } from "../game/assets";
import { BUTTON_FEEDBACK_STATES, BUTTON_ROLE_SYSTEM, MICRO_EVENT_SYSTEM } from "../game/interactionVisualSystem";
import { getMoodVisual } from "../game/moodVisualSystem";
import { getScenarioInsert, type ScenarioInsertId } from "../game/scenarioVisuals";
import { FEEDBACK_CATEGORIES, createFeedbackEntry, saveFeedbackEntry, type FeedbackCategory } from "../release/feedbackIntake";
import {
  canGoToAccusation,
  canUseDeadEndHint,
  getLocalizedMotiveMap,
  getLocalizedTimeline,
  getSuggestedQuestions,
  getSuspectList
} from "../game/gameEngine";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../game/seedCase";
import type { GameState } from "../game/types";
import { useKeyboardInset } from "../hooks/useKeyboardInset";
import { getDictionary, localizeCase, localizeClue, localizeSuspect } from "../i18n/dictionaries";
import { useGameStore } from "../state/GameStore";
import { NotebookDrawer } from "./NotebookDrawer";
import { ActionPointPips, AppShell, NpcMoodFrame, PrimaryButton, SecondaryButton, SuspicionMeter, TopStrip } from "./ui";

export function LiarlineGame() {
  const { state, hasSelectedLocale } = useGameStore();
  useKeyboardInset();

  return (
    <AppShell>
      {!hasSelectedLocale ? (
        <LanguageEntryScreen />
      ) : (
        <>
          {state.phase === "briefing" && <BriefingScreen />}
          {state.phase === "interrogation" && <InterrogationScreen />}
          {state.phase === "accusation" && <AccusationScreen />}
          {state.phase === "resolution" && <ResolutionScreen />}
          <NotebookDrawer />
        </>
      )}
    </AppShell>
  );
}

function LanguageEntryScreen() {
  const { setLocale } = useGameStore();

  return (
    <div className="language-entry-screen grid min-h-[100dvh] place-items-center bg-[radial-gradient(circle_at_top,rgb(15_118_110_/_0.18),transparent_34%),linear-gradient(180deg,#080a0d,#10141a)] px-4 py-8">
      <section className="w-full max-w-[430px] rounded-liarline border border-line-500 bg-ink-850 p-5 shadow-terminal">
        <div className="rounded border border-forensic-500/60 bg-forensic-500/10 px-3 py-2 font-mono text-[11px] font-bold uppercase text-forensic-500">
          Liarline
        </div>
        <h1 className="mt-5 text-[30px] font-bold leading-9 text-text-50">Choose language / Выберите язык</h1>
        <p className="mt-3 text-[15px] leading-6 text-text-300">
          Detective game about interrogating AI suspects. AI can lie, but only evidence can convict.
        </p>
        <p className="mt-2 text-[15px] leading-6 text-text-300">
          Детективная игра про допрос AI-подозреваемых. AI может лгать, но обвиняют только улики.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className="min-h-14 rounded-liarline border border-forensic-500 bg-forensic-500 px-4 py-3 text-left text-[17px] font-bold text-ink-950 shadow-terminal focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            English
            <span className="mt-1 block font-mono text-[10px] uppercase text-ink-900/75">Start the case in English</span>
          </button>
          <button
            type="button"
            onClick={() => setLocale("ru")}
            className="min-h-14 rounded-liarline border border-line-500 bg-ink-900 px-4 py-3 text-left text-[17px] font-bold text-text-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Русский
            <span className="mt-1 block font-mono text-[10px] uppercase text-text-400">Начать дело на русском</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function BriefingScreen() {
  const { state, startFirstQuestion, setNotebookOpen, resetGame, locale, setLocale } = useGameStore();
  const dictionary = getDictionary(locale);
  const localizedCase = localizeCase(state.case, locale);
  const suspects = getSuspectList(state);
  const featuredSuspect = state.suspects[FIRST_INTERROGATION_SUSPECT_ID] || suspects[0];
  const localizedFeatured = localizeSuspect(featuredSuspect, locale);
  const featuredPortrait = getSuspectPortrait(localizedFeatured.suspectId);
  const featuredMoodVisual = getMoodVisual(localizedFeatured.visibleState.mood);

  return (
    <div className="min-h-[100dvh] visual-dna-interrogation">
      <TopStrip state={state} label={dictionary.phaseLabels.briefing} locale={locale} onRestart={resetGame} />
      <section className="space-y-3 px-4 py-3 pb-[calc(var(--safe-bottom)+92px)]">
        <div className="start-interrogation-surface first-viewport-visual-lock overflow-hidden rounded-liarline border border-line-500 bg-ink-850 shadow-terminal">
          <div className="suspect-first-hero relative h-64 overflow-hidden bg-ink-950" style={{ position: "relative" }}>
            <Image
              src={featuredPortrait || ASSETS.caseHero}
              alt={dictionary.ui.portraitAlt(localizedFeatured.displayName)}
              fill
              preload
              loading="eager"
              sizes="(max-width: 430px) 100vw, 430px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent" />
            <div className="absolute left-3 top-3 rounded border border-forensic-500/60 bg-ink-950/75 px-2 py-1 font-mono text-[11px] font-bold uppercase text-forensic-500">
              {dictionary.ui.visualThesisBadge}
            </div>
            <div className="absolute right-3 top-3 rounded border border-signal-500/60 bg-ink-950/75 px-2 py-1 font-mono text-[11px] font-bold uppercase text-signal-500">
              {dictionary.moods[localizedFeatured.visibleState.mood] ?? localizedFeatured.visibleState.mood}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.firstPressureTarget} · {localizedCase.setting}</p>
              <h1 className="mt-1 text-[30px] font-bold leading-8 text-text-50">{localizedFeatured.displayName}</h1>
              <p className="mt-2 max-w-[21rem] text-[15px] leading-[21px] text-text-100">{localizedFeatured.publicProfile}</p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-forensic-500" />
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{localizedCase.title}</p>
            </div>
            <p className="text-[16px] leading-[22px] text-text-100">{dictionary.ui.briefingPremise}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-line-700 bg-ink-950/70 p-2 font-mono text-[10px] font-bold uppercase leading-4 text-text-300">
                {dictionary.ui.window}: {localizedCase.timeWindow.start}-{localizedCase.timeWindow.end}
              </div>
              <div className="rounded border border-line-700 bg-ink-950/70 p-2 font-mono text-[10px] font-bold uppercase leading-4 text-text-300">
                {dictionary.ui.firstQuestionCost}
              </div>
            </div>
            <div className="rounded border border-signal-500/60 bg-signal-500/10 p-2 font-mono text-[10px] font-bold uppercase leading-4 text-signal-500">
              {dictionary.ui.coreHookLine}
            </div>
            <ScenarioInsertPanel
              id="briefing_tension"
              label={dictionary.ui.coreHookLine}
              caption={dictionary.ui.briefingPremise}
              className={featuredMoodVisual.className}
            />
            <section className="onboarding-rules-card rounded-liarline border border-forensic-500/60 bg-forensic-500/10 p-3">
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.onboardingTitle}</p>
              <p className="mt-2 text-[14px] font-bold leading-5 text-text-100">{dictionary.ui.onboardingGoal}</p>
              <div className="mt-3 grid gap-2">
                {dictionary.ui.onboardingRules.map((rule, index) => (
                  <div key={rule} className="grid grid-cols-[auto_1fr] gap-2 rounded border border-line-700 bg-ink-950/70 p-2">
                    <span className="grid h-6 w-6 place-items-center rounded border border-forensic-500 font-mono text-[10px] font-bold text-forensic-500">
                      {index + 1}
                    </span>
                    <p className="text-[13px] leading-5 text-text-200">{rule}</p>
                  </div>
                ))}
              </div>
            </section>
            <CaseProgressRail state={state} locale={locale} />
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold">{dictionary.ui.suspects}</h2>
            <LanguageToggle locale={locale} setLocale={setLocale} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {suspects.map((suspect) => (
              <NpcMoodFrame key={suspect.suspectId} suspect={suspect} locale={locale} />
            ))}
          </div>
        </section>
      </section>

      <div className="mobile-action-dock fixed inset-x-0 z-40 mx-auto max-w-[430px] border-t border-line-700 bg-ink-900/95 p-4 pb-[var(--safe-bottom)] backdrop-blur">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <PrimaryButton onClick={startFirstQuestion} className={`first-question-cta min-h-[64px] text-left shadow-terminal ${BUTTON_ROLE_SYSTEM.firstQuestion.className} ${MICRO_EVENT_SYSTEM.apSpent.className}`}>
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[17px]">{dictionary.ui.askFirstQuestion}</span>
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase text-ink-900/75">{dictionary.ui.firstQuestionSetup}</span>
          </PrimaryButton>
          <SecondaryButton onClick={() => setNotebookOpen(true)} aria-label={dictionary.ui.openNotebook} className={BUTTON_ROLE_SYSTEM.notebook.className}>
            <BookOpen className="h-5 w-5" />
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function InterrogationScreen() {
  const {
    state,
    selectedSuspectId,
    setSelectedSuspectId,
    setNotebookOpen,
    revealDeadEndHint,
    askQuestion,
    pendingQuestion,
    uiError,
    goAccuse,
    resetGame,
    locale,
    setLocale
  } = useGameStore();
  const dictionary = getDictionary(locale);
  const [customQuestion, setCustomQuestion] = useState("");
  const [dockHeight, setDockHeight] = useState(252);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const transcriptStackRef = useRef<HTMLDivElement | null>(null);
  const suspects = getSuspectList(state);
  const suspect = state.suspects[selectedSuspectId] || suspects[0];
  const localizedSuspect = localizeSuspect(suspect, locale);
  const suggestedQuestions = useMemo(() => getSuggestedQuestions(state, suspect.suspectId, locale), [locale, state, suspect.suspectId]);
  const transcript = state.transcript.slice(-6);
  const latestTranscriptEntry = state.transcript.at(-1);
  const isPersonaShifted = state.deduction.personaShiftSuspectId === suspect.suspectId;
  const accusationReady = canGoToAccusation(state);
  const countedTranscriptForAccusation = state.transcript.filter((entry) => entry.source !== "fallback").length;
  const currentAiStatusLabel =
    !pendingQuestion && latestTranscriptEntry?.source === "fallback" ? dictionary.ui.aiSourceFallback : dictionary.ui.aiSourceLive;
  const activeMoodVisual = getMoodVisual(suspect.visibleState.mood);
  const aiFeedbackClass = pendingQuestion
    ? BUTTON_FEEDBACK_STATES.waitingAi
    : latestTranscriptEntry?.source === "fallback"
      ? BUTTON_FEEDBACK_STATES.fallback
      : BUTTON_FEEDBACK_STATES.liveAnswer;

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const updateDockHeight = () => {
      const nextHeight = Math.ceil(dock.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--interrogation-dock-height", `${nextHeight}px`);
      setDockHeight(nextHeight);
    };

    updateDockHeight();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateDockHeight) : null;
    resizeObserver?.observe(dock);
    window.addEventListener("resize", updateDockHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateDockHeight);
      document.documentElement.style.removeProperty("--interrogation-dock-height");
    };
  }, [suggestedQuestions.length, pendingQuestion, uiError]);

  useEffect(() => {
    const scrollLatestTurnAboveDock = () => {
      const latestTurn = transcriptStackRef.current?.lastElementChild;
      const dock = dockRef.current;
      if (!latestTurn || !dock) return;

      const dockTop = dock.getBoundingClientRect().top;
      const latestTurnBottom = latestTurn.getBoundingClientRect().bottom;
      const safeGap = 16;
      const coveredByDock = latestTurnBottom - (dockTop - safeGap);

      if (coveredByDock > 0) {
        window.scrollBy({ top: Math.ceil(coveredByDock), behavior: "auto" });
      }
    };

    const frame = window.requestAnimationFrame(() => {
      scrollLatestTurnAboveDock();
      window.setTimeout(scrollLatestTurnAboveDock, 50);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [state.transcript.length, pendingQuestion, dockHeight, suggestedQuestions.length, uiError, selectedSuspectId]);

  async function submit(question: string) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || pendingQuestion) return;
    await askQuestion(trimmedQuestion);
    setCustomQuestion("");
  }

  return (
    <div
      className="min-h-[100dvh] bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgb(8 10 13 / 0.86), rgb(8 10 13 / 0.9)), url(${ASSETS.interrogationBackground})`
      }}
    >
      <TopStrip state={state} label={dictionary.phaseLabels.interrogation} locale={locale} onRestart={resetGame} />
      <section
        className="interrogation-scroll-area space-y-4 px-4 py-4"
        style={{
          paddingBottom: "calc(var(--interrogation-dock-height) + var(--safe-bottom) + var(--keyboard-inset) + 32px)"
        }}
      >
        <div
          className={`interrogation-composition-panel rounded-liarline border bg-ink-850 p-4 shadow-terminal ${
            isPersonaShifted ? `persona-shift-card persona-pulse border-signal-500 shadow-signal ${MICRO_EVENT_SYSTEM.personaShift.className}` : "border-line-500"
          }`}
          aria-live={isPersonaShifted ? "polite" : undefined}
        >
          {isPersonaShifted && (
            <div className="mb-3 space-y-2">
              <div className="rounded border border-signal-500 bg-signal-500/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-signal-500">
                {dictionary.ui.personaShift} · {dictionary.ui.pressureState}: {dictionary.moods[suspect.visibleState.mood] ?? suspect.visibleState.mood}
              </div>
              <p className="persona-reaction-line rounded border border-signal-500/60 bg-ink-950 px-3 py-2 text-[13px] font-bold leading-5 text-text-100">
                {dictionary.ui.personaReactionLine}
              </p>
              <ScenarioInsertPanel id="persona_shift" label={dictionary.ui.personaShift} caption={dictionary.ui.personaReactionLine} />
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div
                className={`portrait-anchor relative h-20 w-20 shrink-0 overflow-hidden rounded-liarline border bg-ink-950 ${
                  isPersonaShifted ? "border-signal-500" : "border-line-500"
                }`}
                style={{ position: "relative" }}
              >
              {getSuspectPortrait(suspect.suspectId) ? (
                  <Image
                    src={getSuspectPortrait(suspect.suspectId) || ""}
                    alt={dictionary.ui.portraitAlt(localizedSuspect.displayName)}
                    fill
                    sizes="80px"
                    className={`object-cover ${isPersonaShifted ? "saturate-[1.28] contrast-[1.08]" : "grayscale-[12%] saturate-[0.95]"}`}
                  />
                ) : null}
                <div className={`absolute inset-0 bg-gradient-to-t ${isPersonaShifted ? "from-signal-700/55 to-transparent" : "from-ink-950/45 to-transparent"}`} />
              </div>
              <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.activeSuspect}</p>
              <h2 className="mt-1 text-[20px] font-bold leading-[26px]">{localizedSuspect.displayName}</h2>
              <p className="mt-1 text-[13px] leading-5 text-text-400">{localizedSuspect.publicProfile}</p>
              </div>
            </div>
            <span className={`rounded border border-line-500 px-2 py-1 font-mono text-[11px] uppercase text-text-200 ${activeMoodVisual.className}`}>
              {dictionary.moods[suspect.visibleState.mood] ?? suspect.visibleState.mood}
            </span>
          </div>
          <div className="mt-4">
            <SuspicionMeter value={suspect.visibleState.suspicion} locale={locale} />
          </div>
          <div className="interrogation-status-strip witness-status-strip mt-3 grid grid-cols-3 gap-2">
            <div className={`rounded border border-cyan-400/60 bg-cyan-400/10 px-2 py-2 ${aiFeedbackClass}`}>
              <p className="font-mono text-[9px] font-bold uppercase text-cyan-300">{currentAiStatusLabel}</p>
              <p className="mt-1 text-[11px] leading-4 text-text-300">{pendingQuestion ? dictionary.ui.analyzingResponse : dictionary.ui.thinkingLine}</p>
            </div>
            <div className="rounded border border-forensic-500/50 bg-forensic-500/10 px-2 py-2">
              <p className="font-mono text-[9px] font-bold uppercase text-forensic-500">{dictionary.ui.actionPointsShort}</p>
              <p className="mt-1 text-[12px] font-bold text-text-100">{state.rules.actionPointsRemaining}/{state.rules.actionPointsMax}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotebookOpen(true)}
              className="rounded border border-line-500 bg-ink-900 px-2 py-2 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <p className="font-mono text-[9px] font-bold uppercase text-text-400">{dictionary.ui.notebook}</p>
              <p className="mt-1 text-[12px] font-bold text-text-100">{state.playerNotebook.unlockedClueIds.length}/{Object.keys(state.clues).length}</p>
            </button>
          </div>
        </div>

        <DeductionStatusPanel
          state={state}
          locale={locale}
          onOpenNotebook={() => setNotebookOpen(true)}
          onFocusCollapseSuspect={() => {
            if (state.deduction.collapseFocusSuspectId) {
              setSelectedSuspectId(state.deduction.collapseFocusSuspectId);
            }
          }}
          onRevealDeadEndHint={revealDeadEndHint}
        />

        <CaseProgressRail state={state} locale={locale} />

        <div className="flex justify-end">
          <LanguageToggle locale={locale} setLocale={setLocale} />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {suspects.map((item) => (
            <button
              key={item.suspectId}
              type="button"
              onClick={() => setSelectedSuspectId(item.suspectId)}
              aria-label={dictionary.ui.suspectSelectAria(localizeSuspect(item, locale).displayName, item.visibleState.suspicion)}
              aria-pressed={item.suspectId === suspect.suspectId}
              data-testid={`suspect-selector-${item.suspectId}`}
              className={`min-h-11 rounded-liarline border px-2 py-2 font-mono text-[11px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400 ${getMoodVisual(item.visibleState.mood).className} ${
                item.suspectId === suspect.suspectId
                  ? "border-forensic-500 bg-forensic-500 text-ink-950"
                  : "border-line-700 bg-ink-850 text-text-200"
              }`}
            >
              {localizeSuspect(item, locale).displayName.slice(0, 2)}
            </button>
          ))}
        </div>

        <div ref={transcriptStackRef} className="space-y-3" data-testid="transcript-stack">
          {state.transcript.length === 0 && (
            <div className="empty-chat-state rounded-liarline border border-line-700 bg-ink-850 p-4 text-[14px] leading-5 text-text-400">
              {dictionary.ui.emptyChat}
            </div>
          )}
          {transcript.map((entry) => {
            const entrySuspect = state.suspects[entry.suspectId] ? localizeSuspect(state.suspects[entry.suspectId], locale) : localizedSuspect;

            return (
            <div key={entry.turnId} className="transcript-turn evidence-thread-turn space-y-2">
              <div className="ml-auto max-w-[82%] rounded-liarline border border-line-500 bg-ink-700 p-3">
                <p className="font-mono text-[10px] font-bold uppercase text-forensic-500">{dictionary.ui.questionShort}</p>
                <p className="mt-1 text-[14px] leading-5">{entry.questionText}</p>
              </div>
              <div className={`transcript-evidence-thread max-w-[88%] rounded-liarline border border-line-700 bg-ink-850/95 p-3 backdrop-blur-sm ${entry.revealedClueId ? MICRO_EVENT_SYSTEM.clueOpened.className : ""}`}>
                <p className="font-mono text-[10px] font-bold uppercase text-text-400">
                  {entrySuspect.displayName}
                </p>
                <div className="ai-answer-badges witness-answer-badges mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase">
                  <span
                    className={`rounded border px-2 py-1 ${
                      entry.source === "groq"
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        : "border-signal-500 bg-signal-500/10 text-signal-500"
                    }`}
                  >
                    {entry.source === "groq" ? dictionary.ui.aiSourceLive : dictionary.ui.aiSourceFallback}
                  </span>
                  <span className="rounded border border-line-500 px-2 py-1 text-text-400">
                    {typeof entry.latencyMs === "number" ? dictionary.ui.aiLatency(entry.latencyMs) : dictionary.ui.aiLatencyUnknown}
                  </span>
                  {entry.fallbackReason && (
                    <span className="rounded border border-signal-500 px-2 py-1 text-signal-500">
                      {dictionary.ui.fallbackReason(entry.fallbackReason)}
                    </span>
                  )}
                </div>
                {entry.source === "fallback" && (
                  <div className="mt-2 rounded border border-signal-500/70 bg-signal-500/10 px-2 py-2">
                    <p className="font-mono text-[10px] font-bold uppercase text-signal-500">{dictionary.ui.degradedAiTitle}</p>
                    <p className="mt-1 text-[12px] leading-4 text-text-300">{dictionary.ui.degradedAiBody}</p>
                  </div>
                )}
                <p className="mt-1 text-[15px] leading-[22px] text-text-50">{entry.answerText}</p>
                {entry.revealedClueId && (
                  <span className="mt-3 inline-flex rounded border border-forensic-500 px-2 py-1 font-mono text-[11px] uppercase text-forensic-500">
                    {dictionary.ui.clueOpened} · {state.clues[entry.revealedClueId] ? localizeClue(state.clues[entry.revealedClueId], locale).publicText : dictionary.ui.redacted}
                  </span>
                )}
              </div>
            </div>
            );
          })}
          {pendingQuestion && (
            <div className="thinking-scan max-w-[88%] rounded-liarline border border-forensic-500 bg-ink-850/95 p-3 backdrop-blur-sm" role="status" aria-live="polite">
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.analyzingResponse}</p>
              <p className="mt-2 text-[14px] text-text-400">{dictionary.ui.thinkingLine}</p>
              <ScenarioInsertPanel id="first_ai_hesitation" label={dictionary.ui.analyzingResponse} caption={dictionary.ui.thinkingLine} />
            </div>
          )}
        </div>
      </section>

      <div ref={dockRef} className="mobile-action-dock fixed inset-x-0 z-40 mx-auto max-w-[430px] border-t border-line-700 bg-ink-900/95 p-4 pb-[var(--safe-bottom)] backdrop-blur">
        {uiError && (
          <div className="mb-3 rounded-liarline border border-cyan-400 bg-ink-850 p-2 text-[12px] text-cyan-400" role="alert">
            {uiError}
          </div>
        )}
        <div className="mb-3 grid gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              disabled={pendingQuestion}
              onClick={() => void submit(question)}
              data-testid="suggested-question-button"
              className="min-h-11 rounded-liarline border border-line-500 bg-ink-800 px-3 py-2 text-left text-[14px] font-bold leading-5 text-text-50 disabled:text-text-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase text-forensic-500">{dictionary.ui.questionActionCost}</span>
              <span>{question}</span>
            </button>
          ))}
        </div>
        <form
          className="grid grid-cols-[1fr_auto_auto] gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(customQuestion);
          }}
        >
          <input
            value={customQuestion}
            onChange={(event) => setCustomQuestion(event.target.value)}
            maxLength={state.rules.maxQuestionChars}
            disabled={pendingQuestion}
            aria-label={dictionary.ui.customQuestionAria}
            data-testid="custom-question-input"
            className="min-h-11 min-w-0 rounded-liarline border border-line-500 bg-ink-850 px-3 text-[15px] text-text-50 outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <SecondaryButton type="button" onClick={() => setNotebookOpen(true)} aria-label={dictionary.ui.openNotebook} title={dictionary.ui.openNotebook} className={BUTTON_ROLE_SYSTEM.notebook.className}>
            <BookOpen className="h-5 w-5" />
            <span className="sr-only">{dictionary.ui.openNotebook}</span>
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={pendingQuestion || !customQuestion.trim()} aria-label={dictionary.ui.sendQuestion} className={`${BUTTON_ROLE_SYSTEM.send.className} ${pendingQuestion ? BUTTON_FEEDBACK_STATES.waitingAi : ""}`}>
            <span className="sr-only">{dictionary.ui.sendQuestion} · {dictionary.ui.questionActionCost}</span>
            <Send className="h-5 w-5" />
          </PrimaryButton>
        </form>
        <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
          <div>
            <ActionPointPips remaining={state.rules.actionPointsRemaining} total={state.rules.actionPointsMax} locale={locale} />
            <p className="mt-2 font-mono text-[10px] font-bold uppercase text-text-400">
              {dictionary.ui.actionPointsRule(state.rules.actionPointsRemaining, state.rules.actionPointsMax)}
            </p>
            {!accusationReady && (
              <p className="mt-1 font-mono text-[10px] uppercase text-signal-500">
                {dictionary.ui.accuseLocked(countedTranscriptForAccusation, state.rules.minimumQuestionsBeforeAccusation)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={goAccuse}
            disabled={!accusationReady}
            data-testid="accusation-entry-button"
            className={`accusation-entry-button min-h-11 rounded-liarline border border-signal-500 px-3 font-mono text-[11px] font-bold uppercase text-signal-500 disabled:border-line-700 disabled:text-text-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${BUTTON_ROLE_SYSTEM.accuse.className} ${accusationReady ? BUTTON_FEEDBACK_STATES.contradiction : BUTTON_FEEDBACK_STATES.lockedAccusation}`}
          >
            {dictionary.ui.accuse}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccusationScreen() {
  const { state, submitFinalAccusation, setNotebookOpen, goBackToInterrogation, resetGame, locale, setLocale } = useGameStore();
  const dictionary = getDictionary(locale);
  const suspects = getSuspectList(state);
  const motives = Object.entries(getLocalizedMotiveMap(state, locale));
  const unlockedClues = state.playerNotebook.unlockedClueIds
    .map((clueId) => state.clues[clueId] ? localizeClue(state.clues[clueId], locale) : null)
    .filter((clue): clue is NonNullable<typeof clue> => Boolean(clue));
  const [accusedSuspectId, setAccusedSuspectId] = useState("");
  const [selectedMotiveId, setSelectedMotiveId] = useState("");
  const [selectedEvidenceClueIds, setSelectedEvidenceClueIds] = useState<string[]>([]);
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);
  const evidenceChainReady = selectedEvidenceClueIds.length >= 2;
  const canSubmitAccusation = Boolean(acknowledgedRisk && accusedSuspectId && selectedMotiveId);

  return (
    <div className="accusation-risk-screen final-risk-stage min-h-[100dvh]">
      <TopStrip state={state} label={dictionary.ui.finalAccusation} locale={locale} onRestart={resetGame} />
      <section className="space-y-5 px-4 py-5 pb-[calc(var(--safe-bottom)+260px)]">
        <div className="flex justify-end">
          <LanguageToggle locale={locale} setLocale={setLocale} />
        </div>
        <CaseProgressRail state={state} locale={locale} />
        <Panel title={dictionary.ui.accusationRisk} icon={<AlertTriangle className="h-5 w-5 text-signal-500" />}>
          <div className="grid gap-2 text-[14px] leading-5 text-text-300">
            <p>{dictionary.ui.attemptsRemaining(state.deduction.accusationAttemptsRemaining)}</p>
            <p>
              {dictionary.ui.theory}:{" "}
              <span className={state.deduction.theoryConfidence === "strong" ? "text-forensic-500" : "text-text-400"}>
                {state.deduction.theoryConfidence === "strong" ? dictionary.ui.strongTheory : dictionary.ui.weakTheory}
              </span>
            </p>
            <p className="text-[13px] text-text-400">{dictionary.ui.theoryMeaning}</p>
            <div className="rounded border border-signal-500/70 bg-signal-500/10 p-3">
              <p className="font-mono text-[11px] font-bold uppercase text-signal-500">{dictionary.ui.finalSubmitRisk}</p>
              <label className="risk-acknowledge-checkbox mt-3 flex min-h-11 items-center gap-3 rounded border border-line-700 bg-ink-950 px-3 py-2 text-[13px] font-bold text-text-100">
                <input
                  type="checkbox"
                  checked={acknowledgedRisk}
                  onChange={(event) => setAcknowledgedRisk(event.target.checked)}
                  className="h-5 w-5 accent-forensic-500"
                />
                <span>{dictionary.ui.acknowledgeRiskLabel}</span>
              </label>
              {!acknowledgedRisk && (
                <p className="mt-2 font-mono text-[10px] font-bold uppercase text-text-400">{dictionary.ui.submitDisabledRisk}</p>
              )}
              {acknowledgedRisk && !canSubmitAccusation && (
                <p className="mt-2 font-mono text-[10px] font-bold uppercase text-signal-500">{dictionary.ui.accusationMissingSelection}</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title={dictionary.ui.proofChecks} icon={<Check className="h-5 w-5 text-forensic-500" />}>
          <ScenarioInsertPanel id="accusation_risk" label={dictionary.ui.finalAccusation} caption={dictionary.ui.finalSubmitRisk} />
          <div className="final-proof-ledger">
          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-liarline border border-line-700 bg-ink-900 p-3">
              <span className="font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.proofSuspect}</span>
              <span className="text-[14px] font-bold text-text-50">
                {accusedSuspectId ? localizeSuspect(state.suspects[accusedSuspectId], locale).displayName : dictionary.ui.redacted}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-liarline border border-line-700 bg-ink-900 p-3">
              <span className="font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.proofMotive}</span>
              <span className="text-right text-[14px] font-bold text-text-50">
                {selectedMotiveId ? getLocalizedMotiveMap(state, locale)[selectedMotiveId]?.label ?? dictionary.ui.redacted : dictionary.ui.redacted}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-liarline border border-line-700 bg-ink-900 p-3">
              <span className="font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.proofEvidence}</span>
              <span className={`selected-evidence-counter ${evidenceChainReady ? "text-[14px] font-bold text-forensic-500" : "text-[14px] font-bold text-signal-500"}`}>
                {dictionary.ui.proofEvidenceSelected(selectedEvidenceClueIds.length)}
              </span>
            </div>
            <div className={`final-risk-warning rounded-liarline border p-3 ${
              evidenceChainReady ? "border-forensic-500/60 bg-forensic-500/10" : "border-signal-500/70 bg-signal-500/10"
            }`}>
              <p className={`font-mono text-[11px] font-bold uppercase ${evidenceChainReady ? "text-forensic-500" : "text-signal-500"}`}>
                {evidenceChainReady ? dictionary.ui.proofReady : dictionary.ui.proofIncomplete}
              </p>
              <p className="mt-1 text-[13px] leading-5 text-text-300">{dictionary.ui.selectedEvidenceWarning}</p>
            </div>
          </div>
          </div>
        </Panel>
        <Panel title={dictionary.ui.culpritStep} icon={<Gavel className="h-5 w-5 text-signal-500" />}>
          <div className="grid grid-cols-2 gap-3">
            {suspects.map((suspect) => (
              <ChoiceButton
                key={suspect.suspectId}
                selected={accusedSuspectId === suspect.suspectId}
                onClick={() => setAccusedSuspectId(suspect.suspectId)}
                ariaLabel={localizeSuspect(suspect, locale).displayName}
                testId={`accuse-suspect-${suspect.suspectId}`}
              >
                {localizeSuspect(suspect, locale).displayName}
              </ChoiceButton>
            ))}
          </div>
        </Panel>

        <Panel title={dictionary.ui.motiveStep} icon={<AlertTriangle className="h-5 w-5 text-forensic-500" />}>
          <div className="grid gap-2">
            {motives.map(([motiveId, motive]) => (
              <ChoiceButton
                key={motiveId}
                selected={selectedMotiveId === motiveId}
                onClick={() => setSelectedMotiveId(motiveId)}
                ariaLabel={motive.label}
                testId={`accuse-motive-${motiveId}`}
              >
                {motive.label}
              </ChoiceButton>
            ))}
          </div>
        </Panel>

        <Panel title={dictionary.ui.evidenceStep} icon={<Fingerprint className="h-5 w-5 text-green-400" />}>
          <div className="grid gap-2">
            {unlockedClues.length ? unlockedClues.map((clue) => {
              const selected = selectedEvidenceClueIds.includes(clue.clueId);
              return (
                <ChoiceButton
                  key={clue.clueId}
                  selected={selected}
                  onClick={() =>
                    setSelectedEvidenceClueIds((current) =>
                      selected ? current.filter((id) => id !== clue.clueId) : [...current, clue.clueId]
                    )
                  }
                  ariaLabel={clue.publicText}
                  testId={`accuse-evidence-${clue.clueId}`}
                >
                  <span className="block font-mono text-[10px] uppercase text-text-400">
                    {dictionary.ui.evidenceType}: {dictionary.evidenceTypes[clue.evidenceType]}
                  </span>
                  <span className="mt-1 block">{clue.publicText}</span>
                </ChoiceButton>
              );
            }) : (
              <div className="rounded-liarline border border-line-700 bg-ink-900 p-3 text-[14px] text-text-400">
                {dictionary.ui.noEvidence}
              </div>
            )}
          </div>
        </Panel>
      </section>

      <div className="mobile-action-dock fixed inset-x-0 z-40 mx-auto grid max-w-[430px] grid-cols-2 gap-3 border-t border-line-700 bg-ink-900/95 p-4 pb-[var(--safe-bottom)] backdrop-blur">
        <SecondaryButton onClick={() => setNotebookOpen(true)} aria-label={dictionary.ui.openNotebook} className={BUTTON_ROLE_SYSTEM.notebook.className}>
          <BookOpen className="mr-2 inline h-5 w-5" />
          {dictionary.ui.notebook}
        </SecondaryButton>
        <SecondaryButton
          onClick={goBackToInterrogation}
          disabled={state.rules.actionPointsRemaining <= 0}
          aria-label={dictionary.ui.continueInterrogation}
        >
          <MessageSquare className="mr-2 inline h-5 w-5" />
          {dictionary.ui.continueInterrogation}
        </SecondaryButton>
        {state.rules.actionPointsRemaining <= 0 && (
          <p className="col-span-2 text-[12px] leading-4 text-text-400">{dictionary.ui.noActionReturn}</p>
        )}
        <button
          type="button"
          disabled={!canSubmitAccusation}
          onClick={() => submitFinalAccusation({ accusedSuspectId, selectedMotiveId, selectedEvidenceClueIds })}
          data-testid="final-accusation-submit"
          className={`final-accusation-submit col-span-2 min-h-11 rounded-liarline border border-signal-500 bg-signal-500 px-4 py-3 text-[15px] font-bold text-text-50 shadow-signal disabled:border-line-700 disabled:bg-ink-800 disabled:text-text-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${BUTTON_ROLE_SYSTEM.finalSubmit.className} ${BUTTON_FEEDBACK_STATES.finalRisk} ${MICRO_EVENT_SYSTEM.finalAccusation.className}`}
        >
          {acknowledgedRisk ? dictionary.ui.submitAccusation : dictionary.ui.submitDisabledRisk}
        </button>
      </div>
    </div>
  );
}

function DeductionStatusPanel({
  state,
  locale,
  onOpenNotebook,
  onFocusCollapseSuspect,
  onRevealDeadEndHint
}: {
  state: GameState;
  locale: "en" | "ru";
  onOpenNotebook: () => void;
  onFocusCollapseSuspect: () => void;
  onRevealDeadEndHint: () => void;
}) {
  const dictionary = getDictionary(locale);
  const hintAvailable = canUseDeadEndHint(state);
  const triggeredContradictions = state.deduction.triggeredContradictionIds
    .map((contradictionId) => dictionary.contradictions[contradictionId])
    .filter((contradiction): contradiction is { title: string; body: string } => Boolean(contradiction));
  const signals = state.deduction.suspicionSignals
    .map((signal) => ({
      ...signal,
      label: dictionary.suspicionSignals[signal.signalId] ?? signal.signalId,
      suspect: state.suspects[signal.suspectId] ? localizeSuspect(state.suspects[signal.suspectId], locale).displayName : signal.suspectId
    }))
    .slice(0, 3);

  return (
    <section className="rounded-liarline border border-line-700 bg-ink-850/95 p-4 shadow-terminal">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.theory}</p>
          <p className="mt-1 text-[18px] font-bold text-text-50">
            {state.deduction.theoryConfidence === "strong" ? dictionary.ui.strongTheory : dictionary.ui.weakTheory}
          </p>
        </div>
        <div className="rounded border border-forensic-500/60 bg-forensic-500/10 px-2 py-1 font-mono text-[11px] font-bold uppercase text-forensic-500">
          {dictionary.ui.suspicionSignals}
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-[12px] leading-5 text-text-400">
        <p>{dictionary.ui.suspicionMeaning}</p>
        <p>{dictionary.ui.theoryMeaning}</p>
        <p className="font-mono text-[10px] font-bold uppercase text-text-500">{dictionary.ui.weakStrongRule}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {signals.map((signal) => (
          <span
            key={signal.signalId}
            className={`rounded border px-2 py-1 font-mono text-[10px] font-bold uppercase ${
              signal.resolved
                ? "border-forensic-500 bg-forensic-500/10 text-forensic-500"
                : "border-line-500 bg-ink-900 text-text-300"
            }`}
          >
            {signal.suspect}: {signal.label}
          </span>
        ))}
      </div>

      {triggeredContradictions.length > 0 && (
        <div className={`contradiction-action-card mt-4 rounded-liarline border border-signal-500 bg-signal-500/10 p-3 shadow-signal ${MICRO_EVENT_SYSTEM.contradictionFound.className}`} aria-live="polite">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-signal-500" />
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold uppercase text-signal-500">{dictionary.ui.contradictionActionAvailable}</p>
              <p className="mt-1 text-[16px] font-bold leading-5 text-text-50">{dictionary.ui.contradictionAction}</p>
              <p className="mt-2 text-[13px] leading-5 text-text-300">{dictionary.ui.contradictionActionBody}</p>
            </div>
          </div>
          <ScenarioInsertPanel id="contradiction_reveal" label={dictionary.ui.contradictionFound} caption={dictionary.ui.contradictionActionBody} />
          <button
            type="button"
            onClick={onOpenNotebook}
            className="mt-3 min-h-11 w-full rounded-liarline border border-signal-500 bg-signal-500 px-3 py-3 text-left text-[14px] font-bold text-text-50 shadow-signal focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <BookOpen className="mr-2 inline h-4 w-4" />
            {dictionary.ui.contradictionAction}
          </button>
        </div>
      )}

      {state.deduction.collapseTriggered && (
        <div className="contradiction-reveal-stage contradiction-flash visual-event-rail mt-4 rounded-liarline border border-signal-500 p-3 pl-5 shadow-signal" aria-live="assertive">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-signal-500" />
            <p className="font-mono text-[11px] font-bold uppercase text-signal-500">{dictionary.ui.collapseTitle}</p>
          </div>
          <p className="mt-2 text-[14px] leading-5 text-text-100">{dictionary.ui.collapseBody}</p>
          <p className="collapse-impact-line mt-2 rounded border border-signal-500/60 bg-ink-950 px-3 py-2 text-[13px] font-bold leading-5 text-text-100">
            {dictionary.ui.collapseImpactLine}
          </p>
          <div className="suspicion-shift-strip mt-3 grid grid-cols-3 gap-2">
            {[
              dictionary.ui.boardLinkLabel,
              dictionary.ui.suspicionShiftLabel,
              dictionary.ui.theoryShiftLabel
            ].map((label) => (
              <div key={label} className="rounded border border-forensic-500/50 bg-forensic-500/10 p-2 text-center font-mono text-[9px] font-bold uppercase text-forensic-500">
                {label}
              </div>
            ))}
          </div>
          {triggeredContradictions.map((contradiction) => (
            <div key={contradiction.title} className="board-link-line mt-3 border-l-2 border-forensic-500 pl-3">
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">
                {dictionary.ui.contradictionAction} · {dictionary.ui.contradictionFound}
              </p>
              <p className="mt-1 text-[14px] font-bold leading-5 text-text-50">{contradiction.title}</p>
              <p className="mt-1 text-[13px] leading-5 text-text-300">{contradiction.body}</p>
              <p className="mt-2 text-[12px] leading-5 text-text-400">{dictionary.ui.contradictionPayoff}</p>
            </div>
          ))}
          <div className="mt-3 rounded border border-line-700 bg-ink-950/70 p-3">
            <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.collapseNextTitle}</p>
            <p className="mt-2 text-[13px] leading-5 text-text-300">{dictionary.ui.collapseNextNotebook}</p>
            <p className="mt-1 text-[13px] leading-5 text-text-300">{dictionary.ui.collapseNextPressure}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SecondaryButton onClick={onOpenNotebook}>
                <BookOpen className="mr-2 inline h-4 w-4" />
                {dictionary.ui.notebook}
              </SecondaryButton>
              <SecondaryButton onClick={onFocusCollapseSuspect}>
                <MessageSquare className="mr-2 inline h-4 w-4" />
                {dictionary.ui.pressureState}
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {(hintAvailable || state.deduction.deadEndHintUsed) && (
        <div className="hint-marker mt-4 rounded-liarline border border-cyan-400/70 p-3">
          <p className="font-mono text-[11px] font-bold uppercase text-cyan-300">{dictionary.ui.deadEndHintButton}</p>
          <p className="mt-2 text-[13px] leading-5 text-text-300">{dictionary.ui.deadEndHintReason}</p>
          {state.deduction.deadEndHintUsed ? (
            <p className="mt-3 rounded border border-cyan-400/60 bg-ink-950 p-3 text-[14px] leading-5 text-text-100">
              {state.deduction.deadEndHint}
            </p>
          ) : (
            <SecondaryButton onClick={onRevealDeadEndHint} className="one-hint-button mt-3 w-full">
              {dictionary.ui.deadEndHintButton}
            </SecondaryButton>
          )}
        </div>
      )}
    </section>
  );
}

function ResolutionScreen() {
  const { state, resetGame, locale, setLocale } = useGameStore();
  const dictionary = getDictionary(locale);
  const outcome = state.resolution.outcome;
  const culprit = localizeSuspect(state.suspects[state.truthTable.culpritSuspectId], locale);
  const motive = getLocalizedMotiveMap(state, locale)[state.truthTable.trueMotiveId];
  const tone = outcome === "loss" ? "text-signal-500" : "text-forensic-500";
  const title = outcome ? dictionary.resolutionTitles[outcome] : dictionary.ui.resolution;
  const timeline = getLocalizedTimeline(state, locale);
  const detectiveRating = state.resolution.detectiveRating ? dictionary.detectiveRatings[state.resolution.detectiveRating] : null;
  const reconstruction = state.resolution.reverseReconstructionStepIds
    .map((stepId) => dictionary.reverseReconstruction[stepId])
    .filter((step): step is string => Boolean(step));
  const missedOpportunities = outcome === "perfect_win" ? [dictionary.ui.missedOpportunityPerfect] : dictionary.missedOpportunities;

  return (
    <div className="resolution-complete-screen resolution-verdict-stage min-h-[100dvh]">
      <TopStrip state={state} label={dictionary.phaseLabels.resolution} locale={locale} onRestart={() => resetGame()} />
      <section className="space-y-5 px-4 py-5 pb-[calc(var(--safe-bottom)+88px)]">
        <div className="flex justify-end">
          <LanguageToggle locale={locale} setLocale={setLocale} />
        </div>
        <CaseProgressRail state={state} locale={locale} />
        <div className="truth-summary-card verdict-reconstruction-card rounded-liarline border border-line-500 bg-ink-850 p-5 shadow-terminal">
          <p className={`font-mono text-[12px] font-bold uppercase ${tone}`}>{title}</p>
          <h1 className="mt-2 text-[28px] font-bold leading-8">
            {outcome ? dictionary.resolutionText[outcome] : state.resolution.finalText}
          </h1>
          <div className="mt-4 grid gap-2 text-[14px] text-text-200">
            <p><span className="text-text-400">{dictionary.ui.culprit}:</span> {culprit.displayName}</p>
            <p><span className="text-text-400">{dictionary.ui.motive}:</span> {motive.label}</p>
            <p><span className="text-text-400">{dictionary.ui.evidenceScore}:</span> {state.resolution.evidenceScore}/2</p>
          </div>
        </div>
        <ScenarioInsertPanel id="resolution" label={dictionary.ui.resolution} caption={dictionary.ui.truthTimeline} />

        {detectiveRating && (
          <Panel title={dictionary.ui.detectiveRating} icon={<Fingerprint className="h-5 w-5 text-forensic-500" />}>
            <div className={`rating-stamp rounded-liarline border border-forensic-500 p-3 ${MICRO_EVENT_SYSTEM.resolutionRating.className}`}>
              <p className="font-mono text-[12px] font-bold uppercase text-forensic-500">{detectiveRating.title}</p>
              <p className="mt-2 text-[14px] leading-5 text-text-100">{detectiveRating.body}</p>
            </div>
          </Panel>
        )}

        {reconstruction.length > 0 && (
          <Panel title={dictionary.ui.reverseReconstruction} icon={<AlertTriangle className="h-5 w-5 text-signal-500" />}>
            <div className="space-y-2">
              {reconstruction.map((step, index) => (
                <div key={`${index}-${step}`} className="grid grid-cols-[auto_1fr] gap-3 rounded-liarline border border-line-700 bg-ink-900 p-3">
                  <span className="grid h-6 w-6 place-items-center rounded border border-forensic-500 font-mono text-[11px] font-bold text-forensic-500">
                    {index + 1}
                  </span>
                  <p className="text-[14px] leading-5 text-text-200">{step}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <Panel title={dictionary.ui.missedOpportunity} icon={<BookOpen className="h-5 w-5 text-forensic-500" />}>
          <div className="space-y-2">
            {missedOpportunities.map((opportunity, index) => (
              <div key={`${index}-${opportunity}`} className="missed-opportunity-card rounded-liarline border border-line-700 bg-ink-900 p-3">
                <p className="font-mono text-[10px] font-bold uppercase text-forensic-500">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[14px] leading-5 text-text-200">{opportunity}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={dictionary.ui.truthTimeline} icon={<Check className="h-5 w-5 text-green-400" />}>
          <div className="space-y-2">
            {timeline.map((entry) => (
              <div key={`${entry.time}-${entry.clueId}`} className="rounded-liarline border border-line-700 bg-ink-900 p-3">
                <p className="font-mono text-[11px] font-bold text-forensic-500">{entry.time}</p>
                <p className="mt-1 text-[14px] leading-5 text-text-200">{entry.event}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={dictionary.ui.npcRolesRevealed} icon={<MessageSquare className="h-5 w-5 text-cyan-400" />}>
          <div className="space-y-2">
            {getSuspectList(state).map((suspect) => (
              <div key={suspect.suspectId} className="flex items-center justify-between rounded-liarline border border-line-700 bg-ink-900 p-3">
                <span className="font-bold">{localizeSuspect(suspect, locale).displayName}</span>
                <span className="font-mono text-[11px] uppercase text-text-400">{dictionary.roles[suspect.npcRole] ?? suspect.npcRole}</span>
              </div>
            ))}
          </div>
        </Panel>

        <FeedbackPanel state={state} locale={locale} />
      </section>

      <div className="mobile-action-dock fixed inset-x-0 z-40 mx-auto max-w-[430px] border-t border-line-700 bg-ink-900/95 p-4 pb-[var(--safe-bottom)] backdrop-blur">
        <PrimaryButton onClick={resetGame} className={`restart-case-button w-full ${BUTTON_ROLE_SYSTEM.restart.className}`}>
          <RotateCcw className="mr-2 inline h-5 w-5" />
          {dictionary.ui.newCase}
        </PrimaryButton>
      </div>
    </div>
  );
}

function FeedbackPanel({ state, locale }: { state: GameState; locale: "en" | "ru" }) {
  const dictionary = getDictionary(locale);
  const [category, setCategory] = useState<FeedbackCategory>("notebook_clarity");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function submitFeedback() {
    const viewport =
      typeof window === "undefined" ? "unknown" : `${window.innerWidth}x${window.innerHeight}`;
    const entry = createFeedbackEntry({
      category,
      note,
      locale,
      outcome: state.resolution.outcome,
      detectiveRating: state.resolution.detectiveRating,
      transcriptLength: state.transcript.length,
      viewport
    });
    saveFeedbackEntry(entry);
    setNote("");
    setSaved(true);
  }

  return (
    <Panel title={dictionary.ui.feedbackTitle} icon={<MessageSquare className="h-5 w-5 text-cyan-400" />}>
      <div data-testid="feedback-panel" className="space-y-3">
        <p className="text-[13px] leading-5 text-text-300">{dictionary.ui.feedbackBody}</p>
        <div className="grid grid-cols-2 gap-2">
          {FEEDBACK_CATEGORIES.map((item) => (
            <button
              key={item.category}
              type="button"
              onClick={() => {
                setCategory(item.category);
                setSaved(false);
              }}
              aria-pressed={category === item.category}
              data-testid={`feedback-category-${item.category}`}
              className={`min-h-11 rounded-liarline border px-2 py-2 text-left text-[12px] font-bold leading-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                category === item.category
                  ? "border-cyan-400 bg-cyan-400 text-ink-950"
                  : "border-line-700 bg-ink-900 text-text-100"
              }`}
            >
              {dictionary.ui.feedbackCategories[item.category]}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.currentTarget.value.slice(0, 280));
            setSaved(false);
          }}
          data-testid="feedback-note"
          aria-label={dictionary.ui.feedbackNoteAria}
          placeholder={dictionary.ui.feedbackPlaceholder}
          maxLength={280}
          className="min-h-24 w-full resize-none rounded-liarline border border-line-700 bg-ink-950 p-3 text-[14px] leading-5 text-text-100 placeholder:text-text-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button
          type="button"
          onClick={submitFeedback}
          data-testid="feedback-submit"
          className="min-h-11 w-full rounded-liarline border border-cyan-400 bg-cyan-400 px-3 py-3 text-[14px] font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {dictionary.ui.feedbackSubmit}
        </button>
        {saved && (
          <p data-testid="feedback-saved" className="rounded border border-forensic-500/60 bg-forensic-500/10 px-3 py-2 font-mono text-[10px] font-bold uppercase text-forensic-500">
            {dictionary.ui.feedbackSaved}
          </p>
        )}
      </div>
    </Panel>
  );
}

function LanguageToggle({ locale, setLocale }: { locale: "en" | "ru"; setLocale: (locale: "en" | "ru") => void }) {
  const dictionary = getDictionary(locale);
  return (
    <div
      className="grid grid-cols-2 overflow-hidden rounded-liarline border border-line-700 bg-ink-900 font-mono text-[11px] font-bold uppercase"
      aria-label={dictionary.localeName}
    >
      {(["en", "ru"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          aria-label={option === "en" ? "Switch language to English" : "Переключить язык на русский"}
          data-testid={`locale-toggle-${option}`}
          className={`min-h-11 min-w-11 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            locale === option ? "bg-forensic-500 text-ink-950" : "text-text-400"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function CaseProgressRail({ state, locale }: { state: GameState; locale: "en" | "ru" }) {
  const dictionary = getDictionary(locale);
  const pressureSuspectAnswered = Boolean(
    state.deduction.personaShiftSuspectId &&
      state.transcript.some((entry) => entry.suspectId === state.deduction.personaShiftSuspectId)
  );
  const beats = [
    {
      label: dictionary.ui.caseBeatStatement,
      done: state.transcript.length > 0,
      current: state.phase === "briefing" || (state.phase === "interrogation" && state.transcript.length === 0)
    },
    {
      label: dictionary.ui.caseBeatContradiction,
      done: state.deduction.collapseTriggered,
      current: state.phase === "interrogation" && state.transcript.length > 0 && !state.deduction.collapseTriggered
    },
    {
      label: dictionary.ui.caseBeatPressure,
      done: pressureSuspectAnswered,
      current: state.phase === "interrogation" && state.deduction.collapseTriggered && !pressureSuspectAnswered
    },
    {
      label: dictionary.ui.caseBeatAccusation,
      done: state.accusation.submitted,
      current: state.phase === "accusation"
    },
    {
      label: dictionary.ui.caseBeatResolution,
      done: state.phase === "resolution",
      current: state.phase === "resolution"
    }
  ];

  return (
    <section className="case-progress-rail rounded-liarline border border-line-700 bg-ink-950/75 p-3" aria-label={dictionary.ui.caseProgressLabel}>
      <p className="mb-2 font-mono text-[10px] font-bold uppercase text-text-400">{dictionary.ui.caseProgressLabel}</p>
      <div className="grid grid-cols-5 gap-1">
        {beats.map((beat, index) => {
          const status = beat.done ? "done" : beat.current ? "current" : "locked";
          const label = status === "done" ? dictionary.ui.caseBeatDone : status === "current" ? dictionary.ui.caseBeatCurrent : dictionary.ui.caseBeatLocked;
          return (
            <div
              key={beat.label}
              className={`case-progress-beat rounded border px-1.5 py-2 text-center ${
                status === "done"
                  ? "border-forensic-500 bg-forensic-500/15 text-forensic-500"
                  : status === "current"
                    ? "border-signal-500 bg-signal-500/15 text-signal-500"
                    : "border-line-700 bg-ink-900 text-text-500"
              }`}
            >
              <p className="font-mono text-[9px] font-bold uppercase">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-bold leading-3">{beat.label}</p>
              <p className="mt-1 font-mono text-[8px] font-bold uppercase opacity-75">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-liarline border border-line-700 bg-ink-850 p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-[17px] font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ScenarioInsertPanel({
  id,
  label,
  caption,
  className = ""
}: {
  id: ScenarioInsertId;
  label: string;
  caption: string;
  className?: string;
}) {
  const insert = getScenarioInsert(id);

  return (
    <aside
      className={`scenario-insert-panel ${insert.className} ${className} mt-3 grid grid-cols-[72px_1fr] gap-3 rounded-liarline border border-line-700 bg-ink-900/82 p-2`}
      data-scenario={id}
      aria-label={label}
    >
      <div className="relative h-[72px] w-[72px] overflow-hidden rounded border border-line-700 bg-ink-950" style={{ position: "relative" }}>
        <Image src={insert.assetPath} alt={label} fill sizes="72px" className="object-cover" />
      </div>
      <div className="min-w-0 self-center">
        <p className="font-mono text-[10px] font-bold uppercase text-forensic-500">{label}</p>
        <p className="mt-1 line-clamp-3 text-[12px] font-bold leading-4 text-text-200">{caption}</p>
      </div>
    </aside>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
  ariaLabel,
  testId
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      data-testid={testId}
      className={`min-h-11 rounded-liarline border p-3 text-left text-[14px] font-bold leading-5 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
        selected ? "border-forensic-500 bg-forensic-500 text-ink-950" : "border-line-700 bg-ink-800 text-text-50"
      }`}
    >
      {children}
    </button>
  );
}
