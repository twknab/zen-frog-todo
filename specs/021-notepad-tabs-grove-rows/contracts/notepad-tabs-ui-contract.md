# UI Contract: Notepad Tabs

Client UI — observable behavior for tabbed engineering notepad. Extends `specs/011-markdown-notepad/contracts/notepad-ui-contract.md`.

## Component: `NotepadShell` (extended)

| Contract | Detail |
|---|---|
| Props | `open`, `onClose`, document value + change API (or granular tab mutators), not a bare string alone |
| Chrome | **Tab strip is the top header**; no redundant “Notepad” title/icon. Import and close remain anchored at the right; `MarkdownNotepad` follows below. |
| Persist | Close never discards; no Save/Discard |
| Motion | `useReducedMotion` → instant dialog transition |

## Component: `NotepadTabStrip` (new)

| Affordance | Contract |
|---|---|
| Tab list | Shows all tabs in order; active tab visually distinct; `role="tablist"` / `role="tab"` (or equivalent labelled pattern) |
| Switch | Activate tab → `activeTabId` updates; body below follows |
| Add | Creates **Untitled** empty tab, selects it |
| Rename | Inline edit; commit Enter/blur; Escape cancel; blank → **Untitled** |
| Reorder | Pointer drag-and-drop persists order. Keyboard users use `Alt+Left` / `Alt+Right` on a tab. |
| Navigate | Previous / next arrow controls cycle through tabs without changing their order; plain Left / Right keys do the same when a tab is focused. |
| Delete | Hidden/disabled when only one tab; empty → immediate; non-empty → calm confirm dialog |
| Overflow | Horizontal scroll **within** strip only if needed; must not crowd writing surface |

**A11y**: All controls keyboard-operable and labelled; drag is never the only reorder path; announce selected tab / rename / delete outcomes where practical (`aria-live` sparingly).

## Component: `MarkdownNotepad` (extended binding)

| Contract | Detail |
|---|---|
| Value | Active tab `body` only |
| onChange | Updates that tab’s body in the document |
| Mode | Write/Preview shared for the shell session (lifted above tab switches) |
| Preview | Existing `MarkdownPreview` / GFM richness unchanged |

## Import control (in notepad chrome)

| Contract | Detail |
|---|---|
| Trigger | Labelled control (e.g. “Import markdown or backup”) opening a file picker |
| Accept | `.md`, `.markdown`, `.txt` (as markdown text), `.json` |
| `.md` / text | New tab; title from filename; Version N on clash; activate; body = file text |
| `.json` `kind:"full"` | Merge notepad field only per export-import contract |
| Failure | Calm message; no tab mutation |
| A11y | Keyboard reachable; input may be visually hidden but labelled |

## Must not

- Touch reflection storage or day archive on tab ops
- Network / telemetry
- Stock unread MUI tab look
- Allow zero tabs
