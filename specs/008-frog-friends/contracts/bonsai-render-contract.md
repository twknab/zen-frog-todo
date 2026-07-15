# Contract: Bonsai Render & Frog Derivation

The UI contract for the frog-friends addition. `BonsaiTree` stays a **pure render of props**; all state derivation lives in `bonsai.ts`.

## Derivation surface (`src/lib/bonsai.ts`)

```ts
// Recording — both weights captured at completion time.
function recordGrowth(leaves: number, frogs: number): void;

// Derivation — frogs added to the existing result.
function deriveBonsai(input: {
  events: GrowthEvent[]; now: Date; idleOffsetHours?: number;
}): {
  stage: BonsaiStage; leaves: number; blossoms: number; isWilting: boolean;
  frogs: number;  // min(MAX_FROGS, BASELINE_FROGS + Σ(e.frogs ?? 0)); no wilt applied
};
```

**Guarantees**
- `frogs ∈ [BASELINE_FROGS, MAX_FROGS]` always.
- `frogs` is independent of `now`/idle (wilt never reduces it).
- Empty event log ⇒ `frogs === BASELINE_FROGS`.
- `recordGrowth` is the only writer of `frogs`; missing stored `frogs` reads as 0.

## Component surface (`src/components/BonsaiTree.tsx`)

```ts
type BonsaiTreeProps = {
  stage: BonsaiStage;
  leaves: number;
  blossoms: number;
  isWilting?: boolean;
  size?: number;
  frogs: number;   // NEW — how many frogs to render (incl. baseline)
};
```

**Rendering guarantees**
- Renders exactly `clamp(frogs, BASELINE_FROGS, MAX_FROGS)` frogs at `FROG_POSITIONS[0..frogs-1]`; slot `i` is fixed (additive, no reshuffle).
- `FROG_POSITIONS` is computed once at module load with no `Math.random` at render → identical on server and client (no hydration mismatch, no flicker).
- Frog/squirrel entrance uses the existing opacity-only `appear` variant; under `prefers-reduced-motion` it is instant; a critter is never left stranded invisible.
- A squirrel renders iff `squirrelVisible(frogs)` — at most one, in a fixed slot distinct from frog slots, not counted in `frogs`.
- All critters live in an `aria-hidden` layer; the `role="img"` + `aria-label` on the bonsai is unchanged. No numeric count is rendered.

## Wiring

- `src/app/page.tsx` passes `frogs={bonsai.frogs}` (from `deriveBonsai`), same path as `leaves`/`blossoms`/`stage`.
- `recordGrowth` callers pass both weights: `tasks.ts` (task/frog), `FocusTimer.tsx` and `page.tsx` dev button (session).
