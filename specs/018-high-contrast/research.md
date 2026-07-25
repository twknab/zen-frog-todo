# Research: High Contrast Toggle

**Feature**: `018-high-contrast` | **Date**: 2026-07-25

## Decisions

### 1. Appearance remains available under HC

**Decision**: Ship HC light + HC dark; keep Appearance ToggleButtonGroup enabled while HC is on.

**Rationale**: Brief prefers keeping Appearance when both variants meet AA. Near-black / near-white pairs are straightforward for both modes. Locking Appearance would remove a familiar control without strong product need.

**Alternatives considered**: Lock Appearance while HC on — cleaner mentally but worse UX if user wants bright daylight HC vs night HC.

### 2. HC is an override, not a PaletteId

**Decision**: Internal id `highContrast`; not added to `PALETTE_IDS` / Options dropdown.

**Rationale**: Brief forbids “pick among greys” and new dropdown entries. Override sits above selected palette in ThemeRegistry.

**Alternatives considered**: Add `highContrast` as a palette — rejected (would leave Palette enabled and muddle “toggle vs pick”).

### 3. Persistence key

**Decision**: `frog-garden:high-contrast-v1`, boolean, default `false`, via `usePersistentState`.

**Rationale**: Matches existing `frog-garden:*` key naming; brief specifies the key.

### 4. Theme API shape

**Decision**: Export `createHighContrastTheme(mode: ColorMode): Theme` using the same Zen token bag shape fed into the existing `createTheme` assembly (shared helper or duplicated slim path). ThemeRegistry chooses between HC and palette themes.

**Rationale**: Keeps `createZenTheme(mode, palette)` behavior intact for non-HC; avoids inventing a second MUI component override stack.

**Alternatives considered**: Fake a reserved PaletteId only inside ThemeRegistry — rejected (still couples HC to palette map and risk of leaking into dropdown).

### 5. Atmosphere under HC

**Decision**: `getHighContrastAtmosphere(mode)` with flatter near-solid washes and low grain; GardenBackdrop receives `highContrast` (or precomputed atmosphere).

**Rationale**: Soft multi-hue washes can reduce perceived contrast; simplify while keeping slight garden depth.

### 6. Palette disable UX

**Decision**: MUI `Select` `disabled` when HC on; calm secondary hint “Using high contrast”; do not clear value; do not call `setPalette`.

**Rationale**: Visually + functionally disabled; screen readers get native disabled semantics; stored value still shown.

### 7. Wordmark under HC

**Decision**: When HC on, use solid primary text for the brand wordmark (skip `gardenWordmarkGradient`).

**Rationale**: Gradients can fail contrast on edges; solid ink/primary keeps AAA-ish readability.

### 8. Spec numbering

**Decision**: `018-high-contrast` because open PRs already use `017-*` on other branches.

## Open questions

None blocking. Hyper Minimal density is out of scope; coexistence is “do not break if present later.”
