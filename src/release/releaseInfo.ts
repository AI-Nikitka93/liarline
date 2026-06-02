export const releaseVersionNotes = {
  version: "0.1.0",
  date: "2026-05-07",
  includedMechanics: [
    "Interrogation",
    "Suspicion",
    "Contradiction",
    "Notebook",
    "Accusation",
    "Resolution",
    "AI suspect performance",
    "safe fallback",
    "RU/EN localization"
  ],
  excludedFutureFeatures: [
    "three-case season",
    "full trial system",
    "large evidence board",
    "voice or video interrogation",
    "multiplayer",
    "unlimited generated cases"
  ]
} as const;

export const releaseGoNoGoChecklist = {
  status: "GO",
  requiredChecks: [
    "npm run build",
    "npm run test:game-engine",
    "npm run test:release-playthrough",
    "npm run test:release-browser",
    "npm run test:release-monitoring",
    "npm run test:release-ops",
    "npm run test:release-postlaunch",
    "npm run test:release-contracts",
    "npm run test:judge-readiness",
    "npm run test:release-security",
    "npm run test:project-hygiene"
  ],
  blockers: [
    {
      label: "Unsafe secret exposure",
      status: "closed"
    },
    {
      label: "Unplayable fallback path",
      status: "closed"
    },
    {
      label: "Mobile browser requires download",
      status: "closed"
    },
    {
      label: "AI decides hidden truth",
      status: "closed"
    }
  ],
  responsibility: "Solo submission owner verifies the release checklist before publishing the Devpost link.",
  manualRollback: "Restart the local case with the in-game Restart control; if live AI fails during the demo, keep the playable fallback run or restore the last verified package."
} as const;

export const anchorReview = {
  status: "Anchor OK",
  coreValue: "AI suspects can lie, but only evidence can convict.",
  lastOrdinaryItems: ["T171", "T172", "T173", "T174", "T177", "T178", "T179", "T180"],
  noDrift: true
} as const;

export const phaseEndReview = {
  phase: 8,
  status: "closed",
  closed: "Asset provenance, release notes, final verification, go/no-go, anchor review, and phase review are now represented by executable contracts.",
  next: "Phase 9 launch readiness continues from a verified playable mobile release base."
} as const;

export const phase9AnchorReview = {
  status: "Anchor OK",
  coreValue: "AI suspects can lie, but only evidence can convict.",
  lastOrdinaryItems: [
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
    "T190",
    "T191",
    "T192",
    "T193",
    "T194",
    "T195",
    "T196"
  ],
  noDrift: true
} as const;

export const phase9EndReview = {
  phase: 9,
  status: "closed",
  closed: "Launch readiness now has hotfix criteria, freshness review, fast-decay knowledge ownership, changelog discipline, parity checks, rehearsal gates, and no open phase blockers.",
  next: "Phase 10 starts from measured playthrough observations and first-minute hook checks before any larger full-game expansion."
} as const;

export const phase10AnchorReview = {
  status: "Anchor OK",
  coreValue: "AI suspects can lie, but only evidence can convict.",
  lastOrdinaryItems: [
    "T199",
    "T200",
    "T201",
    "T202",
    "T203",
    "T204",
    "T205",
    "T206",
    "T207",
    "T208",
    "T209",
    "T210",
    "T211",
    "T212",
    "T213",
    "T214",
    "T215",
    "T216",
    "T217",
    "T218"
  ],
  noDrift: true
} as const;

export const phase10EndReview = {
  phase: 10,
  status: "closed",
  closed: "Phase 10 closes post-release validation, first follow-up backlog, future-case criteria, update rules, asset hygiene, design retrospective, memory contract, no-drift checklist, and full-game direction.",
  next: "MASTER TODO closed. Next work should start from real player or judge feedback, not from speculative expansion."
} as const;
