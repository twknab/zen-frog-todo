# Tasks: The Growing Bonsai

**Input**: Design documents from `specs/006-growing-bonsai/` (spec.md, plan.md, research.md, data-model.md, quickstart.md)

**Tests**: No automated test tasks — project convention is no test suite (see plan.md Technical Context). The verification gate is `tsc --noEmit` + `eslint` clean plus the manual `quickstart.md` scenarios.

**Organization**: Tasks grouped by the three user stories from spec.md — US1 (grow-with-work, P1/MVP), US2 (bounded maturity, P2), US3 (gentle active-window wilt, P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: Maps to the user story in spec.md this task advances

---

## Phase 1: Setup

No project setup — this feature is additive to the existing Next.js app; no scaffolding or new dependencies.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure derivation core that every user story renders from. Must exist before any story's UI can show a stage.

- [x] T001 Create `src/lib/bonsai.ts` with the stage type + tuning constants: `BonsaiStage` = ordered `["seedling","sapling","leafy","flowering","mature"]`; named constants `TASK_WEIGHT=1`, `SESSION_WEIGHT=3`, `STAGE_THRESHOLDS=[0,3,8,16,28]`, `ACTIVE_START=8`, `ACTIVE_END=17`, `IDLE_HOURS_PER_SHED=3` (per data-model.md).
- [x] T002 In `src/lib/bonsai.ts`, implement the pure helper `activeIdleHours(from: string | null, to: Date): number` — sum only clock-hours within the daily `[ACTIVE_START, ACTIVE_END]` local window between `from` and `to`; return `0` when `from` is null or `to <= from`; never negative; robust to multi-day gaps and clock skew (per data-model.md + FR-007 / clock-oddities edge case).
- [x] T003 In `src/lib/bonsai.ts`, implement the pure `deriveBonsai({ completedCount, focusSessions, lastActivityAt, now })` → `{ stage: BonsaiStage; isWilting: boolean }` implementing the data-model.md contract: `growthPoints` → base stage index via thresholds (cap at mature=4); `wiltSteps = floor(activeIdleHours / IDLE_HOURS_PER_SHED)`; `effectiveIndex = clamp(base - wiltSteps, floor, 4)` where floor = sapling(1) if any history else seedling(0); return `isWilting = wiltSteps > 0`. No numeric level is ever returned for display (FR-006).

**Checkpoint**: `src/lib/bonsai.ts` type-checks and the derivation is a self-contained pure module.

---

## Phase 3: User Story 1 — The bonsai grows as I do my work (Priority: P1) 🎯 MVP

**Goal**: A bonsai card in Flow Mode advances through stages as tasks and focus sessions accumulate, and the stage persists across reload.

**Independent Test**: From empty history, complete tasks + a focus session → the tree visibly advances (session > task); reload → same stage.

- [x] T004 [US1] Add the `lastActivityAt` marker: a `useBonsaiActivity()` hook (or small state in `src/lib/bonsai.ts`'s companion) backed by `usePersistentState<{ lastActivityAt: string | null }>("frog-garden:bonsai-v1", { lastActivityAt: null })`, exposing `lastActivityAt` and `markActivity()` (sets it to `new Date().toISOString()`).
- [x] T005 [US1] Call `markActivity()` on every growth-affecting completion: in `src/lib/tasks.ts` `toggleTaskCompleted` when a task transitions incomplete→complete, and in `src/components/FocusTimer.tsx` at the natural focus-session completion (alongside the existing `recordSessionComplete()`), so the wilt clock resets on real activity (research Decision 2, FR-008 regrowable).
- [x] T006 [P] [US1] Build `src/components/BonsaiTree.tsx`: accepts a `stage` prop, renders a hand-authored inline `<svg>` with additive stage-gated elements (pot+soil always; sprout seedling+; trunk+first leaves sapling+; fuller canopy leafy+; blossoms flowering+; lush canopy mature) using zen theme colors; `role="img"` + a stage-naming `aria-label` (e.g. "Your bonsai is flowering") (FR-010).
- [x] T007 [US1] Wire the Bonsai card into the Flow-Mode Bento grid in `src/app/page.tsx` alongside Sand Mode (Flow only — NOT rendered in Focus Mode): read completed-log length + focus `completedSessions` + `lastActivityAt`, call `deriveBonsai`, and render `<BonsaiTree stage={...} />` inside a `BentoCard`. Client-rendered (page is already `"use client"`); compute `now` at render (research Decision 3 SSR note).

**Checkpoint**: US1 is independently testable — quickstart Scenario 1 passes (grows with work, session > task, survives reload).

---

## Phase 4: User Story 2 — The tree reaches a restful, mature state (Priority: P2)

**Goal**: After enough work the tree holds at mature and never escalates further or shows a number.

**Independent Test**: Seed a large history → tree shows mature; more completions → no further change, no count anywhere.

- [x] T008 [US2] Confirm/enforce the bounded cap in `src/lib/bonsai.ts`: base stage index is clamped at mature (index 4) regardless of how large `growthPoints` grows (FR-005). (Covered by T003's clamp — this task is the explicit verification + any guard needed so overflow never advances past mature.)
- [x] T009 [US2] Verify no numeric/level/streak text is rendered anywhere on the Bonsai card in `src/components/BonsaiTree.tsx` / `src/app/page.tsx` (FR-006, US2 scenario 2) — the mature state shows only the lush visual (optionally a calm subtle idle shimmer, no counter).

**Checkpoint**: US2 testable — quickstart Scenario 2 passes (holds at mature, no numbers).

---

## Phase 5: User Story 3 — Gentle, active-window wilt (Priority: P2)

**Goal**: Idle time within 08:00–17:00 gently sheds (floor at sapling, regrowable); overnight/off-hours never wilt; no alarm/guilt framing.

**Independent Test**: Mid-stage tree + backdated `lastActivityAt` within active hours → shows a small muted shed (never bare); a purely overnight gap → no wilt; complete work → regrows.

- [x] T010 [US3] Surface wilt visually in `src/components/BonsaiTree.tsx`: when `isWilting`, render the current (reduced) stage with a soft muted treatment (a shed leaf or two, gentler color) — never red/alarm, never bare, no "slipping"/countdown copy (FR-007, FR-009, SC-004). The reduced stage already comes from `deriveBonsai`; this task is the calm *presentation* of it.
- [x] T011 [US3] Confirm the sapling floor + regrowable behavior end-to-end (T003 floor logic + T005 markActivity): backdated active-hours idle sheds down to sapling but no further; a completion resets `lastActivityAt` and the tree returns toward its pre-wilt stage (FR-008, FR-008a, SC-003).

**Checkpoint**: US3 testable — quickstart Scenario 3 passes (same-day droop, overnight-immune, sapling floor, recoverable, calm).

---

## Phase 6: Polish & Cross-Cutting

- [ ] T012 Reduced-motion + a11y pass on `src/components/BonsaiTree.tsx`: wrap stage-conditional groups in Framer Motion (soft fade/scale on growth, gentle fade on wilt), and use `useReducedMotion()` to switch to instant stage changes with no lost state (FR-011, quickstart Scenario 4).
- [ ] T013 [P] Verify non-invasiveness (quickstart Scenario 5): Bonsai appears in Flow Mode alongside Sand Mode and is absent in Focus Mode; Sand Mode, task list, timer, completed log, and reflection all behave unchanged.
- [ ] T014 Verification gate: `npx tsc --noEmit` and `npx eslint src --max-warnings=0` both clean, then run all five `quickstart.md` scenarios in the browser preview.

---

## Dependencies & Execution Order

- **Phase 2 (T001–T003)** is the blocking foundation — the pure derivation must exist before any story renders.
- **US1 (Phase 3)** depends on Phase 2. T004 (marker) and T006 (SVG, [P]) are independent of each other; T005 depends on T004; T007 depends on T003 + T004 + T006.
- **US2 (Phase 4)** and **US3 (Phase 5)** both build on US1 being wired in (T007) — the card must render a derived stage before maturity-cap and wilt presentation are meaningful. US2 and US3 are independent of each other.
- **Phase 6** runs last. T014 is the final gate.

## Implementation Strategy

**MVP = Phase 2 + US1 (T001–T007):** a bonsai that grows with real work, persists, and is accessible — the whole point of the feature. US2 (bounded cap, mostly already satisfied by T003) and US3 (wilt presentation) layer on top without touching US1's core.

## Parallel Opportunities

- T006 (`BonsaiTree.tsx` SVG) can be built in parallel with T004/T005 (the activity marker) — different files, no shared code.
- T013 (non-invasiveness check) is independent of T012.

---

## Addendum (2026-07-02, user revisions)

- **Granular growth**: growth is now counted in leaves (each task = 1 leaf, focus session = 3), bounded at `MAX_LEAVES`, so the tree changes on *every* completion — fixing a gap where the earlier 5-discrete-stage model only changed at thresholds (violating US1 scenario 2). Wilt now sheds one leaf per 3h active idle (gentler, more literal). See data-model.md "Granular leaf model".
- **Developer tooling** (new, T-DEV): header "Dev" toggle → "Simulate +3h idle" / "Reset" controls that drive `deriveBonsai({ extraIdleHours })` to exercise wilt on demand. Documented in data-model.md.
- Verified live: per-completion leaf growth (seedling→sapling→…→mature), bounded at mature, simulated wilt sheds to the sapling floor and holds, Reset restores, console clean, tsc+eslint clean.
