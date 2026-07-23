---
description: "Task list for Markdown Notepad — Persistent Engineering Notes"
---

# Tasks: Markdown Notepad — Persistent Engineering Notes

**Input**: Design documents from `specs/011-markdown-notepad/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/notepad-ui-contract.md, contracts/notepad-export-contract.md, quickstart.md

**Tests**: No automated test tasks — gate is clean `tsc --noEmit` + `eslint` plus manual `quickstart.md` verification.

**Organization**: Tasks grouped by user story (US1 → US2 → US3). Prior branch WIP assumed “replace reflection”; these tasks **realign** to the clarified model.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3 (setup, foundational, and polish have no story label)

## Path Conventions

Single Next.js web app: `src/components/`, `src/lib/`, `src/app/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Swap to the rich GFM markdown stack.

- [ ] T001 Replace `marked` + `dompurify` (+ `@types/dompurify` if present) with `react-markdown`, `remark-gfm`, and `rehype-sanitize` in `package.json` / lockfile (`npm uninstall` / `npm install`). Skim App Router client-component notes under `node_modules/next/dist/docs/` before writing client UI (per `AGENTS.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared preview + notepad persistence key; undo incorrect Close-the-day binding.

**⚠️ CRITICAL**: Complete before user-story UI work.

- [ ] T002 Rewrite `src/components/MarkdownPreview.tsx` to render via `react-markdown` with `remarkPlugins={[remarkGfm]}` and `rehypePlugins={[rehypeSanitize]}`, styled with theme tokens (tables/code/lists); no `dangerouslySetInnerHTML` / no `marked` (research Decision 5; contracts/notepad-ui-contract.md).
- [ ] T003 Update or remove `src/lib/markdown.ts` so nothing depends on `marked`/`DOMPurify` (either delete and import plugins only from `MarkdownPreview`, or re-export shared plugin arrays from a thin `src/lib/markdown.ts`).
- [ ] T004 [P] Add `NOTEPAD_KEY = "frog-garden:notepad-v1"` (and optional `useNotepad()` thin wrapper) in `src/lib/notepad.ts` using `usePersistentState` (data-model.md).
- [ ] T005 In `src/app/page.tsx`, restore the Close-the-day card to a plain reflection `TextField` bound to `frog-garden:reflection-v1` (mental-health copy / prior framing), keep `<NewDayAction />`, and **remove** `<MarkdownNotepad />` from that card (research Decision 1 & 9).

**Checkpoint**: Preview stack + notepad key ready; reflection UI restored; user stories can begin.

---

## Phase 3: User Story 1 - Open full-screen notepad write/preview (Priority: P1) 🎯 MVP

**Goal**: Upper-right control opens a full-screen notepad with write/preview and auto-persisted eng notes.

**Independent Test**: quickstart Scenarios 1, 5–7 (open full-screen, GFM preview, persist across close/reload, a11y/reduced-motion, theme).

- [ ] T006 [P] [US1] Retheme `src/components/MarkdownNotepad.tsx` for eng-scratchpad use: calm placeholder (not “today’s reflection” guilt copy), larger `minRows` for full-screen, keep exclusive Write/Preview `ToggleButtonGroup` with labels + `useReducedMotion` mode swap (contracts/notepad-ui-contract.md).
- [ ] T007 [US1] Create `src/components/NotepadShell.tsx`: full-screen MUI `Dialog` (`fullScreen`) hosting title “Notepad”, close control, and `<MarkdownNotepad />`; Escape/close dismisses without discard prompt; `transitionDuration={0}` when `useReducedMotion()` (research Decision 4).
- [ ] T008 [P] [US1] Create `src/components/NotepadButton.tsx`: themed header `IconButton` with `aria-label="Open notepad"` that opens the shell.
- [ ] T009 [US1] In `src/app/page.tsx`, bind notepad state via `NOTEPAD_KEY` / `useNotepad()`, mount `<NotepadButton />` in the upper-right header `Stack` (with Export/theme), mount `<NotepadShell />`, and wire open state + `value`/`onChange` auto-persist (FR-002, FR-005, FR-017).

**Checkpoint**: US1 demoable — full-screen eng notepad with write/preview + persistence.

---

## Phase 4: User Story 2 - Reflection stays; notepad survives new day + Focus (Priority: P2)

**Goal**: Reflection remains day-scoped; notepad survives new day; notepad usable in Focus Mode.

**Independent Test**: quickstart Scenarios 2–3 (Focus open; new day clears reflection only).

- [ ] T010 [US2] In `src/app/page.tsx`, ensure `NotepadButton` / shell are **not** gated by `!isFocus` so Focus Mode can open the notepad (FR-013, SC-008).
- [ ] T011 [US2] Audit `src/lib/dayArchive.ts` new-day / auto-rollover paths so they never clear `frog-garden:notepad-v1` (only reflection/tasks/etc. as today) (FR-005–006).
- [ ] T012 [US2] Smoke-check Close-the-day: reflection still archives/clears; notepad text remains after confirm (page + `NewDayAction` / archive hooks).

**Checkpoint**: US1 + US2 — distinct reflection vs notepad; Focus + new-day behavior correct.

---

## Phase 5: User Story 3 - Full export includes notepad (Priority: P3)

**Goal**: Full JSON export carries top-level `notepad`; single-day export unchanged.

**Independent Test**: quickstart Scenario 4.

- [ ] T013 [US3] Extend `FullExport` in `src/lib/dayArchive.ts` with top-level `notepad: string`; update `buildFullExport` signature/callers per `contracts/notepad-export-contract.md` (do **not** add notepad to `ArchivedDay` / `SingleDayExport`).
- [ ] T014 [US3] Update `useExportEverything` in `src/lib/dayArchive.ts` to read `frog-garden:notepad-v1` at click time and include it in the full dump (missing → `""`).

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T015 [P] Confirm `GroveDayDialog` still renders archived `reflection` via `MarkdownPreview` (or plain text) and does **not** surface the eng notepad (research Decision 8).
- [ ] T016 Run `quickstart.md` Scenarios 1–7 (light + dark, Focus, reduced motion, keyboard) and fix gaps.
- [ ] T017 Ensure `npx tsc --noEmit` and `npm run lint` are clean; remove unused `marked`/`dompurify` imports if any remain.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T005)** → user stories.
- **US1 (T006–T009)**: T006/T008 can parallel after foundation; T007 before/with T009; T009 integrates in `page.tsx`.
- **US2 (T010–T012)**: After US1 shell exists; T010–T011 can parallel; T012 validates both.
- **US3 (T013–T014)**: Can start after T004 (key exists); naturally after US1 for manual export check.
- **Polish (T015–T017)**: After desired stories complete.

### User Story Dependencies

- **US1 (P1)**: After Foundational — MVP.
- **US2 (P2)**: Needs US1 shell/button; independently testable via Focus + new-day.
- **US3 (P3)**: Needs notepad key + export helpers; independently testable via JSON inspect.

### Parallel Opportunities

```bash
# After T001:
# T002 MarkdownPreview  ||  T004 notepad.ts
# Then T003 cleanup, T005 restore reflection

# After foundation:
# T006 MarkdownNotepad  ||  T008 NotepadButton
# Then T007 NotepadShell → T009 page wiring
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001–T005 foundation (deps + preview + key + restore reflection)
2. T006–T009 full-screen notepad
3. **STOP** — validate quickstart Scenario 1

### Incremental Delivery

1. MVP (US1) → demo eng notepad
2. US2 → Focus + new-day separation
3. US3 → full export field
4. Polish → gates green

---

## Notes

- Prior checked tasks for “replace reflection / marked stack” are **obsolete**; this file supersedes them — all tasks start unchecked.
- Do not clear notepad on new day; do not put notepad on `ArchivedDay`.
- Commit after each phase or logical group when implementing.
