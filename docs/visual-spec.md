# Liarline Visual Spec

Verification date: 2026-05-06.
Mode: VISUAL DIRECTION + VISUAL HANDOFF.
Target surface: mobile browser, 375-430 px viewport width.

## 1. Design Soul

Liarline uses a **Neo-Noir Interrogation Terminal** direction: a cold digital case terminal with warm forensic highlights and sharp red moments when suspicion rises. The interface should feel like the player is operating a compact detective device under pressure, not browsing a dashboard.

The visual language is built from:
- high-contrast dark surfaces;
- forensic amber for actionable evidence;
- signal red only for danger, lies, high suspicion, and final failure states;
- mono-coded clue metadata;
- tight borders, scanline-like separators, and dossier strips;
- Lucide-style line icons with consistent stroke weight.

No custom illustration pipeline is required. Atmosphere must come from typography, spacing, color, borders, shadows, micro-motion, and compact mobile composition.

Avoid:
- generic SaaS cards;
- glassmorphism everywhere;
- purple/blue gradient hero sections;
- marketing landing composition;
- photo-realistic detective art;
- tiny terminal text that looks stylish but fails mobile readability.

## 2. Evidence And Constraints Used

Project evidence:
- `docs/GAME_ARCHITECTURE.md`: four phases are Init, Interrogation, Accusation, Resolution.
- `MODEL_SELECTION.md`: live NPC latency is fast enough for responsive chat feedback.
- `src/ai/contracts.ts`: NPC mood, suspicion, action limits, clues, and response metadata are real UI data surfaces.

Current external evidence checked on 2026-05-05:
- GitHub DESIGN.md ecosystem is active and favors AI-readable design specs with tokens, screen rules, and implementation constraints: https://github.com/VoltAgent/awesome-design-md
- Tailwind v4 uses CSS-first `@theme` variables that create matching utilities: https://tailwindcss.com/docs/theme
- WCAG 2.2 target-size minimum is 24 CSS px, but Liarline uses a stricter 44 px touch target for mobile comfort: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Apple button guidance uses at least 44 x 44 pt hit regions for comfortable touch selection: https://developer.apple.com/design/human-interface-guidelines/buttons
- Font candidates are available from Google Fonts: Inter and Space Mono.

Current implementation evidence checked on 2026-05-06:
- Mobile virtual keyboards can shrink the visual viewport independently from the layout viewport, so the interrogation composer must account for `window.visualViewport`: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
- The viewport `interactive-widget=resizes-content` path is valid for mobile browser keyboard behavior where supported: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport
- Next.js App Router recovery should use `error.tsx` / `global-error.tsx` reset affordances instead of trapping the player in a broken route: https://nextjs.org/docs/app/getting-started/error-handling
- Liarline keeps a stricter 44 px mobile hit-area target even though WCAG 2.2 minimum target size has exceptions: https://www.w3.org/TR/wcag/#target-size

No current UI screenshot or rendered prototype exists in the workspace. This spec does not claim pixel-level critique of an existing interface.

## 2A. 2026 Core Recheck: Simplified Game Fit

The first release deliberately stays around six core systems: Interrogation, Suspicion, Contradiction, Notebook, Accusation, Resolution. The visual layer must strengthen those systems instead of adding extra dashboard surfaces.

Required visual thesis:
- Liarline must read as an interrogation thriller on the first screen: suspect portrait first, compact case pressure, one obvious first action.
- The first AI answer should feel like a nervous human performance, not a generic chat response; the transcript bubble should preserve hesitation, latency badge, and source honesty.
- Contradiction reveal is the main interaction payoff: amber evidence line, red collapse panel, suspicion movement, and persona shift must appear as one event.
- Collapse must look like a theory breaking, not a quiet state update; use signal red, `Zap` iconography, event badges, and a next-action block.
- Persona shift must be visible without reading every word: portrait treatment, red border/shadow, mood chip, and pressure-state label.
- Accusation is risk, not a mini-court: show final-risk copy, one explicit risk acknowledgement, suspect/motive/evidence proof checks, and deterministic verdict.
- Degraded AI state must be visually honest: fallback source badge, fallback reason, and copy that says no AP, clue, or suspicion changed.
- Custom question path must remain mobile-safe: bottom dock follows keyboard inset, transcript keeps bottom padding, Notebook remains reachable, and no action is hidden under the keyboard.

Do not add:
- generic AI dashboard panels;
- analytics-style charts;
- decorative “AI magic” gradients;
- long briefing walls before the first interrogation;
- complex trial UI beyond the selected suspect, motive, and evidence proof checks.

## 3. Design Tokens

Use Tailwind v4-style theme variables or map these values into `tailwind.config` if the project stays on Tailwind v3.

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --color-ink-950: #080A0D; /* rgb(8 10 13), app background */
  --color-ink-900: #0D1117; /* rgb(13 17 23), screen shell */
  --color-ink-850: #11161D; /* rgb(17 22 29), primary panel */
  --color-ink-800: #171E27; /* rgb(23 30 39), raised panel */
  --color-ink-700: #202A36; /* rgb(32 42 54), active surface */

  --color-line-700: #2A3441; /* rgb(42 52 65), default border */
  --color-line-500: #455363; /* rgb(69 83 99), active border */

  --color-paper-300: #E8D8B6; /* rgb(232 216 182), clue slip only */
  --color-paper-700: #7B6846; /* rgb(123 104 70), subdued paper ink */

  --color-text-50: #F3F0E8; /* rgb(243 240 232), primary text */
  --color-text-200: #D4D8DE; /* rgb(212 216 222), secondary text */
  --color-text-400: #A7B0BC; /* rgb(167 176 188), muted text */
  --color-text-600: #6F7B89; /* rgb(111 123 137), disabled text */

  --color-forensic-500: #F5B84B; /* rgb(245 184 75), primary action/evidence */
  --color-forensic-700: #A96D18; /* rgb(169 109 24), pressed amber */

  --color-signal-500: #FF3B45; /* rgb(255 59 69), suspicion/danger */
  --color-signal-700: #A91F2B; /* rgb(169 31 43), pressed danger */

  --color-cyan-400: #64D2FF; /* rgb(100 210 255), system/focus */
  --color-green-400: #58D68D; /* rgb(88 214 141), verified clue */

  --radius-liarline: 8px;
  --shadow-terminal: 0 0 0 1px rgb(245 184 75 / 0.12), 0 18px 44px rgb(0 0 0 / 0.42);
  --shadow-signal: 0 0 0 1px rgb(255 59 69 / 0.22), 0 0 22px rgb(255 59 69 / 0.14);
  --spacing-safe-bottom: max(16px, env(safe-area-inset-bottom));
  --spacing-safe-top: max(14px, env(safe-area-inset-top));
}
```

### Color Usage

Background stack:
- app background: `ink-950`;
- fixed shell/header: `ink-900`;
- major panels: `ink-850`;
- raised cards, drawers, composer: `ink-800`;
- selected/pressed surfaces: `ink-700`.

Accent discipline:
- amber is the main playable accent: start, ask, inspect, opened clue;
- red is not decorative: high suspicion, contradiction, failed verdict, danger actions;
- cyan is focus/system feedback;
- green is only for verified/confirmed evidence.

Paper color must stay rare. Use it only for physical-feeling clue slips inside the Notebook, never as a page background.

## 4. Typography

Primary font: **Inter** for all UI text.
Secondary font: **Space Mono** for case IDs, timestamps, clue IDs, terminal labels, action counters, and truth-table-flavored metadata visible to the player.

Mobile type scale:
- Screen title: 28 px / 32 px, weight 700.
- Phase title: 20 px / 26 px, weight 700.
- Card title: 17 px / 22 px, weight 650 or 700.
- Body/chat: 15 px / 22 px, weight 500.
- Button: 15 px / 18 px, weight 700.
- Caption/metadata: 12 px / 16 px, weight 600.
- Terminal micro-labels: 11 px / 14 px, Space Mono, uppercase only when short.

Rules:
- no viewport-scaled font sizes;
- no negative letter spacing;
- body text should never drop below 14 px;
- long suspect names wrap to two lines instead of shrinking below 14 px;
- mono text is for evidence flavor, not for long paragraphs.

## 5. Mobile Shell

Base viewport: 375-430 px wide. Design for one-handed reading and bottom reach.

Shell structure:
1. Top case strip, sticky: phase, case ID, round/action summary.
2. Main scroll region: screen content.
3. Bottom action zone, sticky: primary action, question choices, composer, or accusation CTA.

Safe area:
- top padding: `max(14px, env(safe-area-inset-top))`;
- bottom padding: `max(16px, env(safe-area-inset-bottom))`;
- sticky bottom zones must add at least 12 px above the safe-area inset.

Spacing rhythm:
- outer mobile gutter: 16 px;
- dense section gap: 10-12 px;
- standard section gap: 16 px;
- major phase gap: 24 px;
- card padding: 14-16 px;
- bottom CTA height: 52-56 px.

Touch targets:
- all interactive controls: minimum 44 x 44 px hit area;
- question chips may be visually shorter only if their tappable wrapper remains 44 px high;
- icon-only buttons: 44 x 44 px frame, 20-22 px icon.

## 6. Screen Layouts

### 6.1 Briefing Screen

Purpose: give the player the case, suspects, and action economy before interrogation.

Layout:
- Sticky top strip: `CASE L-###`, phase `Briefing`, small AP preview.
- Hero block is not a marketing hero. It is a dossier header:
  - case title;
  - one-sentence public brief;
  - location/time metadata in Space Mono;
  - thin amber divider.
- Suspect roster:
  - four compact suspect cards in a 2 x 2 grid;
  - each card shows initials/avatar glyph, name, public alibi tag, neutral suspicion baseline;
  - cards are inspectable but not chat screens yet.
- Evidence preview:
  - 2-3 public clues as paper slips;
  - locked clue count as dark terminal chips.
- Bottom CTA:
  - primary amber button `Начать допрос`;
  - secondary text action `Посмотреть правила` only if rules exist.

Visual tone:
- slow pressure, not panic;
- amber evidence lines guide the eye from case title to suspects to CTA.

### 6.2 Interrogation Screen

Purpose: primary gameplay screen. The player interrogates one NPC at a time under strict action limits.

Layout:
- Sticky top strip:
  - back/roster icon;
  - suspect name;
  - `Round 1/3`;
  - `AP 7/9` as pips, not only text.
- Suspect dossier card:
  - name, role-facing public persona, mood chip, current suspicion;
  - `suspicion` bar directly under the name;
  - quick switch row for four suspects as initials chips.
- Chat region:
  - player questions right-aligned, compact dark panels;
  - NPC answers left-aligned, larger readable panels;
  - evidence links embedded as small amber clue chips;
  - last 4-6 exchanges visually prioritized; older messages fade slightly.
- Bottom question zone:
  - 2-3 suggested question buttons in a vertical stack;
  - optional short custom input in a collapsible composer.

Keyboard-safe behavior:
- when text input is focused, collapse suggested question stack to a single horizontal row above the input;
- keep the composer sticky above `env(safe-area-inset-bottom)`;
- add 96-128 px bottom padding to the chat scroll region while the keyboard is expected;
- do not place the suspicion bar or AP counter inside the keyboard-covered area;
- allow sending with a 44 px icon button and a visible label fallback for accessibility.

AI thinking state:
- show a compact terminal pulse for at least 450 ms, even if the response returns faster, so the state reads as intentional;
- text label: `ANALYZING RESPONSE`;
- three dots or scanline sweep inside the NPC answer bubble;
- no full-screen spinner.

### 6.3 Notebook / Clues Drawer

Purpose: keep unlocked facts accessible without leaving the interrogation flow.

Layout:
- Bottom drawer, 72-88 vh height;
- top grab handle with `Notebook` title and clue count;
- tabs: `Улики`, `Противоречия`, `Подозреваемые`;
- unlocked clues shown as paper slips on dark panels;
- locked clues shown as dim terminal rows with hidden descriptions;
- contradiction tags use red outline only when validated by the engine.

Interaction:
- swipe down closes;
- tap clue copies it into the current question context if allowed;
- newly revealed clue gets one amber flash and a notebook badge increment;
- drawer never covers the top phase strip completely, preserving orientation.

### 6.4 Accusation Screen

Purpose: force a finite final choice, not an endless chat.

Layout:
- Top strip: `Final Accusation`, remaining AP disabled/closed;
- Stepper:
  1. choose culprit from four suspect cards;
  2. choose motive from discovered/available motive cards;
  3. attach one supporting clue if game rules require it.
- Selected suspect card becomes high-contrast with amber border;
- invalid or missing evidence shows inline red explanation;
- bottom CTA: red/amber hybrid `Выдвинуть обвинение`, with confirmation sheet.

Do not use free-form text for the final answer. The deterministic engine must compare IDs.

### 6.5 Resolution Screen

Purpose: show deterministic result and make AI performance feel integrated without making AI the judge.

Layout:
- Verdict header:
  - win: amber-white `CASE CLOSED`;
  - partial: amber `PARTIAL TRUTH`;
  - loss: signal red `WRONG ACCUSATION`.
- Truth reveal:
  - culprit ID, motive ID, key clue ID;
  - timeline summary as 3-5 mono-stamped rows.
- NPC behavior recap:
  - compact list showing which NPC lied, hid motive, was honest, or confused;
  - use role labels only after resolution.
- CTA:
  - `Новое дело`;
  - `Переиграть seed`;
  - `Поделиться результатом` if implemented.

## 7. Game Metrics Display

### Suspicion

`suspicion` is 0-100 and must be shown with three redundant cues:
1. numeric value, e.g. `62`;
2. labeled status, e.g. `Нервничает`;
3. progress bar with threshold color.

Thresholds:
- 0-24: `calm`, cyan-white bar, label `Спокоен`;
- 25-49: `uneasy`, amber bar, label `Напряжен`;
- 50-74: `nervous`, amber-to-red bar, label `Нервничает`;
- 75-100: `breaking`, red bar, label `На грани`.

Bar rules:
- 6 px height minimum;
- rounded 4 px;
- animated width change over 220 ms;
- above 75, add a subtle red pulse on the bar only, not the whole card;
- never rely on color alone.

### actionPointsRemaining

Display as:
- top strip text: `AP 7/9`;
- nine small pips or cartridge marks;
- spent pips are dark outlined, available pips amber;
- last two AP trigger a subtle amber warning state;
- zero AP disables question controls and routes to Accusation.

### Rounds

Display as `Round 1/3` plus three short tick marks. Current round is amber, completed rounds are muted, locked future rounds are outlined.

## 8. Component Rules

### Buttons

Primary:
- amber background, dark text, 52-56 px high;
- pressed state darkens to forensic-700;
- focus ring: 2 px cyan outer ring plus 2 px dark offset.

Secondary:
- transparent dark surface, line-500 border, text-50;
- hover/active on mobile simulated via pressed background `ink-700`.

Danger:
- signal-500 background or red border depending severity;
- use only for accusation confirmation, contradiction warnings, or reset.

Disabled:
- ink-800 background, line-700 border, text-600;
- no glow, no animation.

### NPC Cards

Base:
- dark raised panel, 8 px radius, 1 px line border;
- initials/avatar glyph in mono block;
- name, public alibi, suspicion summary.

Mood variants from `npc_mood`:
- `calm`: line-700 border, cyan micro-chip, no glow.
- `nervous`: amber border segment, slight 1 px jitter on new answer only.
- `defensive`: amber/red split border, sharper shadow, answer bubble has clipped-corner feel.
- `angry`: red border and red mood chip, no full-card flashing.
- `evasive`: dashed amber line, clue chips appear more prominent.

Use mood as feedback, not as a direct truth indicator. The player should suspect, not receive certainty.

### Chat Bubbles

Player:
- right aligned, max width 82%;
- ink-700 fill, line-500 border;
- small `Q` marker in Space Mono.

NPC:
- left aligned, max width 88%;
- ink-850 fill, line-700 border;
- mood-colored left rail, 3 px wide;
- revealed clue chips sit under the text, not inline inside long sentences.

System/fallback:
- centered compact terminal row;
- cyan border for network/system fallback;
- text states that the suspect refuses or hesitates, without implying hidden truth.

### Clue Cards

Unlocked:
- paper-300 slip on dark backing;
- clue ID and timestamp in Space Mono;
- short title in Inter 15/20;
- tag row: `public`, `suspect`, `contradiction`, `motive`.

Locked:
- dark row, line-700 border, hidden title as `REDACTED`;
- avoid fake content.

New:
- amber left border and 900 ms badge glow;
- reduced motion: instant badge increment and border highlight.

## 9. Motion And Feedback

Motion budget:
- fast, crisp, mostly 120-240 ms;
- no heavy page transitions;
- all motion must have `prefers-reduced-motion` alternative.

Recommended timings:
- screen phase transition: 180 ms fade + 8 px vertical slide;
- chat bubble enter: 140 ms;
- AI thinking pulse: minimum visible 450 ms, maximum normal 900 ms before timeout copy appears;
- suspicion bar change: 220 ms;
- clue reveal: 240 ms drawer badge pop + 900 ms glow decay;
- accusation confirmation sheet: 180 ms bottom slide.

AI response feedback:
1. User taps question: AP pip spends immediately.
2. NPC card rail enters thinking state.
3. Temporary thinking bubble shows `ANALYZING RESPONSE`.
4. When response arrives, replace the thinking bubble with answer text and animate suspicion delta.
5. If `revealed_clue_id` exists, notebook badge increments after the answer lands.

Timeout/fallback feedback:
- after endpoint fallback, show normal NPC bubble with safer refusal copy;
- add tiny cyan system tag `connection unstable`;
- do not show raw provider errors to player.

## 10. Iconography

Use one line icon family, preferably Lucide:
- `FileText` for case file;
- `MessageSquare` for interrogation;
- `BookOpen` for notebook;
- `Search` for inspect;
- `AlertTriangle` for contradiction;
- `Fingerprint` for evidence;
- `Gavel` or `BadgeAlert` for accusation;
- `RotateCcw` for replay.

Icon rules:
- 20-22 px inside 44 px hit targets;
- stroke width consistent at 2 px;
- icons do not replace labels for primary actions;
- no mixed emoji/icon visual language.

## 11. Accessibility Rules

- Minimum hit area: 44 x 44 px for game controls.
- Body/chat text: at least 14 px; target 15 px.
- Focus state visible on every button, chip, drawer handle, input, and suspect switch.
- Suspicion and mood are not color-only: always include numeric/text labels.
- Avoid rapid flashing; red pulse must be subtle and localized.
- Respect `prefers-reduced-motion`.
- Drawer close must be available through a visible button, not only swipe.
- The final accusation uses selectable cards with labels and checked state.

## 12. Implementation Handoff

Suggested UI module names:
- `AppShell`: safe-area layout, top phase strip, bottom action zone.
- `CaseBriefingScreen`: case intro and suspect roster.
- `InterrogationScreen`: suspect card, chat, question controls, AI thinking state.
- `NotebookDrawer`: clue and contradiction drawer.
- `AccusationScreen`: deterministic final selection.
- `ResolutionScreen`: verdict and truth reveal.
- `SuspicionMeter`: shared suspicion rendering.
- `ActionPointPips`: shared AP display.
- `NpcMoodFrame`: mood-to-border/token mapping.

Do not hardcode mystery truth into UI components. Components receive public state, current suspect state, visible clues, and deterministic result only after resolution.

## 13. Visual Acceptance Criteria

- The first screen reads as a game case briefing, not as a SaaS dashboard.
- Interrogation screen is usable at 375 px width without horizontal scroll.
- Bottom controls remain above iPhone safe area and leave keyboard room when custom input is focused.
- `suspicion` is visible as numeric value, label, and threshold-colored bar.
- `actionPointsRemaining` is visible as both number and pips.
- Four phases have distinct but coherent layouts.
- No required custom illustration or generated bitmap assets.
- All main touch targets are at least 44 x 44 px.
- Reduced-motion mode keeps all feedback understandable.
