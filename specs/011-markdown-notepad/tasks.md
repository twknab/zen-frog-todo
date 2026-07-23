---
description: "Task list for Markdown Notepad — Daily Notes"
---

# Tasks: Markdown Notepad — Daily Notes

**Input**: Design documents from `specs/011-markdown-notepad/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/notepad-ui-contract.md, quickstart.md

**Tests**: No automated test tasks — gate is clean `tsc --noEmit` + `eslint` plus manual `quickstart.md` verification.

**Organization**: Tasks grouped by user story (US1 → US2 → US3) so each is an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3 (setup, foundational, and polish have no story label)

## Path Conventions

Single Next.js web app: source under `src/` at repo root (`src/components/`, `src/lib/`, `src/app/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the minimal markdown + sanitization dependencies.

- [ ] T001 Install `marked` and `dompurify` (and `@types/dompurify` if typings are not bundled); confirm they appear in `package.json` / lockfile. Skim App Router client-component guidance under `node_modules/next/dist/docs/` before writing client helpers (per `AGENTS.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared safe-render helper all preview surfaces use.

**⚠️ CRITICAL**: Complete before user-story UI work.

- [ ] T002 [P] Create `src/lib/markdown.ts` exporting `renderMarkdownToSafeHtml(markdown: string): string` using `marked.parse` + `DOMPurify.sanitize` (client-safe; document that callers must be client components). Empty input returns `""` (Decision 2 / data-model.md).
- [ ] T003 [P] Create `src/components/MarkdownPreview.tsx`: themed container that renders `renderMarkdownToSafeHtml(markdown)` via `dangerouslySetInnerHTML` only with sanitized output; styles headings/lists/code with theme tokens (not stock browser defaults) (FR-012, FR-015).

**Checkpoint**: Safe preview primitive ready; notepad and Grove can consume it.

---

## Phase 3: User Story 1 - Write and preview today's note (Priority: P1) 🎯 MVP

**Goal**: Dashboard notepad with write/preview toggle, persisted live note, a11y + reduced motion.

**Independent Test**: Type markdown, toggle preview, reload — note persists; mode resets to write (quickstart Scenarios 1–2, 7).

- [ ] T004 [US1] Create `src/components/MarkdownNotepad.tsx`: controlled `value`/`onChange`, session-only mode state defaulting to `"write"`, exclusive Write/Preview control (re-themed MUI `ToggleButtonGroup`), write-mode themed multiline `TextField`, preview-mode `MarkdownPreview`, calm placeholder prop (contracts/notepad-ui-contract.md).
- [ ] T005 [US1] In `MarkdownNotepad.tsx`, wire accessibility: group `aria-label` (e.g. "Note display mode"), keyboard-operable toggles, announce pressed state; honor `useReducedMotion()` with instant mode swap (no decorative motion) (FR-013, FR-014).
- [ ] T006 [US1] In `src/app/page.tsx`, replace the Close-the-day plain `TextField` with `<MarkdownNotepad value={notes} onChange={setNotes} … />`; retitle the card toward today's note; keep `<NewDayAction />` in the same card; keep `!isFocus` gate (FR-001, FR-005, FR-016).
- [ ] T007 [US1] Theme/contrast pass on notepad + preview in light and dark — no stock Material look; no word-count/guilt copy (FR-015, FR-017).

**Checkpoint**: MVP — write/preview notepad works for the live day.

---

## Phase 4: User Story 2 - One daily note that closes with the day (Priority: P2)

**Goal**: Archive path + Grove show the note; no duplicate reflection field; user-facing "reflection" → "note" copy.

**Independent Test**: Start a new day → live notepad empty; Grove recap shows rendered note (quickstart Scenario 3).

- [ ] T008 [US2] In `src/components/GroveDayDialog.tsx`, render non-empty `day.reflection` via `MarkdownPreview` (omit block when empty); update any "Reflection" label to calm note language (FR-008).
- [ ] T009 [P] [US2] Update user-facing copy in `src/components/NewDayAction.tsx` (and any dialog strings) from "reflection" to "note" where appropriate — do **not** rename the `reflection` storage/export field (FR-010).
- [ ] T010 [US2] Verify (code review + quickstart Scenario 3) that `useStartNewDay` / auto-rollover still snapshot and clear the live `frog-garden:reflection-v1` string with no parallel note key introduced (FR-006, FR-007, SC-007).

**Checkpoint**: Single daily-note concept end-to-end with archive + Grove.

---

## Phase 5: User Story 3 - Export includes notes (Priority: P3)

**Goal**: Confirm single-day and full exports still carry notepad content under `reflection`.

**Independent Test**: Export JSON contains the note markdown source (quickstart Scenario 4).

- [ ] T011 [US3] Spot-check `buildSingleDayExport` / `buildFullExport` / `useExportAll` in `src/lib/dayArchive.ts` — notepad content flows through existing `reflection` fields; add a brief comment if helpful that the field holds markdown source; no schema rename (FR-009, FR-010).
- [ ] T012 [US3] Manually export single-day + full JSON with a distinctive note and confirm `reflection` values in the files (quickstart Scenario 4 / SC-004).

**Checkpoint**: Portability preserved (Principle III).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T013 [P] Run `quickstart.md` Scenarios 1–7 (incl. XSS paste Scenario 5, Focus Mode Scenario 6) and fix gaps.
- [ ] T014 [P] Verify DevTools Network: no requests when typing or toggling preview (FR-011).
- [ ] T015 Ensure `npx tsc --noEmit` and `npm run lint` are clean; resolve any issues.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T003)** → user stories.
- **T002 / T003**: parallel after T001 (different files).
- **US1 (T004–T007)**: T004 first; T005 edits same file; T006 needs T004; T007 after mount.
- **US2 (T008–T010)**: needs US1 notepad live + T003 preview; T008/T009 parallel; T010 after.
- **US3 (T011–T012)**: after US2 archive path confirmed.
- **Polish (T013–T015)**: after stories complete.

## Parallel opportunities

```text
T001
 then T002 || T003
 then T004 → T005 → T006 → T007
 then (T008 || T009) → T010
 then T011 → T012
 then (T013 || T014) ; T015
```

## Implementation strategy

1. Ship **US1** as MVP (live write/preview notepad).
2. Add **US2** (Grove + copy + archive verification).
3. Confirm **US3** export (likely already satisfied — verify, don't over-build).
4. Polish gate: quickstart + tsc + eslint.
