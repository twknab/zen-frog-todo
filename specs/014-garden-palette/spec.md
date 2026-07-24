# Feature Specification: Garden Palette Selector

**Feature Branch**: `014-garden-palette`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "Garden Palette selector — users choose a visual palette (Natural / Vibrant / Dusk) for the whole app; light/dark remains orthogonal; persist locally; Options surface (not permanent header chrome); Natural is default (constitution muted theme); Vibrant ports the neon-garden experiment; Dusk is a new calm night-garden indigo/violet/gold palette."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a garden palette (Priority: P1)

A user opens Options, picks one of three named palettes (Natural, Vibrant, or Dusk), and the entire app immediately rethemes to that palette. Their choice is remembered across reloads. Fresh visits default to Natural.

**Why this priority**: Core job-to-be-done — selectable visual identity without leaving the calm, local-first experience.

**Independent Test**: Open Options → select each palette → confirm full-app retheme; reload → confirm persistence; clear storage → confirm Natural default.

**Acceptance Scenarios**:

1. **Given** the app is open with any palette, **When** the user selects a different palette in Options, **Then** every surface (backgrounds, paper, text, accents, brand treatments that are palette-aware) updates to that palette immediately with no page navigation.
2. **Given** the user has selected Vibrant (or Dusk), **When** they reload the app, **Then** it opens still on that palette.
3. **Given** a fresh profile with no stored palette preference, **When** the app first loads, **Then** it uses Natural.
4. **Given** the user is on Natural, **When** they view the app, **Then** colors match the muted, nature-inspired constitution palette (not the brighter neon experiment).

---

### User Story 2 - Palette works in both light and dark (Priority: P1)

Light/dark appearance remains a separate choice from palette. Every palette defines both light and dark variants. Changing either axis updates the theme without resetting the other.

**Why this priority**: Equal first-class requirement — palette × appearance must both work; shipping palettes that only look correct in one appearance would violate accessibility and calm UX.

**Independent Test**: For each of Natural / Vibrant / Dusk, toggle light and dark and confirm coherent, readable surfaces in all six combinations.

**Acceptance Scenarios**:

1. **Given** any palette is selected, **When** the user switches between light and dark appearance, **Then** the app uses that palette’s light or dark token set and keeps the same palette id.
2. **Given** dark appearance and Natural palette, **When** the user switches to Vibrant then to Dusk (still dark), **Then** each switch applies that palette’s dark variant without flipping to light.
3. **Given** any of the six palette×appearance combinations, **When** the user reads primary text and interactive controls, **Then** contrast meets WCAG AA.

---

### User Story 3 - Discover Options without header clutter (Priority: P2)

The palette picker is not permanently in the main header chrome. An Options entry (e.g. settings control) opens a calm surface where the exclusive Natural / Vibrant / Dusk control lives. Appearance (light/dark) may stay in the header or move into the same Options surface if that reduces clutter.

**Why this priority**: Required for calm chrome; secondary to retheme/persist because the product still works if the entry is slightly harder to find, but discoverability and non-dominance are explicit acceptance criteria.

**Independent Test**: Confirm header has no permanent three-way palette control; open Options; change palette; confirm keyboard and screen-reader labels on entry and group.

**Acceptance Scenarios**:

1. **Given** the main dashboard header, **When** the user looks at permanent chrome, **Then** they do not see a always-visible Natural / Vibrant / Dusk toggle group.
2. **Given** the Options entry, **When** the user activates it (pointer or keyboard), **Then** an Options surface opens containing the exclusive palette control labeled Natural, Vibrant, and Dusk.
3. **Given** the Options entry and palette group, **When** a screen reader user focuses them, **Then** meaningful names announce the Options control and the Palette group / each option.
4. **Given** the Options surface is open, **When** the user changes palette, **Then** the app rethemes while the surface remains usable (no jarring full-page reset that loses the control mid-interaction).

---

### Edge Cases

- Invalid or unknown stored palette value → fall back to Natural without error UI or shame messaging.
- Corrupted / unavailable local storage → app still runs on Natural (and existing appearance default); no crash.
- Rapid consecutive palette switches → last selection wins; theme stays consistent with stored preference.
- `prefers-reduced-motion` → any open/close motion on the Options surface falls back to instant or minimal motion; retheme itself is a color change, not a motion dependency.
- Vibrant is an explicit opt-in aesthetic that is intentionally brighter than the constitution’s default muted look; Natural remains the default so Principle V’s muted baseline is preserved for new users.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST offer exactly three named visual palettes: Natural, Vibrant, and Dusk.
- **FR-002**: Natural MUST be the default palette and MUST express the muted, nature-inspired constitution look (warm parchment / moss / clay family) for both light and dark appearance.
- **FR-003**: Vibrant MUST express the brighter “neon garden” look (vivid spring green, warm coral, electric cyan/violet accents on violet-tinted surfaces) for both light and dark appearance, derived from the prior psychedelic theme experiment.
- **FR-004**: Dusk MUST express a calm night-garden look (deep indigo/violet surfaces, soft lilac mist, muted gold accents, with frog/green identity retained somewhere in the token set) for both light and dark appearance, and MUST feel cohesive with Frog Garden between Natural and Vibrant.
- **FR-005**: System MUST provide an exclusive selection control (three options: Natural / Vibrant / Dusk) so only one palette is active at a time.
- **FR-006**: Changing the active palette MUST immediately retheme the whole app (all themed surfaces update together).
- **FR-007**: System MUST persist the chosen palette on-device and restore it on subsequent loads (constitution Principle III).
- **FR-008**: Light/dark appearance MUST remain a separate axis from palette; every palette MUST define full light and dark token sets; changing one axis MUST NOT reset the other.
- **FR-009**: Palette selection MUST NOT live as permanent main-header chrome; it MUST be reached via an Options entry that opens a secondary surface (menu, drawer, dialog, or popover).
- **FR-010**: Appearance (light/dark) MAY remain in the header or MAY move into the same Options surface when that reduces header clutter; either approach is acceptable if Options remains discoverable and calm.
- **FR-011**: Options entry and palette control MUST be keyboard-operable and screen-reader labelled (constitution Principle IV).
- **FR-012**: All six palette×appearance combinations MUST meet WCAG AA contrast for text and interactive elements (constitution Principle IV).
- **FR-013**: User-facing copy for this feature MUST use the word **Palette** (not “color mode”) to avoid collision with light/dark appearance.
- **FR-014**: Brand/wordmark treatment MAY vary by palette (e.g. gradient wordmark allowed for Vibrant only) PROVIDED Natural and Dusk keep solid, calm brand coloring.
- **FR-015**: Body typography MUST remain the existing calm sans (Manrope). Heading display face MAY differ by palette when it improves readability of the aesthetic (document the chosen strategy in planning artifacts).

### Key Entities

- **Palette preference**: persisted id among `natural` | `vibrant` | `dusk`; default `natural`.
- **Appearance preference** (existing): persisted light | dark; orthogonal to palette.
- **Palette definition**: named set of light + dark color tokens (and optional brand/typography accents) that fully retheme the app when selected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch palette and see a complete visual retheme within one interaction (no leftover surfaces from the previous palette).
- **SC-002**: After choosing a non-default palette and reloading, 100% of such sessions restore the chosen palette without further action.
- **SC-003**: All three palettes are usable in both light and dark (six combinations) with readable primary text and controls.
- **SC-004**: A new user who never opens Options experiences Natural (muted constitution look), not Vibrant.
- **SC-005**: The permanent header does not permanently display the three-way palette control; users can still find and change palette via Options in under ~10 seconds on a familiar session.
- **SC-006**: Keyboard-only and screen-reader users can open Options and change palette without pointer use.

## Assumptions

- Natural tokens are the pre-experiment muted set (parchment/moss/clay), even if a brighter experiment was temporarily merged to `main`; this feature restores Natural as default and keeps Vibrant as opt-in.
- Vibrant tokens and optional Vibrant-only wordmark gradient come from the `claude/bold-psychedelic-theme-experiment` exploration (related inspiration: PR #11); this feature supersedes merging that experiment as the sole theme.
- Dusk is a new design owned by this feature; exact hex values are a planning/implementation concern as long as FR-004 and FR-012 hold.
- Options surface pattern will be chosen in planning for calm consistency with existing UI (Popover vs Menu vs Dialog vs Drawer); not blocked for specify.
- No backend, auth, telemetry, or per-component color overrides beyond theme tokens and necessary brand/wordmark touches.
- Constitution Principle V’s “muted” default is preserved by keeping Natural as default; Vibrant is an explicit user choice and does not require silently amending the constitution — document opt-in aesthetic modes in the plan/PR instead.
- Existing light/dark default (dark when unset) from `003-dark-mode-toggle` is unchanged by this feature.
