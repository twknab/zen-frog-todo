# Phase 0 Research: Markdown Notepad — Daily Notes

All decisions below are constrained by the constitution (calm, local-first, accessible, re-themed MUI, YAGNI) and the clarified spec. No `NEEDS CLARIFICATION` items remain from the plan's Technical Context.

## Decision 1 — Replace/upgrade the reflection field (not a second note)

- **Decision**: The markdown notepad **replaces** the Close-the-day plain `TextField`. Live persistence stays on `frog-garden:reflection-v1`. Archive/export continue to use `ArchivedDay.reflection` / `live.reflection`. Product copy shifts to "note" / "Today's note"; internal field name stays `reflection` for compatibility.
- **Rationale**: Clarified in session 2026-07-22. Avoids two overlapping daily-note concepts (Principle VI). Zero migration of stored strings — existing text appears in the notepad automatically.
- **Alternatives considered**: Distinct second note (duplication, dual archive fields, dual export keys); rename storage key (breaks prior exports / FR-010).

## Decision 2 — Markdown stack: `marked` + `DOMPurify`

- **Decision**: Parse with [`marked`](https://github.com/markedjs/marked) (`marked.parse`), sanitize with [`dompurify`](https://github.com/cure53/DOMPurify) before any HTML insert. Shared helper `renderMarkdownToSafeHtml` in `src/lib/markdown.ts`. Preview components use `dangerouslySetInnerHTML` **only** with sanitized output. Both packages used from client components only (`"use client"`).
- **Rationale**: Principle VI — smallest reasonable option that covers a modest markdown subset + XSS hardening (FR-011, FR-012). Not a WYSIWYG suite. Fits the feature request's explicit example ("minimal markdown parser + manual sanitization").
- **Alternatives considered**:
  - `react-markdown` + `rehype-sanitize` — excellent React ergonomics and no `dangerouslySetInnerHTML`, but pulls a larger unified/remark graph; more than needed for short daily notes.
  - `markdown-it` — more plugins/weight than we need.
  - Custom regex parser — fragile, incomplete, worse XSS story.
  - Heavy editors (CodeMirror MD, TipTap, Milkdown) — violates YAGNI and calm UX (chrome, toolbars, bundle size).

## Decision 3 — Placement: upgrade Close-the-day card

- **Decision**: Keep the existing bento `reflection` grid area. Replace the multiline `TextField` with `<MarkdownNotepad />`. Retitle the card toward today's note (e.g. "Today's note"); keep `<NewDayAction />` at the bottom of the same card. Still hidden in Focus Mode via existing `!isFocus` gate.
- **Rationale**: Clarified placement; least layout churn; notepad is available all day in the same surface users already know.
- **Alternatives considered**: Separate card above/below (two note-adjacent regions during transition); move note to Standup Summary (wrong job — that's task rollup).

## Decision 4 — Write / preview toggle UX + a11y

- **Decision**: Session-only React state (`"write" | "preview"`), default `"write"`. Use a re-themed MUI `ToggleButtonGroup` (exclusive) or two `ToggleButton`s with clear labels ("Write" / "Preview"), `aria-label` on the group (e.g. "Note display mode"), and `aria-pressed` semantics from ToggleButton. Write mode: themed multiline `TextField` (same calm standard variant as today). Preview mode: `MarkdownPreview` in a similarly padded region. Only one mode visible at a time (not split pane).
- **Rationale**: FR-002, FR-013, FR-018; matches MUI patterns already in the app; exclusive toggle is keyboard-friendly.
- **Alternatives considered**: Tabs (heavier); split pane (more density, less calm); persisting mode preference (YAGNI).

## Decision 5 — Reduced motion

- **Decision**: Read `useReducedMotion()` (same as `BonsaiTree` / `page.tsx`). If reduced: swap write/preview instantly (no opacity/height animation). If motion allowed: optional short opacity crossfade (≤ ~200ms, calm easing) via Framer Motion or CSS — sparingly.
- **Rationale**: Principle IV / FR-014.

## Decision 6 — Shared preview for Grove

- **Decision**: Extract `MarkdownPreview` and reuse it in `GroveDayDialog` wherever plain `day.reflection` text is shown today. Empty reflection still omitted entirely (no empty heading).
- **Rationale**: FR-008 — one sanitization path; visual consistency between live preview and history.
- **Alternatives considered**: Plain text in Grove only (inconsistent with "live rendered preview" promise for archived notes).

## Decision 7 — Export / archive boundary

- **Decision**: No changes to export JSON shape. `buildSingleDayExport` / `buildFullExport` / `useStartNewDay` / auto-rollover already read/write `reflection`. Notepad parent continues to pass the same string into those hooks. Update user-facing strings in `NewDayAction` (and similar) from "reflection" to "note" where appropriate.
- **Rationale**: FR-006, FR-009, FR-010; Principle III portability without lock-in or breaking old exports.

## Decision 8 — Markdown subset & unsafe content

- **Decision**: Rely on `marked` defaults for common constructs (headings, emphasis, lists, links, code). Configure DOMPurify with a conservative allowlist (default DOMPurify profile is fine; do **not** enable `ADD_TAGS` for `script`/`iframe`). Links may render as `<a>`; prefer `target`-safe defaults (DOMPurify strips dangerous URLs like `javascript:`). No image embedding UX in v1 (images in markdown may render as sanitized `<img>` only if DOMPurify allows — acceptable; no upload UI).
- **Rationale**: Spec Assumptions + FR-012. Edge case: malformed markdown never corrupts the source string (source lives only in write-mode state / storage).

## Decision 9 — Scope guards (deliberately not built)

- No WYSIWYG, toolbar, or slash-commands.
- No separate notes history beyond The Grove.
- No cloud sync, AI assist, or collaborative editing.
- No new localStorage keys for mode or a second note body.
- No rename of `reflection` in archive/export JSON.
