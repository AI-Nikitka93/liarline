import { expect, test } from "@playwright/test";

const baseUrl = process.env.LIARLINE_BASE_URL ?? "http://127.0.0.1:55046/";

function npcResult(payload: any, response: Record<string, unknown>) {
  return {
    ok: true,
    source: "groq",
    requestId: payload.requestId,
    model: payload.model,
    response: {
      answer_text: "I need a second. The timing looks clean until you compare it with the cart log.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 70,
      npc_mood: "nervous",
      notebook_hint: "Compare the statement with the timeline.",
      ...response
    },
    meta: {
      latencyMs: 410,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  };
}

async function forceEnglish(page: any) {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", "en");
  });
}

async function chooseEnglishIfNeeded(page: any) {
  if (await page.locator(".language-entry-screen").isVisible()) {
    await page.getByRole("button", { name: "English", exact: false }).click();
  }
}

test("phase 7 happy path reaches contradiction, accusation, and sharp resolution", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.route("**/api/npc-turn", async (route) => {
    const payload = route.request().postDataJSON();
    const suspectId = payload.npc.suspectId;
    const turnCount = payload.turn.recentTranscript.length;
    const response = suspectId === "suspect_theo"
      ? {
          answer_text: "I... I hit the camera before the theft. That does not explain the cart leaving later.",
          truthfulness: "partial",
          suspicion_delta: 3,
          revealed_clue_id: null,
          contradiction_risk: 78,
          npc_mood: "nervous",
          notebook_hint: "Camera panic does not explain the cart log."
        }
      : turnCount === 0
        ? {
            answer_text: "No, I was counting inventory. The cart log only makes that sound worse than it was.",
            truthfulness: "lie",
            suspicion_delta: 4,
            revealed_clue_id: "clue_ivo_gap",
            contradiction_risk: 84,
            npc_mood: "panicking",
            notebook_hint: "Ivo avoids the exact 21:10 movement."
          }
        : {
            answer_text: "Stop. The money message was private, and it has nothing to do with that cart.",
            truthfulness: "evasive",
            suspicion_delta: 3,
            revealed_clue_id: "clue_debt_message",
            contradiction_risk: 88,
            npc_mood: "panicking",
            notebook_hint: "The money message ties pressure to the missing prototype."
          };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(npcResult(payload, response))
    });
  });

  await forceEnglish(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await chooseEnglishIfNeeded(page);
  await page.locator(".first-question-cta").click();
  await expect(page.locator(".contradiction-reveal-stage")).toBeVisible();
  await expect(page.locator(".persona-shift-card")).toBeVisible();
  await expect(page.getByText("Strong", { exact: true })).toBeVisible();

  await page.locator('.mobile-action-dock button[aria-label="Open notebook"]').click();
  await expect(page.locator(".suspicion-signal-board")).toBeVisible();
  await expect(page.locator(".compact-evidence-surface").getByText("Camera break vs cart log")).toBeVisible();
  await page.locator('button[aria-label="Close notebook"]').click();

  await page.locator('.mobile-action-dock button:has-text("-1 AP")').first().click();
  await expect(page.locator("text=Ivo cannot account for several minutes near 21:10.")).toBeVisible();
  await page.locator('.mobile-action-dock button:has-text("-1 AP")').first().click();
  await expect(page.locator("text=A message hints Ivo needed money urgently.")).toBeVisible();

  await page.locator(".accusation-entry-button").click();
  await expect(page.locator(".accusation-risk-screen")).toBeVisible();
  await page.getByRole("button", { name: "Ivo", exact: true }).click();
  await page.getByRole("button", { name: "Debt pressure", exact: true }).click();
  await page.locator('button:has-text("Ivo cannot account")').click();
  await page.locator('button:has-text("money urgently")').click();
  await page.locator(".risk-acknowledge-checkbox input").check();
  await page.locator(".final-accusation-submit").click();

  await expect(page.locator(".resolution-complete-screen")).toBeVisible();
  await expect(page.locator("text=Sharp")).toBeVisible();
  await expect(page.locator("text=You named the thief, the motive, and enough evidence")).toBeVisible();
  await expect(page.locator("text=Ivo removes the prototype with the lab cart.")).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("phase 7 fallback path stays visible without creating gameplay progress", async ({ page }) => {
  await forceEnglish(page);
  await page.route("**/api/npc-turn", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "AI unavailable for fallback test" })
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await chooseEnglishIfNeeded(page);
  await page.locator(".first-question-cta").click();
  await expect(page.getByText("The witness stalls. No progress was applied.", { exact: true })).toBeVisible();
  await expect(page.locator(".ai-answer-badges")).toContainText("Guarded answer");
  await expect(page.locator(".witness-status-strip")).toContainText("Guarded answer");
  await expect(page.locator(".transcript-turn")).toHaveCount(1);
  await expect(page.locator(".accusation-entry-button")).toBeDisabled();
  await expect(page.locator("text=AP 9/9")).toBeVisible();
});

test("phase 7 restart ignores stale AI response from the previous run", async ({ page }) => {
  await forceEnglish(page);
  await page.route("**/api/npc-turn", async (route) => {
    const payload = route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 2500));
    try {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(npcResult(payload, {
          answer_text: "This stale answer must not appear after restart.",
          revealed_clue_id: "clue_camera_fault"
        }))
      });
    } catch {
      // The client may abort the stale request, which is the preferred path.
    }
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await chooseEnglishIfNeeded(page);
  await page.locator(".first-question-cta").click();
  await expect(page.locator(".thinking-scan")).toBeVisible();
  await page.getByRole("button", { name: "Restart", exact: true }).click({ timeout: 1000 });
  await expect(page.locator(".start-interrogation-surface")).toBeVisible();
  await page.waitForTimeout(900);
  await expect(page.locator("text=This stale answer must not appear after restart.")).toHaveCount(0);
  await expect(page.locator('[data-testid="transcript-stack"]')).toHaveCount(0);
  await expect(page.locator(".first-question-cta")).toBeVisible();
});
