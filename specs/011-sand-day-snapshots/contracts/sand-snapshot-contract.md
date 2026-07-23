# Contract: Sand day drawings (capture + browse)

## Module: `src/lib/sand.ts`

| API | Behavior |
|---|---|
| `registerSandCanvasHandlers({ peekCapture, wipeOnly })` | SandCanvas registers on mount; `null` on unmount |
| `peekCapture()` | If strokes exist → `SandDrawing` (SVG) without wipe; else `null` |
| `wipeOnly()` | Clear strokes/bitmap; no persistence write |
| `resetSand()` | `peekCapture` → append today (fail-open) → `wipeOnly` → bump token |
| `takeSandDrawingsForArchive()` | Today list + fresh peek if strokes; does not wipe |
| `wipeSandCanvas()` | `wipeOnly` only (post-archive) |
| `useTodaySandDrawings()` | Reactive `SandDrawing[]` for Grove |
| `readTodaySandDrawings()` / `clearTodaySandDrawings()` | Non-reactive read / clear |
| `downloadSandSvg(drawing)` | Download raw SVG file |
| `drawingsFromArchivedDay(day)` | Prefer `sandDrawings`; else legacy `sandSnapshot` |

| Constant | Value |
|---|---|
| `SAND_TODAY_DRAWINGS_KEY` | `'frog-garden:sand-today-drawings-v1'` |
| `MAX_SAND_DRAWINGS_PER_DAY` | `24` |

## Archive: `src/lib/dayArchive.ts`

- `ArchivedDay.sandDrawings?: SandDrawing[]` (preferred)
- `ArchivedDay.sandSnapshot?: string` (legacy JPEG; read-only compat)
- `useNewDay` / `buildRolloverPlan` / `useDailyRollover` attach `sandDrawings`, then clear today + wipe canvas

## UI

| Surface | Behavior |
|---|---|
| Grove ribbon | Today stack + count; archived day stack peek → lightbox |
| `GroveDayDialog` | Bottom horizontal gallery (`SandDrawingGallery`) |
| `SandSnapshotLightbox` | Prev/next, Escape dismiss, reduced-motion, Download SVG |

## Accessibility

- Thumbnail buttons: date-referenced `aria-label`
- Lightbox: labelled dialog; Escape closes; transitions honor `prefers-reduced-motion`
