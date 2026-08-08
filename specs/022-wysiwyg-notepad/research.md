# Phase 0 Research: WYSIWYG Notepad Editor

The editor library (TipTap) was decided with the user before planning. Research here resolves the *how* — round-trip fidelity, extension set, lazy-loading/fallback, theming — and validates version compatibility.

## Decision 1: TipTap v3 + `tiptap-markdown` for the markdown round-trip

**Decision**: Use `@tiptap/react` + `@tiptap/starter-kit` v3.29.x with `tiptap-markdown` v0.9 for markdown ⇄ ProseMirror serialization.

**Rationale**: Verified via `npm view`: `@tiptap/react`/`starter-kit` v3.29.2 declare `react`/`react-dom` peer `^19.0.0` — compatible with this app's React 19.2 / Next 16. `tiptap-markdown` v0.9 peers `@tiptap/core ^3.0.1` (v3-compatible) and bundles `markdown-it` + `prosemirror-markdown` + `markdown-it-task-lists`, giving parse (markdown→doc) and serialize (doc→markdown) plus GFM task lists out of the box. It's the standard, well-trodden community path for "TipTap that speaks markdown," satisfying YAGNI vs. a bespoke bridge.

**Alternatives considered**:
- **Milkdown** — markdown-native, highest fidelity, but was rejected earlier with the user in favour of TipTap (bigger ecosystem, React 19 certainty, easier theming). 
- **BlockNote** — Notion-style, but block-JSON native with lossy markdown import/export; conflicts with "markdown as the raw stored format." Rejected with the user.
- **Custom remark/mdast ↔ ProseMirror bridge** (reusing the app's `remark-gfm`) — most control, but significant, fragile code to write and maintain for no user-visible gain over `tiptap-markdown`. Rejected (Principle VI). The app keeps `remark-gfm` only for the Grove's read-only preview.

**Validation to do at install (flagged, not assumed)**: confirm `tiptap-markdown` v0.9 installs cleanly against `@tiptap/*` v3.29 and that parse/serialize works in this Next 16 + React 19 setup; if a peer/version conflict surfaces, pin compatible versions or fall back to a StarterKit-native serializer. The raw-markdown mode is always available regardless, so the feature degrades safely.

## Decision 2: Verbatim preservation via "markdown is canonical + only-write-on-genuine-edit"

**Decision**: Markdown is the single source of truth. The editor parses stored markdown → ProseMirror doc when rich mode is entered (or the external value changes). It serializes doc → markdown and calls `onChange` **only when the user actually edits in rich mode** — never merely because the doc was loaded/rendered. A sync guard (compare the last-known markdown against freshly-serialized markdown, and a "did this update originate from user input" check) prevents feedback loops and prevents a load-time re-serialization from silently rewriting stored content.

**Rationale**: A byte-exact markdown ⇄ ProseMirror ⇄ markdown round-trip is impossible in general (any serializer normalizes whitespace, list markers, etc.). FR-005a's requirement — "preserve verbatim, never silently dropped/rewritten" — is honored in practice by: (a) never rewriting stored markdown for content the user only *views* in rich mode (so existing notes are untouched unless deliberately edited); (b) `tiptap-markdown`'s HTML pass-through (`html: true`) keeping raw HTML blocks; (c) scoping the schema to GFM so common notes round-trip cleanly (SC-003); and (d) the always-available raw-markdown mode for byte-exact control. This matches how mature dual-mode markdown editors behave.

**Alternatives considered**:
- Re-serialize and persist on every mode switch — rejected: would normalize/churn untouched notes, violating the spirit of FR-005a.
- Store the ProseMirror JSON as canonical and export markdown lossily — rejected: violates FR-004 (markdown must stay the persisted/exported format).

## Decision 3: Extension set scoped to GFM essentials

**Decision**: `StarterKit` (Document, Paragraph, Text, Bold, Italic, Strike, Code, Heading, Bullet/Ordered lists, ListItem, CodeBlock, Blockquote, HardBreak, HorizontalRule, History, Dropcursor, Gapcursor) + `@tiptap/extension-link` + `@tiptap/extension-task-list` + `@tiptap/extension-task-item`. This covers FR-002 exactly. Tables are **deferred** (not in the required set; markdown-table round-trip + editing UX is disproportionate complexity — YAGNI).

**Rationale**: Matches the spec's bounded feature set; avoids an exhaustive editor (Principle VI). Task lists/links aren't in StarterKit, so they're added explicitly; `tiptap-markdown` already handles task-list markdown via `markdown-it-task-lists`.

**Alternatives considered**: Adding tables/images/embeds now — rejected as out-of-scope scope-creep for this iteration.

## Decision 4: Lazy-load via `next/dynamic` (ssr:false) + error-boundary fallback

**Decision**: `MarkdownNotepad` imports the rich editor with `next/dynamic(() => import("./RichNotepadEditor"), { ssr: false, loading: <calm placeholder> })`, wrapped in a small React error boundary. On dynamic-import or editor-init failure, the boundary renders a quiet "rich editing unavailable — use Markdown mode" message and the raw-markdown mode stays reachable (FR-010).

**Rationale**: `ssr: false` is required (ProseMirror needs the DOM; SSR would throw). Because `NotepadShell` only mounts `MarkdownNotepad` when the notepad `open` is true, and the dynamic import resolves only when the rich branch renders, TipTap is entirely off the initial dashboard bundle (FR-009, SC-004). The error boundary satisfies FR-010's "notes never inaccessible" guarantee.

**Alternatives considered**: `React.lazy` + Suspense — works too, but `next/dynamic` is the App-Router-idiomatic choice with built-in `ssr:false` and `loading`. Eager import — rejected (defeats FR-009).

## Decision 5: Themed, headless — no stock ProseMirror chrome

**Decision**: Wrap the editor in a styled MUI container that maps ProseMirror's `.ProseMirror` editing surface and node styles (headings, lists, code blocks, blockquotes, links, task-list checkboxes, placeholder) to theme tokens — body typography, `theme.spacing`, rounded corners, `text.primary`/`text.secondary`, code-block background from the palette, `divider` for rules. Focus ring uses the theme's primary. Respect `prefers-reduced-motion` for any caret/menu transitions.

**Rationale**: TipTap ships headless (no CSS), so this is required for Principle V (no default-Material/stock look) and FR-012. Reusing theme tokens keeps light/dark and any palette variants correct automatically.

**Alternatives considered**: shipping a prebuilt editor CSS theme — rejected: wouldn't match the app's re-themed look and would fight the palette.

## Decision 6: Calm formatting UX — input rules + minimal bubble menu

**Decision**: Rely primarily on TipTap's **markdown input rules** (typing `**x**`, `# `, `> `, `- [ ] `, ` ``` `, etc. formats live as you type) plus a **small selection bubble menu** (bold, italic, link, maybe heading) that appears only on text selection. No heavy always-visible toolbar.

**Rationale**: Keeps chrome quiet and unobtrusive (Principle I, FR-013) while remaining discoverable and keyboard-accessible. Input rules make the rich mode feel markdown-native, reinforcing the "markdown is the real format" model. Bubble-menu buttons get `aria-label`s and are reachable via keyboard (FR-011).

**Alternatives considered**: A full persistent formatting toolbar — rejected as visually loud (against Principle I) and unnecessary given input rules. No controls at all — rejected: less discoverable for non-markdown users (the whole point of WYSIWYG).

## Compatibility & verification notes

- No automated test suite (constitution Verification clause); the gate is `tsc --noEmit` + `eslint --max-warnings=0` + manual `quickstart.md` verification.
- `ssr:false` avoids the known ProseMirror-in-SSR crash. First rich-mode entry will show the `loading` placeholder briefly while the chunk loads — acceptable and expected.
- Bundle: confirm at implement time (e.g., `next build` output / devtools Network) that the tiptap chunk is a separate lazy chunk not present on initial load.
