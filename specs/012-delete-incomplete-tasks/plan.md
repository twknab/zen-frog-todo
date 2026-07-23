# Implementation Plan: Delete Incomplete Tasks

**Branch**: `012-delete-incomplete-tasks` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-delete-incomplete-tasks/spec.md`

## Summary

Allow removing **incomplete** tasks from the live dashboard list via a small muted trash icon on each eligible row. Trash opens a calm confirmation dialog (mirror `NewDayAction`); confirm permanently drops the task from `frog-garden:tasks-v1` and clears `frogTaskId` when that task was the frog. Completed rows never show trash. Do not touch `completedLog`, day archive, or Grove. Local-only, accessible, themed MUI, non-judgmental copy.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js (App Router) — unchanged.

**Primary Dependencies**: MUI (zen theme in `src/theme/theme.ts`), Framer Motion `useReducedMotion` for dialog `transitionDuration`. No new packages — reuse `Dialog` / `IconButton` / `DeleteOutline`.

**Storage**: Existing `usePersistentState` key `frog-garden:tasks-v1` (`{ tasks, frogTaskId }`). No new keys. `frog-garden:completed-log-v1` and archive keys are read-only for this feature (must not mutate).

**Testing**: Project gate = `npx tsc --noEmit` + `npm run lint` clean; manual verification via `quickstart.md` (including reduced-motion and keyboard).

**Target Platform**: Modern desktop + mobile browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Delete is O(n) filter over a small local task list; dialog open/close instantaneous; no perceptible lag.

**Constraints**: Offline/local-first; calm non-shame UI (no alarm-red trash); keyboard + screen-reader; honor `prefers-reduced-motion`; YAGNI — no undo, bulk delete, swipe, or archive deletes.

**Scale/Scope**: Single user. One new store method (`deleteTask`), trash + confirm UI in `TaskListCard` (or small child), wire `onDeleteTask` from `page.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — confirm dialog uses gentle copy (“Remove this task?”); trash is muted `text.secondary`, not shame/alarm red; cancel is first-class. |
| II. Subtle Gamification | PASS — no scoring, streaks, or guilt for deleted tasks; frog clear is quiet housekeeping. |
| III. Local-First & Private | PASS — only mutates existing on-device tasks store; no network/auth/telemetry. |
| IV. Accessibility | PASS — IconButton `aria-label` includes title; dialog labelled; keyboard + Escape; reduced-motion zero-duration transition. |
| V. Design System Discipline | PASS — themed MUI Dialog/IconButton; outlined trash icon; no stock Material look. |
| VI. Simplicity & Performance | PASS — one method + row affordance + dialog; no new persistence layer or undo stack. |
| VII. Sound | N/A — no audio. |

No unjustified violations. Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/012-delete-incomplete-tasks/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── delete-task.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── tasks.ts              # EDIT — add deleteTask(id); ignore completed / missing
├── components/
│   ├── TaskListCard.tsx      # EDIT — trash IconButton on incomplete rows + confirm Dialog
│   └── NewDayAction.tsx      # REFERENCE — calm Dialog + useReducedMotion pattern
├── app/
│   └── page.tsx              # EDIT — pass onDeleteTask={deleteTask} into TaskListCard
└── theme/
    └── theme.ts              # unchanged — reuse muted palette / secondary text
```

**Structure Decision**: Single Next.js app. Extend existing tasks hook and task list card; no new routes or storage modules.

## Complexity Tracking

> Not applicable — no constitution violations requiring justification.
