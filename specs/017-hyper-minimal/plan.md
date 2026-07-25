# Implementation Plan: Hyper Minimal Mode

**Branch**: `017-hyper-minimal` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/017-hyper-minimal/spec.md`

## Summary

Add a persisted **Hyper Minimal** Options toggle (`frog-garden:hyper-minimal-v1`, default `false`) that strips decorative/instructional chrome in Flow and Focus while keeping garden visuals, interactive controls, Options, mode switch, and essential actions. Distribute the preference via `useHyperMinimal` (shared `usePersistentState` hook); hide chrome with a small conditional wrapper. Options panel chrome stays fully usable. When Hyper Minimal is on, also omit empty panels (FR-014) so caption-less blank cards never remain.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: MUI Switch / FormControlLabel (existing Options patterns), `usePersistentState`. No new packages.

**Storage**: localStorage via `usePersistentState` — key `frog-garden:hyper-minimal-v1`.

**Testing**: Gate = `tsc --noEmit` + `eslint --max-warnings=0` + manual checks in `quickstart.md`.

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Toggle feels immediate; no network; minimal re-render via existing persistence broadcast.

**Constraints**: Local-first (III); a11y labels on icon-only controls (IV); calm Options UX (I); YAGNI — no new themes (FR-013); Options must not close on toggle.

**Scale/Scope**: One hook module, one small Chrome helper (optional colocated), OptionsPanel toggle, chrome gates in `page.tsx` + FocusTimer + Grove (and any other caption chrome touched by acceptance).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — opt-in density; no shame/urgency; Options stays gentle Popover. |
| II. Subtle Gamification | PASS — garden/bonsai kept; no scoreboards added. |
| III. Local-First & Private | PASS — localStorage only. |
| IV. Accessibility | PASS — aria-labels retained; Options escapable; keyboard unchanged. |
| V. Design System Discipline | PASS — reuse themed MUI Switch; no stock Material look introduced. |
| VI. Simplicity & Performance (YAGNI) | PASS — hook + conditional chrome; no new deps/themes. |
| VII. Sound | N/A — ambient control remains; no sound changes. |

**Post-design re-check**: Same — design keeps Options usable, a11y labels, local persistence. No constitution edit.

## Project Structure

### Documentation (this feature)

```text
specs/017-hyper-minimal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hyper-minimal-ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── hyperMinimal.ts          # NEW — KEY + useHyperMinimal()
├── components/
│   ├── Chrome.tsx               # NEW — conditional decorative chrome wrapper
│   ├── OptionsPanel.tsx         # EDIT — Hyper Minimal switch
│   ├── FocusTimer.tsx           # EDIT — hide helper captions when on
│   └── Grove.tsx                # EDIT — hide title chrome / empty instructional copy
└── app/
    └── page.tsx                 # EDIT — hide brand/tagline/section title rows
```

## Complexity Tracking

No constitution violations. No extra complexity warranting a table.
