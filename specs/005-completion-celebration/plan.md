# Implementation Plan: Task-completion celebration

**Branch**: `005-completion-celebration` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-completion-celebration/spec.md`

## Summary

Play a brief, calm, self-dismissing celebratory animation at the checkbox when a user
marks a task (or the frog) complete — positive reinforcement only, never on un-complete,
never a scoreboard. The mechanism is a global overlay provider exposing an imperative
`celebrate(x, y)` trigger that completion checkboxes call with the checkbox's viewport
coordinates; each call renders a transient burst of muted particles (or a single soft ring
under reduced-motion) that removes itself after ~1s.

**Reconciliation note**: A working implementation already exists
(`src/components/Celebration.tsx`, wired through `src/theme/ThemeRegistry.tsx`,
`src/app/page.tsx`, and `src/components/TaskListCard.tsx`). This plan documents the design
and treats implementation as **verify-and-reconcile against the spec**, not greenfield build.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2, Next.js 16.2 (App Router)

**Primary Dependencies**: MUI 9 (`@mui/material`), Framer Motion 12 (`motion`,
`useReducedMotion`), Emotion 11 (MUI styling engine)

**Storage**: N/A — the celebration is transient UI state only; nothing is persisted
(consistent with constitution Principle III; this feature adds no data at all)

**Testing**: Manual visual validation via `quickstart.md`; the constitution exempts
visual/animation code from strict TDD but requires the reduced-motion fallback to work.
No unit tests are added for the animation itself; the completion **logic** it hooks into is
already covered by existing task tests.

**Target Platform**: Modern evergreen browsers (desktop + mobile web); client-only
(`"use client"`) component

**Project Type**: Single Next.js web app (`src/` App Router)

**Performance Goals**: 60fps burst; no perceptible delay added to the completion action;
rapid successive completions (≥5) stay smooth with no orphaned DOM

**Constraints**: Must respect `prefers-reduced-motion`; overlay must never block pointer
input or cause layout shift / horizontal scroll; muted palette + calm easing only

**Scale/Scope**: Two trigger sites (task-list rows, frog card); one provider + one overlay
component; ~1s ephemeral bursts, capped naturally by user click rate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Calm Technology | Motion is slow/organic; no flashing, no shame/urgency; effect is subtle and fades on its own | PASS — muted palette, easing-based fade-out, self-dismissing (FR-004, FR-007) |
| II. Subtle Gamification, Not Scoreboards | Reward is organic visual feedback with no points/streaks/ranks/comparison; not an engagement/anxiety loop | PASS — purely presentational acknowledgement, no counters, never on un-complete (FR-003, FR-008) |
| III. Local-First & Private | No new data, no network, no telemetry | PASS — zero persistence, no data added (FR-010) |
| IV. Accessibility Is Not Optional | Respects `prefers-reduced-motion`; does not trap focus or block interaction; overlay is decorative | PASS — reduced-motion ring variant; `pointer-events: none` overlay (FR-006, User Story 2) |
| V. Design System Discipline | Motion authored via Framer Motion (not MUI ripple); palette matches theme | PASS — Framer Motion bursts, nature-derived tones (FR-007) |
| VI. Simplicity & Performance (YAGNI) | Simplest mechanism; no over-engineering; stays performant | PASS — one lightweight provider, self-cleaning bursts, no speculative config (FR-009) |

**Result**: All gates PASS. No violations → Complexity Tracking table omitted.

## Project Structure

### Documentation (this feature)

```text
specs/005-completion-celebration/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── celebration-ui-contract.md   # Phase 1 output (UI/behavior contract)
├── checklists/
│   └── requirements.md  # From /speckit-specify
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── page.tsx                 # Frog checkbox → calls celebrate() on complete
├── components/
│   ├── Celebration.tsx          # CelebrationProvider + useCelebration() (the feature)
│   └── TaskListCard.tsx         # Task-row checkbox → calls celebrate() on complete
└── theme/
    └── ThemeRegistry.tsx        # Mounts <CelebrationProvider> around the app
```

**Structure Decision**: Single-project Next.js App Router layout (existing). The feature is
a self-contained client component plus two small call-sites; no new directories, no backend,
no data layer — matches the existing component conventions under `src/components/`.

## Complexity Tracking

No constitution violations — section intentionally omitted.
