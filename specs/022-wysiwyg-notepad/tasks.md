# Tasks: WYSIWYG Notepad Editor

**Input**: Design documents from `/specs/022-wysiwyg-notepad/`

**Prerequisites**: plan.md, spec.md (US1–US3), research.md, data-model.md, contracts/rich-notepad-editor-contract.md, quickstart.md

**Tests**: No automated test tasks — project convention (constitution Verification clause): gate = `tsc --noEmit` + `eslint --max-warnings=0` + manual quickstart verification.

**Organization**: Grouped by user story; US1 is the MVP increment. The 2026-08-01 direction (classic toolbar, mobile-first) lands inside US1 + Polish.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

**Purpose**: Dependencies in place, baseline green.

- [x] T001 Install rich-editor dependencies via npm: `@tiptap/react`, `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item` (v3.29.x) and `tiptap-markdown` (v0.9.x); confirm `npx tsc --noEmit` still passes baseline (package.json / package-lock.json)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mode-model rename both P1 stories build on.

- [x] T002 Rename `NotepadMode` `"preview"` → `"rich"` and update mode-toggle labels/aria in src/components/MarkdownNotepad.tsx and src/components/NotepadShell.tsx (raw "Write" branch untouched; static-preview branch temporarily still renders under the new name until T005 replaces it)

---

## Phase 3: User Story 1 — Write rich documents directly (P1) 🎯 MVP

**Goal**: Live editable WYSIWYG surface with a classic, recognizable formatting toolbar; mobile-first.

**Independent Test**: Open notepad → Rich mode → type heading/bold/list/checkbox and format via toolbar buttons; content renders live, is editable, persists with no save step.

- [x] T003 [US1] Create src/components/RichNotepadEditor.tsx — TipTap `useEditor` (StarterKit + Link + TaskList + TaskItem + tiptap-markdown with `html: true`), props `{ value, onChange, placeholder? }`, parse-in on external `value` change WITHOUT firing `onChange` (sync guard tracking last markdown set-in), serialize-out `onChange(markdown)` only on genuine user edits (contract §RichNotepadEditor, FR-005a)
- [x] T004 [US1] Create src/components/NotepadFormattingToolbar.tsx — classic word-processor toolbar (MUI icon buttons: bold, italic, strikethrough, H1, H2, bullet list, numbered list, task list, quote, inline code, link) with `aria-label`s + `aria-pressed` active states, ≥44px touch targets, horizontal scroll (no wrapping); docked bottom of the editing surface at phone widths / top at md+ (FR-013, FR-015)
- [x] T005 [US1] Wire rich mode into src/components/MarkdownNotepad.tsx — replace static-preview branch with `next/dynamic(() => import("./RichNotepadEditor"), { ssr: false, loading })` + calm loading placeholder + error boundary that on load/init failure shows a quiet message and keeps raw mode reachable (FR-009, FR-010)
- [x] T006 [US1] Theme the ProseMirror surface in src/components/RichNotepadEditor.tsx (styled container) — map `.ProseMirror` node styles to theme tokens: body typography, headings, spacing, muted blockquote, rounded code blocks, task-item checkboxes matching MUI, link color, focus ring via theme primary, `prefers-reduced-motion` honored, WCAG AA (FR-011, FR-012)

**Checkpoint**: US1 independently testable — rich editing works end-to-end on phone + desktop widths.

---

## Phase 4: User Story 2 — Markdown stays the real format (P1)

**Goal**: Markdown is canonical; nothing rewritten unless genuinely edited; export unchanged.

**Independent Test**: Quickstart Scenario 2 — rich↔raw reflect each other; view-only round-trip leaves raw markdown byte-identical; export JSON contains markdown in unchanged shape.

- [x] T007 [US2] Verify + harden the verbatim guard in src/components/RichNotepadEditor.tsx — no `onChange` fires on mount/parse-in/tab-switch; raw HTML and unsupported constructs pass through unchanged when viewed without editing; paste of rich content converts to sensible markdown (quickstart Scenario 2 step 4, FR-004/FR-005a/SC-002)
- [x] T008 [US2] Manual export verification (no code change expected) — full JSON export still carries notepad tabs as markdown in the pre-feature shape; document result in specs/022-wysiwyg-notepad/quickstart.md notes if divergence found (SC-002)

---

## Phase 5: User Story 3 — Choose how I work per moment (P2)

**Goal**: Fluid, obvious mode switching; first-class default.

**Independent Test**: Quickstart Scenario 3 — toggle repeatedly across tabs; mode shared; no content/keystroke loss; no scroll jump.

- [x] T009 [US3] Mode-switch UX polish in src/components/MarkdownNotepad.tsx + src/components/NotepadShell.tsx — default the notepad to **rich** mode on open (the recognizable, markdown-free path; raw "Write" remains one tap away — update contract + data-model notes accordingly), clear active-mode affordance, switching preserves content and scroll position (FR-005, US3 scenarios)

---

## Phase 6: Polish & Cross-Cutting

- [x] T010 [P] Mobile-first verification at 390×844 + desktop 1280 — toolbar reachable with on-screen keyboard heuristics (docked, not scrolled away), tab strip + toggle usable at small widths, touch targets ≥44px; screenshot evidence (FR-015)
- [x] T011 [P] Lazy-load + perf verification — TipTap chunk absent from initial dashboard load, loads on notepad open; typing stays responsive on a large note (quickstart Scenario 4, SC-004)
- [x] T012 Final gate — `npx tsc --noEmit` + `npx eslint --max-warnings=0` clean; run all quickstart scenarios incl. keyboard/SR/reduced-motion; commit + push branch

## Dependencies

- T001 → T002 → US1 (T003 → T004 → T005 → T006) → US2 (T007, T008) → US3 (T009) → Polish (T010/T011 [P] → T012)
- US2 depends on US1's editor existing; US3 depends on both modes being final.

## Implementation Strategy

MVP = Phase 1–3 (US1). US2 is mostly verification/hardening of guards built into T003. US3 is a small default+polish pass. Polish phase is verification-heavy per project convention.
