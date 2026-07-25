# Tasks: Night Camp & Work Window

**Input**: Design documents from `/specs/017-night-camp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not required as release gate; manual verification via `quickstart.md`. `tsc --noEmit` + eslint are mandatory.

**Organization**: Tasks grouped by user story (US1–US7 from spec.md). Dev harness (US4) is P1 — do not defer.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: US1…US7 from spec.md
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Confirm feature pointer + skim prior art / already-landed realm stub

- [x] T001 Confirm `.specify/feature.json` points at `specs/017-night-camp` and skim constitution Product Model + `docs/product-model.md`
- [x] T002 [P] Skim prior art: `src/lib/gardenRealm.ts`, `src/lib/bonsai.ts`, `src/lib/dayArchive.ts`, `src/components/OptionsPanel.tsx`, `src/components/GardenBackdrop.tsx`, `src/app/page.tsx` Dev strip, contracts in `specs/017-night-camp/contracts/`

---

## Phase 2: Foundational (Blocking)

**Purpose**: Work-window persistence + AM/PM helpers + wire wilt/realm to one brain — blocks all stories

**⚠️ CRITICAL**: No user-story UI/routing until WorkWindow + `resolveRealm` are the shared source of truth

- [x] T003 Persist `WorkWindow` (`frog-garden:work-window-v1`, default 8/17) with normalize/validate helpers in `src/lib/gardenRealm.ts` (or thin `src/lib/workWindow.ts` re-exporting from gardenRealm)
- [x] T004 [P] Add AM/PM ↔ 24h conversion helpers in `src/lib/gardenRealm.ts` (or `src/lib/workWindow.ts`) for Options UI
- [x] T005 Refactor `activeIdleHours` / wilt path in `src/lib/bonsai.ts` to accept configured `WorkWindow` instead of hardcoded-only `ACTIVE_START`/`ACTIVE_END` (keep constants as defaults)
- [x] T006 Export a small `useWorkWindow()` (or equivalent) hook alongside garden realm helpers so `page.tsx` / Options share one persisted window

**Checkpoint**: Work window persisted; wilt can use configured hours; AM/PM helpers ready

---

## Phase 3: User Story 1 — Set work hours in Options (P1) 🎯 MVP slice A

**Goal**: Options AM/PM work-hours controls; defaults 8 AM–5 PM; persist; a11y

**Independent Test**: Change hours in Options → reload → still applied; defaults on fresh storage

### Implementation

- [x] T007 [US1] Add Work hours section to `src/components/OptionsPanel.tsx` with AM/PM start/end controls wired to `useWorkWindow` / gardenRealm helpers
- [x] T008 [US1] Calm validation UX for invalid same-day windows (end before/equal start) in `src/components/OptionsPanel.tsx` — never brick; support midnight-spanning if helpers allow
- [x] T009 [US1] Ensure work-hours controls are labelled, keyboard-operable, and announce AM/PM (aria) in `src/components/OptionsPanel.tsx`

**Checkpoint**: User can set work window without Dev tools

---

## Phase 4: User Story 2 — Day Garden stays work-centric (P1)

**Goal**: Day-realm completions grow bonsai; wilt uses configured window; off-window idle does not wilt

**Independent Test**: Inside work window (or Force day) → growth works; wilt uses configured hours; off-window idle no wilt

### Implementation

- [x] T010 [US2] Thread configured `WorkWindow` + effective realm into bonsai derivation call sites in `src/app/page.tsx` (and any other `deriveBonsai` callers)
- [x] T011 [US2] Gate wilt application so idle wilt only applies when effective realm is `"day"` (per research Decision 4) in `src/lib/bonsai.ts` and/or `src/app/page.tsx`
- [x] T012 [US2] Verify day-realm completions still call `recordGrowth` with existing leaf/frog weights from `src/app/page.tsx` / task + focus handlers

**Checkpoint**: Day loop unchanged for daytime; window-aware wilt

---

## Phase 5: User Story 3 — Night Camp rewards + bonsai sleeps (P1)

**Goal**: Night ledger + atmosphere + camp scene stages; bonsai sleeps; UI never blocked

**Independent Test**: Force night → Complete focus → night advances, bonsai unchanged; dim overlay; Appearance unchanged

### Implementation

- [x] T013 [US3] Create night ledger module `src/lib/nightCamp.ts`: events, weights (mirror day task/session/frog), progress, stage 0–4 + poetic labels, `useNightCamp()` persist `frog-garden:night-camp-v1`
- [x] T014 [US3] Route completions by effective realm in `src/app/page.tsx` (and shared completion helpers): day → `recordGrowth`; night → night ledger only (no day leaves/frogs)
- [x] T015 [P] [US3] Add night dim/overlay when effective realm is night in `src/components/GardenBackdrop.tsx` (or thin wrapper) — MUST NOT force Appearance; preserve WCAG AA for chrome/text
- [x] T016 [US3] Create `src/components/NightCampScene.tsx` SVG scene: fireflies, growing campfire, stars, moon across ~4–5 stages; respect `prefers-reduced-motion`
- [x] T017 [US3] Compose Night Camp scene into bonsai card area in `src/app/page.tsx` when effective realm is night (bonsai may show soft asleep treatment; must remain non-blocking)
- [x] T018 [US3] Optional soft “asleep” presentation for `src/components/BonsaiTree.tsx` when night (no growth pulses); keep decorative `role="img"` contract

**Checkpoint**: Dual worlds visible; night credit works; UI fully usable

---

## Phase 6: User Story 4 — Dev Mode force night/day harness (P1)

**Goal**: Force night / Force day / Follow clock drive real routing; Simulate idle + Complete focus + Reset behave per contract

**Independent Test**: Run `quickstart.md` § B Dev harness matrix end-to-end

### Implementation

- [x] T019 [US4] Finish Dev realm indicator + remove temporary “wire up with 017” caption in `src/app/page.tsx`; keep `aria-label="Dev garden realm"` ToggleButtonGroup
- [x] T020 [US4] Wire Dev **Complete focus session** through effective-realm routing (night ledger vs day growth) in `src/app/page.tsx`
- [x] T021 [US4] Enforce FR-023: Simulate +1h idle produces **no additional wilt** while effective realm is night; day force keeps today’s wilt sim — `src/lib/bonsai.ts` / `src/app/page.tsx`
- [x] T022 [US4] Extend Dev **Reset** to clear both Day Garden (`resetBonsai`) and Night Camp ledger in `src/app/page.tsx` / `src/lib/nightCamp.ts`
- [x] T023 [US4] Confirm Dev tools OFF ignores stored override via `resolveRealm` (`devToolsEnabled: false`) — `src/lib/gardenRealm.ts` + `src/app/page.tsx`

**Checkpoint**: SC-009 / SC-010 pass manually

---

## Phase 7: User Story 5 — Frogs join the night (P1)

**Goal**: Day frogs influence night frog presence; frogs participate with fireflies/trinkets

**Independent Test**: High vs low day frogs → visibly more camp frogs; night progress shows frog–firefly participation

### Implementation

- [x] T024 [US5] Derive `nightFrogs` from day frog count + night progress in `src/lib/nightCamp.ts` (data-model `f(dayFrogs, progress)`)
- [x] T025 [US5] Render night frogs + firefly interaction vocabulary in `src/components/NightCampScene.tsx` (calm, non-gory; theme-aware greens OK for ground-of-camp frogs; keep fruit/accents distinct if reused)
- [x] T026 [US5] Pass day `frogs` + night derived view-model into Night Camp from `src/app/page.tsx`; ensure a11y description covers night state under garden img/region

**Checkpoint**: Camp feels inhabited; frog scaling obvious

---

## Phase 8: User Story 6 — Summaries show both worlds (P2)

**Goal**: Live garden summary + Grove archive show differentiated Day vs Night beats

**Independent Test**: Day + night progress → summary/Grove show both; empty night stays calm

### Implementation

- [x] T027 [US6] Extend Start-a-new-day snapshot in `src/lib/dayArchive.ts` with optional `nightCamp: { progress, stage, stageLabel }`; clear night ledger with day reset
- [x] T028 [P] [US6] Differentiate Day Garden vs Night Camp in live bonsai info / garden summary affordance (tooltip or adjacent copy) in the bonsai card components used by `src/app/page.tsx`
- [x] T029 [US6] Render archived Night Camp beat in `src/components/Grove.tsx` when `nightCamp` present; calm resting/absent when missing — no guilt copy

**Checkpoint**: Memory surfaces show sibling worlds

---

## Phase 9: User Story 7 — Soft day/night boundary (P3)

**Goal**: Optional calm crossfade at window edge; reduced-motion snaps

**Independent Test**: Near work end/start, atmosphere transitions calmly (or instantly if reduced motion)

### Implementation

- [x] T030 [US7] Add optional short dusk/dawn crossfade for night overlay / camp opacity in `src/components/GardenBackdrop.tsx` and/or `src/components/NightCampScene.tsx`; instant under `prefers-reduced-motion`
- [x] T031 [US7] On day resume, rest/fade Night Camp ornaments and ensure new completions credit Day Garden (`src/app/page.tsx` routing already handles; verify visually)

**Checkpoint**: Polish only — P1 shippable without this phase

---

## Phase 10: Polish & Cross-Cutting

**Purpose**: Docs, gates, quickstart pass

- [x] T032 [P] Update `README.md` / `docs/product-model.md` if shipped behavior differs from draft wording; remove any “not yet wired” Dev captions
- [x] T033 Run `npx tsc --noEmit` and eslint on touched files; fix issues
- [x] T034 Execute `specs/017-night-camp/quickstart.md` Dev harness matrix + night scene + Grove checks; tick checklist notes in `specs/017-night-camp/checklists/requirements.md` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → no deps
- **Foundational (Phase 2)** → blocks all stories
- **US1 (Options)** → after foundational
- **US2 (Day wilt/growth)** → after foundational; pairs with US1 window
- **US3 (Night ledger + scene)** → after foundational; needs realm brain
- **US4 (Dev harness)** → after US3 routing exists (can stub earlier but Complete focus / wilt rules need US3/US2)
- **US5 (Night frogs)** → after US3 scene
- **US6 (Summaries)** → after US3 ledger
- **US7 (Crossfade)** → after US3 atmosphere
- **Polish** → after desired stories

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 Work hours | Foundational |
| US2 Day core | Foundational (+ US1 for configured window in practice) |
| US3 Night Camp | Foundational |
| US4 Dev harness | US2 + US3 (routing + wilt + ledger) |
| US5 Night frogs | US3 |
| US6 Summaries | US3 |
| US7 Soft boundary | US3 |

### Parallel Opportunities

- T002 with T001
- T004 with T003
- T015 (backdrop) parallel with T013 (ledger) once types exist
- T028 parallel with T027
- T032 parallel with T033

---

## Parallel Example: After Foundational

```bash
# Parallel tracks once T003–T006 done:
Task: "US1 Options work hours in OptionsPanel.tsx"
Task: "US3 nightCamp.ts ledger module"
Task: "US3 GardenBackdrop night dim"
```

---

## Implementation Strategy

### MVP First

1. Phase 1–2 (Setup + Foundational)
2. US1 (work hours) + US2 (day wilt/window) + US3 (night ledger/scene) + US4 (Dev harness)
3. **STOP** — validate `quickstart.md` § B matrix
4. Then US5 frogs → US6 summaries → US7 polish

### Suggested MVP scope

**US1 + US2 + US3 + US4** — dual worlds testable via Dev Force night without waiting on the clock.

### Incremental Delivery

1. Foundational → Options hours  
2. Day window-aware wilt  
3. Night ledger + scene + dim  
4. Dev harness parity with Simulate idle  
5. Frogs at camp  
6. Grove/summary  
7. Soft dusk  

---

## Notes

- [P] = different files, safe parallel
- No automated test tasks (not requested); manual quickstart is the gate
- Commit after each story checkpoint when pushing to PR #22
- Constitution: never force Appearance; never block UI; night vibes up
