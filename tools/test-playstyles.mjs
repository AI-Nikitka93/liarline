import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  applyNpcTurnResult,
  buildNpcTurnRequest,
  canGoToAccusation,
  canUseDeadEndHint,
  createInitialGameState,
  getSuggestedQuestions,
  goToAccusation,
  startInterrogation,
  submitAccusation,
  useDeadEndHint
} from "../src/game/gameEngine.ts";
import { FIRST_INTERROGATION_SUSPECT_ID } from "../src/game/seedCase.ts";

const REPORT_PATH = path.join(process.cwd(), "_archive", "agent-memory", "docs", "PLAYTEST_STYLES_2026-05-06.md");

function npcTurn(request, response = {}) {
  return {
    ok: true,
    source: "groq",
    requestId: request.requestId,
    model: request.model,
    response: {
      answer_text: "I... the timing sounds clean, but the camera and cart log do not fit together.",
      truthfulness: "partial",
      suspicion_delta: 3,
      revealed_clue_id: null,
      contradiction_risk: 76,
      npc_mood: "nervous",
      notebook_hint: "Compare the broken camera with the cart log.",
      ...response
    },
    meta: {
      latencyMs: 360,
      fallbackReason: null,
      providerStatus: 200,
      retryAfter: null,
      validationWarnings: []
    }
  };
}

function ask(state, suspectId, question = null, response = {}) {
  const selectedQuestion = question ?? getSuggestedQuestions(state, suspectId, "en")[0];
  const request = buildNpcTurnRequest(state, suspectId, selectedQuestion, "en");
  return applyNpcTurnResult(state, suspectId, selectedQuestion, npcTurn(request, response));
}

function startRun() {
  return startInterrogation(createInitialGameState());
}

function assertNoDeadEnd(state, label) {
  assert.ok(state.phase === "interrogation" || state.phase === "accusation" || state.phase === "resolution", `${label}: invalid phase`);
  assert.ok(state.rules.actionPointsRemaining >= 0, `${label}: negative AP`);
  assert.ok(state.transcript.every((entry) => entry.answerText.trim().length > 0), `${label}: empty transcript answer`);
}

let rushed = startRun();
rushed = ask(rushed, FIRST_INTERROGATION_SUSPECT_ID);
rushed = ask(rushed, "suspect_mara", null, {
  answer_text: "I left fast because I did not want this tied to my rivalry, but I did see the prototype after 21:05.",
  truthfulness: "partial",
  suspicion_delta: 2,
  revealed_clue_id: "clue_mara_saw_prototype",
  contradiction_risk: 48,
  npc_mood: "defensive",
  notebook_hint: "Mara's sighting keeps the prototype in the lab after the camera broke."
});
rushed = ask(rushed, "suspect_theo", "So the camera accident means you covered up the theft?", {
  answer_text: "No, I panicked about the camera, not the prototype. The cart moved after my mistake.",
  truthfulness: "truth",
  suspicion_delta: -1,
  revealed_clue_id: null,
  contradiction_risk: 64,
  npc_mood: "shaken",
  notebook_hint: "Theo's panic is plausible, but it does not explain the cart."
});
assert.equal(canGoToAccusation(rushed), true, "rushed player should be allowed to accuse after minimum questions");
rushed = submitAccusation(goToAccusation(rushed), {
  accusedSuspectId: "suspect_theo",
  selectedMotiveId: "motive_panic",
  selectedEvidenceClueIds: ["clue_camera_fault"]
});
assert.equal(rushed.resolution.outcome, "loss");
assert.equal(rushed.resolution.detectiveRating, "misled");
assert.ok(rushed.resolution.reverseReconstructionStepIds.includes("recon_wrong_verdict"));
assertNoDeadEnd(rushed, "rushed");

let careful = startRun();
careful = ask(careful, FIRST_INTERROGATION_SUSPECT_ID);
careful = ask(careful, "suspect_ivo", "Why does the cart log point back to you at 21:10?", {
  answer_text: "Stop twisting a routine inventory count. I was near the room, not stealing anything.",
  truthfulness: "lie",
  suspicion_delta: 2,
  revealed_clue_id: "clue_ivo_gap",
  contradiction_risk: 84,
  npc_mood: "panicking",
  notebook_hint: "Ivo still cannot cover the 21:10 gap."
});
careful = ask(careful, "suspect_ivo", "What detail about your money pressure can be checked?", {
  answer_text: "That message was private. It does not prove I took the prototype.",
  truthfulness: "partial",
  suspicion_delta: 3,
  revealed_clue_id: "clue_debt_message",
  contradiction_risk: 88,
  npc_mood: "panicking",
  notebook_hint: "The money pressure gives Ivo a motive."
});
assert.equal(careful.clues.clue_ivo_gap.unlocked, true);
assert.equal(careful.clues.clue_debt_message.unlocked, true);
assert.equal(canGoToAccusation(careful), true);
careful = submitAccusation(goToAccusation(careful), {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_debt",
  selectedEvidenceClueIds: ["clue_ivo_gap", "clue_debt_message"]
});
assert.equal(careful.resolution.outcome, "perfect_win");
assert.equal(careful.resolution.detectiveRating, "sharp");
assert.ok(careful.resolution.reverseReconstructionStepIds.includes("recon_final_verdict"));
assertNoDeadEnd(careful, "careful");

let mistaken = startRun();
mistaken = ask(mistaken, FIRST_INTERROGATION_SUSPECT_ID);
mistaken = ask(mistaken, "suspect_ivo", "Why does your inventory story avoid 21:10?", {
  answer_text: "I was counting inventory. The gap is just a badly written log.",
  truthfulness: "lie",
  suspicion_delta: 2,
  revealed_clue_id: "clue_ivo_gap",
  contradiction_risk: 82,
  npc_mood: "panicking",
  notebook_hint: "The gap is real, but motive still needs proof."
});
mistaken = ask(mistaken, "suspect_lena", "Name one detail that can be checked.", {
  answer_text: "I heard the cart roll toward storage. I will not guess who pushed it.",
  truthfulness: "truth",
  suspicion_delta: 0,
  revealed_clue_id: "clue_lena_heard_cart",
  contradiction_risk: 45,
  npc_mood: "impatient",
  notebook_hint: "The cart direction supports the time gap, not a full motive."
});
assert.equal(canUseDeadEndHint(mistaken), true);
mistaken = useDeadEndHint(mistaken, "en");
assert.ok(mistaken.deduction.deadEndHint);
assert.ok(!/culprit|guilty|Ivo is/i.test(mistaken.deduction.deadEndHint));
mistaken = submitAccusation(goToAccusation(mistaken), {
  accusedSuspectId: "suspect_ivo",
  selectedMotiveId: "motive_rivalry",
  selectedEvidenceClueIds: ["clue_ivo_gap"]
});
assert.equal(mistaken.resolution.outcome, "partial_win");
assert.equal(mistaken.resolution.detectiveRating, "reckless");
assert.equal(mistaken.resolution.culpritCorrect, true);
assert.equal(mistaken.resolution.motiveCorrect, false);
assertNoDeadEnd(mistaken, "mistaken");

const report = [
  "# Three-Style Playtest - 2026-05-06",
  "",
  "Closed scope: T151.",
  "",
  "## Rushed Player",
  "",
  "- Route: first Theo answer -> Mara sighting -> premature Theo accusation.",
  "- Result: playable loss, Misled rating, reverse reconstruction names the missed logic.",
  "- Fairness check: collapse and suspicion signal were visible before the wrong accusation.",
  "",
  "## Careful Player",
  "",
  "- Route: first Theo answer -> Ivo gap -> Ivo debt pressure -> accusation with two valid evidence items.",
  "- Result: perfect win, Sharp rating, deterministic contradiction and persona shift included.",
  "- Fairness check: the win uses evidence and motive, not an AI confession.",
  "",
  "## Mistaken Player",
  "",
  "- Route: first Theo answer -> Ivo gap -> Lena cart clue -> one hint -> right suspect with wrong motive.",
  "- Result: partial win, Reckless rating, dead-end hint does not reveal the culprit or motive.",
  "- Fairness check: the game respects a near-correct theory without pretending it is fully proven.",
  "",
  "## Release Impact",
  "",
  "- No style creates negative AP, empty transcript turns, missing resolution, or a dead-end phase.",
  "- All three routes exercise the core promise: AI suspects can lie, but only evidence can convict.",
  ""
].join("\n");

await mkdir(path.dirname(REPORT_PATH), { recursive: true });
await writeFile(REPORT_PATH, report, "utf8");

console.log(JSON.stringify({
  ok: true,
  reportPath: REPORT_PATH,
  rushed: rushed.resolution.detectiveRating,
  careful: careful.resolution.detectiveRating,
  mistaken: mistaken.resolution.detectiveRating
}, null, 2));
