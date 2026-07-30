# Phase 1 Data Model: WYSIWYG Notepad Editor

This feature introduces **no new persisted entity, no new localStorage key, and no export schema change**. It adds an in-memory editing representation over the existing markdown storage.

## Existing persisted entities (unchanged)

### `NotepadTab` / `NotepadDocument` (`src/lib/notepad.ts`)

```ts
type NotepadTab = { id: string; title: string; body: string /* markdown */ };
type NotepadDocument = { v: 1; tabs: NotepadTab[]; activeTabId: string };
```

`body` remains a **markdown string** and stays the canonical form. Stored under `frog-garden:notepad-v1`; included verbatim in the dayArchive full JSON export. This feature reads and writes `body` exactly as the current notepad does (via the existing `updateActiveBody` / controlled `value`+`onChange`) — the value flowing in and out is always markdown.

## New in-memory (non-persisted) representation

### ProseMirror document (inside `RichNotepadEditor`)

The TipTap editor holds a ProseMirror document derived from the tab's markdown. It is **never persisted, never exported** — it exists only while the rich editor is mounted. Lifecycle:

| Trigger | Action |
|---|---|
| Rich mode entered / external `value` (markdown) changes (e.g. tab switch, or an edit made in raw mode) | Parse markdown → set editor content. Guarded so this does **not** fire `onChange` (no rewrite of stored markdown from a load). |
| User edits in the rich surface | Serialize doc → markdown; fire `onChange(markdown)` → existing `updateActiveBody` persists it. |
| Mode switched rich → raw with no rich edits made | Nothing serialized/written — stored markdown untouched (verbatim preservation, FR-005a). |
| Editor unmount (notepad closed / mode left) | ProseMirror doc discarded; markdown remains the record. |

### Editing Mode (UI state)

```ts
type NotepadMode = "write" /* raw markdown */ | "rich" /* WYSIWYG */;
```

Currently `"write" | "preview"`; `"preview"` is renamed to `"rich"` and becomes editable. A single UI state, shared across all tabs (FR-005), owned by `NotepadShell`, defaulting to `"write"` (raw) each time the notepad opens. Not persisted document data.

## Validation / integrity rules

- Markdown `body` is the single source of truth; the ProseMirror doc is always derived from it, never the reverse-of-record.
- `onChange` (which rewrites stored markdown) fires **only** on genuine user edits in rich mode — never on load/parse — protecting untouched notes from normalization churn (FR-005a).
- Markdown constructs the schema doesn't model are passed through / preserved rather than dropped; the raw mode remains the byte-exact escape hatch.
- No change to storage key, document shape (`v: 1`), or export field — verified as part of quickstart (SC-002).
