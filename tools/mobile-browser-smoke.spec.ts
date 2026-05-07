import { expect, test } from "@playwright/test";
import { createInitialGameState } from "../src/game/gameEngine";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";

for (const width of [375, 390, 430]) {
  test(`mobile briefing renders at ${width}px without console errors or horizontal overflow`, async ({ page }) => {
    const browserErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.setViewportSize({ width, height: 844 });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await expect(page.locator(".start-interrogation-surface")).toBeVisible();
    await expect(page.locator(".first-question-cta")).toBeVisible();

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    }));

    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewport);
    expect(overflow.bodyWidth).toBeLessThanOrEqual(overflow.viewport);
    expect(browserErrors).toEqual([]);
  });
}

test("interrogation transcript can scroll fully above the fixed action dock", async ({ page }) => {
  const state = createInitialGameState();
  const now = new Date().toISOString();
  const cameraClue = "clue_camera_fault";

  state.phase = "interrogation";
  state.rules.actionPointsRemaining = 6;
  state.rules.roundIndex = 1;
  state.clues[cameraClue].unlocked = true;
  state.playerNotebook.unlockedClueIds = [cameraClue];
  state.playerNotebook.contradictions = ["contradiction_camera_vs_cart"];
  state.deduction.collapseTriggered = true;
  state.deduction.collapseFocusSuspectId = "suspect_ivo";
  state.deduction.personaShiftSuspectId = "suspect_ivo";
  state.deduction.theoryConfidence = "strong";
  state.suspects.suspect_ivo.visibleState.mood = "panicking";
  state.suspects.suspect_ivo.visibleState.suspicion = 56;
  state.transcript = [
    {
      turnId: "smoke_turn_1",
      roundIndex: 0,
      suspectId: "suspect_theo",
      questionText: "Коридорная камера отказала до кражи. Что с ней произошло?",
      answerText: "Я не помню точно, но камера в коридоре перестала писать... да, Тео сломал ее до кражи.",
      revealedClueId: cameraClue,
      suspicionDeltaApplied: 3,
      createdAt: now,
      source: "groq",
      latencyMs: 451,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "partial",
      contradictionRisk: 80,
      notebookHint: "Camera panic does not explain the cart."
    },
    {
      turnId: "smoke_turn_2",
      roundIndex: 1,
      suspectId: "suspect_ivo",
      questionText: "Ваша версия про инвентарь рядом с логом тележки. Что именно вы считали?",
      answerText: "Нет, я считал в комнате отдыха. Вспомнил, что Мару часто видел там.",
      revealedClueId: null,
      suspicionDeltaApplied: 2,
      createdAt: now,
      source: "groq",
      latencyMs: 416,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "lie",
      contradictionRisk: 50,
      notebookHint: "Inventory story avoids the cart minute."
    },
    {
      turnId: "smoke_turn_3",
      roundIndex: 1,
      suspectId: "suspect_ivo",
      questionText: "Тележка уехала после поломки камеры. Почему ваша версия про инвентарь избегает 21:10?",
      answerText: "Подождите, я не избегаю 21:10. Я говорю, что движение тележки было обычным делом, а не тем, что вы пытаетесь из этого сделать.",
      revealedClueId: null,
      suspicionDeltaApplied: 1,
      createdAt: now,
      source: "groq",
      latencyMs: 390,
      providerStatus: 200,
      fallbackReason: null,
      truthfulness: "evasive",
      contradictionRisk: 78,
      notebookHint: "The cart minute is still the pressure point."
    }
  ];

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((seededState) => {
    window.localStorage.setItem("liarline.locale.v1", "ru");
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, state);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="transcript-stack"]')).toBeVisible();
  await page.waitForFunction(() => {
    const dock = document.querySelector(".mobile-action-dock")?.getBoundingClientRect();
    const turns = document.querySelectorAll('[data-testid="transcript-stack"] > div');
    const lastTurn = turns[turns.length - 1]?.getBoundingClientRect();
    return Boolean(dock && lastTurn && lastTurn.bottom <= dock.top - 12);
  });

  const geometry = await page.evaluate(() => {
    const dock = document.querySelector(".mobile-action-dock")?.getBoundingClientRect();
    const turns = document.querySelectorAll('[data-testid="transcript-stack"] > div');
    const lastTurn = turns[turns.length - 1]?.getBoundingClientRect();
    const cssDockHeight = getComputedStyle(document.documentElement).getPropertyValue("--interrogation-dock-height");
    return {
      dockTop: dock?.top ?? 0,
      lastTurnBottom: lastTurn?.bottom ?? 0,
      cssDockHeight
    };
  });

  expect(Number.parseFloat(geometry.cssDockHeight)).toBeGreaterThan(300);
  expect(geometry.lastTurnBottom).toBeLessThanOrEqual(geometry.dockTop - 12);
});
