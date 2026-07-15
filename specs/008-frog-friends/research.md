# Research: Frog Friends — Reward Critters Around the Bonsai

Phase 0 decisions. No external spikes required — the stack, storage, and rendering patterns already exist in the codebase.

## Decision 1 — Frog count as a derivation from the existing event log

**Decision**: Extend `GrowthEvent` (`src/lib/bonsai.ts`) from `{ at, leaves }` to `{ at, leaves, frogs }`. `recordGrowth` takes `(leaves, frogs)` and records both at completion time. The frog count is a pure derivation returned by `deriveBonsai`:

```
frogs = min(MAX_FROGS, BASELINE_FROGS + Σ (e.frogs ?? 0) over current events)
```

**Rationale**: One source of truth. The event log is already day-cycle-scoped and cleared by `resetBonsai()` on "start a new day" (feature 007), so frogs inherit that behavior for free (FR-006). No new store, no parallel counter to keep in sync (Principle VI).

**Alternatives considered**: A separate `frog-garden:frogs-v1` counter — rejected: duplicate state to reset/sync. Deriving frogs from the `leaves` value via a reverse map (5→3, 3→2, 1→1) — rejected: fragile coupling (breaks if two reward types ever share a leaf value); explicit `frogs` weight is clearer and matches the approved approach.

## Decision 2 — Frogs ignore wilt; baseline of one

**Decision**: The frog derivation does **not** subtract idle wilt (unlike leaves). `BASELINE_FROGS = 1` is always present (the existing lone frog = index 0); earned frogs stack on top up to `MAX_FROGS`.

**Rationale**: Frogs mark work actually completed this cycle — they shouldn't vanish because you stepped away (calmer, less punitive; matches the clarified intent). The baseline keeps the scene from ever being critter-empty (clarified 2026-07-15).

**Alternatives considered**: Frogs wilt like leaves — rejected: punitive and the user explicitly wanted them to build up. Baseline 0 (start empty) — rejected in clarification (barer scene).

## Decision 3 — Reward weights & cap (tunable constants)

**Decision**: `TASK_FROGS = 1`, `SESSION_FROGS = 2`, `FROG_FROGS = 3`, `MAX_FROGS = 20`, `BASELINE_FROGS = 1` — all named constants in `bonsai.ts` beside the leaf constants. Leaf weights are unchanged (`TASK_LEAVES=1`, `SESSION_LEAVES=3`, `FROG_LEAVES=5`).

**Rationale**: One-file tuning, consistent with how leaf calibration already lives. Cap of 20 is the calm upper bound (clarified).

## Decision 4 — Seeded, deterministic placement (reuse the leaf pattern)

**Decision**: A module-level `FROG_POSITIONS` array of length `MAX_FROGS`, computed once at load with a deterministic pseudo-random scatter (a stable hash of the index, e.g. `Math.sin(i * k)` fractional parts) placing frogs along a ground band clustered around the pot base, with small per-frog x/y jitter and a slight scale variation for depth. Index 0 is the existing baseline frog position. Frog `i` always renders at slot `i`.

**Rationale**: Mirrors the existing `LEAF_POSITIONS` (golden-angle, computed once) — proven SSR-safe and stable (no per-render `Math.random`, so no hydration mismatch, FR-004). Additive-by-index gives "grows, never reshuffles" for free (FR-005).

**Alternatives considered**: Per-render random placement — rejected (hydration mismatch, flicker, violates FR-004). Even grid — rejected: looks mechanical, not organic.

## Decision 5 — Squirrel: deterministic, occasional, single

**Decision**: A pure helper `squirrelVisible(frogCount): boolean` — true only when `frogCount >= SQUIRREL_MIN` (a small crowd exists) **and** a seeded hash of the count lands (roughly one-in-N counts), so the squirrel pops in and out occasionally as the crowd changes, deterministically for any given count. At most one squirrel, rendered in its own fixed seeded slot distinct from the frog slots (not counted toward `MAX_FROGS`).

**Rationale**: Implements the clarified "appears at certain frog counts (seeded)" model — genuinely occasional yet stable per count (FR-011), never flickering on re-render.

**Alternatives considered**: Always-present above a threshold — rejected (not a surprise). Per-render/time random — rejected (non-deterministic, flicker).

## Decision 6 — Rendering & motion (reuse existing BonsaiTree patterns)

**Decision**: `BonsaiTree` gains a `frogs: number` prop. It renders `FROG_POSITIONS.slice(0, frogs)` as small SVG frog groups (reusing the existing frog shape) inside an `AnimatePresence`, using the existing opacity-only `appear` variant (fade/settle), with the reduced-motion branch already in place. The squirrel renders conditionally from `squirrelVisible(frogs)`. All critters sit in an `aria-hidden` layer; the bonsai's `role=img` + `aria-label` is unchanged.

**Rationale**: Reuses the component's established motion/accessibility patterns (Principles IV/V); opacity-only means a critter is never stranded invisible if rAF pauses (a real bug we hit before with scale animations).

## Decision 7 — Back-compat for the additive `frogs` field

**Decision**: Reads use `e.frogs ?? 0`; no `bonsai-v3` → `v4` key bump. Events written before this feature (possible only for a day already in progress at upgrade time) contribute 0 frogs; the scene simply shows the baseline until the next completion.

**Rationale**: Additive optional field is the least disruptive change; a one-time transient on an in-progress day at upgrade is acceptable and never crashes (Principle VI, graceful upgrade).

**Alternatives considered**: New `bonsai-v4` key with migration — rejected as over-engineered for an additive field.

## Decision 8 — Wiring the three recordGrowth call sites

**Decision**: Update all callers to pass the frog weight alongside the leaf weight: `src/lib/tasks.ts` (`recordGrowth(isFrog ? FROG_LEAVES : TASK_LEAVES, isFrog ? FROG_FROGS : TASK_FROGS)`), `src/components/FocusTimer.tsx` (`recordGrowth(SESSION_LEAVES, SESSION_FROGS)`), and `src/app/page.tsx` dev "complete focus session" (same as FocusTimer).

**Rationale**: Explicit per-event weights (the approved single-source approach). Three small, mechanical edits; the signature change is caught by `tsc` if any site is missed.
