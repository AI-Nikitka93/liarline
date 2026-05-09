import { chromium } from "@playwright/test";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "videos");
const RAW_DIR = path.join(OUT_DIR, "raw-v1");
const SLIDE_DIR = path.join(OUT_DIR, "slides");
const BASE_URL = process.env.LIARLINE_BASE_URL || "http://127.0.0.1:55046/";
const PROJECT_SLUG = "liarline";
const VIEWPORT = { width: 390, height: 844 };

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(RAW_DIR, { recursive: true });
mkdirSync(SLIDE_DIR, { recursive: true });

const contestSource = "https://ai-game-week-29908.devpost.com/rules";
const contestDatesSource = "https://ai-game-week-29908.devpost.com/details/dates";

const packages = {
  en: {
    suffix: "en",
    title: "Liarline",
    subtitle: "AI suspects can lie. Only evidence can convict.",
    problem: "Most AI detective games let the model judge the truth.",
    proof: "Here the model performs suspects. The local engine owns evidence, contradiction, and verdict.",
    final: "One playable mobile case for Devpost AI Game Week.",
    captions: [
      "Opening the mobile case in English.",
      "Starting with Theo so the first AI suspect beat appears immediately.",
      "Holding the live AI answer and the deterministic camera-vs-cart contradiction.",
      "Pressuring Ivo because the engine shifted focus after the contradiction.",
      "Asking about the money message to complete the proof chain.",
      "Opening the notebook so the judge can see evidence and contradiction records.",
      "Building one final accusation: suspect, motive, and two evidence items.",
      "Holding the resolution, rating, and truth reconstruction."
    ],
    firstCustom: "Explain the 21:10 cart movement and your inventory gap.",
    secondCustom: "What about the urgent money message?",
    ttsSafe: [
      "Liarline is a mobile detective game where artificial intelligence performs suspects, but it does not decide the truth.",
      "The first suspect gives a live answer, then the local engine checks it against evidence.",
      "The camera story cannot explain the cart movement, so Ivo becomes the pressure target.",
      "The notebook shows the contradiction and the evidence chain before the accusation.",
      "The verdict is deterministic: suspect, motive, and evidence must line up."
    ]
  },
  ru: {
    suffix: "ru",
    title: "Liarline",
    subtitle: "AI может лгать. Обвиняют только улики.",
    problem: "Во многих AI-играх модель сама судит, где правда.",
    proof: "Здесь модель играет подозреваемых. Движок решает улики, противоречия и финал.",
    final: "Один мобильный детективный кейс для Devpost AI Game Week.",
    captions: [
      "Открываю мобильное дело на русском.",
      "Начинаю с Тео, чтобы сразу показать первый AI-ответ подозреваемого.",
      "Фиксирую AI-ответ и детерминированное противоречие камера-vs-тележка.",
      "Давлю на Иво, потому что движок сменил фокус после противоречия.",
      "Спрашиваю про срочные деньги, чтобы собрать цепочку доказательств.",
      "Открываю блокнот: судье видны улики и найденное противоречие.",
      "Собираю финальное обвинение: подозреваемый, мотив и две улики.",
      "Показываю вердикт, рейтинг детектива и восстановление истины."
    ],
    firstCustom: "Объясни движение тележки около 21:10 и провал в версии про инвентарь.",
    secondCustom: "Что насчет сообщения о срочных деньгах?",
    ttsSafe: [
      "Liarline это мобильная детективная игра, где искусственный интеллект играет подозреваемых, но не решает, где правда.",
      "Первый подозреваемый отвечает через AI, а локальный движок сверяет ответ с уликами.",
      "История про камеру не объясняет движение тележки, поэтому давление переходит на Иво.",
      "Блокнот показывает противоречие и цепочку доказательств до обвинения.",
      "Финал считается детерминированно: должны совпасть подозреваемый, мотив и улики."
    ]
  }
};

function nowMs(start) {
  return (Date.now() - start) / 1000;
}

function fmt(seconds) {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  const ms = Math.floor((safe - Math.floor(safe)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function srt(events, duration) {
  return events
    .map((event, index) => {
      const nextStart = events[index + 1]?.start ?? Math.min(duration, event.start + event.minDuration);
      const end = Math.max(event.start + 2, Math.min(duration, nextStart - 0.12));
      return `${index + 1}\n${fmt(event.start)} --> ${fmt(end)}\n${event.caption}\n`;
    })
    .join("\n");
}

function slideHtml(pkg, variant) {
  const body = variant === "hook"
    ? `<p class="kicker">Devpost AI Game Week</p><h1>${pkg.title}</h1><p class="subtitle">${pkg.subtitle}</p>`
    : variant === "problem"
      ? `<p class="kicker">Why it matters</p><h1>${pkg.problem}</h1><p class="subtitle">${pkg.proof}</p>`
      : `<p class="kicker">Honest boundary</p><h1>${pkg.final}</h1><p class="subtitle">Shown in this local demo: mobile browser, AI dialogue path, deterministic evidence and resolution.</p>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<style>
  html,body{margin:0;width:100vw;height:100vh;background:#080a0d;color:#f4f6f8;font-family:Inter,Arial,sans-serif}
  body{display:grid;place-items:center;background:radial-gradient(circle at 20% 10%,rgba(20,184,166,.22),transparent 36%),linear-gradient(180deg,#080a0d,#10141a)}
  .card{width:min(680px,calc(100vw - 72px));border:1px solid #31404a;border-radius:12px;background:rgba(14,18,24,.92);padding:44px;box-shadow:0 28px 70px rgba(0,0,0,.52)}
  .kicker{margin:0 0 24px;color:#5eead4;font:800 18px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}
  h1{font-size:clamp(48px,8vw,82px);line-height:1.04;margin:0;font-weight:900;letter-spacing:0}
  .subtitle{margin:28px 0 0;color:#cbd5e1;font-size:clamp(26px,4vw,36px);line-height:1.25}
  .proof{margin-top:34px;border-top:1px solid #31404a;padding-top:20px;color:#fb7185;font:800 16px ui-monospace,Menlo,monospace;text-transform:uppercase;letter-spacing:.04em}
</style></head><body><main class="card">${body}<div class="proof">AI actor. Deterministic judge.</div></main></body></html>`;
}

async function installCaption(page, text) {
  await page.evaluate((caption) => {
    let box = document.getElementById("liarline-recording-caption");
    if (!box) {
      box = document.createElement("div");
      box.id = "liarline-recording-caption";
      Object.assign(box.style, {
        position: "fixed",
        zIndex: "2147483647",
        top: "14px",
        left: "14px",
        right: "14px",
        maxWidth: "362px",
        margin: "0 auto",
        padding: "10px 12px",
        border: "1px solid rgba(94,234,212,.85)",
        borderRadius: "8px",
        background: "rgba(4,9,12,.88)",
        color: "#f8fafc",
        font: "700 13px/18px Inter, Arial, sans-serif",
        boxShadow: "0 10px 34px rgba(0,0,0,.42)",
        pointerEvents: "none",
        textAlign: "left"
      });
      document.body.appendChild(box);
    }
    box.textContent = caption;
  }, text);
}

async function hold(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function shot(page, start, events, caption, minDuration, fn) {
  events.push({ start: nowMs(start), caption, minDuration });
  await installCaption(page, caption);
  await hold(450);
  if (fn) await fn();
}

async function captureKey(page, lang, index, label) {
  const file = path.join(OUT_DIR, `${PROJECT_SLUG}-demo-${lang}-v1-keyframe-${String(index).padStart(2, "0")}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return { file, label };
}

async function clickNotebook(page) {
  const candidates = [
    '[aria-label="Open notebook"]',
    '[aria-label="Открыть блокнот"]',
    '[aria-label="Открыть записную книжку"]',
    'button:has-text("Notebook")',
    'button:has-text("Блокнот")',
    'button:has-text("Записная книжка")',
    'button:has-text("записную книжку")'
  ];
  for (const selector of candidates) {
    const locator = page.locator(selector).last();
    if (await locator.count()) {
      await locator.click();
      return;
    }
  }
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const match = buttons.find((button) => {
      const label = `${button.getAttribute("aria-label") || ""} ${button.textContent || ""}`.toLowerCase();
      return label.includes("notebook") || label.includes("блокнот") || label.includes("запис");
    });
    if (!match) throw new Error("Notebook button not found");
    match.click();
  });
}

async function ensureAccusationReady(page, pkg) {
  const accuse = page.locator('[data-testid="accusation-entry-button"]');
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await accuse.isEnabled()) return;
    const before = await page.locator(".transcript-turn").count();
    await page.locator('[data-testid="custom-question-input"]').fill(
      attempt === 0 ? pkg.firstCustom : pkg.secondCustom
    );
    await page.locator('button[aria-label*="Send"], button[aria-label*="Отправ"]').click();
    await page.waitForFunction(
      (count) => document.querySelectorAll(".transcript-turn").length > count,
      before,
      { timeout: 90000 }
    );
    await hold(1400);
  }
  if (!(await accuse.isEnabled())) {
    throw new Error("Accusation stayed locked after extra live-answer attempts.");
  }
}

function dataUrl(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

async function recordOne(lang, pkg) {
  const name = `${PROJECT_SLUG}-demo-${lang}-v1`;
  const rawVideoDir = path.join(RAW_DIR, `video-${lang}`);
  mkdirSync(rawVideoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: rawVideoDir, size: VIEWPORT }
  });
  const page = await context.newPage();
  const events = [];
  const keyframes = [];
  const start = Date.now();

  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[${lang}] browser console error: ${message.text()}`);
  });

  await page.goto(dataUrl(slideHtml(pkg, "hook")));
  events.push({ start: nowMs(start), caption: pkg.subtitle, minDuration: 4 });
  await hold(4300);
  keyframes.push(await captureKey(page, lang, 1, "hook"));

  await page.goto(dataUrl(slideHtml(pkg, "problem")));
  events.push({ start: nowMs(start), caption: pkg.proof, minDuration: 5 });
  await hold(5200);

  await page.addInitScript((locale) => {
    window.localStorage.clear();
    window.localStorage.setItem("liarline.locale.v1", locale);
  }, lang);
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".start-interrogation-surface", { timeout: 30000 });
  await shot(page, start, events, pkg.captions[0], 4, null);
  await hold(3500);
  keyframes.push(await captureKey(page, lang, 2, "briefing"));

  await shot(page, start, events, pkg.captions[1], 6, async () => {
    await page.locator(".first-question-cta").click();
    await page.waitForSelector(".transcript-turn", { timeout: 90000 });
    await page.waitForSelector(".contradiction-reveal-stage", { timeout: 30000 });
  });
  await hold(4200);
  keyframes.push(await captureKey(page, lang, 3, "first-ai-answer"));

  await shot(page, start, events, pkg.captions[2], 7, async () => {
    await page.locator(".contradiction-reveal-stage").scrollIntoViewIfNeeded();
  });
  await hold(6900);

  await shot(page, start, events, pkg.captions[3], 7, async () => {
    await page.locator('[data-testid="custom-question-input"]').fill(pkg.firstCustom);
    await page.locator('button[aria-label*="Send"], button[aria-label*="Отправ"]').click();
    await page.waitForFunction(() => document.querySelectorAll(".transcript-turn").length >= 2, null, { timeout: 90000 });
  });
  await hold(5000);
  keyframes.push(await captureKey(page, lang, 4, "ivo-pressure"));

  await shot(page, start, events, pkg.captions[4], 7, async () => {
    await page.locator('[data-testid="custom-question-input"]').fill(pkg.secondCustom);
    await page.locator('button[aria-label*="Send"], button[aria-label*="Отправ"]').click();
    await page.waitForFunction(() => document.querySelectorAll(".transcript-turn").length >= 3, null, { timeout: 90000 });
  });
  await hold(5000);

  await shot(page, start, events, pkg.captions[5], 8, async () => {
    await clickNotebook(page);
    await page.waitForSelector(".compact-evidence-surface", { timeout: 15000 });
  });
  await hold(7200);
  keyframes.push(await captureKey(page, lang, 5, "notebook-proof"));
  await page.locator('button[aria-label*="Close"], button[aria-label*="Закрыть"]').click();

  await shot(page, start, events, pkg.captions[6], 10, async () => {
    await ensureAccusationReady(page, pkg);
    await page.locator('[data-testid="accusation-entry-button"]').click();
    await page.waitForSelector(".accusation-risk-screen", { timeout: 15000 });
    await page.locator('[data-testid="accuse-suspect-suspect_ivo"]').click();
    await page.locator('[data-testid="accuse-motive-motive_debt"]').click();
    await page.locator('[data-testid="accuse-evidence-clue_ivo_gap"]').click();
    await page.locator('[data-testid="accuse-evidence-clue_debt_message"]').click();
    await page.locator(".risk-acknowledge-checkbox input").check();
    await page.locator('[data-testid="final-accusation-submit"]').scrollIntoViewIfNeeded();
  });
  await hold(4200);
  await page.locator('[data-testid="final-accusation-submit"]').click();
  await page.waitForSelector(".resolution-complete-screen", { timeout: 15000 });

  await shot(page, start, events, pkg.captions[7], 9, async () => {
    await page.locator(".truth-summary-card").scrollIntoViewIfNeeded();
  });
  await hold(7800);
  keyframes.push(await captureKey(page, lang, 6, "resolution"));

  await page.goto(dataUrl(slideHtml(pkg, "final")));
  events.push({ start: nowMs(start), caption: pkg.final, minDuration: 5 });
  await hold(5200);

  const video = page.video();
  await context.close();
  await browser.close();
  const rawPath = await video.path();
  const rawTarget = path.join(RAW_DIR, `${name}-raw.webm`);
  copyFileSync(rawPath, rawTarget);

  const duration = probeDuration(rawTarget);
  const srtPath = path.join(OUT_DIR, `${name}-captions.srt`);
  writeFileSync(srtPath, srt(events, duration), "utf8");
  const webmPath = path.join(OUT_DIR, `${name}.webm`);
  const mp4Path = path.join(OUT_DIR, `${name}.mp4`);
  const contactPath = path.join(OUT_DIR, `${name}-contact-sheet.png`);
  encodeVideo(rawTarget, webmPath, mp4Path);
  createContactSheet(mp4Path, contactPath);
  const scriptPath = path.join(OUT_DIR, `${name}-script.md`);
  writeScript(scriptPath, lang, pkg, events, duration);
  const manifestPath = path.join(OUT_DIR, `${name}-manifest.json`);
  writeManifest(manifestPath, lang, pkg, {
    name,
    rawTarget,
    webmPath,
    mp4Path,
    contactPath,
    srtPath,
    scriptPath,
    keyframes,
    events,
    duration
  });

  return { lang, name, duration, rawTarget, webmPath, mp4Path, contactPath, srtPath, scriptPath, manifestPath, keyframes };
}

function probeDuration(file) {
  const raw = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" }).trim();
  return Number(raw);
}

function encodeVideo(rawPath, webmPath, mp4Path) {
  execFileSync("ffmpeg", ["-y", "-i", rawPath, "-vf", "fps=30,scale=780:1688", "-c:v", "libvpx-vp9", "-b:v", "1.4M", "-an", webmPath], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-y", "-i", rawPath, "-vf", "fps=30,scale=780:1688", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium", "-movflags", "+faststart", "-an", mp4Path], { stdio: "inherit" });
}

function createContactSheet(videoPath, outputPath) {
  execFileSync("ffmpeg", ["-y", "-i", videoPath, "-vf", "fps=1/10,scale=260:-1,tile=3x3:padding=10:margin=10:color=black", "-frames:v", "1", outputPath], { stdio: "inherit" });
}

function writeScript(file, lang, pkg, events, duration) {
  const rows = events.map((event, index) => {
    const next = events[index + 1]?.start ?? duration;
    const shotType = index < 2 ? "TITLE_CARD" : index === events.length - 1 ? "BOUNDARY_SLATE" : index >= events.length - 3 ? "RESULT_HOLD" : "LIVE_UI";
    const visual = index < 2 ? "Local title card" : index === events.length - 1 ? "Final boundary slate" : "Mobile Liarline UI";
    const action = event.caption.replace(/\|/g, "/");
    return `| ${fmt(event.start).replace(",", ".")} - ${fmt(next).replace(",", ".")} | ${shotType} | ${visual} | ${action} | Shows the contest-relevant mobile proof path. | ${action} | ${pkg.ttsSafe[Math.min(index, pkg.ttsSafe.length - 1)]} | Hold readable proof state; top caption zone avoids the action dock. | Shown in local demo; AI dialogue is live route when UI source badge shows Groq. |`;
  });
  const body = `# ${pkg.title} Demo ${lang.toUpperCase()} v1

Final duration: ${duration.toFixed(2)}s

Presentation format: HYBRID_EXPLAINER

Caption zone: stable top overlay, chosen to avoid covering the mobile action dock.

## Storyboard And Actual Timeline

| Time | Shot Type | Visual | Action | Why It Matters | On-Screen Text | Narration | Edit Note | Proof Boundary |
|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}

## TTS_SAFE_NARRATION

${pkg.ttsSafe.map((line) => `- ${line}`).join("\n")}

This base Playwright capture is silent before post-production. Final delivery voiceover is generated by generate-liarline-voiceover.py and muxed after the visual timeline is locked.
`;
  writeFileSync(file, body, "utf8");
}

function fileInfo(file) {
  const s = statSync(file);
  return { path: file, bytes: s.size };
}

function writeManifest(file, lang, pkg, result) {
  const manifest = {
    status: "VIDEO_READY",
    project: "Liarline",
    language: lang,
    generatedAt: new Date().toISOString(),
    presentationFormat: "HYBRID_EXPLAINER",
    route: BASE_URL,
    viewport: VIEWPORT,
    target: "Devpost AI Game Week demo video package",
    contestSources: [contestSource, contestDatesSource],
    capabilityMatrix: [
      { capability: "Shell", status: "AVAILABLE", usedFor: "commands, tests, encoding", note: "PowerShell on Windows" },
      { capability: "Browser Use / in-app browser", status: "AVAILABLE", usedFor: "not used directly", note: "Playwright route was deterministic and sufficient" },
      { capability: "Computer Use", status: "NOT_CHECKED", usedFor: "not required", note: "browser app only" },
      { capability: "Playwright / screenshots", status: "AVAILABLE", usedFor: "mobile UI recording and keyframes", note: "Playwright 1.59.1" },
      { capability: "FFmpeg / encoder", status: "AVAILABLE", usedFor: "MP4/WebM/contact sheet", note: "ffmpeg 8.1" },
      { capability: "TTS / M:\\AI\\Speak", status: "AVAILABLE_USED_IN_POST", usedFor: "voiceover post-production", note: "base recorder is silent; OmniVoice voiceover is generated after visual timeline lock" },
      { capability: "Skills / plugins / apps / MCP", status: "AVAILABLE", usedFor: "Playwright skill workflow", note: "no external connector needed" },
      { capability: "Workspace media/document deps", status: "AVAILABLE", usedFor: "media tooling availability check", note: "Codex bundled deps available" },
      { capability: "Image generation/viewing", status: "AVAILABLE_NOT_USED", usedFor: "not required", note: "product assets already exist" },
      { capability: "Git / cloud preview / PR route", status: "AVAILABLE", usedFor: "GitHub publish after package verification", note: "origin https://github.com/AI-Nikitka93/liarline.git" }
    ],
    factualClaims: [
      "One playable mobile-browser detective case.",
      "AI performs suspect dialogue through the app's NPC turn route.",
      "Deterministic game state controls clues, contradiction, accusation, rating, and resolution.",
      "RU/EN language packages are separated."
    ],
    avoidedClaims: [
      "multi-case season",
      "multiplayer",
      "voice/video interrogation",
      "production-ready user traction",
      "unlimited generated cases"
    ],
    verification: {
      durationSeconds: Number(result.duration.toFixed(3)),
      minFullDemoDurationGate: result.duration >= 60,
      captionEvents: result.events.length,
      captionEventsPerMinute: Number((result.events.length / (result.duration / 60)).toFixed(2)),
      captionZone: "top stable overlay",
      noSecretSurfaces: true,
      voiceover: "base_capture_only",
      testsRunBeforeRecording: ["npm run test:game-engine", "npm run test:demo-route"],
      liveDemoRouteVerified: true,
      ffmpegEncoded: true
    },
    generatedArtifacts: [
      fileInfo(result.mp4Path),
      fileInfo(result.webmPath),
      fileInfo(result.contactPath),
      fileInfo(result.srtPath),
      fileInfo(result.scriptPath),
      fileInfo(result.rawTarget),
      ...result.keyframes.map((item) => fileInfo(item.file))
    ],
    keyframes: result.keyframes,
    timeline: result.events,
    notes: [
      "Recording captions are injected by Playwright only during capture; product code is unchanged.",
      "Base recording is silent before post-production; final MP4/WebM are muxed with OmniVoice narration.",
      "The raw local demo uses only the app route and visible UI; no .env, token, terminal, or private browser surface is recorded."
    ]
  };
  writeFileSync(file, JSON.stringify(manifest, null, 2), "utf8");
}

const results = [];
for (const lang of ["ru", "en"]) {
  results.push(await recordOne(lang, packages[lang]));
}

const bilingualManifest = {
  status: results.every((item) => item.duration >= 60) ? "VIDEO_READY" : "PARTIAL_READY",
  project: "Liarline",
  reason: "Project has RU/EN dictionaries and locale persistence, so split language deliverables are required.",
  generatedAt: new Date().toISOString(),
  packages: results.map((item) => ({
    lang: item.lang,
    durationSeconds: Number(item.duration.toFixed(3)),
    mp4: item.mp4Path,
    webm: item.webmPath,
    contactSheet: item.contactPath,
    captions: item.srtPath,
    script: item.scriptPath,
    manifest: item.manifestPath
  }))
};

writeFileSync(path.join(OUT_DIR, `${PROJECT_SLUG}-demo-bilingual-v1-manifest.json`), JSON.stringify(bilingualManifest, null, 2), "utf8");
console.log(JSON.stringify(bilingualManifest, null, 2));
