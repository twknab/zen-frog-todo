# Implementation Plan: Markdown Notepad — Persistent Engineering Notes

**Branch**: `011-markdown-notepad` | **Date**: 2026-07-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-markdown-notepad/spec.md` (post-clarify: distinct from reflection, persistent, full-screen, Focus-available).

## Summary

Add a **persistent engineering notepad** (markdown write + live preview) opened from an **upper-right control** as a **full-screen** surface, available during Focus Mode. It is **not** the Close-the-day reflection: reflection stays as the mental-health token and continues to archive/clear with the day. The notepad uses its **own** localStorage key, survives new-day, and is included in **full export only** (not day archive / single-day export).

**Realign note**: Branch WIP previously upgraded Close-the-day into the notepad and reused `frog-garden:reflection-v1`. Plan + subsequent tasks must **restore** the plain reflection field and move the notepad to the new shell/persistence model.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: Existing MUI v9 (zen theme), Framer Motion v12. **Markdown stack (upgrade)**: `react-markdown` + `remark-gfm` + `rehype-sanitize` (replace current `marked` + `dompurify`). Client-only preview; no WYSIWYG suite / no network.

**Storage**: Browser `localStorage` via `usePersistentState`.
- Reflection (unchanged): `frog-garden:reflection-v1` — still cleared/archived on new day.
- Notepad (new): `frog-garden:notepad-v1` — persistent string; **not** cleared on new day; **not** written into `ArchivedDay`.

**Testing**: Project convention — gate = `tsc --noEmit` + `eslint` clean + manual `quickstart.md` (Focus, full-screen a11y, reduced motion, full-export field, XSS-ish markdown, reflection still works).

**Target Platform**: Modern desktop + mobile browsers; notepad/preview are `"use client"`.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Full-screen open feels calm; preview updates without perceptible lag for typical eng-note length (< ~100KB). Prefer rich GFM capability over minimal parser (explicit clarify preference); still no remote fetches.

**Constraints**: Offline/local-first; sanitized client-side render; keyboard + SR; `prefers-reduced-motion`; calm copy; WCAG AA; re-themed MUI; auto-persist (no save/discard dialog).

**Scale/Scope**: Single user, one continuous notepad document. Touch: header control, full-screen shell, notepad editor, markdown preview helper, `FullExport` shape + `useExportEverything`, restore Close-the-day reflection UI.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — full-screen is spacious not frantic; gentle placeholder; no guilt/word-count; restrained open/mode motion. |
| II. Subtle Gamification | PASS — no scores/streaks on notes. |
| III. Local-First & Private | PASS — on-device only; full export carries `notepad`; reflection export unchanged. |
| IV. Accessibility | PASS — labelled control, dialog/drawer semantics, write/preview toggle, Escape/close, reduced-motion. |
| V. Design System Discipline | PASS — themed Dialog/Drawer + TextField + ToggleButtonGroup + preview typography from theme tokens. |
| VI. Simplicity & Performance | **JUSTIFIED TRADEOFF** — user explicitly preferred a **rich** GFM stack over smallest parser (clarify + FR-016). Tracked in Complexity Tracking. Still no WYSIWYG / no backend. |
| VII. Sound | N/A — no audio. |

**Watch**: Never render unsanitized HTML; do not clear notepad on new-day; do not remove reflection.

## Project Structure

### Documentation (this feature)

```text
specs/011-markdown-notepad/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── notepad-ui-contract.md
│   └── notepad-export-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── markdown.tsx / markdown.ts   # Shared ReactMarkdown config (remark-gfm + rehype-sanitize)
│   ├── notepad.ts                   # NEW — NOTEPAD_KEY + thin hook/helper if useful
│   └── dayArchive.ts                # EDIT — FullExport (+ live) gains optional/required `notepad`;
│                                    #         useExportEverything reads notepad key;
│                                    #         new-day MUST NOT clear notepad
├── components/
│   ├── MarkdownNotepad.tsx          # EDIT — write/preview editor (controlled); eng-note copy
│   ├── MarkdownPreview.tsx          # EDIT — react-markdown based themed preview
│   ├── NotepadShell.tsx             # NEW — full-screen surface + open state; hosts MarkdownNotepad
│   ├── NotepadButton.tsx            # NEW — upper-right IconButton (visible in Focus too)
│   ├── GroveDayDialog.tsx           # KEEP MarkdownPreview for archived reflection (mental-health note)
│   └── ...
└── app/
    └── page.tsx                     # EDIT — restore reflection TextField in Close-the-day card;
                                     #         add NotepadButton near ExportMenu/theme toggle;
                                     #         mount NotepadShell; remove notepad from reflection card
```

**Structure Decision**: Shell owns open/close + a11y dialog pattern; editor owns mode; page owns persisted notepad + reflection strings separately. Preview helper shared wherever markdown is shown (live notepad + Grove reflection).

## Key design decisions (see research.md)

1. **Distinct from reflection** — restore Close-the-day plain field; notepad is separate.
2. **Persistent key** `frog-garden:notepad-v1` — not archived, not cleared on new day.
3. **UI** — upper-right control → full-screen MUI Dialog (or full-viewport Drawer) with write/preview.
4. **Focus** — control + open allowed during Focus Mode.
5. **Export** — add `notepad` to full export only; bump schema awareness for readers; single-day unchanged.
6. **Markdown** — `react-markdown` + `remark-gfm` + `rehype-sanitize` (rich GFM; replace marked/DOMPurify).
7. **Auto-persist** — `onChange` → `usePersistentState`; close never discards.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Richer markdown stack (`react-markdown` + `remark-gfm` + `rehype-sanitize`) vs minimal `marked` + `DOMPurify` | Explicit clarify preference + FR-016 (“richest … the better”); better React/GFM ergonomics without `dangerouslySetInnerHTML` | Keeping marked alone under-delivers on stated richness goal and keeps raw HTML injection path |
| Full-screen shell component (extra vs inline card) | Clarify: plenty of visual real estate; available in Focus without stealing the Close-the-day card | Bottom half-sheet / in-card editor conflicts with “full screen” and Focus flow-state capture |
| New persistence key + full-export field | Notepad must survive days and stay out of day archive | Reusing `reflection` couples eng notes to mental-health token and day clear — rejected in clarify |
