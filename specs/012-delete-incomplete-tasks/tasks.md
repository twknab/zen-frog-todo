# Tasks: Delete Incomplete Tasks

**Input**: Design documents from `/specs/012-delete-incomplete-tasks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — manual verification via quickstart.md; gates are `tsc` + lint.

**Organization**: Tasks grouped by user story for incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js app: `src/` at repository root

## Phase 1: Setup

**Purpose**: Confirm feature artifacts and wiring targets

- [x] T001 Review plan.md / research.md / contracts/delete-task.md and confirm touch points: `src/lib/tasks.ts`, `src/components/TaskListCard.tsx`, `src/app/page.tsx`

---

## Phase 2: Foundational

**Purpose**: Store API that all UI stories depend on

**⚠️ CRITICAL**: UI stories need `deleteTask` available from `useTasks`

- [x] T002 Add `deleteTask(id: string)` to `useTasks()` in `src/lib/tasks.ts` — no-op for missing or completed tasks; on success filter task from `tasks` and clear `frogTaskId` when it matches; do not mutate `completedLog`
- [x] T003 Export `deleteTask` from the `useTasks()` return object in `src/lib/tasks.ts`

**Checkpoint**: Hook exposes delete with frog-clear and completed no-op behavior

---

## Phase 3: User Story 1 - Remove a task that no longer belongs (Priority: P1) 🎯 MVP

**Goal**: Incomplete rows show trash → calm confirm → permanent remove (or cancel)

**Independent Test**: Add incomplete task, confirm delete → gone after refresh; cancel leaves it

### Implementation for User Story 1

- [x] T004 [US1] Extend `TaskListCard` props in `src/components/TaskListCard.tsx` with `onDeleteTask: (id: string) => void`
- [x] T005 [US1] Add muted `DeleteOutline` IconButton on incomplete rows in `src/components/TaskListCard.tsx` that opens a confirm dialog (do not delete on first click)
- [x] T006 [US1] Implement calm confirm Dialog in `src/components/TaskListCard.tsx` (or small child) mirroring `src/components/NewDayAction.tsx`: title “Remove this task?”, body “It will leave your board. You can always add it again later.”, Cancel / Delete; Escape/Cancel dismiss without calling `onDeleteTask`
- [x] T007 [US1] On Delete confirm, call `onDeleteTask(task.id)` and close dialog in `src/components/TaskListCard.tsx`
- [x] T008 [US1] Wire `deleteTask` from `useTasks()` into `TaskListCard` as `onDeleteTask` in `src/app/page.tsx`

**Checkpoint**: MVP — incomplete tasks can be confirmed-deleted and persist across refresh

---

## Phase 4: User Story 2 - Completed tasks stay non-deletable (Priority: P2)

**Goal**: Completed live rows never expose trash

**Independent Test**: Mixed board — only incomplete rows show trash

### Implementation for User Story 2

- [x] T009 [US2] Guard trash IconButton render with `!task.completed` (and respect `locked`) in `src/components/TaskListCard.tsx`
- [x] T010 [US2] Verify `deleteTask` in `src/lib/tasks.ts` ignores completed ids so UI bugs cannot erase completed work

**Checkpoint**: Completed rows have no delete affordance; store ignores completed deletes

---

## Phase 5: User Story 3 - Deleting today's frog clears the frog (Priority: P3)

**Goal**: Deleting the frog task clears designation quietly

**Independent Test**: Designate frog → delete → frog unset; deleting non-frog leaves frog intact

### Implementation for User Story 3

- [x] T011 [US3] Confirm `deleteTask` clears `frogTaskId` only when deleting the frog id in `src/lib/tasks.ts` (already required by T002 — validate against US3 scenarios)
- [x] T012 [US3] Manually verify via dashboard that frog UI updates after deleting the frog task (no stale designation)

**Checkpoint**: Frog designation never points at a missing task after delete

---

## Phase 6: Polish & cross-cutting

**Purpose**: A11y, calm theme, gates, checklist

- [x] T013 [P] Ensure IconButton `aria-label` is `Delete task: {title}` (fallback `Untitled`) and dialog has `aria-labelledby` / `aria-describedby` in `src/components/TaskListCard.tsx`
- [x] T014 [P] Honor reduced motion with `useReducedMotion()` → `transitionDuration={0}` on Dialog in `src/components/TaskListCard.tsx`
- [x] T015 [P] Keep trash icon muted (`text.secondary` / inherit) — never `color="error"` — in `src/components/TaskListCard.tsx`
- [x] T016 Run `npx tsc --noEmit` and `npm run lint` clean; walk `specs/012-delete-incomplete-tasks/quickstart.md` scenarios
- [x] T017 Mark completed tasks in this file as done as work lands

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 → Phase 2 (`deleteTask`) → Phase 3 (MVP UI) → Phase 4/5 (guards & frog validation) → Phase 6 polish
- US2/US3 largely validate/refine behavior introduced in T002 + US1 UI

### User Story Dependencies

- **US1**: Needs foundational `deleteTask` + page wiring
- **US2**: Depends on US1 trash UI existing; adds completed guard
- **US3**: Depends on store frog-clear from T002; validated after US1 delete path works

### Parallel Opportunities

- T013 / T014 / T015 can be done in parallel once dialog exists
- T009 (UI guard) and T010 (store guard) can be verified in parallel

### MVP Scope

Ship Phase 1–3 (US1) first — that alone delivers delete-with-confirm for incomplete tasks.

## Implementation Strategy

1. Implement `deleteTask` (T002–T003)
2. Build trash + dialog + wire page (T004–T008)
3. Lock completed / frog behaviors (T009–T012)
4. Polish a11y/theme and run gates (T013–T017)

## Implementation notes (post-implement)

- Shared child `src/components/DeleteIncompleteTaskControl.tsx` hosts trash + confirm dialog (used by `TaskListCard` and the frog card on `page.tsx`, since the frog is not in `otherTasks`).
- Icon module: `@mui/icons-material/DeleteOutlined` (package naming).
