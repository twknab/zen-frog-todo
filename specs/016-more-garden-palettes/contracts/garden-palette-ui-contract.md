# UI Contract: More Garden Palettes (extends / supersedes 014)

> **Authority**: For six-palette behavior and Options Palette layout, this contract supersedes
> `specs/014-garden-palette/contracts/garden-palette-ui-contract.md` where they conflict.
> 014 remains the historical contract for the original three-palette delivery.

## Context API

### `useGardenPalette()`

| Field | Type | Notes |
|---|---|---|
| `palette` | `PaletteId` | `"natural" \| "vibrant" \| "dusk" \| "guestbook" \| "sunlily" \| "tidepool"` |
| `setPalette` | `(next: PaletteId) => void` | Persists immediately via normalize |

### `normalizePaletteId(value: unknown): PaletteId`

- Known ids returned as-is.
- Anything else → `"natural"`.

## Theme factory

```ts
createZenTheme(mode: ColorMode, palette: PaletteId = "natural"): Theme
```

- Selects token set for `palette` × `mode` (six palettes × two appearances).
- Heading face: Bricolage for `vibrant` and `guestbook`; Zen Maru Gothic otherwise.
- Default palette argument `"natural"`.

## Atmosphere

```ts
getGardenAtmosphere(palette: PaletteId, mode: ColorMode): GardenAtmosphere
```

- MUST define distinct wash/mist for `guestbook`, `sunlily`, and `tidepool` (no silent Natural fallthrough for those ids).

## OptionsPanel — Palette control

| Requirement | Detail |
|---|---|
| Options count | Exactly six: Natural, Vibrant, Dusk, Guestbook, Sunlily, Tide Pool |
| Selection | Exclusive; only one active |
| Layout | Wrap/grid — target **2×3** on typical phone widths; MUST NOT be a single cramped row of six |
| Labels | Visible text + `aria-label` matching display names |
| Group | `aria-label="Palette"` |
| Stay open | Changing palette MUST NOT close the Popover |

Appearance (Light/Dark) and Dev controls unchanged in behavior.

## Wordmark contract

| Palette | Treatment |
|---|---|
| `natural`, `dusk`, `sunlily`, `tidepool` | Solid color (`primary.main`) |
| `vibrant`, `guestbook` | Gradient wordmark allowed |

Guestbook gradient intent: lime/spring → cyan → magenta family (exact stops implementer’s choice).

## Persistence keys

| Key | Value |
|---|---|
| `frog-garden:palette-v1` | one of six ids above |
| `frog-garden:color-mode-v1` | `light` \| `dark` (unchanged) |
| `frog-garden:dev-mode-v1` | boolean (unchanged) |

## Header chrome contract (unchanged from 014)

**Present**: Flow/Focus, Export, Notepad, Options trigger.  
**Absent**: permanent palette group, sun/moon appearance toggle, Dev switch.
