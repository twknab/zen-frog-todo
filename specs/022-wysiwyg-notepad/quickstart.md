# Quickstart: Validate WYSIWYG Notepad Editor

## Prerequisites

- `npm install` (adds the new TipTap + tiptap-markdown deps).
- Dev server: `npm run dev`.

## Static gates (run first)

```bash
npx tsc --noEmit
npx eslint --max-warnings=0
```

Both clean before manual verification (project convention — no automated suite).

## Scenario 1 — Rich editing surface (US1)

1. Open the notepad (notepad button), switch to the rich ("Rich") mode.
2. Type a heading (e.g. `# Plan` then space, or via the bubble menu), some **bold** and *italic* text, a bullet list, a numbered list, a checkbox item (`- [ ] `), a link, a `> quote`, inline `code`, and a fenced code block.
3. **Expect**: each formats live as you type (input rules) and is editable — a real caret in a formatted surface, not a static preview. Selecting text shows a small, quiet bubble menu (bold/italic/link/heading).
4. Stop typing; **expect** the content persists with no explicit save.

## Scenario 2 — Markdown stays the raw format (US2)

1. With rich content present, switch to the raw ("Write") mode. **Expect**: the equivalent markdown source, editable.
2. Edit the raw markdown directly (e.g. change a heading level), switch back to rich. **Expect**: the change is reflected — one shared document.
3. Export the app data (Export menu → full backup JSON). **Expect**: the notepad content appears in the JSON as markdown, same field/shape as before this feature (open the JSON and confirm).
4. Paste an existing free-form markdown note (including a construct the editor doesn't model, e.g. a raw HTML snippet or an unusual footnote) into raw mode, view it in rich mode WITHOUT editing, switch back to raw. **Expect**: the raw markdown is unchanged (verbatim preservation — viewing doesn't rewrite it).

## Scenario 3 — Dual-mode workflow (US3)

1. Toggle rich ↔ raw several times with content present. **Expect**: obvious which mode is active; switching never loses content or keystrokes; no disorienting scroll jump.
2. Switch across notepad tabs and back. **Expect**: the active mode is shared across all tabs (matches today's behavior); each tab shows its own content in the current mode.

## Scenario 4 — Lazy-load, fallback, accessibility, motion

1. Reload the dashboard WITHOUT opening the notepad. In devtools Network, **expect** no TipTap/ProseMirror chunk loaded. Open the notepad and enter rich mode; **expect** the editor chunk loads on demand then.
2. Simulate a failed editor load (e.g. block the chunk in devtools, or temporarily throw in the editor init). **Expect**: a quiet "rich editing unavailable" message and the raw-markdown mode still fully usable — notes never inaccessible.
3. Keyboard-only: Tab into the editor, type and format via keyboard/input rules, reach and operate the bubble-menu buttons via keyboard. With a screen reader, **expect** the editor region and controls are labelled/announced.
4. Enable OS reduced-motion; **expect** no distracting editor/menu animations.

## Done criteria

All scenarios pass; `tsc --noEmit` and `eslint --max-warnings=0` clean; the exported JSON still contains the notepad as markdown in the unchanged shape (SC-002); no network requests occur from the editor while editing (confirm in devtools — FR-008); the tiptap chunk is confirmed absent from the initial load and present only after opening the notepad (SC-004).
