# Feature Specification: More Garden Palettes

**Feature Branch**: `016-more-garden-palettes`

**Created**: 2026-07-25

**Status**: In progress

**Input**: User description: "Add joyful color themes for Frog Garden — cool, unique, fun. Include a 90s internet vibe and more wild themes. Keep current UI working; Options must stay calm and not crowded as the palette count grows; responsive on narrow phones. Visual boom / joy is a priority. Extend the existing palette system from 014-garden-palette. Natural remains default. WCAG AA for light and dark on every palette. After garden critter/bonsai updates, keep ground frogs green-family (primary) while fruit uses non-green accents."

## Clarifications

### Session 2026-07-25

Creative and product choices were delegated to the implementer (“you choose”). Encoded here so planning does not block on humans:

- Q: First three new palettes? → A: **Guestbook** (90s web), **Sunlily** (golden hour), **Tide Pool** (seafoam).
- Q: How should Options show many palettes without crowding? → A: **Dropdown Select** with color swatch previews (supersedes earlier 2×3 grid once count grew past six).
- Q: Four more wild themes? → A: **Borealis**, **Mirrorball**, **Sugar Rush**, **Starfruit** (plus later five: Firefly, Tropic Punch, Emberglow, Frostbloom, Sakura Drift).
- Q: Cool rename pass? → A: All display names get a punchy garden identity (e.g. Natural → Quiet Grove, Vibrant → Prism Bloom, Guestbook → Web Ring). Canonical ids renamed where needed; legacy ids (`vibrant`, `acid`, …) alias via `normalizePaletteId`.
- Q: Frog/fruit split (015)? → A: Primary/`moss` stays green-family for ground frogs + leaves; clay/rust/ochre/dusk carry colorful canopy fruit.
- Q: Does this invent a second theming stack? → A: No — extend `PaletteId`, token bags, atmosphere, Options picker, and normalize/persist paths from 014 only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and pick a joyful palette (Priority: P1)

A user opens Options and sees ten named palettes in a dropdown with tiny color swatches. They pick one; the whole app rethemes immediately. The choice persists across reloads. Fresh visits still default to Natural.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user opens Options, **Then** they see a Palette dropdown listing all ten palettes with swatch previews.
2. **Given** any palette is active, **When** the user selects another, **Then** every themed surface updates immediately with no navigation.
3. **Given** the user selected a palette, **When** they reload, **Then** the app restores that palette.
4. **Given** a fresh profile with no stored palette, **When** the app loads, **Then** it uses Natural.
5. **Given** the user switches among palettes, **When** they compare them, **Then** each feels clearly different (not a near-duplicate).

---

### User Story 2 - Palettes work in light and dark (Priority: P1)

Light/dark remains orthogonal. Every palette defines both light and dark variants. Text and controls stay readable (WCAG AA) in all twenty combinations (10 × 2).

---

### User Story 3 - Options stays calm with many palettes (Priority: P1)

With ten palettes, Options uses a compact dropdown (not a crowded button grid). Appearance and Dev stay clear. Changing Palette does not forcibly close Options. On narrow phones the menu scrolls within the viewport.

---

### Edge Cases

- Invalid or unknown stored palette value → fall back to Natural without error UI or shame messaging.
- Corrupted / unavailable local storage → app still runs on Natural; no crash.
- Rapid consecutive palette switches → last selection wins.
- `prefers-reduced-motion` → Options / menu motion stays instant or minimal; retheme is color-only.
- Fun / wild palettes are opt-in; Natural remains the default.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST offer exactly fifteen named visual palettes per `PALETTE_OPTIONS` (Quiet Grove through Sakura Drift).
- **FR-002**: Natural MUST remain the default palette; new palettes are opt-in only.
- **FR-003**: Guestbook MUST express a playful 90s-web / GeoCities garden look (lime / magenta / cyan family) that remains usable for both appearances.
- **FR-004**: Sunlily MUST express a warm golden-hour look; primary moss MUST remain warm olive/green so ground frogs stay green-family while coral/gold accents color fruit.
- **FR-005**: Tide Pool MUST express seafoam + turquoise cheer, distinct from Vibrant and Dusk.
- **FR-006**: Aurora MUST express northern-lights energy (electric greens + magenta/indigo sky accents).
- **FR-007**: Disco MUST express mirror-ball party energy (hot pink / gold / violet accents).
- **FR-008**: Cotton Floss MUST express sugar-rush pastel joy (bubblegum / sky / mint).
- **FR-009**: Nebula MUST express cosmic garden joy (violet / starfruit pink / nova gold).
- **FR-010**: System MUST provide an exclusive Palette **dropdown** listing all ten options with color swatch previews.
- **FR-011**: The Options Palette control MUST remain calm and uncrowded; it MUST NOT present ten options as a button grid that crowds the Popover.
- **FR-012**: Changing the active palette MUST immediately retheme the whole app, including atmosphere washes.
- **FR-013**: System MUST persist the chosen palette on-device; unknown values MUST normalize to Natural.
- **FR-014**: Light/dark appearance MUST remain a separate axis; every palette MUST define full light and dark token sets.
- **FR-015**: All twenty palette×appearance combinations MUST meet WCAG AA contrast for text and interactive elements.
- **FR-016**: Options controls MUST remain keyboard-operable and screen-reader labelled.
- **FR-017**: User-facing section copy MUST continue to use **Palette** and **Appearance**.
- **FR-018**: Body typography MUST remain Manrope. High-energy palettes (Vibrant, Guestbook, Aurora, Disco, Cotton Floss, Nebula) MAY use the playful display heading face; Natural, Dusk, Sunlily, Tide Pool use the calm Zen heading face.
- **FR-019**: Brand/wordmark MAY use a joyful gradient for all opt-in palettes; Natural and Dusk MUST keep solid brand coloring.
- **FR-020**: Primary/`moss` MUST stay green-family across all palettes so ground frogs and canopy leaves remain a living green pile; canopy frog-fruit MUST draw from non-green accents.
- **FR-021**: This feature MUST extend the existing garden-palette system; it MUST NOT introduce a second theming stack, backend, auth, or telemetry.
- **FR-022**: Changing Palette, Appearance, or Dev while Options is open MUST NOT forcibly close Options.
- **FR-023**: Existing Natural, Vibrant, and Dusk behavior MUST NOT regress.

### Key Entities

- **Palette preference**: persisted id among the ten `PaletteId`s; default `natural`.
- **Palette definition**: named set of light + dark color tokens (plus atmosphere washes and optional brand/typography accents).
- **Appearance preference** (existing): light | dark; orthogonal to palette.
- **Options Palette control**: exclusive dropdown Select with swatch previews.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch to any palette and see a complete visual retheme within one interaction.
- **SC-002**: After choosing a palette and reloading, the session restores that palette.
- **SC-003**: All ten palettes are usable in both light and dark with readable primary text and controls.
- **SC-004**: A new user who never opens Options still experiences Natural.
- **SC-005**: On a familiar session, users can open Options and select a palette quickly; the Options Popover does not require horizontal scrolling on a typical phone-width viewport.
- **SC-006**: Keyboard-only and screen-reader users can open Options and select any palette without pointer use.
- **SC-007**: Side-by-side comparison shows each palette as clearly distinct.
- **SC-008**: With a mature bonsai, ground frogs read green-family and canopy frog-fruit read as colorful non-green accents on every palette.

## Assumptions

- This feature extends `014-garden-palette`; persistence key, Options Popover home, and orthogonal Appearance axis stay as established there.
- Exact hex tokens are an implementation concern provided contrast and distinctiveness hold.
- Wild palettes are intentionally more playful than the constitution’s muted default; Natural remaining default preserves Principle V for new users.
- No changes to task/garden gameplay beyond palette theming and Options Palette control.
