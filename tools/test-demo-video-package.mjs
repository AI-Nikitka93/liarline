import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const videosDir = path.join(root, "docs", "videos");
const expectedPublicUrl = "https://liarline.vercel.app/";
const maxVideoBytes = 50 * 1024 * 1024;
const windowsRepoPrefix = /^M:\\Projects\\Konkurs\\AI Game Week\\/i;

function normalizeUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function mustExist(file, minBytes = 1) {
  assert.ok(existsSync(file), `missing video package artifact: ${file}`);
  const size = statSync(file).size;
  assert.ok(size >= minBytes, `video package artifact is too small: ${file} (${size} bytes)`);
  return size;
}

function repoPath(file) {
  return file.replace(windowsRepoPrefix, "").replace(/\\/g, "/");
}

function resolveArtifactPath(file) {
  if (path.isAbsolute(file) && existsSync(file)) return file;
  const localPath = path.join(root, repoPath(file));
  return localPath;
}

function isOptionalLocalArtifact(file) {
  const normalized = repoPath(file);
  return normalized.startsWith("docs/videos/raw-v1/") || normalized.includes("/slides/layout-fix-v1/");
}

function readJson(file) {
  return JSON.parse(execFileSync(process.execPath, ["-e", `process.stdout.write(JSON.stringify(require(${JSON.stringify(file)})))`], {
    encoding: "utf8"
  }));
}

function probe(file) {
  return JSON.parse(execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate",
    "-of", "json",
    file
  ], { encoding: "utf8" }));
}

function volume(file) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "NUL"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `ffmpeg volumedetect failed for ${file}: ${result.stderr}`);
  const output = `${result.stdout}\n${result.stderr}`;
  const mean = output.match(/mean_volume:\s*(-?\d+(?:\.\d+)?) dB/);
  const max = output.match(/max_volume:\s*(-?\d+(?:\.\d+)?) dB/);
  return {
    mean: mean ? Number(mean[1]) : Number.NaN,
    max: max ? Number(max[1]) : Number.NaN
  };
}

function assertCoreVideo(file, lang) {
  const meta = probe(file);
  const video = meta.streams.find((stream) => stream.codec_type === "video");
  const audio = meta.streams.find((stream) => stream.codec_type === "audio");
  const duration = Number(meta.format.duration);
  const size = Number(meta.format.size);

  assert.ok(duration >= 60 && duration <= 180, `${lang} demo video must be 1-3 minutes, got ${duration}s`);
  assert.ok(size > 1_000_000 && size <= maxVideoBytes, `${lang} demo video size is outside release range: ${size}`);
  assert.equal(video?.codec_name, "h264", `${lang} MP4 must be H.264`);
  assert.equal(video?.width, 780, `${lang} MP4 must keep repaired portrait width`);
  assert.equal(video?.height, 1688, `${lang} MP4 must keep repaired portrait height`);
  assert.equal(video?.avg_frame_rate, "30/1", `${lang} MP4 must be 30fps`);
  assert.equal(audio?.codec_name, "aac", `${lang} MP4 must include AAC narration audio`);

  const audioLevel = volume(file);
  assert.ok(audioLevel.mean > -35 && audioLevel.mean < -12, `${lang} narration mean volume is out of range: ${audioLevel.mean} dB`);
  assert.ok(audioLevel.max <= -1 && audioLevel.max > -12, `${lang} narration peak is unsafe or too low: ${audioLevel.max} dB`);
}

function assertScript(script, lang) {
  const common = [
    "AI",
    "contradiction",
    "Notebook",
    "accusation",
    "Resolution",
    "One playable mobile"
  ];
  const ru = [
    "AI-ответ",
    "противоречие",
    "блокнот",
    "обвинение",
    "вердикт",
    "Один мобильный"
  ];
  for (const phrase of (lang === "ru" ? ru : common)) {
    assert.ok(script.toLowerCase().includes(phrase.toLowerCase()), `${lang} script misses demo beat: ${phrase}`);
  }
  for (const forbidden of ["multi-case season", "multiplayer", "voice/video interrogation", "unlimited generated cases"]) {
    assert.ok(!script.toLowerCase().includes(`includes ${forbidden}`), `${lang} script must not overclaim ${forbidden}`);
  }
}

const state = await readFile(path.join(root, "docs", "STATE.md"), "utf8");
const deployId = state.match(/production deploy `(dpl_[^`]+)`/)?.[1];
assert.ok(deployId, "STATE.md must expose the current production deploy id before video package validation");

const bilingualPath = path.join(videosDir, "liarline-demo-bilingual-v1-manifest.json");
mustExist(bilingualPath, 1000);
const bilingual = readJson(bilingualPath);
assert.equal(bilingual.status, "VIDEO_READY", "bilingual video manifest must be ready");
assert.equal(bilingual.productionDeployId, deployId, "bilingual video manifest must match current production deploy");
assert.equal(normalizeUrl(bilingual.recordedAgainstPublicUrl || ""), expectedPublicUrl, "bilingual video package must be recorded from production alias");

for (const lang of ["en", "ru"]) {
  const base = path.join(videosDir, `liarline-demo-${lang}-v1`);
  const manifestPath = `${base}-manifest.json`;
  const mp4 = `${base}.mp4`;
  const webm = `${base}.webm`;
  const contact = `${base}-contact-sheet.png`;
  const scriptPath = `${base}-script.md`;
  const voiceover = `${base}-voiceover.wav`;
  const audioMix = `${base}-audio-mix.wav`;
  const captions = path.join(videosDir, "captions", `liarline-demo-${lang}-v1-captions.srt`);

  for (const file of [manifestPath, mp4, webm, contact, scriptPath, voiceover, audioMix, captions]) {
    mustExist(file, file.endsWith(".json") || file.endsWith(".md") || file.endsWith(".srt") ? 100 : 100_000);
  }

  const manifest = readJson(manifestPath);
  assert.equal(manifest.status, "VIDEO_READY", `${lang} manifest must be ready`);
  assert.equal(manifest.project, "Liarline", `${lang} manifest must identify project`);
  assert.equal(manifest.language, lang, `${lang} manifest language mismatch`);
  assert.equal(normalizeUrl(manifest.route), expectedPublicUrl, `${lang} video must be recorded against production alias`);
  assert.equal(manifest.productionDeployId, deployId, `${lang} manifest must match current production deploy`);
  assert.equal(normalizeUrl(manifest.verification.recordedAgainstPublicUrl || ""), expectedPublicUrl, `${lang} verification must record public alias`);
  assert.equal(manifest.verification.productionDeployId, deployId, `${lang} verification must record current deploy id`);
  assert.equal(manifest.verification.minFullDemoDurationGate, true, `${lang} must pass min duration gate`);
  assert.equal(manifest.verification.noSecretSurfaces, true, `${lang} must assert no secret surfaces`);
  assert.equal(manifest.verification.liveDemoRouteVerified, true, `${lang} must use live demo route`);
  assert.equal(manifest.verification.ffmpegEncoded, true, `${lang} must be ffmpeg encoded`);
  assert.equal(manifest.verification.audioStreamPresent, true, `${lang} must include audio stream`);
  assert.equal(manifest.verification.titleCardLayoutFixed, true, `${lang} must include repaired title cards`);
  assert.equal(manifest.verification.captionSrtMovedToAvoidPlayerAutoLoad, true, `${lang} must move SRT captions out of player autoload path`);
  assert.ok(new Date(manifest.generatedAt).getTime() >= Date.UTC(2026, 5, 2), `${lang} video package is stale before the current production push`);

  for (const avoided of ["multi-case season", "multiplayer", "voice/video interrogation", "unlimited generated cases"]) {
    assert.ok(manifest.avoidedClaims.includes(avoided), `${lang} manifest must preserve no-overclaim boundary: ${avoided}`);
  }

  assert.equal(manifest.keyframes.length, 6, `${lang} package must include six keyframes`);
  const resolutionEvent = manifest.timeline.find((event) => /resolution|вердикт/i.test(event.caption));
  const finalSlateEvent = manifest.timeline.find((event) => /one playable|один мобильный/i.test(event.caption));
  const resolutionKeyframe = manifest.keyframes.find((keyframe) => keyframe.label === "resolution");
  assert.ok(resolutionEvent, `${lang} timeline must include resolution event`);
  assert.ok(finalSlateEvent, `${lang} timeline must include final boundary slate`);
  assert.ok(
    resolutionKeyframe?.timeSeconds > resolutionEvent.start && resolutionKeyframe.timeSeconds < finalSlateEvent.start,
    `${lang} resolution keyframe must be sampled from resolution window`
  );
  for (let index = 1; index <= 6; index += 1) {
    mustExist(`${base}-keyframe-${String(index).padStart(2, "0")}.png`, 100_000);
  }

  assertCoreVideo(mp4, lang);
  mustExist(webm, 1_000_000);
  const captionsText = await readFile(captions, "utf8");
  const captionCount = captionsText.split(/\r?\n/).filter((line) => /^\d+$/.test(line.trim())).length;
  assert.ok(captionCount >= 8 && captionCount <= 14, `${lang} captions should be paced, got ${captionCount} events`);
  assertScript(await readFile(scriptPath, "utf8"), lang);

  for (const artifact of manifest.generatedArtifacts || []) {
    if (isOptionalLocalArtifact(artifact.path)) continue;
    mustExist(resolveArtifactPath(artifact.path), 1);
  }
}

console.log("demo video package checks passed");
