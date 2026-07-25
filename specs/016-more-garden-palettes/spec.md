# Feature Specification: More Garden Palettes

**Feature Branch**: `016-more-garden-palettes`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Add 3 more color themes/palettes for Frog Garden — cool, unique, fun, joyful. One may lean into a 90s internet / GeoCities vibe. Keep current UI working; Options palette picker must stay calm and not crowded when growing from 3 to 6 options; responsive on narrow phones. Extend the existing palette system from 014-garden-palette. Natural remains default. WCAG AA for light and dark on every new palette."

## Clarifications

### Session 2026-07-25

Creative and product choices were delegated to the implementer (“you choose”). Encoded here so planning does not block on humans:

- Q: What are the three new palettes? → A: **Guestbook** (90s web / GeoCities garden — playful lime, magenta, cyan; usable, not illegible neon chaos), **Sunlily** (golden-hour / sunset lily — apricot, coral, soft gold), **Tide Pool** (seafoam + turquoise — fresh candy-pond cheer, distinct from Vibrant and Dusk).
- Q: Palette ids (persisted)? → A: `guestbook` | `sunlily` | `tidepool` (plus existing `natural` | `vibrant` | `dusk`).
- Q: How should Options show six palettes without crowding? → A: Replace the single-row three-button group with a calm **2×3 wrap grid** of exclusive palette choices (smaller labels OK); Appearance stays a single-row Light/Dark group.
- Q: Heading fonts / wordmark for new palettes? → A: Guestbook may use the playful display heading face already used by Vibrant and MAY use a joyful gradient wordmark; Sunlily and Tide Pool use the calm Zen heading face and solid brand coloring (like Natural/Dusk).
- Q: Does this invent a second theming stack? → A: No — extend `PaletteId`, token bags, atmosphere, Options picker, and normalize/persist paths from 014 only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and pick a joyful new palette (Priority: P1)

A user opens Options and sees six named palettes: the original Natural, Vibrant, and Dusk plus three new ones — Guestbook, Sunlily, and Tide Pool. They pick one; the whole app rethemes immediately. The choice persists across reloads. Fresh visits still default to Natural.

**Why this priority**: Core value of the feature — more joyful garden identities without breaking the existing system.

**Independent Test**: Open Options → select each of the three new palettes → confirm full-app retheme and distinct vibe from Natural/Vibrant/Dusk; reload → persistence; clear storage → Natural default.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user opens Options, **Then** they see exactly six palette choices: Natural, Vibrant, Dusk, Guestbook, Sunlily, and Tide Pool.
2. **Given** any palette is active, **When** the user selects Guestbook (or Sunlily, or Tide Pool), **Then** every themed surface updates to that palette immediately with no navigation.
3. **Given** the user selected a new palette, **When** they reload, **Then** the app restores that palette.
4. **Given** a fresh profile with no stored palette, **When** the app loads, **Then** it uses Natural.
5. **Given** the user compares Guestbook, Sunlily, and Tide Pool side by side with Natural, Vibrant, and Dusk, **When** they switch among them, **Then** each feels clearly different (not a near-duplicate of an existing option).

---

### User Story 2 - New palettes work in light and dark (Priority: P1)

Light/dark remains orthogonal. Every new palette defines both light and dark variants. Switching Appearance does not reset Palette, and vice versa. Text and controls stay readable (WCAG AA) in all twelve combinations (6 palettes × 2 appearances).

**Why this priority**: Accessibility and calm UX require every shipped palette to work in both appearances.

**Independent Test**: For Guestbook, Sunlily, and Tide Pool (and regression-check the original three), toggle Light/Dark; confirm coherent, readable UI.

**Acceptance Scenarios**:

1. **Given** Guestbook (or Sunlily, or Tide Pool) is selected, **When** the user switches Appearance between Light and Dark, **Then** the app uses that palette’s matching token set and keeps the same palette id.
2. **Given** dark appearance and any new palette, **When** the user switches among the new palettes, **Then** each applies its dark variant without flipping to light.
3. **Given** any of the twelve palette×appearance combinations, **When** the user reads primary text and interactive controls, **Then** contrast meets WCAG AA.

---

### User Story 3 - Options stays calm with six palettes (Priority: P1)

With six palettes, the Options Popover must remain calm, scannable, and usable on narrow phones — not a cramped single row of six buttons. Appearance and Dev controls stay clear. Changing Palette/Appearance/Dev does not forcibly close Options.

**Why this priority**: Product hard constraint — growing the picker must not crowd or break the Options surface.

**Independent Test**: Open Options on a narrow viewport (~320–390px wide); confirm palette choices wrap into a readable grid (e.g. 2×3), labels remain legible, no horizontal overflow, keyboard and screen-reader labels still work.

**Acceptance Scenarios**:

1. **Given** Options is open on a narrow phone-width viewport, **When** the user views the Palette section, **Then** the six choices are arranged in a wrap/grid layout (not one overcrowded row) and remain fully visible without horizontal scrolling of the Popover content.
2. **Given** Options is open, **When** the user changes Palette, Appearance, or Dev, **Then** the change applies immediately and Options stays open.
3. **Given** the Palette control, **When** a screen reader user focuses it, **Then** meaningful names announce Palette and each discrete option (Natural, Vibrant, Dusk, Guestbook, Sunlily, Tide Pool).
4. **Given** Appearance and Dev sections, **When** the user interacts with them, **Then** they behave as before (no regression from adding palettes).

---

### Edge Cases

- Invalid or unknown stored palette value (including legacy typos) → fall back to Natural without error UI or shame messaging.
- Corrupted / unavailable local storage → app still runs on Natural; no crash.
- Rapid consecutive palette switches → last selection wins; theme stays consistent with stored preference.
- `prefers-reduced-motion` → Options open/close motion stays instant or minimal; retheme is color-only.
- Fun / retro palettes (especially Guestbook) are opt-in; Natural remains the default so the constitution’s calm muted baseline is preserved for new users.
- Closing Options does not reset Palette, Appearance, or Dev.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST offer exactly six named visual palettes: Natural, Vibrant, Dusk, Guestbook, Sunlily, and Tide Pool.
- **FR-002**: Natural MUST remain the default palette (muted constitution look); new palettes are opt-in only.
- **FR-003**: Guestbook MUST express a playful 90s-web / GeoCities garden look (lime / magenta / cyan family) that remains usable and readable — joyful nostalgia, not illegible neon chaos — for both light and dark appearance.
- **FR-004**: Sunlily MUST express a warm golden-hour / sunset-lily look (apricot, coral, soft gold) for both light and dark appearance.
- **FR-005**: Tide Pool MUST express a fresh seafoam + turquoise (cheerful pond) look for both light and dark appearance, and MUST feel clearly distinct from Vibrant and Dusk.
- **FR-006**: System MUST provide an exclusive Palette selection control listing all six options so only one palette is active at a time.
- **FR-007**: The Palette control layout MUST remain calm and uncrowded with six options (wrap/grid such as 2×3); it MUST NOT present six options as a single cramped full-width row on narrow viewports.
- **FR-008**: Changing the active palette MUST immediately retheme the whole app (all themed surfaces update together), including atmosphere washes where the app uses them.
- **FR-009**: System MUST persist the chosen palette on-device with the existing preference key and restore it on subsequent loads; unknown values MUST normalize to Natural.
- **FR-010**: Light/dark appearance MUST remain a separate axis from palette; every palette (including the three new ones) MUST define full light and dark token sets; changing one axis MUST NOT reset the other.
- **FR-011**: All twelve palette×appearance combinations MUST meet WCAG AA contrast for text and interactive elements.
- **FR-012**: Options entry and all Options controls MUST remain keyboard-operable and screen-reader labelled; new palette buttons MUST have meaningful accessible names.
- **FR-013**: User-facing copy MUST continue to use **Palette** and **Appearance**; new palette display names are Guestbook, Sunlily, and Tide Pool.
- **FR-014**: Body typography MUST remain Manrope for all palettes. Headings: Guestbook MAY use the playful display face used by Vibrant; Sunlily and Tide Pool MUST use the calm Zen heading face used by Natural/Dusk.
- **FR-015**: Brand/wordmark treatment MAY use a joyful gradient for Guestbook (in addition to Vibrant); Natural, Dusk, Sunlily, and Tide Pool MUST keep solid, calm brand coloring.
- **FR-016**: This feature MUST extend the existing garden-palette system; it MUST NOT introduce a second theming stack, backend, auth, or telemetry.
- **FR-017**: Changing Palette, Appearance, or Dev while Options is open MUST NOT forcibly close the Options surface.
- **FR-018**: Existing Natural, Vibrant, and Dusk behavior (tokens, atmosphere character, persistence, Appearance/Dev) MUST NOT regress.

### Key Entities

- **Palette preference**: persisted id among `natural` | `vibrant` | `dusk` | `guestbook` | `sunlily` | `tidepool`; default `natural`.
- **Palette definition**: named set of light + dark color tokens (plus atmosphere washes and optional brand/typography accents) that fully rethemes the app when selected.
- **Appearance preference** (existing): light | dark; orthogonal to palette.
- **Options Palette control**: exclusive six-option selector with calm wrap/grid layout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch to any of the three new palettes and see a complete visual retheme within one interaction (no leftover surfaces from the previous palette).
- **SC-002**: After choosing a new palette and reloading, 100% of such sessions restore that palette without further action.
- **SC-003**: All six palettes are usable in both light and dark (twelve combinations) with readable primary text and controls.
- **SC-004**: A new user who never opens Options still experiences Natural, not a fun/retro palette.
- **SC-005**: On a familiar session, users can open Options and select among six palettes in under ~15 seconds; the Palette section does not require horizontal scrolling on a typical phone-width viewport.
- **SC-006**: Keyboard-only and screen-reader users can open Options and select any of the six palettes without pointer use.
- **SC-007**: Side-by-side comparison shows Guestbook, Sunlily, and Tide Pool as clearly distinct from each other and from Natural, Vibrant, and Dusk (no “almost the same” duplicates).

## Assumptions

- This feature extends `014-garden-palette`; persistence key, Options Popover home, and orthogonal Appearance axis stay as established there.
- Exact hex tokens are a planning/implementation concern provided FR-003–FR-005, FR-011, and SC-007 hold.
- Guestbook is intentionally more playful than the constitution’s muted default; Natural remaining default preserves Principle V for new users (same pattern as Vibrant).
- Tide Pool leans seafoam/turquoise rather than soft candy pastels so it does not collide with Sunlily’s warm pastels or Dusk’s cool violets.
- No changes to task/garden gameplay, sound, or Dev tooling placement beyond palette theming and Options Palette layout.
- No PR is required from this workstream unless a parent agent opens one; delivery is a feature branch with commits.
