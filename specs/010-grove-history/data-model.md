# Phase 1 Data Model: The Grove — Archived-Day History

The Grove is a **read-only consumer** of existing data plus **one** new local UI preference. It introduces no new archived record type and does not modify existing records.

## Existing entity (reused, read-only) — `ArchivedDay`

Defined in `src/lib/dayArchive.ts`; read reactively via `useArchive()` (newest-first). The Grove uses these fields:

| Field | Type | Grove usage |
|---|---|---|
| `id` | `string` | React key for the scene / dialog identity |
| `closedAt` | `string` (ISO-8601) | Feeds `archiveEntryLabel()` for the date (and time when a date repeats) |
| `date` | `string` (`YYYY-MM-DD`) | Same-date disambiguation count (matches export menu logic) |
| `completedTasks` | `ArchivedTask[]` (`{ title, note, completedAt }`) | Listed in the day-detail dialog (US3) |
| `reflection` | `string` | Shown in the day-detail dialog when non-empty (US3) |
| `focusSessions` | `number` | Not surfaced as a score; may inform detail copy only if calm (optional) |
| `bonsai.leaves` | `number` | Drives the scene's tree fullness + blossom count |
| `bonsai.stage` | `string` (`BonsaiStage`) | Drives the scene silhouette + the scene's accessible name |

**Ordering**: newest-first, as returned by `useArchive()` (writes go through `prependAndPrune`). No re-sorting needed (FR-004).

**Derived (not persisted) — `blossoms`**: computed from `bonsai.leaves` via the shared `blossomCountForLeaves(leaves)` helper (Decision 2), so archived scenes flower consistently with the live tree.

## New entity (persisted) — Grove Visibility Preference

The only new stored state this feature adds.

| Attribute | Type | Default | Storage key | Notes |
|---|---|---|---|---|
| `groveVisible` | `boolean` | `false` (collapsed) | `frog-garden:grove-visible-v1` | Persisted via `usePersistentState`; broadcast keeps instances in sync. Read/written through `useGroveVisibility()` in `src/lib/grove.ts`. |

- **Lifecycle**: set to `true` when the user reveals the Grove, `false` when hidden; survives reloads (FR-010). Absent value ⇒ default `false` (FR-011).
- **Validation**: strictly boolean; any malformed stored value degrades to the default via `usePersistentState`'s tolerant parse.

## Derived view (not persisted) — `Day Scene`

A pure projection of one `ArchivedDay` into `BonsaiTree` props:

```
scene(day) = {
  stage:    day.bonsai.stage,
  leaves:   day.bonsai.leaves,
  blossoms: blossomCountForLeaves(day.bonsai.leaves),
  isWilting: false,          // archived days are static
  size:     <small, e.g. 100>,
  // frogs omitted -> BonsaiTree shows the baseline lone frog
}
label(day) = archiveEntryLabel(day, sameDateCount(day.date))
a11yName(day) = `${label(day)} — ${bonsaiStageLabel(day.bonsai.stage)}`
```

No state transitions; recomputed on render from the (reactive) archive.

## Relationships

- `Grove` **reads many** `ArchivedDay` (via `useArchive()`), **renders one** `Day Scene` per day.
- `Grove` **owns** a transient "selected day" (`ArchivedDay | null`, React state, not persisted) that drives the day-detail dialog.
- `Grove` **reads/writes one** Grove Visibility Preference.
