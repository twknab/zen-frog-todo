# Implementation Plan: High Contrast Toggle

**Branch**: `018-high-contrast` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-high-contrast/spec.md`

## Summary

Add an Options **High Contrast** toggle that applies one hard-set HC theme override (internal id `highContrast`) for light and dark appearances, persists via `frog-garden:high-contrast-v1` (default `false`), and disables the Palette dropdown while active without wiping the stored palette. Appearance stays available. Theme resolution: if HC → HC theme(mode); else → `createZenTheme(mode, palette)`. Simplified atmosphere under HC. No new Palette dropdown entries. Coexist with Hyper Minimal if/when merged.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged. Check `node_modules/next/dist/docs/` before any Next-specific API changes (none expected).

**Primary Dependencies**: Existing MUI Switch / Select / Popover, `createZenTheme`, `getGardenAtmosphere`, `usePersistentState`, ThemeRegistry contexts. No new packages.

**Storage**: New key `frog-garden:high-contrast-v1` (boolean, default `false`). Palette key `frog-garden:palette-v1` unchanged and never cleared by HC.

**Testing**: Gate = `tsc --noEmit` + `eslint` + manual browser check per `quickstart.md`.

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Theme recreate on toggle remains immediate; atmosphere CSS-only; no new network assets.

**Constraints**: Local-first (III); WCAG AA on HC light + HC dark (IV); calm disabled Palette copy (I); MUI stays re-themed (V); YAGNI — one override, no palette dropdown entry, no Density work here; honor `prefers-reduced-motion`.

**Scale/Scope**: ThemeRegistry HC context + theme resolution, HC token bags + atmosphere, OptionsPanel toggle + Palette disable. Docs under `specs/018-high-contrast/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — calm “Using high contrast” hint; no shame UI; popover stays open. |
| II. Subtle Gamification | N/A — no gamification changes. |
| III. Local-First & Private | PASS — on-device boolean only; no backend/telemetry. |
| IV. Accessibility | PASS — labelled switch; disabled Select announced; HC AA minimum; reduced-motion already on Popover. |
| V. Design System Discipline | PASS — HC is a deliberate override aesthetic (near-black/near-white), still MUI-re-themed, not stock Material. |
| VI. Simplicity & Performance (YAGNI) | PASS — one boolean + one override theme; reuse ThemeRegistry / Options patterns. |
| VII. Sound | N/A. |

**Post-design re-check**: Same — Appearance remains orthogonal; Palette preference preserved; no second theming stack beyond a thin HC override path.

## Project Structure

### Documentation (this feature)

```text
specs/018-high-contrast/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── high-contrast-ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── theme/
│   ├── theme.ts           # EDIT — HC token bags + createHighContrastTheme (or createZenTheme HC path)
│   ├── atmosphere.ts      # EDIT — getHighContrastAtmosphere(mode) simplified washes
│   └── ThemeRegistry.tsx  # EDIT — persist HC, useHighContrast(), theme resolution, backdrop
├── components/
│   ├── OptionsPanel.tsx   # EDIT — High Contrast switch; disable Palette when HC
│   └── GardenBackdrop.tsx # EDIT — accept highContrast (or atmosphere override) prop
└── app/
    └── page.tsx           # TOUCH only if wordmark should solidify under HC (prefer solid primary)
```

**Structure Decision**: Single app; thin override above existing palette system. HC is **not** a `PaletteId`.

## Key design decisions (detail in research.md)

1. Appearance stays available; HC light + HC dark both ship.
2. Internal theme id: `highContrast` (not in `PALETTE_OPTIONS`).
3. Persistence: `frog-garden:high-contrast-v1` via `usePersistentState`.
4. Theme resolution in ThemeRegistry: `highContrast ? createHighContrastTheme(mode) : createZenTheme(mode, palette)`.
5. Palette Select `disabled={highContrast}` + FormHelperText / secondary Typography “Using high contrast”.
6. Atmosphere: `getHighContrastAtmosphere(mode)` — flatter, low wash opacity.
7. Wordmark: under HC, prefer solid primary (no carnival gradient) so contrast stays strong — page may skip gradient when HC on.
8. Hyper Minimal coexistence: place HC toggle near Appearance/Dev; do not touch Density APIs that don’t exist on main yet.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | — | — |
