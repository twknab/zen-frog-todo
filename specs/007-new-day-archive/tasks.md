---
description: "Task list for Start a New Day — Day Archive & JSON Export"
---

# Tasks: Start a New Day — Day Archive & JSON Export

**Input**: Design documents from `/specs/007-new-day-archive/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not generated. This project's "done" gate is `tsc --noEmit` + `eslint --max-warnings=0` clean plus manual browser verification against `quickstart.md` (constitution — Verification). No automated suite requested.

**Organization**: Tasks grouped by user story (P1 → P2 → P3) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (Setup, Foundational, Polish carry no story label)

## Path Conventions

Single Next.js web app; source at `src/` (repo root). Paths below are exact.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce the feature's module with its stable types and constants (the serialization-friendly shapes the whole feature and the future DB migration depend on).

- [x] T001 [P] Create `src/lib/dayArchive.ts` with `"use client"`, constants (`ARCHIVE_KEY = "frog-garden:day-archive-v1"`, `MAX_ARCHIVED_DAYS = 365`, `SCHEMA_VERSION = 1`) and exported types (`ArchivedTask`, `ArchivedDay`, `SingleDayExport`, `FullExport`) exactly per `data-model.md` / `contracts/export-format.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The archive persistence boundary and the corrected bonsai growth model — core pieces the user stories build on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Implement the archive repository in `src/lib/dayArchive.ts`: `readArchive()` (total — returns `[]` on absent/malformed storage, never throws), `appendArchivedDay(day)` (prepend newest-first, prune oldest beyond `MAX_ARCHIVED_DAYS`, persist), and `useArchive()` (reactive read via `usePersistentState(ARCHIVE_KEY, [])`). No network. Matches `contracts/archive-repository.md`.
- [x] T003 Change bonsai growth scoping in `src/lib/bonsai.ts` (FR-006b / research Decision 11): make `deriveBonsai` sum **all stored events** (growth since the last close) instead of filtering to the current calendar day; leave wilt (`activeIdleHours` + offset, business hours) unchanged; switch `recordGrowth` event pruning from age-based (2-day) to a generous count cap so growth isn't silently dropped when a person goes days without closing. `resetBonsai()` remains the sole reset (called by `startNewDay()`).

**Checkpoint**: Archive read/write goes through one module and the bonsai grows per close-cycle — stories can begin.

---

## Phase 3: User Story 1 - Close today and begin a fresh day (Priority: P1) 🎯 MVP

**Goal**: A confirmed "Start a new day" action that snapshots the day into the archive (skipping empty days) and resets the live board — unfinished tasks carry over (minus frog badge), completed tasks + reflection + bonsai + focus count reset.

**Independent Test**: With completed tasks, an unfinished task, a reflection, and a grown bonsai, trigger "Start a new day" → confirm; verify a new `ArchivedDay` exists (via the export menu once US2 lands, or `localStorage['frog-garden:day-archive-v1']`) holding the cleared content, the unfinished task remains, the bonsai is a shrub, and focus shows 0.

- [x] T004 [P] [US1] Add `resetSessions()` to `src/lib/focusStats.ts` (sets `completedSessions` to 0), making the Focus card's count today-only per the 2026-07-15 clarification.
- [x] T005 [P] [US1] Add a new-day reset to `src/lib/tasks.ts`: a method that drops `completed` tasks, keeps unfinished ones, and sets `frogTaskId = null`; and clears the completed-log (`setCompletedLog([])`). Expose from `useTasks`.
- [x] T006 [US1] Implement the snapshot builder + `useNewDay()` orchestration in `src/lib/dayArchive.ts`: compose `useTasks`, `useBonsai`, `useFocusStats`, and a same-key `usePersistentState("frog-garden:reflection-v1", "")`; build an `ArchivedDay` from the completed-log (→ `completedTasks`), reflection, `completedSessions`, and `deriveBonsai(...)` (`leaves` + `stage`, now close-cycle-scoped); apply the empty-day guard (`hasContent`); `startNewDay()` appends only if `hasContent`, then resets in order (tasks → completed-log → reflection → `resetBonsai()` → `resetSessions()`). Depends on T002, T003, T004, T005.
- [x] T007 [US1] Create `src/components/NewDayAction.tsx`: a "Start a new day" button plus a re-themed MUI `Dialog` confirmation (calm copy — e.g. title "Start a new day?", actions "Not yet" / "Start fresh"), keyboard-operable and screen-reader labelled, reduced-motion friendly; calls `startNewDay()` on confirm. Depends on T006.
- [x] T008 [US1] Wire `NewDayAction` into the existing "Close the day" reflection card in `src/app/page.tsx` (via `useNewDay()`), so the reflection textbox and the action share the same reset. Depends on T007.

**Checkpoint**: The day-close ritual works end to end, the archive grows, and the bonsai reflects the close-cycle — MVP is functional and independently testable.

---

## Phase 4: User Story 2 - Export a single archived day (Priority: P2)

**Goal**: A header export menu listing each archived day, each downloadable on its own as valid JSON.

**Independent Test**: With ≥1 archived day (seed one via US1 or storage), open the header menu, pick a day, and confirm a `frog-garden-<date>.json` downloads as valid JSON faithfully representing that day — with no network request.

- [ ] T009 [P] [US2] Add export helpers to `src/lib/dayArchive.ts`: `downloadJson(filename, data)` (pretty-printed `Blob` + temporary `<a download>` click + object-URL revoke, no network), `buildSingleDayExport(day)`, and `archiveFilename(day, sameDateCount)` (date; append `-HHmm` when the date is duplicated). Matches `contracts/`.
- [ ] T010 [US2] Create `src/components/ExportMenu.tsx`: a header `IconButton` opening a re-themed MUI `Menu` that lists archived days from `useArchive()` (label by date; add a time when a date is duplicated — see `closedAt`), shows a calm empty-state when none, and exports the selected day via `buildSingleDayExport` + `downloadJson`. Keyboard + SR accessible. Depends on T002, T009.
- [ ] T011 [US2] Mount `ExportMenu` in the header of `src/app/page.tsx`, near the theme/Dev controls. Depends on T010.

**Checkpoint**: Single-day export works; US1 + US2 both function independently.

---

## Phase 5: User Story 3 - Export everything (Priority: P3)

**Goal**: An "Export everything" option dumping all archived days + current live state as one JSON file.

**Independent Test**: Choose "Export everything" and confirm one `frog-garden-all-<date>.json` downloads with distinct `archive` and `live` top-level keys; verify it still works (with `"archive": []`) when nothing is archived.

- [ ] T012 [P] [US3] Add `buildFullExport(archive, live)` to `src/lib/dayArchive.ts`, gathering the live state (`tasks`, `frogTaskId`, `completedLog`, `reflection`, `focusSessions`, bonsai `leaves`+`stage`) with `archive`/`live` separation and `schemaVersion` per `contracts/export-format.md`.
- [ ] T013 [US3] Add an "Export everything" item to `src/components/ExportMenu.tsx` → `frog-garden-all-<date>.json` via `buildFullExport` + `downloadJson`; ensure it works with an empty archive. Depends on T012, T010.

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Constitution gates (a11y, calm-UX, theming) and end-to-end validation.

- [ ] T014 [P] Accessibility + reduced-motion pass on `src/components/NewDayAction.tsx` and `src/components/ExportMenu.tsx`: full keyboard operation (Tab/Enter/Esc), screen-reader labels, and `prefers-reduced-motion` reduced/instant transitions (FR-017, FR-018).
- [ ] T015 [P] Verify calm, non-judgmental copy and zen-theme styling (WCAG AA contrast, light + dark) for all new controls; no scoreboard/streak language, no "you did nothing" on empty days (FR-016, Principles I/II/V).
- [ ] T016 Verify no network request occurs on close or any export, and that exported files are valid, well-formed JSON matching `contracts/export-format.md` (SC-004, SC-005).
- [ ] T017 Run all `quickstart.md` scenarios in the browser preview — including a check that leaving the app idle past midnight does **not** auto-archive or auto-reset the board (FR-003), and that the bonsai persists its growth across a midnight until a manual close (FR-006b); ensure `tsc --noEmit` and `eslint src --max-warnings=0` are clean.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — start immediately.
- **Foundational (Phase 2)**: depends on Setup — **blocks all user stories**.
- **User Stories (Phase 3–5)**: all depend on Foundational.
  - US1 (P1) is the MVP and has no dependency on US2/US3.
  - US2 (P2) needs the repository read (Foundational); testable with seeded archive data.
  - US3 (P3) extends the `ExportMenu` created in US2 → depends on US2 (T010).
- **Polish (Phase 6)**: after the desired stories are complete.

### Story-level

- **Foundational**: T002 and T003 touch different files (`dayArchive.ts` vs `bonsai.ts`) and are independent.
- **US1**: T004, T005 parallel (different files); T006 needs T002 + T003 + T004 + T005; T007 needs T006; T008 needs T007.
- **US2**: T009 independent of US1's other work (but same file as T006 — see note); T010 needs T002 + T009; T011 needs T010.
- **US3**: T012 parallel; T013 needs T012 + T010.

> **Same-file note**: T001, T002, T006, T009, T012 all edit `src/lib/dayArchive.ts`. They are logically separable but touch one file — do them in ID order (or coordinate) rather than truly concurrently. `[P]` on those means "independent of the *stories'* other work," not "edit the file simultaneously." T003 is a separate file (`bonsai.ts`).

### Parallel Opportunities

- T004 and T005 (different files) can run in parallel within US1.
- T014 and T015 (polish) can run in parallel.
- Once Foundational is done, US1 and the US2 helper (T009) can progress independently.

---

## Parallel Example: User Story 1

```bash
# T004 and T005 touch different files — run together:
Task: "Add resetSessions() to src/lib/focusStats.ts"
Task: "Add new-day reset (drop completed / keep unfinished / clear frog + clear completed-log) to src/lib/tasks.ts"
# Then T006 (dayArchive orchestration) once both land.
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup (T001) → Phase 2 Foundational (T002, T003).
2. Phase 3 US1 (T004–T008).
3. **STOP & VALIDATE**: run quickstart Scenarios 1–3 (close/reset/empty-day) — verify archive via storage.
4. This alone delivers the day-close ritual + private archive + close-cycle bonsai.

### Incremental Delivery

1. Setup + Foundational → archive boundary + bonsai model ready.
2. US1 → day-close ritual (MVP).
3. US2 → single-day export.
4. US3 → full dump.
5. Polish → a11y, theming, validation gate.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task (heed the same-file note for `dayArchive.ts`).
- `[Story]` label maps each task to its user story for traceability.
- All archive persistence stays behind `dayArchive.ts` (future-DB seam — see plan.md).
- T003 modifies feature 006's bonsai model; an amendment note lives in `specs/006-growing-bonsai/data-model.md`.
- Commit after each task or logical group; keep the constitution gates (a11y, calm-UX, theming) in view for any visual task.
