import { chromium, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInitialGameState } from "../src/game/gameEngine";
import type { GameState, TranscriptEntry } from "../src/game/types";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";
const outDir = path.join(process.cwd(), "_archive", "release-screenshots", "2026-05-06");

function turn(id: string, suspectId: string, questionText: string, answerText: string, revealedClueId: string | null = null): TranscriptEntry {
  return {
    turnId: id,
    roundIndex: 1,
    suspectId,
    questionText,
    answerText,
    revealedClueId,
    suspicionDeltaApplied: 2,
    createdAt: "2026-05-06T20:00:00.000Z",
    source: "groq",
    latencyMs: 420,
    providerStatus: 200,
    fallbackReason: null,
    truthfulness: "partial",
    contradictionRisk: 78,
    notebookHint: "Compare the broken camera with the cart log."
  };
}

function contradictionState(): GameState {
  const state = createInitialGameState();
  state.phase = "interrogation";
  state.clues.clue_camera_fault.unlocked = true;
  state.clues.clue_ivo_gap.unlocked = true;
  state.playerNotebook.unlockedClueIds = ["clue_camera_fault", "clue_ivo_gap"];
  state.playerNotebook.contradictions = ["contradiction_camera_vs_cart"];
  state.playerNotebook.suspectNotes.suspect_theo = ["Camera panic explains missing footage, not the later cart movement."];
  state.playerNotebook.suspectNotes.suspect_ivo = ["Ivo still cannot cover the 21:10 cart gap."];
  state.deduction.triggeredContradictionIds = ["contradiction_camera_vs_cart"];
  state.deduction.collapseTriggered = true;
  state.deduction.collapseFocusSuspectId = "suspect_ivo";
  state.deduction.personaShiftSuspectId = "suspect_ivo";
  state.deduction.theoryConfidence = "strong";
  state.deduction.suspicionSignals = state.deduction.suspicionSignals.map((signal) =>
    signal.signalId === "signal_theo_timeline_mismatch" ? { ...signal, resolved: true } : signal
  );
  state.suspects.suspect_theo.visibleState.suspicion = 15;
  state.suspects.suspect_theo.visibleState.mood = "shaken";
  state.suspects.suspect_ivo.visibleState.suspicion = 58;
  state.suspects.suspect_ivo.visibleState.mood = "panicking";
  state.suspects.suspect_ivo.visibleState.revealedClueIds = ["clue_ivo_gap"];
  state.transcript = [
    turn(
      "release_theo_1",
      "suspect_theo",
      "The corridor camera failed before the theft. What happened to it?",
      "I... I bumped the test rig before the theft. The camera stopped recording, but that does not explain the cart.",
      "clue_camera_fault"
    ),
    turn(
      "release_ivo_1",
      "suspect_ivo",
      "Why does the cart log point back to you at 21:10?",
      "Stop twisting a routine inventory count. I was near the room, not stealing anything.",
      "clue_ivo_gap"
    )
  ];
  return state;
}

function accusationState(): GameState {
  const state = contradictionState();
  state.phase = "accusation";
  state.clues.clue_debt_message.unlocked = true;
  state.playerNotebook.unlockedClueIds = ["clue_camera_fault", "clue_ivo_gap", "clue_debt_message"];
  state.suspects.suspect_ivo.visibleState.revealedClueIds = ["clue_ivo_gap", "clue_debt_message"];
  return state;
}

function resolutionState(): GameState {
  const state = accusationState();
  state.phase = "resolution";
  state.accusation = {
    submitted: true,
    accusedSuspectId: "suspect_ivo",
    selectedMotiveId: "motive_debt",
    selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
  };
  state.resolution = {
    outcome: "perfect_win",
    culpritCorrect: true,
    motiveCorrect: true,
    evidenceScore: 2,
    finalText: "You named the thief, the motive, and enough evidence. The case holds.",
    detectiveRating: "sharp",
    reverseReconstructionStepIds: ["recon_camera_break", "recon_cart_log", "recon_ivo_gap", "recon_final_verdict"]
  };
  return state;
}

async function seed(page: Page, state: GameState) {
  await page.addInitScript((seededState) => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", "en");
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, state);
}

async function browserNewPage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
  return { browser, page };
}

const { browser, page } = await browserNewPage();
const shots: Array<{ name: string; file: string }> = [];

async function capture(name: string, state: GameState, afterLoad?: () => Promise<void>) {
  await page.context().clearCookies();
  await seed(page, state);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  if (afterLoad) await afterLoad();
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  shots.push({ name, file });
}

try {
  await mkdir(outDir, { recursive: true });
  await capture("01-suspect-first-start", createInitialGameState());
  const interrogation = createInitialGameState();
  interrogation.phase = "interrogation";
  await capture("02-interrogation", interrogation);
  await capture("03-contradiction-reveal", contradictionState());
  await capture("04-notebook", contradictionState(), async () => {
    await page.locator('button[aria-label="Open notebook"]').first().click();
    await page.locator(".compact-evidence-surface").waitFor({ state: "visible", timeout: 5000 });
  });
  await capture("05-accusation", accusationState());
  await capture("06-resolution", resolutionState());

  await writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify({ baseUrl, capturedAt: new Date().toISOString(), shots }, null, 2),
    "utf8"
  );
} finally {
  await browser.close();
}

console.log(JSON.stringify({ ok: true, outDir, count: shots.length }, null, 2));
