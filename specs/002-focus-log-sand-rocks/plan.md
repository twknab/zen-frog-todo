# Implementation Plan: Focus history, completed-tasks log, and Sand Mode rocks

**Branch**: `002-focus-log-sand-rocks` | **Date**: 2026-07-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-focus-log-sand-rocks/spec.md`

## Summary

Four small, independent additions layered onto the existing Frog Garden dashboard (`specs/001-frog-garden`): (1) a correctness fix so completed tasks can't be re-designated the frog, (2) a persisted "Completed" log at the bottom of the dashboard recording every task-completion event with an optional note, (3) a persisted count of naturally-completed focus sessions shown in the Focus card, and (4) drag-and-drop rocks in Sand Mode that raking cannot draw over. All four are client-only, localStorage-backed, and reuse the existing `usePersistentState` hook and zen theme — no new architectural layer is introduced.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — matches the existing codebase, no change.

**Primary Dependencies**: Material UI (MUI) v9 + the project's zen theme (`src/theme/theme.ts`), Web Audio API (native, no library) for the existing chime/rake/ambient sounds — no new dependencies required for this feature.

**Storage**: Browser `localStorage` via the existing `usePersistentState<T>` hook (`src/lib/storage.ts`). New keys: a completed-log array and a focus-session counter; rock placements live in-memory only (see Assumptions in spec.md — matches the existing decision to keep sand *trails* ephemeral too).

**Testing**: No automated test suite exists in this project yet; verification is `tsc --noEmit` + `eslint` as static gates, followed by manual browser verification via the dev server preview (established practice for every prior feature in this codebase).

**Target Platform**: Modern desktop and mobile web browsers, client-rendered only (no backend, no SSR data fetching involved).

**Project Type**: Single Next.js web application (no frontend/backend split — there is no backend).

**Performance Goals**: Sub-100ms perceived latency for task/log interactions, consistent with spec `001-frog-garden`'s SC-005; rock/rake collision checks must not introduce visible lag while dragging.

**Constraints**: Offline-capable, local-first (constitution Principle III) — no network calls introduced by this feature.

**Scale/Scope**: Single-user, single-browser-profile scope (unchanged from spec 001); four small UI/state additions, no new pages or routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS. Completed log is a plain historical record — no streak-loss framing, no red/urgent styling. Rocks are a calm, decorative obstacle, not a scored mechanic. |
| II. Subtle Gamification, Not Scoreboards | PASS, with a design constraint carried into tasks: the focus-session count must be a small, secondary element in the Focus card (e.g. a caption), not a large headline number — matching how streaks are already tucked away. |
| III. Local-First & Private | PASS. All new state is localStorage-backed via the existing hook; nothing leaves the device. |
| IV. Accessibility | PARTIAL — see Complexity Tracking below for the one accepted, justified deviation (rock placement has no keyboard-only path). The Completed log itself (list items, note fields) is fully keyboard- and screen-reader-accessible with no exceptions. |
| V. Design System Discipline | PASS. New UI (Completed log entries, rock shapes) must use the existing zen palette/shape tokens from `src/theme/theme.ts` — no new ad hoc styling system. |
| VI. Simplicity & Performance | PASS. No backend, no new dependencies, no persistence layer beyond the existing hook. |

## Project Structure

### Documentation (this feature)

```text
specs/002-focus-log-sand-rocks/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by this command)
```

No `contracts/` directory: this feature exposes no API, CLI, or external interface — it is purely client-rendered UI within the existing single-page dashboard, already described behaviorally in `spec.md`'s acceptance scenarios.

### Source Code (repository root)

```text
src/
├── app/
│   └── page.tsx                 # Wire new hooks; render Completed log section at the bottom
├── components/
│   ├── FocusTimer.tsx            # Add persisted session-count display (existing component)
│   ├── SandCanvas.tsx            # Add rock placement + rake/rock collision (existing component)
│   ├── TaskListCard.tsx          # Disable/hide 🐸 control for completed tasks (existing component)
│   └── CompletedLog.tsx          # NEW — renders the completed-tasks log with per-entry notes
├── lib/
│   ├── tasks.ts                  # Extend: emit a completed-log entry on task completion
│   ├── storage.ts                # Reused as-is (usePersistentState)
│   ├── sound.ts                  # Reused as-is
│   └── focusStats.ts             # NEW — persisted focus-session counter
```

**Structure Decision**: Single existing Next.js app, no new top-level structure. This feature is implemented entirely inside the existing `src/app`, `src/components`, and `src/lib` directories established by `specs/001-frog-garden`.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Rock drag-and-drop has no keyboard-only placement path (Principle IV) | Sand Mode is a supplementary, decorative feature (not a core task workflow); its entire value is a physical, gestural interaction — matching the existing precedent that freehand raking itself (already shipped) is also pointer/touch-only with no keyboard equivalent. | A fully keyboard-operable spatial placement UI (e.g. grid-based cursor movement to position a rock) would require redesigning Sand Mode's interaction model around a discrete grid, defeating the free-form "zen sandbox" premise, for a feature that is optional polish rather than required functionality. |
