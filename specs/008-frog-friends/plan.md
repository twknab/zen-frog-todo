# Implementation Plan: Frog Friends — Reward Critters Around the Bonsai

**Branch**: `008-frog-friends` | **Date**: 2026-07-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-frog-friends/spec.md`

## Summary

Turn completions into an organic, wordless reward: little frogs gather around the base of the bonsai as the person finishes tasks (+1), focus sessions (+2), and their frog (+3), up to a bounded crowd (~20). The frog count is a **pure derivation** from the *existing* bonsai growth-event log — each event gains a `frogs` weight alongside its `leaves` weight — so it reuses one source of truth, auto-clears on "start a new day" (feature 007's `resetBonsai`), and (unlike leaves) ignores idle wilt. Frogs render in **seeded, deterministic** positions clustered around the pot (same computed-once approach as the phyllotaxis leaves), additive by index so the crowd grows without reshuffling. A single **squirrel** appears occasionally via a deterministic rule on the frog count. Everything is decorative (`aria-hidden`), motion is opacity-based with a reduced-motion fallback, no numbers are shown, no new dependencies, no network.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: MUI v9 (zen theme), Framer Motion v12 (existing `appear` opacity pattern). **No new dependencies.**

**Storage**: Browser `localStorage` via `usePersistentState`. Reuses the existing `frog-garden:bonsai-v3` growth-event log — the `GrowthEvent` type gains an additive optional `frogs` field (no key version bump; missing `frogs` reads as `0`).

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint --max-warnings=0` clean, then manual verification against `quickstart.md` in the browser preview (including `prefers-reduced-motion`).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Frog derivation is O(n) over the day's event log on render — trivial. Rendering ≤ ~20 small SVG frog groups + at most one squirrel; no perceptible cost.

**Constraints**: Offline/local-first; honor `prefers-reduced-motion`; decorative critters `aria-hidden`; no numbers displayed; WCAG AA (critters are non-text decoration); SSR-safe (no per-render randomness).

**Scale/Scope**: Single user, single browser profile. One derivation change + constants in `bonsai.ts`, a seeded frog/squirrel layout + render in `BonsaiTree.tsx`, and small wiring edits in `tasks.ts`, `FocusTimer.tsx`, and `page.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — gentle opacity fade-in, bounded crowd, no startling motion; the squirrel is a quiet, rare surprise. |
| II. Subtle Gamification, Not Scoreboards | **PASS** — the reward is a growing crowd of critters, never a number (FR-010); bounded at ~20 (FR-002); recoverable/organic. Textbook Principle II. |
| III. Local-First & Private | PASS — derived from existing local events; no new key, no network, no telemetry (FR-008). |
| IV. Accessibility | PASS — critters are decorative and `aria-hidden`; the bonsai's `role=img` label is unchanged (FR-010); reduced-motion instant fallback, opacity-only so nothing is stranded (FR-009). |
| V. Design System Discipline | PASS — reuses the zen SVG palette + the existing `appear` motion pattern; Framer Motion used sparingly. |
| VI. Simplicity & Performance | PASS — no new deps, no new store; extends one event type and reuses the seeded-layout pattern (YAGNI: no configurable critters/audio). |
| VII. Sound Is Calm & Shared | N/A — no audio (critter sounds explicitly out of scope; any future chime must use the shared `AudioContext`). |

No violations. **Watch item (minor):** extending `GrowthEvent` touches the shared `bonsai-v3` shape; it's additive and back-compat (`frogs ?? 0`), so older stored events and other readers are unaffected.

## Project Structure

### Documentation (this feature)

```text
specs/008-frog-friends/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── bonsai-render-contract.md   # BonsaiTree props + frog/squirrel derivation contract
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── bonsai.ts            # EDIT — GrowthEvent gains `frogs`; frog constants
│                            #        (TASK_FROGS=1, SESSION_FROGS=2, FROG_FROGS=3,
│                            #        MAX_FROGS≈20, BASELINE_FROGS=1); deriveBonsai
│                            #        returns `frogs`; recordGrowth(leaves, frogs);
│                            #        back-compat read (frogs ?? 0)
├── components/
│   ├── BonsaiTree.tsx       # EDIT — seeded FROG_POSITIONS (computed once, like
│   │                        #        LEAF_POSITIONS); render frogs[0..frogs-1]
│   │                        #        additively; deterministic squirrel rule + slot;
│   │                        #        opacity `appear` motion; aria-hidden
│   ├── FocusTimer.tsx       # EDIT — recordGrowth(SESSION_LEAVES, SESSION_FROGS)
│   └── ...
└── app/
    └── page.tsx             # EDIT — pass frogs={bonsai.frogs} to BonsaiTree;
                             #        dev "complete focus session" passes frog weight
    # src/lib/tasks.ts       # EDIT — recordGrowth(leaves, frogs) with frog/task weights
```

**Structure Decision**: Single Next.js web app. The feature is a small extension of the existing bonsai derivation (one new derived field + constants) plus a rendering addition to `BonsaiTree`, wired through the same prop path leaves/blossoms/stage already use. No new modules, stores, or dependencies.

## Key design decisions (detail in research.md)

- **One source of truth**: `GrowthEvent` becomes `{ at, leaves, frogs }`. `recordGrowth(leaves, frogs)` records both at completion time; `deriveBonsai` returns `frogs = min(MAX_FROGS, BASELINE_FROGS + Σ(e.frogs ?? 0))`. Frogs ignore wilt (no idle subtraction), and clear when events clear on a new day.
- **Baseline**: `BASELINE_FROGS = 1` — index 0 is the existing lone frog; earned frogs are indices 1…, so an empty day shows exactly one frog and the crowd only grows.
- **Seeded placement**: a module-level `FROG_POSITIONS` array (length `MAX_FROGS`), computed once with a deterministic pseudo-random scatter clustered around the pot base — identical approach to `LEAF_POSITIONS`. Frog `i` always occupies slot `i`, so growth is additive and stable across re-render/SSR.
- **Squirrel**: a pure `squirrelVisible(frogCount)` rule — a seeded hash of the count gated by a minimum crowd — so it's occasional, deterministic, and never more than one; rendered in its own distinct seeded slot, not counted in the ~20.
- **Component stays a pure render of props**: `BonsaiTree` gains a `frogs: number` prop; the squirrel is derived from it inside the component (pure). `page.tsx` passes `bonsai.frogs`.

## Complexity Tracking

> No Constitution violations requiring justification. The one shared-shape change (`GrowthEvent.frogs`) is additive and back-compat, documented in data-model.md.
