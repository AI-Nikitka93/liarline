import { expect, test, type Page } from "@playwright/test";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  createInitialGameState,
  goToAccusation,
  startInterrogation,
  submitAccusation,
  unlockClue
} from "../src/game/gameEngine";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";

function liveNpcTurnResponse(requestId: string) {
  return {
    ok: true,
    source: "groq",
    requestId,
    model: "llama-3.1-8b-instant",
    response: {
      answer_text: "I bumped the camera before the theft. That still does not explain the cart.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: "clue_camera_fault",
      contradiction_risk: 82,
      npc_mood: "shaken",
      notebook_hint: "Camera panic does not explain the cart."
    },
    meta: {
      latencyMs: 420,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  };
}

function accusationReadyState() {
  let state = startInterrogation(createInitialGameState());
  const firstQuestion = "The corridor camera failed before the theft. What happened?";
  const request = buildNpcTurnRequest(state, "suspect_theo", firstQuestion, "en");
  state = applyNpcTurnResult(state, "suspect_theo", firstQuestion, liveNpcTurnResponse(request.requestId));
  state = unlockClue(unlockClue(state, "clue_ivo_gap"), "clue_debt_message");
  state = {
    ...state,
    rules: { ...state.rules, actionPointsRemaining: 6 },
    transcript: [
      ...state.transcript,
      {
        turnId: "phase4_ivo_pressure",
        roundIndex: 1,
        suspectId: "suspect_ivo",
        questionText: "What happened with the cart at 21:10?",
        answerText: "No, I was sorting inventory; the cart timing looks worse than it is.",
        revealedClueId: null,
        suspicionDeltaApplied: 2,
        createdAt: new Date().toISOString(),
        source: "groq",
        latencyMs: 390,
        providerStatus: 200,
        fallbackReason: null,
        truthfulness: "lie",
        contradictionRisk: 78,
        notebookHint: "The cart minute is still the pressure point."
      },
      {
        turnId: "phase4_lena_fact",
        roundIndex: 1,
        suspectId: "suspect_lena",
        questionText: "What did you hear near storage?",
        answerText: "I heard a cart near the storage door. That is fact, not theory.",
        revealedClueId: null,
        suspicionDeltaApplied: 1,
        createdAt: new Date().toISOString(),
        source: "groq",
        latencyMs: 360,
        providerStatus: 200,
        fallbackReason: null,
        truthfulness: "truth",
        contradictionRisk: 40,
        notebookHint: "Storage door logs matter."
      }
    ]
  };
  return goToAccusation(state);
}

function resolutionState(locale: "en" | "ru" = "en") {
  return submitAccusation(accusationReadyState(), {
    accusedSuspectId: "suspect_ivo",
    selectedMotiveId: "motive_debt",
    selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
  }, locale);
}

async function seed(page: Page, state: ReturnType<typeof createInitialGameState>, locale: "en" | "ru") {
  await page.addInitScript(({ seededState, seededLocale }) => {
    window.localStorage.setItem("liarline.locale.v1", seededLocale);
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, { seededState: state, seededLocale: locale });
}

test("pending AI state disables duplicate sends and fallback-only route stays honest", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/npc-turn", async (route) => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 450));
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ ok: false })
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "English", exact: false }).click();
  await page.locator(".first-question-cta").click();

  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByTestId("suggested-question-button").first()).toBeDisabled();
  await expect(page.getByTestId("custom-question-input")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Send question" })).toBeDisabled();

  await expect(page.locator(".ai-answer-badges")).toContainText("Guarded answer", { timeout: 10_000 });
  await expect(page.locator(".witness-status-strip")).toContainText("Guarded answer");
  await expect(page.locator(".witness-status-strip")).toContainText("9/9");
  await expect(page.locator(".transcript-turn")).toHaveCount(1);
  expect(calls).toBe(1);
});

test("accusation requires explicit suspect and motive before final submit", async ({ page }) => {
  await seed(page, accusationReadyState(), "en");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const submit = page.getByTestId("final-accusation-submit");
  await expect(page.locator(".accusation-risk-screen")).toBeVisible();
  await expect(submit).toBeDisabled();
  await page.locator(".risk-acknowledge-checkbox input").check();
  await expect(submit).toBeDisabled();
  await expect(page.locator(".accusation-risk-screen")).toContainText("Choose a suspect and motive");

  await page.getByTestId("accuse-suspect-suspect_ivo").click();
  await expect(page.getByTestId("accuse-suspect-suspect_ivo")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("accuse-motive-motive_debt").click();
  await expect(page.getByTestId("accuse-motive-motive_debt")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("accuse-evidence-clue_ivo_gap").click();
  await page.getByTestId("accuse-evidence-clue_debt_message").click();
  await expect(page.locator(".selected-evidence-counter")).toContainText("2");
  await expect(submit).toBeEnabled();
});

test("notebook, continue interrogation, restart, and language toggles keep state coherent", async ({ page }) => {
  await seed(page, accusationReadyState(), "en");
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Open notebook" }).first().click();
  await expect(page.locator(".compact-evidence-surface")).toBeVisible();
  await expect(page.locator(".compact-evidence-surface")).toContainText("Clues");
  await page.getByRole("button", { name: "Close notebook" }).click();
  await expect(page.locator(".compact-evidence-surface")).toHaveCount(0);

  const savedBeforeLocaleSwitch = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  await page.getByTestId("locale-toggle-ru").click();
  await expect(page.getByTestId("locale-toggle-ru")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".accusation-risk-screen")).toContainText("Финальное обвинение");
  const savedAfterLocaleSwitch = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  expect(savedAfterLocaleSwitch).toBe(savedBeforeLocaleSwitch);

  await page.getByRole("button", { name: "Вернуться к допросу" }).click();
  await expect(page.locator('[data-testid="transcript-stack"]')).toBeVisible();
  await expect(page.locator(".mobile-action-dock")).toBeVisible();

  await page.getByRole("button", { name: "Заново" }).click();
  await expect(page.locator(".start-interrogation-surface")).toBeVisible();
});

test("resolution language switch preserves verdict while rebuilding localized reconstruction", async ({ page }) => {
  await seed(page, resolutionState("en"), "en");
  await page.setViewportSize({ width: 430, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".resolution-complete-screen")).toBeVisible();
  await expect(page.getByText("Reverse reconstruction", { exact: false })).toBeVisible();
  await expect(page.getByText("Culprit: Ivo", { exact: false })).toBeVisible();
  const savedBeforeLocaleSwitch = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  await page.getByTestId("locale-toggle-ru").click();
  await expect(page.getByText("Обратная реконструкция", { exact: false })).toBeVisible();
  await expect(page.locator(".truth-summary-card")).toContainText("Виновный:");
  await expect(page.locator(".truth-summary-card")).toContainText("Иво");
  const savedAfterLocaleSwitch = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  expect(savedAfterLocaleSwitch).toBe(savedBeforeLocaleSwitch);

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  }));
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.bodyWidth).toBeLessThanOrEqual(overflow.viewport);
});
