# Data Model: Garden Critter & Bonsai Visual Upgrade

No new persistence entities. Visual constants and pure derivation only.

## Constants (`src/lib/bonsai.ts`)

| Name | Previous | New | Notes |
|------|----------|-----|-------|
| `MAX_FROGS` | 20 | **28** | Includes baseline; dial-back knob |
| `BASELINE_FROGS` | 1 | 1 | Unchanged |
| Reward frog/leaf weights | existing | unchanged | FR-014 |
| `blossomCountForLeaves` | leaves≥15 → up to 6 | unchanged API | Still drives canopy reward count |

## Derived (unchanged shapes)

```ts
deriveBonsai(...) => {
  stage, leaves, blossoms, isWilting, frogs
}
```

- `frogs ∈ [BASELINE_FROGS, MAX_FROGS]` — wilt-independent
- `blossoms` — count of canopy frog-fruit slots to show (formerly pink dots)

## Render-only structures (`BonsaiTree.tsx`)

### Ground frog placement

```ts
FROG_POSITIONS: Array<{ x: number; y: number; scale: number }> // length MAX_FROGS
```

- Seeded at module load; index `i` stable; wider x-band + comedy scale range
- Slot 0 = baseline position

### Frog-fruit (canopy)

```ts
// Conceptual — uses existing BLOSSOM_SLOTS indices into LEAF_POSITIONS
FrogFruitSlot = { slotIndex: number; fillTone: ThemeAccentKey }
```

- Count = `blossoms` prop
- Colors from theme-token rotation by slot index
- Same frog path, smaller canopy scale

### Tree presence

- `treeScale = base + (leaves/MAX_LEAVES) * delta` with raised base/delta (research Decision 4)
- Leaf marks: oval/leaf-ish geometry + tone

## Relationships

```text
GrowthEvent[] ──derive──► frogs, leaves, blossoms, isWilting
                              │
                              ▼
                     BonsaiTree props (pure render)
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        ground frogs    frog-fruit         wilted living layer
        + squirrel      (from blossoms)    (pot/trunk/leaves)
```

## Compatibility

- Grove archived days: still pass `leaves` → `blossomCountForLeaves` → `blossoms`; fruit appears when count > 0
- No localStorage key bump
