# Tasks: Garden Palette Selector

**Input**: Design documents from `/specs/014-garden-palette/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks (project gate = `tsc` + eslint + manual quickstart). Manual verification listed in Polish phase.

**Organization**: Tasks grouped by user story (US1 palette, US2 appearance orthogonality, US3 Options/header declutter).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Confirm feature artifacts and Next docs awareness before coding

- [x] T001 Confirm active feature path in `.specify/feature.json` points to `specs/014-garden-palette` and skim `node_modules/next/dist/docs/` for any font/theme-relevant notes before Next-specific edits

---

## Phase 2: Foundational (Theme + registry)

**Purpose**: Palette-aware theme factory and persistence — blocks all UI stories

**⚠️ CRITICAL**: No Options UI until theme can retheme by palette × mode

- [x] T002 Update `src/theme/fonts.ts` to export Manrope body, Zen Maru Gothic headings (`zenHeadingFontNatural`), and Bricolage Grotesque headings (`zenHeadingFontVibrant`)
- [x] T003 Refactor `src/theme/theme.ts`: export `PaletteId`; define Natural (pre-experiment muted), Vibrant (experiment tokens), and Dusk (indigo/lilac/gold + moss) light+dark token sets; change `createZenTheme(mode, palette)` to select tokens + heading font by palette
- [x] T004 Extend `src/theme/ThemeRegistry.tsx`: persist `frog-garden:palette-v1` via `usePersistentState` (default `natural`, coerce invalid → natural); expose `useGardenPalette()`; extend color mode with `setColorMode`; `useMemo(() => createZenTheme(mode, palette), [mode, palette])`

**Checkpoint**: Programmatic theme switch works; ready for UI stories

---

## Phase 3: User Story 1 — Choose a garden palette (P1) 🎯 MVP

**Goal**: User can select Natural / Vibrant / Dusk and see immediate full-app retheme; choice persists; default Natural

**Independent Test**: Change palette → surfaces update; reload restores; fresh storage → Natural; Natural is muted not neon

- [x] T005 [US1] Create `src/components/OptionsPanel.tsx` with settings IconButton + Popover skeleton and exclusive Palette `ToggleButtonGroup` (Natural / Vibrant / Dusk) wired to `useGardenPalette`, labelled `aria-label="Palette"`; Popover stays open on change
- [x] T006 [US1] Mount `OptionsPanel` in `src/app/page.tsx` header actions stack; apply wordmark solid for natural/dusk and gradient only for vibrant based on `palette`
- [x] T007 [US1] Verify Natural default + Vibrant/Dusk token application visually against FR-002–004 (adjust Dusk hex in `src/theme/theme.ts` if contrast fails)

---

## Phase 4: User Story 2 — Palette × Appearance (P1)

**Goal**: Light/Dark controlled from Options; orthogonal to palette; all six combos readable

**Independent Test**: For each palette, switch Appearance Light/Dark without resetting palette; WCAG AA smoke

- [x] T008 [US2] Add Appearance exclusive `ToggleButtonGroup` (Light / Dark) to `src/components/OptionsPanel.tsx` using `setColorMode` from `useColorMode`; `aria-label="Appearance"`; keep Popover open
- [x] T009 [US2] Spot-check all six combinations in `src/theme/theme.ts` token choices; tweak Dusk/Natural/Vibrant contrast as needed for primary text and buttons

---

## Phase 5: User Story 3 — Options decluttering header (P1)

**Goal**: Header has no sun/moon, no Dev switch, no permanent palette group; Options hosts Dev too

**Independent Test**: Header chrome check; Options contains Dev; Dev tooling still appears when on; a11y labels

- [x] T010 [US3] Move Dev `Switch` into `src/components/OptionsPanel.tsx` via `devMode` / `onDevModeChange` props; remove header sun/moon IconButton and Dev FormControlLabel from `src/app/page.tsx`
- [x] T011 [US3] Finish Options a11y on `src/components/OptionsPanel.tsx`: trigger `aria-label="Options"`, `aria-haspopup`, `aria-expanded`; Popover labelling; keyboard open/close (Escape/click-away) without resetting prefs; honor reduced motion if transitions used

---

## Phase 6: Polish & cross-cutting

**Purpose**: Gates, cleanup, constitution note for PR

- [x] T012 [P] Remove unused light/dark icon imports from `src/app/page.tsx` if orphaned; ensure no dead toggle helpers
- [x] T013 Run `npx tsc --noEmit` and `npx eslint . --max-warnings=0`; fix issues
- [x] T014 Manual pass of `specs/014-garden-palette/quickstart.md` scenarios 1–7

---

## Dependencies & Execution Order

- **Phase 1 → 2 → 3 → 4 → 5 → 6** (strict for this feature)
- US1 (T005–T007) needs T002–T004
- US2 (T008–T009) needs Options skeleton from US1
- US3 (T010–T011) needs Options from US1/US2
- T012–T014 after UI complete

```text
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012∥T013 → T014
```

## Parallel Opportunities

- After T011: T012 and T013 can run in parallel
- T002 fonts can start alongside reading Next font docs in T001

## Implementation Strategy

1. **MVP**: Phase 2 + US1 (palette switch + persist + Natural default) with minimal Options containing only Palette
2. **Increment**: US2 Appearance in Options
3. **Complete**: US3 move Dev + strip header chrome + a11y polish + gates

## MVP Scope

T001–T007 deliver selectable persisted palettes with Natural default. US2/US3 required for full acceptance (Appearance + Dev in Options / header declutter) before calling the feature done.

---

## Phase 7: Convergence

**Purpose**: Close gaps found by `/speckit-converge` against spec/plan/constitution

- [x] T015 Honor `prefers-reduced-motion` on Options Popover open/close in `src/components/OptionsPanel.tsx` per Edge Cases / Principle IV / FR-011 (`partial`)
