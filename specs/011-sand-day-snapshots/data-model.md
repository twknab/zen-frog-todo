# Phase 1 Data Model: Sand Day Snapshots

Additive extension of the existing day archive plus one live "today" slot. Back-compatible with archived days that predate this feature.

## Extended entity — `ArchivedDay`

Defined in `src/lib/dayArchive.ts`. **New optional field only**; all existing fields unchanged.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | unchanged |
| `closedAt` | `string` (ISO-8601) | unchanged |
| `date` | `string` (`YYYY-MM-DD`) | unchanged |
| `completedTasks` | `ArchivedTask[]` | unchanged |
| `reflection` | `string` | unchanged |
| `focusSessions` | `number` | unchanged |
| `bonsai` | `{ leaves: number; stage: string }` | unchanged |
| **`sandSnapshot`** | `string \| undefined` | **NEW, optional.** JPEG data URL (`data:image/jpeg;base64,…`) of the day's sand keepsake. Absent / `undefined` on older records ⇒ no sand thumbnail. |

**Validation / read tolerance**:

- When reading archive JSON, missing `sandSnapshot` is fine.
- Non-string / empty string ⇒ treat as absent (`undefined`).
- Do not migrate/rewrite old records on load (YAGNI).

**Empty-day guard**: `hasContent` becomes true when any prior condition holds **OR** a sand snapshot will be attached (today key non-null and/or fresh capture available).

## New entity (persisted) — Today's Sand Keepsake

| Attribute | Type | Default | Storage key | Notes |
|---|---|---|---|---|
| `todaySandSnapshot` | `string \| null` | `null` | `frog-garden:sand-today-snapshot-v1` | Latest mid-day capture for the live day. Overwritten on each successful clear-with-strokes. Cleared when the day is archived / rollover completes. |

**Lifecycle**:

```
[draw] → [smooth sand]
            ├─ strokes empty? → no write
            └─ strokes present? → overwrite today key with compact JPEG
[draw] → [start new day / rollover]
            ├─ canvas has strokes? → fresh capture → ArchivedDay.sandSnapshot
            ├─ else today key set? → copy into ArchivedDay.sandSnapshot
            └─ else → omit field
            then clear today key + wipe sand
```

## Derived (not persisted) — Capture parameters

Constants (named in `sand.ts`):

| Constant | Value | Role |
|---|---|---|
| `SAND_SNAPSHOT_MAX_EDGE` | `240` | Longest edge in CSS pixels for offscreen scale |
| `SAND_SNAPSHOT_JPEG_QUALITY` | `0.55` | `toDataURL` quality argument |
| `SAND_SNAPSHOT_MIME` | `'image/jpeg'` | Encoding |

Helper (pure where possible): `captureSandSnapshot(sourceCanvas) => string | null` — returns null if canvas has zero size; composites onto sand-colored background; returns data URL.

## Relationships

- `SandCanvas` **writes** Today's Sand Keepsake on reset-with-strokes; **clears** in-memory strokes after.
- `useNewDay` / `useDailyRollover` **read** today key (+ optional fresh capture coordination) → **write** `ArchivedDay.sandSnapshot` → **clear** today key.
- `Grove` **reads** today key + `useArchive()` → renders Today entry + archived sand thumbs.
- `SandSnapshotLightbox` **reads** a transient `{ src, label }` from Grove UI state (not persisted).

## Export

Existing `SingleDayExport` / `FullExport` wrap `ArchivedDay` / archive arrays — the optional field flows through JSON export automatically. No new export kind required for v1.
