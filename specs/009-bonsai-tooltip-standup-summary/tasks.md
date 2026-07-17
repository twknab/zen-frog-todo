# Tasks: Bonsai Info Tooltip & Standup Summary

**Input**: Design documents from `/specs/009-bonsai-tooltip-standup-summary/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/standup-summary-contract.md, quickstart.md

**Tests**: Not included — this project has no automated test suite (established convention, see plan.md's Testing field). The release gate is `tsc --noEmit` + `eslint --max-warnings=0` plus manual verification against `quickstart.md`.

**Organization**: Tasks are grouped by user story so each can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to spec.md's US1 (Bonsai tooltip) or US2 (Standup Summary)
- File paths are exact and relative to the repository root

## Phase 1: Setup

- [X] T001 Confirm the baseline is clean before starting: run `npx tsc --noEmit` and `npx eslint --max-warnings=0` at the repo root. No files are changed by this task — it's a checkpoint so any pre-existing failures aren't misattributed to this feature.

---

## Phase 2: Foundational

**None required.** Both user stories build directly on infrastructure that already exists (`useTasks()`, the re-themed MUI `Tooltip`, the `Card`/`Stack`/icon-plus-`h2` section-header pattern) — there is no new shared infrastructure to stand up first. Proceed straight to the user story phases.

---

## Phase 3: User Story 1 - Read the bonsai's meaning without it crowding the artwork (Priority: P1) 🎯 MVP

**Goal**: Replace the static caption under the bonsai tree with an info icon next to the "Bonsai" heading that reveals the same text in an accessible, re-themed tooltip.

**Independent Test**: Load the dashboard, confirm no caption text appears under the bonsai by default, engage the info icon via mouse/keyboard/touch, and confirm the tooltip shows the explanatory text and dismisses correctly.

### Implementation for User Story 1

- [X] T002 [US1] In `src/app/page.tsx`, add an info `IconButton` (e.g. `InfoOutlined` from `@mui/icons-material`) wrapped in MUI `Tooltip` to the Bonsai section's header `Stack` (~lines 320-325, next to the existing `SpaOutlinedIcon` + "Bonsai" `Typography`), mirroring the `Tooltip`+`IconButton` pattern already used at `page.tsx:162`. The tooltip's `title` is "Grows as you finish tasks and focus sessions." The `IconButton` has an explicit `aria-label` (e.g. "About the bonsai") so its purpose is announced independent of the tooltip. **Unlike** the mirrored pattern at `page.tsx:162` (which does not handle motion preference), explicitly pass `slotProps={{ transition: { timeout: reduceMotion ? 0 : undefined } }}` to this `Tooltip` (this MUI fork moved `transitionDuration` into the `slots`/`slotProps` pattern, with the Grow transition's duration prop named `timeout` — confirmed against the installed `@mui/material/Tooltip` and `Grow` type declarations), reusing the `reduceMotion` value already computed via `useReducedMotion()` at `page.tsx:78` — required for FR-006; confirmed by inspection that the existing `page.tsx:162`/`page.tsx:257` Tooltips do NOT do this and must not be copied as-is in this respect. [DONE — implemented in T002.]
- [X] T003 [US1] In `src/app/page.tsx`, remove the static caption `Typography` under `BonsaiTree` (currently reading "Grows as you finish tasks and focus sessions.", lines 335-337) now that its text lives in the tooltip added in T002.
- [X] T004 [US1] Manually verify User Story 1 against `quickstart.md`'s Scenario 1: mouse hover, keyboard focus + Escape dismissal, screen reader announcement, `prefers-reduced-motion` (no distracting entrance animation), and touch tap/dismiss-elsewhere, in the running dev server (`npm run dev`).

**Checkpoint**: User Story 1 is fully functional and independently testable/shippable at this point.

---

## Phase 4: User Story 2 - Get a ready-made recap of the current batch of work (Priority: P2)

**Goal**: A "Standup Summary" section at the bottom of the page that auto-generates, on-device, a "What I did" list (completed tasks + notes, oldest-first) and a "What's next" list (open tasks, title only), regenerating automatically whenever a task is completed.

**Independent Test**: Complete a task with a note while another task remains open; confirm the Standup Summary section shows the completed task under "What I did" and the open task under "What's next," and that completing the remaining task updates both lists without a manual refresh.

### Implementation for User Story 2

- [X] T005 [US2] Create `src/components/StandupSummary.tsx` exporting a `StandupSummary` component with props `{ tasks: Task[]; completedLog: CompletedLogEntry[] }` (types imported from `@/lib/tasks`) and its two pure derivations, per `contracts/standup-summary-contract.md` and `data-model.md`:
  - "done" items: `completedLog` sorted ascending by `completedAt` (oldest first); each item's `note` is `.trim()`-checked — blank/whitespace-only becomes `null` (title-only), never an empty note line, never omitted.
  - "open" items: `tasks.filter(t => !t.completed)`, preserving the array's existing order, title only.
- [X] T006 [US2] In `src/components/StandupSummary.tsx`, implement the render: "What I did" and "What's next" as `h3` sub-headings (each only rendered when its list is non-empty) with real list markup (`<ul>`/`<li>` or MUI `List`/`ListItem`) per FR-013; when both derivations are empty, render a single calm, non-shaming placeholder line instead (FR-012) — no "you haven't done anything" language, consistent with the empty-state copy already used in `CompletedLog.tsx`.
- [X] T007 [US2] In `src/app/page.tsx`, render `<StandupSummary tasks={tasks} completedLog={completedLog} />` as a sibling `Card` immediately after the existing "Completed" `Card` (~lines 398-420), inside its own `AnimatePresence`/`motion.div` using the identical fade pattern and `!isFocus` visibility condition, with its own header `Stack` (checklist-style icon, e.g. `ChecklistOutlined` — fall back to `AssignmentTurnedInOutlined` if unavailable — plus `Typography variant="h6" component="h2"` reading "Standup Summary"), matching every other section's established header pattern (per research.md Decision 5/6).
- [X] T008 [US2] Manually verify User Story 2 against `quickstart.md`'s Scenarios 2 and 3: populated summary (done + open lists, ordering, blank-note handling, auto-update on completion, Focus-mode visibility, screen-reader structure) and empty states (both empty, done-only, open-only), in the running dev server.

**Checkpoint**: User Stories 1 AND 2 both work independently at this point.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T009 Run `npx tsc --noEmit` and `npx eslint --max-warnings=0` at the repo root across the full diff (both stories) and fix any reported issues.
- [X] T010 Check both new UI additions against the constitution's Calm Technology (I), Accessibility (IV), and Design System Discipline (V) principles per `AGENTS.md`'s requirement that any visual-design-touching change be checked before being marked done — confirm no stock/unstyled MUI look, WCAG AA contrast, and no shame/urgency copy anywhere (including the Standup Summary empty state).
- [X] T011 Run the full `quickstart.md` end-to-end (all three scenarios) once more in the browser preview as the final "Done" gate.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first.
- **Foundational (Phase 2)**: None — no blocking prerequisites for this feature.
- **User Story 1 (Phase 3)**: Depends on Setup only. No dependency on User Story 2.
- **User Story 2 (Phase 4)**: Depends on Setup only. No dependency on User Story 1.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)** and **User Story 2 (P2)** are fully independent — they touch non-overlapping concerns (US1: the Bonsai header/tooltip; US2: a new component + a separate section of `page.tsx`) and can be implemented, tested, and shipped in either order or in parallel by different people.

### Within Each User Story

- **US1**: T002 → T003 (both edit the same region of `src/app/page.tsx`, so sequential) → T004 (manual verification).
- **US2**: T005 → T006 (same file, sequential) → T007 (depends on the component existing) → T008 (manual verification).

### Parallel Opportunities

- T002/T003 (US1) and T005/T006 (US2) touch entirely different files (`page.tsx`'s Bonsai section vs. the new `StandupSummary.tsx`) — a second contributor could work Phase 4 while Phase 3 is in progress. Note: T007 also edits `page.tsx`, in a different region (~line 398+) than T002/T003 (~line 320+); if run concurrently by two people, coordinate to avoid an unnecessary merge conflict in the same file.
- T009-T011 (Polish) should run only after both stories are complete.

---

## Parallel Example: Two contributors

```bash
# Contributor A — User Story 1:
Task: "Add info IconButton + Tooltip to the Bonsai header in src/app/page.tsx (T002)"
Task: "Remove the static caption under BonsaiTree in src/app/page.tsx (T003)"

# Contributor B — User Story 2 (different files until T007):
Task: "Create StandupSummary.tsx with done/open derivations (T005)"
Task: "Implement StandupSummary.tsx render + empty state (T006)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 3: User Story 1 (T002-T004).
3. **STOP and VALIDATE**: confirm Scenario 1 in `quickstart.md` passes.
4. Ship — this alone resolves the "bonsai text is visually distracting" complaint.

### Incremental Delivery

1. Setup → done.
2. Add User Story 1 → validate independently → ship (MVP).
3. Add User Story 2 → validate independently → ship.
4. Polish (T009-T011) once both are in.

---

## Notes

- No test tasks are included per this project's established no-automated-suite convention; `T004`/`T008`/`T011` are the manual-verification equivalents, tied to `quickstart.md`.
- Both stories are genuinely independent — there is no cross-story integration task, matching plan.md's assessment of no shared new infrastructure.
- Commit after each task or logical group (e.g., after T003 for US1, after T006 for the US2 component, after T007 for its wiring).
