# UI Contract: More Garden Palettes (extends / supersedes 014)

> **Authority**: For multi-palette behavior and Options Palette layout, this contract supersedes
> `specs/014-garden-palette/contracts/garden-palette-ui-contract.md` where they conflict.
> 014 remains the historical contract for the original three-palette delivery.

## Context API

### `useGardenPalette()`

| Field | Type | Notes |
|---|---|---|
| `palette` | `PaletteId` | See `PALETTE_IDS` in `src/theme/theme.ts` (ten ids) |
| `setPalette` | `(next: PaletteId) => void` | Persists immediately via normalize |

### `normalizePaletteId(value: unknown): PaletteId`

- Known ids returned as-is.
- Anything else → `"natural"`.

## Theme factory

```ts
createZenTheme(mode: ColorMode, palette: PaletteId = "natural"): Theme
```

- Selects token set for `palette` × `mode` (ten palettes × two appearances).
- **Primary (`moss`) MUST stay green-family** so ground frogs + canopy leaves read as a living pile (015 frog/fruit split). Non-green personality lives in secondary / error / warning / info (canopy frog-fruit).
- Heading face: Bricolage for `vibrant`, `guestbook`, `aurora`, `disco`, `floss`, `nebula`; Zen Maru Gothic otherwise.
- Default palette argument `"natural"`.

## Atmosphere

```ts
getGardenAtmosphere(palette: PaletteId, mode: ColorMode): GardenAtmosphere
```

- MUST define distinct wash/mist for every non-Natural palette (no silent Natural fallthrough for known ids).

## OptionsPanel — Palette control

| Requirement | Detail |
|---|---|
| Options count | Exactly ten: Natural, Vibrant, Dusk, Guestbook, Sunlily, Tide Pool, Aurora, Disco, Cotton Floss, Nebula |
| Selection | Exclusive; only one active |
| Control | **Dropdown `Select`** (not a ToggleButton grid) with color swatch previews |
| Labels | Visible text + accessible names matching display names |
| Group | `aria-label="Palette"` on the Select |
| Stay open | Changing palette MUST NOT close the Options Popover |
| Menu | Scrollable if needed; MUST NOT overflow the viewport awkwardly on narrow phones |

Appearance (Light/Dark) and Dev controls unchanged in behavior.

## Wordmark contract

| Palette | Treatment |
|---|---|
| `natural`, `dusk` | Solid color (`primary.main`) |
| All other palettes | Joyful gradient wordmark via `gardenWordmarkGradient` |

## Persistence keys

| Key | Value |
|---|---|
| `frog-garden:palette-v1` | one of ten ids above |
| `frog-garden:color-mode-v1` | `light` \| `dark` (unchanged) |
| `frog-garden:dev-mode-v1` | boolean (unchanged) |

## Header chrome contract (unchanged from 014)

**Present**: Flow/Focus, Export, Notepad, Options trigger.  
**Absent**: permanent palette group, sun/moon appearance toggle, Dev switch.
