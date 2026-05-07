# AI Suspect Voice Run - 2026-05-06

Scope: live Groq check for all four Liarline suspects after T051-T060 hardening.

| Suspect | Performance role | Pressure | Expected beat | Latency | Generic flag | Answer | Notebook hint |
|---|---|---|---|---:|---|---|---|
| suspect_ivo | protective_liar | contradiction | protective liar under contradiction | 371 ms | none | No, I was counting inventory in the break room. Routine task. | Rehearsed? Focus on the cart log. |
| suspect_mara | motive_guardian | ordinary | motive guardian with partial truth | 244 ms | none | Our rivalry's about research, not theft. I'm focused on my work. | Rivalry is about research, not theft. |
| suspect_theo | confused_witness | ordinary | confused witness with shaky timing | 463 ms | none | Uh, I'm not sure about the exact minute, but I'm pretty sure it was around... 21:10-ish, no, wait, that's when I was supposed to check the prototype. I mean, the camera, the corridor camera, it was... broken before, yeah, before the theft. | Camera was broken before the theft, but... |
| suspect_lena | direct_witness | ordinary | direct witness with blunt facts | 591 ms | none | The cart rolled toward the storage door. I didn't see what happened next. | Be cautious with assumptions about the cart's destination. |

Result: all four suspects returned live Groq answers, stayed under the compact-answer budget, avoided internal markers, and had distinct opening phrasing.
