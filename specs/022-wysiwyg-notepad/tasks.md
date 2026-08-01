# Tasks: WYSIWYG Notepad Editor

**Input**: Design documents from `/specs/022-wysiwyg-notepad/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — no automated test tasks. Gate = `tsc --noEmit` + eslint clean + manual `quickstart.md`.

**Organization**: Tasks grouped by user story so each can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install TipTap stack and confirm it resolves cleanly against React 19 / Next 16

- [x] T001 Add TipTap deps to `package.json` via yarn: `@tiptap/react`, `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item` (v3.29.x) and `tiptap-markdown` (^0.9); run install and resolve any peer conflicts
- [x] T002 Smoke-check in a throwaway Node/TS snippet or temporary import that `tiptap-markdown` parses/serializes a short GFM string with the StarterKit + link + task-list extensions without runtime error (delete throwaway after)

**Checkpoint**: Dependencies installed; markdown ⇄ TipTap path proven before UI work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mode-model rename and shell wiring so both stories share one controlled `"write" | "rich"` state

**⚠️ CRITICAL**: No rich-editor UI until this phase is complete

- [x] T003 Rename `NotepadMode` from `"write" | "preview"` to `"write" | "rich"` in `src/components/MarkdownNotepad.tsx`; update toggle labels (calm copy e.g. "Write" / "Rich"), `aria-label`s, and internal branch key; keep `"write"` TextField behavior unchanged for now (rich branch can temporarily keep old preview or a placeholder until US1)
- [x] T004 Update shared mode default/reset in `src/components/NotepadShell.tsx` so open still defaults to `"write"` and tab switches keep one shared mode (no per-tab mode)

**Checkpoint**: Mode model matches contract; notepad still opens and edits raw markdown

---

## Phase 3: User Story 1 — Write rich documents live (Priority: P1) 🎯 MVP

**Goal**: Replace static Preview with a live editable TipTap surface (headings, bold, lists, checkboxes, etc. as you type)

**Independent Test**: Open notepad → Rich → type a heading, bold, bullet list, checkbox; see live formatting; content persists via existing notepad path

### Implementation for User Story 1

- [x] T005 [US1] Create `src/components/RichNotepadEditor.tsx` with TipTap (`useEditor` / `EditorContent`), StarterKit + Link + TaskList/TaskItem, `tiptap-markdown` storage; props `{ value, onChange, placeholder? }` per `contracts/rich-notepad-editor-contract.md`
- [x] T006 [US1] Implement parse-in / serialize-out sync guard in `src/components/RichNotepadEditor.tsx`: set editor from external `value` without calling `onChange`; call `onChange(markdown)` only on genuine user edits (FR-005a verbatim guard)
- [x] T007 [US1] Theme the ProseMirror surface in `src/components/RichNotepadEditor.tsx` (MUI `sx` / theme tokens for typography, lists, code, blockquotes, task checkboxes, focus ring); honor `prefers-reduced-motion` for any menu transitions
- [x] T008 [US1] Add calm formatting UX in `src/components/RichNotepadEditor.tsx`: markdown input rules + minimal selection BubbleMenu (bold / italic / link / heading) with `aria-label`s; no heavy always-on toolbar
- [x] T009 [US1] Wire rich branch in `src/components/MarkdownNotepad.tsx`: `next/dynamic(() => import("./RichNotepadEditor"), { ssr: false, loading: calm placeholder })` replacing the static `MarkdownPreview` branch; bind same `value` / `onChange`
- [x] T010 [US1] Add a small error boundary around the rich branch in `src/components/MarkdownNotepad.tsx` (or colocated helper) so load/init failure shows a quiet message and raw Write mode stays reachable (FR-010)

**Checkpoint**: Rich mode is editable MVP; TipTap not on initial dashboard chunk when notepad closed

---

## Phase 4: User Story 2 — Markdown stays the portable format (Priority: P1)

**Goal**: Rich ↔ raw operate on one markdown document; storage/export shape unchanged; view-only rich does not rewrite notes

**Independent Test**: Author in Rich → switch Write → see markdown; edit raw → switch Rich → see update; export JSON still has markdown strings; open a note with exotic markdown, view in Rich without editing, switch away — source unchanged

### Implementation for User Story 2

- [x] T011 [US2] Verify and harden round-trip in `src/components/RichNotepadEditor.tsx`: enable HTML pass-through / config so unsupported constructs aren't dropped; confirm load-without-edit never fires `onChange`
- [x] T012 [US2] Confirm `src/lib/notepad.ts` and `src/lib/dayArchive.ts` are untouched for notepad shape/key/export; manually spot-check full export still emits markdown notepad content after rich edits
- [x] T013 [US2] Confirm Grove path unchanged: `src/components/MarkdownPreview.tsx` still used for archived reflection; no TipTap import there (FR-014)

**Checkpoint**: Markdown remains canonical; export/Grove unaffected

---

## Phase 5: User Story 3 — Fluid mode choice (Priority: P2)

**Goal**: Clear Write/Rich toggle; shared mode across tabs; smooth switches without content loss

**Independent Test**: Toggle modes repeatedly with content; switch tabs; mode stays shared; no lost keystrokes / disorienting jump

### Implementation for User Story 3

- [x] T014 [US3] Polish toggle UX in `src/components/MarkdownNotepad.tsx` (labels, pressed state, reduced-motion mode swap) so active mode is obvious and keyboard/SR friendly
- [x] T015 [US3] On tab change while in rich mode, ensure `RichNotepadEditor` re-parses the new tab's `value` without spurious `onChange` and without losing the shared mode in `src/components/NotepadShell.tsx`

**Checkpoint**: Dual-mode workflow feels calm and reliable across tabs

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, bundle, and manual validation

- [x] T016 Confirm rich editor region has an accessible name (e.g. `aria-label="Notepad rich editor"`) and bubble controls are keyboard-reachable in `src/components/RichNotepadEditor.tsx`
- [x] T017 Run `npx tsc --noEmit` and eslint on touched files; fix any issues
- [x] T018 Manually walk `specs/022-wysiwyg-notepad/quickstart.md` (lazy chunk, fallback, round-trip, a11y smoke) and mark gaps if any

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: Depends on Setup — blocks rich UI
- **US1 (Phase 3)**: Depends on Foundational — MVP
- **US2 (Phase 4)**: Depends on US1 rich editor existing (validates markdown fidelity)
- **US3 (Phase 5)**: Depends on US1 mode wiring; polish on top
- **Polish (Phase 6)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on US2/US3
- **US2 (P1)**: After US1 (same editor; fidelity hardening)
- **US3 (P2)**: After US1 (toggle/tabs polish)

### Parallel Opportunities

- T007 / T008 can overlap once T005–T006 exist (same file — prefer sequential on `RichNotepadEditor.tsx`)
- T012 / T013 [verification] can run in parallel after T011
- T016 can start once T008/T010 land

---

## Parallel Example: User Story 1

```bash
# After T005 scaffold exists, theme + bubble menu are sequential on the same file:
Task: "Theme ProseMirror surface in src/components/RichNotepadEditor.tsx"
Task: "Add BubbleMenu + input rules in src/components/RichNotepadEditor.tsx"
# Prefer one agent owning RichNotepadEditor.tsx end-to-end (T005–T008)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup (deps)
2. Phase 2 Foundational (mode rename)
3. Phase 3 US1 (TipTap surface)
4. **STOP and VALIDATE** rich editing independently
5. Continue US2 fidelity → US3 polish → Phase 6 gate

### Incremental Delivery

1. Setup + Foundational → mode model ready
2. US1 → live rich editing (MVP demo)
3. US2 → markdown portability / verbatim guard confidence
4. US3 → toggle/tab polish
5. Polish → tsc/eslint + quickstart

---

## Notes

- Do **not** modify Grove `MarkdownPreview` or notepad storage/export shapes
- Tables out of scope (plan YAGNI)
- TipTap must stay behind `next/dynamic` + `ssr: false`
- Commit after each phase or logical group if shipping incrementally
