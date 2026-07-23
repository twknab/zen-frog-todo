---
description: "Task list for Sand Day Snapshots"
---

# Tasks: Sand Day Snapshots

**Input**: Design documents from `specs/011-sand-day-snapshots/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sand-snapshot-contract.md, quickstart.md

**Tests**: No automated test tasks required as release gate (constitution). Manual verification via `quickstart.md`. Optional pure-helper checks welcome but not blocking.

**Organization**: Tasks grouped by user story (US1 capture → US2 browse → US3 storage/back-compat polish).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3

## Path Conventions

Single Next.js web app: `src/components/`, `src/lib/`, `src/app/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm groundwork; no new npm dependencies.

- [ ] T001 Confirm Canvas 2D `drawImage` + `toDataURL('image/jpeg')` are sufficient (no new deps) and skim App Router client-component notes under `node_modules/next/dist/docs/` before editing client modules (per `AGENTS.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Snapshot constants, capture helper, today-key persistence, and optional archive field — shared by all stories.

**⚠️ CRITICAL**: Complete before user-story UI work depends on them.

- [ ] T002 Add snapshot constants + pure `captureSandSnapshot(source: HTMLCanvasElement): string | null` in `src/lib/sand.ts` (max edge 240, JPEG quality 0.55, sand-colored background composite, never throws — return `null` on failure) per research Decision 1 & 7 / data-model.md.
- [ ] T003 [P] Add today's snapshot persistence in `src/lib/sand.ts`: key `frog-garden:sand-today-snapshot-v1`, `useTodaySandSnapshot()`, `readTodaySandSnapshot()`, `clearTodaySandSnapshot()` / safe setter that swallows `QuotaExceededError` (FR-011).
- [ ] T004 [P] Extend `ArchivedDay` in `src/lib/dayArchive.ts` with optional `sandSnapshot?: string`; tolerate absent/invalid values when reading (`?? undefined`) — back-compat with pre-feature archives (FR-005).

**Checkpoint**: Capture + storage primitives ready; US1 can wire SandCanvas.

---

## Phase 3: User Story 1 - Keep a keepsake when the sand is smoothed (Priority: P1) 🎯 MVP

**Goal**: Capture compact snapshot immediately before clear; keep latest for today; skip empty; attach on new day / rollover.

**Independent Test**: quickstart Scenarios A–C (mid-day overwrite, empty skip, archive attach).

- [ ] T005 [US1] In `src/components/SandCanvas.tsx`, on `sandResetToken` change: if `strokesRef` has strokes, call `captureSandSnapshot` and write today's snapshot (fail-open); then clear strokes/bitmap as today. Skip write when empty (FR-001, FR-002, FR-003).
- [ ] T006 [US1] Update `useNewDay` in `src/lib/dayArchive.ts` to attach `sandSnapshot` (prefer fresh capture coordination via today key written by canvas wipe order — ensure resetSand runs such that capture lands before archive read, OR read today key after a synchronous capture path); widen empty-day `hasContent` when sand keepsake exists; clear today key after archive (FR-004, Decision 4).
- [ ] T007 [US1] Update `buildRolloverPlan` / `useDailyRollover` in `src/lib/dayArchive.ts` to include `sandSnapshot` from `readTodaySandSnapshot()` when present, widen empty-day guard, and clear today key after rollover (Decision 5). Document that uncleared in-memory strokes after process death cannot be recovered.

**Checkpoint**: Snapshots persist for today and onto archived days; MVP data path complete.

---

## Phase 4: User Story 2 - Browse sand keepsakes in day history (Priority: P2)

**Goal**: Grove shows Today + archived sand thumbnails; lightbox with a11y.

**Independent Test**: quickstart Scenario D (+ Today/archived thumbs visible).

- [ ] T008 [P] [US2] Create `src/components/SandSnapshotLightbox.tsx` — themed MUI `Dialog`, `img` with date-referenced `alt`, Escape/backdrop dismiss, `transitionDuration={0}` under `useReducedMotion()`, focus return via MUI defaults (FR-009, FR-010, FR-012).
- [ ] T009 [US2] Extend `src/components/Grove.tsx` to show a **Today** ribbon entry when `useTodaySandSnapshot()` is non-null (label "Today", thumbnail button opens lightbox); no shame UI when absent (FR-008).
- [ ] T010 [US2] Extend `src/components/GroveDayDialog.tsx` (and/or Grove scene controls) to show a sand thumbnail when `day.sandSnapshot` is set; activating opens `SandSnapshotLightbox` with `archiveEntryLabel` in the accessible name (FR-008, FR-010).
- [ ] T011 [US2] A11y pass: keyboard operability for all new controls, SR names reference date/Today, verify reduced-motion on lightbox; no scoreboard copy (FR-010, FR-014).

**Checkpoint**: Browse + lightbox complete for today and archived days.

---

## Phase 5: User Story 3 - Respect device storage limits (Priority: P3)

**Goal**: Confirm compact encoding, back-compat, fail-open under pressure.

**Independent Test**: quickstart Scenarios E–F; spot-check data URL is `image/jpeg` and small.

- [ ] T012 [US3] Verify capture path always uses JPEG downscale constants (no accidental full PNG); add a brief code comment citing the quota budget in `src/lib/sand.ts` (FR-007, SC-004).
- [ ] T013 [US3] Manually confirm old archived days without `sandSnapshot` still render in Grove/day dialog; confirm quota write failures do not block `resetSand` / `startNewDay` (FR-005, FR-011).

**Checkpoint**: Storage constraints validated.

---

## Phase 6: Polish & Cross-Cutting

- [ ] T014 Run `npx tsc --noEmit` and `npx eslint` (project gate); fix any issues introduced by this feature.
- [ ] T015 Walk `specs/011-sand-day-snapshots/quickstart.md` scenarios A–E in the browser preview; note any gaps for converge.

---

## Dependencies & Execution Order

- **Phase 1 → 2** blocking for all stories.
- **US1 (Phase 3)** before browse is meaningful; can demo MVP via localStorage inspection after T005–T007.
- **US2 (Phase 4)** depends on US1 data existing.
- **US3 (Phase 5)** validates encoding/back-compat; can overlap review with US2 but T012 is mostly confirmation of T002/T005.
- **Polish** after implementation.

```text
T001 → T002 → T005 → T006 → T007
         T003 ↗
         T004 ↗
              → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015
```

## Parallel Opportunities

- T003 || T004 after T002 constants exist (or in parallel with T002 if careful).
- T008 can start once types/helpers exist (even before Grove wiring).

## MVP

Ship Phase 1–3 (capture + archive attach). US2 makes it user-visible; do not stop before US2 for this PR.
