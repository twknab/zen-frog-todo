# Phase 1 Data Model: Markdown Notepad — Daily Notes

This feature **does not introduce a new persisted entity**. It upgrades how the existing daily reflection string is edited and displayed.

## Existing entity (reused) — Live Daily Note

| Attribute | Type | Storage key | Notes |
|---|---|---|---|
| Note body (markdown source) | `string` | `frog-garden:reflection-v1` | Same key as today's reflection. Bound in `page.tsx` via `usePersistentState`. Cleared on new-day / rollover by `dayArchive` flows. |

- **Validation**: free text; empty string is valid.
- **Lifecycle**: edited live → snapshotted into `ArchivedDay.reflection` on close → live key reset to `""`.

## Existing entity (reused) — `ArchivedDay.reflection`

Defined in `src/lib/dayArchive.ts`:

| Field | Type | Usage after this feature |
|---|---|---|
| `reflection` | `string` | Markdown source for that closed day. Shown in Grove via `MarkdownPreview`. Included in single-day and full exports unchanged. |

No schema migration. Prior plain-text reflections remain valid markdown sources (they preview as paragraphs/plain text).

## Existing entity (reused) — Export payloads

| Payload | Field | Change |
|---|---|---|
| `SingleDayExport.day.reflection` | `string` | None — still populated from archive |
| `FullExport.archive[].reflection` | `string` | None |
| `FullExport.live.reflection` | `string` | None — still the live key value |

## Transient UI state (not persisted) — Notepad View Mode

| Attribute | Type | Default | Storage |
|---|---|---|---|
| `mode` | `"write" \| "preview"` | `"write"` | React `useState` in `MarkdownNotepad` only |

Resets to write on remount/reload (FR-018).

## Derived (not persisted) — Safe HTML preview

```
safeHtml = DOMPurify.sanitize(marked.parse(markdownSource))
```

Computed in `renderMarkdownToSafeHtml` for live preview and Grove; never stored.

## Relationships

- `page.tsx` **owns** the live note string and passes it into `MarkdownNotepad` + day-archive hooks.
- `MarkdownNotepad` **reads/writes** the string via props; **owns** session `mode`.
- `useStartNewDay` / auto-rollover **snapshot** the string onto `ArchivedDay.reflection` then clear the live key.
- `GroveDayDialog` **reads** `day.reflection` and renders via `MarkdownPreview`.
- Export helpers **serialize** the same field already defined in contracts for 007/010.
