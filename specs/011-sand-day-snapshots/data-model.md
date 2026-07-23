# Phase 1 Data Model: Sand Day Snapshots

Additive extension of the existing day archive plus a live "today" drawings list. Back-compatible with archived days that predate this feature (including legacy single JPEG `sandSnapshot`).

## Extended entity — `ArchivedDay`

Defined in `src/lib/dayArchive.ts`. **New optional fields only**; all existing fields unchanged.

| Field | Type | Notes |
|---|---|---|
| …existing fields… | | unchanged |
| **`sandDrawings`** | `SandDrawing[] \| undefined` | **NEW, optional.** Vector SVG keepsakes for the day (all mid-day clears + final capture). Absent on older records. |
| **`sandSnapshot`** | `string \| undefined` | **Legacy.** Single JPEG data URL from the first implementation. Still read via `drawingsFromArchivedDay` for old days. |

**Validation / read tolerance**:

- Missing `sandDrawings` / `sandSnapshot` is fine.
- Prefer `sandDrawings` when present; else fall back to legacy `sandSnapshot`.
- Do not migrate/rewrite old records on load (YAGNI).

**Empty-day guard**: `hasContent` is true when any prior condition holds **OR** `sandDrawings.length > 0`.

## Entity — `SandDrawing`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Local id (`sand-…`) |
| `capturedAt` | `string` (ISO-8601) | Capture moment |
| `svg` | `string` | Full SVG document (export/download as-is) |
| `width` / `height` | `number` | CSS-pixel size at capture (viewBox) |

## New entity (persisted) — Today's Sand Drawings

| Attribute | Type | Default | Storage key | Notes |
|---|---|---|---|---|
| `todaySandDrawings` | `SandDrawing[]` | `[]` | `frog-garden:sand-today-drawings-v1` | Append on each mid-day clear-with-strokes. Soft-capped at `MAX_SAND_DRAWINGS_PER_DAY` (24). Cleared when the day is archived / rollover completes. |

**Lifecycle**:

```
[draw] → [smooth sand]
            ├─ strokes empty? → no write
            └─ strokes present? → append SVG SandDrawing to today list
[draw] → [start new day / rollover]
            ├─ take today list + fresh capture if strokes remain
            ├─ attach as ArchivedDay.sandDrawings (omit if empty)
            └─ clear today list + wipe sand
```

## Derived helpers

| Helper | Role |
|---|---|
| `strokesToSvg` / `captureSandDrawingFromStrokes` | Vectorize in-memory strokes |
| `sandSvgDataUrl` | `<img src>` for SVG markup |
| `drawingsFromArchivedDay` | Normalize `sandDrawings` + legacy JPEG |
| `downloadSandSvg` | Browser download of raw SVG |
| `takeSandDrawingsForArchive` | Today list + optional fresh peek |
| `useTodaySandDrawings` | Reactive Grove read |

## Export

`SingleDayExport` / `FullExport` wrap `ArchivedDay` — `sandDrawings[].svg` flows through JSON automatically. Lightbox also offers per-drawing SVG download.
