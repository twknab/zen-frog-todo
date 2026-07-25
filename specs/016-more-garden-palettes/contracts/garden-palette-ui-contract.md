# UI Contract: More Garden Palettes (extends / supersedes 014)

> **Authority**: For multi-palette behavior and Options Palette layout, this contract supersedes
> `specs/014-garden-palette/contracts/garden-palette-ui-contract.md` where they conflict.
> 014 remains the historical contract for the original three-palette delivery.

## Context API

### `useGardenPalette()`

| Field | Type | Notes |
|---|---|---|
| `palette` | `PaletteId` | See `PALETTE_IDS` in `src/theme/theme.ts` (twenty-one ids) |
| `setPalette` | `(next: PaletteId) => void` | Persists immediately via normalize |

### `normalizePaletteId(value: unknown): PaletteId`

- Known ids returned as-is.
- Legacy aliases (`vibrant` → `prism`, `acid` → `prism`, `dusk` → `violethour`, `guestbook` → `webring`, `sunlily` → `goldhour`, `tidepool` → `tideglass`, `aurora` → `borealis`, `disco` → `mirrorball`, `floss` → `sugarrush`, `nebula` → `starfruit`) map to current ids.
- Anything else → `"natural"`.

## Theme factory

```ts
createZenTheme(mode: ColorMode, palette: PaletteId = "natural"): Theme
```

- Selects token set for `palette` × `mode` (twenty-one palettes × two appearances).
- **Primary (`moss`) MUST stay green-family** so ground frogs + canopy leaves read as a living pile (015 frog/fruit split). Non-green personality lives in secondary / error / warning / info (canopy frog-fruit). Greyscale themes may mute fruit to greys / silvers / sparse cool accents.
- Heading face: Bricolage for high-energy ids (`prism`, `webring`, `borealis`, `mirrorball`, `sugarrush`, `starfruit`, `firefly`, `tropic`, `emberglow`); Zen Maru Gothic otherwise (including all six high-contrast greyscale/black ids).
- Default palette argument `"natural"` (display name **Quiet Grove**).

## Atmosphere

```ts
getGardenAtmosphere(palette: PaletteId, mode: ColorMode): GardenAtmosphere
```

- MUST define distinct wash/mist for every non-Natural palette (no silent Natural fallthrough for known ids).

## OptionsPanel — Palette control

| Requirement | Detail |
|---|---|
| Options count | Exactly twenty-one named palettes (see `PALETTE_OPTIONS`) |
| Selection | Exclusive; only one active |
| Control | **Dropdown `Select`** with color swatch previews |
| Labels | Cool display names from `PALETTE_OPTIONS` |
| Group | `aria-label="Palette"` on the Select |
| Stay open | Changing palette MUST NOT close the Options Popover |
| Menu | Scrollable; MUST remain usable on narrow phones |

Appearance (Light/Dark) and Dev controls unchanged in behavior.

## Wordmark contract

| Palette | Treatment |
|---|---|
| `natural`, `violethour`, `ashterrace`, `bone` | Solid color (`primary.main`) |
| `graphite`, `inkwell`, `obsidian`, `blackout` | Subtle moss→steel gradient via `gardenWordmarkGradient` |
| All other palettes | Joyful gradient wordmark via `gardenWordmarkGradient` |

## High-contrast / greyscale roster (ids)

| Id | Label | Vibe |
|---|---|---|
| `graphite` | Graphite Grove | Cool charcoal / slate, crisp contrast |
| `inkwell` | Ink Well | Noir near-black, sharp white/ink text |
| `ashterrace` | Ash Terrace | Warm concrete greys |
| `obsidian` | Obsidian Pond | Deep void black + sparse cool silver/teal accent |
| `bone` | Bone Quiet | Chalk/bone light-leaning true greyscale |
| `blackout` | Blackout | OLED true black (#000), highest-contrast basically-black option |

## Persistence keys

| Key | Value |
|---|---|
| `frog-garden:palette-v1` | one of twenty-one canonical ids (or a legacy alias that normalizes) |
| `frog-garden:color-mode-v1` | `light` \| `dark` (unchanged) |
| `frog-garden:dev-mode-v1` | boolean (unchanged) |

## Header chrome contract (unchanged from 014)

**Present**: Flow/Focus, Export, Notepad, Options trigger.  
**Absent**: permanent palette group, sun/moon appearance toggle, Dev switch.
