# AI Suspect Voice Run - 2026-05-06

Scope: live Groq check for all four Liarline suspects after T051-T060 hardening.

| Suspect | Performance role | Pressure | Expected beat | Latency | Generic flag | Answer | Notebook hint |
|---|---|---|---|---:|---|---|---|
| suspect_ivo | protective_liar | contradiction | protective liar under contradiction | 374 ms | none | No, I was counting inventory in the break room at 21:10, same time as the cart log. | Inventory timing mismatch |
| suspect_mara | motive_guardian | ordinary | motive guardian with partial truth | 313 ms | none | Rivalry's just a side note. I was in the lab before 21:05, saw the prototype after 21:05, and left on schedule. | Timing's not the issue here. |
| suspect_theo | confused_witness | ordinary | confused witness with shaky timing | 272 ms | none | Uh, I'm not sure about the exact minute I, uh, checked the camera. Before 21:00, I'm pretty sure. | Camera's timing is fuzzy |
| suspect_lena | direct_witness | ordinary | direct witness with blunt facts | 412 ms | none | I saw a cart roll toward the storage door, like I told you before. | Verify cart movement in lab wing logs. |
| suspect_ivo | protective_liar | contradiction | RU protective liar gives new 21:10/cart pressure answer | 432 ms | none | Нет, я точно не видел тележку в 21:10, в комнате отдыха было пусто. | Тележка в 21:10 |

Result: all four suspects returned live Groq answers, stayed under the compact-answer budget, avoided internal markers, and had distinct opening phrasing.
