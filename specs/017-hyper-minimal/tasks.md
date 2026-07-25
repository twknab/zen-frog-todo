# Tasks: Hyper Minimal Mode

**Input**: Design documents from `specs/017-hyper-minimal/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual only (constitution gate: tsc + eslint + quickstart). No automated test tasks.

## Phase 1: Setup

**Purpose**: Point Spec Kit at this feature and confirm branch baseline

- [x] T001 Confirm `.specify/feature.json` → `specs/017-hyper-minimal`; branch from `main` (no palette-theme branch)

---

## Phase 2: Foundational

**Purpose**: Shared preference API before UI consumers

- [x] T002 Create `src/lib/hyperMinimal.ts` with `HYPER_MINIMAL_KEY = "frog-garden:hyper-minimal-v1"` and `useHyperMinimal()` via `usePersistentState(boolean, false)`
- [x] T003 [P] Create `src/components/Chrome.tsx` — renders children only when Hyper Minimal is off

**Checkpoint**: Hook + Chrome ready for Options and dashboard

---

## Phase 3: User Story 1 - Toggle Hyper Minimal from Options (P1) 🎯 MVP

**Goal**: Options switch persists and does not close the popover

**Independent Test**: Toggle in Options; reload; popover stays open on change

- [x] T004 [US1] Add Hyper Minimal Switch in `src/components/OptionsPanel.tsx` near Appearance/Dev; wire `useHyperMinimal`; keep popover open (no `handleClose` on change); keep Options labels always visible

**Checkpoint**: Preference toggles and persists

---

## Phase 4: User Story 2 - Raw functionality in Flow and Focus (P1)

**Goal**: Strip decorative chrome; keep functional surfaces in both modes

**Independent Test**: Enable Hyper Minimal; verify Flow and Focus per contract

- [x] T005 [US2] In `src/app/page.tsx`, wrap/hide brand mark, wordmark, tagline, card title rows (icons + titles/chips), sand helper caption; keep interactive guts and header actions
- [x] T006 [P] [US2] In `src/components/FocusTimer.tsx`, hide session-count caption and phase helper sentences when Hyper Minimal; keep dial, digits, buttons, ambient control
- [x] T007 [P] [US2] In `src/components/Grove.tsx`, hide "The Grove" title row chrome and empty instructional copy when Hyper Minimal; keep show/hide control and interactive grove surfaces

**Checkpoint**: Both modes feel raw-functional with garden goodies intact

---

## Phase 5: User Story 3 - Accessibility preserved (P1)

**Goal**: Icon-only / essential controls remain named

**Independent Test**: Tab + inspect aria-labels with Hyper Minimal on

- [x] T008 [US3] Audit Export, Notepad, Options, sand reset, ambient, mode switch, grove toggle for accessible names when Hyper Minimal is on; add/fix labels only if missing (do not remove existing `aria-label`s)

**Checkpoint**: A11y contract satisfied

---

## Phase 6: Polish & Verification

- [x] T009 Run `npx tsc --noEmit` and `npm run lint` (or eslint with max-warnings 0); fix issues
- [x] T010 Manual pass of `quickstart.md`; mark tasks complete; update feature artifacts if needed

## Dependencies

- T002 → T003/T004/T005/T006/T007
- T004 (US1) can ship before full chrome strip but T005–T007 complete the feature
- T008 after chrome gates exist
- T009–T010 last

## Parallel opportunities

- T003 || after T002
- T006 || T007 after T002
- T005 sequential with care (main page) but independent of T006/T007 file-wise
