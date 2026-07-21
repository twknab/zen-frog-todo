---
description: "Task list for The Grove — Archived-Day History"
---

# Tasks: The Grove — Archived-Day History

**Input**: Design documents from `specs/010-grove-history/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/grove-ui-contract.md, quickstart.md

**Tests**: No automated test tasks — per the constitution, the "done" gate is a clean `tsc --noEmit` + `eslint` plus manual `quickstart.md` verification. (Add unit tests later if desired; not required here.)

**Organization**: Tasks are grouped by user story (US1 → US2 → US3) so each is an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3 (setup, foundational, and polish have no story label)

## Path Conventions

Single Next.js web app: source under `src/` at repo root (`src/components/`, `src/lib/`, `src/app/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm groundwork; no new dependencies are introduced.

- [ ] T001 Confirm no new dependencies are needed (MUI `Collapse`/`Dialog`/`Card`/`IconButton`, Framer Motion, and `BonsaiTree` already exist) and skim the relevant App Router client-component guidance under `node_modules/next/dist/docs/` before writing components (per `AGENTS.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: A shared, pure helper the archived-day scenes depend on.

**⚠️ CRITICAL**: Complete before user-story work begins.

- [ ] T002 Add and export `blossomCountForLeaves(leaves: number): number` in `src/lib/bonsai.ts` (formula `leaves >= 15 ? Math.min(6, leaves - 14) : 0`) and refactor `deriveBonsai` to use it — no behavior change (Decision 2 / data-model.md).

**Checkpoint**: Shared helper available; user stories can begin.

---

## Phase 3: User Story 1 - Look back at past days as a calm grove (Priority: P1) 🎯 MVP

**Goal**: Make the archive visible as a horizontal, newest-first ribbon of small bonsai scenes with dates.

**Independent Test**: With ≥2 archived days, the Grove shows one dated bonsai scene per day, newest-first, visually differentiated, scrolling smoothly (quickstart Scenarios 1–2, minus the toggle).

- [ ] T003 [US1] Create `src/components/Grove.tsx`: a bottom-section themed card titled "The Grove" containing a horizontal, newest-first scrollable ribbon that reads `useArchive()` and renders one `BonsaiTree` per day (small `size`, `stage`+`leaves` from `day.bonsai`, `blossoms` via `blossomCountForLeaves`, `isWilting={false}`), each with a date caption from `archiveEntryLabel(day, sameDateCount)` (compute same-date counts as `ExportMenu` does).
- [ ] T004 [US1] Add calm, non-judgmental empty-state copy in `src/components/Grove.tsx` when `useArchive()` is empty (no error, no shame) (FR-006).
- [ ] T005 [US1] Add accessibility semantics in `src/components/Grove.tsx`: ribbon `role="list"`, each scene `role="listitem"` wrapping a button whose accessible name is `"<date> — <stage description>"` (via `bonsaiStageLabel`), with the inner SVG `aria-hidden` (FR-013).
- [ ] T006 [US1] Mount `<Grove />` in `src/app/page.tsx` after the Standup Summary section, gated by `!isFocus` using the existing `AnimatePresence` secondary-section pattern (FR-012).
- [ ] T007 [US1] Theme + reduced-motion + contrast pass for the ribbon in `src/components/Grove.tsx`: calm scrollbar styling, disable smooth-scroll when `useReducedMotion()` is true, verify WCAG AA in light + dark (FR-014, FR-015).

**Checkpoint**: History is visible and scrollable (always-expanded); MVP demoable.

---

## Phase 4: User Story 2 - Keep the Grove out of the way (Priority: P2)

**Goal**: One-action hide/show, persisted, collapsed by default, so the live bonsai stays center stage.

**Independent Test**: Toggle hides/shows the ribbon; the choice survives reload; default is collapsed on first load (quickstart Scenarios 1, 4).

- [ ] T008 [P] [US2] Add `useGroveVisibility()` in `src/lib/grove.ts` — `usePersistentState<boolean>("frog-garden:grove-visible-v1", false)` returning `[visible, setVisible]` (mirrors `src/lib/sand.ts` pattern) (data-model.md).
- [ ] T009 [US2] In `src/components/Grove.tsx`, wrap the ribbon in MUI `Collapse` controlled by `useGroveVisibility()`, and add a header toggle button with `aria-expanded` and a state-reflecting label ("Show the Grove" / "Hide the Grove"); set `Collapse` `timeout={0}` when `useReducedMotion()` is true (FR-008, FR-014).
- [ ] T010 [US2] In `src/components/Grove.tsx`, ensure the hidden state frees its space (section reflows to header-only, no gap), defaults to collapsed on first load, and restores the persisted state on reload (FR-009, FR-010, FR-011).

**Checkpoint**: US1 + US2 both work; Grove is quiet by default and revealable.

---

## Phase 5: User Story 3 - Peek at what a past day held (Priority: P3)

**Goal**: Selecting a scene opens a calm, read-only recap of that day.

**Independent Test**: Selecting a day shows its date, reflection (omitted when blank), and completed tasks; dismiss returns focus and preserves scroll (quickstart Scenario 3).

- [ ] T011 [P] [US3] Create `src/components/GroveDayDialog.tsx`: a read-only, re-themed MUI `Dialog` with props `{ day: ArchivedDay | null; sameDateCount: number; onClose }`, showing `archiveEntryLabel(day, sameDateCount)` as title, the reflection only when non-empty, and the day's `completedTasks` (title + note when present) with a calm neutral line when there are none; `transitionDuration={0}` under reduced motion (FR-017).
- [ ] T012 [US3] In `src/components/Grove.tsx`, track a `selectedDay` state and open `GroveDayDialog` when a scene is activated; keep the ribbon mounted so horizontal scroll position is preserved, and let MUI `Dialog` return focus to the invoking scene button on close (FR-017).

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T013 [P] Run `quickstart.md` Scenarios 1–8 in the browser (light + dark, reduced motion, keyboard + screen-reader passes) and fix any gaps.
- [ ] T014 [P] Verify no network requests occur for any Grove interaction (DevTools Network tab) (FR-005, SC).
- [ ] T015 Ensure `npx tsc --noEmit` and `npm run lint` are clean; resolve any issues.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002)** → user stories.
- **US1 (T003–T007)**: T003 first (creates `Grove.tsx`); T004/T005/T007 edit the same file so run sequentially after T003; T006 edits `page.tsx` and depends on `Grove.tsx` existing (T003).
- **US2 (T008–T010)**: T008 is independent (`src/lib/grove.ts`, `[P]`); T009/T010 edit `Grove.tsx` (after US1's `Grove.tsx` edits).
- **US3 (T011–T012)**: T011 creates `GroveDayDialog.tsx` (`[P]`, independent file); T012 wires it into `Grove.tsx` (after T011 and after US1's `Grove.tsx`).
- **Polish (T013–T015)**: after the desired stories are complete.

### Story independence

- US1 delivers value alone (always-expanded ribbon). US2 adds the collapse/persistence around it. US3 adds the detail dialog. Each is separately testable.

### Parallel opportunities

- T008 (`src/lib/grove.ts`) and T011 (`src/components/GroveDayDialog.tsx`) are independent new files and can be authored in parallel with each other and alongside US1's non-`Grove.tsx` work.
- Edits to `src/components/Grove.tsx` (T003, T004, T005, T007, T009, T010, T012) touch one file — keep sequential.

---

## Implementation Strategy

### MVP first (US1)

1. T001 → T002 → T003–T007, then **stop and validate** the visible ribbon (quickstart Scenarios 1–2). Demoable MVP.

### Incremental delivery

2. Add US2 (hide/show + persistence) → validate Scenario 4.
3. Add US3 (day detail) → validate Scenario 3.
4. Polish: run full quickstart + `tsc`/`eslint`.

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks.
- Reuse existing helpers (`useArchive`, `archiveEntryLabel`, `bonsaiStageLabel`, `BonsaiTree`) — do not duplicate archive access or tree rendering.
- Commit after each task or logical group.
- No changes to how days are archived; the Grove is read-only over the existing archive plus one boolean preference.
