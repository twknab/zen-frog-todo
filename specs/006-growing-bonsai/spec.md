# Feature Specification: The Growing Bonsai

**Feature Branch**: `006-growing-bonsai`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "A single bonsai tree, on its own Flow Mode card alongside Sand Mode, that grows toward a mature state as the user completes tasks and focus sessions, and gently wilts (regrowably) on inactivity — the calm, non-scoreboard growth reward from the original Frog Garden vision."

## Clarifications

### Session 2026-07-02

- Q: How should "~3 hours idle" wilt behave (given overnight/weekend punishment risk)? → A: Active-hours shed — shed a small increment per ~3h of idle time, but only during a fixed daytime active window (default 08:00–17:00 local); wilt pauses outside that window so overnight and off-hours never wilt. Intent: a productive day yields a healthy plant.
- Q: How far can wilt go (floor + per-day cap)? → A: Floor at "sapling" (never below — always a living tree, never bare), with NO per-day cap: a long fully-idle active day may shed several increments at once. All shedding remains fully regrowable. (Noted as intentionally on the firm side; may be softened later.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The bonsai grows as I do my work (Priority: P1)

As the user completes tasks and focus sessions over time, a single bonsai tree on the dashboard visibly advances through growth stages — from a bare seedling toward a full, leafy, flowering tree — giving their accumulated effort a calm, living payoff with no score or number attached.

**Why this priority**: This is the feature's entire reason to exist and the long-missing emotional hook from the original vision. Without growth-on-progress, there is no feature.

**Independent Test**: Starting from little/no history, complete several tasks and a focus session, and confirm the bonsai advances to a visibly fuller stage; confirm the stage reflects accumulated work and persists across a page reload.

**Acceptance Scenarios**:

1. **Given** a new user with no completed work, **When** the bonsai card first renders, **Then** it shows the earliest stage (a bare seedling) in a calm, intentional-looking way (not a broken/empty state).
2. **Given** the user marks a task complete, **When** the bonsai re-renders, **Then** it reflects a small amount of additional growth (a new leaf/sprout) with a soft, organic transition.
3. **Given** the user completes a focus session naturally, **When** the bonsai re-renders, **Then** it reflects a slightly larger growth increment than a single task (a blossom).
4. **Given** the user reloads the page, **When** the bonsai card renders, **Then** it shows the same growth stage as before the reload (state is derived from persisted history, not lost).

---

### User Story 2 - The tree reaches a restful, mature state (Priority: P2)

After enough accumulated work, the bonsai reaches a full-grown, lush mature state and rests there — it does not keep visibly climbing forever, so the reward is a journey with a destination rather than an ever-rising hidden score.

**Why this priority**: This is what keeps the mechanic on the right side of the constitution (Principle II — not a scoreboard). Important, but the core grow-with-work loop (US1) is demonstrable without the cap being reached.

**Independent Test**: Simulate a large amount of completed work and confirm the bonsai reaches and then holds the mature stage without further visible escalation, and without exposing any count.

**Acceptance Scenarios**:

1. **Given** the user has accumulated enough completed work to reach maturity, **When** the bonsai renders, **Then** it shows the full mature tree and does not advance further no matter how much additional work is completed.
2. **Given** the tree is mature, **When** the user views it, **Then** no numeric total, level, or count is shown — the visual is the only reward.

---

### User Story 3 - Gentle wilt on rest, fully regrowable (Priority: P2)

After a stretch of no completed work, the bonsai gently sheds a small amount (a leaf or two, slightly muted color) to reflect rest — never a reset, never alarm — and any shed growth is fully regained by resuming work.

**Why this priority**: Completes the "living" feel and closes the loop, but the app is valuable and shippable with growth-only (US1) even before wilt exists. It also carries the most constitutional risk (loss-aversion), so it warrants careful, isolated treatment.

**Independent Test**: Reach a mid growth stage, simulate an idle period past the wilt threshold, and confirm the tree shows a small, calm reduction (not a reset), with no alarming color/copy; then complete work and confirm it regrows.

**Acceptance Scenarios**:

1. **Given** a bonsai at a mid or higher stage, **When** the user has completed no work for longer than the idle threshold, **Then** the tree shows a small, gentle reduction (a leaf or two shed, softly muted) — never a drop to bare, never an abrupt reset.
2. **Given** the tree has wilted slightly, **When** the user completes a task or focus session, **Then** the shed growth is regained (the tree returns toward its prior stage).
3. **Given** any wilt state, **When** the user views the card, **Then** there is no red/alarm styling, no "you lost progress" or "you're slipping" language, and no countdown warning that wilt is approaching.

---

### Edge Cases

- Brand-new user, zero history: earliest seedling stage renders as a calm, deliberate state — never looks broken or error-like.
- Reopening a completed task then re-completing it: growth follows completion *events* (the append-only completed log), consistent with how that log already records history — it does not double-count in a way that feels arbitrary, and never *removes* growth when a task is reopened.
- `prefers-reduced-motion` set: growth and wilt still change the tree's stage, but via instant/minimal state changes rather than animated transitions — no functionality or state is lost.
- Clock oddities (timezone travel, clock skew) affecting idle-day calculation: wilt must degrade gracefully — a miscalculated idle period must never cause a dramatic drop or reset, only at most the same small, gentle, regrowable shed.
- Screen-reader user: the tree's current stage is available as text (e.g. "Your bonsai is flowering"), so the reward is perceivable without seeing the visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a single bonsai tree as its own card in the dashboard, alongside (not replacing) Sand Mode in Flow Mode. *(Revised 2026-07-02: the bonsai now also appears in Focus Mode, positioned front-and-center between the frog and the timer, so the reward stays visible while focusing.)*
- **FR-002**: The bonsai's growth stage MUST be derived from the user's accumulated completed tasks and naturally-completed focus sessions, reusing the app's existing completed-tasks and focus-session history rather than introducing a parallel counter.
- **FR-003**: A completed focus session MUST contribute a larger growth increment than a single completed task.
- **FR-004**: The bonsai MUST advance through a small ordered set of visually distinct stages (at least: seedling → sapling → leafy → flowering → mature).
- **FR-005**: Growth MUST be bounded — upon reaching the mature stage the bonsai MUST hold there and MUST NOT advance further regardless of additional completed work.
- **FR-006**: The system MUST NOT display any numeric count, level, score, or streak for the bonsai; the visual stage is the only feedback.
- **FR-007**: The bonsai MUST shed one growth increment (a softly-muted leaf or two) per ~3 hours of accumulated idle time, where idle time accrues ONLY during a fixed daytime active window (default 08:00–17:00 local); no wilt may occur outside that window (overnight/off-hours never wilt). Over a long fully-idle active day the tree MAY shed several increments in sequence (see FR-008a) — but each shed is individually gentle and softly-muted, and wilt MUST NEVER drop the tree to bare (the sapling floor of FR-008a always applies).
- **FR-008**: Any growth reduced by wilt MUST be fully regainable by resuming completed work.
- **FR-008a**: Wilt MUST NEVER take the bonsai below the "sapling" stage — the tree is always visibly alive, never bare. There is NO per-day cap on shedding: a long, fully-idle active-window day MAY shed several increments (down to the sapling floor). This is intentionally on the firm side and may be softened in a later revision.
- **FR-009**: Wilt presentation MUST be non-punitive: no alarm/red styling, no guilt or loss-framed copy, and no warning/countdown of impending wilt (constitution Principle I & II).
- **FR-010**: The bonsai's current stage MUST be conveyed to assistive technology as text, not by visual/color alone.
- **FR-011**: All growth and wilt transitions MUST honor `prefers-reduced-motion`, falling back to instant/minimal changes with no loss of the underlying growth state.
- **FR-012**: The bonsai's state MUST persist locally (survive reload) and MUST NOT require any network/backend.

### Key Entities *(include if feature involves data)*

- **Bonsai growth state**: a derived growth level mapped to a discrete stage, computed from completed-task events + completed-focus-session count, minus any idle wilt; plus whatever minimal persisted marker is needed to compute idle-based wilt (e.g. the timestamp of most recent growth-affecting activity). Bounded at the mature stage.
- **Growth-affecting activity**: the existing completion events (tasks) and focus-session completions already recorded by the app; this feature reads them, it does not redefine them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From an empty history, completing work moves the bonsai from the seedling stage to a visibly fuller stage within a small number of completions (a first-session user sees it react to their very first completed item).
- **SC-002**: Once mature, 100% of additional completions produce no further visible escalation and expose no count.
- **SC-003**: In 100% of wilt occurrences the bonsai stays at or above the sapling stage (never bare), and any shed growth is fully recovered after resuming work. Wilt only ever accrues during the active window (08:00–17:00 local); a check performed after only overnight/off-hours idle shows no wilt.
- **SC-004**: No wilt or growth state ever surfaces alarm styling or loss/guilt/urgency language — verifiable by inspecting every state of the card.
- **SC-005**: The bonsai's stage is announced to a screen reader as text in every stage.
- **SC-006**: With `prefers-reduced-motion` enabled, the bonsai reaches the correct stage on every growth/wilt change with no animation and no lost state.
- **SC-007**: Bonsai state is identical before and after a page reload for the same history.

## Assumptions

- **Idle-wilt threshold** (resolved in Clarifications 2026-07-02): shed a small increment per ~3h of idle time, counted only within a fixed daytime active window (default 08:00–17:00 local); no wilt overnight/off-hours. Floor at the sapling stage; no per-day shed cap. The active-window bounds (08:00–17:00) are the assumed default and are the most likely knob to tune when softening later.
- **Maturity calibration**: assumed that reaching the mature stage takes a satisfying-but-attainable amount of accumulated work (calibrated so a regular user reaches lushness over days/weeks, not in one sitting and not never). Exact numbers are an implementation-tuning detail, not a spec commitment.
- **Growth is monotonic per completion**: completing work only ever grows or holds the tree; reopening a task never *removes* a leaf (only idle time can, gently).
- Local-only persistence, consistent with the rest of the app; no export/import changes are in scope here.
- This feature is additive to the existing dashboard; it does not modify Sand Mode, the task list, the timer, the completed log, or the reflection.

## Out of Scope

- Any change to Sand Mode, the task list, the Pomodoro timer, the completed log, or the reflection.
- Multiple trees / a garden bed of plants (this is deliberately a single bonsai).
- JSON export/import of bonsai state.
- Any cross-device sync, social, or comparison/leaderboard element.
