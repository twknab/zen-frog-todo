# Phase 0 Research: More Garden Palettes

## Decision 1 — Palette identities

**Decision**: Ship exactly three new ids with these display names:

| Id | Label | Vibe |
|---|---|---|
| `guestbook` | Guestbook | 90s GeoCities garden — lime, magenta, cyan; playful but readable |
| `sunlily` | Sunlily | Golden-hour sunset lily — apricot, coral, soft gold |
| `tidepool` | Tide Pool | Seafoam + turquoise candy pond — fresh cheer |

**Rationale**: Distinct from Natural (parchment/moss), Vibrant (neon violet garden), and Dusk (indigo/lilac night). Names are joyful and on-brand for Frog Garden.

**Alternatives considered**: “GeoCities” as label (too brand-literal / dated trademark feel) → Guestbook captures the same nostalgia. “Candy Pond” as Tide Pool alternate → Tide Pool differentiates better from Vibrant’s candy-neon.

## Decision 2 — Options layout for six choices

**Decision**: Keep exclusive `ToggleButtonGroup` for a11y semantics; style with `flexWrap: "wrap"` and each button ~`flex: 1 1 calc(50% - gap)` so phones get a calm **2×3** grid. Slightly increase Popover `minWidth` (~312) if needed. Appearance remains a single-row two-button group.

**Rationale**: Meets “not crowded” hard constraint; preserves exclusive selection pattern from 014; no new component library.

**Alternatives considered**: Chip grid (extra selection state wiring); 3×2 always (worse on very narrow widths); scrollable horizontal strip (feels like chrome clutter).

## Decision 3 — Token strategy

**Decision**: Reuse `ZenPalette` field shape; add six new bags (3 palettes × light/dark). Target WCAG AA for `ink`/`inkSoft` on `bgDefault`/`bgPaper` and for selected ToggleButton (`primary` fill + `contrastText`).

**Intent summaries**:

- **Guestbook light**: soft cream with hint of lilac-cyan paper; ink deep plum-ink (not pure black); primary lime-moss; secondary hot coral-magenta; info cyan; accents playful but desaturated enough for UI chrome.
- **Guestbook dark**: deep teal-plum night; luminous lime primary; soft magenta secondary; cyan info; light ink on dark surfaces.
- **Sunlily light**: warm apricot cream surfaces; cocoa ink; coral primary; soft gold secondary; peach mist.
- **Sunlily dark**: deep cocoa/umber night; luminous apricot moss/coral primary; gold secondary; cream ink.
- **Tide Pool light**: cool mint-seafoam paper; deep teal ink; turquoise primary; seafoam secondary; soft aqua mist.
- **Tide Pool dark**: deep lagoon charcoal; bright seafoam primary; turquoise secondary; pale mint ink.

Exact hex chosen at implement time with contrast check.

## Decision 4 — Atmosphere

**Decision**: Add dedicated branches in `getGardenAtmosphere` for each new id (do not fall through to Natural). Guestbook: multi-hue retro washes (lime/magenta/cyan) at calm opacities. Sunlily: warm radial sun/horizon glows. Tide Pool: cool aquatic radials + soft foam mist. Keep grain opacity in the same low band as existing palettes.

## Decision 5 — Typography & wordmark

**Decision**:

| Palette | Heading face | Wordmark |
|---|---|---|
| guestbook | Bricolage Grotesque (same as Vibrant) | Gradient (lime → cyan → magenta) |
| sunlily | Zen Maru Gothic | Solid `primary.main` |
| tidepool | Zen Maru Gothic | Solid `primary.main` |

**Rationale**: Guestbook earns display personality; Sunlily/Tide Pool stay calm like Natural/Dusk. No new font download.

## Decision 6 — Persistence & normalization

**Decision**: Keep `frog-garden:palette-v1`. Expand `normalizePaletteId` / `PALETTE_IDS` / `PaletteId` union. Unknown → `natural`. No key version bump (YAGNI; normalize already handles legacy).

## Decision 7 — Relationship to 014 artifacts

**Decision**: 014 remains historical record of the original three-palette feature. This feature’s `contracts/garden-palette-ui-contract.md` is the **authoritative** UI contract for six palettes + wrap grid. Implementers should not “fix” 014 files retroactively beyond a one-line note if useful.

## Decision 8 — Constitution compatibility

**Decision**: Document Guestbook (and existing Vibrant) as opt-in aesthetic modes; do not amend Principle V. Natural stays default.
