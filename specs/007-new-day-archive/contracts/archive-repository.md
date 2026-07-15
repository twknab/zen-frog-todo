# Contract: Archive Repository (persistence boundary)

The **single seam** all archive persistence flows through (`src/lib/dayArchive.ts`). UI components and the orchestration hook depend on these functions — never on `localStorage` directly for archive data. Swapping the backing store to a DB later means reimplementing only this module's internals.

## Repository surface (v1 — localStorage-backed)

```ts
// Pure read/write over the archive collection.
function readArchive(): ArchivedDay[];
// newest-first; [] if none or on parse failure (never throws to caller)

function appendArchivedDay(day: ArchivedDay): ArchivedDay[];
// prepend `day`, prune to MAX_ARCHIVED_DAYS (drop oldest), persist, return new array

// Reactive read for components (wraps usePersistentState on ARCHIVE_KEY).
function useArchive(): ArchivedDay[];
```

**Guarantees**
- `readArchive()` is total: malformed/absent storage yields `[]`, never an exception.
- `appendArchivedDay()` enforces the retention bound (`MAX_ARCHIVED_DAYS`) atomically with the write.
- Ordering is newest-first and stable.
- No network, ever.

## Orchestration surface

```ts
function useNewDay(): {
  archive: ArchivedDay[];
  startNewDay(): void;   // snapshot (guarded) → append → reset all live stores
};
```

**`startNewDay()` contract**
1. Build a snapshot from current store values (see data-model.md).
2. If `hasContent` (empty-day guard) → `appendArchivedDay(snapshot)`; else skip append.
3. Reset stores, in this order (archive-first is fail-safe): tasks (drop completed / keep unfinished / clear frog) → completed-log `[]` → reflection `""` → `resetBonsai()` → `resetSessions()`.
4. Never throws to the UI; a reset failure leaves the already-appended snapshot intact.

## Export surface

```ts
function buildSingleDayExport(day: ArchivedDay): SingleDayExport;
function buildFullExport(archive: ArchivedDay[], live: FullExport["live"]): FullExport;
function downloadJson(filename: string, data: unknown): void; // Blob + anchor click, revokes URL
function archiveFilename(day: ArchivedDay, sameDateCount: number): string; // date, +HHmm if duplicated
```

**Guarantees**
- `downloadJson` performs a purely client-side download (no upload/fetch).
- Output is `JSON.stringify(data, null, 2)` — valid, pretty-printed JSON (FR-014).
- Every export document carries `schemaVersion` and `exportedAt`.

## Future-DB note

A future SQLite (or similar, on-device) implementation MUST preserve this surface and the `ArchivedDay` / export shapes. Only the bodies of `readArchive`/`appendArchivedDay`/`useArchive` change; callers are untouched. No multi-implementation interface is introduced in v1 (YAGNI) — the module boundary *is* the contract.
