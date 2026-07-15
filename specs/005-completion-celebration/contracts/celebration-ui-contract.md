# UI / Behavior Contract: Task-completion celebration

This is an application UI feature, so its "contract" is the interaction behavior and the
in-app trigger interface other components rely on — not a network API.

## A. Trigger interface (consumed by completion call-sites)

A celebration is requested imperatively by any component that completes a task.

```
useCelebration(): (x: number, y: number) => void
```

| Aspect | Contract |
|--------|----------|
| Input `x`, `y` | Viewport coordinates (px) where the burst is anchored — the completed checkbox's center. |
| Return | `void`. Fire-and-forget; the caller does not await or manage the animation. |
| Timing | MUST be called synchronously in the checkbox change handler, only when transitioning incomplete→complete. |
| Side effects | Purely visual. MUST NOT alter task state, ordering, storage, or any other data (FR-010). |
| Availability | Provided by an ancestor provider mounted once near the app root; callers obtain it via the hook. |

**Call-site obligations** (task-list rows and frog card):

1. On checkbox change, if `event.target.checked === true`, compute the checkbox's center from
   its bounding rectangle and call the trigger with those coordinates, then perform the normal
   completion toggle.
2. On un-check (`checked === false`), MUST NOT call the trigger (FR-003).

## B. Rendered-behavior contract (what the user observes)

| ID | Guarantee | Traces to |
|----|-----------|-----------|
| C-1 | On user completion, a brief celebratory effect appears anchored at the checkbox. | FR-001, FR-002 |
| C-2 | The effect fully clears itself within ~1s; no residual element or layout shift remains. | FR-004, SC-002 |
| C-3 | Un-completing a task shows no effect. | FR-003, SC-001 |
| C-4 | The completion action is applied immediately; the animation never blocks or delays it. | FR-005, SC-005 |
| C-5 | Under `prefers-reduced-motion`, the effect degrades to a single minimal-motion acknowledgement (no particle spray). | FR-006, SC-003 |
| C-6 | Visuals use the muted theme palette and calm easing; no flashing/loud confetti. | FR-007 |
| C-7 | No numbers, streaks, ranks, comparisons, or guilt/urgency copy appear. | FR-008 |
| C-8 | The overlay never intercepts pointer input and is exposed as decorative (hidden from assistive tech). | FR-006, Principle IV |
| C-9 | Multiple rapid completions each animate independently with no jank and no orphaned elements. | FR-009, SC-004 |

## C. Explicit non-goals

- No sound (FR — see spec Assumptions).
- No trigger for focus-timer completion or reflection notes (those keep existing feedback).
- No user-facing on/off setting in this version.
