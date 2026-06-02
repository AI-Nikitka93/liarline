import { expect, test } from "@playwright/test";
import { createInitialGameState } from "../src/game/gameEngine";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";

async function chooseEnglishIfNeeded(page: any) {
  if (await page.locator(".language-entry-screen").isVisible()) {
    await page.getByRole("button", { name: /English/ }).click();
  }
}

function seedState(page: any, mutator: (state: any) => any, locale = "en") {
  const state = mutator(createInitialGameState());
  return page.addInitScript(({ seededState, selectedLocale }: { seededState: any; selectedLocale: string }) => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", selectedLocale);
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, { seededState: state, selectedLocale: locale });
}

function turn(id: string, suspectId: string) {
  return {
    turnId: id,
    roundIndex: 1,
    suspectId,
    questionText: "What can be checked?",
    answerText: "The story leaves a visible timeline gap.",
    revealedClueId: null,
    suspicionDeltaApplied: 1,
    createdAt: new Date().toISOString(),
    source: "groq",
    latencyMs: 320,
    providerStatus: 200,
    fallbackReason: null,
    truthfulness: "evasive",
    contradictionRisk: 55,
    notebookHint: "Compare the timeline."
  };
}

test("phase 7 restart works from briefing, interrogation, accusation, and resolution", async ({ page }) => {
  for (const phase of ["briefing", "interrogation", "accusation", "resolution"]) {
    await seedState(page, (state) => {
      state.phase = phase;
      state.rules.actionPointsRemaining = 4;
      state.transcript = [turn(`${phase}_1`, "suspect_theo"), turn(`${phase}_2`, "suspect_ivo"), turn(`${phase}_3`, "suspect_mara")];
      if (phase === "resolution") {
        state.resolution.outcome = "loss";
        state.resolution.detectiveRating = "misled";
        state.resolution.finalText = "Wrong suspect jailed.";
      }
      return state;
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await chooseEnglishIfNeeded(page);
    await page.getByRole("button", { name: "Restart", exact: true }).click();
    await expect(page.locator(".start-interrogation-surface")).toBeVisible();
    await expect(page.locator(".first-question-cta")).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("liarline.save.v1") || "{}"));
    expect(saved.phase).toBe("briefing");
    expect(saved.transcript).toHaveLength(0);
  }
});

test("phase 7 locale switching preserves run and sends the selected response locale", async ({ page }) => {
  const capturedLocales: string[] = [];
  await page.route("**/api/npc-turn", async (route) => {
    const payload = route.request().postDataJSON();
    capturedLocales.push(payload.turn.responseLocale);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        source: "groq",
        requestId: payload.requestId,
        model: payload.model,
        response: {
          answer_text: payload.turn.responseLocale === "ru"
            ? "Я... камера сломалась раньше, но тележку это не объясняет."
            : "I... the camera broke earlier, but that does not explain the cart.",
          truthfulness: "partial",
          suspicion_delta: 3,
          revealed_clue_id: null,
          contradiction_risk: 78,
          npc_mood: "nervous",
          notebook_hint: payload.turn.responseLocale === "ru" ? "Сравните камеру и тележку." : "Compare the camera and cart."
        },
        meta: {
          latencyMs: 380,
          fallbackReason: null,
          providerStatus: 200,
          retryAfter: null,
          validationWarnings: []
        }
      })
    });
  });
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", "en");
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByTestId("locale-toggle-ru").click();
  await expect(page.locator("text=Задать первый вопрос")).toBeVisible();
  await page.locator(".first-question-cta").click();
  await expect(page.locator(".contradiction-reveal-stage")).toBeVisible();
  await expect(page.getByText("Сильная", { exact: true })).toBeVisible();
  expect(capturedLocales).toEqual(["ru"]);
  const saved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("liarline.save.v1") || "{}"));
  expect(saved.phase).toBe("interrogation");
  expect(saved.transcript).toHaveLength(1);
});

test("phase 7 degraded, no AP, no evidence, and corrupt save states are usable", async ({ page }) => {
  await seedState(page, (state) => {
    state.phase = "interrogation";
    state.rules.actionPointsRemaining = 0;
    state.transcript = [turn("noap_1", "suspect_theo")];
    return state;
  });
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator(".accusation-entry-button")).toBeEnabled();
  await page.locator(".accusation-entry-button").click();
  await expect(page.locator(".accusation-risk-screen")).toBeVisible();
  await expect(page.locator("text=No evidence is open.")).toBeVisible();

  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", "en");
    window.localStorage.setItem("liarline.save.v1", "{broken-json");
  });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator(".start-interrogation-surface")).toBeVisible();
  const corruptKeys = await page.evaluate(() => Object.keys(window.localStorage).filter((key) => key.startsWith("liarline.save.corrupt.")));
  expect(corruptKeys.length).toBeGreaterThan(0);
});

test("phase 7 mobile layout, control names, and first-screen assets stay usable", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", "en");
  });
  for (const viewport of [{ width: 375, height: 667 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(viewport);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await expect(page.locator(".case-progress-rail")).toBeVisible();
    await expect(page.locator(".case-progress-beat")).toHaveCount(5);
    await expect(page.locator(".noninteractive-suspect-card")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "Select Theo. Suspicion 20.", exact: true })).toHaveCount(0);
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const buttons = Array.from(document.querySelectorAll("button")).map((button) => ({
        text: button.textContent?.trim() || "",
        aria: button.getAttribute("aria-label") || "",
        title: button.getAttribute("title") || "",
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height
      }));
      const images = Array.from(document.images).map((image) => ({
        alt: image.alt,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        box: image.getBoundingClientRect().toJSON()
      }));
      return {
        width: innerWidth,
        docWidth: doc.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        safeBottom: getComputedStyle(doc).getPropertyValue("--safe-bottom").trim(),
        buttons,
        images
      };
    });
    expect(metrics.docWidth).toBeLessThanOrEqual(metrics.width);
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.width);
    expect(metrics.safeBottom).not.toBe("");
    expect(metrics.buttons.every((button) => button.text || button.aria || button.title)).toBe(true);
    expect(metrics.buttons.filter((button) => button.width > 0 && button.height > 0).every((button) => button.height >= 32)).toBe(true);
    expect(metrics.images.length).toBeGreaterThanOrEqual(5);
    expect(metrics.images.every((image) => image.alt && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)).toBe(true);
  }
});
