# Data Model: Notepad Tabs & Grove Row Reveal

## Entity — `NotepadTab` (new)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable identity (e.g. `tab-` + random). Not derived from title. |
| `title` | `string` | Display name. New tabs default **Untitled**. Blank rename → **Untitled**. Duplicates allowed from manual rename. |
| `body` | `string` | Markdown source. Empty string valid. |

## Entity — `NotepadDocument` (replaces bare string)

| Field | Type | Notes |
|---|---|---|
| `v` | `1` | Document version stamp. |
| `tabs` | `NotepadTab[]` | Ordered; length ≥ 1 always. |
| `activeTabId` | `string` | Must reference a tab in `tabs` after every mutation (repair to `tabs[0].id` if orphaned). |

**Storage**: `frog-garden:notepad-v1` via `usePersistentState` / `writePersistentValue`.

**Migration (read path)**:

| Stored value | Result |
|---|---|
| missing / null | One tab **My Note**, body `""` |
| JSON string (legacy) | One tab **My Note**, body = that string |
| `NotepadDocument` | Validate; ensure ≥1 tab; fix `activeTabId` |

**Lifecycle**: Survives reload and new-day; never written into `ArchivedDay`; auto-persist on edit.

**Validation / invariants**:

- Cannot delete last tab.
- Import merge appends tabs with new ids; titles via `uniqueTabTitle` when conflicting.
- `.md` import creates one tab and sets it active.

## Entity — View mode (unchanged semantics)

| Field | Type | Storage |
|---|---|---|
| mode | `"write" \| "preview"` | React state in shell (session); default `write` when shell opens |

## Entity — Reflection (unchanged)

Independent of notepad tabs.

## Entity — `FullExport` (extended)

| Field | Type | Change |
|---|---|---|
| `schemaVersion` | `1` | Unchanged stamp; additive field shape only |
| `notepad` | `NotepadDocument \| string` | Writers emit `NotepadDocument`; readers accept legacy `string` |
| `archive` / `live` | unchanged | Not modified by notepad import in this feature |

`SingleDayExport` — unchanged (no notepad).

## Derived — Import merge

```text
mergeNotepad(local, incoming) →
  append map(incoming.tabs, t => ({
    ...t,
    id: newId(),
    title: uniqueTabTitle(t.title, local.tabs.map(x => x.title) /* growing */)
  }))
  activeTabId unchanged (local)
```

Legacy incoming string → single tab **My Note** (then Version N if needed) before merge.

## Entity — Grove ribbon item (derived, not persisted)

Ordered list for layout:

1. Optional **Today sand** column (if `todayDrawings.length > 0`)
2. Each `ArchivedDay` column (newest-first from `useArchive()`)

## Entity — Grove reveal state (ephemeral)

| Field | Type | Storage | Notes |
|---|---|---|---|
| `revealedCount` | `number` | React state | How many ribbon items are shown |
| `perRow` | `number` | derived | From container width + item width estimate |
| `groveVisible` | `boolean` | `frog-garden:grove-visible-v1` | Existing; unchanged |

**Transitions**:

- Visit / show Grove → `revealedCount = min(items.length, perRow)`
- Load more → `revealedCount = min(items.length, revealedCount + perRow)`
- Resize → keep `revealedCount`; recompute `perRow` / wrapping
- Hide Grove → next show resets (visit)

## Relationships

```text
page.tsx
  ├── useNotepad() → NotepadDocument
  │     └── NotepadShell
  │           ├── NotepadTabStrip (tabs CRUD / reorder / import)
  │           └── MarkdownNotepad (active tab body + shared mode)
  ├── useExportEverything → FullExport.notepad = document
  └── Grove
        ├── useArchive / today sand → items[]
        ├── revealedCount (ephemeral)
        └── GroveDayDialog / sand lightbox (unchanged)
```
