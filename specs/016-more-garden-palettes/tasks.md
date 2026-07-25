# Tasks: More Garden Palettes

**Input**: Design documents from `/specs/016-more-garden-palettes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks (project gate = `tsc` + eslint + manual quickstart). Manual verification in Polish phase.

**Organization**: Tasks grouped by user story (US1 new palettes, US2 light/dark for new sets, US3 Options 2×3 layout).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Confirm feature artifacts before coding

- [x] T001 Confirm `.specify/feature.json` points to `specs/016-more-garden-palettes`; skim `node_modules/next/dist/docs/` only if Next-specific font/API edits are needed (none expected beyond existing `next/font` usage)

---

## Phase 2: Foundational (Palette ids + tokens + atmosphere)

**Purpose**: Six-palette theme factory and atmosphere — blocks all UI stories

**⚠️ CRITICAL**: Options UI for new ids only after tokens + normalize + atmosphere exist

- [x] T002 Extend `PaletteId`, `PALETTE_IDS`, and `normalizePaletteId` in `src/theme/theme.ts` to include `guestbook` | `sunlily` | `tidepool` (unknown → `natural`)
- [x] T003 [P] Add Guestbook / Sunlily / Tide Pool light+dark `ZenPalette` bags and wire them into `tokensByPalette` in `src/theme/theme.ts`; map Guestbook headings to Bricolage (like Vibrant); Sunlily/Tide Pool to Zen Maru Gothic
- [x] T004 [P] Add distinct atmosphere washes for `guestbook`, `sunlily`, and `tidepool` in `src/theme/atmosphere.ts` (no Natural fallthrough for those ids)
- [x] T005 Verify `src/theme/ThemeRegistry.tsx` persists/restores new ids via existing `frog-garden:palette-v1` + `normalizePaletteId` (touch only if needed)

**Checkpoint**: Programmatic `createZenTheme(mode, id)` works for all six ids × light/dark

---

## Phase 3: User Story 1 — Discover and pick a joyful new palette (P1) 🎯 MVP

**Goal**: Six named palettes selectable; immediate retheme; persistence; Natural default; new three feel distinct

**Independent Test**: Select Guestbook / Sunlily / Tide Pool → full retheme; reload persists; clear storage → Natural; vibes distinct from Natural/Vibrant/Dusk

- [x] T006 [US1] Update Palette control in `src/components/OptionsPanel.tsx` to include ToggleButtons for Guestbook, Sunlily, and Tide Pool (with matching `aria-label`s); keep exclusive selection and Popover-open-on-change
- [x] T007 [US1] Update wordmark treatment in `src/app/page.tsx` so `guestbook` (and existing `vibrant`) may use gradient; `sunlily` / `tidepool` stay solid `primary.main`
- [x] T008 [US1] Visually tune Guestbook / Sunlily / Tide Pool hex tokens in `src/theme/theme.ts` (and atmosphere if needed) so each reads distinct and joyful vs Natural / Vibrant / Dusk

---

## Phase 4: User Story 2 — New palettes work in light and dark (P1)

**Goal**: All twelve palette×appearance combos coherent and WCAG AA for text/controls

**Independent Test**: For each new palette (plus regression on original three), toggle Light/Dark without resetting palette; readable ink/controls

- [x] T009 [US2] Contrast-tune all six light+dark token sets in `src/theme/theme.ts` for primary text, secondary text, and selected Options toggle (`primary` + `contrastText`); adjust hex as needed
- [x] T010 [US2] Confirm Appearance ToggleButtonGroup in `src/components/OptionsPanel.tsx` remains orthogonal (no code change expected unless a regression appears)

---

## Phase 5: User Story 3 — Options stays calm with six palettes (P1)

**Goal**: Palette picker uses calm 2×3 wrap/grid; readable on ~360px; no horizontal overflow; a11y intact

**Independent Test**: Narrow viewport Options → wrap grid, no cramped single row of six, keyboard/SR labels work

- [x] T011 [US3] Redesign Palette `ToggleButtonGroup` layout in `src/components/OptionsPanel.tsx` for six options: flex-wrap ~2×3 grid, slightly smaller padding/labels as needed, calm Popover `minWidth`; Appearance stays single-row
- [x] T012 [US3] A11y pass on `src/components/OptionsPanel.tsx`: Palette group label; six option names; keyboard selection; Popover stays open; reduced-motion already honored

---

## Phase 6: Polish & cross-cutting

**Purpose**: Gates, contract alignment, manual quickstart

- [x] T013 [P] Align any remaining palette-branched UI (e.g. comments in `src/theme/fonts.ts`) with six-palette heading/wordmark rules
- [x] T014 Run `npx tsc --noEmit` and `npm run lint`; fix issues
- [x] T015 Manual pass of `specs/016-more-garden-palettes/quickstart.md`
- [x] T016 Mark completed tasks in `specs/016-more-garden-palettes/tasks.md` as work finishes

---

## Dependencies & Execution Order

- **Phase 1 → 2 → 3 → 4 → 5 → 6**
- US1 needs T002–T005
- US2 needs US1 tokens selectable (T006+)
- US3 can start after T006 exists; ideally after tokens stable
- Polish after UI complete

```text
T001 → T002 → (T003 ∥ T004) → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → (T013 ∥ T014) → T015 → T016
```

## Parallel Opportunities

- T003 and T004 after T002
- T013 and T014 after T012

## Implementation Strategy

- MVP = Phase 2 + US1 (three new palettes selectable + persist)
- Then contrast (US2) and Options grid (US3)
- Stop when quickstart + tsc/lint pass; converge if gaps remain
