# Implementation Plan: More Garden Palettes

**Branch**: `016-more-garden-palettes` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/016-more-garden-palettes/spec.md`

## Summary

Extend the garden palette system from `014-garden-palette` with three joyful opt-in palettes — **Guestbook** (`guestbook`), **Sunlily** (`sunlily`), and **Tide Pool** (`tidepool`) — each with full light/dark token bags and distinct atmosphere washes. Keep Natural as default and preserve existing Natural / Vibrant / Dusk behavior. Redesign the Options Palette control into a calm **2×3 wrap grid** so six choices stay readable on narrow phones. Reuse persistence (`frog-garden:palette-v1`), `normalizePaletteId`, ThemeRegistry, and atmosphere pipeline — no second theming stack.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged. Check `node_modules/next/dist/docs/` before any Next-specific API changes (none expected).

**Primary Dependencies**: Existing MUI ToggleButtonGroup / Popover, `createZenTheme`, `getGardenAtmosphere`, `useGardenPalette`, Framer Motion `useReducedMotion` (Options already). No new packages. Optional: reuse Bricolage Grotesque for Guestbook headings (already loaded for Vibrant).

**Storage**: Same key `frog-garden:palette-v1`; expand allowed ids; unknown → `natural`.

**Testing**: Gate = `tsc --noEmit` + `eslint` + manual browser check per `quickstart.md` (12 palette×appearance combos, Options grid on narrow width, persistence, no todo/garden regressions).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Theme recreate on palette change remains immediate; atmosphere CSS-only; no new network assets.

**Constraints**: Local-first (III); WCAG AA on all 12 combos (IV); Natural default muted (V) with fun palettes opt-in; Options uncrowded/responsive; YAGNI — extend `PaletteId` + tokens + atmosphere + Options layout only; honor `prefers-reduced-motion`.

**Scale/Scope**: Theme token + atmosphere extensions, Options Palette grid redesign, wordmark gradient allowlist for Guestbook, contract/docs updates under `specs/016-more-garden-palettes/`. Supersedes 014 UI contract bits that assumed exactly three palettes / single-row picker.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — fun palettes are opt-in; Options stays calm wrap grid; no shame UI. |
| II. Subtle Gamification | N/A — no gamification changes. |
| III. Local-First & Private | PASS — same localStorage key; no backend/telemetry. |
| IV. Accessibility | PASS — labelled six-option exclusive control; keyboard; WCAG AA required for all new light/dark sets; reduced-motion already on Popover. |
| V. Design System Discipline | **COMPAT NOTE**: Guestbook (and existing Vibrant) diverge from muted default as explicit user choices; Natural remains default. MUI stays re-themed. |
| VI. Simplicity & Performance (YAGNI) | PASS — extend existing palette system; no new theming stack or deps. |
| VII. Sound | N/A. |

**Post-design re-check**: Same — design keeps Natural default, local normalize/persist, 2×3 Options grid, AA contrast targets. No constitution file edit.

## Project Structure

### Documentation (this feature)

```text
specs/016-more-garden-palettes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── garden-palette-ui-contract.md   # supersedes 014 three-palette UI assumptions
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── theme/
│   ├── theme.ts           # EDIT — PaletteId + PALETTE_IDS + normalize + 3×2 token bags
│   ├── atmosphere.ts      # EDIT — washes for guestbook / sunlily / tidepool
│   ├── fonts.ts           # TOUCH only if Guestbook needs distinct face mapping notes
│   └── ThemeRegistry.tsx  # VERIFY — normalize already; ensure new ids flow
├── components/
│   ├── OptionsPanel.tsx   # EDIT — 2×3 wrap grid for six palettes
│   └── GardenBackdrop.tsx # VERIFY — already palette-driven via atmosphere
└── app/
    └── page.tsx           # EDIT — wordmark gradient for guestbook (+ vibrant)
```

**Structure Decision**: Single app; extend 014 surfaces only. 016 contract documents the six-palette Options grid and supersedes conflicting 014 contract lines for implementers of this feature.

## Key design decisions (detail in research.md)

1. Ids/labels: `guestbook` / Guestbook, `sunlily` / Sunlily, `tidepool` / Tide Pool.
2. Options Palette: exclusive ToggleButtonGroup with CSS wrap (`flexWrap: wrap`, ~50% width buttons → 2×3) or equivalent grid; smaller `body2` labels; widen Popover slightly if needed (`minWidth` ~300–320) without crowding.
3. Tokens: distinct hue families — Guestbook lime/magenta/cyan on soft cream-lilac; Sunlily apricot/coral/gold on warm cream; Tide Pool seafoam/turquoise on cool mint paper — each with dark variants meeting AA.
4. Atmosphere: dedicated wash/mist per new palette (retro speckles for Guestbook, warm sun glow for Sunlily, aquatic cool wash for Tide Pool).
5. Typography/wordmark: Guestbook → Bricolage + optional gradient; Sunlily/Tide Pool → Zen Maru + solid.
6. Supersede 014 contract “exactly three” / single-row assumptions via 016 contract (leave 014 artifacts historical).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Guestbook (like Vibrant) diverges from Principle V “muted” default | Explicit joyful opt-in aesthetic; user requested fun/90s vibe | Forcing all new palettes to stay as muted as Natural removes the product joy request |
