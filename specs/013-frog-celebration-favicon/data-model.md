# Phase 1 Data Model: Full-Screen Frog Celebration & Frog Favicon

This feature introduces **no data entities, no persisted state, and no localStorage keys**. Both changes are purely presentational.

## Existing concepts this feature reads (unchanged)

### `Celebration` (`src/components/Celebration.tsx`)

```ts
type CelebrationKind = "frog" | "task";
type Celebration = { id: number; x: number; y: number; kind: CelebrationKind };
```

Already exists, already distinguishes "frog" from "task" at creation time (`celebrate(x, y, kind)`, called with `"frog"` specifically from the Largest Task checkbox in `page.tsx:247`). This feature does not change this type, how items are created, or how they're removed (`MAX_MS` safety-net timeout and `onComplete`/`onAnimationComplete` callbacks are unchanged) — it changes only how a `"frog"`-kind item is *rendered* by `LottieBurst` (position/sizing), not its lifecycle or the `x`/`y` fields' meaning for the "task" kind.

Note: for the `"frog"` kind specifically, `x`/`y` become effectively unused by the new rendering path (Decision 1 — the overlay is viewport-fixed, not positioned at a point) but remain present on the `Celebration` object/`celebrate()` signature unchanged, since the "task" kind still needs them and changing the shared type/call signature would be unnecessary churn for a purely presentational change.

## No new entities

Neither the celebration change nor the favicon change stores, derives, or transforms any data. `icon.tsx`'s `ImageResponse` output is a generated image artifact, not application data.
