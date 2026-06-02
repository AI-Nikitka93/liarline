import { expect, test } from "@playwright/test";
import { createInitialGameState, submitAccusation } from "../src/game/gameEngine";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";

test("resolution captures lightweight player feedback without console errors", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  let state = createInitialGameState();
  state.phase = "interrogation";
  state.clues.clue_camera_fault.unlocked = true;
  state.clues.clue_ivo_gap.unlocked = true;
  state.playerNotebook.unlockedClueIds = ["clue_camera_fault", "clue_ivo_gap"];
  state.playerNotebook.contradictions = ["contradiction_camera_vs_cart"];
  state.deduction.triggeredContradictionIds = ["contradiction_camera_vs_cart"];
  state.deduction.collapseTriggered = true;
  state.deduction.personaShiftSuspectId = "suspect_ivo";
  state.deduction.theoryConfidence = "strong";
  state = submitAccusation(state, {
    accusedSuspectId: "suspect_ivo",
    selectedMotiveId: "motive_rivalry",
    selectedEvidenceClueIds: ["clue_ivo_gap"]
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((seededState) => {
    window.localStorage.setItem("liarline.locale.v1", "en");
    window.localStorage.setItem("liarline.save.v1", JSON.stringify(seededState));
    window.localStorage.removeItem("liarline.feedback.v1");
  }, state);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  await expect(page.locator(".resolution-complete-screen")).toBeVisible();
  await expect(page.getByText("PARTIAL TRUTH", { exact: false })).toBeVisible();
  await expect(page.locator("[data-testid='feedback-panel']")).toBeVisible();
  await page.getByTestId("feedback-category-notebook_clarity").click();
  await page.getByTestId("feedback-note").fill("Notebook comparison was still hard to read on phone.");
  await page.getByTestId("feedback-submit").click();
  await expect(page.getByTestId("feedback-saved")).toBeVisible();

  const savedFeedback = await page.evaluate(() => JSON.parse(window.localStorage.getItem("liarline.feedback.v1") || "[]"));
  expect(savedFeedback).toHaveLength(1);
  expect(savedFeedback[0].category).toBe("notebook_clarity");
  expect(savedFeedback[0].triageLane).toBe("follow_up_patch");
  expect(savedFeedback[0].transcriptText).toBeUndefined();
  expect(browserErrors).toEqual([]);
});
