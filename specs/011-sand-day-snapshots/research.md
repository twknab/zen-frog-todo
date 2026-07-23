# Phase 0 Research: Sand Day Snapshots

All decisions below are constrained by the constitution (calm, local-first, accessible, re-themed MUI, YAGNI) and the locked clarifications in `spec.md`. No `NEEDS CLARIFICATION` items remain.

## Decision 1 — Storage format: downscaled JPEG (quota-safe) ⚠️ CRITICAL

**Decision**: Before persisting, draw the live canvas onto an offscreen canvas scaled so the **longest edge is 240px**, then encode with `canvas.toDataURL('image/jpeg', 0.55)`. Store the resulting `data:image/jpeg;base64,…` string. Do **not** store full-resolution PNG.

**Budget math** (order-of-magnitude, base64 ≈ 4/3 of binary):

| Scenario | Approx size / day | × 365 days |
|---|---|---|
| Full HD PNG data URL (naive) | 0.5–2+ MB | **hundreds of MB** — exceeds quota |
| JPEG 240px edge @ q=0.55 | ~4–12 KB | **~1.5–4.5 MB** — fits beside tasks/archive in a typical 5–10 MB quota |
| JPEG 240px @ q=0.8 | ~8–20 KB | ~3–7 MB — tighter, less headroom |

**Rationale**: Constitution Principle III + `MAX_ARCHIVED_DAYS = 365` make full-size PNGs unsafe. Thumbnails + a modest lightbox do not need retina originals. JPEG at moderate quality is lossy but adequate for rake-line art on a soft sand background; 240px is enough for Grove thumbs and a small dialog. Prefer leaving headroom for tasks, reflections, and bonsai events over maximizing image fidelity (Principle VI).

**Alternatives considered**:

| Option | Why rejected / deferred |
|---|---|
| Full-resolution PNG `toDataURL()` | Blows past localStorage quota within days/weeks — unacceptable |
| WebP data URL | Slightly smaller, but JPEG is universally supported on canvas export without feature detection; YAGNI |
| IndexedDB for images | Better for large blobs, but new persistence layer + migration path — out of scope for v1 (YAGNI); revisit only if quota pressure appears in real use |
| Tighter snapshot retention (e.g. keep sand only 30 days) while archive stays 365 | Works, but two retention clocks are more complex UX/code; compact JPEG makes dual retention unnecessary |
| Vector stroke replay instead of raster | Would need stroke persistence schema + renderer versioning; larger product scope than "snapshot" |

**Failure mode**: If `setItem` throws (`QuotaExceededError`), swallow and continue clear/archive (FR-011). No alarm UI.

## Decision 2 — Capture timing & ownership (sync registry + reset token)

**Decision**: `SandCanvas` registers two sync callbacks with `sand.ts` on mount (cleared on unmount):

1. `peekCapture()` — if strokes exist, return downscaled JPEG **without** wiping; else `null`.
2. `wipeOnly()` — clear strokes/bitmap with **no** snapshot write.

Public API:

- `resetSand()` (mid-day button): `peekCapture()` → if non-null, write today key (fail-open) → `wipeOnly()`. Prefer invoking this **synchronously** from the reset helper (not only in a post-paint effect) so storage is updated before any subsequent archive read in the same turn. A token bump may still notify other listeners, but capture MUST NOT depend on `useEffect` ordering for correctness.
- `takeSandSnapshotForArchive()`: return `peekCapture() ?? readTodaySandSnapshot()` (fresh preferred).
- After archiving: `clearTodaySandSnapshot()` then `wipeSandCanvas()` (`wipeOnly`) — **do not** call a capture-and-save reset, or the keepsake would be rewritten into the today key after clear.

**Rationale**: Locked clarification #3, plus analysis C1 — `useNewDay` builds the archive in the same synchronous turn as reset; an effect-only capture races and drops fresh drawings. A tiny module registry avoids prop-drilling a canvas ref into `dayArchive` while keeping stroke truth inside `SandCanvas`.

**Alternatives considered**: Effect-only capture on token (rejected: races archive). Imperative React ref from page (more coupling). Persist every stroke continuously — out of scope.

## Decision 3 — Today's snapshot key + archive field (additive)

**Decision**:

- Live: `frog-garden:sand-today-snapshot-v1` → `string | null` (data URL or null), via `usePersistentState` / helpers in `sand.ts`.
- Archived: optional `sandSnapshot?: string` on `ArchivedDay` (same pattern as additive optional fields elsewhere — absent on old days ⇒ treat as no keepsake).

On successful mid-day capture: overwrite today's key. On `startNewDay` / rollover archive build: set `sandSnapshot` from fresh capture if strokes exist at wipe time, else from today's key if non-null; then clear today's key. Old archived days without the field remain valid (`day.sandSnapshot ?? undefined`).

**Rationale**: Matches locked clarifications #1–#2 and back-compat with pre-feature archives. Separate today key avoids mutating a fake "live ArchivedDay" and keeps Grove able to show Today before close.

**Alternatives considered**: Storing today inside the archive array as a sentinel — confuses newest-first archive semantics and export. Always requiring archive on every clear — wrong product (mid-day smooth ≠ close the day).

## Decision 4 — Empty-day guard widens for sand keepsakes

**Decision**: Treat a non-null sand snapshot (today's key or fresh capture) as **content** for the empty-day archive guard, so a sand-only day is still archived and the keepsake is not orphaned.

**Rationale**: Spec assumption / edge case. Without this, a user who only raked and smoothed would lose the keepsake on new day when nothing else was recorded.

**Alternatives considered**: Drop sand-only days — rejects the keepsake purpose. Force users to write a reflection — shame-adjacent / friction.

## Decision 5 — Auto-rollover limitation (document, don't overbuild)

**Decision**: `useDailyRollover` attaches `sandSnapshot` from the **today key** when present (raw localStorage read, same hydration-safe pattern as other stores). It cannot capture uncleared in-memory strokes after the tab was destroyed overnight — accepted v1 limitation. Optionally bump sand reset on rollover for consistency if the canvas is still mounted same session (date change without reload is rare); primarily clear the today key after archive.

**Rationale**: Spec assumption; stroke persistence would be a different feature.

## Decision 6 — Browse UI: extend The Grove + lightbox Dialog

**Decision**: Extend `Grove` / `GroveDayDialog` (plus a small `SandSnapshotLightbox` if cleaner):

- When today's snapshot exists, show a **Today** entry in the ribbon (label "Today") with sand thumbnail — not a bonsai-from-archive fake day.
- Archived days with `sandSnapshot` show a small thumbnail affordance (in the day dialog and/or as a secondary control on the scene). Activating opens a themed MUI `Dialog` with the larger image (`alt` includes the date), `transitionDuration={0}` under `useReducedMotion()`, dismiss via Escape/`onClose`, focus return to invoker.

**Rationale**: Spec FR-008–FR-010; one history surface (YAGNI); reuse Dialog a11y behavior from `GroveDayDialog` / `NewDayAction`.

**Alternatives considered**: Separate "Sand journal" section — splits history. Inline expand in ribbon — janky scroll. Full-screen route — heavier.

## Decision 7 — Visual fidelity of capture

**Decision**: Capture the canvas bitmap as drawn (ZEN_COLORS rake strokes on transparent/cleared buffer over the sand panel's background). Prefer drawing onto an offscreen canvas whose background matches the sand surface color used in UI (`action.hover` equivalent hex from theme or a fixed muted sand tone already used visually) so JPEG doesn't black-fill transparency. No badges, watermarks, or UI chrome in the image.

**Rationale**: Spec — theme-consistent; JPEG cannot store alpha well, so composite onto sand-colored background before encode.

## Decision 8 — Scope guards

- No redesign of rake physics/colors/layout (FR-013).
- No scoreboards / stroke counts (FR-014).
- No IndexedDB migration in v1.
- No live continuous stroke persistence.
- No separate snapshot retention clock (Decision 1 makes it unnecessary).
