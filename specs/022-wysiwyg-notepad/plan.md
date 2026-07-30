# Implementation Plan: WYSIWYG Notepad Editor

**Branch**: `022-wysiwyg-notepad` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/022-wysiwyg-notepad/spec.md`

## Summary

Replace the notepad's static, read-only "Preview" mode with a live, editable **TipTap** (ProseMirror) rich-text surface, while keeping the raw-markdown "Write" mode and — critically — keeping **markdown as the single persisted/exported format**. The editor's ProseMirror document is an in-memory editing representation only; it is parsed from the stored markdown when rich mode is entered and serialized back to markdown on genuine user edits. Unsupported/raw markdown is preserved verbatim by treating markdown as canonical and only rewriting stored content on real edits. The TipTap bundle is lazy-loaded (only when the notepad opens), with a graceful fallback to the raw-markdown mode if it fails to load.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: NEW — `@tiptap/react`, `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit` (all v3.29.x, peer-compatible with React 19 — verified via `npm view`), plus `@tiptap/extension-link`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item` (not in StarterKit), and `tiptap-markdown` v0.9 (markdown ⇄ ProseMirror serialization; peer `@tiptap/core ^3.0.1`, so v3-compatible). EXISTING and reused: `react-markdown` + `remark-gfm` + `rehype-sanitize` remain for the Grove's read-only reflection rendering (untouched) — see FR-014.

**Storage**: Unchanged. Notepad content stays a **markdown string** per tab (`NotepadTab.body`), localStorage key `frog-garden:notepad-v1` (`src/lib/notepad.ts`), included as-is in the dayArchive full JSON export. No new key, no schema/shape change. TipTap's ProseMirror doc is never persisted.

**Testing**: No automated suite (project convention — constitution's Verification clause). Gate = `tsc --noEmit` + `eslint --max-warnings=0` clean, then manual verification against `quickstart.md` in the dev server (keyboard/screen-reader/reduced-motion checks; confirm exported data still contains markdown; confirm the tiptap chunk loads only after the notepad opens).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered. The editor is client-only (`ssr: false`) — ProseMirror needs the DOM.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Typing latency in the rich editor must stay imperceptible on realistic notes. The TipTap bundle (~150–250 KB gzip incl. ProseMirror + markdown-it) MUST NOT load on the initial dashboard path — it loads on demand when the notepad opens (FR-009).

**Constraints**: All client-side, zero network/telemetry (Principle III, FR-008); markdown remains canonical and its stored/exported shape is unchanged (FR-004/006, SC-002); unsupported markdown preserved verbatim (FR-005a); headless editor themed to the app's MUI look (Principle V, FR-012); keyboard/SR/reduced-motion/WCAG AA (Principle IV, FR-011); calm, unobtrusive formatting chrome (Principle I, FR-013); notes remain accessible via raw mode if the editor fails to load (FR-010).

**Scale/Scope**: Single user, local. Two edited files (`MarkdownNotepad.tsx` mode model; a themed editor container) + one new component (`RichNotepadEditor.tsx`) + new deps. Storage, export, tabs (`NotepadTabStrip`/`NotepadShell`), and Grove are untouched except the shell's mode label/state (`preview` → `rich`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — no urgency/anxiety UI; formatting stays quiet (markdown input rules + a minimal selection bubble menu rather than a heavy always-on toolbar); reduced-motion respected. |
| II. Subtle Gamification | N/A — no scoring/stakes. |
| III. Local-First & Private | PASS — entirely client-side; markdown never leaves the device; no network/telemetry; storage + JSON export unchanged (portability preserved). |
| IV. Accessibility | PASS (with care) — ProseMirror is keyboard-operable by default; the editor region gets an accessible label; any formatting controls get labels + keyboard access; reduced-motion honored; theme meets WCAG AA. Called out as an explicit implementation task, not assumed. |
| V. Design System Discipline | PASS — TipTap is headless; styled to the app's theme tokens (typography, spacing, rounded corners, palette). No stock editor chrome. |
| VI. Simplicity & Performance (YAGNI) | **PASS WITH JUSTIFICATION (see Complexity Tracking)** — a WYSIWYG editor is a meaningful new dependency + bundle cost, in tension with this principle. Justified by the user's explicit feature request; mitigated by (a) on-demand loading so it's off the initial path, and (b) scoping to a GFM-essentials feature set rather than an exhaustive editor. Documented, not silent. |
| VII. Sound Is Calm & Shared | N/A — no audio. |

One justified tension (Principle VI) — tracked below. No hard violations.

## Project Structure

### Documentation (this feature)

```text
specs/022-wysiwyg-notepad/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── rich-notepad-editor-contract.md   # RichNotepadEditor + MarkdownNotepad mode contract
├── checklists/
│   └── requirements.md  # from /speckit-specify + /clarify
└── tasks.md              # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── MarkdownNotepad.tsx       # EDIT — mode model: keep raw "Write" textarea; replace
│   │                             #        the static "Preview" branch with the new editable
│   │                             #        rich mode (lazy-loaded RichNotepadEditor). Both
│   │                             #        edit the same markdown value/onChange. Rename the
│   │                             #        NotepadMode "preview" → "rich".
│   ├── RichNotepadEditor.tsx     # NEW — TipTap editor. Props { value: markdown, onChange,
│   │                             #        placeholder }. Parses markdown→doc on external
│   │                             #        value change; serializes doc→markdown and fires
│   │                             #        onChange ONLY on genuine user edits (verbatim
│   │                             #        guard, FR-005a). Themed ProseMirror container.
│   │                             #        Client-only; dynamically imported by MarkdownNotepad.
│   └── NotepadShell.tsx          # EDIT (minimal) — the shared `mode` state/label:
│                                 #        default remains raw on open; "preview" → "rich".
└── (unchanged) src/lib/notepad.ts, src/lib/markdown.ts, MarkdownPreview.tsx (Grove),
    NotepadTabStrip.tsx, dayArchive export — NOT modified.
```

**Structure Decision**: Single Next.js web app. The rich editor is isolated in its own `RichNotepadEditor.tsx` so it can be dynamically imported (`next/dynamic`, `ssr:false`) — this is what keeps TipTap off the initial bundle. `MarkdownNotepad.tsx` keeps owning the two-mode toggle and the shared markdown `value`/`onChange`; only its "preview" branch changes. Storage/export/tabs/Grove are deliberately untouched.

## Key design decisions (detail in research.md)

- **Markdown stays canonical; only-write-on-edit guard = the verbatim mitigation (FR-005a)**: On entering rich mode, parse the stored markdown into the editor. Do **not** immediately re-serialize and overwrite storage (parse→serialize is not byte-identical). Fire `onChange` (rewriting stored markdown) **only** when the user actually edits in rich mode. So a note merely *viewed* in rich mode round-trips unchanged; supported constructs edited in rich mode round-trip cleanly (SC-003); `tiptap-markdown`'s HTML pass-through keeps raw HTML; the raw-markdown mode is always available for byte-exact control.
- **Round-trip engine = `tiptap-markdown`** (markdown-it + prosemirror-markdown), not a bespoke remark bridge — the pragmatic, v3-compatible, well-trodden path (YAGNI). Its lossiness on exotic constructs is bounded by the guard above + GFM-scoped schema. Alternatives (Milkdown, BlockNote, custom remark↔PM bridge) rejected in research.md.
- **Extension set = StarterKit + link + task-list/task-item** to cover FR-002 (headings, bold/italic/strike, lists, task lists, links, inline code, code blocks, blockquotes, HR). Tables deferred (round-trip complexity vs. value — YAGNI; not in the required set).
- **Lazy-load + fallback**: `MarkdownNotepad` renders the rich branch via `next/dynamic(() => import("./RichNotepadEditor"), { ssr:false, loading: <calm placeholder> })`, wrapped in an error boundary that, on load/init failure, shows a quiet message and keeps the raw-markdown mode reachable (FR-009/010). Because `NotepadShell` only mounts the notepad when open, TipTap stays off the dashboard's initial path.
- **Calm formatting UX**: rely on markdown **input rules** (type `**bold**`, `# heading`, `- [ ]`, etc. and it formats live) plus a **minimal selection bubble menu** (bold/italic/link/heading), not a heavy persistent toolbar — keeps chrome quiet (Principle I) while staying discoverable/accessible.
- **Theming**: a styled container maps ProseMirror's `.ProseMirror` element + node styles to theme tokens (body typography, spacing, rounded code blocks, muted palette), so the editor reads as part of the app, not stock ProseMirror.

## Complexity Tracking

> Principle VI (Simplicity & Performance / YAGNI) — justified tension.

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| New WYSIWYG dependency (TipTap + ProseMirror + tiptap-markdown), ~150–250 KB gzip | The feature *is* "add a real WYSIWYG editor" — explicitly requested; no lighter library delivers live rich editing with markdown round-trip at acceptable quality. | Keeping the static react-markdown preview doesn't satisfy the request (it's read-only). A hand-rolled contenteditable rich editor would be more code, buggier, and less accessible than a mature ProseMirror-based one. |
| Second markdown pipeline (markdown-it via tiptap-markdown) alongside the existing remark-gfm preview | tiptap-markdown ships its own markdown-it parser; the Grove still needs the existing remark preview. | Forcing TipTap onto the app's remark/mdast pipeline means writing+maintaining a custom ProseMirror↔mdast bridge (significant, fragile) for no user-visible gain. The two pipelines serve different surfaces. |

Mitigations (both bundle + simplicity): on-demand loading (off initial path); GFM-scoped feature set (no exhaustive editor); the rich editor isolated to one dynamically-imported component; storage/export/Grove untouched.
