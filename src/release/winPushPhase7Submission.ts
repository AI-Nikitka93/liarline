export const PHASE7_TODO_CLOSURES = [
  "T161",
  "T162",
  "T163",
  "T164",
  "T165",
  "T166",
  "T167",
  "T168",
  "T169",
  "T170",
  "T171",
  "T172",
  "T173",
  "T174",
  "T175",
  "T176",
  "T177",
  "T178",
  "T179",
  "T180",
  "T181",
  "T182",
  "T183",
  "T184",
  "T185",
  "T186",
  "T187",
  "T188",
  "T189",
  "T190"
] as const;

export const JUDGE_QA_ROUTE_MATRIX = [
  {
    routeId: "first_minute_judge",
    todoId: "T161",
    acceptance: [
      "Judge sees the first AI answer without chat explanation.",
      "Game hook is visible: AI suspects can lie, evidence convicts.",
      "Next action is visible through contradiction/persona-shift UI."
    ],
    proofCommands: ["npm run test:release-browser", "npm run test:browser-phase7-submission"]
  },
  {
    routeId: "full_playthrough_judge",
    todoId: "T162",
    acceptance: [
      "Route reaches first AI wow, contradiction, persona shift, Notebook, accusation, and Resolution.",
      "Resolution explains verdict through reconstruction and rating."
    ],
    proofCommands: ["npm run test:phase7", "npm run test:release-playthrough", "npm run test:release-browser"]
  },
  {
    routeId: "wrong_player",
    todoId: "T163",
    acceptance: [
      "Wrong accusation produces a loss that reads as consequence, not a bug.",
      "Reverse reconstruction points to missed cart gap."
    ],
    proofCommands: ["npm run test:phase7"]
  },
  {
    routeId: "partial_player",
    todoId: "T164",
    acceptance: [
      "Correct suspect with weak chain produces fair partial/reckless result.",
      "Evidence score stays visible and deterministic."
    ],
    proofCommands: ["npm run test:phase7", "npm run test:browser-phase7-submission"]
  },
  {
    routeId: "phone_touch_viewport",
    todoId: "T165",
    acceptance: [
      "390x844 mobile viewport checks touch-sized controls, fixed dock, no horizontal overflow, and no console/runtime errors.",
      "This is the closest automated substitute until a real manual phone pass is recorded."
    ],
    proofCommands: ["npm run test:mobile-ui", "npm run test:browser-smoke", "npm run test:browser-phase7-submission"]
  }
] as const;

export const SUBMISSION_RESEARCH_2026_05_09 = [
  {
    source: "Devpost AI Game Week page",
    url: "https://ai-game-week-29908.devpost.com/",
    appliedFinding: "Submission must stay judge-playable, AI-use clear, and aligned with the hackathon project surface."
  },
  {
    source: "Devpost help",
    url: "https://help.devpost.com/",
    appliedFinding: "Final package keeps short description, demo media, links, and judge-facing copy together."
  },
  {
    source: "Groq model docs",
    url: "https://console.groq.com/docs/model/llama-3.1-8b-instant",
    appliedFinding: "Primary live NPC performer remains llama-3.1-8b-instant."
  },
  {
    source: "Groq rate-limit docs",
    url: "https://console.groq.com/docs/rate-limits",
    appliedFinding: "Rate limits are treated as runtime risk; fallback and multi-key failover remain required."
  },
  {
    source: "Groq status page",
    url: "https://status.groq.com/",
    appliedFinding: "Final recording must not claim live AI while status/API checks are degraded."
  }
] as const;

export const CURRENT_EXTERNAL_RELEASE_URLS = {
  publicGameUrl: "https://liarline.vercel.app",
  githubRepoUrl: "https://github.com/AI-Nikitka93/liarline",
  demoVideoStatus: "external_blocker_real_url_required",
  strictJudgeGate: "LIARLINE_PUBLIC_URL + LIARLINE_GITHUB_URL + LIARLINE_DEMO_VIDEO_URL + LIARLINE_STRICT_SUBMISSION=1 npm run test:judge-readiness"
} as const;

export const FINAL_SUBMISSION_PACKET_2026_05_09 = {
  shortDescription: "Mobile-browser AI social deduction detective game where suspects can lie but only evidence can convict.",
  whatItDoes:
    "Players interrogate four AI-performed suspects in one deterministic prototype-theft case, catch a guaranteed contradiction, compare Notebook evidence, and make one final accusation.",
  aiUse:
    "Groq llama-3.1-8b-instant performs compact NPC dialogue through a serverless proxy. The hidden truth table, clue unlocks, AP spend, accusation result, and resolution stay deterministic in the local game engine.",
  builtWith: "Next.js App Router, React, Tailwind CSS v4, Lucide React, Groq API, LocalStorage persistence, Playwright/Node release gates.",
  demoRoute:
    "Start first question, show the first live AI answer, connect camera-vs-cart contradiction, pressure Ivo after persona shift, open Notebook, submit accusation with Ivo/debt/two clues, show Resolution.",
  noOverclaimBoundary:
    "Current release is one playable case. It does not include multiplayer, voice/video interrogation, accounts, unlimited generated cases, a full trial system, or a playable multi-case season."
} as const;

export const DEMO_VIDEO_SCRIPT_BEATS = [
  {
    beatId: "first_ai_answer_under_20s",
    timing: "0:00-0:20",
    visibleProof: "First question CTA, live answer badge, suspect answer tied to camera/cart.",
    doNotRecordIf: "Fallback label appears, answer is generic, answer mixes RU/EN, or first AI answer lands after the planned opening window."
  },
  {
    beatId: "contradiction",
    timing: "0:20-0:40",
    visibleProof: "Camera-vs-cart contradiction card and board-link language.",
    doNotRecordIf: "Contradiction UI is absent or looks like a static explanation detached from the turn."
  },
  {
    beatId: "persona_shift",
    timing: "0:40-0:55",
    visibleProof: "Ivo becomes pressure target and persona-shift card changes the suspect read.",
    doNotRecordIf: "The UI still frames Theo as the only likely culprit after contradiction."
  },
  {
    beatId: "notebook",
    timing: "0:55-1:15",
    visibleProof: "Notebook shows opened clues, contradiction, and non-spoiler suspicion signals.",
    doNotRecordIf: "Hidden truth markers, culprit role, or raw prompt text appears."
  },
  {
    beatId: "accusation",
    timing: "1:15-1:45",
    visibleProof: "Final risk acknowledged, Ivo/motive/evidence selections visible.",
    doNotRecordIf: "Submit is enabled without risk acknowledgement or selected proof looks empty."
  },
  {
    beatId: "resolution",
    timing: "1:45-2:30",
    visibleProof: "CASE CLOSED/PARTIAL/LOSS result, detective rating, reconstruction, feedback panel.",
    doNotRecordIf: "Resolution contradicts selected evidence or feedback panel overlaps the restart dock."
  }
] as const;

export const RELEASE_HYGIENE_AUDIT = [
  {
    auditId: "secret_hygiene",
    releaseAction: ".env.local stays ignored; release tests load keys without printing values; raw provider output is not persisted.",
    verificationCommands: ["npm run test:release-security", "npm run test:project-hygiene"]
  },
  {
    auditId: "dead_code",
    releaseAction: "Unused code is isolated only after build and route checks confirm no runtime dependency.",
    verificationCommands: ["npm run build", "npm run test:project-hygiene"]
  },
  {
    auditId: "orphan_assets",
    releaseAction: "Only referenced curated PNG assets remain in public/assets; rejected drafts stay archived.",
    verificationCommands: ["npm run test:visual-assets", "npm run test:project-hygiene"]
  },
  {
    auditId: "dependencies",
    releaseAction: "Dependencies stay minimal; removal requires confirmed no-reference proof and production build.",
    verificationCommands: ["npm run build", "npm run test:project-hygiene"]
  },
  {
    auditId: "release_bundle",
    releaseAction: "Intermediate generations, test output, screenshots, caches, and local logs are excluded from npm pack and public bundle.",
    verificationCommands: ["npm run test:project-hygiene"]
  },
  {
    auditId: "ignore_rules",
    releaseAction: ".gitignore/.npmignore cover archives, credentials, runtime artifacts, local reports, and generated screenshots.",
    verificationCommands: ["npm run test:project-hygiene"]
  }
] as const;

export const PHASE7_ANCHOR_REVIEW = {
  status: "Anchor OK. Продолжаем.",
  noDrift: true,
  restorePointName: "PHASE7_T161_T190_SUBMISSION_QA_FEEDBACK",
  correctEndState: "One mobile-browser AI detective case with truthful AI boundary, judge-proof route, and no fake release claims."
} as const;

export const PHASE7_RELEASE_DECISION = {
  decision: "patch_before_submit",
  submitWhen: [
    "real_demo_video_url is uploaded and set in LIARLINE_DEMO_VIDEO_URL",
    "strict judge-readiness passes with public URL, GitHub URL, and demo video URL",
    "live first answer used in the recording is not fallback"
  ],
  remainingBlockers: ["real_demo_video_url"]
} as const;

export const PHASE7_END_REVIEW = {
  phase: 7,
  closed: [
    "judge QA routes",
    "submission packet",
    "demo script",
    "README/release/package honesty",
    "secret and bundle hygiene",
    "feedback intake and triage"
  ],
  signal: "Фаза 7 не закрыта. Стоп. Вот что мешает: real_demo_video_url"
} as const;
