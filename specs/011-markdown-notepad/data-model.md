# Phase 1 Data Model: Markdown Notepad — Persistent Engineering Notes

## Entity — Engineering Notepad (new)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Body (markdown source) | `string` | `frog-garden:notepad-v1` | Single continuous document. Empty string valid. |
| View mode | `"write" \| "preview"` | React state only | Default `write` when shell opens; not persisted. |
| Shell open | `boolean` | React state only | Owned by `NotepadShell` / page. |

**Lifecycle**:
- Created implicitly on first edit (empty default).
- Survives reload via localStorage.
- Survives new-day / auto-rollover (**not** cleared).
- Never written into `ArchivedDay`.
- Included in full export as top-level `notepad`.

**Validation**: free text; no max enforced in v1 beyond practical UI scroll.

## Entity — Reflection (unchanged)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Body | `string` | `frog-garden:reflection-v1` | Mental-health / close-day token. Plain text UI. |
| Archived copy | `string` | `ArchivedDay.reflection` | Snapshotted on close; cleared live after close. |

Independent of the engineering notepad.

## Entity — `FullExport` (extended)

| Field | Type | Change |
|---|---|---|
| `schemaVersion` | `1` (unchanged stamp) | Keep `SCHEMA_VERSION = 1`; treat missing `notepad` as `""` for forward-compat readers. |
| `archive` | `ArchivedDay[]` | Unchanged (no notepad on days). |
| `live` | object | Unchanged shape for day-live fields including `reflection`. |
| `notepad` | `string` | **NEW** top-level field — persistent eng notepad source. |

`SingleDayExport` — **unchanged** (day only).

## Derived — Preview tree

Not persisted. `MarkdownPreview` renders markdown → React elements via `react-markdown` + GFM + sanitize. Never store HTML.

## Relationships

```text
page.tsx
  ├── reflection string ──► Close-the-day TextField ──► dayArchive on close
  ├── notepad string ────► NotepadShell > MarkdownNotepad
  └── useExportEverything ─► FullExport { archive, live, notepad }

GroveDayDialog ──► day.reflection ──► MarkdownPreview (optional rich render)
```
