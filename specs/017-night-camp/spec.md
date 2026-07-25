# Feature Specification: Night Camp & Work Window

**Feature Branch**: `017-night-camp`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Day Garden vs Night Camp dual worlds: configurable work window (default 8 AM–5 PM local, AM/PM in Options); bonsai sleeps outside work hours (no day growth); separate night ledger advances a night scene (fireflies, growing campfire, stars, moon; frogs participate — more day frogs ⇒ more night frogs); cycle-bound until Start a new day; dim/overlay atmosphere never blocks UI or forces Appearance; day remains primary, night is warm bonus reward; Dev Mode Force night/day/Follow clock for testing parity with Simulate idle. Bake into product per constitution v2.1.0 Product Model."

**Prior art / binding product model**:
- Constitution v2.1.0 — *Product Model: Day Garden & Night Camp*
- `docs/product-model.md`
- Day growth / wilt: `specs/006-growing-bonsai/`, `specs/008-frog-friends/`
- Day-cycle archive: `specs/007-new-day-archive/`, Grove: `specs/010-grove-history/`
- Summaries: `specs/009-bonsai-tooltip-standup-summary/`
- Options surface: `specs/014-garden-palette/`

## Clarifications

### Session 2026-07-25 (product lock — pre-specify)

- Q: Default work window? → A: **8 AM – 5 PM local** (keep current 08:00–17:00 defaults); user-configurable in Options with **AM/PM** presentation converted to 24-hour local hours for logic.
- Q: Does the bonsai grow at night? → A: **No** — bonsai sleeps; night completions credit a **separate night ledger**.
- Q: Night frogs? → A: **Yes** — frogs participate in the night scene; more day frogs ⇒ more night frogs present; night ledger can involve frogs with night trinkets (e.g. fireflies).
- Q: Ledger / archive boundary? → A: **One day-cycle** until "Start a new day" (not calendar midnight).
- Q: Force dark mode at night? → A: **Never** — overlay/dim only; Appearance stays user-controlled.
- Q: Night stage depth? → A: **~4–5 discrete stages** for v1.
- Q: How do we test night without waiting for real clock / only editing work hours? → A: **Dev Mode force-realm** — same spirit as “Simulate +1h idle”: Force night / Force day / Follow clock, so night scenes and night-ledger credit can be exercised anytime.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set my work hours in Options (Priority: P1)

A person opens Options and sets when their work window starts and ends using familiar AM/PM times. The garden uses those hours (in the browser’s local timezone) to decide when the Day Garden is “on duty” versus when Night Camp begins. Defaults are 8:00 AM – 5:00 PM if they never change anything.

**Why this priority**: Without a configurable window, day/night realms cannot honor individual schedules; this is the control plane for wilt, bonsai sleep, and night credit.

**Independent Test**: Change work start/end in Options (AM/PM), reload the app, and confirm the stored window still applies; leave defaults and confirm 8 AM–5 PM local behavior.

**Acceptance Scenarios**:

1. **Given** a first-time (or reset) Options state, **When** the person views Work hours, **Then** start defaults to 8:00 AM and end defaults to 5:00 PM local.
2. **Given** Options is open, **When** the person picks a start and end using AM/PM controls, **Then** the choice persists across reload and is applied using the browser’s local clock (no separate timezone picker).
3. **Given** an invalid combination (e.g. end equal to or before start in a same-day window), **When** the person tries to save, **Then** the UI prevents or corrects the invalid window with calm, non-shaming guidance — work window always remains usable.
4. **Given** assistive technology, **When** the person edits work hours, **Then** controls are labelled, keyboard-operable, and announce AM/PM clearly.

---

### User Story 2 - Day Garden stays the work-centric core (Priority: P1)

During the work window, finishing tasks and focus sessions grows the bonsai and gathers frog friends as today. Idle time inside the window may gently wilt the tree (existing bounded wilt). The person experiences Day Garden as the primary world.

**Why this priority**: Night must not dilute the core product loop; day behavior is the baseline MVP of “worlds split correctly.”

**Independent Test**: Inside the work window, complete work and confirm bonsai/frogs grow; confirm wilt still only considers idle inside the configured window.

**Acceptance Scenarios**:

1. **Given** the local clock is inside the work window, **When** the person completes a task, focus session, or the day’s frog, **Then** Day Garden progress updates (bonsai / frogs) as in the existing day model.
2. **Given** idle time accumulates inside the work window, **When** wilt rules apply, **Then** wilt uses the **configured** work window (not a hardcoded forever-08–17 if the user changed hours).
3. **Given** the local clock is outside the work window, **When** idle time passes, **Then** the bonsai does **not** wilt from that off-window idle.

---

### User Story 3 - After hours, the bonsai sleeps and Night Camp rewards me (Priority: P1)

Outside the work window, the atmosphere softens (dim overlay). Completing work does **not** grow the sleeping bonsai; instead a separate Night Camp advances — fireflies, a growing campfire, stars, a filling moon — so late focus feels like a different, warmer world. The app stays fully usable; nothing is locked.

**Why this priority**: This is the signature dual-world experience and the main user-facing delight of the feature.

**Independent Test**: Prefer Dev **Force night** (or set a work window that makes “now” night), complete work, and confirm: no new bonsai growth; night scene stages advance; UI remains interactive; Appearance mode unchanged.

**Acceptance Scenarios**:

1. **Given** the local clock is outside the work window, **When** the person views the garden, **Then** a calm night atmosphere is present (dim / overlay) and Day vs Night reads as different worlds — without forcing light↔dark Appearance.
2. **Given** night atmosphere is active, **When** the person completes a task, focus session, or frog, **Then** Night Camp progress advances and the bonsai does **not** gain new day leaves/frogs from that completion.
3. **Given** night atmosphere is active, **When** the person uses any primary control (tasks, focus, Options, Start a new day, etc.), **Then** nothing is blocked, modal-locked, or told to “come back in the morning.”
4. **Given** Night Camp has received enough night completions, **When** the person views the scene, **Then** they can perceive roughly **4–5** discrete camp stages via fireflies, campfire growth, stars, and moon (scene poetry — not a numeric scoreboard).
5. **Given** `prefers-reduced-motion`, **When** night ornaments change, **Then** motion is instant or minimal and nothing is left invisible or unreadable.
6. **Given** night dim/overlay, **When** the person reads text or uses controls, **Then** contrast remains usable (WCAG AA for interactive chrome and text).

---

### User Story 4 - Dev Mode can fake night (and day) for testing (Priority: P1)

A developer (or anyone with Dev tools on) can force **Night Camp** or **Day Garden** regardless of the real clock — the same way they already simulate idle wilt — so night scenes, night-ledger credit, bonsai sleep, and frog-at-camp behavior are testable in one sitting. They can return to **Follow clock** anytime. Forcing a realm NEVER changes Appearance (light/dark) and NEVER blocks the UI.

**Dev tools must behave as one coherent test harness** (same Bonsai-card Dev strip as today):

| Control | Expected behavior |
|---|---|
| **Force night** | Effective realm = night. Atmosphere + Night Camp scene. Completions (task / focus / frog / Dev “Complete focus session”) credit **night ledger only**; bonsai does not gain day leaves/frogs. Wilt does **not** apply (including Dev “Simulate +1h idle” — no wilt while forced night). |
| **Force day** | Effective realm = day. Day atmosphere. Completions credit **Day Garden** as normal. “Simulate +1h idle” wilts as today’s day Dev tool. |
| **Follow clock** | Effective realm from work window + local clock only. All of the above follow the real realm. |
| **Reset** | Clears **both** Day Garden and Night Camp progress for the current cycle (fresh shrub + resting camp), same “start over” spirit as today. |
| Dev tools **off** | Any stored force is **ignored** (Follow clock). Normal users cannot get stuck in Force night. |

**Why this priority**: Without this, Night Camp is impractical to build and polish (depends on wall clock or constantly rewriting work hours). Parity with existing day Dev tools is required for the feature to be shippable with confidence.

**Independent Test**: Enable Dev tools → Force night → Complete focus session (night advances, bonsai unchanged) → Simulate +1h idle (no wilt) → Force day → Complete focus session (bonsai grows) → Simulate +1h idle (wilt) → Follow clock → confirm clock realm. Appearance untouched throughout.

**Acceptance Scenarios**:

1. **Given** Dev tools are enabled, **When** the person chooses **Force night**, **Then** the app behaves as night realm (atmosphere, bonsai sleep, night-ledger credit, Night Camp scene) even if the local clock is inside the work window.
2. **Given** Dev tools are enabled, **When** the person chooses **Force day**, **Then** the app behaves as day realm even if the local clock is outside the work window.
3. **Given** a forced realm is active, **When** the person chooses **Follow clock**, **Then** realm derivation returns to work-window + local clock only.
4. **Given** Force night is active, **When** the person uses Dev **Complete focus session** (or completes a real task/focus/frog), **Then** Night Camp advances and Day Garden bonsai leaves/frogs do not increase.
5. **Given** Force day is active, **When** the person uses Dev **Complete focus session**, **Then** Day Garden grows as in today’s Dev harness.
6. **Given** Force night is active, **When** the person uses Dev **Simulate +1h idle**, **Then** the bonsai does **not** show additional wilt from that action (night = asleep).
7. **Given** Force day is active, **When** the person uses Dev **Simulate +1h idle**, **Then** wilt behaves as the existing day Dev simulate tool.
8. **Given** Dev tools are enabled with day and/or night progress, **When** the person uses Dev **Reset**, **Then** both Day Garden and Night Camp for the cycle return to a fresh starting state.
9. **Given** a forced realm is active, **When** the person completes work or views the garden, **Then** a calm Dev-only indicator shows which realm is forced (so testers are not confused), and Appearance is unchanged.
10. **Given** Dev tools are turned off while a force was set, **When** the person uses the app normally, **Then** forced override does not affect non-dev use (override is ignored); Follow clock behavior applies for real users. Turning Dev tools back on MAY restore the last override for convenience.
11. **Given** keyboard/screen reader, **When** using Force night / Force day / Follow clock, **Then** controls are labelled and operable.

---

### User Story 5 - Frogs join the night (Priority: P1)

Frogs are companions across realms. Frogs earned in the Day Garden show up at Night Camp (more day frogs ⇒ more night frogs present). Night progress can involve frogs with night trinkets (for example catching or eating fireflies), so the camp feels inhabited, not empty décor.

**Why this priority**: Locked product requirement; without frogs, Night Camp loses the brand’s heart.

**Independent Test**: Earn several day frogs, enter night, confirm more frogs at camp than a low day-frog baseline; advance night ledger and confirm frog–firefly (or equivalent) participation reads clearly.

**Acceptance Scenarios**:

1. **Given** a high day-frog count and an active night atmosphere, **When** the person views Night Camp, **Then** more frogs are present than when day-frog count was low (same day-cycle).
2. **Given** night ledger progress involving frogs and fireflies (or equivalent night trinkets), **When** stages advance, **Then** frogs visibly participate in the night scene in a calm, non-gory, non-shameful way.
3. **Given** assistive technology, **When** the night scene is described, **Then** the garden/camp image (or labelled region) conveys night state without requiring separate inaccessible chrome.

---

### User Story 6 - Summaries show both worlds, clearly apart (Priority: P2)

When the person checks garden-related summaries (bonsai info / standup-adjacent garden recap, Grove / archived day), they see Day Garden and Night Camp as **sibling, differentiated** beats — day as garden stage, night as camp scene poetry — not twin scoreboards and not night erasing day.

**Why this priority**: Makes the dual ledger real in memory and review; secondary to the live night experience.

**Independent Test**: Complete day and night work in one cycle, open summary/Grove for that cycle, confirm both worlds appear with distinct framing.

**Acceptance Scenarios**:

1. **Given** day growth and night camp progress in the current cycle, **When** the person views the live garden summary affordance (info / recap that covers garden state), **Then** both Day Garden and Night Camp are represented and clearly differentiated.
2. **Given** the person starts a new day after a cycle with night progress, **When** they view that day in Grove (or equivalent archive), **Then** archived Night Camp state is preserved alongside Day Garden state for that cycle.
3. **Given** a cycle with no night completions, **When** summaries are viewed, **Then** night is absent or shown as a calm empty/resting camp — never guilt copy.

---

### User Story 7 - Soft boundary between day and night (Priority: P3)

Crossing the work-window edge feels gentle (optional soft dusk/dawn crossfade), so the worlds don’t hard-cut in a jarring way — while remaining honest about which ledger is active.

**Why this priority**: Polish; P1 night/day split can ship with a clean edge if needed.

**Independent Test**: Observe the minutes around work end/start; atmosphere transitions calmly (or snaps cleanly if reduced motion).

**Acceptance Scenarios**:

1. **Given** the clock approaches work-window end, **When** night begins, **Then** atmosphere transitions calmly (or instantly under reduced motion) without blocking interaction.
2. **Given** work-window start arrives, **When** day resumes, **Then** Night Camp ornaments rest/fade and Day Garden is again the growth target for new completions.

---

### Edge Cases

- **Work window spanning midnight** (e.g. 10 PM – 6 AM): still supported as a continuous local window; “inside window” = day ledger, outside = night ledger; cycle archive still only on “Start a new day.”
- **Clock skew / sleep / laptop lid**: realm is derived from current local time vs configured window; no punishment copy if the user “missed” a transition.
- **Crossing calendar midnight during night**: ledgers do **not** reset; only “Start a new day” archives both.
- **Completing the day’s Frog at night**: credits **night ledger only** (warm night celebration OK); does not grow the sleeping bonsai.
- **Zero day frogs at night**: Night Camp can still advance from night completions; frog presence is minimal/baseline, not empty of all atmosphere.
- **User changes work hours mid-cycle**: new window applies going forward for wilt/growth/night credit; existing day and night progress already earned this cycle is kept (no punitive wipe).
- **Dev Force night while completing the Frog**: night ledger + night celebration; bonsai still sleeps.
- **Dev Force night + Simulate +1h idle**: no additional wilt while effective realm is night.
- **Dev Force day outside real work hours**: completions still credit Day Garden; simulate idle wilts as day Dev tool.
- **Export / import**: night ledger and work-window preference are part of local user data portability expectations (export includes or degrades gracefully — see Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a persisted **work window** (local start hour and end hour) configurable in Options, defaulting to **8:00 AM – 5:00 PM** local.
- **FR-002**: Work-window controls MUST present times in **AM/PM** form for editing and MUST convert to 24-hour local hours for persistence and logic.
- **FR-003**: System MUST derive “day realm” vs “night realm” from the browser’s local clock relative to the configured work window (no mandatory timezone picker in v1).
- **FR-004**: While in the **day realm**, completions MUST credit the existing Day Garden growth model (bonsai leaves, day frogs) per current day-cycle rules.
- **FR-005**: While in the **night realm**, completions MUST NOT add Day Garden bonsai leaves or day frogs; they MUST credit a **separate Night Camp ledger** for the same day-cycle.
- **FR-006**: Outside the work window, bonsai wilt MUST NOT accumulate from idle time (bonsai is asleep / resting).
- **FR-007**: Inside the work window, wilt MUST continue to use the **configured** work window bounds (replacing any hardcoded-only window for wilt once this feature ships).
- **FR-008**: Night Camp MUST advance through approximately **4–5 discrete visual stages** driven by the night ledger, using fireflies, a growing campfire, stars, and moon as the v1 vocabulary.
- **FR-009**: Night Camp MUST include frogs: day-frog count for the cycle MUST influence how many frogs appear at camp; night progress MUST allow frogs to participate with night trinkets (e.g. fireflies).
- **FR-010**: Night atmosphere MUST use dim/overlay (and ornaments) and MUST NOT force the user’s light/dark Appearance setting.
- **FR-011**: Night realm MUST NOT block, disable, or gate core task/focus/garden actions.
- **FR-012**: Night Camp and Day Garden progress MUST both reset/archive only when the person uses **Start a new day** (same day-cycle as existing archive), including Grove/archive representation of Night Camp when day history is shown.
- **FR-013**: Live and archived summaries that describe garden state MUST present Day Garden and Night Camp as differentiated sibling worlds (scene poetry for night; not a competing scoreboard).
- **FR-014**: All new interactive elements MUST be keyboard-operable and screen-reader labelled; night motion MUST respect `prefers-reduced-motion`; night dim MUST preserve WCAG AA for text and controls.
- **FR-015**: Copy and visuals for night MUST vibe the person up (warm, rewarding) and MUST NOT shame late work or imply they should stop.
- **FR-016**: When Dev tools are enabled, the system MUST provide **Force night**, **Force day**, and **Follow clock** controls on the same Dev surface family as existing simulate-idle / reset / complete-focus tools, overriding realm derivation for testing.
- **FR-017**: A forced realm MUST drive the same atmosphere, growth routing, wilt eligibility, and Night Camp scene behavior as a real clock-derived realm of that type (one `resolveRealm` brain — no divergent “dev-only fake UI”).
- **FR-018**: Forcing a realm MUST NOT change Appearance (light/dark) and MUST NOT block UI.
- **FR-019**: While a realm is forced (and Dev tools are on), the Dev UI MUST show a calm indicator of the active override so testers know why the garden looks/behaves as it does.
- **FR-020**: Realm force MUST NOT affect normal use when Dev tools are off (override ignored; Follow clock). Turning Dev tools back on MAY restore the last stored override.
- **FR-021**: While effective realm is **night** (forced or clock), Dev **Complete focus session** and real completions MUST credit the night ledger only and MUST NOT grow the Day Garden bonsai.
- **FR-022**: While effective realm is **day** (forced or clock), Dev **Complete focus session** and real completions MUST credit the Day Garden as today.
- **FR-023**: While effective realm is **night**, Dev **Simulate +1h idle** MUST NOT produce additional bonsai wilt; while effective realm is **day**, Simulate +1h idle MUST retain today’s day-wilt Dev behavior.
- **FR-024**: Dev **Reset** MUST clear both Day Garden and Night Camp progress for the current cycle (not day-only).

### Key Entities

- **Work Window**: User-configured local start/end for the day realm; default 8 AM–5 PM; drives wilt, bonsai growth eligibility, and night atmosphere/credit.
- **Realm Override (Dev)**: Optional force of `day` | `night` | follow-clock; used only for testing; never a user-facing productivity setting; ignored when Dev tools are off.
- **Effective Realm**: Result of `resolveRealm` (override if Dev on + forced, else clock + work window) — single source of truth for atmosphere, growth routing, and wilt eligibility.
- **Day Garden Ledger**: Existing day-cycle growth events for bonsai leaves and day frogs (asleep for new credit at night).
- **Night Camp Ledger**: Separate day-cycle progress from night-realm completions; drives camp stages and night frog–trinket participation.
- **Night Camp Scene**: Visual stage state (fireflies, campfire, stars, moon, night frogs) derived from Night Camp Ledger (+ day-frog presence).
- **Day Cycle Archive**: Existing “Start a new day” snapshot; MUST include Night Camp summary state alongside Day Garden for Grove/history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person can set work hours in Options in under 30 seconds using AM/PM controls and see the correct realm (day vs night) within one minute of the boundary without changing Appearance mode.
- **SC-002**: In a scripted night-realm session, **100%** of completions credit Night Camp and **0%** add bonsai leaves/day frogs (bonsai sleep verified).
- **SC-003**: In a scripted day-realm session, completions continue to grow the bonsai/frogs as before; wilt still ignores off-window idle.
- **SC-004**: At least **4** distinct Night Camp visual stages are distinguishable by a sighted reviewer without reading numeric counters.
- **SC-005**: With high vs low day-frog counts, a sighted reviewer can tell Night Camp frog presence differs in the expected direction.
- **SC-006**: Primary flows (complete task, run focus, open Options, Start a new day) remain completable during night atmosphere with no blocking interstitial.
- **SC-007**: After Start a new day, Grove (or equivalent) for that archived cycle shows both Day Garden and Night Camp when night progress existed; keyboard/screen-reader review finds labelled, non-shameful night summary content.
- **SC-008**: With `prefers-reduced-motion` on, night stage changes remain perceivable without decorative motion dependence.
- **SC-009**: With Dev tools on, a tester can run Force night → Complete focus session → Simulate +1h idle → Force day → Complete focus session → Simulate +1h idle → Follow clock in under 3 minutes and observe: night credit + no wilt under Force night; day growth + wilt under Force day; Appearance never changes.
- **SC-010**: With Dev tools off, a previously stored Force night setting has **no** effect on atmosphere or ledger routing (Follow clock only).

## Assumptions

- Constitution v2.1.0 Product Model and `docs/product-model.md` are the binding product brief for this feature.
- Night completion **weights** mirror day weights (task / focus / frog) into the night ledger unless planning finds a simpler 1-unit-per-completion model that still yields ~4–5 stages comfortably — either is acceptable if stages feel paced.
- Soft dusk/dawn crossfade is **nice-to-have (P3)**; a clean edge still passes P1 if reduced-motion and calm copy are respected.
- “Summaries” means extending existing garden info / Grove archive surfaces rather than inventing a third dashboard; Standup Summary task bullets remain task-centric and only gain garden/night beats where garden state is already summarized.
- **Dev Force night/day** is the primary way to test Night Camp (parity with Simulate +1h idle). Adjusting work hours remains valid but is not sufficient alone for fast scene iteration.
- When Dev tools are turned **off**, any stored realm override is **ignored** (Follow clock) so normal use cannot accidentally stay stuck in Force night; turning Dev back on may restore the last override for convenience.
- Dev **Reset** clearing both ledgers is intentional for test harness simplicity (same button, fuller wipe).
- Full JSON export/import already covers app state broadly; night ledger + work window MUST persist locally and SHOULD round-trip in existing export formats when those formats are touched — graceful forward-compatible fields if export schema changes are needed. Realm override is Dev-only and need not appear in user-facing export narratives.
- Out of scope for v1: social sharing of Night Camp, forced theme switching, calendar-midnight auto-reset, multi-device sync, soundscape tied to night (tracked separately as living-soundscape issue), postcard export (separate issue).
