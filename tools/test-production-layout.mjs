import assert from "node:assert/strict";
import { chromium } from "playwright";

const targetUrl = process.env.LIARLINE_PUBLIC_URL || process.env.LIARLINE_BASE_URL || "https://liarline.vercel.app/";
const minTapTargetPx = 44;
const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "desktop-1440", width: 1440, height: 1000 }
];

function summarizeTarget(target) {
  const label = target.ariaLabel || target.text || `${target.tag}${target.testId ? `[${target.testId}]` : ""}`;
  return `${label} ${target.width}x${target.height}`;
}

const browser = await chromium.launch();
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.locator(".language-entry-screen").waitFor({ state: "visible", timeout: 15000 });
    await page.getByRole("button", { name: /English/ }).click();
    await page.locator(".start-interrogation-surface").waitFor({ state: "visible", timeout: 15000 });
    await page.locator(".first-question-cta").waitFor({ state: "visible", timeout: 15000 });
    await page.locator(".mobile-action-dock").waitFor({ state: "visible", timeout: 15000 });

    const metrics = await page.evaluate((minTapTarget) => {
      const visibleControls = [...document.querySelectorAll("button, a, input, select, textarea, [role='button']")]
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const disabled = element instanceof HTMLButtonElement || element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement
            ? element.disabled
            : false;
          return !disabled && style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            testId: element.getAttribute("data-testid") || "",
            ariaLabel: element.getAttribute("aria-label") || "",
            text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        });

      const smallTargets = visibleControls.filter((control) => control.width < minTapTarget || control.height < minTapTarget);

      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        visibleControlCount: visibleControls.length,
        smallTargets
      };
    }, minTapTargetPx);

    assert.equal(consoleErrors.length, 0, `${viewport.name} console errors: ${consoleErrors.join(" | ")}`);
    assert.equal(pageErrors.length, 0, `${viewport.name} page errors: ${pageErrors.join(" | ")}`);
    assert.ok(metrics.documentWidth <= metrics.viewportWidth, `${viewport.name} has horizontal overflow: ${metrics.documentWidth} > ${metrics.viewportWidth}`);
    assert.equal(
      metrics.smallTargets.length,
      0,
      `${viewport.name} has tap targets below ${minTapTargetPx}px: ${metrics.smallTargets.map(summarizeTarget).join(", ")}`
    );

    results.push({
      viewport: viewport.name,
      documentWidth: metrics.documentWidth,
      visibleControlCount: metrics.visibleControlCount,
      smallTargetCount: metrics.smallTargets.length
    });

    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ ok: true, targetUrl, minTapTargetPx, results }, null, 2));
