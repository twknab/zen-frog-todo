# Implementation Plan: Mobile-First UX

**Branch**: `019-mobile-first-ux` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-mobile-first-ux/spec.md`

## Summary

Make Frog Garden’s **mobile web** experience first-class on top of current `main` only (no Night Camp). Fix touch-broken frog designation and task reorder, present Options full-screen below the `md` breakpoint, fix Focus Mode xs stacking so work stays primary, and harden shell layout with safe-area + stable viewport height plus ~44px tap targets and calmer phone header chrome.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged. Skim `node_modules/next/dist/docs/` before any viewport/`metadata` API changes.

**Primary Dependencies**: Existing MUI (Dialog, IconButton, ToggleButtonGroup), Framer Motion already in app. **No new packages** for reorder — Pointer Events on the existing drag-handle affordance calling `reorderTasks` from `src/lib/tasks.ts`.

**Storage**: No new keys. Reuse existing tasks / frog / Options preference persistence.

**Testing**: Gate = `tsc --noEmit` + `eslint` + manual pass of `quickstart.md` on phone-sized viewport (DevTools or device).

**Target Platform**: Modern mobile + desktop web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Reorder feedback stays light (no layout thrash); Options open/close honors `prefers-reduced-motion`; no new continuous animations.

**Constraints**: Local-first (III); WCAG AA + keyboard (IV); chrome respects reduced-motion (IV); calm UX (I); MUI re-themed (V); YAGNI — no Night Camp, no native app, no swipe-to-delete, no new DnD library unless pointer approach proves insufficient.

**Scale/Scope**: TaskListCard interactions, OptionsPanel shell switch, page grid/header/shell, theme IconButton hit targets, optional Next viewport export. Docs under `specs/019-mobile-first-ux/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — discoverable controls without urgency; no shame UI; organic reorder feedback only. |
| II. Subtle Gamification | N/A — frog/garden rules unchanged. |
| III. Local-First & Private | PASS — no new storage backend; existing local keys only. |
| IV. Accessibility | PASS — always-visible frog control; keyboard-reachable Options; 44px targets; safe-area; reduced-motion on Options chrome. |
| V. Design System Discipline | PASS — reuse Notepad fullScreen Dialog pattern; theme-level IconButton sizing; no stock Material look. |
| VI. Simplicity & Performance (YAGNI) | PASS — pointer reorder without new deps; breakpoint reuses `md`; Night Camp out of scope. |
| VII. Sound | N/A. |

**Post-design re-check**: Same — full-screen Options only below `md`; desktop Popover retained; Focus xs order frog→timer→bonsai.

## Project Structure

### Documentation (this feature)

```text
specs/019-mobile-first-ux/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mobile-first-ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx          # EDIT — viewport-fit / theme-color if using Next viewport export
│   ├── page.tsx            # EDIT — Focus xs areas; shell dvh + safe-area; compact header on xs
│   └── globals.css         # TOUCH — safe-area helpers only if needed
├── components/
│   ├── TaskListCard.tsx    # EDIT — visible frog; pointer-handle reorder
│   ├── OptionsPanel.tsx    # EDIT — Dialog fullScreen below md; Popover at md+
│   ├── DeleteIncompleteTaskControl.tsx  # EDIT — tap target if needed
│   ├── ExportMenu.tsx      # TOUCH — IconButton target
│   ├── NotepadButton.tsx   # TOUCH — IconButton target
│   └── NotepadShell.tsx    # TOUCH — close control target (optional)
└── theme/
    └── theme.ts            # EDIT — IconButton min touch target defaults
```

**Structure Decision**: Keep logic in existing components; no new mobile framework. Viewport tier = MUI `md`.

## Key design decisions (detail in research.md)

1. Frog toggle: always `opacity: 1` (all viewports).
2. Reorder: Pointer Events on drag handle → call existing `reorderTasks`; retire HTML5 `draggable` as the primary path (or keep as progressive enhancement only if harmless).
3. Options: `useMediaQuery(theme.breakpoints.down('md'))` → `Dialog fullScreen`; else existing `Popover`.
4. Focus xs grid: `"frog" "timer" "bonsai"` when frog shown; `"timer" "bonsai"` otherwise.
5. Shell: `minHeight: 100dvh` (with `100vh` fallback) + `env(safe-area-inset-*)` padding on main.
6. Tap targets: theme `MuiIconButton` min 44×44; compact visual icons OK.
7. Header xs: shorter mode labels (“Flow” / “Focus”) and slightly smaller brand frog mark.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | — | — |
