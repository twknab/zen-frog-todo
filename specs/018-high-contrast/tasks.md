# Tasks: High Contrast Toggle

**Input**: Design documents from `/specs/018-high-contrast/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks (project gate = `tsc` + eslint + manual quickstart). Manual verification in Polish phase.

**Organization**: Tasks grouped by user story (US1 enable HC, US2 disable/restore palette, US3 Appearance under HC).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Confirm feature artifacts before coding

- [x] T001 Confirm `.specify/feature.json` points to `specs/018-high-contrast`; skim `node_modules/next/dist/docs/` only if Next-specific API edits are needed (none expected)

---

## Phase 2: Foundational (HC theme + atmosphere + registry)

**Purpose**: HC theme factory, atmosphere, and ThemeRegistry override — blocks Options UI stories

**⚠️ CRITICAL**: Options toggle only after theme resolution works

- [x] T002 [P] Add HC light+dark token bags and export `createHighContrastTheme(mode)` in `src/theme/theme.ts` (internal id `highContrast`; NOT a `PaletteId`; AA-strong near-black/near-white; HC-safe green moss)
- [x] T003 [P] Add `getHighContrastAtmosphere(mode)` with simplified low-wash atmosphere in `src/theme/atmosphere.ts`
- [x] T004 Wire `usePersistentState("frog-garden:high-contrast-v1", false)`, `useHighContrast()` context, theme resolution (`HC ? createHighContrastTheme(mode) : createZenTheme(mode, palette)`), and pass HC into backdrop in `src/theme/ThemeRegistry.tsx`
- [x] T005 Update `src/components/GardenBackdrop.tsx` to use HC atmosphere when `highContrast` is true

**Checkpoint**: Programmatic HC theme applies for light/dark; palette preference untouched in storage

---

## Phase 3: User Story 1 — Turn on High Contrast (P1) 🎯 MVP

**Goal**: Options High Contrast toggle; HC theme; Palette disabled + calm hint; popover stays open; preference persists

**Independent Test**: Toggle HC on → HC theme, Palette disabled, Options open, reload persists

- [x] T006 [US1] Add High Contrast `Switch` labelled “High Contrast” near Appearance/Dev in `src/components/OptionsPanel.tsx`; toggling MUST NOT close Popover
- [x] T007 [US1] Disable Palette `Select` when HC on; show calm secondary hint “Using high contrast”; keep displayed value as stored palette in `src/components/OptionsPanel.tsx`
- [x] T008 [US1] When HC on, skip wordmark gradient in `src/app/page.tsx` (solid primary) so contrast stays strong

---

## Phase 4: User Story 2 — Turn off High Contrast and regain Palette (P1)

**Goal**: Turning HC off restores stored palette visually and re-enables Palette; Options stays open

**Independent Test**: Enable HC with Prism (or any) stored → disable HC → Prism returns; Palette interactive

- [x] T009 [US2] Verify ThemeRegistry off-path restores `createZenTheme(mode, palette)` without clearing `frog-garden:palette-v1` in `src/theme/ThemeRegistry.tsx` (fix if any wipe exists)
- [x] T010 [US2] Confirm Palette Select re-enables when HC off and change handlers apply in `src/components/OptionsPanel.tsx`

---

## Phase 5: User Story 3 — Appearance under High Contrast (P2)

**Goal**: Light/Dark remains available; both HC variants AA-strong with clear focus/selected states

**Independent Test**: With HC on, toggle Appearance → HC light ↔ HC dark both readable

- [x] T011 [US3] Contrast-tune HC light+dark tokens in `src/theme/theme.ts` for text, primary chrome, focus/selected (Options toggles use primary)
- [x] T012 [US3] Confirm Appearance ToggleButtonGroup stays enabled while HC on in `src/components/OptionsPanel.tsx` (no lock)

---

## Phase 6: Polish & cross-cutting

**Purpose**: Gates, contract alignment, manual quickstart

- [x] T013 Confirm HC is absent from `PALETTE_OPTIONS` / dropdown in `src/theme/theme.ts` and `src/components/OptionsPanel.tsx`
- [x] T014 Run `npx tsc --noEmit` and `npm run lint`; fix issues
- [x] T015 Manual pass of `specs/018-high-contrast/quickstart.md`
- [x] T016 Mark tasks complete; keep scope to HC toggle + override + Palette disable only

---

## Dependencies

```text
Phase 1 → Phase 2 → Phase 3 (US1 MVP) → Phase 4 (US2) → Phase 5 (US3) → Phase 6
T002 ∥ T003 → T004 → T005 → T006/T007 → …
```

## Parallel opportunities

- T002 ∥ T003 (theme tokens vs atmosphere)
- T006 ∥ T008 after T004 (Options toggle vs wordmark) once registry exposes `useHighContrast`

## MVP

Phase 2 + Phase 3 (US1): toggle on, HC theme, Palette disable, persist.

## Implementation strategy

1. HC tokens + atmosphere + ThemeRegistry override
2. Options UI (switch + disabled Palette)
3. Appearance verification + contrast tune
4. tsc/eslint + quickstart
