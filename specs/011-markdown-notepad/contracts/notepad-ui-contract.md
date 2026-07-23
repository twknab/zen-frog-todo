# UI Contract: Markdown Notepad

This is a client UI feature; the "contract" is observable behavior and component boundaries, not a network API.

## Component: `MarkdownNotepad` (`src/components/MarkdownNotepad.tsx`)

**Role**: Controlled markdown editor with exclusive write / preview modes for today's daily note.

**Props**:

| Prop | Type | Required | Notes |
|---|---|---|---|
| `value` | `string` | yes | Markdown source |
| `onChange` | `(next: string) => void` | yes | Called on write-mode edits |
| `placeholder` | `string` | no | Calm empty-state hint for write mode |

**Behavior**:

| Element | Contract |
|---|---|
| Mode control | Exclusive Write / Preview control; keyboard-operable; group has an accessible name (e.g. "Note display mode"); announces pressed state. |
| Write mode | Themed multiline text field bound to `value` / `onChange`. Visible when mode is write. |
| Preview mode | `MarkdownPreview` of `value`. Read-only. Empty value → calm empty preview (no error). |
| Mode switch | Preserves `value` exactly. Motion instant under `prefers-reduced-motion`. |
| Default | Mode is write on mount. |

**Must**:
- Not persist mode (FR-018).
- Not call network APIs (FR-011).
- Use theme tokens (FR-015).
- Remain usable when empty (edge case).

**Must not**: introduce a second persisted note; look like stock Material chrome; play non-essential motion under reduced-motion.

## Component: `MarkdownPreview` (`src/components/MarkdownPreview.tsx`)

**Role**: Themed, sanitized rendered markdown.

**Props**: `{ markdown: string }` (and optional `sx` if useful).

**Contract**:
- Renders `renderMarkdownToSafeHtml(markdown)` into a themed container.
- Never injects unsanitized HTML.
- Used by both `MarkdownNotepad` (preview mode) and `GroveDayDialog` (archived note).

## Lib: `renderMarkdownToSafeHtml` (`src/lib/markdown.ts`)

**Contract**: `(markdown: string) => string` — always returns a string safe for `dangerouslySetInnerHTML`. Empty input → empty string (or benign empty paragraph policy documented in implementation).

## Page integration (`src/app/page.tsx`)

- Close-the-day / today's-note card keeps grid area `reflection`.
- Replaces plain `TextField` with `<MarkdownNotepad value={notes} onChange={setNotes} … />`.
- Keeps `<NewDayAction />` in the same card.
- Card remains gated by `!isFocus`.

## Grove integration (`src/components/GroveDayDialog.tsx`)

- When `day.reflection.trim() !== ""`, render heading + `<MarkdownPreview markdown={day.reflection} />` instead of plain Typography text.
- When empty, omit the note block entirely (unchanged graceful omit).

## Archive / export

- No new fields. Live and archived note content continue to flow through `reflection` as documented in `dayArchive.ts` contracts from features 007/010.
