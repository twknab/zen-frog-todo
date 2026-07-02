# Tasks: Focus history, completed-tasks log, and Sand Mode rocks

**Input**: Design documents from `specs/002-focus-log-sand-rocks/` (spec.md, plan.md, research.md, data-model.md, quickstart.md)

**Tests**: Not requested in spec.md; this project has no automated test suite (see plan.md Technical Context). Verification is `tsc`/`eslint` plus the manual scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story per spec.md's priorities (US1–US4), each independently testable per its Independent Test in spec.md.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

Not applicable — this feature extends the existing Next.js app from `specs/001-frog-garden`; no new project scaffolding is needed.

## Phase 2: Foundational (Blocking Prerequisites)

None. All four user stories are independent of one another and build directly on already-existing infrastructure (`usePersistentState`, `SandCanvas`, `TaskListCard`, `FocusTimer`) — no shared blocking work is required before starting any of them.

---

## Phase 3: User Story 1 - Completed tasks can't be re-designated as the frog (Priority: P1)

**Goal**: A completed task is never eligible to become the frog; the currently-designated frog remains completable.

**Independent Test**: Mark a task complete, confirm its 🐸 control is gone/inert; confirm an incomplete task's 🐸 still works; confirm completing the current frog does not remove its frog status.

### Implementation for User Story 1

- [x] T001 [US1] Guard `setFrogTaskId` in `src/lib/tasks.ts` so it no-ops if the target task's `completed` is `true`
- [x] T002 [US1] Hide the 🐸 `IconButton` in `src/components/TaskListCard.tsx` for rows where `task.completed` is `true`

**Checkpoint**: US1 is independently complete and testable.

---

## Phase 4: User Story 2 - A running log of completed tasks, with notes (Priority: P1)

**Goal**: Every task completion is recorded in a persisted, append-only log shown at the bottom of the dashboard, each entry editable with a free-text note.

**Independent Test**: Complete a few tasks, confirm one log entry per completion (most-recent-first), add a note, reload, confirm log + note survive; reopen and re-complete a task, confirm a second entry appears rather than overwriting the first.

### Implementation for User Story 2

- [x] T003 [US2] Add `CompletedLogEntry` type and a persisted log slot to `src/lib/tasks.ts` (new `usePersistentState` key, e.g. `frog-garden:completed-log-v1`); update `toggleTaskCompleted` to append `{ id, taskId, taskTitle, completedAt, note: "" }` when a task transitions incomplete → complete; expose `completedLog` and `updateCompletedNote(id, note)` from `useTasks()`
- [x] T004 [P] [US2] Build `src/components/CompletedLog.tsx`: renders `completedLog` entries most-recent-first (title + relative/formatted completion time), an editable note `TextField` per entry, and a calm empty state when the log is empty
- [x] T005 [US2] Mount `<CompletedLog />` at the bottom of the dashboard in `src/app/page.tsx`, wired to `completedLog` / `updateCompletedNote` from `useTasks()`

**Checkpoint**: US2 is independently complete and testable (depends only on already-existing `useTasks()`, no dependency on US1/US3/US4).

---

## Phase 5: User Story 3 - Track how many focus sessions you've completed (Priority: P2)

**Goal**: A persisted count of naturally-completed focus sessions, shown as a small, secondary element in the Focus card.

**Independent Test**: Complete a session naturally → count +1; cancel one early → count unchanged; reload → count persists.

### Implementation for User Story 3

- [x] T006 [P] [US3] Create `src/lib/focusStats.ts`: `useFocusStats()` hook backed by `usePersistentState` (key e.g. `frog-garden:focus-stats-v1`, shape `{ completedSessions: number }`), exposing `completedSessions` and `recordSessionComplete()`
- [x] T007 [US3] Call `recordSessionComplete()` in `src/components/FocusTimer.tsx` at the existing natural-completion transition (`working` → `work-done`, alongside the existing `playChime("focus-complete")` call) — never on `reset()`/cancel
- [x] T008 [US3] Display `completedSessions` as a small caption-level element in the Focus card (`src/components/FocusTimer.tsx`) — per Constitution Check in plan.md, it must stay visually secondary, not a large headline number

**Checkpoint**: US3 is independently complete and testable.

---

## Phase 6: User Story 4 - Place rocks in the sand that raking can't cross (Priority: P2)

**Goal**: Rocks can be dragged into the Sand Mode canvas; raking never draws inside a placed rock's footprint.

**Independent Test**: Drag a rock in, confirm it stays; rake through it, confirm a gap at the rock with normal drawing on either side; place a second rock and confirm both are respected in one stroke.

### Implementation for User Story 4

- [x] T009 [P] [US4] Add a small rock "tray" (2–3 draggable rock chips, native `draggable` matching the existing pattern in `TaskListCard.tsx`) near the Sand Mode card in `src/app/page.tsx`
- [x] T010 [US4] Extend `src/components/SandCanvas.tsx` to accept a drop on the canvas container: convert the drop's client coordinates to the canvas's local coordinate space and append a `{ id, x, y, radius }` rock to a rocks ref
- [x] T011 [US4] Render placed rocks (filled/stroked rounded shape from the zen palette) on top of the existing stroke rendering in `src/components/SandCanvas.tsx`
- [x] T012 [US4] In the drawing path (`handlePointerMove`/`drawProngs`), skip drawing a segment whose endpoints fall inside any rock's footprint (distance to rock center < rock radius), per `data-model.md`'s validation rule, while still recording the point so the stroke resumes past the rock
- [x] T013 [US4] Include rocks in the existing `redrawAll` pass in `src/components/SandCanvas.tsx` so they survive a container resize

**Checkpoint**: US4 is independently complete and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T014 [P] Type-check (`npx tsc --noEmit`) and lint (`npx eslint src --max-warnings=0`) across the full diff
- [x] T015 Run all four scenarios in `quickstart.md` live in the browser preview

---

## Dependencies & Execution Order

- Phase 1 and Phase 2 are empty for this feature — go straight to the user stories.
- US1 (T001–T002) and US2 (T003–T005) both touch `src/lib/tasks.ts`; logically independent (different functions) but best done as one edit pass if working solo to avoid re-reading the file twice.
- US3 (T006–T008) touches only `focusStats.ts` (new) and `FocusTimer.tsx` — fully independent of US1/US2/US4.
- US4 (T009–T013) touches only `SandCanvas.tsx` and the rock tray in `page.tsx` — fully independent of US1/US2/US3.
- Phase 7 runs last, after all four stories.

## Implementation Strategy

### MVP First

US1 (T001–T002) is the smallest, highest-priority slice — a two-task correctness fix. US2 (the Completed log) is the highest-*value* slice. Recommended order: US1 → US2 → US3 → US4, but any order is valid since the stories don't depend on each other.
