import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "videos");
const RAW_DIR = path.join(OUT_DIR, "raw-v1");
const SLIDE_DIR = path.join(OUT_DIR, "slides", "layout-fix-v1");
const CAPTION_DIR = path.join(OUT_DIR, "captions");
const FRAME = { width: 780, height: 1688 };

mkdirSync(SLIDE_DIR, { recursive: true });
mkdirSync(CAPTION_DIR, { recursive: true });

const copy = {
  ru: {
    hook: {
      kicker: "Devpost AI Game Week",
      title: "Liarline",
      subtitle: "AI может лгать. Обвиняют только улики.",
      proof: "Модель играет. Движок судит."
    },
    problem: {
      kicker: "Почему это важно",
      title: "Во многих AI-играх модель сама судит, где правда.",
      subtitle: "Здесь подозреваемых играет модель, а улики, противоречия и финал решает локальный движок.",
      proof: "AI actor. Deterministic judge."
    },
    final: {
      kicker: "Честная граница",
      title: "Один мобильный детективный кейс.",
      subtitle: "В этом демо показаны AI-диалоги, локальная логика доказательств и детерминированный вердикт.",
      proof: "Devpost AI Game Week."
    },
    extractTimes: [1, 10.8, 17, 25.5, 38, 52]
  },
  en: {
    hook: {
      kicker: "Devpost AI Game Week",
      title: "Liarline",
      subtitle: "AI suspects can lie. Only evidence can convict.",
      proof: "Model performs. Engine judges."
    },
    problem: {
      kicker: "Why it matters",
      title: "Most AI detective games let the model judge the truth.",
      subtitle: "Here the model performs suspects. Evidence, contradiction, and verdict stay in the local engine.",
      proof: "AI actor. Deterministic judge."
    },
    final: {
      kicker: "Honest boundary",
      title: "One playable mobile detective case.",
      subtitle: "This demo shows AI dialogue, local evidence logic, and deterministic accusation scoring.",
      proof: "Devpost AI Game Week."
    },
    extractTimes: [1, 10.8, 17, 25.5, 37.5, 51]
  }
};

function html(slide) {
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
html,body{margin:0;width:${FRAME.width}px;height:${FRAME.height}px;background:#080a0d;color:#f4f6f8;font-family:Inter,Arial,sans-serif}
body{display:grid;place-items:center;background:
  radial-gradient(circle at 20% 8%,rgba(20,184,166,.24),transparent 34%),
  radial-gradient(circle at 84% 76%,rgba(251,113,133,.10),transparent 28%),
  linear-gradient(180deg,#080a0d,#10141a)}
.wrap{width:690px;min-height:600px;display:grid;align-content:center}
.card{border:1px solid #31404a;border-radius:14px;background:rgba(14,18,24,.94);padding:54px;box-shadow:0 34px 84px rgba(0,0,0,.56)}
.kicker{margin:0 0 26px;color:#5eead4;font:800 18px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.08em}
h1{font-size:64px;line-height:1.06;margin:0;font-weight:900;letter-spacing:0}
.subtitle{margin:30px 0 0;color:#cbd5e1;font-size:31px;line-height:1.28;font-weight:650}
.proof{margin-top:38px;border-top:1px solid #31404a;padding-top:22px;color:#fb7185;font:800 18px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.04em}
</style></head>
<body><main class="wrap"><section class="card">
<p class="kicker">${slide.kicker}</p>
<h1>${slide.title}</h1>
<p class="subtitle">${slide.subtitle}</p>
<div class="proof">${slide.proof}</div>
</section></main></body></html>`;
}

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

function duration(file) {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" }).trim());
}

function fileInfo(file) {
  return { path: file, bytes: statSync(file).size };
}

async function renderSlides() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: FRAME });
  for (const lang of ["ru", "en"]) {
    for (const variant of ["hook", "problem", "final"]) {
      await page.setContent(html(copy[lang][variant]), { waitUntil: "load" });
      await page.screenshot({ path: path.join(SLIDE_DIR, `${lang}-${variant}.png`), fullPage: false });
    }
  }
  await browser.close();
}

function moveCaptions(lang) {
  const oldPath = path.join(OUT_DIR, `liarline-demo-${lang}-v1-captions.srt`);
  const newPath = path.join(CAPTION_DIR, `liarline-demo-${lang}-v1-captions.srt`);
  if (existsSync(oldPath)) renameSync(oldPath, newPath);
  return newPath;
}

function repairVideo(lang) {
  const manifestPath = path.join(OUT_DIR, `liarline-demo-${lang}-v1-manifest.json`);
  const manifest = JSON.parse(awaitRead(manifestPath));
  const video = path.join(OUT_DIR, `liarline-demo-${lang}-v1.mp4`);
  const total = duration(video);
  const events = manifest.timeline;
  const problemStart = events[1].start;
  const liveStart = events[2].start;
  const finalStart = events[events.length - 1].start;
  const hookDur = problemStart;
  const problemDur = liveStart - problemStart;
  const finalDur = total - finalStart;
  const hook = path.join(SLIDE_DIR, `${lang}-hook.png`);
  const problem = path.join(SLIDE_DIR, `${lang}-problem.png`);
  const final = path.join(SLIDE_DIR, `${lang}-final.png`);
  const fixedMp4 = path.join(OUT_DIR, `liarline-demo-${lang}-v1-layout-fixed.mp4`);
  const fixedWebm = path.join(OUT_DIR, `liarline-demo-${lang}-v1-layout-fixed.webm`);
  const filter = [
    `[0:v]fps=30,format=yuv420p,setsar=1[v0]`,
    `[1:v]fps=30,format=yuv420p,setsar=1[v1]`,
    `[3:v]trim=start=${liveStart}:end=${finalStart},setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1[v2]`,
    `[2:v]fps=30,format=yuv420p,setsar=1[v3]`,
    `[v0][v1][v2][v3]concat=n=4:v=1:a=0[v]`
  ].join(";");
  run("ffmpeg", [
    "-y",
    "-loop", "1", "-t", String(hookDur), "-i", hook,
    "-loop", "1", "-t", String(problemDur), "-i", problem,
    "-loop", "1", "-t", String(finalDur), "-i", final,
    "-i", video,
    "-filter_complex", filter,
    "-map", "[v]",
    "-map", "3:a:0",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "23",
    "-preset", "medium",
    "-c:a", "copy",
    "-shortest",
    "-movflags", "+faststart",
    fixedMp4
  ]);
  run("ffmpeg", ["-y", "-i", fixedMp4, "-c:v", "libvpx-vp9", "-b:v", "1.4M", "-c:a", "libopus", "-b:a", "96k", fixedWebm]);
  renameSync(fixedMp4, video);
  renameSync(fixedWebm, path.join(OUT_DIR, `liarline-demo-${lang}-v1.webm`));

  const contact = path.join(OUT_DIR, `liarline-demo-${lang}-v1-contact-sheet.png`);
  run("ffmpeg", ["-y", "-i", video, "-vf", "fps=1/10,scale=260:-1,tile=3x3:padding=10:margin=10:color=black", "-frames:v", "1", contact]);

  const labels = ["hook", "briefing", "first-ai-answer", "ivo-pressure", "notebook-proof", "resolution"];
  copy[lang].extractTimes.forEach((time, index) => {
    const out = path.join(OUT_DIR, `liarline-demo-${lang}-v1-keyframe-${String(index + 1).padStart(2, "0")}.png`);
    run("ffmpeg", ["-y", "-ss", String(time), "-i", video, "-frames:v", "1", "-q:v", "2", out]);
    manifest.keyframes[index] = { file: out, label: labels[index] };
  });

  const captionPath = moveCaptions(lang);
  manifest.updatedAt = new Date().toISOString();
  manifest.verification = {
    ...manifest.verification,
    titleCardLayoutFixed: true,
    captionSrtMovedToAvoidPlayerAutoLoad: true,
    durationSeconds: Number(duration(video).toFixed(3))
  };
  manifest.generatedArtifacts = (manifest.generatedArtifacts || []).filter((item) => !item.path.endsWith("-captions.srt"));
  const must = [
    video,
    path.join(OUT_DIR, `liarline-demo-${lang}-v1.webm`),
    contact,
    captionPath,
    path.join(OUT_DIR, `liarline-demo-${lang}-v1-script.md`),
    path.join(OUT_DIR, `liarline-demo-${lang}-v1-voiceover.wav`),
    path.join(OUT_DIR, `liarline-demo-${lang}-v1-audio-mix.wav`),
    ...manifest.keyframes.map((item) => item.file),
    hook,
    problem,
    final
  ];
  const map = new Map(manifest.generatedArtifacts.map((item) => [item.path, item]));
  for (const file of must) if (existsSync(file)) map.set(file, fileInfo(file));
  manifest.generatedArtifacts = [...map.values()];
  manifest.notes = (manifest.notes || []).filter((note) => !note.includes("SRT is still included for platform captions"));
  manifest.notes.push("Opening/problem/final cards were replaced with full-frame 780x1688 slides after review; live UI and voice timeline were preserved.");
  manifest.notes.push("SRT captions were moved into docs/videos/captions to prevent local players from auto-loading oversized external subtitles over the burned-in presentation.");
  awaitWrite(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  return {
    lang,
    durationSeconds: manifest.verification.durationSeconds,
    mp4: video,
    webm: path.join(OUT_DIR, `liarline-demo-${lang}-v1.webm`),
    contactSheet: contact,
    captions: captionPath,
    script: path.join(OUT_DIR, `liarline-demo-${lang}-v1-script.md`),
    manifest: manifestPath,
    voiceover: path.join(OUT_DIR, `liarline-demo-${lang}-v1-voiceover.wav`),
    audioMix: path.join(OUT_DIR, `liarline-demo-${lang}-v1-audio-mix.wav`)
  };
}

function awaitRead(file) {
  return execFileSync(process.execPath, ["-e", `process.stdout.write(require('fs').readFileSync(${JSON.stringify(file)}, 'utf8'))`], { encoding: "utf8" });
}

function awaitWrite(file, content) {
  writeFileSync(file, content, "utf8");
}

await renderSlides();
const packages = [repairVideo("ru"), repairVideo("en")];

const bilingualPath = path.join(OUT_DIR, "liarline-demo-bilingual-v1-manifest.json");
const bilingual = JSON.parse(awaitRead(bilingualPath));
bilingual.updatedAt = new Date().toISOString();
bilingual.packages = packages;
bilingual.layoutRepair = {
  status: "applied",
  reason: "Initial title cards used a fixed 390px canvas inside a 780px export and looked pinned to the upper-left corner.",
  slideAssets: [
    path.join(SLIDE_DIR, "ru-hook.png"),
    path.join(SLIDE_DIR, "ru-problem.png"),
    path.join(SLIDE_DIR, "ru-final.png"),
    path.join(SLIDE_DIR, "en-hook.png"),
    path.join(SLIDE_DIR, "en-problem.png"),
    path.join(SLIDE_DIR, "en-final.png")
  ],
  srtCaptionsMovedTo: CAPTION_DIR
};
awaitWrite(bilingualPath, JSON.stringify(bilingual, null, 2) + "\n");

console.log(JSON.stringify({ status: "layout_fixed", packages }, null, 2));
