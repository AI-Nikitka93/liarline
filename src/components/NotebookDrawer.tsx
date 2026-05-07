"use client";

import { AlertTriangle, BookOpen, Fingerprint, X } from "lucide-react";
import { ASSETS } from "../game/assets";
import { getDictionary, localizeClue, localizeSuspect } from "../i18n/dictionaries";
import { useGameStore } from "../state/GameStore";

export function NotebookDrawer() {
  const { state, notebookOpen, setNotebookOpen, locale } = useGameStore();
  const dictionary = getDictionary(locale);
  const unlocked = state.playerNotebook.unlockedClueIds
    .map((clueId) => state.clues[clueId] ? localizeClue(state.clues[clueId], locale) : null)
    .filter((clue): clue is NonNullable<typeof clue> => Boolean(clue));
  const locked = Object.values(state.clues).filter((clue) => !clue.unlocked);
  const totalClues = Object.keys(state.clues).length;
  const contradictionCount = state.playerNotebook.contradictions.length;
  const suspicionSignals = state.deduction.suspicionSignals.map((signal) => ({
    ...signal,
    label: dictionary.suspicionSignals[signal.signalId] ?? signal.signalId,
    suspect: state.suspects[signal.suspectId] ? localizeSuspect(state.suspects[signal.suspectId], locale).displayName : signal.suspectId
  }));

  if (!notebookOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-0">
      <section
        className="compact-evidence-surface max-h-[88dvh] w-full max-w-[430px] overflow-hidden rounded-t-[8px] border border-line-500 bg-ink-850 shadow-terminal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notebook-title"
      >
        <div className="flex items-center justify-between border-b border-line-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-forensic-500" />
            <div>
              <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.notebook}</p>
              <h2 id="notebook-title" className="text-[17px] font-bold">{dictionary.ui.clues}: {unlocked.length}/{totalClues}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotebookOpen(false)}
            className="grid h-11 w-11 place-items-center rounded-liarline border border-line-700 bg-ink-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label={dictionary.ui.closeNotebook}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[72dvh] space-y-4 overflow-y-auto p-4 pb-[var(--safe-bottom)]">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-liarline border border-forensic-500/50 bg-forensic-500/10 p-2 text-center">
              <Fingerprint className="mx-auto h-4 w-4 text-forensic-500" />
              <p className="mt-1 font-mono text-[10px] font-bold uppercase text-forensic-500">{unlocked.length}/{totalClues}</p>
              <p className="text-[10px] leading-3 text-text-400">{dictionary.ui.openedClues}</p>
            </div>
            <div className="rounded-liarline border border-signal-500/50 bg-signal-500/10 p-2 text-center">
              <AlertTriangle className="mx-auto h-4 w-4 text-signal-500" />
              <p className="mt-1 font-mono text-[10px] font-bold uppercase text-signal-500">{contradictionCount}</p>
              <p className="text-[10px] leading-3 text-text-400">{dictionary.ui.contradictionFound}</p>
            </div>
            <div className="rounded-liarline border border-line-700 bg-ink-900 p-2 text-center">
              <BookOpen className="mx-auto h-4 w-4 text-text-500" />
              <p className="mt-1 font-mono text-[10px] font-bold uppercase text-text-500">{locked.length}</p>
              <p className="text-[10px] leading-3 text-text-400">{dictionary.ui.redacted}</p>
            </div>
          </div>

          <div className="suspicion-signal-board rounded-liarline border border-line-700 bg-ink-900 p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{dictionary.ui.suspicionSignalsNotebook}</p>
                <p className="mt-1 text-[12px] leading-4 text-text-400">{dictionary.ui.suspicionSignalsNotebookHint}</p>
              </div>
              <AlertTriangle className="h-5 w-5 shrink-0 text-signal-500" />
            </div>
            <div className="grid gap-2">
              {suspicionSignals.map((signal) => (
                <article
                  key={signal.signalId}
                  className={`suspicion-signal-card rounded-liarline border p-3 ${
                    signal.resolved
                      ? "border-forensic-500/60 bg-forensic-500/10"
                      : "border-signal-500/70 bg-signal-500/10 shadow-signal"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold uppercase text-text-400">{signal.suspect}</p>
                      <p className="mt-1 text-[14px] font-bold leading-5 text-text-50">{signal.label}</p>
                    </div>
                    <span
                      className={`rounded border px-2 py-1 font-mono text-[9px] font-bold uppercase ${
                        signal.resolved
                          ? "border-forensic-500 text-forensic-500"
                          : "border-signal-500 text-signal-500"
                      }`}
                    >
                      {signal.resolved ? dictionary.ui.signalResolved : dictionary.ui.signalUnresolved}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.openedClues}</p>
            <div className="grid grid-cols-2 gap-2">
              {unlocked.length ? unlocked.map((clue) => (
                <article
                  key={clue.clueId}
                  className="evidence-paper-surface rounded-liarline border-l-4 border-forensic-500 bg-paper-300 bg-cover p-3 text-ink-950"
                  style={{ backgroundImage: `linear-gradient(rgb(232 216 182 / 0.88), rgb(232 216 182 / 0.88)), url(${ASSETS.evidencePaper})` }}
                >
                  <p className="font-mono text-[11px] font-bold uppercase text-paper-700">
                    {dictionary.ui.evidenceType}: {dictionary.evidenceTypes[clue.evidenceType]}
                  </p>
                  <p className="mt-1 text-[13px] font-bold leading-5">{clue.publicText}</p>
                </article>
              )) : (
                <p className="rounded-liarline border border-line-700 bg-ink-900 p-3 text-[14px] text-text-400">
                  {dictionary.ui.noOpenedClues}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.contradictionFound}</p>
            <div className="grid gap-2">
              {state.playerNotebook.contradictions.length ? state.playerNotebook.contradictions.map((contradictionId) => {
                const contradiction = dictionary.contradictions[contradictionId];
                return (
                  <article key={contradictionId} className="rounded-liarline border border-signal-500 bg-signal-500/10 p-3">
                    <p className="font-mono text-[11px] font-bold uppercase text-signal-500">
                      {contradiction?.title ?? dictionary.ui.contradictionFound}
                    </p>
                    <p className="mt-1 text-[14px] leading-5 text-text-100">
                      {contradiction?.body ?? contradictionId}
                    </p>
                  </article>
                );
              }) : (
                <p className="rounded-liarline border border-line-700 bg-ink-900 p-3 text-[14px] text-text-400">
                  {dictionary.ui.noOpenedClues}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.ui.redacted}</p>
            <div className="grid grid-cols-2 gap-2">
              {locked.map((clue, index) => (
                <div key={clue.clueId} className="rounded-liarline border border-line-700 bg-ink-900 p-3">
                  <p className="font-mono text-[11px] font-bold uppercase text-text-600">
                    {dictionary.ui.redacted} {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase text-text-500">
                    {dictionary.ui.evidenceType}: {dictionary.evidenceTypes[clue.evidenceType]}
                  </p>
                  <p className="mt-1 text-[13px] text-text-400">
                    {clue.isCritical ? `${dictionary.ui.redacted.toUpperCase()} · ${dictionary.ui.critical}` : dictionary.ui.redacted.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
