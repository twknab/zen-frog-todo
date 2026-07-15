# Research: The Growing Bonsai

No `NEEDS CLARIFICATION` markers remained after `/speckit-clarify`. These are the concrete design decisions for the derivation and rendering.

## Decision 1: Growth is a pure derived function, computed on render — no background process

**Decision**: `deriveBonsai(completedCount, focusSessions, lastActivityAt, now) → { stage, wilted }`. Growth "points" = `completedCount * TASK_WEIGHT + focusSessions * SESSION_WEIGHT`; points map to a base stage via thresholds; wilt (below) subtracts stage steps; result is clamped to `[sapling, mature]` (except a true-zero-history user sits at `seedling`). Called during render of the bonsai card.

**Rationale**: The whole feature is a *view* of existing data. A pure function means no timers, no effches, no drift, and trivial reasoning/verification. Re-deriving on each render is negligible for local history sizes.

**Alternatives considered**: A persisted, incrementally-mutated growth number updated on each event — rejected: duplicates the source-of-truth data (completed log / focus count), can desync, and is exactly the kind of parallel counter the spec forbids (FR-002).

## Decision 2: Add ONE small persisted marker — `lastActivityAt` — because focus sessions carry no timestamp

**Decision**: Add a bonsai state object under a new key `frog-garden:bonsai-v1` = `{ lastActivityAt: string | null }`, written (to `now`) whenever a task is completed **or** a focus session completes. Wilt is computed from `lastActivityAt`.

**Rationale**: Wilt needs "time since last growth-affecting activity." The completed-tasks log has per-entry timestamps, but `frog-garden:focus-stats-v1` stores only a count (`{ completedSessions }`) with **no timestamps** — so the log alone can't tell us when the last focus session happened. A single `lastActivityAt` marker, refreshed on either kind of completion, is the minimal state that makes active-window wilt computable. It also makes "regrowable" automatic: any completion resets `lastActivityAt` → idle resets to zero → wilt clears.

**Alternatives considered**:
- Derive last-activity purely from `max(completedLog[].completedAt)` — rejected: ignores focus sessions, so finishing a Pomodoro wouldn't stop wilt.
- Add timestamps to `focus-stats-v1` — rejected: mutates another feature's persisted shape (spec 002) for no benefit over a single marker; larger blast radius.

## Decision 3: Wilt = active-window idle time ÷ 3h, floored at sapling, no per-day cap

**Decision**: A pure helper `activeIdleHours(from, to, windowStart=8, windowEnd=17)` sums only the clock time that falls inside the daily 08:00–17:00 local window between `from` and `to`. `wiltSteps = floor(activeIdleHours / 3)`. Effective stage = `baseStage - wiltSteps`, clamped so it never drops below `sapling`. No cap on `wiltSteps` other than the sapling floor (per clarified option B).

**Rationale**: Matches the clarified spec exactly — a same-day motivator that pauses overnight/off-hours, with a living floor so it's never bare. Computing "active hours between two instants" is a small, testable, deterministic function (iterate day boundaries between `from` and `to`, clamp each day's overlap with the window, sum).

**Alternatives considered**:
- A `setInterval`/tick that decrements over time — rejected: introduces a background process, drift, and battery cost for something derivable from two timestamps on render. Also can't correctly account for time while the tab was closed.
- Counting wall-clock idle 24/7 — rejected in clarify (would wilt overnight → morning-shame, Principle I).

**Note for implementation**: `now`/`new Date()` is read at render time, so the bonsai card MUST be client-rendered (the page is already `"use client"`). Do not compute wilt during SSR (would hydrate stale/ mismatched).

## Decision 4: Hand-authored SVG with five additive stages

**Decision**: One inline `<svg>` in `BonsaiTree.tsx` with elements gated by stage: pot + soil (always), sprout stem (seedling+), small trunk & first leaves (sapling+), fuller canopy (leafy+), blossoms (flowering+), full lush canopy + subtle idle "breathing" shimmer (mature). Colors pull from the zen theme palette.

**Rationale**: Five discrete stages is a tiny, legible SVG; a hand-authored tree gives full control over the calm aesthetic and needs zero dependencies (Principle VI). Additive elements make stage transitions naturally animatable (new elements fade/scale in).

**Alternatives considered**: A graphics/particle library or generative L-system tree — rejected as wildly over-scoped for five stages (YAGNI); heavy dep against Principle VI.

## Decision 5: Framer Motion transitions with a reduced-motion instant fallback

**Decision**: Wrap stage-conditional SVG groups in Framer Motion with soft fade/scale on enter (growth) and gentle fade/muted on exit (wilt). Use `useReducedMotion()` (already used in `Celebration.tsx`) to switch to instant, unanimated stage changes. The `<svg>` gets `role="img"` + an `aria-label` like "Your bonsai is flowering" that updates with the stage (FR-010).

**Rationale**: Consistent with the app's existing motion approach and the constitution's reduced-motion requirement; the aria-label makes the reward perceivable without vision or motion.

**Alternatives considered**: CSS-only transitions — workable, but the app already standardizes organic motion on Framer Motion; staying consistent is simpler than mixing paradigms.

## Starting calibration (tuning values, not spec commitments)

- `TASK_WEIGHT = 1`, `SESSION_WEIGHT = 3` (session > task, FR-003).
- Stage thresholds (points): seedling `0`, sapling `3`, leafy `8`, flowering `16`, mature `28`.
- Active window `08:00–17:00` local; `3h` active-idle per shed step.
- These live as named constants in `src/lib/bonsai.ts` so they are trivial to tune when "softening later" (per the user's note on the wilt clarification).
