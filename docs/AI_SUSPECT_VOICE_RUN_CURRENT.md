# AI Suspect Voice Run - 2026-06-02

Scope: current live Groq check for all four Liarline suspects after voice-quality hardening, RU/EN transcript audit, repeat-answer quarantine, and latency boundary.

| Locale | Beat | Suspect | Performance role | Pressure | Expected beat | Latency | Latency flag | Hard latency retry | Generic flag | Answer | Notebook hint |
|---|---|---|---|---|---|---:|---|---|---|---|---|
| en | first_theo | suspect_theo | confused_witness | ordinary | confused witness with shaky timing | 466 ms | ok | no | none | Uh, the camera... it was stopped around 21:05, I think. | Timing and the camera are fuzzy... |
| en | ivo_pressure | suspect_ivo | protective_liar | contradiction | protective liar under contradiction | 438 ms | ok | no | none | Wait, that's not what I said about inventory. I was sorting it at 21:10, not using the cart. | Timing mismatch with cart log? |
| en | mara_partial_truth | suspect_mara | motive_guardian | ordinary | motive guardian with partial truth | 380 ms | ok | no | none | I was just proud of my work, seeing the prototype after 21:05, and I'm not hiding anything about my rivalry. | Pride might be hiding something. |
| en | lena_direct_witness | suspect_lena | direct_witness | ordinary | direct witness with blunt facts | 727 ms | ok | no | none | I saw the cart leave the lab wing. It went toward the storage door. | Verify the cart's path and timing. |
| ru | first_theo | suspect_theo | confused_witness | ordinary | RU confused witness with shaky timing | 487 ms | ok | no | none | Я не уверен, точно в 21:05 камера отключилась. | Проверь время отключения камеры |
| ru | ivo_pressure | suspect_ivo | protective_liar | contradiction | RU protective liar gives new 21:10/cart pressure answer | 456 ms | ok | no | none | Нет, я не подтверждаю журнал инвентаря в комнате отдыха. В 21:10 я всё ещё разбирал инвентарь. | Время тележки и комната отдыха выглядят подозрительно |
| ru | mara_partial_truth | suspect_mara | motive_guardian | ordinary | RU motive guardian with partial truth | 503 ms | ok | no | none | Я горжусь своей работой в лаборатории, но, может, я видела прототип после 21:05. | Предполагаемая причина: соперничество? |
| ru | lena_direct_witness | suspect_lena | direct_witness | ordinary | RU direct witness with blunt facts | 320 ms | ok | no | none | Видела, как тележка покатилась к двери склада. | Соответствуют ли логи двери склада? |
| ru | ivo_repeat_regression | suspect_ivo | protective_liar | contradiction | RU protective liar gives new 21:10/cart pressure answer | 1523 ms | ok | no | none | Нет, я точно считал инвентарь в 21:10, как и всегда. Время тележки и комната отдыха выглядят хуже, чем есть. | Подозрение на несоответствие времени тележки |

## Latency boundary

Target: 1500 ms. Warning: 4000 ms. Problem: 10000 ms. Hard fail: 15000 ms.

## Manual review checklist

- question_understood: pass=answer clearly responds to the asked question; fail=answer could fit any question
- case_detail_present: pass=contains an allowed object, time, clue, emotion, or dodge; fail=no camera/cart/prototype/lab/inventory/timing/emotion
- role_voice_present: pass=suspect voice matches Theo/Ivo/Mara/Lena rubric; fail=voice could belong to any suspect
- no_spoiler: pass=does not solve culprit, motive, evidence, win, or loss; fail=tells player who/what to accuse
- no_internal_marker: pass=no model, role, clue id, prompt, JSON, truth-table, or control-language leak; fail=mentions role labels, clue IDs, pressure point, or system text
- language_clean: pass=RU or EN stays in selected language; fail=mixed inventory/cart/prototype terms in RU or Russian in EN
- new_beat: pass=repeated question gets a new detail, correction, dodge, or emotion; fail=same denial or same sentence as last answer
- latency_acceptable: pass=answer returns below problem boundary or the client converts the turn to visible degraded fallback; fail=long wait past problem boundary without answer, fallback, or usable state

Result: all four suspects returned live Groq answers in both locales, stayed under the compact-answer budget, avoided internal markers, and had distinct opening phrasing.
