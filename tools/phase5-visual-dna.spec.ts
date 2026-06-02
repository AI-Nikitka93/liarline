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
        turnId: "phase5_ivo_pressure",
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
        turnId: "phase5_lena_fact",
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

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  }));
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.bodyWidth).toBeLessThanOrEqual(overflow.viewport);
}

test("locale persists across reload without mutating progress", async ({ page }) => {
  await seed(page, accusationReadyState(), "ru");
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".accusation-risk-screen")).toContainText("Финальное обвинение");
  const savedBefore = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".accusation-risk-screen")).toContainText("Финальное обвинение");
  const savedAfterReload = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  expect(savedAfterReload).toBe(savedBefore);

  await page.getByTestId("locale-toggle-en").click();
  await expect(page.locator(".accusation-risk-screen")).toContainText("Final Accusation");
  const savedAfterSwitch = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  expect(savedAfterSwitch).toBe(savedBefore);
});

test("long RU copy, empty state, and one-handed controls stay inside phone viewport", async ({ page }) => {
  await page.route("**/api/npc-turn", async (route) => {
    let body: { requestId?: string } = { requestId: "phase5_browser" };
    try {
      body = route.request().postDataJSON() as { requestId?: string };
    } catch {
      body = { requestId: "phase5_browser" };
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(liveNpcTurnResponse(body.requestId ?? "phase5_browser"))
    });
  });
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Русский", exact: false }).click();

  await expect(page.locator(".start-interrogation-surface")).toBeVisible();
  await expect(page.locator(".first-viewport-visual-lock")).toBeVisible();
  await expect(page.locator(".suspect-first-hero")).toBeVisible();
  await expect(page.locator(".first-question-cta")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.locator(".first-question-cta").click();
  await expect(page.locator(".interrogation-composition-panel")).toBeVisible();
  await expect(page.getByTestId("custom-question-input")).toBeVisible();
  await expect(page.locator(".mobile-action-dock")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("visual DNA markers render on accusation, notebook, and resolution", async ({ page }) => {
  await seed(page, accusationReadyState(), "en");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".final-risk-stage")).toBeVisible();
  await expect(page.locator(".final-proof-ledger")).toBeVisible();
  await page.getByRole("button", { name: "Open notebook" }).first().click();
  await expect(page.locator(".compact-evidence-surface")).toBeVisible();
  await expect(page.locator(".evidence-paper-surface").first()).toBeVisible();
  await page.getByRole("button", { name: "Close notebook" }).click();

  await page.locator(".risk-acknowledge-checkbox input").check();
  await page.getByTestId("accuse-suspect-suspect_ivo").click();
  await page.getByTestId("accuse-motive-motive_debt").click();
  await page.getByTestId("accuse-evidence-clue_ivo_gap").click();
  await page.getByTestId("accuse-evidence-clue_debt_message").click();
  await page.getByTestId("final-accusation-submit").click();

  await expect(page.locator(".resolution-verdict-stage")).toBeVisible();
  await expect(page.locator(".verdict-reconstruction-card")).toBeVisible();
  await expect(page.locator(".rating-stamp")).toBeVisible();
});

test("resolution locale switch preserves verdict and visual reconstruction", async ({ page }) => {
  await seed(page, resolutionState("en"), "en");
  await page.setViewportSize({ width: 430, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".resolution-verdict-stage")).toContainText("Culprit: Ivo");
  const savedBefore = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  await page.getByTestId("locale-toggle-ru").click();
  await expect(page.locator(".resolution-verdict-stage")).toContainText("Виновный:");
  await expect(page.locator(".resolution-verdict-stage")).toContainText("Иво");
  const savedAfterSwitch = await page.evaluate(() => window.localStorage.getItem("liarline.save.v1"));
  expect(savedAfterSwitch).toBe(savedBefore);
  await expectNoHorizontalOverflow(page);
});
