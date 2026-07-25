# Tasks: Garden Critter & Bonsai Visual Upgrade

**Input**: Design documents from `/specs/015-garden-critter-bonsai/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not required as release gate; manual verification via quickstart.md. `tsc --noEmit` + eslint are mandatory.

**Organization**: Tasks grouped by user story for incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1…US4 from spec.md
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Confirm active feature + read Next docs if touching App Router (this feature is mostly client SVG)

- [x] T001 Confirm `.specify/feature.json` points at `specs/015-garden-critter-bonsai` and skim `node_modules/next/dist/docs/` only if App Router files change
- [x] T002 [P] Skim prior art: `specs/006-growing-bonsai/`, `specs/008-frog-friends/contracts/bonsai-render-contract.md`, current `src/components/BonsaiTree.tsx` + `src/lib/bonsai.ts` + `src/lib/frogIcon.ts`

---

## Phase 2: Foundational

**Purpose**: Cap + shared constants before visual stories

**⚠️ CRITICAL**: US1 placement depends on MAX_FROGS

- [x] T003 Raise `MAX_FROGS` from 20 to **28** in `src/lib/bonsai.ts`; update nearby comment; keep reward weights unchanged
- [x] T004 [P] Document dial-back knobs comment block near placement/scale constants in `src/components/BonsaiTree.tsx` (or link to contract)

**Checkpoint**: Cap raised; ready for visual stories

---

## Phase 3: User Story 1 — Roomier, funnier frog crowd (P1) 🎯 MVP

**Goal**: Larger comedy ground frogs, wider distribution, legible at 28, deterministic

**Independent Test**: High frog count → bigger/wider frogs, halo separation, stable reload

### Implementation

- [x] T005 [US1] Regenerate `FROG_POSITIONS` in `src/components/BonsaiTree.tsx` for `MAX_FROGS=28` with wider x-band, slightly deeper y-band, comedy scale range (~1.7–2.9); keep seeded helper; preserve slot 0 baseline spirit
- [x] T006 [US1] Preserve sticker-halo stroke / `paintOrder` / `vectorEffect` on ground frog paths; tweak halo strokeWidth only if needed for larger scales
- [x] T007 [US1] Manually verify density at cap is calm; if sludge, dial scale/band before continuing

**Checkpoint**: US1 visually lands without fruit/tree changes required

---

## Phase 4: User Story 2 — Bigger, more bonsai-like tree (P1)

**Goal**: Moderate tree presence bump, card-contained

**Independent Test**: Mid/high leaves read more bonsai-like without mural overflow

### Implementation

- [x] T008 [US2] Increase `treeScale` base/delta in `src/components/BonsaiTree.tsx` (~15–25% mature presence)
- [x] T009 [US2] Optional small canopy center / composition nudge if scale alone feels cramped; keep `viewBox` unless clearly better
- [x] T010 [US2] Enrich leaves in `src/components/BonsaiTree.tsx`: oval/leaf-ish ellipses with slight rotation + existing three-tone fills (FR-006; was underscoped under US4)
- [x] T010b [US2] Confirm shrub stage still proportionate; Grove card sizes still look fine

**Checkpoint**: Tree presence + richer leaves improved

---

## Phase 5: User Story 3 — Frog-fruit in the canopy (P1)

**Goal**: Replace pink blossom dots with multi-color frog-fruit; unwilted

**Independent Test**: Blossom stages show fruit; wilt leaves fruit cheerful

### Implementation

- [x] T011 [US3] Replace blossom `motion.circle` rendering in `src/components/BonsaiTree.tsx` with small scaled frog paths using `FROG_ICON_PATH` at canopy slots (`BLOSSOM_SLOTS` / `blossoms` count)
- [x] T012 [US3] Theme-token color rotation for fruit fills (primary/secondary/error/success accents); fun not garish
- [x] T013 [US3] Move frog-fruit into critter (non-wilt) layer alongside ground frogs/squirrel so fruit stays cheerful when `isWilting`
- [x] T014 [US3] Keep decorative/a11y: no new interactive targets; parent `role="img"` unchanged; reduced-motion `appear` reused

**Checkpoint**: Pink dots gone; frog-fruit at blossom pacing

---

## Phase 6: User Story 4 — Cohesive critter art (P2)

**Goal**: Frogs/squirrel feel of a piece with hand SVG tree; no new heavy deps

**Independent Test**: Visual cohesion check; `package.json` unchanged (or research-justified only)

### Implementation

- [x] T015 [US4] Polish critter transforms/halo/scale consistency in `src/components/BonsaiTree.tsx` (+ comments in `src/lib/frogIcon.ts` if helpful)
- [x] T016 [US4] Confirm no new dependency added to `package.json` (leaf enrichment lives in T010 / US2)

**Checkpoint**: Art cohesion + richer leaves

---

## Phase 7: Polish & verification

**Purpose**: Gates, Grove, docs

- [ ] T018 [P] Run `npx tsc --noEmit` and eslint; fix issues in touched files
- [ ] T019 [P] Manual pass per `specs/015-garden-critter-bonsai/quickstart.md` (frogs, tree, fruit, wilt, reduced-motion, Grove)
- [ ] T020 Update any stale comments that still say “pink blossoms” / `MAX_FROGS = 20` in `src/` or 015 contract notes if needed
- [ ] T021 Mark tasks complete; prepare PR summary with dial-back knobs + questions for Tyler

---

## Dependencies & Execution Order

```text
Phase 1 Setup
    ↓
Phase 2 Foundational (T003 MAX_FROGS)
    ↓
Phase 3 US1 frogs (MVP) ──→ Phase 4 US2 tree ──→ Phase 5 US3 fruit
    ↓                                              ↓
Phase 6 US4 cohesion/leaves (can overlap late US2/US3 polish)
    ↓
Phase 7 Polish
```

**Story completion order**: US1 → US2 → US3 → US4 (US2/US3 both P1; implement tree before fruit so canopy scale is settled).

**Parallel opportunities**: T002 with T001; T004 with T003; T018/T019 in polish; US4 cohesion (T015) can start after US1.

## Implementation Strategy

1. **MVP**: T003 + US1 (bigger/wider frogs) — immediate delight
2. **Presence**: US2 treeScale
3. **Reward fantasy**: US3 frog-fruit
4. **Polish**: US4 leaves + cohesion + gates

## Dial-back knobs (reference)

- `MAX_FROGS` — `src/lib/bonsai.ts`
- Frog scale / x-y bands — `FROG_POSITIONS` in `BonsaiTree.tsx`
- `treeScale` coefficients — `BonsaiTree.tsx`
- Fruit color token list — `BonsaiTree.tsx`
