# Quickstart: Sand Day Snapshots

Manual validation guide for feature 011. Gate: `npx tsc --noEmit`, `npx eslint .`, then the scenarios below in the browser preview.

## Prerequisites

```bash
npm install
npm run dev
```

Open the app, ensure Sand Mode is visible (not Focus Mode). Expand **The Grove** if validating browse scenarios.

## Scenario A — Mid-day clear keeps latest only

1. Rake a distinctive shape on the sand.
2. Click **Reset the sand** (smooth control).
3. Expand The Grove → confirm a **Today** sand thumbnail appears and shows that shape (soft/small JPEG is OK).
4. Rake a *different* shape; reset again.
5. Confirm Today still has **one** thumbnail and it matches the *second* drawing (overwrite).

**Expect**: Empty reset does nothing to storage — clear the sand when already empty; Today snapshot unchanged (still the previous keepsake, not replaced by blank).

## Scenario B — Empty canvas does not store blank

1. With a freshly cleared canvas (and optionally after clearing today's snapshot via completing a new day in a clean profile), reset again with no strokes.
2. Confirm no blank/white thumbnail is introduced.

## Scenario C — Start a new day archives sand

1. Rake strokes (or rely on an existing Today snapshot after a mid-day reset).
2. Complete enough of a day that archive would normally run — or sand-only: smooth once so Today has a snapshot, with no tasks/reflection needed if sand-only archive is implemented.
3. **Start a new day** → confirm.
4. Confirm Today snapshot is gone (fresh day) and the newest Grove archived day shows a sand thumbnail / sand section in the day dialog.
5. Reload the page → archived sand thumbnail still present (persisted).

## Scenario D — Lightbox + a11y

1. Tab to a sand thumbnail; activate with Enter/Space.
2. Confirm larger dialog opens; image `alt` / title references the date or “Today”.
3. Press Escape → dialog closes; focus returns to the control.
4. Enable `prefers-reduced-motion` → open/close has no lengthy animation (`transitionDuration` 0).

## Scenario E — Back-compat

1. With pre-feature archive data (days without `sandSnapshot`), open Grove day recap.
2. Confirm days still open normally with no sand UI and no console/storage errors.

## Scenario F — Fail-open (optional)

In DevTools, simulate quota pressure if practical; trigger reset. Sand must still clear; app remains usable.

## Done when

- [ ] A–D pass
- [ ] E passes on old archive shape
- [ ] `tsc --noEmit` and eslint clean
