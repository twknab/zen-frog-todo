# Implementation Plan: The Grove — Archived-Day History

**Branch**: `010-grove-history` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-grove-history/spec.md`

## Summary

Make the existing on-device day archive **visible** as **The Grove**: an inline, collapsible section at the bottom of the page that renders each archived day as a small bonsai "scene" (reflecting that day's stored leaves/stage), laid out as a horizontal, newest-first scrolling ribbon. The Grove is **collapsed by default** so it never competes with the single live bonsai; a one-action toggle reveals/hides it and the choice persists on-device. Selecting a day opens a calm, read-only recap (date, reflection, tasks completed that day). The whole section is hidden in Focus Mode.

This is a **read-only view over data we already persist** (`ArchivedDay` records from `src/lib/dayArchive.ts`). The only new persisted state is a small boolean UI preference. It reuses the existing `BonsaiTree` component for each scene and the existing `useArchive()` / `archiveEntryLabel()` helpers, so there is no new data plumbing — no network, no new dependency.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: MUI v9 (zen theme), Framer Motion v12. No new dependencies (`Collapse`, `Dialog`, `IconButton`, `Card` cover everything).

**Storage**: Browser `localStorage` via the existing `usePersistentState` hook. Reads the existing `frog-garden:day-archive-v1` (through `useArchive()`); adds **one** new key `frog-garden:grove-visible-v1` (boolean, default `false`).

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint` clean, then manual verification against `quickstart.md` (including `prefers-reduced-motion` and keyboard/screen-reader passes).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Rendering is O(n) over the archive (bounded at `MAX_ARCHIVED_DAYS = 365`). Each scene is a small static SVG; the ribbon uses native horizontal scroll. No perceptible latency; smooth, calm scrolling.

**Constraints**: Offline/local-first; no network; honor `prefers-reduced-motion`; keyboard + screen-reader operable; calm, non-judgmental copy (no scoreboards/streaks); WCAG AA in light + dark; MUI re-themed (no default Material look).

**Scale/Scope**: Single user, single browser profile. Two new presentational components, one tiny lib hook, one small shared helper export, and a small edit to `page.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — a quiet look-back, collapsed by default, calm empty-state copy, slow/organic motion; no urgency, no shame. |
| II. Subtle Gamification, Not Scoreboards | PASS — purely organic/visual (a grove of little trees). No streaks, ranks, or "X/Y" totals; any text is a date + gentle stage description, never a score. Single-player, no comparison (FR-016). |
| III. Local-First & Private | PASS — reads the existing on-device archive; the only new state is a local boolean preference. No network, accounts, or telemetry (FR-005). |
| IV. Accessibility | PASS — toggle, ribbon, and day-detail are keyboard-operable and screen-reader labelled; each scene announced by date + stage; all motion has a reduced-motion fallback (FR-013, FR-014). |
| V. Design System Discipline | PASS — reuses the zen-themed card shell and `BonsaiTree`; MUI `Collapse`/`Dialog` re-themed to match; Framer Motion used sparingly (FR-015). |
| VI. Simplicity & Performance | PASS — no new dependency, no new data store beyond one boolean; reuses `useArchive()` + `BonsaiTree`. YAGNI: no virtualization built now (bounded archive; add later only if a real perf issue appears). |
| VII. Sound Is Calm & Shared | N/A — no audio in this feature. |

No violations. **Watch item (perf, not a violation):** a 365-scene ribbon of SVG trees is well within budget; if a future, much larger history ever caused jank, windowing/virtualization is the localized follow-up — deliberately not built now (Principle VI).

## Project Structure

### Documentation (this feature)

```text
specs/010-grove-history/
├── plan.md              # This file
├── research.md          # Phase 0 output — key design decisions
├── data-model.md        # Phase 1 output — entities (read-only archive + new pref)
├── quickstart.md        # Phase 1 output — manual validation scenarios
├── contracts/
│   └── grove-ui-contract.md   # UI contract for the Grove section + day detail
├── checklists/
│   └── requirements.md  # from /speckit-specify + /speckit-clarify
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── grove.ts             # NEW — useGroveVisibility() (persisted show/hide pref,
│   │                        #       key frog-garden:grove-visible-v1, default false)
│   ├── bonsai.ts            # EDIT — export blossomCountForLeaves(leaves) and reuse it
│   │                        #        inside deriveBonsai (DRY; used by grove scenes)
│   └── dayArchive.ts        # unchanged — reuse useArchive() + archiveEntryLabel()
├── components/
│   ├── Grove.tsx            # NEW — bottom section: heading + show/hide toggle +
│   │                        #       Collapse + horizontal newest-first ribbon of
│   │                        #       day scenes (reuses BonsaiTree) + empty state;
│   │                        #       owns "selected day" and opens the detail dialog
│   ├── GroveDayDialog.tsx   # NEW — read-only day recap (date, reflection, completed
│   │                        #       tasks + notes); reduced-motion-aware; a11y focus
│   ├── BonsaiTree.tsx       # unchanged — reused at a small size per scene
│   └── ...                  # existing components unchanged
└── app/
    └── page.tsx             # EDIT — render <Grove/> after the Standup Summary
                             #        section, gated by !isFocus (hidden in Focus Mode)
```

**Structure Decision**: Single Next.js web app (client-only). The Grove is presentational and reads existing state; it introduces one tiny persistence hook for its own visibility preference and a small shared helper to keep blossom derivation DRY. No changes to how days are archived.

## Key design decisions (see research.md for rationale)

- **Reuse `BonsaiTree` per scene** at a small `size`, driven by each `ArchivedDay.bonsai` (`leaves` + `stage`), with blossoms derived via the shared `blossomCountForLeaves`. Scenes are static (`isWilting={false}`) and use the baseline frog only (per-day frog counts aren't archived — Assumptions).
- **Horizontal ribbon** = a themed, horizontally scrollable flex row (`overflow-x: auto`), newest-first (the archive is already stored newest-first). Native scroll for momentum; `prefers-reduced-motion` disables any smooth-scroll/animation.
- **Collapse + persisted preference**: MUI `Collapse` toggled by a header button (`aria-expanded`); state persisted via `useGroveVisibility()` (default collapsed). `Collapse` timeout drops to 0 under reduced motion.
- **Placement & Focus Mode**: rendered inline after the Standup Summary section and gated by `!isFocus`, matching the existing secondary-section convention.
- **Day detail (US3)**: selecting a scene opens a re-themed MUI `Dialog` showing `archiveEntryLabel(day)`, the reflection (omitted gracefully when blank), and the day's completed tasks with notes; dismiss restores focus; the ribbon stays mounted so scroll position is preserved.
- **Empty state**: when the archive is empty, the expanded Grove shows calm placeholder copy inviting the user to close a day (no error, no shame).

## Complexity Tracking

> No Constitution violations requiring justification. No new dependencies, no new architecture — the feature is a read-only view plus one boolean preference.
