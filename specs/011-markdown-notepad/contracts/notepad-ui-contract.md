# UI Contract: Markdown Notepad (persistent eng notes)

Client UI feature — observable behavior and component boundaries, not a network API.

## Component: `NotepadButton`

**Role**: Upper-right header control to open the notepad.

| Contract | Detail |
|---|---|
| Placement | Header action stack with Export / theme (upper-right). |
| Visibility | Shown in Flow **and** Focus Mode. |
| A11y | `aria-label` e.g. “Open notepad”; keyboard activatable. |
| Behavior | Sets shell open = true. |

## Component: `NotepadShell`

**Role**: Full-screen surface hosting the editor.

| Contract | Detail |
|---|---|
| Presentation | Full-screen modal (`Dialog` `fullScreen` preferred). |
| Open/close | Close button + Escape; focus trapped while open. |
| Motion | Respect `useReducedMotion()` (instant when reduced). |
| Content | Title (“Notepad”), close control, `<MarkdownNotepad />`. |
| Persist | Closing does **not** discard; no Save/Discard prompt. |

## Component: `MarkdownNotepad`

**Role**: Controlled write/preview editor for the engineering notepad.

| Prop | Type | Required | Notes |
|---|---|---|---|
| `value` | `string` | yes | Markdown source |
| `onChange` | `(next: string) => void` | yes | Auto-persist via parent |
| `placeholder` | `string` | no | Calm eng-scratchpad hint (not reflection/guilt copy) |

| Behavior | Contract |
|---|---|
| Mode control | Exclusive Write / Preview; labelled group; keyboard + `aria-pressed`. |
| Write | Themed multiline field; large minRows suitable for full-screen. |
| Preview | `MarkdownPreview` of `value`; empty → calm empty state. |
| Default mode | `write` on mount / each shell open. |
| Must not | Touch reflection storage; call network; stock-MUI look; non-essential motion under reduced-motion. |

## Component: `MarkdownPreview`

**Role**: Themed GFM markdown render (`react-markdown` + `remark-gfm` + `rehype-sanitize`).

| Prop | Type |
|---|---|
| `markdown` | `string` |
| `sx` | optional MUI sx |

**Contract**: No unsanitized HTML injection; theme tokens for typography/tables/code; reusable for Grove reflection if desired.

## Page integration (`page.tsx`)

- Restore Close-the-day card: plain reflection `TextField` + `NewDayAction` (not `MarkdownNotepad`).
- Mount `NotepadButton` in header (outside `!isFocus` gates).
- Mount `NotepadShell` once; bind notepad string to `frog-garden:notepad-v1`.
- Do not clear notepad in new-day flows.

## Focus Mode

- Notepad button remains reachable.
- Opening notepad does not require exiting Focus Mode.
