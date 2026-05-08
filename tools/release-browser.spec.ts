import { expect, test } from "@playwright/test";
import { createInitialGameState, submitAccusation } from "../src/game/gameEngine";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";

test("playable link opens on mobile browser without app download surface", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".language-entry-screen")).toBeVisible();
  await expect(page.getByRole("button", { name: "Русский", exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "English", exact: false })).toBeVisible();
  await page.getByRole("button", { name: "English", exact: false }).click();

  await expect(page.locator(".start-interrogation-surface")).toBeVisible();
  await expect(page.locator(".onboarding-rules-card")).toContainText("How to play");
  await expect(page.locator(".onboarding-rules-card")).toContainText("Each question costs 1 AP");
  await expect(page.locator(".onboarding-rules-card")).toContainText("Suspicion is pressure");
  await expect(page.locator(".first-question-cta")).toBeVisible();
  await expect(page.locator(".mobile-action-dock")).toBeVisible();
  await expect(page.locator("a[download]")).toHaveCount(0);
  await expect(page.getByText("App Store", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Google Play", { exact: false })).toHaveCount(0);

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth
  }));
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewport);
  expect(browserErrors).toEqual([]);
});

test("first minute shows AI gameplay hook without external explanation", async ({ page }) => {
  const state = createInitialGameState();
  state.phase = "interrogation";
  state.transcript = [
    {
      turnId: "release_first_ai_answer",
      roundIndex: 0,
      suspectId: "suspect_theo",
      questionText: "The corridor camera failed before the theft. What happened?",
      answerText: "I... I bumped the camera before the theft. But that still does not explain why the cart moved later.",
      revealedClueId: "clue_camera_fault",
      suspicionDeltaApplied: 3,
      createdAt: new Date().toISOString(),
      source: "groq",
      latencyMs: 451,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "partial",
      contradictionRisk: 82,
      notebookHint: "Camera panic does not explain the cart."
    }
  ];
  state.clues.clue_camera_fault.unlocked = true;
  state.playerNotebook.unlockedClueIds = ["clue_camera_fault"];
  state.playerNotebook.contradictions = ["contradiction_camera_vs_cart"];
  state.deduction.collapseTriggered = true;
  state.deduction.collapseFocusSuspectId = "suspect_ivo";
  state.deduction.personaShiftSuspectId = "suspect_ivo";
  state.deduction.theoryConfidence = "strong";

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((seededState) => {
    window.localStorage.setItem("liarline.locale.v1", "en");
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, state);
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".ai-answer-badges")).toContainText("Live answer");
  await expect(page.locator(".contradiction-reveal-stage")).toBeVisible();
  await expect(page.locator(".persona-shift-card")).toBeVisible();
  await expect(page.locator(".case-progress-rail")).toBeVisible();
});

test("release environment can render full playthrough resolution", async ({ page }) => {
  let state = createInitialGameState();
  state.phase = "interrogation";
  state.clues.clue_camera_fault.unlocked = true;
  state.clues.clue_ivo_gap.unlocked = true;
  state.clues.clue_debt_message.unlocked = true;
  state.playerNotebook.unlockedClueIds = ["clue_camera_fault", "clue_ivo_gap", "clue_debt_message"];
  state.playerNotebook.contradictions = ["contradiction_camera_vs_cart"];
  state.deduction.triggeredContradictionIds = ["contradiction_camera_vs_cart"];
  state.deduction.collapseTriggered = true;
  state.deduction.personaShiftSuspectId = "suspect_ivo";
  state.deduction.theoryConfidence = "strong";
  state = submitAccusation(state, {
    accusedSuspectId: "suspect_ivo",
    selectedMotiveId: "motive_debt",
    selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((seededState) => {
    window.localStorage.setItem("liarline.locale.v1", "en");
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, state);
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.getByText("CASE CLOSED", { exact: false })).toBeVisible();
  await expect(page.getByText("Detective work", { exact: false })).toBeVisible();
  await expect(page.getByText("Reverse reconstruction", { exact: false })).toBeVisible();
  await expect(page.locator(".case-progress-rail")).toBeVisible();
});
