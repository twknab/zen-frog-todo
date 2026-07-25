# Phase 1 Data Model: More Garden Palettes

## Entity — Palette preference (extended)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Palette id | `"natural" \| "vibrant" \| "dusk" \| "guestbook" \| "sunlily" \| "tidepool"` | `frog-garden:palette-v1` | Default `"natural"`. Invalid / unknown → coerce to `"natural"`. |

**Lifecycle**: Unchanged from 014. New ids are additional valid values only.

## Entity — Appearance preference (unchanged)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Color mode | `"light" \| "dark"` | `frog-garden:color-mode-v1` | Default `"dark"`. Orthogonal to palette. |

## Entity — Dev preference (unchanged)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Dev mode | `boolean` | `frog-garden:dev-mode-v1` | Default `false`. |

## Entity — Palette definition (in-code tokens, not persisted)

| Field | Notes |
|---|---|
| id | one of six `PaletteId`s |
| light / dark tokens | Full `ZenPalette` surface/accent set |
| atmosphere | wash + mist + grainOpacity via `getGardenAtmosphere` |
| heading font | Zen Maru Gothic (natural, dusk, sunlily, tidepool) or Bricolage (vibrant, guestbook) |
| wordmark style | `solid` or `gradient` (vibrant, guestbook) |

Shared token fields (per mode): `bgDefault`, `bgPaper`, `ink`, `inkSoft`, `mist`, `tooltipBg`, `moss`, `mossLight`, `mossDark`, `clay`, `clayLight`, `clayDark`, `rust`, `ochre`, `dusk`, `contrastText`.

### New palette intent (summary)

| Id | Surfaces | Primary | Secondary / accents |
|---|---|---|---|
| guestbook | Soft cream ↔ teal-plum night | Lime / spring green | Magenta clay, cyan info |
| sunlily | Apricot cream ↔ cocoa umber | Coral / warm moss | Soft gold |
| tidepool | Mint seafoam ↔ lagoon charcoal | Turquoise / seafoam | Cool aqua / teal |

## Relationships

```text
ThemeRegistry
  ├── color-mode-v1 ──► mode
  ├── palette-v1 ─────► palette (6 ids)
  ├── createZenTheme(mode, palette)
  └── GardenBackdrop ← getGardenAtmosphere(palette, mode)

OptionsPanel
  └── Palette ToggleButtonGroup (2×3 wrap) ──► setPalette
```

## Validation rules

- Palette id ∈ {natural, vibrant, dusk, guestbook, sunlily, tidepool} else natural.
- Changing palette MUST NOT mutate appearance or Dev; changing appearance MUST NOT mutate palette.
