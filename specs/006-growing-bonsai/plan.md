# Implementation Plan: The Growing Bonsai

**Branch**: `006-growing-bonsai` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-growing-bonsai/spec.md`

## Summary

Add a single bonsai tree as a new Flow-Mode dashboard card (alongside Sand Mode) whose growth stage is a **pure derived function** of data the app already stores — the completed-tasks log and the focus-session count — advancing through five discrete stages (seedling → sapling → leafy → flowering → mature), bounded at mature. Idle time during a daytime active window (08:00–17:00 local, ~3h → shed one increment) reduces the derived level down to a sapling floor (no per-day cap). The tree renders as a hand-authored SVG with stage-conditional elements, animates growth/wilt transitions with Framer Motion (instant fallback under `prefers-reduced-motion`), and announces its stage as text for screen readers. No new dependencies, no backend, no parallel counter.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged from the codebase.

**Primary Dependencies**: MUI v9 (zen theme in `src/theme/theme.ts`), Framer Motion v12 (already used for the mode-switch layout + celebration). No new dependencies.

**Storage**: Browser `localStorage` via the existing `usePersistentState` hook (`src/lib/storage.ts`). Reads existing keys `frog-garden:completed-log-v1` and `frog-garden:focus-stats-v1`. Adds at most one small key for the wilt clock (see research.md — the "activity marker" decision).

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint --max-warnings=0` clean, then manual verification against `quickstart.md` scenarios in the browser preview.

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Growth derivation is O(n) over the completed-log length on render — trivial for realistic local histories; must not add perceptible latency to task completion (<100ms, per spec 001 SC-005).

**Constraints**: Offline/local-first; must honor `prefers-reduced-motion`; must expose stage as text (a11y); numbers never displayed (Principle II).

**Scale/Scope**: Single user, single browser profile. One new component + one derivation util + a small wiring change in `page.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — organic SVG, slow easing transitions, no urgency. Wilt copy/visuals are constrained to be non-alarming (FR-009). |
| II. Subtle Gamification, Not Scoreboards | **PASS** (under constitution v2.0.0) — no numbers shown (FR-006); reward is the visual tree; growth is bounded (FR-005). The aggressive wilt (option B: no per-day cap, can shed mature→sapling in one fully-idle active day) was flagged CRITICAL by `speckit-analyze` (X1) against the old Principle II. **Resolved 2026-07-02 by amending the constitution to v2.0.0**, which now permits bounded/recoverable/non-shaming stakes. This wilt qualifies: sapling floor (never bare), overnight/off-hours immunity, instant full recovery on one completion, no countdown/alarm/guilt copy. **Carried obligation**: Principle II v2.0.0 requires this mechanic be treated as a hypothesis and **validated by product testing** — soften or remove if real users find it anxiety-inducing rather than motivating. |
| III. Local-First & Private | PASS — derived entirely from local data; at most one new local key; no network. |
| IV. Accessibility | PASS — stage exposed as text (FR-010); reduced-motion fallback (FR-011); palette from the WCAG-AA zen theme. |
| V. Design System Discipline | PASS — uses the existing zen palette/card shell; motion via Framer Motion, not MUI defaults. |
| VI. Simplicity & Performance | PASS — a derived pure function + one SVG; no simulation engine, no new deps (YAGNI). |
| VII. Sound Is Calm & Shared | N/A — this feature adds no audio. (If a future "growth chime" is wanted, it must go through the shared AudioContext per Principle VII — out of scope here.) |

No unjustified violations. The one watch item (wilt aggressiveness) was formally reviewed by `speckit-analyze` (finding X1, CRITICAL vs the old Principle II) and resolved by amending the constitution to v2.0.0, which permits this class of bounded/recoverable stake. The only live obligation it leaves behind is the product-testing validation now required by Principle II.

## Project Structure

### Documentation (this feature)

```text
specs/006-growing-bonsai/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

No `contracts/` directory: this feature exposes no API/CLI/external interface. Its "contract" is the derivation function's stage mapping, captured in data-model.md.

### Source Code (repository root)

```text
src/
├── app/
│   └── page.tsx            # Add the Bonsai card to the Flow-Mode Bento grid (Flow only, not Focus)
├── components/
│   └── BonsaiTree.tsx      # NEW — SVG bonsai, renders a given stage; Framer Motion transitions; a11y label
└── lib/
    ├── bonsai.ts           # NEW — pure growth derivation: (completedLog, focusSessions, now) → stage
    └── storage.ts          # reused as-is (usePersistentState); one small new key for the wilt activity marker
```

**Structure Decision**: Single existing Next.js app; additive only. Derivation logic (`src/lib/bonsai.ts`) is deliberately separated from rendering (`src/components/BonsaiTree.tsx`) so the growth/wilt math is a pure, independently-reasoned-about function — the one part with real logic worth isolating.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

No violations requiring justification. The wilt-aggressiveness watch item is not a complexity violation — it is a product/values calibration, tracked in the Constitution Check above and routed to `speckit-analyze`.
