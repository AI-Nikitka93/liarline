"use client";

import { RotateCcw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-ink-950 px-4 text-text-50">
      <section className="w-full max-w-[430px] rounded-liarline border border-signal-500 bg-ink-850 p-5 shadow-signal">
        <p className="font-mono text-[11px] font-bold uppercase text-signal-500">CASE RECOVERY</p>
        <h1 className="mt-2 text-[24px] font-bold leading-8">The case hit an interface fault.</h1>
        <p className="mt-3 text-[14px] leading-5 text-text-300">
          Your local save is still separate from the AI actor. Try restoring the screen or restart the case from the top bar.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-liarline bg-forensic-500 px-4 py-3 text-[15px] font-bold text-ink-950 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Restore screen
        </button>
      </section>
    </main>
  );
}

