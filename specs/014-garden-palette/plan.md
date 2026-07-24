# Implementation Plan: Garden Palette Selector

**Branch**: `014-garden-palette` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-garden-palette/spec.md`

## Summary

Add a persisted **Palette** axis (`natural` | `vibrant` | `dusk`, default `natural`) orthogonal to existing light/dark **Appearance**. Theme factory becomes `createZenTheme(mode, palette)` with three full light+dark token sets. An **Options** Popover (settings IconButton) becomes the single home for Palette, Appearance, and Dev — decluttering the header. Natural restores the pre-experiment muted constitution palette; Vibrant ports neon-garden tokens (and optional gradient wordmark); Dusk is a new indigo/violet/lilac/gold night-garden set with moss/green retained for frog identity.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: MUI (ToggleButtonGroup, Popover, IconButton, Switch/FormControlLabel), existing `usePersistentState`, `next/font/google` (Manrope + Zen Maru Gothic + Bricolage Grotesque). No new packages.

**Storage**: localStorage via `usePersistentState` — new key `frog-garden:palette-v1`; reuse `frog-garden:color-mode-v1` and `frog-garden:dev-mode-v1`.

**Testing**: Gate = `tsc --noEmit` + `eslint --max-warnings=0` + manual browser check per `quickstart.md` (six palette×appearance combos, Options a11y, header declutter, persistence).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Theme recreate on palette/mode change should feel immediate (<100ms perceived); no new network requests; fonts already loaded or swapped via `display: "swap"`.

**Constraints**: Local-first only (Principle III); WCAG AA on all six combos (Principle IV); Natural remains default muted look (Principle V); Vibrant is explicit opt-in (constitution-compatibility note — do not amend constitution); Options Popover stays open across control changes; YAGNI — no per-component color overrides beyond theme + wordmark.

**Scale/Scope**: Theme module refactor + ThemeRegistry palette context + new OptionsPanel component + header declutter in `page.tsx` + font loading for dual heading faces.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — Options is opt-in, non-modal Popover; no shame UI; retheme is quiet. |
| II. Subtle Gamification | N/A — no gamification changes. |
| III. Local-First & Private | PASS — palette via localStorage only; no backend/telemetry. |
| IV. Accessibility | PASS — labelled Options entry + ToggleButtonGroups + Dev switch; keyboard; reduced-motion on Popover if animated. |
| V. Design System Discipline | **COMPAT NOTE (not a silent amendment)**: Natural (default) preserves muted nature palette. Vibrant intentionally diverges from “muted” as an **explicit user-chosen** aesthetic mode (documented here + PR). Dusk stays calm (indigo/lilac/gold, soft). MUI remains re-themed, not stock. |
| VI. Simplicity & Performance (YAGNI) | PASS — extend existing theme factory + persistence hook; one Options component; no new deps. |
| VII. Sound | N/A. |

**Post-design re-check**: Same — design keeps Vibrant opt-in, Natural default, local persistence, a11y labels. No constitution file edit required.

## Project Structure

### Documentation (this feature)

```text
specs/014-garden-palette/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── garden-palette-ui-contract.md
├── checklists/
│   ├── requirements.md
│   └── a11y.md            # optional Phase G
└── tasks.md               # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── theme/
│   ├── theme.ts           # EDIT — PaletteId; natural/vibrant/dusk × light/dark;
│   │                        #        createZenTheme(mode, palette); heading font by palette
│   ├── fonts.ts           # EDIT — Manrope body; Zen Maru Gothic (natural/dusk);
│   │                        #        Bricolage Grotesque (vibrant)
│   └── ThemeRegistry.tsx  # EDIT — persist palette; expose useGardenPalette;
│                            #        recreate theme from mode × palette
├── components/
│   └── OptionsPanel.tsx   # NEW — settings IconButton + Popover:
│                            #        Palette / Appearance / Dev controls
└── app/
    └── page.tsx           # EDIT — remove header sun/moon + Dev; mount OptionsPanel;
                             #        wordmark solid for natural/dusk, gradient for vibrant
```

**Structure Decision**: Single Next.js app. Theme owns tokens + factory; ThemeRegistry owns persistence/context; OptionsPanel owns chrome; page wires Dev state into Options and brand treatment.

## Key design decisions (detail in research.md)

- Options = Popover from settings IconButton; hosts Palette + Appearance + Dev.
- `createZenTheme(mode, palette)`; Natural tokens from pre-PR#11 muted set; Vibrant from experiment; Dusk new.
- Fonts: Manrope body always; Zen Maru Gothic headings for Natural/Dusk; Bricolage for Vibrant.
- Gradient wordmark Vibrant-only; Natural/Dusk solid `primary.main` / ink.
- Constitution: document Vibrant opt-in; do not amend Principle V.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Vibrant diverges from Principle V “muted” default | Explicit user aesthetic choice; Natural remains default | Making Vibrant the only theme (already merged experiment) violates constitution default for new users |
