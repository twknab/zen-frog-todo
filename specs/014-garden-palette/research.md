# Phase 0 Research: Garden Palette Selector

All decisions constrained by the constitution and the **post-clarify** spec (including Options hosting Palette + Appearance + Dev).

## Decision 1 — Options surface: Popover

- **Decision**: Header `IconButton` (SettingsOutlined) opens an MUI `Popover` anchored below-end. Popover contains three calm sections: Palette, Appearance, Dev.
- **Rationale**: Clarified 2026-07-24. Non-modal, lightweight, matches existing IconButton/Tooltip chrome; Dialog/Drawer are heavier for three small controls.
- **Alternatives considered**: Menu (weaker layout for labelled groups); Dialog (modal friction); Drawer (mobile-sheet overkill for desktop-first calm dashboard).

## Decision 2 — Header declutter: move Appearance + Dev into Options

- **Decision**: Remove sun/moon `IconButton` and Dev `Switch` from permanent header. Header keeps Flow/Focus, Export, Notepad, Options. Pass `devMode` / `setDevMode` into `OptionsPanel`.
- **Rationale**: Product revision — Options is the settings home; less chrome noise (Principles I & V).
- **Alternatives considered**: Leave light/dark in header (rejected by revision); leave Dev in header (rejected).

## Decision 3 — Control patterns inside Options

- **Decision**:
  - **Palette**: exclusive `ToggleButtonGroup` — Natural / Vibrant / Dusk; `aria-label="Palette"`.
  - **Appearance**: exclusive `ToggleButtonGroup` — Light / Dark; `aria-label="Appearance"`. Prefer `setMode` over toggle-only so the group is controlled by absolute value.
  - **Dev**: existing `Switch` + “Dev” label inside Options.
- **Rationale**: Spec FR-005 / clarifications; ToggleButtonGroup already used for Flow/Focus and Notepad modes.
- **Alternatives considered**: Icon-only appearance (less clear once tucked away); Select dropdown (extra click, less glanceable).

## Decision 4 — Theme API: `createZenTheme(mode, palette)`

- **Decision**: Export `PaletteId = "natural" | "vibrant" | "dusk"`. Keep `ColorMode = "light" | "dark"`. Theme factory selects token set by both axes. `ThemeRegistry` persists palette with `usePersistentState("frog-garden:palette-v1", "natural")` and exposes `useGardenPalette()` (`palette`, `setPalette`). Recreate theme via `useMemo(() => createZenTheme(mode, palette), [mode, palette])`. Extend color-mode context with `setColorMode` (or accept mode value) so Appearance group can set light/dark directly.
- **Rationale**: Spec FR-006–008; mirrors existing mode persistence pattern from `003-dark-mode-toggle`.
- **Alternatives considered**: CSS variables only (would fight MUI theme consumers); separate ThemeProviders per palette (heavier).

## Decision 5 — Token sources

- **Decision**:
  - **Natural**: restore muted tokens from pre-experiment `theme.ts` (`#F6F3EC` / `#1B1916` family, moss `#6B8F71` / `#8FB597`, clay, etc.).
  - **Vibrant**: port current experiment tokens already on `main` (violet mist, spring green, coral, cyan) from `claude/bold-psychedelic-theme-experiment` / merged PR #11 inspiration.
  - **Dusk** (new): calm night-garden —
    - Light: soft lilac-mist backgrounds (`#F3F0F8` paper family), deep indigo ink, muted gold secondary (`#C4A35A` family), moss green primary for frog identity, soft violet dividers.
    - Dark: deep indigo/violet surfaces (`#16122A` / `#1F1A36`), lilac mist text secondary, muted gold accents, moss/green primary retained, soft lilac mist dividers.
- **Rationale**: FR-002–004; Natural = constitution default; Vibrant = opt-in neon; Dusk between them with green identity.
- **Alternatives considered**: Keep Vibrant as default (violates SC-004 / Principle V); invent Natural from scratch (worse than restoring known-good tokens).

## Decision 6 — Font strategy

- **Decision**: Body = Manrope always. Headings = Zen Maru Gothic for Natural + Dusk; Bricolage Grotesque for Vibrant. Load both heading fonts in `fonts.ts`; `createZenTheme` picks `headingFontFamily` from palette id.
- **Rationale**: Clarified 2026-07-24 — calm faces for calm palettes; display face only when user opts into Vibrant.
- **Alternatives considered**: Bricolage everywhere (overpowers Natural); Zen Maru everywhere (Vibrant loses experiment personality).

## Decision 7 — Wordmark / brand

- **Decision**: Vibrant keeps green→cyan→violet gradient wordmark. Natural and Dusk use solid `color: "primary.main"` (or ink) — no gradient.
- **Rationale**: FR-014; gradient is part of Vibrant’s neon identity, too loud for Natural/Dusk.
- **Alternatives considered**: Gradient always (rejected); no gradient ever (loses Vibrant character).

## Decision 8 — Constitution compatibility (no amendment)

- **Decision**: Do **not** edit `.specify/memory/constitution.md`. Document in plan + PR that Vibrant is an opt-in aesthetic mode; Natural remains Principle V’s muted default for unset users.
- **Rationale**: Spec / user instruction — prefer documenting opt-in modes over silently amending Principle V.
- **Alternatives considered**: Amend Principle V to allow “modes” (unnecessary for v1; heavier governance).

## Decision 9 — Invalid stored palette

- **Decision**: If stored value ∉ `natural|vibrant|dusk`, coerce to `natural` when reading (guard in ThemeRegistry or a tiny normalize helper).
- **Rationale**: Edge case in spec; calm failure, no shame UI.
- **Alternatives considered**: Wipe key (same outcome); show error toast (noise).

## Decision 10 — Popover stays open; reduced motion

- **Decision**: Do not close Popover on palette/appearance/dev change. If Popover uses transitions, honor `prefers-reduced-motion` (MUI default / disable transition).
- **Rationale**: FR-017; Principle IV.
- **Alternatives considered**: Close on select (forces re-open to compare — worse UX).

## Decision 11 — Scope guards

- No backend/auth/telemetry.
- No per-component color overrides beyond theme tokens + wordmark.
- No renaming user-facing light/dark to “color mode”; label is Appearance / Light / Dark; feature name is Palette.
- Do not merge experiment branch as-is; this feature supersedes it with selectable palettes.
- Related inspiration only: PR #11 / `claude/bold-psychedelic-theme-experiment`.
