# Phase 0 Research: Markdown Notepad — Persistent Engineering Notes

All decisions constrained by the constitution and the **post-clarify** spec. Prior research that assumed “replace reflection / Close-the-day card” is superseded.

## Decision 1 — Distinct from reflection (not a replace)

- **Decision**: Keep Close-the-day **reflection** as a plain mental-health token (`frog-garden:reflection-v1`, archived on new day). Add a **separate** engineering notepad.
- **Rationale**: Clarified 2026-07-22 — reflection ≠ eng scratchpad. Avoids conflating two jobs.
- **Alternatives considered**: Replace/upgrade reflection (rejected); second day-bound note that clears on new day (rejected — user wants persistence).

## Decision 2 — Persistence model

- **Decision**: New key `frog-garden:notepad-v1` (string markdown source) via `usePersistentState`. **Never** cleared by `useStartNewDay` / auto-rollover. **Not** copied onto `ArchivedDay`.
- **Rationale**: Clarify — not ephemeral to the day; independent of day archive.
- **Alternatives considered**: Snapshot into each archived day (rejected); multi-note library (YAGNI for v1).

## Decision 3 — Full export only

- **Decision**: Extend `FullExport` with top-level `notepad: string` (alongside `archive` + `live`). Do **not** add notepad to `SingleDayExport` / `ArchivedDay`. `useExportEverything` reads the notepad key at click time. Older full exports without `notepad` → treat as `""` on any future import path.
- **Rationale**: Clarify Option A. Principle III still satisfied via full dump.
- **Alternatives considered**: Embed in every day export (false history); omit from all exports (lock-in — forbidden).

## Decision 4 — UI chrome: upper-right → full-screen

- **Decision**: IconButton (or equivalent) in the existing header `Stack` next to Export / theme controls. Opens a **full-screen** MUI `Dialog` (`fullScreen`) or full-viewport bottom `Drawer` — prefer **`Dialog` fullScreen** for standard focus trap, Escape-to-close, and `aria-modal` semantics. Host `MarkdownNotepad` inside. Close control in the shell header. Visible in **both** Flow and Focus modes.
- **Rationale**: Clarify (upper-right, full-screen, Focus-available). Dialog fullScreen matches “plenty of real estate” better than a partial bottom sheet.
- **Alternatives considered**: Bottom half drawer (too small); Close-the-day card embedding (conflicts with distinct reflection); hide in Focus (rejected — flow-state notes).

## Decision 5 — Markdown stack: `react-markdown` + `remark-gfm` + `rehype-sanitize`

- **Decision**: Replace `marked` + `dompurify` with:
  - [`react-markdown`](https://github.com/remarkjs/react-markdown) — React elements, secure by default (no raw HTML).
  - [`remark-gfm`](https://github.com/remarkjs/remark-gfm) — tables, task lists, strikethrough, autolinks.
  - [`rehype-sanitize`](https://github.com/rehypejs/rehype-sanitize) — defense-in-depth allowlist.
  - Shared `MarkdownPreview` wraps this config; theme via `components` map / surrounding MUI `Box` styles (no stock GitHub CSS dump).
- **Rationale**: Clarify — “richest markdown library the better” / FR-016. Richer GFM story and idiomatic React vs `dangerouslySetInnerHTML`. Still 100% client-side, no telemetry.
- **Alternatives considered**:
  - Keep `marked` + `DOMPurify` (already in package.json) — smaller, but weaker fit to “richest” ask and keeps HTML string injection.
  - `markdown-it` + plugins — powerful, more manual React wiring.
  - TipTap / CodeMirror / Milkdown — WYSIWYG weight; violates calm/YAGNI for v1.
  - Math/KaTeX, Mermaid, raw HTML (`rehype-raw`) — out of scope (YAGNI; security surface).

## Decision 6 — Write / preview + auto-persist

- **Decision**: Session-only mode state (`write` \| `preview`), default `write` on open. Exclusive themed `ToggleButtonGroup`. Parent binds `value`/`onChange` to persistent notepad state — every keystroke persists; closing the shell never prompts and never discards.
- **Rationale**: FR-003–005, FR-015, FR-017; clarify auto-persist.
- **Alternatives considered**: Explicit Save (rejected); split-pane always-on preview (more density).

## Decision 7 — Reduced motion & a11y

- **Decision**: `useReducedMotion()` — zero-duration Dialog transition and mode crossfade when reduced. Shell: labelled open button (“Open notepad”), Dialog title (“Notepad”), close button, focus trap. Toggle group `aria-label` e.g. “Notepad display mode”.
- **Rationale**: Principle IV / FR-010–011.

## Decision 8 — Grove / reflection rendering

- **Decision**: Grove may keep using `MarkdownPreview` for archived **reflection** (nice-to-have; reflections are usually plain prose). Do **not** show the engineering notepad inside Grove day recaps (notepad is not day-scoped).
- **Rationale**: Spec — notepad independent of archive; Grove is day history.
- **Alternatives considered**: Show notepad snippet in Grove (misleading “day note”).

## Decision 9 — Realigning existing WIP on this branch

- **Decision**: Treat current Close-the-day `MarkdownNotepad` + reflection-key binding as **incorrect relative to clarify**. Tasks must: restore plain reflection `TextField` + original card framing; introduce shell + new key; swap markdown deps; extend full export.
- **Rationale**: Spec drift from pre-clarify implementation.

## Decision 10 — Scope guards

- No multi-note library, per-task attachments, cloud sync, AI, image upload UI, slash-commands, or notepad version history beyond full export.
- No day-archive snapshot of notepad.
- No removing or renaming `ArchivedDay.reflection`.
