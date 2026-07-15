# Quickstart / Validation: Frog Friends

Manual validation in the browser preview (project gate — no automated suite). Each scenario maps to acceptance criteria in `spec.md`.

## Prerequisites

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
```

Run the dev server via the preview tooling. Dev mode (header switch) lets you grow quickly: "Complete focus session" adds a session; completing tasks/the frog adds their rewards.

## Scenario 1 — Frogs gather with rewards (US1)

1. From a fresh day, note the baseline: **one** frog by the pot.
2. Complete a regular task → **1** more frog appears (2 total).
3. Complete a focus session → **2** more (4 total).
4. Designate a frog task and complete it → **3** more (7 total).
5. **Expect**: frogs cluster around the pot base, each appears with a gentle fade, and no number is shown anywhere. *(FR-001, FR-003, FR-009, FR-010; SC-001)*

## Scenario 2 — Bounded crowd (US1)

1. Keep completing work (Dev "Complete focus session" repeatedly) past ~20 frogs.
2. **Expect**: the crowd stops growing at the cap (~20); the scene stays uncluttered; further rewards add no frogs. *(FR-002; SC-002)*

## Scenario 3 — Stable, additive placement (US1)

1. With several frogs present, reload the page.
2. **Expect**: identical frog arrangement (no reshuffle, no flicker). *(FR-004; SC-004)*
3. Earn one more frog. **Expect**: existing frogs stay put; the new one fills an additional slot. *(FR-005)*

## Scenario 4 — Fresh day resets to baseline (US2)

1. With a crowd of frogs, open the Close-the-day card and **Start a new day** → confirm.
2. **Expect**: the scene returns to the single baseline frog (alongside the bonsai resetting to a shrub). *(FR-006; SC-003)*
3. Leave the app idle (or advance the clock past midnight) without starting a new day. **Expect**: frogs remain — they clear only on a manual new day. *(FR-006, FR-007)*

## Scenario 5 — No wilt for frogs (US1/edge)

1. Grow some frogs, then simulate idle (Dev "Simulate +1h idle") enough to wilt the bonsai's leaves.
2. **Expect**: the bonsai leaves shrink, but the frog crowd is unchanged. *(FR-007)*

## Scenario 6 — Occasional squirrel (US3)

1. Grow the frog crowd through several counts.
2. **Expect**: a single squirrel appears at some counts and not others (occasional), never more than one, entering gently; reloading at the same count shows the same squirrel state. *(FR-011; SC-007)*

## Scenario 7 — Accessibility & reduced motion

1. Inspect the bonsai's accessibility node. **Expect**: the `role="img"` label is unchanged and describes the tree; frogs/squirrel are not announced (decorative, `aria-hidden`). *(FR-010)*
2. Enable `prefers-reduced-motion`. **Expect**: frogs/squirrel appear instantly (no hop/fade) and none are stranded invisible. *(FR-009; SC-006)*
3. Check the scene in light and dark themes for adequate contrast/legibility. *(Principle IV/V)*

## Scenario 8 — No network

1. With DevTools Network open, complete work and start a new day.
2. **Expect**: no network requests attributable to this feature. *(FR-008; SC-005)*

## Done when

- All scenarios pass in the browser preview.
- `tsc --noEmit` and `eslint src --max-warnings=0` clean.
