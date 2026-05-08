# Liarline MASTER TODO — full release win push

PROJECT ONE-LINER
Liarline — мобильная браузерная AI social deduction detective game, где AI убедительно играет подозреваемых, но только доказательства, противоречия и детерминированная логика игры приводят к правильному обвинению.

IDEA ANCHOR
- core value: игрок ловит AI-подозреваемых на противоречиях и побеждает через evidence-first дедукцию, а не через доверие к AI-признанию.
- core user: судья Devpost AI Game Week, мобильный игрок и зритель 1-3 минутного демо, которому за первую минуту должно быть понятно, почему AI является игровой механикой.
- correct end-state: один полностью отполированный конкурсный релиз с сильным первым AI-ответом, гарантированным contradiction beat, заметным persona shift, честной записной книжкой, понятным обвинением, красивым mobile-first UI, RU/EN переключением, fallback-устойчивостью, демо-видео и пострелизным циклом.
- do not drift into: бесконечный чат, сезон из нескольких дел до стабилизации первого, сложный суд, декоративный AI-dashboard, игра без риска, скрытая передача истины модели, фейковые live-AI claims, шаблонный пластиковый UI.

INTERPRETATION
Проект уже находится в поздней конкурсной стадии: есть рабочий mobile web game, deterministic engine, Groq NPC-turn path, fallback path, RU/EN dictionaries, визуальный контракт, набор проверок и публичная упаковка. Главная проблема сейчас не в отсутствии основы, а в победном добивании качества: AI-ответы иногда могут звучать тупо, слишком общо или не по игре; нужно усилить actor contract, live-model evaluation, запасные AI-линии, проверку каждой кнопки, визуальный proof, языковую гладкость, актуальное исследование на 8 мая 2026 и финальную Devpost-ready упаковку.

RECOMMENDED PROJECT SHAPE
Держим форму “one polished case, impossible to misunderstand”: один сильный кейс, четыре ясно различимых подозреваемых, короткая сессия, первый AI wow в первые секунды игры, evidence-first contradiction, резкий переход давления на настоящего виновника, финальное обвинение и честный разбор результата. Все улучшения должны усиливать шесть систем: Interrogation, Suspicion, Contradiction, Notebook, Accusation, Resolution.

ASSUMPTIONS / NEEDS CONFIRMATION
- ASSUMPTION: конкурсная цель сейчас — выигрышная полировка одного кейса, а не расширение до сезона.
- ASSUMPTION: Groq остаётся основной live-линейкой, но нужен исследованный запасной контур бесплатных или условно бесплатных AI-моделей без хранения секретов в репозитории.
- ASSUMPTION: английский остаётся основным языком Devpost-демо, русский должен быть полноценным переключаемым режимом без смешения языков.
- ASSUMPTION: внешние правила конкурса, AI-модели, лимиты и доступность быстро устаревают, поэтому проект freshness-sensitive.
- NEEDS CONFIRMATION: финальная запись демо-видео и публичная ссылка на него всё ещё являются внешним блокером.
- NEEDS CONFIRMATION: после первых реальных игроков нужно решить, усиливать ли Notebook, AI voice или accusation fairness первым follow-up патчем.

PHASE MAP
1. Текущий аудит, конкурсная актуальность и scope discipline.
2. AI actor quality, модельный запас и защита от тупых ответов.
3. Дедукция, кейс, fairness и игровой payoff.
4. Мобильный UX, кнопки, состояния и RU/EN переключение.
5. Visual DNA, ассеты, DESIGN.md и anti-template качество.
6. QA, playtest matrix и визуально-кодовая проверка каждой поверхности.
7. Релизная упаковка, безопасность, submission proof и проектная гигиена.
8. Пострелизный цикл, поддержка, recovery и путь после конкурса.

MASTER TODO

PHASE 1 — Текущий аудит, конкурсная актуальность и scope discipline
[ ] T001 [P0] Закрыть полный аудит текущего состояния проекта на 8 мая 2026: что реально работает, что заявлено в публичных документах, что ещё держится только на предположении.
[ ] T002 [P0] Зафиксировать новый source of truth для дальнейшей работы: `docs/MASTER_TODO.md` становится живым мастер-планом вместо закрытого архивного TODO.
[ ] T003 [P0] Развести уже готовую конкурсную упаковку и новый список улучшений, чтобы старые закрытые T001-T220 не считались текущей очередью задач.
[ ] T004 [P0] Проверить Devpost AI Game Week на дату выполнения: дедлайн, eligibility, submission fields, judging weights, mobile-browser requirement и требование demo video.
[ ] T005 [P0] Сопоставить текущую игру с judging criteria: AI Integration, Creativity & Fun, Technical Execution, Mobile Support и Best Design.
[ ] T006 [P0] Зафиксировать score-risk карту: какие слабые места могут стоить баллов даже при рабочем билде.
[ ] T007 [P0] Собрать актуальную картину AI-game практик на 8 мая 2026: что считается meaningful AI gameplay, а что выглядит как обычный чат с моделью.
[ ] T008 [P1] Изучить свежие game jam / AI game references 2026 и выделить только те идеи, которые усиливают Liarline без расширения scope.
[ ] T009 [P1] Зафиксировать anti-patterns: generic AI chat, длинный туториал, непонятный proof chain, неразличимые NPC voices, фальшивая “умность” модели.
[ ] T010 [P0] Обновить IDEA ANCHOR в проектных документах так, чтобы следующий агент не уводил игру в сезон, trial mode или процедурную генерацию до стабилизации первого кейса.
[ ] T011 [P0] Проверить, что README, SUBMISSION, RELEASE и Judge packet не обещают больше, чем текущий playable release действительно показывает.
[ ] T012 [P1] Составить карту критичных внешних зависимостей: конкурсные правила, public deploy, demo-video URL, AI provider availability, модели, лимиты, browser behavior.
[ ] T013 [P1] Зафиксировать fastest-aging знания: что нужно перепроверять перед каждым финальным прогоном и перед каждым пострелизным патчем.
[ ] T014 [P1] Обновить AI provider status на дату выполнения с текущими моделями, лимитами, fallback-risk и доступностью primary live path.
[ ] T015 [P1] Проверить свежий model landscape для бесплатных или условно бесплатных backup-линий без внедрения непроверенного провайдера в релиз.
[ ] T016 [P1] Закрыть risk decision по backup AI: какие линии можно рассматривать для live fallback, какие только для offline enrichment, какие исключить.
[ ] T017 [P1] Проверить autoskills или аналогичный curated skill-discovery путь на актуальность, безопасность, требования и пользу для этого стека.
[ ] T018 [P2] Зафиксировать решение по skill stack: установить только полезное, пропустить лишнее, результат сохранить в проектных заметках без раскрытия секретов.
[ ] T019 [P2] Оценить необходимость codebase intelligence слоя: нужен ли общий индекс понимания проекта или текущий размер покрывается обычным точным поиском и чтением файлов.
[ ] T020 [P0] Подготовить краткую current-risk baseline таблицу: AI quality, mobile UI, language parity, buttons, visual proof, final submission, demo video.
[ ] T021 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T022 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 1 закрыта. Переходим к фазе 2" или "Фаза 1 не закрыта. Стоп. Вот что мешает: ..."

PHASE 2 — AI actor quality, модельный запас и защита от тупых ответов
[ ] T023 [P0] Разобрать все текущие AI failure modes: ответ не по вопросу, общие фразы, повтор, потеря роли, смешение языков, выдуманная улика, слишком слабый pressure beat.
[ ] T024 [P0] Подготовить AI answer quality rubric для каждого подозреваемого: конкретность, роль, эмоция, игровая польза, отсутствие спойлера, отсутствие внутренних маркеров.
[ ] T025 [P0] Перепроверить первый Theo answer как главный AI wow: он должен звучать нервно, конкретно, коротко и вести к camera-vs-cart contradiction.
[ ] T026 [P0] Перепроверить Ivo pressure answer как главный persona shift: он должен ломать controlled mask и не превращаться в признание.
[ ] T027 [P0] Перепроверить Mara voice как partial-truth motive guardian, чтобы она не звучала как Theo или Ivo.
[ ] T028 [P0] Перепроверить Lena voice как direct witness, чтобы она давала факты, а не generic mystery narration.
[ ] T029 [P0] Закрыть minimum viable voice distance между четырьмя подозреваемыми: судья должен отличать их по фразе и реакции без чтения профиля.
[ ] T030 [P0] Усилить contract “AI actor, not judge”: live model не должна получать скрытую истину и не должна формулировать финальный ответ за игрока.
[ ] T031 [P0] Довести prompt/control текст до playable language: меньше канцелярии, больше кратких ситуационных beat rules для каждого pressure state.
[ ] T032 [P0] Ввести проверку, что каждый AI-ответ содержит хотя бы один разрешённый игровой якорь: предмет, время, улику, эмоцию или допустимое уклонение.
[ ] T033 [P0] Защитить ответы от generic filler: “I don’t know”, “ask someone else”, “nothing unusual” не должны проходить как сильный live beat.
[ ] T034 [P0] Защитить ответы от internal leak: роли, truth table, clue IDs, model jargon и служебные поля не должны попадать в player-facing text.
[ ] T035 [P0] Закрыть повторяемость: один и тот же подозреваемый не должен отвечать той же мыслью на соседний вопрос без нового игрового хода.
[ ] T036 [P0] Довести fallback bank до качества “degraded but playable”: fallback должен быть честно маркирован, но не ломать атмосферу и не звучать как заглушка.
[ ] T037 [P0] Развести fallback impact: degraded AI turn не должен тратить action point, открывать clue или двигать suspicion без явного безопасного правила.
[ ] T038 [P1] Подготовить live-AI transcript audit для всех основных judge-route вопросов на EN и RU.
[ ] T039 [P1] Подготовить ручной review чеклист для каждого live ответа: понятен ли вопрос, есть ли деталь дела, есть ли роль, нет ли спойлера.
[ ] T040 [P1] Проверить live-model latency на реальном judge route и зафиксировать границу, где waiting UI становится проблемой.
[ ] T041 [P1] Исследовать на 8 мая 2026 актуальные бесплатные или условно бесплатные AI provider options как запасные линии без немедленного обещания production switch.
[ ] T042 [P1] Оценить backup candidates по четырём критериям: structured output, скорость первого ответа, бесплатные лимиты, риск внезапной недоступности.
[ ] T043 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T044 [P1] Подготовить provider-failover decision record: когда использовать primary live AI, когда fallback, когда backup-provider experiment остаётся выключенным.
[ ] T045 [P1] Добавить безопасный test matrix для primary model, backup model candidates и local fallback без сохранения ключей в документах.
[ ] T046 [P1] Проверить, что любые backup API keys используются только через уже настроенную локальную авторизацию или env, без печати секретов в планах и отчётах.
[ ] T047 [P0] Закрыть live-suspect regression набор: все четыре подозреваемых должны дать разные, in-character, case-grounded ответы.
[ ] T048 [P0] Закрыть demo-route AI regression: первый ответ, contradiction reveal и Ivo pressure answer должны проходить как live-quality beat.
[ ] T049 [P0] Закрыть RU live answer regression: русские ответы не должны начинаться английскими словами и не должны оставлять inventory/cart/prototype без локализации.
[ ] T050 [P0] Закрыть EN live answer regression: английские ответы не должны случайно использовать русские слова, если игрок выбрал EN.
[ ] T051 [P1] Подготовить “bad AI answer quarantine”: если модель ответила тупо, повторно или не по игре, результат должен считаться fail для релизного прогона.
[ ] T052 [P1] Подготовить AI-quality evidence artifact с примерами pass/fail ответов, чтобы следующий агент не спорил на вкус.
[ ] T053 [P0] Зафиксировать final AI boundary copy для игрока и Devpost: AI играет подозреваемых, engine владеет truth, clues, win/loss.
[ ] T054 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 2 закрыта. Переходим к фазе 3" или "Фаза 2 не закрыта. Стоп. Вот что мешает: ..."

PHASE 3 — Дедукция, кейс, fairness и игровой payoff
[ ] T055 [P0] Перепроверить весь first-case proof chain: игрок должен понимать, почему camera failure не объясняет cart movement.
[ ] T056 [P0] Проверить, что guaranteed contradiction появляется как результат evidence comparison, а не как внезапная подсказка автора.
[ ] T057 [P0] Довести false-certainty path: Theo должен быть подозрительным, но не настолько, чтобы правильное решение казалось нечестным.
[ ] T058 [P0] Довести Ivo guilt path: у игрока должны быть достаточные признаки виновности до финального обвинения.
[ ] T059 [P0] Проверить, что Mara и Lena не являются декоративными: каждая должна давать полезный кусок дедукции или контраст поведения.
[ ] T060 [P0] Развести suspicion и proof: высокий suspicion не должен автоматически означать виновность, а низкий не должен скрывать обязательную улику.
[ ] T061 [P0] Проверить unlock order: игрок не должен попасть в Accusation без реального шанса увидеть core contradiction.
[ ] T062 [P0] Закрыть dead-end recovery: если игрок застрял после contradiction, hint должен направить к сравнению, но не назвать виновного.
[ ] T063 [P1] Проверить, что clue wording не является слишком прямым и не решает дело вместо игрока.
[ ] T064 [P1] Проверить, что clue wording не является слишком туманным и не делает обвинение угадайкой.
[ ] T065 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T066 [P1] Проверить все detective ratings: Sharp, Careful, Reckless, Misled должны ощущаться справедливо и объяснимо.
[ ] T067 [P1] Развести perfect, partial и loss outcomes так, чтобы игрок понимал, что именно он доказал или не доказал.
[ ] T068 [P0] Проверить final accusation risk: игра должна ясно сообщать, что обвинение одно и финальное.
[ ] T069 [P0] Проверить, что accusation screen не даёт выбрать невозможную или пустую комбинацию без понятной причины.
[ ] T070 [P1] Проверить, что мотивы не смешиваются между языками и не меняют смысл при RU/EN переключении.
[ ] T071 [P1] Проверить reverse reconstruction: итоговая временная линия должна объяснять дело, а не просто поздравлять или ругать игрока.
[ ] T072 [P1] Подготовить player-confusion map: где игрок может спутать suspect, clue, motive, contradiction или rating.
[ ] T073 [P1] Провести playtest сценарий “быстрый судья”: игрок кликает obvious path и должен увидеть core loop без чтения документации.
[ ] T074 [P1] Провести playtest сценарий “хаотичный игрок”: случайные подозреваемые и вопросы не должны ломать case fairness.
[ ] T075 [P1] Провести playtest сценарий “русский игрок”: русская версия должна сохранять same deduction logic и same payoff.
[ ] T076 [P1] Провести playtest сценарий “fallback-only”: игра должна оставаться честной, но Devpost copy не должен называть такой прогон live AI.
[ ] T077 [P0] Зафиксировать final case acceptance: contradiction, collapse, persona shift, notebook, accusation и resolution проходят одним непротиворечивым маршрутом.
[ ] T078 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 3 закрыта. Переходим к фазе 4" или "Фаза 3 не закрыта. Стоп. Вот что мешает: ..."

PHASE 4 — Мобильный UX, кнопки, состояния и RU/EN переключение
[ ] T079 [P0] Составить полный инвентарь интерактивных элементов: language toggle, first question, notebook, suspects, suggested questions, custom input, send, accuse, back, submit, restart, hint, drawer close.
[ ] T080 [P0] Для каждой кнопки закрыть code-level поведение: доступность, disabled state, правильный state transition, отсутствие двойного срабатывания.
[ ] T081 [P0] Для каждой кнопки закрыть visual-level поведение: размер, hover/focus/active/disabled, mobile tap target, видимость на тёмном фоне.
[ ] T082 [P0] Проверить first-question CTA: судья должен понять первый шаг без чтения briefing wall.
[ ] T083 [P0] Проверить suggested question buttons: каждая должна выглядеть как игровой ход с понятной ценой action point.
[ ] T084 [P0] Проверить custom question form: ввод не должен перекрывать dock, ломать viewport или отправлять пустой вопрос.
[ ] T085 [P0] Проверить pending-question state: во время ожидания AI игрок видит понятное состояние и не может случайно отправить дубликат.
[ ] T086 [P0] Проверить source labels: live AI и fallback должны быть честно различимы, но не превращать интерфейс в технический dashboard.
[ ] T087 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T088 [P0] Проверить suspect selector: выбранный подозреваемый, suspicion и mood должны быть понятны визуально и семантически.
[ ] T089 [P0] Проверить Notebook open/close: drawer не должен перекрывать критичные действия без понятного выхода.
[ ] T090 [P0] Проверить Notebook content: clues, contradictions, suspect notes и suspicion signals должны быть читаемы на 375-430px.
[ ] T091 [P0] Проверить Accusation entry: кнопка должна быть заблокирована до нужного условия и объяснять почему.
[ ] T092 [P0] Проверить Accusation screen: выбор suspect, motive, evidence и risk acknowledgement должен быть однозначным.
[ ] T093 [P0] Проверить Final submit: нельзя случайно отправить финальное обвинение без явного понимания риска.
[ ] T094 [P0] Проверить Continue interrogation: возвращение из Accusation не должно ломать выбранного подозреваемого, AP и transcript.
[ ] T095 [P0] Проверить Restart: сброс должен отменять pending request, очищать игру и не оставлять ghost-state.
[ ] T096 [P1] Проверить dead-end hint button: появляется только когда нужна помощь и не выглядит как обязательная инструкция.
[ ] T097 [P1] Проверить keyboard-safe dock на мобильном viewport: действия не должны уезжать под виртуальную клавиатуру.
[ ] T098 [P1] Проверить scrolling behavior: transcript, Notebook и Accusation не должны создавать ловушки прокрутки.
[ ] T099 [P1] Проверить portrait crops на всех ключевых состояниях, чтобы лица подозреваемых оставались эмоциональными якорями.
[ ] T100 [P0] Проверить RU/EN переключатель на всех фазах: briefing, interrogation, notebook, accusation, resolution.
[ ] T101 [P0] Обеспечить сохранение выбранного языка между сессиями без потери текущего progress.
[ ] T102 [P0] Проверить, что переключение языка не меняет скрытую логику дела, unlocked clues, выбранные ответы и accusation state.
[ ] T103 [P1] Проверить длинные русские строки: текст не должен ломать кнопки, карточки, dock и risk acknowledgement.
[ ] T104 [P1] Проверить английские строки: они должны быть короткими, игровыми и не звучать как техническая документация.
[ ] T105 [P1] Проверить все loading, empty, error и degraded states как часть gameplay, а не как техническую аварийную страницу.
[ ] T106 [P1] Проверить доступность: фокус, aria-label, текстовые labels для color-coded states, отсутствие color-only critical meaning.
[ ] T107 [P0] Закрыть mobile UX acceptance: игрок может пройти весь кейс одной рукой на phone-width viewport без потери критичных действий.
[ ] T108 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T109 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 4 закрыта. Переходим к фазе 5" или "Фаза 4 не закрыта. Стоп. Вот что мешает: ..."

PHASE 5 — Visual DNA, ассеты, DESIGN.md и anti-template качество
[ ] T110 [P0] Провести visual evidence research для mobile detective, interrogation UI, narrative mobile games и evidence notebooks на дату выполнения.
[ ] T111 [P0] Проверить Lazyweb или аналогичный visual evidence путь: актуальность, безопасность, локальная конфигурация, stop condition и provenance discipline.
[ ] T112 [P0] Сохранить visual findings как локальный отчёт: какие patterns усиливают Liarline, какие запрещены как копирование или дрейф.
[ ] T113 [P0] Обновить visual direction так, чтобы Neo-Noir Interrogation Terminal не выглядел как типовой AI dashboard.
[ ] T114 [P0] Усилить first viewport: подозреваемый, риск дела и главный игровой ход должны считываться сразу.
[ ] T115 [P0] Довести композицию interrogation screen: transcript, suspect pressure, questions, AP и notebook не должны спорить за внимание.
[ ] T116 [P0] Довести contradiction reveal как визуальное событие, а не просто новый текст в блоке.
[ ] T117 [P0] Довести persona shift визуально: Ivo under pressure должен ощущаться через состояние интерфейса, портрет, copy и AI voice.
[ ] T118 [P0] Довести Notebook визуально: clue slips, contradiction, notes и signals должны выглядеть как рабочий инструмент дедукции.
[ ] T119 [P1] Довести Accusation визуально: экран должен ощущаться как финальный риск, а не обычная форма выбора.
[ ] T120 [P1] Довести Resolution визуально: verdict, reconstruction и rating должны закрывать историю и объяснять outcome.
[ ] T121 [P0] Проанализировать эталонные репозитории design-to-code практик, включая google-labs-code/design.md, VoltAgent/awesome-design-md, kzhrknt/awesome-design-md-jp, bergside/awesome-design-skills, shaom/brand-to-design-md-skill и hasi98/designpull.
[ ] T122 [P0] Зафиксировать лучшие практики перевода visual language в код и обновить DESIGN.md так, чтобы его можно было использовать в Google Stitch или самостоятельной генерации дизайна AI-агентом.
[ ] T123 [P1] Обеспечить автоматизированный сбор design-pattern references через уже настроенную авторизацию, без записи токенов или секретов в документы.
[ ] T124 [P0] Развести DESIGN.md как production visual contract и сырые research notes, чтобы финальный handoff был коротким и применимым.
[ ] T125 [P0] Подготовить подробные ТЗ для каждого visual AI asset отдельно: suspect portraits, case hero, interrogation background, evidence paper, icon treatment.
[ ] T126 [P0] Провести одиночную генерацию и ручной отбор каждого ключевого ассета, а не пакетную генерацию “красивых картинок”.
[ ] T127 [P0] Провести AI-assisted curation каждого ассета: reject watermarks, fake text, plastic faces, distorted hands/faces, style drift, truth spoilers.
[ ] T128 [P1] Проверить mobile crops и visual contrast каждого PNG на реальных ключевых экранах.
[ ] T129 [P1] Сформировать гайдлайн для будущих AI-иллюстраций, чтобы обновления не ломали стиль и не добавляли дешёвый AI-look.
[ ] T130 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T131 [P1] Проработать сценарные image inserts для ключевых игровых моментов: briefing tension, first AI hesitation, contradiction reveal, persona shift, accusation risk и resolution.
[ ] T132 [P1] Определить mood-visual систему для подозреваемых: controlled, nervous, defensive, impatient, shaken, panicking должны иметь отличимые, но не шумные визуальные проявления.
[ ] T133 [P1] Подготовить ТЗ на дополнительные mood/scenario assets только там, где картинка усиливает дедукцию, а не заменяет текст доказательства.
[ ] T134 [P1] Проверить, какие визуальные вставки можно показывать как маленькие evidence/mood panels внутри gameplay, не превращая игру в галерею.
[ ] T135 [P1] Проработать уникальный характер основных кнопок: first question, send, notebook, accuse, final submit и restart должны отличаться по роли, а не быть одинаковыми прямоугольниками.
[ ] T136 [P1] Проработать state-specific button feedback: ожидание AI, live answer, fallback, contradiction, locked accusation, final risk и disabled states должны считываться без лишнего текста.
[ ] T137 [P1] Проработать игровые микроэффекты только для полезных событий: clue opened, contradiction found, persona shift, AP spent, final accusation и resolution rating.
[ ] T138 [P1] Проверить visual effects budget: эффекты не должны ухудшать mobile performance, перекрывать текст, создавать motion-noise или выглядеть как дешёвый AI-шаблон.
[ ] T139 [P1] Проверить icon system: метафоры, толщина линий, размеры, состояние active/disabled и соответствие игровым действиям.
[ ] T140 [P1] Проверить typography rhythm: headings, transcript, metadata, buttons и notebook не должны выглядеть как случайный набор размеров.
[ ] T141 [P1] Проверить color discipline: forensic amber, signal red, cyan и paper texture должны иметь роли, а не превращаться в шум.
[ ] T142 [P1] Проверить, что все визуальные эффекты поддерживают gameplay states и не являются декоративной “нейро-магией”.
[ ] T143 [P0] Закрыть visual acceptance: скриншоты ключевых фаз выглядят как один продукт, а не набор сгенерированных экранов.
[ ] T144 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 5 закрыта. Переходим к фазе 6" или "Фаза 5 не закрыта. Стоп. Вот что мешает: ..."

PHASE 6 — QA, playtest matrix и визуально-кодовая проверка каждой поверхности
[ ] T145 [P0] Составить acceptance matrix по фазам игры: Briefing, Interrogation, Notebook, Accusation, Resolution, fallback, restart.
[ ] T146 [P0] Проверить deterministic engine: AP spend, clue unlock, truth guard, contradiction, suspicion bounds, accusation, rating и corrupted save handling.
[ ] T147 [P0] Проверить AI integration: valid live response, invalid response, rate-limit, timeout, missing key, repeated answer, illegal clue, spoiler-like text.
[ ] T148 [P0] Проверить локализацию как систему: dictionaries, UI labels, case data, questions, AI response language и saved locale.
[ ] T149 [P0] Проверить каждую кнопку code-level: действие, disabled rule, state mutation, no duplicate submit, no stale closure after restart.
[ ] T150 [P0] Проверить каждую кнопку visual-level: readable label/icon, touch target, focus ring, contrast, overflow, mobile position.
[ ] T151 [P0] Проверить browser route на phone-width viewport от first question до Resolution.
[ ] T152 [P0] Проверить keyboard route: ввод custom question, появление keyboard, sticky dock, send button, scroll recovery.
[ ] T153 [P0] Проверить fallback-only route: все player-facing labels честные, gameplay completable, no fake live claim.
[ ] T154 [P1] Проверить low-connectivity или slow-AI UX: ожидание не должно выглядеть зависанием.
[ ] T155 [P1] Проверить repeated-click stress: быстрые клики по start, send, accuse, restart не должны ломать state.
[ ] T156 [P1] Проверить narrow-screen stress: 360-375px не ломает длинный русский текст и final accusation controls.
[ ] T157 [P1] Проверить desktop shell: игра остаётся mobile-first и не превращается в широкую dashboard-версию.
[ ] T158 [P1] Проверить visual regression screenshots по основным состояниям и сохранить только полезные proof artifacts.
[ ] T159 [P1] Проверить asset budget: release PNGs не должны раздувать финальный bundle и не должны содержать сырые AI-драфты.
[ ] T160 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T161 [P0] Провести first-minute judge test: без объяснений в чате судья видит AI answer, game hook и next action.
[ ] T162 [P0] Провести full-playthrough judge test: route закрывает first AI wow, contradiction, persona shift, notebook, accusation, resolution.
[ ] T163 [P1] Провести wrong-player route: неправильное обвинение должно быть объяснимым и не выглядеть багом.
[ ] T164 [P1] Провести partial-player route: правильный подозреваемый без полного proof chain должен давать справедливый partial/reckless результат.
[ ] T165 [P1] Провести manual phone check на реальном мобильном браузере или максимально близком viewport с touch behavior.
[ ] T166 [P0] Сформировать финальный QA evidence report: какие проверки прошли, какие live checks зависят от ключей или внешних URLs.
[ ] T167 [P0] Не закрывать ни один релизный пункт без реального proof: test output, browser proof, screenshot, live route или документированный manual check.
[ ] T168 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 6 закрыта. Переходим к фазе 7" или "Фаза 6 не закрыта. Стоп. Вот что мешает: ..."

PHASE 7 — Релизная упаковка, безопасность, submission proof и проектная гигиена
[ ] T169 [P0] Перепроверить перед релизом Devpost requirements, public game URL, GitHub repo URL, demo video URL и AI-use copy.
[ ] T170 [P0] Перепроверить перед релизом primary AI model availability, rate limits, structured output support, status page и live first answer.
[ ] T171 [P0] Подготовить final submission packet: short description, what it does, AI use, built with, demo route, no-overclaim boundary.
[ ] T172 [P0] Закрыть demo video script: первый AI ответ в первые 20 секунд, contradiction, persona shift, Notebook, accusation, Resolution.
[ ] T173 [P0] Проверить, что demo video показывает текущую UI-сборку, а не старый screenshot или fallback-run под видом live AI.
[ ] T174 [P0] Проверить public README: запуск, AI boundary, verification, troubleshooting, scope guardrails и key files.
[ ] T175 [P0] Проверить release docs: GO/NO-GO, rollback, known limitations, freshness cycle, hotfix criteria, first follow-up backlog.
[ ] T176 [P0] Проверить secret hygiene: ключи, токены, env values, raw provider output и локальные логи не попадают в public repo или bundle.
[ ] T177 [P1] Провести безопасный audit dead code: найти неиспользуемые компоненты и изолировать только после подтверждения, что сборка и маршруты не ломаются.
[ ] T178 [P1] Провести безопасный audit orphan assets: найти неиспользуемые изображения и черновики, затем архивировать, не ломая runtime.
[ ] T179 [P1] Провести ревизию зависимостей: удалить только подтверждённо неиспользуемое и проверить отсутствие скрытых конфликтов.
[ ] T180 [P1] Перенести промежуточные AI-генерации, сырые референсы, временные logs и тестовые скрипты вне релизного bundle.
[ ] T181 [P1] Проверить ignore rules: архивы, raw generations, локальные отчёты, credentials и runtime artifacts исключены из публичной поставки.
[ ] T182 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T183 [P0] Проверить release build после всех gameplay, AI, visual, docs и hygiene изменений.
[ ] T184 [P0] Проверить strict judge readiness после появления реального demo video URL.
[ ] T185 [P1] Подготовить rollback/restore note: как вернуться к последнему проверенному состоянию без потери текущей работы.
[ ] T186 [P1] Проверить, что публичный пакет честно говорит об одном кейсе и не обещает future scope как текущую возможность.
[ ] T187 [P0] Закрыть final release decision: submit / stop / patch с явным списком оставшихся блокеров.
[ ] T188 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 7 закрыта. Переходим к фазе 8" или "Фаза 7 не закрыта. Стоп. Вот что мешает: ..."

PHASE 8 — Пострелизный цикл, поддержка, recovery и путь после конкурса
[ ] T189 [P0] Организовать lightweight feedback intake после первых игроков: AI quality, missed contradiction, Notebook clarity, unfair accusation, mobile bug, localization issue.
[ ] T190 [P0] Развести feedback triage: что чинится hotfix, что идёт в follow-up patch, что остаётся future scope.
[ ] T191 [P0] Подготовить hotfix decision rules для unplayable path, broken first AI answer, truth leak, broken fallback, broken restart и mobile blocker.
[ ] T192 [P1] Подготовить ручной recovery сценарий для demo day: AI outage, public URL stale, bad save, broken mobile layout, fallback-only recording.
[ ] T193 [P1] Подготовить регулярный цикл пересмотра AI provider facts после запуска: availability, rate limits, model quality, backup candidates, fallback copy.
[ ] T194 [P1] Подготовить регулярный цикл пересмотра contest/submission facts до дедлайна и сразу после отправки.
[ ] T195 [P1] Подготовить регулярный цикл пересмотра visual/browser behavior после каждого UI-патча.
[ ] T196 [P1] Зафиксировать, какие знания устаревают быстрее всего и где они должны обновляться: provider status, contest docs, release docs, submission packet.
[ ] T197 [P1] Сформировать first follow-up backlog только из evidence: Notebook clarity, persona-shift punch, rating fairness, AI generic-answer rate.
[ ] T198 [P1] Определить threshold для второго кейса: добавлять его только после стабильной понятности первого contradiction/collapse/Notebook/rating loop.
[ ] T199 [P2] Подготовить future case template без обещания текущего релиза: false certainty, guaranteed contradiction, collapse, persona shift, evidence-based resolution.
[ ] T200 [P2] Зафиксировать “do not reopen” список: hidden truth in prompt, full trial mode, multiplayer, voice, accounts, procedural cases до завершения first-case clarity.
[ ] T201 [P1] Подготовить changelog discipline: каждое изменение должно объяснять player impact, proof, no-drift check и affected release docs.
[ ] T202 [P1] Подготовить post-release artifact hygiene: raw AI outputs, rejected assets, logs и research scraps остаются вне release bundle.
[ ] T203 [P0] Закрыть post-launch readiness: есть feedback, triage, hotfix rules, recovery, freshness cycles и честный путь развития без scope drift.
[ ] T204 [ANCHOR] 🔁 ANCHOR REVIEW — сверка с целью проекта
    Агент-исполнитель обязан:
    1. Перечитать IDEA ANCHOR (core value / core user / correct end-state / do not drift into).
    2. Пройтись по последним 20 выполненным пунктам и ответить:
       — Все ли они работают на core value?
       — Нет ли задач, которые уводят в сторону от correct end-state?
       — Нет ли нарушения "do not drift into"?
    3. Если обнаружен дрейф — исправить его всеми доступными средствами. Если не хватает базы или актуальности, использовать минимум 10 поисковых запросов; в каждом запросе использовать актуальную дату, например 08.05.2026.
    4. Если всё в порядке — написать одну строку: "Anchor OK. Продолжаем." и идти дальше.
[ ] T205 [ANCHOR] 🏁 PHASE END REVIEW — итог фазы и проверка направления
    Агент-исполнитель обязан перед переходом в следующую фазу:
    1. Перечислить одной строкой: что реально закрыто в этой фазе.
    2. Сравнить с IDEA ANCHOR: приближает ли итог фазы к correct end-state?
    3. Проверить: нет ли незакрытых RELEASE BLOCKER из этой фазы.
    4. Дать явный сигнал: "Фаза 8 закрыта. Переходим к финальному submit/post-launch циклу" или "Фаза 8 не закрыта. Стоп. Вот что мешает: ..."

RELEASE BLOCKERS
- Нет реальной публичной ссылки на 1-3 минутное demo video.
- Live AI first answer или Ivo pressure answer звучит generic, не по игре, смешивает языки или не проходит quality rubric.
- Public Devpost copy обещает season, full trial, voice, multiplayer, unlimited cases или live AI там, где был fallback.
- Mobile browser route не проходит от first question до Resolution на phone-width viewport.
- Любая кнопка критического пути визуально видима, но code-level действие сломано.
- Любая кнопка критического пути code-level работает, но визуально недоступна, перекрыта, слишком мала или непонятна.
- RU/EN переключение меняет смысл дела, ломает current progress или создаёт смешанный язык в AI/player-facing тексте.
- Hidden truth, culprit, motive или internal role markers попадают в live AI prompt или player-facing answer.
- Raw secrets, local credentials, provider output, rejected AI assets или runtime logs попадают в public repo или release bundle.
- Финальный strict judge readiness не может подтвердить public game URL, GitHub URL и demo video URL.

OUT OF SCOPE FOR NOW
- Второй или третий кейс до стабилизации первого playable case.
- Full trial system.
- Multiplayer.
- Voice или video interrogation.
- Unlimited/procedural case generation.
- Accounts, leaderboard, monetization, public analytics platform.
- Большая админка или external content pipeline.
- Полная смена стека ради эксперимента перед дедлайном.
- Backup AI provider switch без research, quality evidence и safe fallback decision.
- Визуальное копирование чужих референсов, брендов, ассетов, layout или текстов.

TODO COVERAGE CHECK
- total ordinary tasks: 188
- anchor tasks: 17
- covered phases: 8
- biggest risk gaps: live AI answer quality, demo video URL, every-button visual/code proof, mood/scenario visual differentiation, RU/EN parity, external provider freshness, final strict submission proof
