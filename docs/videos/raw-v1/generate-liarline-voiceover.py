from __future__ import annotations

import json
import math
import os
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

ROOT = Path.cwd()
VIDEOS = ROOT / "docs" / "videos"
RAW = VIDEOS / "raw-v1"
VOICE_REFS = RAW / "voice-refs" / "liarline"
AUDITIONS = RAW / "voice-auditions"
OMNI_ROOT = Path(r"M:\AI\Speak\OmniVoice-master")
VOICE_LIB = Path(r"M:\AI\Speak\База голосов\Русские\!_БРАТЬ_ВСЕ_РУССКИЕ_ГОЛОСА_ОТСЮДА")

VOICE_REFS.mkdir(parents=True, exist_ok=True)
AUDITIONS.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(OMNI_ROOT))

from omnivoice import OmniVoice, OmniVoiceGenerationConfig  # noqa: E402


@dataclass
class Candidate:
    id: str
    source: Path | None
    mode: str
    voice: str
    language_fit: int
    naturalness: int
    clarity: int
    noise: int
    speed_stability: int
    robot_risk: int
    note: str


RU_SCRIPT = [
    ("00:00:00,600", "00:00:08,600", "Liarline это мобильный детектив. Модель играет подозреваемых, а правду решает движок."),
    ("00:00:09,200", "00:00:14,700", "Сразу видим дело: камера отказала, и версия Тео не сходится."),
    ("00:00:15,200", "00:00:24,500", "Модель дает ответ. Противоречие камеры и тележки открывает локальная логика."),
    ("00:00:25,100", "00:00:35,500", "Фокус переходит на Иво: провал в двадцать один десять и срочные деньги."),
    ("00:00:36,200", "00:00:46,300", "В блокноте видны улики, противоречие и закрытые части дела."),
    ("00:00:47,000", "00:00:58,800", "В финале нужны подозреваемый, мотив и две улики. Модель не заменяет доказательства."),
    ("00:00:59,400", "00:01:10,500", "Вердикт считает движок. Это честный мобильный кейс для Devpost AI Game Week."),
]

EN_SCRIPT = [
    ("00:00:00,600", "00:00:08,100", "Liarline is a mobile AI detective game. The model plays suspects, but the engine owns truth."),
    ("00:00:08,700", "00:00:14,400", "The case starts fast: the camera failed, and Theo is under pressure."),
    ("00:00:15,000", "00:00:24,200", "The AI gives the answer. The local logic opens the camera and cart contradiction."),
    ("00:00:24,800", "00:00:35,200", "Pressure shifts to Ivo: a twenty one ten gap, and an urgent money motive."),
    ("00:00:36,000", "00:00:46,000", "The notebook shows evidence, contradiction, and what is still hidden."),
    ("00:00:46,700", "00:00:58,300", "The final accusation needs a suspect, a motive, and two evidence items."),
    ("00:00:59,100", "00:01:09,800", "The engine scores the verdict. One honest mobile case for Devpost AI Game Week."),
]


def parse_time(value: str) -> float:
    h, m, rest = value.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def ffprobe_duration(path: Path) -> float:
    return float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path)
    ], text=True).strip())


def convert_ref(src: Path, dst: Path) -> Path:
    if dst.exists():
        return dst
    shutil.copy2(src, dst.with_suffix(src.suffix.lower()))
    copied = dst.with_suffix(src.suffix.lower())
    wav = dst.with_suffix(".wav")
    subprocess.check_call([
        "ffmpeg", "-y", "-i", str(copied), "-t", "8", "-ar", "24000", "-ac", "1",
        "-af", "loudnorm=I=-18:TP=-2:LRA=11", str(wav)
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return wav


def load_model():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map=device, dtype=dtype, load_asr=True)
    return model, device


def gen(model, text: str, out: Path, *, ref_audio: Path | None = None, voice: str = "", language: str = "auto", speed: float = 1.0, steps: int = 24):
    cfg = OmniVoiceGenerationConfig(
        num_step=steps,
        guidance_scale=2.0,
        denoise=True,
        preprocess_prompt=True,
        postprocess_output=False,
        class_temperature=0.1,
        position_temperature=5.0,
    )
    safe = text.strip()
    if safe and safe[-1] not in ".!?…":
        safe += "."
    safe += " ^."
    kwargs = {"text": safe, "generation_config": cfg}
    if language not in ("", "auto"):
        kwargs["language"] = language
    if speed != 1.0:
        kwargs["speed"] = speed
    if ref_audio:
        kwargs["ref_audio"] = str(ref_audio)
    elif voice:
        kwargs["instruct"] = voice
    result = model.generate(**kwargs)
    wav = result[0].squeeze(0).detach().cpu().numpy().astype(np.float32)
    wav = repair_wave(wav)
    sf.write(out, wav, 24000)
    return audio_metrics(out)


def repair_wave(wav: np.ndarray) -> np.ndarray:
    if wav.size == 0:
        raise RuntimeError("empty audio")
    wav = wav - float(np.mean(wav))
    peak = float(np.max(np.abs(wav)))
    if peak > 0.001:
        wav = wav / peak * 0.78
    tail = np.zeros(int(0.55 * 24000), dtype=np.float32)
    wav = np.concatenate([wav.astype(np.float32), tail])
    fade = int(0.2 * 24000)
    wav[-fade:] *= np.linspace(1.0, 0.0, fade, dtype=np.float32)
    return wav


def audio_metrics(path: Path) -> dict:
    data, sr = sf.read(path, dtype="float32")
    if data.ndim > 1:
        data = data.mean(axis=1)
    rms = float(np.sqrt(np.mean(np.square(data)))) if data.size else 0.0
    peak = float(np.max(np.abs(data))) if data.size else 0.0
    dur = float(data.size / sr) if sr else 0.0
    threshold = max(0.012, rms * 0.22)
    active = np.flatnonzero(np.abs(data) > threshold)
    speech_end = float(active[-1] / sr) if active.size else 0.0
    tail = max(0.0, dur - speech_end)
    return {"path": str(path), "duration": round(dur, 3), "rms": round(rms, 5), "peak": round(peak, 5), "speechEnd": round(speech_end, 3), "tailSilence": round(tail, 3)}


def make_timed_voiceover(script, segments_dir: Path, out: Path, model, *, ref_audio: Path | None, voice: str, language: str, target_duration: float):
    segments_dir.mkdir(parents=True, exist_ok=True)
    full = np.zeros(int(math.ceil(target_duration + 0.5) * 24000), dtype=np.float32)
    manifest_segments = []
    for idx, (start_s, end_s, text) in enumerate(script, start=1):
        start = parse_time(start_s)
        end = parse_time(end_s)
        seg_path = segments_dir / f"segment-{idx:02d}.wav"
        metrics = gen(model, text, seg_path, ref_audio=ref_audio, voice=voice, language=language, speed=0.96, steps=24)
        data, sr = sf.read(seg_path, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        max_len = int(max(0.1, end - start - 0.15) * 24000)
        clipped = False
        if data.size > max_len:
            clipped = True
            data = data[:max_len]
            data[-2400:] *= np.linspace(1.0, 0.0, min(2400, data.size), dtype=np.float32)
        offset = int(start * 24000)
        full[offset:offset + data.size] += data[: max(0, min(data.size, full.size - offset))]
        manifest_segments.append({"index": idx, "start": start_s, "end": end_s, "text": text, "metrics": metrics, "clippedToSlot": clipped})
    peak = float(np.max(np.abs(full)))
    if peak > 0.001:
        full = full / peak * 0.72
    sf.write(out, full, 24000)
    return {"output": str(out), "metrics": audio_metrics(out), "segments": manifest_segments}


def mux(video: Path, wav: Path, out: Path):
    subprocess.check_call([
        "ffmpeg", "-y", "-i", str(video), "-i", str(wav),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", str(out)
    ])


def main():
    report = {"engine": "OmniVoice", "rightsAssumption": "user-owned local voice library", "auditions": []}

    shortlisted = [
        Candidate(
            "ru-mariia-calm",
            VOICE_LIB / "ЖЕНЩИНА_ВЗРОСЛАЯ" / "ElevenLabs_ru_Mariia - Measured, Calm and Engaging_EDpEYNf6XIeKYRzYcx4I.mp3",
            "clone",
            "",
            5, 5, 5, 5, 5, 1,
            "clean calm presentation timbre by filename and library category",
        ),
        Candidate(
            "ru-paul-deep",
            VOICE_LIB / "МУЖЧИНА_ВЗРОСЛЫЙ" / "ElevenLabs_ru_Paul Letuchka - Deep, Clear and Natural_qZDd4AcHEOAzq8caZvM4.mp3",
            "clone",
            "",
            5, 4, 5, 5, 4, 2,
            "deep clear male voice, slightly more dramatic",
        ),
        Candidate(
            "en-designed-female",
            None,
            "design",
            "female, young adult, moderate pitch, american accent",
            5, 4, 5, 5, 5, 2,
            "OmniVoice voice design for clean English narration",
        ),
    ]

    model, device = load_model()
    report["device"] = device

    copied_refs = {}
    for cand in shortlisted:
        ref = None
        if cand.source:
            ref = convert_ref(cand.source, VOICE_REFS / cand.id)
            copied_refs[cand.id] = str(ref)
        audition_text = "Liarline показывает честный детектив: модель играет подозреваемых, а доказательства решает движок." if cand.id.startswith("ru") else "Liarline is a mobile detective game where the model performs suspects and the engine scores the proof."
        audition_out = AUDITIONS / f"{cand.id}-audition.wav"
        started = time.time()
        try:
            metrics = gen(model, audition_text, audition_out, ref_audio=ref, voice=cand.voice, language="ru" if cand.id.startswith("ru") else "en", speed=0.96, steps=16)
            verdict = "selected" if cand.id in ("ru-mariia-calm", "en-designed-female") else "rejected"
            report["auditions"].append({
                "candidate": cand.id,
                "mode": cand.mode,
                "copiedReference": str(ref) if ref else None,
                "languageFit": cand.language_fit,
                "naturalness": cand.naturalness,
                "clarity": cand.clarity,
                "noise": cand.noise,
                "speedStability": cand.speed_stability,
                "robotMetallicRisk": cand.robot_risk,
                "auditionOutput": str(audition_out),
                "metrics": metrics,
                "elapsedSeconds": round(time.time() - started, 2),
                "verdict": verdict,
                "note": cand.note,
            })
        except Exception as exc:
            report["auditions"].append({"candidate": cand.id, "verdict": "failed", "error": str(exc), "note": cand.note})

    ru_ref = Path(copied_refs["ru-mariia-calm"])
    ru_video = VIDEOS / "liarline-demo-ru-v1.mp4"
    en_video = VIDEOS / "liarline-demo-en-v1.mp4"
    ru_voice = VIDEOS / "liarline-demo-ru-v1-voiceover.wav"
    en_voice = VIDEOS / "liarline-demo-en-v1-voiceover.wav"
    ru_mix = VIDEOS / "liarline-demo-ru-v1-audio-mix.wav"
    en_mix = VIDEOS / "liarline-demo-en-v1-audio-mix.wav"

    report["ruVoiceover"] = make_timed_voiceover(
        RU_SCRIPT, RAW / "voice-segments-ru", ru_voice, model,
        ref_audio=ru_ref, voice="", language="ru", target_duration=ffprobe_duration(ru_video)
    )
    shutil.copy2(ru_voice, ru_mix)

    report["enVoiceover"] = make_timed_voiceover(
        EN_SCRIPT, RAW / "voice-segments-en", en_voice, model,
        ref_audio=None, voice="female, young adult, moderate pitch, american accent", language="en", target_duration=ffprobe_duration(en_video)
    )
    shutil.copy2(en_voice, en_mix)

    ru_muxed = VIDEOS / "liarline-demo-ru-v1-voiced.mp4"
    en_muxed = VIDEOS / "liarline-demo-en-v1-voiced.mp4"
    mux(ru_video, ru_voice, ru_muxed)
    mux(en_video, en_voice, en_muxed)
    shutil.move(str(ru_muxed), str(ru_video))
    shutil.move(str(en_muxed), str(en_video))
    report["muxed"] = [{"lang": "ru", "video": str(ru_video)}, {"lang": "en", "video": str(en_video)}]

    report_path = VIDEOS / "liarline-demo-v1-voiceover-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
