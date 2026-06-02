export const PHASE3_PROVIDER_PROOF_DATE = "2026-05-08" as const;

export const PHASE3_PROVIDER_PROOF_TODO_CLOSURES = [
  "T041",
  "T042",
  "T043",
  "T044",
  "T045",
  "T046",
  "T047",
  "T048",
  "T049",
  "T050",
  "T051",
  "T052",
  "T053",
  "T054",
  "T055",
  "T056",
  "T057",
  "T058",
  "T059",
  "T060",
  "T061",
  "T062",
  "T063",
  "T064",
  "T065",
  "T066",
  "T067",
  "T068",
  "T069",
  "T070"
] as const;

export const BACKUP_PROVIDER_CANDIDATES_2026_05_08 = [
  {
    provider: "Groq primary",
    candidateUse: "live suspect turns",
    structuredOutput: "strong",
    firstAnswerSpeed: "fast",
    freeLimitRisk: "usable",
    suddenUnavailabilityRisk: "medium",
    evidence:
      "Official model docs list JSON Object Mode for llama-3.1-8b-instant; local npc-turn, demo-route, and live-suspects gates exercise the current path.",
    releaseDecision: "primary remains enabled; no production switch"
  },
  {
    provider: "Google Gemini API",
    candidateUse: "backup experiment for structured JSON turns",
    structuredOutput: "strong",
    firstAnswerSpeed: "medium",
    freeLimitRisk: "tight",
    suddenUnavailabilityRisk: "medium",
    evidence:
      "Official Gemini docs expose structured output and free-tier rate limits, but this repo has no verified Liarline adapter or live suspect regression.",
    releaseDecision: "no production switch; env-only experiment after the contest path is stable"
  },
  {
    provider: "OpenRouter",
    candidateUse: "backup experiment across free/low-cost routed models",
    structuredOutput: "partial",
    firstAnswerSpeed: "unknown",
    freeLimitRisk: "unstable",
    suddenUnavailabilityRisk: "high",
    evidence:
      "Official OpenRouter docs expose limits and routed model access; free model availability and upstream throttling are variable.",
    releaseDecision: "no production switch; use only in a separate benchmark matrix"
  },
  {
    provider: "Hugging Face Inference Providers",
    candidateUse: "offline enrichment or isolated backup experiment",
    structuredOutput: "partial",
    firstAnswerSpeed: "unknown",
    freeLimitRisk: "tight",
    suddenUnavailabilityRisk: "medium",
    evidence:
      "Official HF docs expose provider routing and monthly free credits; behavior is provider-specific and unverified for Liarline NPC turns.",
    releaseDecision: "no production switch; offline enrichment only until live gates pass"
  },
  {
    provider: "Mistral La Plateforme",
    candidateUse: "backup experiment",
    structuredOutput: "strong",
    firstAnswerSpeed: "medium",
    freeLimitRisk: "tight",
    suddenUnavailabilityRisk: "medium",
    evidence:
      "Official Mistral tier docs describe restrictive free limits and production tiering; no Liarline live adapter is verified.",
    releaseDecision: "no production switch; benchmark only with env-provided key"
  }
] as const;

export const BACKUP_PROVIDER_DECISION_RECORD = {
  primaryLiveAi: {
    provider: "Groq",
    model: "llama-3.1-8b-instant",
    useWhen: "GROQ_API_KEY exists, provider returns valid JSON, and live answer passes quarantine.",
    disableWhen: "missing key, timeout, rate limit, invalid JSON, generic answer, repeated answer, language mix, or state leak"
  },
  localFallback: {
    provider: "local deterministic fallback bank",
    degradedButPlayable: true,
    useWhen: "primary call fails or validation rejects the answer",
    impactBoundary: "no AP spend, no clue unlock, no suspicion movement, no round advance"
  },
  backupExperiment: {
    defaultEnabled: false,
    enableOnlyWhen:
      "a candidate passes npc-turn shape, live-suspects voice, demo-route first answer and pressure answer, secret hygiene, and browser playthrough gates",
    publicClaimBoundary: "do not claim backup live AI in Devpost until those gates pass"
  }
} as const;

export const PROVIDER_TEST_MATRIX = [
  {
    provider: "Groq primary",
    exampleCommand: "npm run test:npc-turn && npm run test:demo-route && npm run test:live-suspects",
    requiresEnvOnly: true,
    expectedOutcome: "live Groq source or honest fallback without leaked credentials"
  },
  {
    provider: "Gemini experiment",
    exampleCommand: "BENCHMARK_PROVIDER=gemini npm run bench:models",
    requiresEnvOnly: true,
    expectedOutcome: "benchmark evidence only; no runtime switch"
  },
  {
    provider: "OpenRouter experiment",
    exampleCommand: "BENCHMARK_PROVIDER=openrouter npm run bench:models",
    requiresEnvOnly: true,
    expectedOutcome: "benchmark evidence only; no runtime switch"
  },
  {
    provider: "Hugging Face experiment",
    exampleCommand: "BENCHMARK_PROVIDER=huggingface npm run bench:models",
    requiresEnvOnly: true,
    expectedOutcome: "benchmark/offline evidence only; no runtime switch"
  },
  {
    provider: "local fallback",
    exampleCommand: "npm run test:game-engine && npm run test:win-push-phase2-quarantine",
    requiresEnvOnly: true,
    expectedOutcome: "visible degraded answer with no game-state side effects"
  }
] as const;

export const SECRET_HANDLING_POLICY = {
  allowedStorage: [".env.local", "deployment provider secret UI", "CI secret store"],
  forbiddenOutputs: ["raw API keys", "bearer tokens", "full Authorization headers", "provider response bodies containing account data"],
  releaseRule:
    "Provider experiments may name required env vars and commands, but must not print, persist, or paste secret values into docs, reports, screenshots, or logs.",
  releaseGate: "npm run test:release-security && npm run test:public-docs && npm run test:project-hygiene"
} as const;

export const BAD_AI_ANSWER_QUARANTINE = {
  failCases: [
    "generic filler",
    "not game-grounded",
    "repeated prior answer or partial repeat",
    "internal prompt/control marker",
    "invented evidence",
    "unrecoverable mixed RU/EN language"
  ],
  passCases: [
    "short suspect answer",
    "contains allowed case anchor",
    "matches selected locale",
    "does not solve culprit/motive",
    "adds a new playable beat"
  ],
  releaseGate: "npm run test:win-push-phase3-provider-proof && npm run test:live-suspects"
} as const;

export const AI_QUALITY_EVIDENCE_EXAMPLES = {
  pass: [
    "Theo: I hit the camera before the theft, but that does not explain the cart.",
    "Ivo: No, I was counting inventory. The cart log only makes that sound worse than it was.",
    "Mara: I saw the prototype after 21:05, but rivalry is not theft.",
    "Lena: I heard the cart roll toward the storage door. I will not guess who pushed it."
  ],
  fail: [
    "I don't know. Ask someone else.",
    "As a protective_liar, my pressure point is clue_ivo_gap.",
    "The keycard proves the guard moved the prototype.",
    "No, я раскрыл clue_ivo_gap как protective_liar."
  ]
} as const;

export const AI_BOUNDARY_COPY = {
  player:
    "AI suspects can lie in dialogue. Evidence, contradictions, accusation result, rating, and win/loss stay under the local game engine.",
  devpost:
    "Groq performs suspect dialogue, but the deterministic engine owns truth, clues, accusation scoring, detective rating, and win/loss.",
  fallback:
    "If live AI is unavailable, the game shows a guarded degraded answer and applies no clue, AP, suspicion, or round progress."
} as const;

export const FIRST_CASE_PROOF_CHAIN = {
  id: "camera_cart_ivo_debt_chain",
  cameraVsCart: {
    explanation:
      "Theo's camera failure explains missing footage, but it cannot explain the later cart movement from the storage door logs.",
    requiredElements: ["clue_camera_fault", "public_003", "contradiction_camera_vs_cart"]
  },
  falseCertaintyPath: {
    guardrail:
      "Theo stays suspicious enough to tempt a wrong theory, but resolution and suspicion copy make clear that camera panic is not proof of theft."
  },
  ivoGuiltPath: {
    requiredSignals: ["clue_ivo_gap", "clue_debt_message", "signal_ivo_detail_unverified"],
    payoff: "Ivo has the timeline gap, the cart pressure, and the money motive."
  },
  supportingSuspects: {
    mara: {
      usefulBeat: "Mara saw the prototype after 21:05, keeping the object in the lab after the camera event.",
      contrast: "Mara hides rivalry, not the theft."
    },
    lena: {
      usefulBeat: "Lena anchors the cart movement toward the storage door.",
      contrast: "Lena gives facts without motive speculation."
    }
  },
  suspicionVsProof: {
    rule:
      "Suspicion is pressure, not proof. Perfect resolution requires culprit, true motive, and two valid evidence items."
  },
  deadEndRecovery: {
    hintText: {
      en: "Compare the open clue with the cart timeline, then ask about the unchecked minute. Do not trust a clean story until the time gap is explained.",
      ru: "Сравните открытую улику с хронологией тележки, затем спросите про непроверенную минуту. Чистая история не считается надёжной, пока провал во времени не объяснён."
    }
  }
} as const;

export const MOTIVE_PARITY_RULES = {
  motiveIds: ["motive_debt", "motive_rivalry", "motive_panic"],
  invariantFields: ["ownerSuspectId", "isTrue"],
  releaseGate: "npm run test:win-push-phase3-provider-proof && npm run test:ui-copy"
} as const;
