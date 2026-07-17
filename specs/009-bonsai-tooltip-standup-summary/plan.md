# Implementation Plan: Bonsai Info Tooltip & Standup Summary

**Branch**: `009-bonsai-tooltip-standup-summary` | **Date**: 2026-07-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-bonsai-tooltip-standup-summary/spec.md`

## Summary

Two small, independent UI additions. (1) The static caption under the bonsai tree moves into a tooltip behind an info icon next to the "Bonsai" heading, using the app's existing re-themed MUI `Tooltip` + `IconButton` pattern already used three other places in `page.tsx`/`ExportMenu.tsx`. (2) A new "Standup Summary" `Card`, placed as a sibling right after the existing "Completed" `Card`, renders a **pure, prop-driven derivation** of the data `page.tsx` already holds via `useTasks()` — completed tasks (title + note, oldest-first, under "What I did") and not-yet-completed tasks (title only, under "What's next"). Because it's derived from props already flowing through `page.tsx`'s existing reactive state, it regenerates for free whenever a task is completed — no new store, hook, or localStorage key.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: MUI v9 (zen theme, existing re-themed `Tooltip`), Framer Motion v12 (existing `AnimatePresence`/`motion.div` fade pattern already wrapping the "Completed" card). **No new dependencies.**

**Storage**: Browser `localStorage` via `usePersistentState`, unchanged. The Standup Summary introduces **no new key** — it's a pure derivation over the existing `frog-garden:tasks-v1` (`Task[]`) and `frog-garden:completed-log-v1` (`CompletedLogEntry[]`) data already read by `useTasks()`.

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint --max-warnings=0` clean, then manual verification against `quickstart.md` in the browser preview (including `prefers-reduced-motion` and keyboard/screen-reader checks).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Both derivations (bonsai tooltip content is static; standup summary grouping/sorting) are O(n) over arrays already bounded to a day or a few days' worth of tasks — trivial, no perceptible cost.

**Constraints**: Offline/local-first, zero network calls (Principle III); full keyboard operability + screen-reader labeling, `prefers-reduced-motion` fallback (Principle IV); WCAG AA contrast; MUI re-themed components only, no stock Material look (Principle V); no new dependencies or state layers (Principle VI).

**Scale/Scope**: Single user, single browser profile. One edit to `page.tsx` (bonsai header + tooltip, remove caption) and one new presentational component (`StandupSummary.tsx`) wired into `page.tsx` immediately after the existing Completed section.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — tooltip replaces a distracting caption with an on-demand disclosure; Standup Summary uses calm, non-judgmental empty-state copy (FR-012), no urgency/shame language. |
| II. Subtle Gamification, Not Scoreboards | N/A — no scores, streaks, or stakes introduced. |
| III. Local-First & Private | PASS — both features are pure client-side derivations of existing local data; explicitly no AI/network calls (FR-009); no new persisted key. |
| IV. Accessibility | PASS — tooltip keyboard/focus/Escape dismissal and screen-reader announcement (FR-003/FR-005); Standup Summary uses real list semantics and heading structure (FR-013); both respect `prefers-reduced-motion` (FR-006). |
| V. Design System Discipline | PASS — reuses the already re-themed `Tooltip` (theme.ts:201-208) and the established `Card`/`Stack`/icon-plus-`Typography h2` section-header pattern; no stock Material look introduced. |
| VI. Simplicity & Performance (YAGNI) | PASS — no new dependencies, no new store/hook; Standup Summary is literally two array operations (filter/sort) over data already in memory. |
| VII. Sound Is Calm & Shared | N/A — no audio involved. |

No violations. No complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/009-bonsai-tooltip-standup-summary/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── standup-summary-contract.md   # StandupSummary component + derivation contract
├── checklists/
│   └── requirements.md  # from /speckit-specify, updated by /speckit-clarify
└── tasks.md              # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── StandupSummary.tsx   # NEW — presentational component; takes tasks + completedLog
│                             #       as props, derives "What I did" (completed, oldest-first,
│                             #       title + note) and "What's next" (open, list order,
│                             #       title only); calm empty-state copy when both are empty;
│                             #       semantic list markup + heading levels for FR-013
└── app/
    └── page.tsx               # EDIT — Bonsai header: add info IconButton wrapped in the
                                #        existing re-themed Tooltip pattern (see page.tsx:162);
                                #        remove the caption Typography under BonsaiTree
                                #        (page.tsx:335-337); render <StandupSummary
                                #        tasks={tasks} completedLog={completedLog} /> as a
                                #        sibling Card immediately after the existing
                                #        "Completed" Card (~page.tsx:398-420), following the
                                #        same AnimatePresence/!isFocus visibility convention
```

**Structure Decision**: Single Next.js web app, no new modules beyond one presentational component. Both changes slot into `page.tsx`'s existing structure and existing `useTasks()` data flow — no new hooks, stores, or localStorage keys.

## Key design decisions (detail in research.md)

- **Bonsai tooltip**: wrap a small `IconButton` (e.g. `InfoOutlined`) in MUI `Tooltip`, mirroring the exact pattern already at `page.tsx:162` (dark/light toggle) and `ExportMenu.tsx:59`, so it inherits the theme's tooltip styling, focus/Escape dismissal, and touch behavior for free.
- **Standup Summary is prop-driven, not state-owning**: `StandupSummary` receives `tasks: Task[]` and `completedLog: CompletedLogEntry[]` (both already destructured from `useTasks()` in `Home()`) and derives its two groups internally with plain array `filter`/`sort` — no new `usePersistentState` call, no new hook. Because `page.tsx` already re-renders on every `useTasks()` state change, the summary regenerates automatically on task completion (FR-011) with zero extra plumbing.
- **Ordering**: "What I did" sorted ascending by `completedAt` (oldest-first) — note `completedLog` itself is stored newest-first (prepended in `tasks.ts`), so the derivation must explicitly sort rather than assume input order. "What's next" preserves the existing task-list order (the user's own drag-to-reorder ordering), title only.
- **List semantics**: unlike `CompletedLog`'s bordered-`div`/`Stack` cards (justified there by editable note fields), Standup Summary's bullets are read-only text, so real `<ul>`/`<li>` (or MUI `List`/`ListItem`) markup is used to satisfy FR-013 without extra complexity.
- **Empty states**: both groups empty → single calm placeholder line (FR-012). One group empty, the other not → that group's heading/list is simply omitted rather than shown empty (per the Edge Cases section).

## Complexity Tracking

> No Constitution violations requiring justification.
