# Liarline Game Architecture Document

Date: 2026-05-05
Role: P-GAME - Lead Game Engineer
Scope: game logic, state architecture, deterministic rules, and AI data contracts.

This document does not define React components and does not define final LLM system prompts. It defines the contracts that the prompt layer and frontend implementation must follow.

## GAME LOOP SPEC

### Design Principle

Liarline is a finite turn-based detective game. The AI performs character dialogue, but the deterministic game engine owns:

- the true culprit;
- the true motive;
- clue unlocks;
- suspicion score clamping;
- action limits;
- win/loss resolution.

The AI never receives the full `truthTable` during live interrogation.

### Phase 1: Init Case

1. Load a seed case from local bundled JSON or cached LocalStorage.
2. Optional: call offline enrichment model `llama-3.3-70b-versatile` once before play to polish public copy and suspect flavor.
3. Create `gameState`:
   - `phase = "briefing"`;
   - `roundIndex = 0`;
   - `actionPointsRemaining = 9`;
   - `truthTable` stored locally;
   - `suspects` initialized with roles, public profile, private knowledge, suspicion score, and allowed lie strategy;
   - `playerNotebook` initialized empty.
4. Show public briefing only:
   - case title;
   - victim/object;
   - time window;
   - suspect cards;
   - known public facts.
5. Player taps `Start Interrogation`.

Exit condition: player starts interrogation.  
Next phase: `interrogation`.

### Phase 2: Interrogation Phase

There are exactly 3 rounds. The player has a shared action pool:

- `maxRounds = 3`;
- `actionPointsMax = 9`;
- each question costs 1 action point;
- optional hard cap per suspect: `maxQuestionsPerSuspect = 3`;
- no infinite chat.

For each action:

1. Player selects a suspect.
2. Player selects a suggested question or enters a short custom question.
3. Engine validates:
   - phase is `interrogation`;
   - action points remain;
   - selected suspect exists and is active;
   - suspect has not exceeded per-suspect cap;
   - question length is within limit.
4. Engine builds compact AI request:
   - current suspect public profile;
   - current suspect role;
   - current suspect allowed knowledge;
   - current suspect lie constraints;
   - last 2 local exchanges with this suspect only;
   - public case facts;
   - player question;
   - allowed clue IDs the suspect may reveal.
5. Serverless proxy calls Groq `llama-3.1-8b-instant`.
6. Engine parses and validates AI response.
7. Engine applies deterministic result:
   - clamps suspicion delta;
   - accepts `revealed_clue_id` only if it is allowed for this suspect and current phase;
   - ignores illegal confession/spoiler text for win/loss;
   - records transcript entry;
   - decrements action points.
8. If action points for current round are depleted or player taps `End Round`, advance round.

Exit condition:

- `roundIndex >= 3`, or
- `actionPointsRemaining <= 0`, or
- player manually chooses `Go to Accusation` after at least `minimumQuestions = 3`.

Next phase: `accusation`.

### Phase 3: Accusation Phase

1. Player selects:
   - accused suspect ID;
   - motive ID;
   - optional evidence/clue IDs from notebook.
2. Engine validates the selection against local `truthTable`.
3. No AI call is needed for correctness.
4. Optional: call `llama-3.3-70b-versatile` or use local template for final dramatic explanation.

Exit condition: accusation submitted.  
Next phase: `resolution`.

### Phase 4: Resolution

The engine computes:

- `culpritCorrect`;
- `motiveCorrect`;
- `evidenceScore`;
- `finalOutcome`.

Outcomes:

- `perfect_win`: culprit and motive correct, enough evidence.
- `partial_win`: culprit correct, motive wrong or weak evidence.
- `loss`: culprit wrong.

Show:

- final verdict;
- true timeline;
- what the player missed;
- unlocked clues;
- suspect truth cards;
- restart/new case button.

## STATE SCHEMA

This is the source shape for a full client-side implementation. It can be serialized to LocalStorage as one JSON object. No database is required.

```json
{
  "schemaVersion": "1.0.0",
  "saveId": "save_2026_05_05_liarline_001",
  "createdAt": "2026-05-05T00:00:00.000Z",
  "updatedAt": "2026-05-05T00:00:00.000Z",
  "rngSeed": "case_lab_001",
  "phase": "interrogation",
  "case": {
    "caseId": "case_lab_001",
    "title": "The Missing Prototype",
    "publicBrief": "A prototype vanished from the lab between 21:00 and 21:15.",
    "setting": "University robotics lab",
    "timeWindow": {
      "start": "21:00",
      "end": "21:15"
    },
    "publicFacts": [
      {
        "factId": "public_001",
        "text": "The prototype was last checked before 21:00."
      },
      {
        "factId": "public_002",
        "text": "A corridor camera stopped recording before the theft."
      }
    ]
  },
  "rules": {
    "maxRounds": 3,
    "roundIndex": 1,
    "actionPointsMax": 9,
    "actionPointsRemaining": 6,
    "minimumQuestionsBeforeAccusation": 3,
    "maxQuestionsPerSuspect": 3,
    "maxQuestionChars": 180,
    "recentTranscriptLimitPerNpc": 2,
    "suspicionMin": 0,
    "suspicionMax": 100
  },
  "truthTable": {
    "culpritSuspectId": "suspect_ivo",
    "trueMotiveId": "motive_debt",
    "trueTimeline": [
      {
        "time": "21:03",
        "actorSuspectId": "suspect_theo",
        "event": "Theo accidentally damages the corridor camera.",
        "clueId": "clue_camera_fault"
      },
      {
        "time": "21:07",
        "actorSuspectId": "suspect_mara",
        "event": "Mara sees the prototype still in the lab.",
        "clueId": "clue_mara_saw_prototype"
      },
      {
        "time": "21:10",
        "actorSuspectId": "suspect_ivo",
        "event": "Ivo removes the prototype.",
        "clueId": "clue_ivo_gap"
      }
    ],
    "validEvidenceForPerfectWin": [
      "clue_ivo_gap",
      "clue_debt_message"
    ],
    "motiveMap": {
      "motive_debt": {
        "label": "Debt pressure",
        "ownerSuspectId": "suspect_ivo",
        "isTrue": true
      },
      "motive_rivalry": {
        "label": "Research rivalry",
        "ownerSuspectId": "suspect_mara",
        "isTrue": false
      },
      "motive_panic": {
        "label": "Camera accident cover-up",
        "ownerSuspectId": "suspect_theo",
        "isTrue": false
      }
    }
  },
  "suspects": {
    "suspect_ivo": {
      "suspectId": "suspect_ivo",
      "displayName": "Ivo",
      "publicProfile": "Calm lab treasurer who claims he was reviewing inventory.",
      "npcRole": "liar_culprit",
      "isCulprit": true,
      "publicMotiveIds": [
        "motive_debt"
      ],
      "privateKnowledge": {
        "knowsClueIds": [
          "clue_ivo_gap",
          "clue_debt_message"
        ],
        "mustNotRevealClueIdsBeforePressure": [
          "clue_debt_message"
        ],
        "allowedFalseClaims": [
          "I was in the break room.",
          "Mara had more access than I did."
        ],
        "pressureUnlocks": [
          {
            "afterSuspicionAtLeast": 55,
            "unlockClueId": "clue_ivo_gap"
          }
        ]
      },
      "visibleState": {
        "suspicion": 35,
        "questionsAsked": 1,
        "revealedClueIds": [],
        "mood": "controlled"
      }
    },
    "suspect_mara": {
      "suspectId": "suspect_mara",
      "displayName": "Mara",
      "publicProfile": "Ambitious researcher who was near the lab that evening.",
      "npcRole": "hides_motive",
      "isCulprit": false,
      "publicMotiveIds": [
        "motive_rivalry"
      ],
      "privateKnowledge": {
        "knowsClueIds": [
          "clue_mara_saw_prototype",
          "clue_mara_rivalry"
        ],
        "mustNotRevealClueIdsBeforePressure": [
          "clue_mara_rivalry"
        ],
        "allowedFalseClaims": [
          "I left earlier than I did."
        ],
        "pressureUnlocks": [
          {
            "afterSuspicionAtLeast": 45,
            "unlockClueId": "clue_mara_saw_prototype"
          }
        ]
      },
      "visibleState": {
        "suspicion": 25,
        "questionsAsked": 0,
        "revealedClueIds": [],
        "mood": "defensive"
      }
    },
    "suspect_theo": {
      "suspectId": "suspect_theo",
      "displayName": "Theo",
      "publicProfile": "Nervous technician responsible for lab equipment.",
      "npcRole": "confused_innocent",
      "isCulprit": false,
      "publicMotiveIds": [
        "motive_panic"
      ],
      "privateKnowledge": {
        "knowsClueIds": [
          "clue_camera_fault"
        ],
        "mustNotRevealClueIdsBeforePressure": [],
        "allowedFalseClaims": [
          "I do not remember the exact minute."
        ],
        "pressureUnlocks": [
          {
            "afterSuspicionAtLeast": 35,
            "unlockClueId": "clue_camera_fault"
          }
        ]
      },
      "visibleState": {
        "suspicion": 20,
        "questionsAsked": 0,
        "revealedClueIds": [],
        "mood": "nervous"
      }
    },
    "suspect_lena": {
      "suspectId": "suspect_lena",
      "displayName": "Lena",
      "publicProfile": "Direct witness who dislikes drama and wants the case closed.",
      "npcRole": "honest_witness",
      "isCulprit": false,
      "publicMotiveIds": [],
      "privateKnowledge": {
        "knowsClueIds": [
          "clue_lena_heard_cart"
        ],
        "mustNotRevealClueIdsBeforePressure": [],
        "allowedFalseClaims": [],
        "pressureUnlocks": []
      },
      "visibleState": {
        "suspicion": 10,
        "questionsAsked": 0,
        "revealedClueIds": [],
        "mood": "impatient"
      }
    }
  },
  "clues": {
    "clue_ivo_gap": {
      "clueId": "clue_ivo_gap",
      "publicText": "Ivo cannot account for several minutes near 21:10.",
      "sourceSuspectIds": [
        "suspect_ivo",
        "suspect_lena"
      ],
      "unlocked": false,
      "isCritical": true
    },
    "clue_debt_message": {
      "clueId": "clue_debt_message",
      "publicText": "A message hints Ivo needed money urgently.",
      "sourceSuspectIds": [
        "suspect_ivo"
      ],
      "unlocked": false,
      "isCritical": true
    },
    "clue_mara_saw_prototype": {
      "clueId": "clue_mara_saw_prototype",
      "publicText": "Mara saw the prototype after 21:05.",
      "sourceSuspectIds": [
        "suspect_mara"
      ],
      "unlocked": false,
      "isCritical": false
    },
    "clue_camera_fault": {
      "clueId": "clue_camera_fault",
      "publicText": "Theo broke the camera before the theft.",
      "sourceSuspectIds": [
        "suspect_theo"
      ],
      "unlocked": false,
      "isCritical": false
    },
    "clue_lena_heard_cart": {
      "clueId": "clue_lena_heard_cart",
      "publicText": "Lena heard a cart roll toward the storage door.",
      "sourceSuspectIds": [
        "suspect_lena"
      ],
      "unlocked": false,
      "isCritical": false
    }
  },
  "playerNotebook": {
    "unlockedClueIds": [],
    "suspectNotes": {
      "suspect_ivo": [],
      "suspect_mara": [],
      "suspect_theo": [],
      "suspect_lena": []
    },
    "contradictions": []
  },
  "transcript": [
    {
      "turnId": "turn_001",
      "roundIndex": 1,
      "suspectId": "suspect_ivo",
      "questionText": "Where were you between 21:00 and 21:15?",
      "answerText": "I was in the break room, grabbing a snack.",
      "revealedClueId": null,
      "suspicionDeltaApplied": 2,
      "createdAt": "2026-05-05T00:00:00.000Z",
      "source": "ai"
    }
  ],
  "accusation": {
    "submitted": false,
    "accusedSuspectId": null,
    "selectedMotiveId": null,
    "selectedEvidenceClueIds": []
  },
  "resolution": {
    "outcome": null,
    "culpritCorrect": null,
    "motiveCorrect": null,
    "evidenceScore": 0,
    "finalText": null
  }
}
```

### State Isolation Rule

The frontend may store `truthTable` in `gameState`, but live AI request builders must never pass:

- `truthTable.culpritSuspectId`;
- `truthTable.trueMotiveId`;
- complete `truthTable.trueTimeline`;
- any clue that is not in the active suspect's `privateKnowledge.knowsClueIds` or public facts.

This allows full client-side gameplay while preventing the live NPC model from spoiling the answer by accident.

## AI CONTRACTS

### Live NPC Request Contract

This is the compact object the client sends to the serverless proxy. The proxy adds the Groq key, calls `llama-3.1-8b-instant`, and returns the model JSON. The request contains only what the active NPC is allowed to know.

```json
{
  "provider": "groq",
  "model": "llama-3.1-8b-instant",
  "requestId": "turn_002",
  "casePublic": {
    "caseId": "case_lab_001",
    "title": "The Missing Prototype",
    "publicBrief": "A prototype vanished from the lab between 21:00 and 21:15.",
    "publicFacts": [
      "The prototype was last checked before 21:00.",
      "A corridor camera stopped recording before the theft."
    ]
  },
  "npc": {
    "suspectId": "suspect_ivo",
    "displayName": "Ivo",
    "publicProfile": "Calm lab treasurer who claims he was reviewing inventory.",
    "npcRole": "liar_culprit",
    "mood": "controlled",
    "suspicion": 37,
    "questionsAsked": 1,
    "allowedKnowledge": {
      "knownPublicClues": [],
      "knownPrivateClues": [
        {
          "clueId": "clue_ivo_gap",
          "npcFacingText": "You cannot account for several minutes near 21:10."
        }
      ],
      "allowedFalseClaims": [
        "I was in the break room.",
        "Mara had more access than I did."
      ],
      "revealableClueIdsThisTurn": [
        "clue_ivo_gap"
      ]
    }
  },
  "turn": {
    "roundIndex": 1,
    "actionPointsRemaining": 6,
    "playerQuestion": "Where were you between 21:00 and 21:15, and why should I trust you?",
    "recentTranscript": [
      {
        "questionText": "Did you see Mara near the lab?",
        "answerText": "Mara was acting strange, but I did not follow her."
      }
    ]
  },
  "outputRules": {
    "maxAnswerChars": 260,
    "allowedTruthfulness": [
      "truth",
      "partial",
      "lie",
      "evasive"
    ],
    "suspicionDeltaMin": -2,
    "suspicionDeltaMax": 4,
    "allowedRevealedClueIds": [
      "clue_ivo_gap"
    ]
  }
}
```

### Live NPC Request JSON Schema

```json
{
  "type": "object",
  "required": [
    "provider",
    "model",
    "requestId",
    "casePublic",
    "npc",
    "turn",
    "outputRules"
  ],
  "additionalProperties": false,
  "properties": {
    "provider": {
      "const": "groq"
    },
    "model": {
      "const": "llama-3.1-8b-instant"
    },
    "requestId": {
      "type": "string",
      "minLength": 1
    },
    "casePublic": {
      "type": "object",
      "required": [
        "caseId",
        "title",
        "publicBrief",
        "publicFacts"
      ],
      "additionalProperties": false,
      "properties": {
        "caseId": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "publicBrief": {
          "type": "string"
        },
        "publicFacts": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "maxItems": 6
        }
      }
    },
    "npc": {
      "type": "object",
      "required": [
        "suspectId",
        "displayName",
        "publicProfile",
        "npcRole",
        "mood",
        "suspicion",
        "questionsAsked",
        "allowedKnowledge"
      ],
      "additionalProperties": false,
      "properties": {
        "suspectId": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        },
        "publicProfile": {
          "type": "string"
        },
        "npcRole": {
          "enum": [
            "liar_culprit",
            "hides_motive",
            "honest_witness",
            "confused_innocent"
          ]
        },
        "mood": {
          "type": "string"
        },
        "suspicion": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100
        },
        "questionsAsked": {
          "type": "integer",
          "minimum": 0
        },
        "allowedKnowledge": {
          "type": "object",
          "required": [
            "knownPublicClues",
            "knownPrivateClues",
            "allowedFalseClaims",
            "revealableClueIdsThisTurn"
          ],
          "additionalProperties": false,
          "properties": {
            "knownPublicClues": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "maxItems": 6
            },
            "knownPrivateClues": {
              "type": "array",
              "items": {
                "type": "object",
                "required": [
                  "clueId",
                  "npcFacingText"
                ],
                "additionalProperties": false,
                "properties": {
                  "clueId": {
                    "type": "string"
                  },
                  "npcFacingText": {
                    "type": "string",
                    "maxLength": 160
                  }
                }
              },
              "maxItems": 3
            },
            "allowedFalseClaims": {
              "type": "array",
              "items": {
                "type": "string",
                "maxLength": 120
              },
              "maxItems": 4
            },
            "revealableClueIdsThisTurn": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "maxItems": 2
            }
          }
        }
      }
    },
    "turn": {
      "type": "object",
      "required": [
        "roundIndex",
        "actionPointsRemaining",
        "playerQuestion",
        "recentTranscript"
      ],
      "additionalProperties": false,
      "properties": {
        "roundIndex": {
          "type": "integer",
          "minimum": 0,
          "maximum": 3
        },
        "actionPointsRemaining": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9
        },
        "playerQuestion": {
          "type": "string",
          "minLength": 1,
          "maxLength": 180
        },
        "recentTranscript": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "questionText",
              "answerText"
            ],
            "additionalProperties": false,
            "properties": {
              "questionText": {
                "type": "string",
                "maxLength": 180
              },
              "answerText": {
                "type": "string",
                "maxLength": 260
              }
            }
          },
          "maxItems": 2
        }
      }
    },
    "outputRules": {
      "type": "object",
      "required": [
        "maxAnswerChars",
        "allowedTruthfulness",
        "suspicionDeltaMin",
        "suspicionDeltaMax",
        "allowedRevealedClueIds"
      ],
      "additionalProperties": false,
      "properties": {
        "maxAnswerChars": {
          "type": "integer",
          "maximum": 320
        },
        "allowedTruthfulness": {
          "type": "array",
          "items": {
            "enum": [
              "truth",
              "partial",
              "lie",
              "evasive"
            ]
          }
        },
        "suspicionDeltaMin": {
          "type": "integer",
          "minimum": -5,
          "maximum": 0
        },
        "suspicionDeltaMax": {
          "type": "integer",
          "minimum": 0,
          "maximum": 5
        },
        "allowedRevealedClueIds": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "maxItems": 2
        }
      }
    }
  }
}
```

### Live NPC Response Contract

The model must return a compact JSON object. The engine must validate and sanitize it before applying state changes.

```json
{
  "answer_text": "I was in the break room, grabbing a snack. Mara had more reason to be near the lab than I did.",
  "truthfulness": "lie",
  "suspicion_delta": 2,
  "revealed_clue_id": "clue_ivo_gap",
  "contradiction_risk": 64,
  "npc_mood": "controlled",
  "notebook_hint": "Ivo avoided giving a precise minute."
}
```

### Live NPC Response JSON Schema

```json
{
  "type": "object",
  "required": [
    "answer_text",
    "truthfulness",
    "suspicion_delta",
    "revealed_clue_id",
    "contradiction_risk",
    "npc_mood",
    "notebook_hint"
  ],
  "additionalProperties": false,
  "properties": {
    "answer_text": {
      "type": "string",
      "minLength": 1,
      "maxLength": 320
    },
    "truthfulness": {
      "enum": [
        "truth",
        "partial",
        "lie",
        "evasive"
      ]
    },
    "suspicion_delta": {
      "type": "integer",
      "minimum": -2,
      "maximum": 4
    },
    "revealed_clue_id": {
      "type": [
        "string",
        "null"
      ]
    },
    "contradiction_risk": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "npc_mood": {
      "type": "string",
      "maxLength": 40
    },
    "notebook_hint": {
      "type": "string",
      "maxLength": 120
    }
  }
}
```

### Engine Validation of AI Response

Before mutating state:

1. Parse JSON.
2. Reject non-object output.
3. Validate required fields.
4. Clamp `suspicion_delta` to `[-2, 4]`.
5. If `revealed_clue_id` is not in `allowedRevealedClueIds`, replace it with `null`.
6. If `answer_text` contains an illegal direct spoiler, keep the text for transcript only if safe; otherwise replace with fallback answer.
7. Apply clue unlock only through engine validation.
8. Never infer win/loss from `answer_text`.

Illegal direct spoiler examples:

- "I am the culprit."
- "The true motive is debt."
- "The game answer is Ivo."

If detected, mark a local `engineWarning` and continue with deterministic state.

## DETERMINISTIC RULES

### Action Validation

A question action is valid only when:

- `phase === "interrogation"`;
- `actionPointsRemaining > 0`;
- `roundIndex < maxRounds`;
- selected suspect exists;
- suspect questions asked is below `maxQuestionsPerSuspect`;
- question length is `1..maxQuestionChars`;
- request is not already pending.

Invalid action returns a local UI error and does not call AI.

### Suspicion Rules

Suspicion is player-facing drama, not proof.

```txt
newSuspicion = clamp(oldSuspicion + ai.suspicion_delta + engineBonus, 0, 100)
```

Engine bonuses:

- +2 if NPC reveals a contradiction clue.
- +1 if same suspect gives conflicting time information.
- -1 if NPC gives a clue that clears them.

Suspicion can guide the player but does not determine win/loss.

### Clue Unlock Rules

A clue unlocks only when:

- AI response includes `revealed_clue_id`;
- ID is in `allowedRevealedClueIds` for this exact request;
- clue exists in `gameState.clues`;
- clue source includes the active suspect or the clue is public.

The engine writes:

- `clues[clueId].unlocked = true`;
- add to `playerNotebook.unlockedClueIds`;
- add transcript reference.

### Round Advancement

After each valid question:

1. Decrement `actionPointsRemaining`.
2. Increment suspect `questionsAsked`.
3. If total questions in current round reaches 3, increment `roundIndex`.
4. If `roundIndex >= maxRounds` or `actionPointsRemaining <= 0`, set `phase = "accusation"`.

Suggested distribution:

- Round 1: broad alibi questions.
- Round 2: pressure questions based on unlocked clues.
- Round 3: contradiction checks and final suspicion adjustment.

### Accusation Validation

Input:

```json
{
  "accusedSuspectId": "suspect_ivo",
  "selectedMotiveId": "motive_debt",
  "selectedEvidenceClueIds": [
    "clue_ivo_gap",
    "clue_debt_message"
  ]
}
```

Deterministic check:

```txt
culpritCorrect = accusedSuspectId === truthTable.culpritSuspectId
motiveCorrect = selectedMotiveId === truthTable.trueMotiveId
evidenceScore = count(selectedEvidenceClueIds that exist in truthTable.validEvidenceForPerfectWin)
```

Outcome:

```txt
if culpritCorrect && motiveCorrect && evidenceScore >= 2:
  outcome = "perfect_win"
else if culpritCorrect:
  outcome = "partial_win"
else:
  outcome = "loss"
```

AI text cannot override this result.

### Save/Load Rules

LocalStorage key:

```txt
liarline.save.v1
```

On load:

1. Parse JSON.
2. Validate `schemaVersion`.
3. Validate required top-level fields.
4. If corrupted, move the raw value to `liarline.save.corrupt.<timestamp>` and start a new case.
5. Never merge partial corrupted state into active play.

## RELIABILITY PLAN

### Failure Classes

| Failure | Handling |
|---|---|
| 429 rate limit | Use local fallback NPC answer, consume action only if player confirms or if request already reached proxy. Show small "connection strained" state. |
| Timeout | Abort after 8-10 seconds for live play. Use local fallback answer. |
| Invalid JSON | Retry once with stricter proxy-side repair instruction. If still invalid, use fallback. |
| Illegal clue ID | Drop `revealed_clue_id`, keep safe answer if text is usable. |
| Spoiler/confession hallucination | Replace answer with fallback evasive answer and log `engineWarning`. |
| Proxy unavailable | Disable free-text question input and allow local seeded question responses. |
| LocalStorage full/corrupt | Continue in memory, warn player that save may not persist. |

### Fallback Answer Bank

Fallback answers are deterministic and role-aware:

```json
{
  "liar_culprit": [
    "I already told you what I know. You are reading too much into this.",
    "Ask someone else. I was nowhere near the prototype when it vanished."
  ],
  "hides_motive": [
    "I do not want to talk about that part yet.",
    "My rivalry with them has nothing to do with the missing prototype."
  ],
  "honest_witness": [
    "I can only tell you what I saw. I will not invent details.",
    "That is all I remember for now."
  ],
  "confused_innocent": [
    "I am nervous, but that does not make me guilty.",
    "The timing is blurry. I made a mistake, but not that mistake."
  ]
}
```

Fallback state mutation:

- `answer_text`: selected fallback;
- `truthfulness`: `"evasive"`;
- `suspicion_delta`: `0` or `1`;
- `revealed_clue_id`: `null`;
- `contradiction_risk`: `10`;
- `source`: `"fallback"`.

### Compact Context Strategy

`llama-3.1-8b-instant` should receive:

- 1 active NPC role block;
- public case facts, maximum 6;
- active NPC knowledge, maximum 3 private clue summaries;
- last 2 exchanges with this NPC;
- current question;
- strict response schema.

It should not receive:

- complete transcript;
- all suspect private knowledge;
- full truth table;
- complete true timeline;
- verbose design lore.

### Serverless Proxy Contract

Endpoint:

```txt
POST /api/ai/npc-turn
```

Responsibilities:

- read Groq API key from environment;
- accept only validated request payload;
- call Groq chat completions;
- enforce timeout;
- return raw model JSON plus provider timing metadata;
- never store secrets client-side.

No WebSockets. No persistent backend database.

## FRONTEND HANDOFF

### Logical Modules

1. `caseRepository`
   - loads bundled seed cases;
   - validates case files;
   - provides default fallback case.

2. `gameEngine`
   - pure functions for phase transitions;
   - validates actions;
   - applies AI response safely;
   - resolves accusation;
   - never calls network directly.

3. `truthTableGuard`
   - builds AI-safe suspect context;
   - strips culprit/motive/global timeline from live AI request;
   - validates clue reveal permissions.

4. `aiClient`
   - calls `/api/ai/npc-turn`;
   - handles timeout, retry, 429, invalid response;
   - returns normalized `NpcTurnResult`.

5. `saveStore`
   - serializes/deserializes `gameState`;
   - writes LocalStorage;
   - handles corrupt saves.

6. `uiStore`
   - exposes current screen state;
   - tracks pending request and transient UI errors;
   - separates UI flags from game truth.

7. `questionBank`
   - provides suggested questions per round;
   - maps unlocked clues to pressure questions;
   - enforces max question length for custom input.

8. `notebookEngine`
   - derives player-visible notes from unlocked clues and transcript;
   - detects contradiction candidates from deterministic clue metadata.

9. `resolutionEngine`
   - computes `perfect_win`, `partial_win`, or `loss`;
   - formats deterministic resolution data for UI.

10. `telemetryLite`
    - local-only debug counters for hackathon tuning;
    - tracks latency, fallback count, invalid JSON count;
    - does not collect personal data.

### Suggested File Layout

```txt
src/
  data/
    seedCases/
      case_lab_001.json
    fallbackResponses.json
  engine/
    gameEngine.ts
    resolutionEngine.ts
    truthTableGuard.ts
    notebookEngine.ts
  services/
    aiClient.ts
    saveStore.ts
  state/
    uiStore.ts
    gameStateTypes.ts
  questions/
    questionBank.ts
  api/
    npc-turn.ts
```

### Verification Checklist

- The game can run with bundled seed cases and no database.
- LocalStorage can persist and restore `gameState`.
- Accusation result is computed without AI.
- Live AI request does not include `truthTable`.
- Live AI request includes only active suspect knowledge.
- Invalid AI JSON cannot mutate core state.
- Illegal clue IDs are ignored.
- Action points prevent infinite chat.
- Fallback responses keep the game playable during API failure.

