# Implementation Plan: Notepad Tabs & Grove Row Reveal

**Branch**: `021-notepad-tabs-grove-rows` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/021-notepad-tabs-grove-rows/spec.md`

## Summary

Extend the persistent engineering notepad from a single markdown string to a **named tab collection** (create / rename / reorder / delete; migrate legacy body → **My Note**; write/preview unchanged). Wire **full-export** to the tab document; add notepad-scoped **import** of full-export JSON (merge + `Name (Version N)`) and plain **`.md` → new tab**. Replace The Grove’s horizontal scroll ribbon with **viewport-width rows**, **load-more** (+1 row), visit reset, and resize that preserves revealed day count.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js (App Router) — unchanged.

**Primary Dependencies**: Existing MUI + Framer Motion + `react-markdown` stack. **No new packages** (reorder via accessible move controls, not a DnD library).

**Storage**: localStorage via `usePersistentState` — evolve `frog-garden:notepad-v1` from `string` to a versioned tab document (migrate on read). Grove reveal count is **React state only** (not persisted).

**Testing**: Project convention — `tsc --noEmit` + `eslint --max-warnings=0` + manual `quickstart.md`. Pure helpers (migrate, unique title, row slicing) are good candidates for small unit tests if convenient; not the release gate.

**Target Platform**: Modern desktop + mobile browsers, client-rendered, local-first.

**Project Type**: Single Next.js web app.

**Performance Goals**: Tab switches and Grove reflow without jank; ResizeObserver-driven row math; no network.

**Constraints**: Constitution I/III/IV/V/VI; calm tab chrome; no horizontal Grove scroll; YAGNI — no full-app JSON restore of archive/live in this feature (notepad field only); no standalone `.md` export required.

**Scale/Scope**: Notepad domain + shell/editor UI; export type widen; new import affordances in notepad; Grove layout rewrite for row reveal. Short look-back history (tens–low hundreds of days), not infinite archive browser.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — generous tab strip, soft delete confirm, hide exhausted load-more, no shame copy. |
| II. Subtle Gamification | PASS — Grove remains keepsake, not scoreboard; no new metrics. |
| III. Local-First & Private | PASS — on-device persistence; export/import for portability; no telemetry. |
| IV. Accessibility | PASS — keyboard tab ops, rename, reorder, delete, md/json import, load-more; reduced-motion. |
| V. Design System Discipline | PASS — re-theme MUI tabs/dialogs; no stock Material chrome. |
| VI. Simplicity & Performance (YAGNI) | PASS — no DnD dep; notepad-scoped import only; simple `revealedCount` + ResizeObserver. |
| VII. Sound | N/A — no audio changes. |

No violations.

**Post-design re-check**: Still PASS — contracts keep import scoped to notepad, Grove reveal ephemeral, migration one-shot on read.

## Project Structure

### Documentation (this feature)

```text
specs/021-notepad-tabs-grove-rows/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── notepad-tabs-ui-contract.md
│   ├── notepad-export-import-contract.md
│   └── grove-row-reveal-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── notepad.ts           # EDIT — tab document, migrate, useNotepad API, title helpers
│   ├── dayArchive.ts        # EDIT — FullExport.notepad shape; buildFullExport / useExportEverything
│   └── grove.ts             # unchanged preference; row math MAY live here or in Grove.tsx helpers
├── components/
│   ├── NotepadShell.tsx     # EDIT — tab strip, add/import/delete chrome
│   ├── MarkdownNotepad.tsx  # EDIT — bind active tab body (mode stays session-local)
│   ├── NotepadTabStrip.tsx  # NEW — tabs, rename, reorder, delete affordances
│   ├── Grove.tsx            # EDIT — row layout, revealedCount, load-more, no overflow-x
│   └── ExportMenu.tsx       # unchanged (full export still from here; notepad import lives in notepad)
└── app/
    └── page.tsx             # EDIT — wire useNotepad collection API into NotepadShell
```

**Structure Decision**: Keep notepad domain in `lib/notepad.ts`; keep Grove self-contained in `Grove.tsx` (+ tiny pure helpers if useful). Import UX lives on the notepad surface (where tabs live), not the header Export menu.

## Key design decisions (detail in research.md)

1. Persist `{ v: 1, tabs[], activeTabId }`; migrate legacy string → **My Note**.
2. Reorder with ←/→ (or equivalent) buttons — accessible, no new dependency.
3. Full-export `notepad` field becomes the tab document; readers accept legacy `string`.
4. Import in notepad: `.md` → new tab; `kind:"full"` JSON → merge **only** `notepad` (+ Version N).
5. Grove state = `revealedCount` (items); load-more `+= perRow`; visit/hide reset; resize keeps count.
6. Today’s sand peek counts as one ribbon item for row math.

## Complexity Tracking

> No Constitution violations requiring justification.
