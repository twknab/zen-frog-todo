# Quickstart: Markdown Notepad — Manual Validation

**Feature**: 011-markdown-notepad  
**Prereqs**: `npm install` (after deps swap to `react-markdown` / `remark-gfm` / `rehype-sanitize`). Dev: `npm run dev`.

## Gate commands

```bash
npx tsc --noEmit
npm run lint
```

## Scenarios

### 1. Open full-screen write/preview (US1 / SC-001)

1. From the dashboard header (upper-right), open Notepad.
2. Confirm surface is **full-screen**.
3. In Write mode, enter GFM (heading, task list, table, `code`).
4. Switch to Preview — constructs render calmly.
5. Switch back — raw source unchanged.
6. Close shell; reopen — content still there (auto-persist). Reload — still there; mode defaults to Write.

### 2. Focus Mode (SC-008)

1. Enter Focus Mode.
2. Notepad control still visible/usable.
3. Open notepad, type a line, close — Focus session uninterrupted; note kept.

### 3. Reflection stays separate (US2 / SC-003, SC-007)

1. Close-the-day card still has a **plain reflection** field (not the markdown notepad).
2. Put text in reflection and different text in notepad.
3. Start a new day → reflection clears/archives as today; **notepad content remains**.

### 4. Full export only (US3 / SC-004)

1. With distinctive notepad text, **Export everything**.
2. JSON has top-level `"notepad": "..."` matching the source.
3. Export a single archived day — file has day/`reflection` only; **no** requirement to embed notepad.

### 5. Accessibility + reduced motion (SC-005, SC-006)

1. Keyboard: open notepad, toggle Write/Preview, edit, Escape/close.
2. SR: control and dialog labelled; mode announced.
3. `prefers-reduced-motion` — open/close and mode switch have no decorative motion.

### 6. Safety (FR-009)

1. Paste `<script>alert(1)</script>` and a `javascript:` link in Write.
2. Preview — no script execution; dangerous URLs inert/stripped.
3. Write mode still shows the raw source typed.

### 7. Theme / calm UX

1. Light + dark: shell, editor, preview use zen tokens (not stock MUI).
2. Placeholder is eng-scratchpad tone — not guilt or “close the day” framing.
