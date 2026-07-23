# Contract: `Celebration.tsx` frog-kind rendering

No external/network API — this is the rendering contract for the existing `LottieBurst` component's `"frog"`-kind branch, analogous to prior features' component-prop contracts.

## Behavior contract

1. **Kind branching**: `LottieBurst`'s rendering MUST branch on `item.kind`. `"task"` kind keeps its exact current behavior (absolute positioning at `item.x`/`item.y`, `SIZES.task` = 280×256, `confettiData`). Only `"frog"` kind's rendering changes.

2. **Frog-kind container**: When `item.kind === "frog"`, the rendered wrapper MUST be `position: fixed; inset: 0` (viewport-relative, not positioned via `item.x`/`item.y`), with `display: flex; align-items: center; justify-content: center` so the Lottie animation is centered regardless of viewport size/aspect ratio.

3. **Frog-kind sizing**: The Lottie animation inside that container MUST be sized to fill as much of the viewport as possible without distortion or cropping (e.g. `width: min(90vw, 90vh)` and `height: min(90vw, 90vh)` applied to a square wrapper, or an equivalent `100%`-of-container approach relying on Lottie's default `preserveAspectRatio="xMidYMid meet"`) — MUST NOT stretch the square `ribbonData` asset non-uniformly.

4. **Unchanged**: `aria-hidden` on the outer `CelebrationProvider` overlay `Box`, `pointerEvents: "none"`, the `zIndex` layering, the `onComplete`/`MAX_MS` self-clearing safety net, and the `SoftRing` reduced-motion path are all unchanged by this contract — this is a rendering-only change to one branch of one function.

5. **No new props, no new state**: `LottieBurst` continues to receive the same `{ item, onDone }` props it does today; no new prop is added for "is this frog kind full-screen" — the existing `item.kind === "frog"` check is sufficient and already present in the codebase (it currently selects `ribbonData` vs `confettiData`).

## Non-goals

- No change to which task-completion actions trigger a `"frog"` vs `"task"` celebration (that's `page.tsx`/`TaskListCard.tsx` call-site logic, untouched).
- No change to the reduced-motion (`SoftRing`) rendering path for any kind.
- No new celebration kind introduced.
