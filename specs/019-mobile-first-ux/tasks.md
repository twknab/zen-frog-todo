# Tasks: Mobile-First UX

**Input**: Design documents from `/specs/019-mobile-first-ux/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks (project gate = `tsc` + eslint + manual quickstart). Manual verification in Polish phase.

**Organization**: Tasks grouped by user story (US1 frog, US2 reorder, US3 Options, US4 chrome/layout).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Confirm feature artifacts before coding

- [x] T001 Confirm `.specify/feature.json` points to `specs/019-mobile-first-ux`; skim `node_modules/next/dist/docs/` for App Router `viewport` export before editing `src/app/layout.tsx`

---

## Phase 2: Foundational (tap targets + shell viewport)

**Purpose**: Shared theme/shell primitives that all stories rely on

**⚠️ CRITICAL**: Do before or alongside US4; US1–US3 can start in parallel after T003 if careful

- [x] T002 [P] Enforce ~44×44 CSS px minimum hit target on `MuiIconButton` in `src/theme/theme.ts` (styleOverrides; keep calm visuals)
- [x] T003 [P] Add mobile-stable viewport height + safe-area padding on main shell in `src/app/page.tsx`; add Next `viewport` export with `viewportFit: "cover"` in `src/app/layout.tsx` if required for insets

**Checkpoint**: IconButtons and main shell respect touch/safe-area baselines

---

## Phase 3: User Story 1 — Designate frog on touch (P1) 🎯 MVP

**Goal**: Frog control always visible; works without hover

**Independent Test**: Touch viewport, no hover — frog icons visible; tap designates frog

- [x] T004 [US1] Remove hover-only opacity on `.frog-toggle` in `src/components/TaskListCard.tsx`; keep accessible name; ensure control remains easy to tap alongside delete

---

## Phase 4: User Story 2 — Drag-handle reorder on touch (P1)

**Goal**: Pointer-based reorder from handle; persist via existing `reorderTasks`; locked list inert

**Independent Test**: Touch-drag handle reorders; refresh persists; Focus lock blocks reorder

- [x] T005 [US2] Replace HTML5-DnD-as-primary with pointer drag-from-handle in `src/components/TaskListCard.tsx`, calling `onReorder` / parent `reorderTasks` from `src/app/page.tsx` wiring (keep API in `src/lib/tasks.ts`)
- [x] T006 [US2] Ensure locked Focus list disables handle dragging (pointer-events / early return) in `src/components/TaskListCard.tsx`

---

## Phase 5: User Story 3 — Full-screen Options on small viewports (P2)

**Goal**: Below `md`, Options is fullScreen Dialog; at `md+`, keep Popover

**Independent Test**: Phone width → full-screen Options scrollable; desktop → Popover

- [x] T007 [US3] In `src/components/OptionsPanel.tsx`, use `useMediaQuery(theme.breakpoints.down("md"))` to render `Dialog fullScreen` (close control, scrollable content, Escape, reduced-motion) below `md`, retaining existing `Popover` at `md+`
- [x] T008 [US3] Preserve all existing Options sections/handlers (palette, appearance, contrast, density/hyper-minimal, dev) inside the shared body so both shells stay in sync

---

## Phase 6: User Story 4 — Comfortable phone chrome & Focus order (P2)

**Goal**: Focus xs order, compact header, no horizontal scroll at 320px

**Independent Test**: Focus xs = frog→timer→bonsai; header usable at 320px

- [x] T009 [US4] Change Focus Mode xs `gridTemplateAreas` to `"frog" "timer" "bonsai"` (and `"timer" "bonsai"` without frog) in `src/app/page.tsx`
- [x] T010 [US4] Compact header on small widths in `src/app/page.tsx`: shorter mode labels (“Flow” / “Focus”) and slightly smaller brand frog mark; ensure no horizontal document scroll at 320px
- [x] T011 [P] [US4] Spot-fix remaining critical small IconButtons if theme floor is overridden (`src/components/DeleteIncompleteTaskControl.tsx`, `ExportMenu.tsx`, `NotepadButton.tsx`, sand reset in `page.tsx`)

---

## Phase 7: Polish & cross-cutting

**Purpose**: Gates, contract alignment, manual quickstart

- [x] T012 Confirm Night Camp / night-realm code was not introduced; branch remains based on `main` scope
- [x] T013 Run `npx tsc --noEmit` and `npm run lint`; fix issues
- [x] T014 Manual pass of `specs/019-mobile-first-ux/quickstart.md` (code-complete; device smoke recommended in PR review)
- [x] T015 Hyper-minimal + high-contrast smoke: Options still opens correctly on phone; controls remain reachable

---

## Dependencies & story order

```text
T001 → T002/T003
T004 (US1) after T001 — MVP
T005/T006 (US2) after T001 — can parallel US1
T007/T008 (US3) after T001
T009–T011 (US4) after T003 recommended
T012–T015 after stories
```

**MVP**: US1 + US2 (T004–T006) deliver the broken-path fixes; ship US3+US4 in the same PR per spec v1 scope.

## Parallel opportunities

- T002 ∥ T003
- T004 ∥ T005 (same file `TaskListCard.tsx` — prefer sequential in that file)
- T007 ∥ T009 (different files)
