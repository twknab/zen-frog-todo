# Quickstart: Validate Full-Screen Frog Celebration & Frog Favicon

## Prerequisites

- Repo dependencies installed (`npm install`).
- Dev server running: `npm run dev`.

## Static gates (run first)

```bash
npx tsc --noEmit
npx eslint --max-warnings=0
```

Both must be clean before manual verification (project convention — no automated test suite exists yet).

## Scenario 1 — Full-screen frog celebration

1. Load the dashboard, designate a task as today's frog (if none is set), and check it off via the "Largest Task" checkbox.
2. **Expect**: the celebration animation fills the screen/is clearly dominant and centered — not a small burst near the checkbox.
3. **Expect**: the animation self-clears within a few seconds with no lingering overlay, and the page remains fully interactive immediately after (click something else to confirm).
4. Resize the browser to a narrow mobile width (or use devtools device emulation) and repeat steps 1-3. **Expect**: the celebration still fills the viewport appropriately (no overflow/clipping, no tiny animation lost in a corner).
5. Complete a different, regular (non-frog) task. **Expect**: its celebration is unchanged — small, positioned near the checkbox, exactly as before this feature.
6. Enable OS-level `prefers-reduced-motion`, reload, and complete the frog task again. **Expect**: the existing small `SoftRing` reduced-motion indicator plays (same as it always has), NOT a full-screen animation.

## Scenario 2 — Frog emoji favicon

1. Load the app in a browser tab. **Expect**: the tab's icon is a 🐸 frog emoji, not the previous icon.
2. Bookmark the page or open browser history and locate the entry. **Expect**: the same frog emoji icon appears there too (one consistent icon, not a mismatched fallback).
3. Open browser devtools' Network or Elements panel and confirm the `<head>` now references a generated icon route (from `icon.tsx`) rather than the old static `favicon.ico` (which should no longer exist in `src/app/`).

## Done criteria

Both scenarios pass, `tsc --noEmit` and `eslint --max-warnings=0` are clean, and neither change introduces any network request beyond what the browser already does to fetch the generated icon (no external calls, no new dependencies).
