---
description: "Task list for Task-completion celebration"
---

# Tasks: Task-completion celebration

**Input**: Design documents from `/specs/005-completion-celebration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/celebration-ui-contract.md, quickstart.md

**Tests**: No automated test tasks are generated — the spec requests none and the constitution
exempts visual/animation code from strict TDD (Technology Constraints). Validation is manual
via `quickstart.md`.

**Organization**: Tasks are grouped by user story (US1, US2) so each is independently testable.

> **Reconciliation mode**: A working implementation already exists
> (`src/components/Celebration.tsx`, `src/theme/ThemeRegistry.tsx`, `src/app/page.tsx`,
> `src/components/TaskListCard.tsx`). Tasks are framed as **verify-and-reconcile against the
> spec**: confirm the behavior/guarantee, and fix only where the code diverges from the
> referenced FR/contract. If a check passes as-is, mark the task complete with a one-line note.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 (Setup, Foundational, Polish carry no story label)

## Path Conventions

Single Next.js app; all paths are repo-relative under `src/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the environment needed by the feature

- [X] T001 Confirm `framer-motion` (^12) is present in `package.json` and importable (`motion`, `useReducedMotion`); it is the only dependency this feature relies on beyond the existing MUI/React stack
- [X] T002 [P] Confirm the muted celebration palette in `src/components/Celebration.tsx` uses nature-derived theme tones (moss/clay/dusk/ochre family), not saturated/bright colors (FR-007)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The provider, trigger hook, and overlay that BOTH user stories depend on

**⚠️ CRITICAL**: No user-story behavior works until this phase is verified/complete

- [X] T003 Verify/reconcile the `CelebrationContext` + `useCelebration()` imperative trigger `(x, y) => void` in `src/components/Celebration.tsx` matches the trigger interface in `contracts/celebration-ui-contract.md` (Section A)
- [X] T004 Verify/reconcile the `CelebrationProvider` transient `Burst` state with unique ids and timer-based self-removal (~1s) in `src/components/Celebration.tsx`, per `data-model.md` lifecycle and FR-004/FR-009 (no orphaned bursts)
- [X] T005 Verify/reconcile the single fixed, full-viewport, `pointer-events: none`, `aria-hidden` overlay layer rendered above app content in `src/components/Celebration.tsx` (contract C-8, FR-006; never intercepts input, never shifts layout)
- [X] T006 Verify `<CelebrationProvider>` wraps the app once inside `src/theme/ThemeRegistry.tsx` so both call-sites can access the trigger

**Checkpoint**: Provider mounted, trigger available, overlay non-blocking — user stories can proceed

---

## Phase 3: User Story 1 - A calm moment of reward on completing a task (Priority: P1) 🎯 MVP

**Goal**: A brief, calm, self-dismissing burst plays at the checkbox when a task or the frog is completed — and only then.

**Independent Test**: Check off a task and the frog; confirm a gentle burst appears at each checkbox and clears itself; un-check one and confirm nothing plays.

### Implementation for User Story 1

- [X] T007 [US1] Verify/reconcile the full-motion `BurstView` particle spray (muted palette, calm easing `[0.22, 1, 0.36, 1]`, ~0.9s lifetime, small dots) in `src/components/Celebration.tsx` (FR-001, FR-007; contract C-1, C-6)
- [X] T008 [P] [US1] Verify/reconcile the task-row checkbox in `src/components/TaskListCard.tsx` calls `celebrate()` with the checkbox's viewport-center coordinates **only** on incomplete→complete, and applies the toggle without delay (FR-001, FR-002, FR-003, FR-005; contract C-2..C-4)
- [X] T009 [P] [US1] Verify/reconcile the frog checkbox in `src/app/page.tsx` calls `celebrate()` with the checkbox's viewport-center coordinates **only** on incomplete→complete, and applies the toggle without delay (FR-001, FR-002, FR-003, FR-005)
- [X] T010 [US1] Confirm the burst contains no counts/streaks/points/ranks/comparison and no guilt/urgency text in `src/components/Celebration.tsx` (FR-008; contract C-7; constitution Principle II)

**Checkpoint**: Completing tasks and the frog shows a calm, self-clearing celebration; un-completing shows none — MVP is functional

---

## Phase 4: User Story 2 - Respect for reduced-motion and calm preferences (Priority: P1)

**Goal**: Under `prefers-reduced-motion`, completion still acknowledges the user, but with a minimal-motion effect instead of a particle spray.

**Independent Test**: Enable OS/DevTools reduced-motion, complete a task, and confirm a single soft ring (not a spray) appears.

### Implementation for User Story 2

- [X] T011 [US2] Verify/reconcile the `useReducedMotion()` branch in `src/components/Celebration.tsx` that renders a single soft expanding ring instead of the particle spray when reduced motion is requested (FR-006; contract C-5; constitution Principle IV)

**Checkpoint**: Both the full and reduced-motion acknowledgements work, selected by user preference

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story guarantees and validation

- [X] T012 [P] Stress-check rapid successive completions (≥5 quick check-offs): confirm each animates independently with no jank and no leftover DOM afterward, in `src/components/Celebration.tsx` (FR-009, SC-004)
- [X] T013 [P] Containment check on narrow/scrolled viewports: confirm bursts stay visually contained, add no horizontal scroll, and never permanently cover/block controls (spec Edge Cases; contract C-8)
- [ ] T014 Run all scenarios in `specs/005-completion-celebration/quickstart.md`, including the reconciliation check, and record any divergence
- [X] T015 [P] Run `npm run build` and ESLint to confirm no type/lint regressions from any reconciliation edits

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational; independent of US1 (both edit the reduced/full branches of the same overlay but are separately testable)
- **Polish (Phase 5)**: Depends on US1 + US2

### Within Each User Story

- Foundational provider/overlay before call-sites
- In US1: `BurstView` rendering (T007) and call-sites (T008, T009) can proceed together; T010 reviews the same file as T007

### Parallel Opportunities

- T002 runs alongside T001
- T008 and T009 are different files → parallel
- Polish T012, T013, T015 are independent checks → parallel

---

## Parallel Example: User Story 1

```bash
# The two call-sites live in different files and can be verified/edited together:
Task: "T008 task-row checkbox celebrate() wiring in src/components/TaskListCard.tsx"
Task: "T009 frog checkbox celebrate() wiring in src/app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational (CRITICAL) → 3. Phase 3 US1
4. **STOP and VALIDATE**: complete a task + frog, confirm calm burst and no effect on un-check
5. Demo — this is the MVP

### Incremental Delivery

1. Setup + Foundational → provider/overlay ready
2. US1 → calm celebration on completion (MVP)
3. US2 → reduced-motion fallback
4. Polish → stress/containment/build validation

---

## Notes

- Because the feature already exists, most tasks are **verify → note pass, or reconcile if diverging**; only genuine gaps require edits.
- [P] = different files, no dependencies.
- No automated tests generated (see Tests note above); rely on `quickstart.md`.
- Constitution watch-items during reconciliation: Principle II (no scoreboard — T010) and Principle IV (reduced motion — T011).
