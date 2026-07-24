# Phase 1 Data Model: Garden Palette Selector

## Entity — Palette preference (new)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Palette id | `"natural" \| "vibrant" \| "dusk"` | `frog-garden:palette-v1` | Default `"natural"`. Invalid → coerce to `"natural"`. |

**Lifecycle**: Created implicitly on first load (default). Survives reload. Independent of appearance and Dev.

## Entity — Appearance preference (existing, control relocated)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Color mode | `"light" \| "dark"` | `frog-garden:color-mode-v1` | Default `"dark"` (unchanged from 003). Orthogonal to palette. |

## Entity — Dev preference (existing, control relocated)

| Attribute | Type | Storage | Notes |
|---|---|---|---|
| Dev mode | `boolean` | `frog-garden:dev-mode-v1` | Default `false`. Toggle UI moves to Options; tooling surfaces unchanged. |

## Entity — Palette definition (in-code tokens, not persisted)

| Field | Notes |
|---|---|
| id | `natural` \| `vibrant` \| `dusk` |
| light tokens | Full `ZenPalette` surface/accent set |
| dark tokens | Full `ZenPalette` surface/accent set |
| heading font | Zen Maru Gothic (natural, dusk) or Bricolage Grotesque (vibrant) |
| wordmark style | `solid` (natural, dusk) or `gradient` (vibrant) |

Shared token fields (per mode): `bgDefault`, `bgPaper`, `ink`, `inkSoft`, `mist`, `tooltipBg`, `moss`, `mossLight`, `mossDark`, `clay`, `clayLight`, `clayDark`, `rust`, `ochre`, `dusk`, `contrastText`.

### Dusk token intent (summary)

| Role | Light (intent) | Dark (intent) |
|---|---|---|
| Surfaces | Soft lilac-mist parchment | Deep indigo / violet charcoal |
| Ink | Deep indigo | Soft lilac-white |
| Primary (frog) | Muted moss / sage green | Softer luminous moss |
| Secondary / accent | Muted gold | Soft muted gold |
| Mist / dividers | Cool lilac haze | Lilac at low opacity |

Exact hex chosen at implement time; must pass WCAG AA for text/controls.

## Relationships

```text
ThemeRegistry
  ├── color-mode-v1 ──► mode
  ├── palette-v1 ─────► palette
  └── createZenTheme(mode, palette) ──► MUI ThemeProvider

page.tsx
  ├── OptionsPanel
  │     ├── Palette ToggleButtonGroup ──► setPalette
  │     ├── Appearance ToggleButtonGroup ──► setColorMode
  │     └── Dev Switch ──► setDevMode (local page state key)
  ├── header (Flow/Focus, Export, Notepad, Options trigger only)
  └── wordmark style ──► derived from palette
```

## Validation rules

- Palette id ∈ {natural, vibrant, dusk} else natural.
- Appearance ∈ {light, dark} (existing behavior).
- Changing palette MUST NOT mutate appearance or Dev; changing appearance MUST NOT mutate palette.
