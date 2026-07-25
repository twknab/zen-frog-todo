# Research: Garden Critter & Bonsai Visual Upgrade

Phase 0 decisions. Prior art: `specs/006-growing-bonsai/`, `specs/008-frog-friends/`.

## Decision 1 — Frog-fruit replaces pink blossom dots

**Decision**: Canopy blossom-stage rewards render as multi-colored **frog-fruit** (same frog mark, smaller scale) using the existing `blossoms` count and `BLOSSOM_SLOTS` / `blossomCountForLeaves(leaves)` unlock pacing. Pink `error.light` circles are removed as the blossom-stage visual.

**Rationale**: User default (“do it”); keeps Grove + derive API stable (`blossoms` prop remains a count of canopy rewards). No growth-math redesign (FR-014).

**Alternatives considered**: Fruit alongside blossoms — cluttered. Separate fruit counter — unnecessary state.

## Decision 2 — No new drawing library / no canvas

**Decision**: Stay on hand SVG paths + existing Framer Motion opacity `appear`. Optionally refine path transforms / add a tiny local helper in `frogIcon.ts` or `BonsaiTree.tsx`. Do **not** add rough.js, paper.js, Pixi, or any game engine.

**Rationale**: Principle VI (YAGNI, bundle as calm UX). Existing sticker-halo + icon paths already work; cohesion comes from scale, halo, and leaf shape polish — not a new stack.

**Alternatives considered**: rough.js for “hand-drawn” — bundle + aesthetic risk vs calm MUI garden. Canvas rewrite — unjustified for prop-driven static scene.

## Decision 3 — MAX_FROGS = 28 with wider band + comedy scale

**Decision**: Raise `MAX_FROGS` from 20 → **28**. Widen ground x-band and slightly deepen y jitter; increase scale range (e.g. ~1.7–2.9 vs current ~1.36–2.36). Keep sticker halo (`paintOrder` stroke in `background.paper`). Keep seeded module-level `FROG_POSITIONS`.

**Rationale**: Spec comedy + density; 28 is a modest bump with dial-back to 24 if sludge appears. Determinism/SSR safety unchanged (008 Decision 4).

**Dial-back knobs**: `MAX_FROGS`, frog `scale` min/max, x-band `[min,max]`, y-band.

## Decision 4 — Moderate treeScale / composition bump

**Decision**: Increase mature tree presence ~15–25% via `treeScale` range (e.g. base ~0.95–1.0 and max delta ~0.55–0.6 instead of `0.9 + 0.45`) and optionally nudge canopy center / leaf radius slightly. Keep `viewBox="0 0 160 200"` unless a tiny crop tweak is clearly better — prefer scale-first to avoid Grove size surprises.

**Rationale**: Spec “bigger / more bonsai-like” without mural. Grove uses same `BonsaiTree` — contained bump is safest.

**Dial-back knobs**: `treeScale` formula coefficients; leaf radius.

## Decision 5 — Leaf enrichment without particles

**Decision**: Replace plain `circle` leaves with soft oval / leaf-ish ellipses (slight rotation from phyllotaxis index), keep three-tone primary fills. No textures, gradients-as-noise, or particle systems.

**Rationale**: Calm, readable, theme-aware; wilt still applies to living layer.

## Decision 6 — Frog-fruit colors = theme-token rotation

**Decision**: Assign fruit fill by slot index cycling soft theme accents (`primary.main/light`, `secondary.main`, `error.light`, `success.main` if present, etc.). Keep halo or subtle stroke so fruit reads on canopy. Fruit rendered **outside** wilt `g` (or with wilt filter overridden) so they stay cheerful with ground frogs.

**Rationale**: Fun multi-color without garish custom neon hex; adapts to palette work (014). Decorative `aria-hidden` under parent `role="img"`.

**Alternatives considered**: Fixed custom hex set — fights theme cohesion. Same green as ground frogs only — fails “multi-colored” SC-004.

## Decision 7 — Critter art cohesion approach

**Decision**: Keep shared `FROG_ICON_PATH` / `SQUIRREL_ICON_PATH`. Cohesion via consistent halo, comedy scale, fruit using same frog path at canopy scale, and optional tiny stroke/fill tuning. No second mascot style for fruit.

**Rationale**: One brand mark (clarify session); dependency-light.

## Decision 8 — Grove & API compatibility

**Decision**: Keep `blossoms: number` prop and `blossomCountForLeaves`. Grove continues to pass blossoms; visual becomes fruit automatically. Do not require Grove-specific props.

**Rationale**: Non-breaking (FR-013).

## Decision 9 — Wilt layering

**Decision**: Living layer (pot, grass, trunk, leaves) stays under wilt style. Critter layer includes ground frogs, squirrel, **and frog-fruit**.

**Rationale**: 008 spirit + clarify session; fruit are “already earned” canopy cheer.
