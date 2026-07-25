# Feature Specification: Garden Critter & Bonsai Visual Upgrade

**Feature Branch**: `015-garden-critter-bonsai`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Bigger frog garden + bonsai presence (comedy frogs, frog-fruit) — more/larger ground frogs with wider distribution; bigger more bonsai-like tree; richer leaves; canopy fruit as multi-colored frogs replacing pink blossom dots; cohesive hand-SVG critter art; stay calm, deterministic, a11y-safe, dependency-light."

**Prior art**: Builds on `specs/006-growing-bonsai/` (growth, blossoms, wilt) and `specs/008-frog-friends/` (ground frogs, squirrel, deterministic placement, no wilt for critters).

## Clarifications

### Session 2026-07-25 (defaults — user said "do it")

- Q: Do frog-fruit replace pink blossom dots or sit alongside them? → A: **Replace**. Same growth triggers that unlock blossoms today unlock frog-fruit slots instead.
- Q: Are frog-fruit interactive? → A: **No**. Canopy reward layer only; ground frogs remain the friends layer.
- Q: Canvas rewrite or heavy drawing library? → A: **No**. Stay mostly hand SVG + Framer Motion opacity/appear; library only if research.md justifies bundle size + calm aesthetic (default: no new deps).
- Q: Grove archived bonsai contract? → A: **Keep current contract** unless a small additive improvement is free; do not break Grove.
- Q: Wilt behavior for frogs/fruit? → A: Leaves/tree still wilt; **ground frogs and frog-fruit stay unwilted / cheerful** (008 spirit).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A roomier, funnier frog crowd (Priority: P1)

When the person has earned frog friends for the day, the crowd around the pot feels more like a cheerful garden gathering — frogs are a bit larger (comedy scale), spread more widely across the ground band, and the pot still stays readable (not sludge). Positions stay stable and deterministic; the scene never reshuffles on reload.

**Why this priority**: The user-facing delight of "more frogs, funnier frogs" is the heart of this upgrade; tree and fruit polish build on a crowd that already reads well.

**Independent Test**: Reach a high frog count (near or at the raised cap) and confirm frogs are larger and more widely distributed than before, still legible, sticker-halo separation preserved, same arrangement on reload.

**Acceptance Scenarios**:

1. **Given** a day with several earned frogs, **When** the person views the Bonsai card, **Then** ground frogs read larger / more comedic than the previous baseline while remaining clearly individual shapes.
2. **Given** a frog count near the raised cap, **When** the scene is viewed, **Then** frogs use a wider ground distribution than before and the pot/tree remain readable (not overlapping into unreadable sludge).
3. **Given** any frog count, **When** the view re-renders or the page reloads, **Then** frog positions and scales are identical (deterministic / seeded — no per-render randomness).
4. **Given** `prefers-reduced-motion`, **When** frogs appear or the count changes, **Then** appearance is instant or minimal and no frog is left invisible.

---

### User Story 2 - A bigger, more bonsai-like tree (Priority: P1)

The living bonsai in the Bonsai card has stronger visual presence — it reads more like a small tree in a pot, still calm and contained in the card (not a mural that overwhelms the layout).

**Why this priority**: Co-equal with the frog crowd for "garden upgrade" feel; without more tree presence the richer canopy rewards feel cramped.

**Independent Test**: Compare a mid/high-leaf tree to the previous composition; the tree occupies more of the scene / feels more bonsai-like while staying inside the card and calm.

**Acceptance Scenarios**:

1. **Given** a tree with substantial leaf growth, **When** viewed in the Bonsai card, **Then** the tree reads larger / more bonsai-like than the previous scale range without overflowing or dominating the whole page.
2. **Given** a young shrub stage, **When** viewed, **Then** the tree still feels calm and proportionate (growth presence increases with progress, not a constant giant).

---

### User Story 3 - Frog-fruit in the canopy (Priority: P1)

As the tree reaches blossom stages, the canopy reward is no longer pink blossom dots — instead, small multi-colored frog-fruit hang in the canopy. They feel fun and theme-aware, never garish, and stay decorative.

**Why this priority**: Direct replacement of the blossom visual reward; core to the "comedy garden" fantasy.

**Independent Test**: Grow the tree into blossom stages and confirm frog-fruit appear in those slots (same unlock pacing as former blossoms), multi-colored, decorative only, and unwilted when the tree wilts.

**Acceptance Scenarios**:

1. **Given** leaf growth that previously unlocked blossoms, **When** the person views the tree, **Then** frog-fruit appear in the canopy reward slots instead of pink blossom circles.
2. **Given** multiple frog-fruit visible, **Then** they use a small set of theme-aware colors (multi-color, fun, not neon/garish).
3. **Given** the tree is wilting, **When** frog-fruit are present, **Then** the fruit stay cheerful / unwilted while leaves and tree still show wilt.
4. **Given** assistive technology, **Then** frog-fruit remain decorative under the existing bonsai image role (no separate interactive controls or count UI).

---

### User Story 4 - Cohesive critter art (Priority: P2)

Ground frogs and the occasional squirrel feel more cohesive with the hand-drawn SVG tree — either via refined paths / a small drawing helper, or careful styling — without pulling in a heavy game engine or unnecessary library.

**Why this priority**: Polish that elevates the scene; valuable after presence and frog-fruit land.

**Independent Test**: Side-by-side (or before/after) visual check that frog + squirrel weight, stroke, and halo feel of a piece with the tree; no new heavy dependency unless explicitly justified in research.

**Acceptance Scenarios**:

1. **Given** frogs and squirrel in the scene, **When** viewed with the tree, **Then** critters read as part of the same hand-crafted illustration family (not a mismatched icon sticker dump).
2. **Given** the dependency set, **Then** no heavy game engine is introduced; any new library is justified in research or none is added.

---

### Edge Cases

- **At the raised frog cap**: scene stays calm; further rewards add no frogs (008 contract preserved).
- **Reduced motion**: frogs, squirrel, frog-fruit, and leaf appear transitions respect reduced motion (instant/minimal; opacity-safe so nothing is stranded invisible).
- **Wilt**: tree/leaves wilt; ground frogs + frog-fruit do not.
- **Grove archived bonsai**: existing Grove rendering contract remains valid; no required redesign.
- **Theme / dark mode**: frog-fruit and leaf treatments stay theme-aware and calm in light and dark.
- **Small viewport**: wider frog distribution still stays inside the bonsai scene/card.
- **Baseline day**: still shows the single baseline ground frog; frog-fruit only appear when blossom-stage growth unlocks them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ground frog placement MUST use a wider distribution across the ground band than the previous layout, while keeping frogs inside the bonsai scene and preserving sticker-halo / spacing practices so the pot remains readable at the raised cap.
- **FR-002**: Ground frog visual scale MUST increase for a more comedic presence, without making individual frogs unreadable or turning the crowd into sludge at the cap.
- **FR-003**: The frog population cap (`MAX_FROGS` or successor) MUST be raised thoughtfully above the previous ~20 bound such that density at the new cap remains calm and legible; exact value is a planning/tuning detail.
- **FR-004**: Frog positions and scales MUST remain deterministic and stable (seeded / computed without per-render randomness); arrangements grow additively (008 FR-004 / FR-005 spirit).
- **FR-005**: The living bonsai's visual presence MUST increase (tree scale range and/or viewBox/composition) so the tree reads more bonsai-like while remaining calm and contained in the Bonsai card.
- **FR-006**: Leaf treatment MUST be enriched (richer than the previous simple leaf marks) while staying calm, theme-aware, and legible at wilt and full growth.
- **FR-007**: Canopy blossom-stage rewards MUST render as multi-colored frog-fruit that **replace** the previous pink blossom dots, unlocked by the same growth triggers that previously unlocked blossom count/slots.
- **FR-008**: Frog-fruit MUST be decorative only (not interactive), theme-aware, fun but not garish, and hidden from assistive technology under the bonsai's existing image semantics.
- **FR-009**: When the tree is wilting, leaves/tree MUST still wilt; ground frogs and frog-fruit MUST remain unwilted / cheerful.
- **FR-010**: Critter art (frog + squirrel) MUST feel more cohesive with the hand-drawn SVG tree; implementation MUST prefer dependency-light hand SVG (and existing Framer Motion opacity/appear). A new drawing library MUST NOT be added unless research.md justifies it on bundle size and calm aesthetic; heavy game engines are prohibited.
- **FR-011**: All motion for frogs, squirrel, frog-fruit, and leaf appear MUST respect `prefers-reduced-motion` with instant or minimal fallbacks and opacity-safe appear (no stranded invisible marks).
- **FR-012**: The feature MUST remain local-first — no backend, auth, or telemetry; no unrelated Options/palette redesign.
- **FR-013**: Grove archived bonsai rendering MUST keep its current contract unless a small additive improvement is free and non-breaking.
- **FR-014**: Growth math weights (task/focus/frog reward weights) MUST NOT be redesigned unless a minimal change is required for visual density; default is keep existing weights.

### Key Entities *(include if feature involves data)*

- **Ground frog placement**: Deterministic slot map (index → position + scale) around the pot base; wider band + larger comedy scale; bounded by the raised cap; additive growth.
- **Frog-fruit (canopy reward)**: Decorative canopy marks unlocked by the same blossom-stage growth signal as former blossoms; multi-color theme-aware fills; non-interactive; unwilted.
- **Tree presence**: Composition/scale parameters that make the bonsai read larger in-card without becoming a mural.
- **Critter art cohesion**: Shared visual language (paths, halo, stroke/fill weight) between frogs, squirrel, and tree.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At comparable frog counts, ground frogs are visibly larger and more widely distributed than before the upgrade, and a reviewer can still distinguish individual frogs at the new cap.
- **SC-002**: At mid-to-high leaf growth, the tree reads as having greater bonsai presence in the Bonsai card without overflowing the card or page layout.
- **SC-003**: At blossom stages, 100% of former blossom-slot rewards appear as frog-fruit (no pink blossom dots remain as the blossom-stage reward).
- **SC-004**: Frog-fruit use multiple theme-aware colors (at least three distinct decorative fills across the fruit set) and do not introduce garish neon styling.
- **SC-005**: With reduced motion enabled, critters and frog-fruit appear without distracting motion and none remain invisible.
- **SC-006**: During wilt, leaves/tree show wilt while ground frogs and frog-fruit do not.
- **SC-007**: The feature introduces zero network/auth/telemetry requirements; verification gate (`tsc --noEmit` + eslint clean) passes for the change set.

## Assumptions

- Spec number **015** — `014-garden-palette` exists on a parallel branch; next free local number is 015.
- Frog-fruit **replace** pink blossoms (session clarification).
- Ground frogs remain the primary "friends" layer; frog-fruit are canopy-only decoration.
- Hand SVG + Framer Motion opacity/appear remains the default stack; no canvas rewrite.
- Grove contract unchanged unless free additive polish.
- Wilt: tree/leaves wilt; frogs (ground + fruit) stay cheerful.
- Exact dials (frog scale, `MAX_FROGS`, `treeScale`, fruit color tokens) are planning/tuning details documented as dial-back knobs.
- Out of scope: per-frog click/sound, backend/auth/telemetry, growth-weight redesign, unrelated Options/palette work.
