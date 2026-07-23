# Contract: Sand Snapshot Capture & Browse

UI + persistence contract for feature 011. Complements existing Grove UI contract (`specs/010-grove-history/contracts/grove-ui-contract.md`).

## Capture API (in-process)

### `resetSand()` (existing)

- Remains the public clear signal (token bump).
- Side effect (new): `SandCanvas` may write `frog-garden:sand-today-snapshot-v1` **before** wiping when strokes exist.

### Today's snapshot accessors (`src/lib/sand.ts`)

| Export | Behavior |
|---|---|
| `SAND_TODAY_SNAPSHOT_KEY` | `'frog-garden:sand-today-snapshot-v1'` |
| `useTodaySandSnapshot()` | Reactive `[value, setValue]` or read helper for Grove |
| `readTodaySandSnapshot()` | Non-reactive raw read for rollover (mirrors `readArchive` tolerance) |
| `clearTodaySandSnapshot()` | Sets null after archive |
| `captureSandSnapshot(canvas)` | Offscreen downscale → JPEG data URL; never throws to caller (returns `null` on failure) |

### `ArchivedDay.sandSnapshot`

- Optional string data URL.
- Set only when archiving a day that has a keepsake (fresh or today key).

## Grove browse contract

### Today entry

- **When**: `useTodaySandSnapshot()` is a non-null string.
- **Where**: Same Grove ribbon as archived days (typically leading / distinct from archive list).
- **Label**: `"Today"` (accessible name includes “Today” and that it is a sand drawing).
- **Action**: Activating the sand thumbnail opens the sand lightbox (not the archived-day recap, unless product combines them calmly — prefer dedicated lightbox for the image).

### Archived day with sand

- Day recap dialog MAY show a sand thumbnail when `day.sandSnapshot` is present.
- Thumbnail button/name: e.g. `Sand drawing for {archiveEntryLabel(...)}`.
- Activate → sand lightbox with that day's image + date in title/`alt`.

### Days without sand

- No placeholder gray box, no “you didn’t rake” copy.

## Lightbox contract

| Requirement | Behavior |
|---|---|
| Component | Themed MUI `Dialog` (pattern: `GroveDayDialog` / `NewDayAction`) |
| Open | Controlled by parent (`src` + `label` non-null) |
| Image | `<img src={dataUrl} alt={label} />` — label references date / “Today” |
| Dismiss | Backdrop click, Escape, optional close control; `onClose` clears selection |
| Focus | Dialog focus trap on open; return focus to invoker on close (MUI default) |
| Motion | `transitionDuration={0}` when `useReducedMotion()` is true |
| Chrome | No score UI; calm title only |

## Failure contract

- Capture or `localStorage` write failure → log optional soft console warn at most; **still clear sand / complete new day**.
- Never surface quota errors as blocking modals.
