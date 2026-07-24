# UI Contract: Garden Palette & Options Panel

## Context API

### `useGardenPalette()`

| Field | Type | Notes |
|---|---|---|
| `palette` | `PaletteId` | `"natural" \| "vibrant" \| "dusk"` |
| `setPalette` | `(next: PaletteId) => void` | Persists immediately |

### `useColorMode()` (extended)

| Field | Type | Notes |
|---|---|---|
| `mode` | `ColorMode` | `"light" \| "dark"` |
| `setColorMode` | `(next: ColorMode) => void` | Preferred for Appearance group |
| `toggleColorMode` | `() => void` | May remain for convenience |

## Theme factory

```ts
createZenTheme(mode: ColorMode, palette: PaletteId = "natural"): Theme
```

- Selects token set for `palette` × `mode`.
- Applies heading font family for palette (see research Decision 6).
- Default palette argument `"natural"` for any static callers.

## OptionsPanel props

| Prop | Type | Notes |
|---|---|---|
| `devMode` | `boolean` | Controlled from page |
| `onDevModeChange` | `(next: boolean) => void` | Writes `frog-garden:dev-mode-v1` via page |

## OptionsPanel a11y

| Control | Requirement |
|---|---|
| Trigger IconButton | `aria-label="Options"`; `aria-haspopup="true"`; `aria-expanded` reflects open state |
| Popover | labelled (e.g. `aria-label="Options"` on paper / id + `aria-labelledby`) |
| Palette group | `aria-label="Palette"`; buttons Natural / Vibrant / Dusk |
| Appearance group | `aria-label="Appearance"`; buttons Light / Dark |
| Dev switch | Accessible name “Dev” (FormControlLabel) |

## Header chrome contract

**Present**: Flow/Focus ToggleButtonGroup, ExportMenu, NotepadButton, OptionsPanel trigger.

**Absent**: sun/moon IconButton, Dev FormControlLabel/Switch, permanent Palette ToggleButtonGroup.

## Wordmark contract

| Palette | Treatment |
|---|---|
| `natural` | Solid color (`primary.main`) |
| `dusk` | Solid color (`primary.main`) |
| `vibrant` | Gradient (primary → info → violet accent) |

## Persistence keys

| Key | Value |
|---|---|
| `frog-garden:palette-v1` | `natural` \| `vibrant` \| `dusk` |
| `frog-garden:color-mode-v1` | `light` \| `dark` (unchanged) |
| `frog-garden:dev-mode-v1` | boolean (unchanged) |
