# Feature Specification: Frog Garden — a calm, gamified TODO app

**Feature Branch**: `001-frog-garden`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "A calm, Zen/Tao-influenced, gamified TODO app with a Bento-style dashboard, a Frog Mode vs Flow Mode toggle for swallow-the-frog task prioritization, subtle garden-growth gamification, built-in Pomodoro timer, ambient soundscape, reflection ritual, and time-of-day theming"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and complete a task (Priority: P1)

A user opens the app, adds a task, and marks it complete. This is the irreducible core: without it there is no todo app.

**Why this priority**: Nothing else in this spec matters if basic task CRUD doesn't work. It is the MVP slice.

**Independent Test**: Can be fully tested by creating a task, editing it, marking it complete, and deleting it, with state surviving a page reload (persisted locally).

**Acceptance Scenarios**:

1. **Given** an empty task list, **When** the user adds a task with a title, **Then** it appears in the list, unmarked, and persists after a page reload.
2. **Given** an existing task, **When** the user marks it complete, **Then** it visually reflects completion (see US3 for the garden-growth reaction) and remains in the list as completed rather than disappearing.
3. **Given** an existing task, **When** the user edits its title/tag/due date or deletes it, **Then** the change is persisted immediately.

---

### User Story 2 - Frog Mode: swallow the frog first (Priority: P1)

Each day, the user designates (or confirms an app-suggested) "frog" — the single task they most dread. In Frog Mode, the rest of the list stays visually locked/blurred until the frog task is marked done, removing the temptation to cherry-pick easy wins first.

**Why this priority**: This is the app's core differentiator and the reason it exists instead of a generic todo list. It must ship in v1.

**Independent Test**: Can be tested by entering Frog Mode with 3+ tasks, confirming all non-frog tasks are blurred/non-interactive, completing the frog task, and confirming the rest of the list unlocks.

**Acceptance Scenarios**:

1. **Given** a fresh day with no frog yet chosen, **When** the user opens the app in Frog Mode, **Then** they are prompted to pick (or accept a suggested) frog task before the rest of the list is revealed.
2. **Given** a frog task is chosen and incomplete, **When** the user views the dashboard, **Then** all other tasks are visually blurred/locked and not actionable.
3. **Given** the frog task is marked complete, **When** the dashboard re-renders, **Then** the rest of the list unlocks immediately with a calm transition (no jarring reveal).
4. **Given** the user has no tasks dreaded enough to call a "frog" that day, **When** they choose to skip designating one, **Then** the app allows proceeding without one and does not block the list (skipping is a legitimate choice, not a penalized one — see Constitution Principle I).

---

### User Story 3 - Flow Mode: flat, freeform list (Priority: P2)

The user can toggle to Flow Mode: a flat, freely reorderable list with no frog-based locking, for days when strict prioritization isn't wanted.

**Why this priority**: Enticing but secondary to Frog Mode — the app is still useful in Frog Mode alone, but the toggle is core to the "you choose your mode" premise the user asked for.

**Independent Test**: Can be tested by toggling from Frog Mode to Flow Mode and confirming all tasks become visible/interactive regardless of frog status, and that reordering (drag or move up/down) persists.

**Acceptance Scenarios**:

1. **Given** a locked list in Frog Mode, **When** the user toggles to Flow Mode, **Then** all tasks become immediately visible and interactive, independent of frog completion.
2. **Given** Flow Mode is active, **When** the user reorders tasks, **Then** the new order persists across reloads.
3. **Given** the user toggles back to Frog Mode, **When** a frog is already set for the day, **Then** locking resumes based on that frog's completion state (toggling modes does not reset the day's frog choice).

---

### User Story 4 - The garden grows (subtle gamification) (Priority: P2)

Completing tasks (and Pomodoro focus sessions) causes a garden/bonsai visual to grow — new leaves, blossoms — over time. Inactivity causes a gentle wilt, not a punitive reset. A streak count exists but is tucked away, not front-and-center.

**Why this priority**: This is the emotional hook that makes the app "enticing" per the brief, but the app functions as a todo list without it — hence P2, built once P1s are solid.

**Independent Test**: Can be tested by completing several tasks/Pomodoro sessions and observing incremental visual growth state changes, then simulating inactivity (skip a day) and observing a gentle (not jarring/punitive) wilt state, plus checking that streak numbers only appear in an explicit "stats" view.

**Acceptance Scenarios**:

1. **Given** a task is marked complete, **When** the dashboard updates, **Then** the garden visual advances one growth increment with a soft ripple/particle animation (respecting `prefers-reduced-motion`).
2. **Given** the user completes a full Pomodoro focus session, **When** it ends, **Then** the garden receives growth credit equivalent to (or greater than) a single task completion.
3. **Given** the user is inactive for one or more days, **When** they return, **Then** the garden shows a gentle wilt (fewer blossoms, muted color) rather than resetting to empty or displaying guilt-oriented copy.
4. **Given** the user wants to see numeric streak/completion stats, **When** they open the opt-in stats view, **Then** numbers are shown there and nowhere else by default.

---

### User Story 5 - Built-in Pomodoro focus timer (Priority: P2)

The user can start a focus session (Pomodoro-style timer) tied to a specific task, with a short break cycle, and completed sessions contribute to garden growth (US4) and the day's reflection (US6).

**Why this priority**: A concrete, well-understood feature that reinforces "do the task" rather than just "track the task" — pairs naturally with Frog Mode (focus on the frog).

**Independent Test**: Can be tested by starting a focus session on a task, letting it run to completion (or ending it early), and confirming the session is recorded against that task and reflected in garden growth.

**Acceptance Scenarios**:

1. **Given** a task is selected, **When** the user starts a focus session, **Then** a countdown timer runs (default work/break lengths, user-configurable) associated with that task.
2. **Given** a focus session completes naturally, **When** it ends, **Then** the user is prompted to take a break, and the session counts toward garden growth and the day's reflection summary.
3. **Given** a focus session is stopped early, **When** the user confirms stopping, **Then** the partial session does not count as a completed Pomodoro (no growth credit), and no guilt-based messaging is shown.

---

### User Story 6 - Ambient soundscape + haptics (Priority: P3)

While focused on a task (e.g., during a Pomodoro session), the user can optionally play a background nature sound (rain, wind, singing bowl) and receive a soft chime and/or haptic tick on task completion.

**Why this priority**: Enhances the calm feel but is fully optional polish — the app is complete without audio.

**Independent Test**: Can be tested by toggling ambient sound on/off during a focus session and confirming playback starts/stops correctly and is muted by default, and by completing a task and confirming a soft chime/haptic fires only when enabled.

**Acceptance Scenarios**:

1. **Given** ambient sound is off by default, **When** the user opts in from settings, **Then** a looping nature soundscape plays during focus sessions and stops when the session ends or the user disables it.
2. **Given** a task is marked complete, **When** completion-sound is enabled, **Then** a soft, non-jarring chime plays; on supported devices with haptics enabled, a gentle haptic tick also fires.
3. **Given** the user has sound/haptics disabled entirely, **When** any of the above events occur, **Then** no audio or haptic feedback is triggered.

---

### User Story 7 - Reflection ritual (Priority: P3)

At the end of the day, the user can open a "Close the Day" screen: a summary of what was completed, a one-line free-text reflection, and a pre-selected candidate for tomorrow's frog (e.g., the oldest incomplete task, or one the user flags while closing today).

**Why this priority**: Turns the app into a small daily ritual rather than a pure checklist — high alignment with the Zen framing, but not required for the app to be useful day-to-day.

**Independent Test**: Can be tested by completing some tasks, opening the Close the Day screen, confirming the completed-task summary is accurate, entering a reflection line, and confirming a frog candidate is pre-selected for the next day.

**Acceptance Scenarios**:

1. **Given** it is the end of the day (user-initiated, not forced), **When** the user opens "Close the Day," **Then** they see a summary of tasks completed that day.
2. **Given** the Close the Day screen is open, **When** the user types a one-line reflection and confirms, **Then** the reflection is saved and associated with that date.
3. **Given** the Close the Day flow completes, **When** the next day begins, **Then** a frog candidate is pre-selected (editable) rather than requiring the user to start from a blank choice.

---

### User Story 8 - Time-of-day theming (Priority: P3)

The dashboard's background/palette subtly shifts based on the system clock — dawn, day, dusk, night — reinforcing the nature-cycle feel with no user configuration required.

**Why this priority**: Pure ambiance/polish; lowest priority, purely additive.

**Independent Test**: Can be tested by simulating different system times and confirming the theme shifts palette accordingly without affecting contrast/accessibility (Constitution Principle IV) at any time of day.

**Acceptance Scenarios**:

1. **Given** the system clock is in a given time-of-day band (dawn/day/dusk/night), **When** the dashboard renders, **Then** the background/palette reflects that band.
2. **Given** a time-of-day transition occurs while the app is open, **When** the boundary is crossed, **Then** the theme transitions gradually (not an abrupt flash).
3. **Given** any time-of-day theme is active, **When** contrast is checked, **Then** text/interactive elements still meet WCAG AA.

---

### Edge Cases

- What happens when the user has zero tasks at all? (Empty state should be calm/inviting, not "0 tasks" alarm — should prompt adding a first task or a first frog.)
- What happens if the user marks the frog task complete, then un-completes it later? (List should re-lock, consistent with Principle I: no shaming for reopening a task.)
- What happens across a midnight rollover while a Pomodoro session or an open "day" is in progress? (Session should complete normally; the "day" for frog/reflection purposes should have a clear, documented boundary, e.g. local midnight.)
- How does the garden visual behave for a brand-new user with zero history? (Should start at a defined "seed" state, not appear broken/empty.)
- What happens if localStorage/IndexedDB is unavailable or full (e.g., private browsing)? (App should degrade gracefully with a clear, calm notice — not silently lose data.)
- What happens if the user imports a JSON file that doesn't match the expected schema? (Should reject with a clear error, without corrupting existing local data.)
- What happens when `prefers-reduced-motion` is set? (All growth/ripple/theme-transition animations must have a non-animated or minimal-motion equivalent.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create, edit, complete, reopen, and delete tasks (title required; tags and due date optional).
- **FR-002**: System MUST persist all task, garden, streak, reflection, and settings data locally (localStorage/IndexedDB) and survive page reloads.
- **FR-003**: System MUST support exporting all local data to a JSON file and importing it back, validating schema on import.
- **FR-004**: System MUST support two dashboard modes — Frog Mode and Flow Mode — with a single, discoverable toggle to switch between them.
- **FR-005**: In Frog Mode, system MUST require the user to designate one task per day as "the frog" (or explicitly skip) before revealing the rest of the list, and MUST keep non-frog tasks visually blurred/locked and non-interactive until the frog task is completed.
- **FR-006**: In Flow Mode, system MUST present all tasks as a flat, freely reorderable list with no locking behavior.
- **FR-007**: System MUST render the dashboard as a Bento-style grid of variable-sized cards (Today's Frog, Task List, Garden/streak visual, Pomodoro timer, Reflection) that reflows responsively across mobile and desktop.
- **FR-008**: System MUST advance a garden/bonsai visual state on task completion and on completed Pomodoro sessions, and MUST apply a gentle (non-punitive) wilt state after a period of inactivity.
- **FR-009**: System MUST keep numeric stats (streaks, totals) out of the default dashboard view, exposing them only in an explicit, opt-in stats view.
- **FR-010**: System MUST provide a per-task Pomodoro-style focus timer with configurable work/break durations, and MUST distinguish a naturally-completed session (counts toward growth/reflection) from an early-stopped one (does not count).
- **FR-011**: System MUST provide an optional ambient soundscape (looping nature sound) playable during focus sessions, off by default.
- **FR-012**: System MUST provide an optional soft completion chime and, on supporting devices, a haptic tick on task completion, off by default.
- **FR-013**: System MUST provide a daily "Close the Day" reflection screen showing that day's completed tasks, accepting a one-line free-text reflection, and pre-selecting (editably) a frog candidate for the next day.
- **FR-014**: System MUST shift the dashboard's background/palette based on time-of-day (dawn/day/dusk/night) with gradual, non-abrupt transitions.
- **FR-015**: System MUST respect the OS-level `prefers-reduced-motion` setting by disabling or minimizing all decorative animation (garden growth ripple, theme transitions, mode-toggle transitions) while preserving the underlying state changes.
- **FR-016**: System MUST remain fully keyboard-operable and screen-reader labelled for all task, mode-toggle, timer, and reflection interactions.
- **FR-017**: System MUST maintain WCAG AA contrast for text and interactive elements across all time-of-day theme variants.
- **FR-018**: System MUST NOT require account creation, sign-in, or any server-side persistence in v1.

### Key Entities *(include if feature involves data)*

- **Task**: title, optional tags, optional due date, completion state, completion timestamp, created/updated timestamps, associated Pomodoro session count.
- **Day**: a local-calendar-day boundary that owns a designated frog task (or "skipped" state), the day's Frog/Flow mode setting, and its reflection entry.
- **Garden State**: a derived/aggregate growth level (and a "seed" baseline for new users) driven by completed tasks and Pomodoro sessions, decaying gently over inactive days.
- **Focus Session (Pomodoro)**: associated task, start/end time, configured work/break duration, completion status (natural vs. stopped-early).
- **Reflection**: date, one-line free-text note, snapshot of that day's completed tasks, resulting next-day frog candidate.
- **Settings**: mode preference (Frog/Flow), sound/haptics on-off, Pomodoro durations, any explicit telemetry opt-in (default off).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can add their first task and (if they choose) designate a frog within 60 seconds of opening the app, with no required onboarding steps beyond that.
- **SC-002**: In Frog Mode, 100% of non-frog tasks remain locked/non-interactive until the frog task is completed, verified across all supported viewport sizes.
- **SC-003**: All decorative motion (garden growth, ripples, theme transitions) has a verified non-animated fallback when `prefers-reduced-motion` is set, with zero loss of underlying functionality.
- **SC-004**: A user can complete a full day's cycle — add tasks, complete the frog, run at least one Pomodoro session, close the day with a reflection — without the app requiring network access at any point.
- **SC-005**: Core interactions (add task, complete task, toggle mode, start focus session) respond in under 100ms perceived latency on a mid-range device.
- **SC-006**: Exported JSON data can be re-imported into a fresh browser profile and fully reconstructs the task list, garden state, and reflections with no data loss.

## Assumptions

- Target platform for v1 is modern desktop and mobile web browsers (no native app wrapper); "mobile support" means responsive web, not App/Play Store distribution.
- A "day" boundary is the user's local midnight; multi-timezone travel edge cases are out of scope for v1.
- Single browser profile per user is assumed for v1 — there is no cross-device sync; a user who clears site data or switches browsers loses local state unless they've exported it first.
- "Frog" selection is manual or lightly suggested (e.g., oldest/most-overdue task) — v1 does not require any AI/ML-based dread-detection.
- Ambient soundscape audio assets and any haptic APIs used are assumed to be available/licensable for the target platforms; sourcing those assets is a build-time concern, not a spec blocker.
- Material UI is the assumed component library and Framer Motion the assumed animation library per the project constitution; this spec describes behavior, not implementation, but flags where those choices constrain feasibility (e.g., animation must be interruptible for `prefers-reduced-motion`).
