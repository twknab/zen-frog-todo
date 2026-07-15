# Contract: Export JSON Format

The stable, serialization-friendly shape of exported files. This is a **data contract** (a future importer/migrator and the eventual DB schema depend on it), so changes bump `schemaVersion`.

## Single-day export

Filename: `frog-garden-<YYYY-MM-DD>.json` (or `frog-garden-<YYYY-MM-DD>-<HHmm>.json` when the date is duplicated in the archive).

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-07-15T09:12:00.000Z",
  "kind": "day",
  "day": {
    "id": "day-a1b2c3d4",
    "closedAt": "2026-07-14T22:05:00.000Z",
    "date": "2026-07-14",
    "completedTasks": [
      { "title": "Reply to Priya", "note": "sent the summary", "completedAt": "2026-07-14T15:30:00.000Z" }
    ],
    "reflection": "A quiet, focused day.",
    "focusSessions": 2,
    "bonsai": { "leaves": 9, "stage": "leafy" }
  }
}
```

## Full export ("export everything")

Filename: `frog-garden-all-<YYYY-MM-DD>.json`.

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-07-15T09:12:00.000Z",
  "kind": "full",
  "archive": [
    { "id": "day-...", "closedAt": "...", "date": "2026-07-14", "completedTasks": [], "reflection": "", "focusSessions": 0, "bonsai": { "leaves": 0, "stage": "shrub" } }
  ],
  "live": {
    "tasks": [ { "id": "seed-2", "title": "Water the plants", "completed": false } ],
    "frogTaskId": null,
    "completedLog": [],
    "reflection": "",
    "focusSessions": 0,
    "bonsai": { "leaves": 0, "stage": "shrub" }
  }
}
```

## Invariants

- **Valid JSON**: pretty-printed with 2-space indent; all strings properly escaped (quotes, emoji, newlines in titles/notes/reflection are safe) — FR-014, edge case "special characters".
- **Top-level separation**: full export keeps `archive` (past) and `live` (current) as distinct keys — FR-015.
- **Self-describing**: every document has `schemaVersion` + `kind` + `exportedAt`.
- **No secrets / no network fields**: purely the user's own local data; nothing added for transport.
- **Ordering**: `archive` is newest-first, matching storage + menu order.
- **Empty states**: a full export with no archived days still produces `"archive": []` and a populated `live` (US3 scenario 3).
