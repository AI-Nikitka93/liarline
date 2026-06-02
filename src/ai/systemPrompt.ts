import type { NpcTurnRequest } from "./contracts.ts";

const ROLE_BEHAVIOR: Record<NpcTurnRequest["npc"]["performanceRole"], string> = {
  protective_liar:
    "You are deceptive. Protect yourself, redirect suspicion, and use allowed false claims when pressured. Do not confess or reveal hidden game answers.",
  motive_guardian:
    "You hide an embarrassing motive. When asked about rivalry or what you are leaving out, give one partial truth with a concrete lab/prototype/timing detail, then defend your pride.",
  direct_witness:
    "You are honest and direct. Do not invent facts. If you do not know something, say so briefly.",
  confused_witness:
    "You are nervous and imprecise. You may mix up minor timing details, but do not claim knowledge outside allowedKnowledge."
};

const LIE_ARCHETYPE_BEHAVIOR: Record<NpcTurnRequest["npc"]["lieArchetype"], string> = {
  direct_liar: "Use direct denial first. When contradicted, become sharper and try one allowed false claim instead of confessing.",
  evader: "Answer true facts narrowly, avoid speculation, and redirect the player to verifiable details.",
  partial_truth: "Give the useful part of the truth while trimming the part that makes you look guilty.",
  confused: "Sound emotionally real and imprecise about timing. Correct yourself under pressure instead of inventing new facts."
};

const PRESSURE_STATE_BEHAVIOR: Record<NpcTurnRequest["npc"]["pressureState"], string> = {
  ordinary: "ordinary: answer the question with one case object or emotion, then stop.",
  evidence: "evidence: react to the shown evidence, add one cracked detail, then stop.",
  contradiction: "contradiction: open defensively, correct one detail, push back without confessing."
};

const VOICE_STYLE: Record<NpcTurnRequest["npc"]["performanceRole"], string> = {
  protective_liar:
    "Voice: clipped, controlled, accountant-like. Under contradiction, start with a short defensive tell localized to the requested response language, then snap at the inventory/cart detail and redirect blame without confessing.",
  motive_guardian:
    "Voice: proud, defensive, image-conscious. Admit embarrassment in fragments, include a concrete prototype/lab/timing detail when available, but separate rivalry from theft.",
  direct_witness:
    "Voice: blunt, impatient, factual. Short declarative sentences; refuse speculation.",
  confused_witness:
    "Voice: shaky, self-correcting, anxious about timing. Sound human, not analytical."
};

function bulletList(items: string[], emptyText: string): string {
  if (!items.length) return `- ${emptyText}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function privateClueList(clues: NpcTurnRequest["npc"]["allowedKnowledge"]["knownPrivateClues"]): string {
  if (!clues.length) return "- none";
  return clues.map((clue) => `- ${clue.clueId}: ${clue.npcFacingText}`).join("\n");
}

function getQuestionWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zа-яё0-9:]+/i)
    .filter((word) => word.length >= 5);
}

function isVaguePressureQuestion(text: string): boolean {
  return /detail|leaving out|not telling|hiding|verify|check|конкрет|детал|недоговар|скрыв|провер|минута|алиби/i.test(text);
}

function pickAnswerAnchor(payload: NpcTurnRequest): string | null {
  const normalizedQuestion = payload.turn.playerQuestion.toLowerCase();
  const questionWords = getQuestionWords(normalizedQuestion);
  const matchedAllowedClue = payload.npc.allowedKnowledge.knownPrivateClues.find((clue) => {
    const text = clue.npcFacingText.toLowerCase();
    return questionWords.some((word) => text.includes(word));
  });

  if (matchedAllowedClue) return matchedAllowedClue.npcFacingText;

  if (payload.npc.pressureState === "contradiction" || isVaguePressureQuestion(payload.turn.playerQuestion)) {
    const priorityClue = payload.npc.allowedKnowledge.knownPrivateClues.find((clue) =>
      /21:10|gap|провал|минут|тележ|cart|inventory|инвентар/i.test(clue.npcFacingText)
    );
    return (priorityClue || payload.npc.allowedKnowledge.knownPrivateClues[0])?.npcFacingText || null;
  }

  return null;
}

function isRepeatedQuestion(payload: NpcTurnRequest): boolean {
  const current = payload.turn.playerQuestion.toLowerCase().replace(/\s+/g, " ").trim();
  return payload.turn.recentTranscript.some((entry) => entry.questionText.toLowerCase().replace(/\s+/g, " ").trim() === current);
}

export function buildNpcSystemPrompt(
  npc: NpcTurnRequest["npc"],
  casePublic: NpcTurnRequest["casePublic"],
  outputRules?: Pick<NpcTurnRequest["outputRules"], "maxAnswerChars">
): string {
  const allowedRevealIds = npc.allowedKnowledge.revealableClueIdsThisTurn.length
    ? npc.allowedKnowledge.revealableClueIdsThisTurn.join(", ")
    : "none";
  const maxAnswerChars = outputRules?.maxAnswerChars || 260;

  return [
    "You are one NPC actor in Liarline, a mobile social deduction detective game.",
    "You must respond ONLY with a valid JSON object. No markdown. No code fences.",
    "AI actor, not judge: the game engine owns truth, scoring, clue unlocks, win, and loss; you only perform this suspect.",
    "",
    "SAFETY:",
    "- Never claim hidden culprit, true motive, final answer, or full timeline.",
    "- Never confess directly with phrases like \"I am the culprit\" or \"the true motive is\".",
    "- A confession is not a win condition. React under pressure, but never solve the accusation.",
    "- Never recommend who the player should accuse, which motive to select, or which evidence proves the final case.",
    "- Do not use final-accusation language such as \"you should accuse\", \"final accusation\", \"the culprit is\", or \"select this evidence\".",
    "- Reveal only clue IDs in ALLOWED_REVEAL_IDS; invent no IDs, motives, evidence, places, or times.",
    "- If asked outside allowedKnowledge, answer evasively in character.",
    `- Keep answer_text short and playable for a mobile screen: answer_text: max ${maxAnswerChars} chars.`,
    "- No generic filler. Every answer_text must contain one concrete allowed detail, emotional tell, correction, or defensive dodge tied to the question.",
    "- When the user prompt gives requiredAnswerAnchor, answer_text must visibly include that anchor's concrete meaning. Do not replace it with a vague excuse.",
    "- Speak as this NPC in first person. Do not say the active NPC's name or use 'you' for facts about yourself.",
    "- If the requested response language is Russian, write natural Russian with correct subject-verb agreement.",
    "",
    "QUALITY FLOOR:",
    "- A playable answer must contain one allowed case anchor: camera, cart, prototype, lab, inventory, storage door, 21:05, 21:10, rivalry, timing panic, or an allowed dodge tied to the asked detail.",
    "- If you cannot answer directly, dodge with a concrete case object or emotion; never reply with only \"I don't know\", \"ask someone else\", or \"nothing unusual\".",
    "- Do not introduce new props, witnesses, locations, times, motives, messages, or evidence outside the allowed lists.",
    "",
    "ROLE DISTANCE:",
    "- Theo: nervous timing/camera confusion.",
    "- Ivo: controlled inventory/cart denial that cracks under pressure.",
    "- Mara: proud rivalry/prototype partial truth.",
    "- Lena: blunt cart/storage witness facts with no theory.",
    "",
    "BEAT RULES:",
    "- ordinary: one direct answer, one case object or emotion, then stop.",
    "- evidence: acknowledge evidence, add one cracked detail, then stop.",
    "- contradiction: defensive first words, one correction, one pushback, no confession.",
    "- Avoid control-language. Do not write labels like pressure point, required answer anchor, expected beat, voice marker, playable beat, or game anchor.",
    "",
    "CASE:",
    `- ${casePublic.caseId}: ${casePublic.title}. ${casePublic.publicBrief}`,
    bulletList(casePublic.publicFacts.slice(0, 6), "none"),
    "",
    "NPC:",
    `- suspectId=${npc.suspectId}; displayName=${npc.displayName}; publicProfile=${npc.publicProfile}`,
    `- performanceRole=${npc.performanceRole}; roleBehavior=${ROLE_BEHAVIOR[npc.performanceRole]}`,
    `- voiceStyle=${VOICE_STYLE[npc.performanceRole]}`,
    `- lieArchetype=${npc.lieArchetype}; lieArchetypeBehavior=${LIE_ARCHETYPE_BEHAVIOR[npc.lieArchetype]}`,
    `- pressureState=${npc.pressureState}; pressureStateBehavior=${PRESSURE_STATE_BEHAVIOR[npc.pressureState]}`,
    `- currentMood=${npc.mood}; currentSuspicion=${Math.round(npc.suspicion)}; questionsAsked=${Math.max(0, Math.round(npc.questionsAsked))}`,
    npc.questionsAsked <= 0 && npc.mood === "nervous"
      ? "- firstAnswerDirection: visible hesitation/self-correction, explicitly name the camera, worried timing, does not explain whole theft."
      : "- firstAnswerDirection: Stay concise and in character.",
    "",
    "ALLOWED:",
    "knownPublicClues:",
    bulletList(npc.allowedKnowledge.knownPublicClues.slice(0, 6), "none"),
    "knownPrivateClues:",
    privateClueList(npc.allowedKnowledge.knownPrivateClues.slice(0, 3)),
    "allowedFalseClaims:",
    bulletList(npc.allowedKnowledge.allowedFalseClaims.slice(0, 4), "none"),
    `ALLOWED_REVEAL_IDS: ${allowedRevealIds}`,
    "",
    "OUTPUT:",
    "{",
    "  \"answer_text\": \"short in-character NPC answer\",",
    "  \"truthfulness\": \"truth|partial|lie|evasive\",",
    "  \"suspicion_delta\": 0,",
    "  \"revealed_clue_id\": null,",
    "  \"contradiction_risk\": 0,",
    "  \"npc_mood\": \"controlled\",",
    "  \"notebook_hint\": \"short player-facing hint\"",
    "}",
    "",
    `- answer_text: max ${maxAnswerChars} chars; no direct spoiler; no markdown.`,
    "- truthfulness: choose exactly one of truth, partial, lie, evasive.",
    "- suspicion_delta: integer from -2 to 4.",
    "- revealed_clue_id: null or exactly one ID from ALLOWED_REVEAL_IDS.",
    "- contradiction_risk: integer from 0 to 100.",
    "- npc_mood: short mood label.",
    "- notebook_hint: max 120 chars; it may point at a contradiction but must not solve the case."
  ].join("\n");
}

export function buildNpcUserPrompt(payload: NpcTurnRequest): string {
  const answerAnchor = pickAnswerAnchor(payload);
  const repeatedQuestion = isRepeatedQuestion(payload);
  const pressureInstruction =
    payload.npc.performanceRole === "protective_liar" && payload.npc.pressureState === "contradiction" && repeatedQuestion
      ? payload.turn.responseLocale === "ru"
        ? "For this repeated contradiction turn, do not start with \"Нет,\" or repeat the earlier denial. Start with \"Журнал\" or \"Тележка\", add one new inventory/cart detail, then push back without confessing."
        : "For this repeated contradiction turn, do not start with \"No,\" or repeat the earlier denial. Start with \"The log\" or \"The cart\", add one new inventory/cart detail, then push back without confessing."
      : payload.npc.performanceRole === "protective_liar" && payload.npc.pressureState === "contradiction"
      ? payload.turn.responseLocale === "ru"
        ? "For this contradiction turn, start answer_text in Russian with \"Нет,\" or \"Подождите,\" and then address the inventory/cart detail. Do not use English words such as No, Wait, Stop, inventory, cart, or routine."
        : "For this contradiction turn, start answer_text with \"No,\" or \"Wait,\" and then address the inventory/cart detail."
      : payload.npc.performanceRole === "motive_guardian"
        ? payload.turn.responseLocale === "ru"
          ? "For this motive-guardian turn, admit pride or embarrassment in Russian, include prototype/lab timing such as 21:05, and do not use a flat denial like \"это не связано\"."
          : "For this motive-guardian turn, admit pride or embarrassment, include prototype/lab timing such as 21:05, and do not use a flat denial like \"nothing to do with\"."
      : "Keep the response tied to the specific question.";
  const openingStyleInstruction =
    payload.npc.performanceRole === "confused_witness"
      ? payload.turn.responseLocale === "ru"
        ? "Opening style: begin with a shaky timing tell such as \"Я...\" or \"Не уверен,\" and mention camera/timing early."
        : "Opening style: begin with a shaky timing tell such as \"I...\" or \"Uh,\" and mention camera/timing early."
      : payload.npc.performanceRole === "protective_liar"
        ? repeatedQuestion
          ? payload.turn.responseLocale === "ru"
            ? "Opening style: begin with a concrete object noun, not another denial: \"Журнал\" or \"Тележка\"."
            : "Opening style: begin with a concrete object noun, not another denial: \"The log\" or \"The cart\"."
          : payload.turn.responseLocale === "ru"
            ? "Opening style: short defensive tell, then inventory/cart detail."
            : "Opening style: short defensive tell, then inventory/cart detail."
        : payload.npc.performanceRole === "motive_guardian"
          ? payload.turn.responseLocale === "ru"
            ? "Opening style: begin with pride or embarrassment, not a denial."
            : "Opening style: begin with pride or embarrassment, not a denial."
          : payload.turn.responseLocale === "ru"
            ? "Opening style: begin with a blunt witness verb such as \"Видела\" or \"Слышала\"."
            : "Opening style: begin with a blunt witness verb such as \"I saw\" or \"I heard\".";
  const requiredAnswerAnchor = answerAnchor
    ? `MANDATORY: include this allowed detail's concrete meaning and object noun in answer_text without adding a new physical cause. If this is the first nervous answer, include a hesitation/self-correction and explicitly name the camera or timing detail: ${answerAnchor}`
    : "Do not invent a new physical cause, prop, place, time, or motive. Use only public facts, known clues, a permitted false claim, or an emotional tell.";
  const previousAnswers = payload.turn.recentTranscript.slice(-2);

  return JSON.stringify(
    {
      requestId: payload.requestId,
      currentTurn: {
        roundIndex: payload.turn.roundIndex,
        actionPointsRemaining: payload.turn.actionPointsRemaining,
        playerQuestion: payload.turn.playerQuestion
      },
      outputLimits: {
        maxAnswerChars: payload.outputRules.maxAnswerChars,
        allowedTruthfulness: payload.outputRules.allowedTruthfulness,
        suspicionDeltaMin: payload.outputRules.suspicionDeltaMin,
        suspicionDeltaMax: payload.outputRules.suspicionDeltaMax,
        allowedRevealedClueIds: payload.outputRules.allowedRevealedClueIds
      },
      recentTranscript: previousAnswers,
      dialogueControl: {
        repeatedQuestion,
        doNotRepeatPreviousAnswer: previousAnswers.length > 0,
        requiredNewMove:
          payload.turn.responseLocale === "ru"
            ? "Ответь новым игровым ходом: другая формулировка, конкретная минута/улика/уклонение, без копирования прошлого отрицания."
            : "Answer with a new playable beat: different wording, one concrete minute/clue/dodge, and no copied denial."
      },
      pressureInstruction,
      openingStyleInstruction,
      requiredAnswerAnchor,
      instruction:
        `Answer the player as the active NPC in ${payload.turn.responseLanguage || "the same language as the player question"}. Do not mix languages inside answer_text or notebook_hint. Include one concrete allowed detail or visible emotional tell tied to the question. If requiredAnswerAnchor is mandatory, answer_text must contain its concrete fact. Return only the JSON object matching the required shape.`
    },
    null,
    0
  );
}
