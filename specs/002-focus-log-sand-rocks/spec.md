# Feature Specification: Focus history, completed-tasks log, and Sand Mode rocks

**Feature Branch**: `002-focus-log-sand-rocks`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Focus session history, completed-tasks log with notes, and sand mode rocks that block raking; plus a correctness fix so a completed task can't be designated the frog."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completed tasks can't be re-designated as the frog (Priority: P1)

A task that has already been marked complete should never be selectable as "the frog." Choosing a frog is about deciding what to tackle next — a finished task has nothing left to swallow.

**Why this priority**: Small in scope, but a correctness gap in existing Frog Mode behavior that produces a confusing state (a "frog" that's already done) if left unfixed.

**Independent Test**: Mark a task complete, then attempt to designate it as the frog — the action should have no effect (control absent or clearly inert), and a different, incomplete task can still be chosen normally.

**Acceptance Scenarios**:

1. **Given** a completed task in the list, **When** the user looks for the frog-designation control on that row, **Then** it is not available (or visibly disabled) for that task.
2. **Given** an incomplete task, **When** the user designates it as the frog, **Then** it moves into the Frog card as before — unaffected by this change.
3. **Given** the current frog task, **When** the user marks it complete, **Then** it remains the frog and shows as completed in the Frog card — completing the frog is the point, and is not blocked by this rule.

---

### User Story 2 - A running log of completed tasks, with notes (Priority: P1)

Beneath the daily dashboard, the user can see every task they've ever completed, in one place, and can jot a short note against any of them — separate from the single daily "Close the Day" reflection.

**Why this priority**: This is the feature with the most lasting value — a simple personal record of what's been accomplished over time, which nothing in the app currently provides.

**Independent Test**: Complete two or three tasks on different occasions, confirm each appears in the Completed log with its completion time, add a note to one, reload the page, and confirm the log and the note are both still there.

**Acceptance Scenarios**:

1. **Given** a task is marked complete, **When** the dashboard updates, **Then** a new entry for it appears in the Completed log (task title, completion time).
2. **Given** an entry in the Completed log, **When** the user types a note against it, **Then** the note is saved and remains after a page reload.
3. **Given** a task is reopened (un-completed) and completed again later, **When** the Completed log is viewed, **Then** the earlier entry is still present (history is never silently deleted) and a new entry is added for the new completion.
4. **Given** no tasks have ever been completed, **When** the user views the Completed log, **Then** it shows a calm empty state rather than looking broken.

---

### User Story 3 - Track how many focus sessions you've completed (Priority: P2)

The app remembers how many Pomodoro-style focus sessions the user has completed in total, and shows that count near the timer.

**Why this priority**: A nice piece of positive-reinforcement context for the Focus card, but the timer is fully usable without it.

**Independent Test**: Complete a focus session naturally and confirm the count increases by one; start and cancel a session early and confirm the count does not change; reload and confirm the count persists.

**Acceptance Scenarios**:

1. **Given** a focus session completes naturally, **When** the dashboard updates, **Then** the focus-session count increases by exactly one.
2. **Given** a focus session is cancelled before completion, **When** the dashboard updates, **Then** the count is unchanged.
3. **Given** the user reloads the page, **When** the Focus card renders, **Then** the previously accumulated count is still shown.

---

### User Story 4 - Place rocks in the sand that raking can't cross (Priority: P2)

In Sand Mode, the user can drag rocks into the sandbox. Once placed, dragging the rake through a rock's spot doesn't draw through it — the rock stays a clean, untouched obstacle.

**Why this priority**: A playful, self-contained addition to an already-shipped feature; enhances Sand Mode without being required for it to function.

**Independent Test**: Drag a rock into the sandbox, then rake a stroke that passes directly over the rock's location, and confirm the drawn trail has a gap at the rock rather than passing through it, while the rest of the stroke draws normally.

**Acceptance Scenarios**:

1. **Given** the Sand Mode card, **When** the user drags a rock from its source into the canvas, **Then** the rock appears at the drop location and stays there.
2. **Given** a rock is placed, **When** the user rakes a stroke that crosses the rock's area, **Then** no rake line is drawn inside the rock's footprint, while the stroke continues normally on either side of it.
3. **Given** multiple rocks are placed, **When** the user rakes across several of them in one stroke, **Then** every rock's footprint is respected.
4. **Given** a rock is placed on top of existing rake trails, **When** the canvas re-renders, **Then** the existing trails are unaffected (the rock simply sits above them) — only future raking is blocked at that spot.

---

### Edge Cases

- Reopening a completed task does not remove its prior Completed-log entry or note — history is additive, not overwritten.
- Re-completing a reopened task adds a new Completed-log entry rather than merging with the old one, since the log is a timeline, not a per-task single record.
- "Not drawing over a rock" is satisfied by skipping the rake line inside the rock's footprint; the rake does not need to intelligently path around the rock's edges, just avoid drawing on top of it.
- The focus-session count and Completed log are local-only for this pass, consistent with the rest of the app; no export/import format changes are in scope here.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT allow a task that is already marked completed to be designated as the frog; the frog-designation control MUST be unavailable or inert for completed tasks.
- **FR-002**: System MUST continue to allow the current frog task to be marked completed without losing its frog designation.
- **FR-003**: System MUST maintain a persisted, running count of focus sessions completed naturally (not early-cancelled), and display it in the Focus card.
- **FR-004**: System MUST maintain a "Completed" log, shown at the bottom of the dashboard, containing one entry per task-completion event (title and completion time), ordered most-recent-first.
- **FR-005**: System MUST let the user add or edit a free-text note on any Completed-log entry, and persist it.
- **FR-006**: System MUST show a calm, non-broken-looking empty state in the Completed log when nothing has been completed yet.
- **FR-007**: System MUST let the user drag a rock into the Sand Mode canvas and drop it at the pointer location, where it remains as a static obstacle.
- **FR-008**: System MUST prevent rake strokes from rendering inside a placed rock's footprint, while continuing to render the rest of the stroke normally.
- **FR-009**: System MUST support multiple rocks placed simultaneously, each independently blocking raking within its own footprint.

### Key Entities *(include if feature involves data)*

- **Focus Session Count**: a single persisted integer, incremented once per naturally-completed focus session.
- **Completed Log Entry**: references a task's title at the time of completion, a completion timestamp, and an optional free-text note; one entry per completion event (not per task).
- **Rock**: a position within the Sand Mode canvas and a footprint (area) that raking must not draw within; placed by drag-and-drop, static once placed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can see their total completed-focus-session count without leaving the main dashboard.
- **SC-002**: 100% of task completions produce a corresponding Completed-log entry with no extra steps beyond checking the task off.
- **SC-003**: A note added to a Completed-log entry is still present after a full page reload.
- **SC-004**: Raking across a placed rock never draws inside the rock's footprint, verified across multiple stroke directions and speeds.
- **SC-005**: Attempting to designate a completed task as the frog has zero effect on the day's frog designation, in 100% of attempts.

## Assumptions

- The Completed log and focus-session count are local-only (localStorage) for this pass, matching the rest of the app's local-first approach — no changes to data export/import are required now.
- Rocks are placed once and are not repositioned or removed after dropping, for this pass — revisit if the user wants to move or clear rocks later.
- "Blocking raking" means the rake line is simply not drawn inside a rock's footprint; true path-finding around rocks is not required.
- The Completed log is distinct from the existing daily "Close the Day" reflection (spec `001-frog-garden`, User Story 7) — the two are not merged.
