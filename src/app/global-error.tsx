"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#080A0D", color: "#F3F0E8", padding: 16 }}>
          <section style={{ width: "100%", maxWidth: 430, border: "1px solid #FF3B45", borderRadius: 8, background: "#11161D", padding: 20 }}>
            <p style={{ fontFamily: "monospace", color: "#FF3B45", fontWeight: 700, textTransform: "uppercase" }}>Liarline recovery</p>
            <h1 style={{ marginTop: 8, fontSize: 24, lineHeight: "32px" }}>The case screen failed to render.</h1>
            <p style={{ marginTop: 12, color: "#A7B0BC", lineHeight: "20px" }}>Try restoring the screen. The deterministic game state is not owned by the AI actor.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 16, minHeight: 44, width: "100%", border: 0, borderRadius: 8, background: "#F5B84B", color: "#080A0D", fontWeight: 700 }}
            >
              Restore screen
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

