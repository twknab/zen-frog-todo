# Tasks: Notepad Tabs & Grove Row Reveal

**Input**: Design documents from `/specs/021-notepad-tabs-grove-rows/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not included — release gate is `tsc --noEmit` + `eslint --max-warnings=0` plus manual verification against `quickstart.md`.

**Organization**: Tasks grouped by user story. Phase 2 notepad document helpers unblock US1 + US3. Grove (US2) only needs setup + optional pure layout helpers and can proceed in parallel with US1 after Phase 2 notepad foundation (or after T001 if grove helpers are self-contained).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: User story label (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js app: `src/lib/`, `src/components/`, `src/app/`

---

## Phase 1: Setup

**Purpose**: Confirm feature context before coding

- [x] T001 Confirm active feature is `specs/021-notepad-tabs-grove-rows` in `.specify/feature.json`, branch `021-notepad-tabs-grove-rows`, and skim App Router client-component notes under `node_modules/next/dist/docs/` before client UI edits (per `AGENTS.md`)
- [x] T002 [P] Re-read `specs/021-notepad-tabs-grove-rows/contracts/notepad-tabs-ui-contract.md`, `notepad-export-import-contract.md`, and `grove-row-reveal-contract.md` so implementation matches clarify decisions

**Checkpoint**: Ready to code against contracts.

---

## Phase 2: Foundational — notepad document domain

**Purpose**: Tab document types, migration, title helper, and `useNotepad` API that US1/US3 share. MUST complete before US1/US3 UI.

**⚠️ CRITICAL**: US1 and US3 must not start until this phase is done.

- [x] T003 Rewrite `src/lib/notepad.ts` with `NotepadTab`, `NotepadDocument`, `NOTEPAD_KEY`, `createEmptyDocument()` / `migrateNotepadValue()`, and `uniqueTabTitle(desired, takenTitles)` per `data-model.md` and research Decisions 1 & 6
- [x] T004 Extend `useNotepad()` in `src/lib/notepad.ts` to persist `NotepadDocument` (tolerant read of legacy string → **My Note**), expose document + setters (or granular mutators: setActive, updateBody, addTab, renameTab, moveTab, deleteTab) suitable for shell wiring
- [x] T005 [P] Add pure Grove layout helpers (e.g. `computePerRow`, `clampRevealedCount`) in `src/lib/grove.ts` or a small `src/lib/groveLayout.ts` per research Decision 8 — no UI yet

**Checkpoint**: Document migrates in isolation; TypeScript compiles for notepad module; Grove math pure functions ready.

---

## Phase 3: User Story 1 — Organize notes across named tabs (Priority: P1) 🎯 MVP

**Goal**: Tabbed notepad with create / rename / reorder / delete; legacy → **My Note**; Write/Preview preserved.

**Independent Test**: Open notepad after legacy string migrate; add/rename/reorder/delete tabs; reload; Write/Preview still work (quickstart A–B minus import).

- [x] T006 [US1] Create `src/components/NotepadTabStrip.tsx` per `contracts/notepad-tabs-ui-contract.md` — tablist, select, add (**Untitled**), inline rename, move left/right, delete (guard last tab; confirm if non-empty)
- [x] T007 [US1] Update `src/components/NotepadShell.tsx` to host `NotepadTabStrip`, lift Write/Preview mode state for the session, and pass active tab body into `MarkdownNotepad`
- [x] T008 [US1] Update `src/components/MarkdownNotepad.tsx` so mode can be controlled from the shell (or stay lifted) and value/onChange bind only the active tab body — preview richness unchanged
- [x] T009 [US1] Wire `src/app/page.tsx` to the new `useNotepad()` document API (`NotepadShell` props no longer a bare string)
- [x] T010 [US1] Manually verify quickstart scenarios A–B (migrate + CRUD + keyboard); note gaps for PR if browser unavailable

**Checkpoint**: US1 shippable without import/export or Grove changes.

---

## Phase 4: User Story 2 — Grove row reveal (Priority: P1)

**Goal**: One viewport-width row by default; load-more adds a row; no horizontal scroll; reset on visit; resize keeps day count.

**Independent Test**: Many archive days → one row, no overflow-x; load-more; hide/show resets; resize keeps count (quickstart D).

- [x] T011 [US2] Refactor ribbon in `src/components/Grove.tsx` to wrapping rows with `overflowX: "hidden"` (remove horizontal scroll chrome) and build ordered `items` (Today sand + archive) per `contracts/grove-row-reveal-contract.md`
- [x] T012 [US2] Add ephemeral `revealedCount` + ResizeObserver/`perRow` in `src/components/Grove.tsx`; reset on visit (mount when visible / visible false→true); slice rendered items to `revealedCount`
- [x] T013 [US2] Add calm load-more control in `src/components/Grove.tsx` (`revealedCount += perRow`); **hide** when exhausted; respect `useReducedMotion`
- [x] T014 [US2] Manually verify quickstart scenario D (incl. keyboard + reduced-motion); confirm Focus/Hyper Minimal/day dialog regressions smoke-ok

**Checkpoint**: US2 shippable independently of notepad tabs.

---

## Phase 5: User Story 3 — Export + markdown/JSON import (Priority: P2)

**Goal**: Full export emits tab document; notepad import merges full-export `notepad` and plain `.md` with Version N; single-day export untouched.

**Independent Test**: Export everything → document shape; import JSON merge + Version N; import `.md`; legacy string notepad; failed file calm (quickstart C).

- [x] T015 [US3] Update `FullExport` / `buildFullExport` / `useExportEverything` in `src/lib/dayArchive.ts` so `notepad` is `NotepadDocument` (writers) while documenting reader acceptance of legacy `string` per `contracts/notepad-export-import-contract.md`
- [x] T016 [US3] Add merge helpers in `src/lib/notepad.ts` (e.g. `notepadFromExportField`, `mergeNotepadDocuments`) implementing append + `uniqueTabTitle` + new ids; local `activeTabId` unchanged
- [x] T017 [US3] Add notepad import affordance in `src/components/NotepadShell.tsx` (and/or small `NotepadImportButton.tsx`) — file picker for `.md`/`.markdown`/`.txt`/`.json`; wire merge / new-tab / calm failure per contracts
- [x] T018 [US3] Confirm `src/components/ExportMenu.tsx` still export-only and single-day path unchanged; fix any type fallout from `FullExport.notepad` change
- [x] T019 [US3] Manually verify quickstart scenario C

**Checkpoint**: US1 + US3 portability complete.

---

## Phase 6: Polish & cross-cutting

**Purpose**: Quality gate and doc sync

- [x] T020 [P] Align `specs/021-notepad-tabs-grove-rows/quickstart.md` / contract notes with any intentional implementation deltas (no silent spec drift)
- [x] T021 Run `npx tsc --noEmit` and `npx eslint --max-warnings=0` at repo root; fix all issues
- [x] T022 Smoke quickstart E (Focus Mode, Hyper Minimal empty Grove, reflection/new-day leaves tabs intact, no network for these actions)

---

## Dependencies & Execution Order

```text
Phase 1 (T001–T002)
    └── Phase 2 (T003–T005)
            ├── Phase 3 US1 (T006–T010) ──┐
            │                              ├── Phase 5 US3 (T015–T019)
            └── Phase 4 US2 (T011–T014) ──┘ (independent of US1)
                                              └── Phase 6 (T020–T022)
```

- **US1** blocks **US3** (needs tab document + shell).
- **US2** parallelizable with **US1** after Phase 2 (T005 optional before T011).
- **MVP**: Phase 1 + 2 + US1 (T001–T010).

## Parallel opportunities

- After T004: T005 (grove helpers) ∥ start T006 (tab strip) if staffing allows
- After Phase 2: US1 (T006–T009) ∥ US2 (T011–T013)
- Polish: T020 ∥ T021 once implementation settled

## Parallel example (post-foundation)

```bash
# Agent A: US1 tab UI
# T006 NotepadTabStrip.tsx → T007 NotepadShell → T008 MarkdownNotepad → T009 page.tsx

# Agent B: US2 Grove
# T011–T013 Grove.tsx row reveal
```

## Implementation strategy

1. Ship **MVP = US1** (tabs + migrate) first — core notepad value.
2. Land **US2** Grove rows (can parallel) — fixes horizontal scroll pain.
3. Add **US3** export/import — portability.
4. Polish with tsc/eslint + quickstart E.

## Notes

- No new npm dependencies (reorder = move buttons).
- Full-app restore of `archive`/`live` is **out of scope**; JSON import merges notepad only.
- Standalone `.md` **export** not required.
