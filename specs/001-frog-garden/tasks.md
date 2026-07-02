# Tasks: Frog Garden — a calm, gamified TODO app

**Input**: `specs/001-frog-garden/spec.md`, `.specify/memory/constitution.md`

**Status**: This batch covers polish on US2 (Frog Mode), turning US1 (task CRUD) into real functionality, US7's autosave (Close the Day notes), and a reframing of US4 (garden growth) into an interactive "Sand Mode" rake canvas, per direct user request on 2026-07-01.

**Scope note on US4**: The spec's original US4 concept ("press a button to grow plants") is superseded for this pass by an interactive zen rock-garden rake canvas ("Sand Mode"). Plant-growth-on-task-completion may return later as a separate mechanic layered on top of Sand Mode — not removed from the spec, just not the next thing being built.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to the user story in `spec.md` this task advances

---

## Phase 1: Foundational (Shared Infrastructure)

**Purpose**: A local persistence primitive that Task List, Frog designation, and Close-the-Day notes all depend on.

- [x] T001 Create `usePersistentState<T>(key, initialValue)` localStorage-backed hook in `src/lib/storage.ts` (SSR-safe: hydrates after mount, degrades silently if storage is unavailable)

**Checkpoint**: Foundation ready — Phases 2–4 can proceed.

---

## Phase 2: User Story 2 — Frog Mode polish (Priority: P1)

**Goal**: Clean up the Frog card copy and give it a visual identity; make it reflect the *real* designated frog task instead of hardcoded text.

- [x] T002 [US2] Remove the sentence "The rest of today's list stays blurred until this one is done." from the Frog card in `src/app/page.tsx`
- [x] T003 [US2] Add a 🐸 frog icon to the Today's Frog card
- [x] T004 [US2] Frog card renders the actual designated frog task's title, or a calm empty state ("No frog chosen yet") when none is set — depends on T005/T009's shared task state

**Checkpoint**: Frog card is visually distinct and ready to bind to real task data.

---

## Phase 3: User Story 1 — Real task list (Priority: P1)

**Goal**: Tasks become editable, addable, and any task can be designated "the frog," moving it into the Frog card.

- [x] T005 [US1] Add a `Task` type + `useTasks()` hook in `src/lib/tasks.ts` (backed by T001's `usePersistentState`), exposing `tasks`, `frogTaskId`, `addTask(title)`, `updateTaskTitle(id, title)`, `setFrogTaskId(id)`
- [x] T006 [US1] Extract `TaskListCard` component in `src/components/TaskListCard.tsx` with inline-editable task titles (edit in place, no separate edit-mode toggle)
- [x] T007 [US1] Add an "add task" text input + button to `TaskListCard`, appending via `addTask`
- [x] T008 [US2] Add a hoverable 🐸 icon button per task row in `TaskListCard`; clicking calls `setFrogTaskId(task.id)` — the task disappears from the plain list and appears in the Frog card (T004) since both read the same `frogTaskId`
- [x] T009 [US1] Wire `src/app/page.tsx` to hold `useTasks()` as the single source of truth, passing data/callbacks to both the Frog card and `TaskListCard`

**Checkpoint**: Task list is fully real — add, edit, and frog-designate all work and persist across reloads.

---

## Phase 4: User Story 7 — Close the Day autosave (Priority: P3)

**Goal**: A free-text daily reflection that saves itself, no explicit save action required.

- [x] T010 [US7] Add a multiline notes `TextField` to the Close the Day card in `src/app/page.tsx`, backed by `usePersistentState` (T001) so every keystroke persists; add a small "saved automatically" caption (calm, no urgency per constitution Principle I)

**Checkpoint**: Notes survive a page reload with no user-initiated save step.

---

## Phase 5: User Story 4 (reframed) — Sand Mode rake canvas (Priority: P2)

**Goal**: Replace the placeholder "Garden" box with an interactive zen sandbox the user can rake with the pointer.

- [x] T011 [US4] Rename "Garden" → "Sand Mode" (heading + `WavesOutlined` icon) in `src/app/page.tsx`
- [x] T012 [P] [US4] Add `playRake()` to `src/lib/sound.ts` — a short filtered-noise burst (Web Audio), distinct from the Pomodoro chime
- [x] T013 [US4] Build `SandCanvas` component in `src/components/SandCanvas.tsx`: pointer-drag drawing on `<canvas>`, each stroke rendered as a 3-pronged trail (three parallel offset lines, like rake tines), each new stroke gets a random color from the muted zen palette (moss/clay/dusk/ochre/rust), strokes redraw correctly on container resize
- [x] T014 [US4] Call `playRake()` on each stroke start (pointerdown) inside `SandCanvas`
- [x] T015 [US4] Mount `SandCanvas` inside the Sand Mode card

**Checkpoint**: Clicking/dragging in the Sand Mode card draws multicolored 3-pronged trails with a rake sound per stroke.

**Assumption**: Sand trails are ephemeral (not persisted) for this pass — ask if you'd like raked patterns to survive a reload.

---

## Phase 6: Polish

- [x] T016 [P] Type-check (`tsc --noEmit`) and lint (`eslint`) the full diff
- [x] T017 Verify live in the browser preview: edit a task, add a task, designate a frog (confirm it moves into the Frog card), type Close-the-Day notes and confirm they survive a reload, rake the sand and confirm sound + multicolor trails

---

## Phase 7: Revisions (2026-07-01, follow-up)

**Goal**: Address direct feedback after using the Phase 1–6 build.

- [ ] R001 [US1] Drag-and-drop reordering for `TaskListCard` rows (native HTML5 DnD, no new dependency); `useTasks()` gains `reorderTasks(draggedId, targetId)`
- [ ] R002 [US2] Fix the Frog card's empty-state copy — it told users to hover a task while Frog Mode has the list locked/blurred (contradiction); new copy tells them to switch to Flow Mode first
- [ ] R003 [US6] Add an ambient nature-sound loop (synthesized wind/rain via Web Audio, same offline/no-asset approach as the chime and rake sounds), toggleable, playing only during an active focus session
- [ ] R004 [US1] Task completion — add a `completed` boolean to `Task`, a checkbox per row in `TaskListCard` (and on the Frog card, so the frog itself can be marked done), calm styling (strikethrough/dim, no red X)

**Checkpoint**: Tasks can be reordered and checked off, the Frog Mode empty state is no longer self-contradictory, and Focus sessions have an optional ambient soundscape.

---

## Dependencies & Execution Order

- Phase 1 blocks Phases 2–4 (all depend on `usePersistentState`)
- Phase 2 (T002/T003 are copy/icon-only, no dependency) and Phase 3 converge at T004/T009 — the Frog card and Task List share one `useTasks()` state
- Phase 4 is independent of Phases 2–3 (different card, different storage key) — can run in parallel once Phase 1 is done
- Phase 5 is fully independent of Phases 2–4 (different card, no shared state) — can run in parallel once Phase 1 is done (T012 has no dependency at all)
- Phase 6 runs last, after all prior phases
