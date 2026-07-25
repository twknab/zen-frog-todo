# Quickstart: Mobile-First UX

**Feature**: `019-mobile-first-ux`

## Dev

```bash
npm run dev
```

Open DevTools → device toolbar → iPhone-sized viewport (e.g. 390×844). Prefer touch emulation (hover unavailable).

## Manual checks

1. **Frog (US1)** — Flow Mode, ≥2 incomplete tasks. Frog icons visible without hover. Tap one → becomes frog. Refresh → still frog.
2. **Reorder (US2)** — Drag via handle to new position. Refresh → order persists. Switch to Focus Mode → cannot reorder locked list.
3. **Options (US3)** — At phone width, Options opens full-screen; scroll all sections; change palette or appearance; close; preference stuck. Widen past `md` → Options is Popover again.
4. **Layout (US4)** — Focus Mode with frog: vertical order frog, timer, bonsai. Check notch/home-indicator padding if on a real device. Header usable at 320px width without horizontal page scroll. Icon controls feel comfortably tappable.
5. **Desktop smoke** — At ≥900px: frog still visible, reorder via handle works, Options Popover works, Focus desktop grid unchanged.
6. **Gates** — `npx tsc --noEmit` and `npm run lint` clean.

## Out of scope smoke

Night Camp / night realm must not appear as part of this feature (not on `main` baseline).
