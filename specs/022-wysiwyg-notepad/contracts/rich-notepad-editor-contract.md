# Contract: `RichNotepadEditor` + `MarkdownNotepad` mode model

UI-application project — the "contract" is the new component's props/behavior and the change to the notepad's mode model. No network/API surface.

## `MarkdownNotepad` mode model (EDIT)

- `NotepadMode` changes from `"write" | "preview"` to `"write" | "rich"`.
- `"write"` (raw markdown `<TextField>`) is **unchanged**.
- The former `"preview"` branch (static `MarkdownPreview`) is **replaced** by an editable rich branch that renders `RichNotepadEditor`, lazy-loaded via `next/dynamic(() => import("./RichNotepadEditor"), { ssr:false, loading })`, wrapped in an error boundary.
- Both branches bind the **same** controlled `value` (markdown) and `onChange` already threaded from `NotepadShell` → `updateActiveBody`. The toggle stays the existing small control; only the second label changes (e.g. "Write" / "Rich", exact copy an implementation detail — keep it calm and clear).
- Mode remains parent-controlled and shared across tabs (`mode`/`onModeChange`) — unchanged mechanism. Default on open is **`"rich"`** (revised 2026-08-01, US3): the recognizable markdown-free path is the first-class default; raw Markdown mode stays one tap away. Mode labels: "Rich" / "Markdown".

## `RichNotepadEditor` (NEW)

```ts
type RichNotepadEditorProps = {
  value: string;            // markdown (canonical)
  onChange: (markdown: string) => void;
  placeholder?: string;
};
```

Behavior:

1. **Parse-in**: on mount and whenever `value` changes from *outside* (tab switch, raw-mode edit), parse the markdown into the editor's document and render it. This MUST NOT call `onChange` (loading is not an edit — verbatim guard, FR-005a).
2. **Serialize-out**: on genuine user editing in the surface, serialize the document to markdown and call `onChange(markdown)`. Use a sync guard (e.g. track the last markdown set-in and skip echoing it back) to avoid feedback loops between parse-in and serialize-out.
3. **Feature set** (FR-002): headings, bold, italic, strikethrough, ordered/unordered lists, task-list checkboxes, links, inline code, fenced code blocks, blockquotes, horizontal rules. Tables out of scope.
4. **Verbatim** (FR-005a): unsupported/raw markdown is preserved (HTML pass-through enabled); content the user only views (doesn't edit) in rich mode is never rewritten in storage.
5. **Formatting UX (revised 2026-08-01)**: a compact, always-visible formatting toolbar using classic word-processor iconography — bold, italic, strikethrough, H1/H2, bullet list, numbered list, task list, link, quote, inline code — plus markdown input rules (type markdown → live formatting). Toolbar placement is mobile-first: docked bottom of the editing surface at phone widths (reachable above the on-screen keyboard), top at desktop widths; horizontally scrollable, never wrapping; ≥44px touch targets. Active formats show a soft selected state. All controls `aria-label`led, keyboard-reachable, `aria-pressed` where applicable.
6. **Theming** (FR-012): rendered inside a styled container mapping ProseMirror node styles to theme tokens — reads as part of the app, not stock ProseMirror. Focus ring uses theme primary. Reduced-motion honored.
7. **Accessibility** (FR-011): editable region has an accessible name (e.g. `aria-label="Notepad rich editor"`); keyboard-operable; WCAG AA via theme.
8. **No side effects beyond `onChange`**: no network, no persistence of its own, no telemetry (FR-008). Markdown persistence happens through the existing `onChange` path only.

## Lazy-load + fallback contract (FR-009 / FR-010)

- The TipTap bundle MUST NOT be part of the initial dashboard chunk — it loads only when the notepad opens and the rich branch renders (verified in quickstart via devtools Network / build output).
- If the dynamic import or editor init fails, the error boundary renders a quiet message and the user can still read/edit via the raw-markdown mode — notes are never inaccessible.

## Explicitly unchanged (out of contract)

- `src/lib/notepad.ts` storage shape/key, `updateActiveBody`, tabs.
- dayArchive JSON export (notepad field stays markdown).
- `MarkdownPreview.tsx` and the Grove's read-only reflection rendering (FR-014) — still `react-markdown` + `remark-gfm`.
