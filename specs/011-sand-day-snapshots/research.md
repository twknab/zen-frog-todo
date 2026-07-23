# Phase 0 Research: Sand Day Snapshots

All decisions below are constrained by the constitution (calm, local-first, accessible, re-themed MUI, YAGNI) and the locked clarifications in `spec.md`. No `NEEDS CLARIFICATION` items remain.

## Decision 1 — Storage format: vector SVG (crisp + exportable) ⚠️ CRITICAL

**Decision (revised after pixelation feedback)**: Capture the live strokes as a **vector SVG document** (same 5-tine rake geometry as `SandCanvas`), not a downscaled JPEG. Store an array of `SandDrawing` objects (`id`, `capturedAt`, `svg`, `width`, `height`) — one entry per clear — on the live "today" list and on `ArchivedDay.sandDrawings`. Day JSON export carries the raw SVG markup; the lightbox offers **Download SVG**.

**Why not the original 240px JPEG @ 0.55**: It was quota-safe but looked badly pixelated in the lightbox. Rake art is line work — vectors stay sharp at any size and match what the user drew.

**Budget controls**: Soft-cap `MAX_SAND_DRAWINGS_PER_DAY = 24` (drop oldest when appending). Sparse drawings stay small; dense sessions are bounded. Legacy `sandSnapshot` JPEG strings on old archived days remain readable via `drawingsFromArchivedDay`.

**Alternatives considered**:

| Option | Why rejected / deferred |
|---|---|
| Full-resolution PNG `toDataURL()` | Blows past localStorage quota — unacceptable |
| Downscaled JPEG (original Decision 1) | Quota-safe but pixelated in lightbox — replaced |
| IndexedDB for images | New persistence layer — out of scope for v1 (YAGNI) |
| Compact stroke JSON only (render SVG on demand) | Attractive; deferred — storing SVG keeps export trivial and YAGNI for a second codec |

**Failure mode**: If `setItem` throws (`QuotaExceededError`), swallow and continue clear/archive (FR-011). No alarm UI.

## Decision 2 — Capture timing & ownership (sync registry + reset token)

**Decision**: `SandCanvas` registers two sync callbacks with `sand.ts` on mount (cleared on unmount):

1. `peekCapture()` — if strokes exist, return a `SandDrawing` (SVG) **without** wiping; else `null`.
2. `wipeOnly()` — clear strokes/bitmap with **no** persistence write.

Public API:

- `resetSand()` (mid-day button): `peekCapture()` → if non-null, **append** to today's drawings (fail-open) → `wipeOnly()`. Sync (not effect-ordered) so archive reads in the same turn see storage.
- `takeSandDrawingsForArchive()`: today's list + fresh peek when strokes remain.
- After archiving: `clearTodaySandDrawings()` then `wipeSandCanvas()` (`wipeOnly`) — **do not** call a capture-and-save reset, or drawings would be rewritten into the today key after clear.

**Rationale**: Locked clarification #3, plus analysis C1 — `useNewDay` builds the archive in the same synchronous turn as reset; an effect-only capture races and drops fresh drawings. A tiny module registry avoids prop-drilling a canvas ref into `dayArchive` while keeping stroke truth inside `SandCanvas`.

**Alternatives considered**: Effect-only capture on token (rejected: races archive). Imperative React ref from page (more coupling). Persist every stroke continuously — out of scope.

## Decision 3 — Today's drawings list + archive field (additive)

**Decision**:

- Live: `frog-garden:sand-today-drawings-v1` → `SandDrawing[]`, via `usePersistentState` / helpers in `sand.ts`.
- Archived: optional `sandDrawings?: SandDrawing[]` on `ArchivedDay`. Legacy `sandSnapshot?: string` (JPEG) remains readable for old records.

On successful mid-day capture: **append** to today's list (drop oldest past `MAX_SAND_DRAWINGS_PER_DAY`). On `startNewDay` / rollover: archive the full list (+ fresh capture if strokes remain), then clear today's list.

**Rationale**: Users clear sand multiple times in a day — each drawing is a keepsake, not just the last one. Separate today key avoids mutating a fake "live ArchivedDay".

**Alternatives considered**: Overwrite latest only (original) — loses earlier drawings. Storing today inside the archive array as a sentinel — confuses archive semantics.

## Decision 4 — Empty-day guard widens for sand keepsakes

**Decision**: Treat a non-null sand snapshot (today's key or fresh capture) as **content** for the empty-day archive guard, so a sand-only day is still archived and the keepsake is not orphaned.

**Rationale**: Spec assumption / edge case. Without this, a user who only raked and smoothed would lose the keepsake on new day when nothing else was recorded.

**Alternatives considered**: Drop sand-only days — rejects the keepsake purpose. Force users to write a reflection — shame-adjacent / friction.

## Decision 5 — Auto-rollover limitation (document, don't overbuild)

**Decision**: `useDailyRollover` attaches `sandDrawings` from the **today key** when present (raw localStorage read). It cannot capture uncleared in-memory strokes after the tab was destroyed overnight — accepted v1 limitation.

## Decision 6 — Browse UI: Grove stack + day gallery + lightbox

**Decision**:

- **Today** in the Grove ribbon: stacked peek of recent drawings + count; opens lightbox with prev/next.
- **Archived day**: small stack under the bonsai; day dialog shows a **horizontal gallery** at the bottom (UX standard for multi-image keepsakes).
- Lightbox: Escape dismiss, reduced-motion, **Download SVG** when vector markup is available.

## Decision 7 — Visual fidelity of capture

**Decision**: Serialize strokes to SVG with ZEN_COLORS rake geometry on a fixed muted sand fill (`SAND_SNAPSHOT_BACKGROUND`). No badges, watermarks, or UI chrome.

## Decision 8 — Scope guards

- No redesign of rake physics/colors/layout (FR-013).
- No scoreboards / stroke counts (FR-014).
- No IndexedDB migration in v1.
- No live continuous stroke persistence.
