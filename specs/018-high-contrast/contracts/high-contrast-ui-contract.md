# Contract: High Contrast Options UI

**Feature**: `018-high-contrast` | **Date**: 2026-07-25

## Options surface

1. **High Contrast** — `Switch` (or equivalent) labelled “High Contrast”, placed near Appearance / Dev (and Density if present).
2. Changing the switch MUST NOT close the Options Popover.
3. Control MUST be keyboard-focusable and screen-reader labelled (“High Contrast”).

## Palette interaction

| High Contrast | Palette Select | Hint |
|---------------|----------------|------|
| OFF | enabled; changes apply | none required |
| ON | `disabled`; value still shows stored palette | optional calm secondary: “Using high contrast” |

- Disabled Select MUST NOT fire change handlers that alter palette.
- Stored palette MUST remain the Select’s displayed value while disabled.

## Theme resolution (implementer contract)

```text
if highContrast:
  theme = createHighContrastTheme(mode)
  atmosphere = getHighContrastAtmosphere(mode)
else:
  theme = createZenTheme(mode, palette)
  atmosphere = getGardenAtmosphere(palette, mode)
```

- `highContrast` is **not** a `PaletteId` and MUST NOT appear in `PALETTE_OPTIONS`.
- Persistence key: `frog-garden:high-contrast-v1` (boolean, default false).

## Appearance

- Light/Dark remains available while HC is on.
- HC light and HC dark MUST each meet WCAG AA for text and interactive chrome.

## Non-goals

- No new garden palettes in the dropdown.
- No Density / Hyper Minimal implementation in this contract (coexistence only).
- No backend sync.
