import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { createInitialGameState, submitAccusation } from "../src/game/gameEngine";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";
const proofDir = "_archive/release-screenshots/phase6-2026-05-09";

function seed(page: any, state: any, locale = "en") {
  return page.addInitScript(({ seededState, selectedLocale }: { seededState: any; selectedLocale: string }) => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", selectedLocale);
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
  }, { seededState: state, selectedLocale: locale });
}

function mockTurn(payload: any, response: Record<string, unknown>) {
  return {
    ok: true,
    source: "groq",
    requestId: payload.requestId,
    model: payload.model,
    response: {
      answer_text: "I... the camera broke earlier, but that does not explain the cart.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 78,
      npc_mood: "nervous",
      notebook_hint: "Compare camera timing with the cart log.",
      ...response
    },
    meta: {
      latencyMs: 390,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  };
}

async function screenshot(page: any, name: string) {
  await mkdir(proofDir, { recursive: true });
  await page.screenshot({ path: `${proofDir}/${name}.png`, fullPage: true });
}

test("phase 6 scenario inserts, mood visuals, and role buttons render without mobile overflow", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.route("**/api/npc-turn", async (route) => {
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockTurn(payload, {
        revealed_clue_id: payload.npc.suspectId === "suspect_ivo" ? "clue_ivo_gap" : null,
        npc_mood: payload.npc.suspectId === "suspect_ivo" ? "panicking" : "nervous"
      }))
    });
  });

  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", "en");
  });
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator(".scenario-insert-panel[data-scenario='briefing_tension']")).toBeVisible();
  await expect(page.locator(".role-button-first-question")).toBeVisible();
  await screenshot(page, "briefing");
  await page.locator(".role-button-first-question").click();
  await expect(page.locator(".scenario-insert-panel[data-scenario='contradiction_reveal']")).toBeVisible();
  await expect(page.locator(".scenario-insert-panel[data-scenario='persona_shift']")).toBeVisible();
  await expect(page.locator(".mood-panicking").first()).toBeVisible();
  await expect(page.locator(".role-button-send")).toBeVisible();
  await expect(page.locator(".role-button-notebook").first()).toBeVisible();
  await screenshot(page, "interrogation");

  const metrics = await page.evaluate(() => ({
    width: window.innerWidth,
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    scenarioPanels: document.querySelectorAll(".scenario-insert-panel").length,
    roleButtons: document.querySelectorAll("[class*='role-button-']").length,
    animatedUnsafe: Array.from(document.styleSheets).length
  }));

  expect(metrics.docWidth).toBeLessThanOrEqual(metrics.width);
  expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.width);
  expect(metrics.scenarioPanels).toBeGreaterThanOrEqual(2);
  expect(metrics.roleButtons).toBeGreaterThanOrEqual(4);
  expect(browserErrors).toEqual([]);
});

test("phase 6 reduced motion keeps critical states visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const state = createInitialGameState();
  state.phase = "interrogation";
  state.deduction.collapseTriggered = true;
  state.deduction.triggeredContradictionIds = ["contradiction_camera_vs_cart"];
  state.deduction.personaShiftSuspectId = "suspect_ivo";
  state.deduction.collapseFocusSuspectId = "suspect_ivo";
  state.suspects.suspect_ivo.visibleState.mood = "panicking";
  await seed(page, state);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator(".contradiction-reveal-stage")).toBeVisible();
  await expect(page.locator(".scenario-insert-panel[data-scenario='persona_shift']")).toBeVisible();
  const animationDurations = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".persona-pulse, .contradiction-flash, .micro-persona-shift")).map((element) =>
      getComputedStyle(element).animationDuration
    )
  );
  expect(animationDurations.every((duration) => {
    if (duration.endsWith("ms")) return Number.parseFloat(duration) <= 0.01;
    if (duration.endsWith("s")) return Number.parseFloat(duration) <= 0.001;
    return false;
  })).toBe(true);
});

test("phase 6 accusation and resolution panels preserve state and role-specific controls", async ({ page }) => {
  const state = createInitialGameState();
  const resolved = submitAccusation({
    ...state,
    phase: "accusation",
    playerNotebook: {
      ...state.playerNotebook,
      unlockedClueIds: ["clue_ivo_gap", "clue_debt_message"]
    },
    clues: {
      ...state.clues,
      clue_ivo_gap: { ...state.clues.clue_ivo_gap, unlocked: true },
      clue_debt_message: { ...state.clues.clue_debt_message, unlocked: true }
    }
  }, {
    accusedSuspectId: "suspect_ivo",
    selectedMotiveId: "motive_debt",
    selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
  });

  await seed(page, { ...state, phase: "accusation" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator(".scenario-insert-panel[data-scenario='accusation_risk']")).toBeVisible();
  await expect(page.locator(".role-button-final-submit")).toBeVisible();
  await screenshot(page, "accusation");

  await seed(page, resolved);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.locator(".scenario-insert-panel[data-scenario='resolution']")).toBeVisible();
  await expect(page.locator(".restart-case-button.role-button-restart")).toBeVisible();
  await expect(page.locator(".rating-stamp")).toBeVisible();
  await screenshot(page, "resolution");
});
