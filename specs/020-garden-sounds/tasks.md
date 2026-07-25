# Tasks: Empty Frog Helper Copy & Garden Sounds

**Input**: Design documents from `/specs/020-garden-sounds/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/garden-sounds-contract.md, quickstart.md

**Tests**: Not included — release gate is `tsc --noEmit` + `eslint --max-warnings=0` plus manual verification against `quickstart.md`.

**Organization**: Tasks grouped by user story. Sound helpers (Phase 2) unblock US2–US4.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Confirm baseline clean: `npx tsc --noEmit` and `npx eslint --max-warnings=0` at repo root (checkpoint only).

---

## Phase 2: Foundational — sound helpers

**Goal**: Four calm synthesized exports on the shared AudioContext.

- [X] T002 [P] Add `playRibbit()` and `playFrogChorus()` to `src/lib/sound.ts` per `contracts/garden-sounds-contract.md` (shared context, try/catch or equivalent silent failure, calm short envelopes).
- [X] T003 [P] Add `playSquirrelChuckle()` and `playTaskAdded()` to `src/lib/sound.ts` (distinct from ribbits and `playChime`; same shared-context / silent-failure rules).

**Checkpoint**: Module exports compile; no wiring yet.

---

## Phase 3: User Story 1 - Empty frog helper (Priority: P1) 🎯 MVP

**Goal**: Visible empty frog card teaches designation.

- [X] T004 [US1] In `src/app/page.tsx` empty-frog branch, add helper Typography under “No frog chosen yet”: `Hover a task, then click its frog to choose today’s frog.` (secondary/body styling; calm).
- [X] T005 [US1] Manually verify Scenario A in `quickstart.md` (skip if no browser; note in PR).

**Checkpoint**: US1 independently shippable.

---

## Phase 4: User Story 2 - Completion ribbits (Priority: P1)

**Goal**: Frog chorus vs light ribbit on incomplete→complete only.

- [X] T006 [US2] In `src/lib/tasks.ts` `toggleTaskCompleted`, when `nowCompleted`, call `playFrogChorus()` if `id === state.frogTaskId`, else `playRibbit()`. Do not play on uncomplete. Leave `celebrate` call sites unchanged.
- [X] T007 [US2] Manually verify Scenario B in `quickstart.md`.

**Checkpoint**: US1 + US2 work.

---

## Phase 5: User Story 3 - Squirrel chuckle (Priority: P2)

**Goal**: Chuckle once on absent→present.

- [X] T008 [US3] In `src/components/BonsaiTree.tsx`, add effect + ref on `showSquirrel`; call `playSquirrelChuckle()` only on false→true. No toast/copy.
- [X] T009 [US3] Manually verify Scenario C when feasible.

**Checkpoint**: US3 independent.

---

## Phase 6: User Story 4 - Add-task reward (Priority: P2)

**Goal**: Reward sound on successful add only.

- [X] T010 [US4] In `src/lib/tasks.ts` `addTask`, after accepting trimmed non-empty title, call `playTaskAdded()`.
- [X] T011 [US4] Manually verify Scenario D.

**Checkpoint**: All stories implemented.

---

## Phase 7: Polish & gate

- [X] T012 Run `npx tsc --noEmit` and `npx eslint --max-warnings=0`; fix any issues from this feature.
- [X] T013 Mark tasks complete; ensure `.specify/feature.json` points at `specs/020-garden-sounds`.

## Dependencies

- T002/T003 before T006/T008/T010
- T004 independent of sound work
- T012 after implementation tasks

## Parallel opportunities

- T002 ∥ T003
- T004 ∥ sound foundational work
- T008 ∥ T006/T010 after T002/T003

---

## Phase 8: Convergence

**Date**: 2026-07-25

Assessed codebase against spec.md / plan.md / tasks.md.

- Empty frog helper copy present under “No frog chosen yet” in `src/app/page.tsx`.
- `playRibbit`, `playFrogChorus`, `playSquirrelChuckle`, `playTaskAdded` exported from `src/lib/sound.ts` on shared AudioContext with silent failure.
- Completion + add wiring in `src/lib/tasks.ts` (incomplete→complete only; frog vs non-frog).
- Squirrel absent→present effect in `src/components/BonsaiTree.tsx` (skips first paint).
- `tsc --noEmit` + eslint clean.

**Outcome**: converged — no additional tasks appended.
