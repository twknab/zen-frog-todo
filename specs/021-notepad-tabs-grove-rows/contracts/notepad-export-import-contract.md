# Contract: Notepad Export & Import

Extends `specs/011-markdown-notepad/contracts/notepad-export-contract.md`.

## Full export (`kind: "full"`)

```ts
type NotepadTab = { id: string; title: string; body: string };
type NotepadDocument = { v: 1; tabs: NotepadTab[]; activeTabId: string };

type FullExport = {
  schemaVersion: 1;
  exportedAt: string;
  kind: "full";
  archive: ArchivedDay[];
  live: { /* unchanged */ };
  notepad: NotepadDocument; // writers emit document; readers also accept legacy string
};
```

### Writer rules

- `buildFullExport` / `useExportEverything` MUST stamp current `NotepadDocument` into `notepad`.
- Single-day export MUST NOT embed notepad.

### Reader rules (notepad-scoped import)

When the notepad import picker receives JSON:

1. Parse; require `kind === "full"` (or clearly detect full-export shape).
2. Extract `notepad`:
   - `string` → one tab `{ title: "My Note", body }`
   - `NotepadDocument` → use its `tabs` (ignore foreign `activeTabId` for local active; generate new ids)
3. **Merge append** into local tabs with new ids.
4. For each imported title, run `uniqueTabTitle` against titles already present (including earlier imports in the same batch).
5. Leave local `activeTabId` unchanged.
6. Do **not** apply `archive` or `live` in this feature.

Legacy missing `notepad` → no-op merge (zero tabs added) or treat as empty My Note — prefer **no-op** if absent/empty string with no tabs to add.

## Plain markdown import

| Rule | Detail |
|---|---|
| Body | Full file text (UTF-8) |
| Title | Basename without extension; empty → **Untitled**; then `uniqueTabTitle` |
| Active | New tab becomes active |
| Failure | Unreadable / binary refusal → calm error, no change |

## `uniqueTabTitle(desired, takenTitles)`

- If `desired` not in `takenTitles`, return `desired`.
- Else return first `desired (Version N)` for N = 2, 3, … not in `takenTitles`.

## Day archive boundary

- `ArchivedDay` gains no notepad fields.
- New day / rollover MUST NOT clear the notepad document.
