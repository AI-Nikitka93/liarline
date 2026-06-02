import { clsx } from "clsx";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { getSuspectPortrait } from "../game/assets";
import { BUTTON_ROLE_SYSTEM } from "../game/interactionVisualSystem";
import { getMoodVisual } from "../game/moodVisualSystem";
import type { GameState, Suspect } from "../game/types";
import type { Locale } from "../i18n/dictionaries";
import { getDictionary, localizeSuspect } from "../i18n/dictionaries";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-ink-950 text-text-50">
      <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] border-x border-line-700 bg-ink-900 shadow-terminal terminal-grid">
        {children}
      </div>
    </main>
  );
}

export function TopStrip({
  state,
  label,
  locale,
  onRestart
}: {
  state: GameState;
  label: string;
  locale: Locale;
  onRestart?: () => void;
}) {
  const dictionary = getDictionary(locale);
  const caseNumber = state.case.caseId.match(/\d+/g)?.at(-1) ?? "001";
  const caseLabel = locale === "ru" ? `Дело ${caseNumber}` : `Case ${caseNumber}`;
  return (
    <header className="sticky top-0 z-30 border-b border-line-700 bg-ink-900/95 px-4 pb-3 pt-[var(--safe-top)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase text-forensic-500">{caseLabel}</p>
          <h1 className="text-[20px] font-bold leading-[26px] text-text-50">{label}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right font-mono text-[11px] font-bold uppercase text-text-400">
            <p>{dictionary.ui.round} {Math.min(state.rules.roundIndex + 1, state.rules.maxRounds)}/{state.rules.maxRounds}</p>
            <p>{dictionary.ui.actionPointsShort} {state.rules.actionPointsRemaining}/{state.rules.actionPointsMax}</p>
          </div>
          {onRestart ? (
            <button
              type="button"
              onClick={onRestart}
              className={`inline-flex min-h-11 items-center gap-1 rounded-liarline border border-line-700 bg-ink-850 px-2 font-mono text-[10px] font-bold uppercase text-text-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${BUTTON_ROLE_SYSTEM.restart.className}`}
              aria-label={dictionary.ui.restartGame}
              title={dictionary.ui.restartGame}
            >
              <RotateCcw className="h-4 w-4" />
              <span>{dictionary.ui.restartGame}</span>
            </button>
          ) : null}
        </div>
      </div>
      <ActionPointPips remaining={state.rules.actionPointsRemaining} total={state.rules.actionPointsMax} locale={locale} />
    </header>
  );
}

export function ActionPointPips({ remaining, total, locale }: { remaining: number; total: number; locale: Locale }) {
  return (
    <div className="mt-3 grid grid-cols-9 gap-1" aria-label={getDictionary(locale).ui.actionPointsAria(remaining, total)}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={clsx(
            "h-1.5 rounded-full border",
            index < remaining ? "border-forensic-500 bg-forensic-500" : "border-line-700 bg-ink-800"
          )}
        />
      ))}
    </div>
  );
}

export function SuspicionMeter({ value, locale }: { value: number; locale: Locale }) {
  const clamped = Math.min(100, Math.max(0, value));
  const dictionary = getDictionary(locale);
  const status = clamped < 25
    ? dictionary.suspicion.calm
    : clamped < 50
      ? dictionary.suspicion.uneasy
      : clamped < 75
        ? dictionary.suspicion.nervous
        : dictionary.suspicion.breaking;
  const barClass = clamped < 25 ? "bg-cyan-400" : clamped < 50 ? "bg-forensic-500" : clamped < 75 ? "bg-gradient-to-r from-forensic-500 to-signal-500" : "bg-signal-500 shadow-signal";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-bold uppercase text-text-400">{dictionary.suspicion.label}</span>
        <span className="font-mono text-[12px] font-bold text-text-50">{clamped} · {status}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-ink-700">
        <div className={clsx("h-full rounded transition-all duration-200", barClass)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function NpcMoodFrame({ suspect, locale, active, onClick }: { suspect: Suspect; locale: Locale; active?: boolean; onClick?: () => void }) {
  const localizedSuspect = localizeSuspect(suspect, locale);
  const dictionary = getDictionary(locale);
  const mood = localizedSuspect.visibleState.mood;
  const portrait = getSuspectPortrait(localizedSuspect.suspectId);
  const moodVisual = getMoodVisual(mood);
  const moodClass = mood.includes("panicking")
    ? "border-signal-500 shadow-signal"
    : mood.includes("angry")
    ? "border-signal-500"
    : mood.includes("defensive") || mood.includes("nervous")
      ? "border-forensic-500"
      : active
        ? "border-cyan-400"
        : "border-line-700";

  const className = clsx(
        "min-h-24 rounded-liarline border bg-ink-850 p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400",
        moodClass,
        moodVisual.className,
        active && "bg-ink-800",
        mood.includes("panicking") && "persona-pulse"
      );
  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="portrait-anchor relative h-14 w-14 shrink-0 overflow-hidden rounded border border-line-500 bg-ink-900" style={{ position: "relative" }}>
          {portrait ? (
            <Image
              src={portrait}
              alt={dictionary.ui.portraitAlt(localizedSuspect.displayName)}
              fill
              loading="eager"
              sizes="56px"
              className={clsx("object-cover", mood.includes("panicking") ? "saturate-[1.25] contrast-[1.08]" : "grayscale-[18%] saturate-[0.92]")}
            />
          ) : (
            <div className="grid h-full w-full place-items-center font-mono text-sm font-bold text-forensic-500">
              {localizedSuspect.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/35 to-transparent" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-5 text-text-50">{localizedSuspect.displayName}</p>
          <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-text-400">{localizedSuspect.publicProfile}</p>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase text-forensic-500">
            {dictionary.ui.lieType}: {dictionary.lieArchetypes[localizedSuspect.lieArchetype]}
          </p>
          <p className="mt-1 font-mono text-[10px] font-bold uppercase text-text-400">
            {dictionary.moods[mood] ?? mood}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <SuspicionMeter value={localizedSuspect.visibleState.suspicion} locale={locale} />
      </div>
    </>
  );

  if (!onClick) {
    return (
      <article className={clsx(className, "noninteractive-suspect-card")} aria-label={localizedSuspect.displayName}>
        {content}
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={dictionary.ui.suspectSelectAria(localizedSuspect.displayName, localizedSuspect.visibleState.suspicion)}
    >
      {content}
    </button>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "min-h-11 rounded-liarline bg-forensic-500 px-4 py-3 text-[15px] font-bold text-ink-950 transition active:bg-forensic-700 disabled:border disabled:border-line-700 disabled:bg-ink-800 disabled:text-text-600 focus:outline-none focus:ring-2 focus:ring-cyan-400",
        props.className
      )}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        "min-h-11 rounded-liarline border border-line-500 bg-ink-800 px-4 py-3 text-[15px] font-bold text-text-50 transition active:bg-ink-700 disabled:text-text-600 focus:outline-none focus:ring-2 focus:ring-cyan-400",
        props.className
      )}
    />
  );
}
