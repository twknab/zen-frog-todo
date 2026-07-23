# Implementation Plan: Markdown Notepad — Daily Notes

**Branch**: `011-markdown-notepad` | **Date**: 2026-07-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-markdown-notepad/spec.md`

## Summary

Upgrade the existing Close-the-day plain reflection `TextField` into a **markdown notepad** with write/preview toggle. Today's note continues to use the live key `frog-garden:reflection-v1` and archives through `dayArchive.ts` as `ArchivedDay.reflection` — no parallel store. Preview rendering is client-side only (`marked` + `DOMPurify`). The Grove day recap shows archived notes as the same sanitized rendered markdown. Exports already include `reflection`; no export schema change beyond ensuring the notepad still writes that field.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: Existing MUI v9 (zen theme), Framer Motion v12. **New**: `marked` (markdown → HTML) + `dompurify` (sanitize HTML before render). Types via package builtins / `@types/dompurify` if needed. No WYSIWYG editor suite.

**Storage**: Browser `localStorage` via existing `usePersistentState`. **Reuse** `frog-garden:reflection-v1` for the live note. Archive field remains `reflection`. No new persistence keys (write/preview mode is session-only React state).

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint` clean, then manual verification against `quickstart.md` (including reduced-motion, keyboard/SR, export contents, XSS-ish markdown).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered (`"use client"` for preview helpers).

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Preview re-renders on note change with no perceptible lag for typical daily-note length (< ~50KB). Bundle impact kept small (parser + sanitizer only).

**Constraints**: Offline/local-first; no network for rendering; honor `prefers-reduced-motion`; keyboard + screen-reader operable toggle; calm copy; WCAG AA; MUI re-themed; YAGNI (no images, no sync, no second note type).

**Scale/Scope**: Single user, single browser. One new notepad component (+ shared preview helper), small edits to `page.tsx`, `GroveDayDialog`, and possibly New Day copy. Archive/export modules keep the `reflection` field name.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — gentle placeholder, no guilt/word-count, restrained mode toggle motion. |
| II. Subtle Gamification, Not Scoreboards | PASS — no streaks, scores, or judgment tied to notes (FR-017). |
| III. Local-First & Private | PASS — on-device only; rendering local; exports already carry `reflection` (FR-009–011). |
| IV. Accessibility | PASS — labelled write/preview control; keyboard operable; reduced-motion fallback (FR-013–014). |
| V. Design System Discipline | PASS — themed TextField/ToggleButtonGroup + preview styles from theme tokens (FR-015). |
| VI. Simplicity & Performance | PASS — smallest reasonable markdown stack (`marked` + `DOMPurify`); no WYSIWYG; reuse existing reflection key/archive path. |
| VII. Sound Is Calm & Shared | N/A — no audio. |

No violations. **Watch item**: `dangerouslySetInnerHTML` only after `DOMPurify.sanitize` — never raw `marked` output.

## Project Structure

### Documentation (this feature)

```text
specs/011-markdown-notepad/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── notepad-ui-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── markdown.ts          # NEW — renderMarkdownToSafeHtml(md): string
│   │                        #       (marked.parse + DOMPurify.sanitize); shared
│   └── dayArchive.ts        # UNCHANGED schema — keep reflection key/field;
│                            #       may tweak comments/copy only if needed
├── components/
│   ├── MarkdownNotepad.tsx  # NEW — write/preview toggle + editor + preview;
│   │                        #       controlled value/onChange; a11y + reduced motion
│   ├── MarkdownPreview.tsx  # NEW — themed Box rendering sanitized HTML
│   ├── GroveDayDialog.tsx   # EDIT — show reflection via MarkdownPreview
│   ├── NewDayAction.tsx     # EDIT — copy: "reflection" → "note" where user-facing
│   └── ...
└── app/
    └── page.tsx             # EDIT — replace Close-the-day TextField with
                             #        <MarkdownNotepad />; retitle card toward
                             #        today's note; keep NewDayAction
```

**Structure Decision**: Presentational notepad owns UI mode; parent (`page.tsx`) keeps owning the persisted `notes` string via the existing reflection key. Preview helper is shared so Grove and live notepad never diverge on sanitization.

## Key design decisions (see research.md for rationale)

- **Replace, don't duplicate**: one daily note; upgrade Close-the-day card; keep `reflection` in storage/export.
- **Stack**: `marked` + `DOMPurify` (smallest reasonable; client-only).
- **Mode**: session-only React state; default write; ToggleButtonGroup (or equivalent) with `aria-pressed` / labelled control.
- **Motion**: optional short crossfade; `timeout={0}` / no animation when `useReducedMotion()`.
- **Grove**: reuse `MarkdownPreview` for archived `reflection`.
- **Exports**: no schema change — notepad writes the same field already exported.

## Complexity Tracking

No unjustified complexity. New deps are required for markdown + sanitization and are the minimal pair that satisfies FR-011/FR-012.
