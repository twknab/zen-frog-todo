# Data Model: Start a New Day — Day Archive & JSON Export

All shapes are plain JSON (string ids, ISO-8601 timestamps, flat arrays) — deliberately serialization-friendly so each entity maps cleanly to a future DB table (see plan.md → Future considerations).

## New persisted state

### DayArchive — key `frog-garden:day-archive-v1`

An array of `ArchivedDay`, ordered **newest-first**, bounded to the most recent `MAX_ARCHIVED_DAYS` (365) entries. Written only via the `dayArchive.ts` repository.

```ts
type DayArchive = ArchivedDay[];
```

### ArchivedDay

A private, on-device snapshot of one closed day.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique id (e.g. `day-<random>`); React key + guarantees distinct entries when two closes share a date. |
| `closedAt` | `string` (ISO-8601) | Exact moment the day was closed. Drives same-date time labelling + filename suffix. |
| `date` | `string` (`YYYY-MM-DD`, local) | Local calendar date of the close. Primary menu label. |
| `completedTasks` | `ArchivedTask[]` | Tasks completed during the day (from the live completed-log). May be empty only if other content existed (see empty-day guard). |
| `reflection` | `string` | The "Close the day" one-liner (may be `""`). |
| `focusSessions` | `number` | Focus sessions completed that day (≥ 0). |
| `bonsai` | `{ leaves: number; stage: string }` | Bonsai growth reached that day: leaf count + stage label at close. |

### ArchivedTask

| Field | Type | Notes |
|---|---|---|
| `title` | `string` | Task title at completion. |
| `note` | `string` | The completion note (may be `""`). |
| `completedAt` | `string` (ISO-8601) | When it was completed. |

**Derivation**: `completedTasks` is built from `CompletedLogEntry[]` (`frog-garden:completed-log-v1`) as `{ title: e.taskTitle, note: e.note, completedAt: e.completedAt }`.

**Bonsai snapshot semantics (I1 resolution)**: `bonsai.leaves`/`bonsai.stage` are the values `deriveBonsai(...)` returns at the moment of close, reflecting growth accumulated since the last "start a new day" (see the bonsai model change below). Because tasks, focus, and bonsai all now span the same close-cycle, the snapshot is internally consistent even when a close spans a calendar midnight.

## Existing state consumed / reset (unchanged schemas)

| Key | Role on close |
|---|---|
| `frog-garden:tasks-v1` | Snapshot: none directly (completions come from the log). **Reset**: drop `completed` tasks, keep unfinished, set `frogTaskId = null`. |
| `frog-garden:completed-log-v1` | Snapshot: source of `completedTasks`. **Reset**: set to `[]`. |
| `frog-garden:reflection-v1` | Snapshot: `reflection`. **Reset**: set to `""`. |
| `frog-garden:focus-stats-v1` | Snapshot: `focusSessions = completedSessions`. **Reset**: `completedSessions = 0` (today-only, per clarification). |
| `frog-garden:bonsai-v3` | Snapshot: derive `leaves` + `stage` (growth accumulated since the last close). **Reset**: `resetBonsai()` (events `[]`, offset 0 → shrub). **Model change (FR-006b):** growth is scoped to the close-cycle, not the calendar day — `deriveBonsai` no longer filters events to "today"; it sums all events currently stored (which are cleared on close), while wilt stays active-hours only. |

## Content guard (empty day)

```
hasContent = completedTasks.length > 0
          || reflection.trim().length > 0
          || focusSessions > 0
          || bonsai.leaves > 0
```

If `hasContent` is false, the close performs the reset but appends **no** `ArchivedDay` (FR-007).

## Export documents

See `contracts/export-format.md` for the authoritative shapes. Summary:

### SingleDayExport (one archived day)

```ts
type SingleDayExport = {
  schemaVersion: 1;
  exportedAt: string;   // ISO-8601
  kind: "day";
  day: ArchivedDay;
};
```

### FullExport ("export everything")

```ts
type FullExport = {
  schemaVersion: 1;
  exportedAt: string;   // ISO-8601
  kind: "full";
  archive: ArchivedDay[];                 // all archived days, newest-first
  live: {                                 // current, not-yet-closed day
    tasks: Task[];
    frogTaskId: string | null;
    completedLog: CompletedLogEntry[];
    reflection: string;
    focusSessions: number;
    bonsai: { leaves: number; stage: string };
  };
};
```

Top-level `archive` vs `live` separation satisfies FR-015. `schemaVersion` gives a future importer a version to branch on.

## Tunable constants (in `src/lib/dayArchive.ts`)

| Constant | Value | Purpose |
|---|---|---|
| `ARCHIVE_KEY` | `"frog-garden:day-archive-v1"` | Storage key for the archive. |
| `MAX_ARCHIVED_DAYS` | `365` | Retention bound; prune oldest beyond this. |
| `SCHEMA_VERSION` | `1` | Stamped on every export document. |
