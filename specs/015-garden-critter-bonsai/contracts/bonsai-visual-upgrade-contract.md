# Contract: Bonsai Visual Upgrade (015)

Extends `specs/008-frog-friends/contracts/bonsai-render-contract.md`. Derivation stays in `bonsai.ts`; `BonsaiTree` remains a pure render of props.

## Derivation surface (`src/lib/bonsai.ts`)

```ts
export const MAX_FROGS = 28; // was 20 — dial-back knob

// Unchanged API:
blossomCountForLeaves(leaves: number): number;
deriveBonsai(input): {
  stage, leaves, blossoms, isWilting, frogs
};
```

**Guarantees**
- `frogs ∈ [BASELINE_FROGS, MAX_FROGS]` (now up to 28).
- `blossoms` still means “canopy reward count”; **visual** is frog-fruit, not pink dots.
- Wilt never reduces `frogs` or canopy reward count.

## Component surface (`src/components/BonsaiTree.tsx`)

```ts
type BonsaiTreeProps = {
  stage: BonsaiStage;
  leaves: number;
  blossoms: number; // canopy frog-fruit count
  isWilting?: boolean;
  size?: number;
  frogs?: number;
};
```

**Rendering guarantees**
- Ground frogs: `FROG_POSITIONS[0..frogCount-1]` with wider distribution + larger comedy scales; sticker halo preserved; no `Math.random` at render.
- Canopy: for each of `blossoms` slots, render a small multi-color frog-fruit (shared frog path) instead of pink blossom circles.
- Frog-fruit + ground frogs + squirrel live **outside** the wilt style group (cheerful when tree wilts).
- Leaves: richer oval/leaf-ish marks; trunk/leaves remain under wilt.
- Tree presence: increased `treeScale` range (moderate); scene stays in card/`viewBox`.
- Motion: existing opacity-only `appear`; reduced-motion → instant; never stranded invisible.
- A11y: decorative under parent `role="img"`; no count UI; no new interactive critter targets.

## Dial-back knobs (implementation constants)

| Knob | Location | Intent |
|------|----------|--------|
| `MAX_FROGS` | `bonsai.ts` | Crowd size |
| Frog scale min/max + x/y bands | `BonsaiTree.tsx` `FROG_POSITIONS` | Comedy vs sludge |
| `treeScale` base/delta | `BonsaiTree.tsx` | Bonsai presence |
| Fruit color token list | `BonsaiTree.tsx` | Fun vs quiet |
| Leaf radius / oval ratios | `BonsaiTree.tsx` | Canopy richness |

## Wiring

- `page.tsx` / `Grove.tsx` — unchanged prop names; inherit fruit visual automatically.
- No new persistence keys.
