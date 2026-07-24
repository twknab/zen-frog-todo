# Feature Specification: Garden Palette Selector

**Feature Branch**: `014-garden-palette`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "Garden Palette selector — users choose a visual palette (Natural / Vibrant / Dusk) for the whole app; light/dark remains orthogonal; persist locally; Options surface (not permanent header chrome) also hosts light/dark and Dev; Natural is default (constitution muted theme); Vibrant ports the neon-garden experiment; Dusk is a new calm night-garden indigo/violet/gold palette."

## Clarifications

### Session 2026-07-24

- Q: Where should light/dark appearance and Dev live relative to palette? → A: All three live in the same Options surface; remove sun/moon and Dev from permanent header chrome (header keeps primary nav/actions only: Flow/Focus, Export, Notepad, Options entry).
- Q: What Options surface pattern? → A: IconButton opens a Popover (calm, non-modal, consistent with existing Tooltip/IconButton chrome; less heavy than Dialog/Drawer).
- Q: How is light/dark presented inside Options? → A: Exclusive ToggleButtonGroup labeled Appearance with Light / Dark (mirrors Palette control; clearer than icon-only once tucked away).
- Q: Heading font strategy across palettes? → A: Natural and Dusk use Zen Maru Gothic (constitution calm headings); Vibrant uses Bricolage Grotesque; body stays Manrope for all.
- Q: Should Options stay open across theme switches? → A: Yes — Popover remains open while changing Palette / Appearance / Dev so the user can compare without re-opening.

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

Light/dark appearance remains a separate choice from palette. Every palette defines both light and dark variants. Changing either axis updates the theme without resetting the other. Appearance is controlled from Options (not the header).

**Why this priority**: Equal first-class requirement — palette × appearance must both work; shipping palettes that only look correct in one appearance would violate accessibility and calm UX.

**Independent Test**: For each of Natural / Vibrant / Dusk, open Options and toggle Light / Dark; confirm coherent, readable surfaces in all six combinations.

**Acceptance Scenarios**:

1. **Given** any palette is selected, **When** the user switches Appearance between Light and Dark in Options, **Then** the app uses that palette’s light or dark token set and keeps the same palette id.
2. **Given** dark appearance and Natural palette, **When** the user switches to Vibrant then to Dusk (still dark), **Then** each switch applies that palette’s dark variant without flipping to light.
3. **Given** any of the six palette×appearance combinations, **When** the user reads primary text and interactive controls, **Then** contrast meets WCAG AA.

---

### User Story 3 - Options panel decluttering the header (Priority: P1)

An Options entry opens a calm Popover that is the single home for: (1) Palette (Natural / Vibrant / Dusk), (2) Appearance (Light / Dark), and (3) Dev mode. The main header no longer shows the sun/moon toggle or the Dev switch — only primary nav/actions plus the Options entry.

**Why this priority**: Elevated to P1 by product revision — decluttering the header is part of the acceptance bar, not optional polish.

**Independent Test**: Confirm header has no sun/moon, no Dev switch, no permanent palette group; open Options; change palette, appearance, and Dev; confirm keyboard and screen-reader labels.

**Acceptance Scenarios**:

1. **Given** the main dashboard header, **When** the user looks at permanent chrome, **Then** they see primary actions (Flow/Focus, Export, Notepad) and an Options entry — and do **not** see a permanent palette group, sun/moon appearance toggle, or Dev switch.
2. **Given** the Options entry, **When** the user activates it (pointer or keyboard), **Then** a Popover opens containing: Palette (Natural / Vibrant / Dusk), Appearance (Light / Dark), and Dev.
3. **Given** the Options Popover is open, **When** the user changes Palette, Appearance, or Dev, **Then** the change applies immediately and the Popover stays open/usable.
4. **Given** the Options entry and controls inside, **When** a screen reader user focuses them, **Then** meaningful names announce Options, Palette, Appearance, Dev, and each discrete option.
5. **Given** Dev is turned on in Options, **When** the user closes Options, **Then** existing Dev tools elsewhere on the page still appear as before (only the Dev *toggle* moved; Dev tooling placement is unchanged).

---

### Edge Cases

- Invalid or unknown stored palette value → fall back to Natural without error UI or shame messaging.
- Corrupted / unavailable local storage → app still runs on Natural (and existing appearance default); no crash.
- Rapid consecutive palette or appearance switches → last selection wins; theme stays consistent with stored preferences.
- `prefers-reduced-motion` → any open/close motion on the Options surface falls back to instant or minimal motion; retheme itself is a color change, not a motion dependency.
- Vibrant is an explicit opt-in aesthetic that is intentionally brighter than the constitution’s default muted look; Natural remains the default so Principle V’s muted baseline is preserved for new users.
- Closing Options (Escape / click-away) does not reset Palette, Appearance, or Dev — preferences stay as last set.

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
- **FR-009**: System MUST provide an Options entry in the header that opens a secondary Options surface; Palette, Appearance (light/dark), and Dev MUST all live in that surface — not as permanent header chrome.
- **FR-010**: The permanent header MUST NOT display the sun/moon appearance toggle, the Dev switch, or the three-way palette control; header retains primary nav/actions (Flow/Focus, Export, Notepad) plus the Options entry.
- **FR-011**: Options entry and all Options controls (Palette, Appearance, Dev) MUST be keyboard-operable and screen-reader labelled (constitution Principle IV).
- **FR-012**: All six palette×appearance combinations MUST meet WCAG AA contrast for text and interactive elements (constitution Principle IV).
- **FR-013**: User-facing copy for the palette feature MUST use the word **Palette**; light/dark MUST be labeled **Appearance** (or Light / Dark) — not “color mode” in user-facing copy.
- **FR-014**: Brand/wordmark treatment MAY vary by palette (e.g. gradient wordmark allowed for Vibrant only) PROVIDED Natural and Dusk keep solid, calm brand coloring.
- **FR-015**: Body typography MUST remain Manrope for all palettes. Headings MUST use Zen Maru Gothic for Natural and Dusk, and Bricolage Grotesque for Vibrant.
- **FR-016**: Dev mode MUST continue to persist on-device as today; only its toggle control moves into Options — existing Dev tooling surfaces elsewhere are unchanged.
- **FR-017**: Changing Palette, Appearance, or Dev while Options is open MUST NOT forcibly close the Options surface.

### Key Entities

- **Palette preference**: persisted id among `natural` | `vibrant` | `dusk`; default `natural`.
- **Appearance preference** (existing): persisted light | dark; orthogonal to palette; control relocated into Options.
- **Dev preference** (existing): persisted boolean; control relocated into Options.
- **Palette definition**: named set of light + dark color tokens (and optional brand/typography accents) that fully retheme the app when selected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch palette and see a complete visual retheme within one interaction (no leftover surfaces from the previous palette).
- **SC-002**: After choosing a non-default palette and reloading, 100% of such sessions restore the chosen palette without further action.
- **SC-003**: All three palettes are usable in both light and dark (six combinations) with readable primary text and controls.
- **SC-004**: A new user who never opens Options experiences Natural (muted constitution look), not Vibrant.
- **SC-005**: The permanent header shows neither the three-way palette control, nor the sun/moon toggle, nor the Dev switch; users can open Options and change Palette, Appearance, and Dev in under ~10 seconds on a familiar session.
- **SC-006**: Keyboard-only and screen-reader users can open Options and change Palette, Appearance, and Dev without pointer use.
- **SC-007**: Appearance and Dev preferences continue to survive reload after their controls move into Options (no regression vs prior behavior).

## Assumptions

- Natural tokens are the pre-experiment muted set (parchment/moss/clay), even if a brighter experiment was temporarily merged to `main`; this feature restores Natural as default and keeps Vibrant as opt-in.
- Vibrant tokens and optional Vibrant-only wordmark gradient come from the `claude/bold-psychedelic-theme-experiment` exploration (related inspiration: PR #11); this feature supersedes merging that experiment as the sole theme.
- Dusk is a new design owned by this feature; exact hex values are a planning/implementation concern as long as FR-004 and FR-012 hold.
- Options surface is a Popover anchored to a settings IconButton (clarified 2026-07-24).
- No backend, auth, telemetry, or per-component color overrides beyond theme tokens and necessary brand/wordmark touches.
- Constitution Principle V’s “muted” default is preserved by keeping Natural as default; Vibrant is an explicit user choice and does not require silently amending the constitution — document opt-in aesthetic modes in the plan/PR instead.
- Existing light/dark default (dark when unset) from `003-dark-mode-toggle` is unchanged by this feature.
- “Primary nav/actions” retained in the header means Flow/Focus mode toggle, Export, and Notepad — not an exhaustive forever-list; future header items are out of scope unless they are settings-like and belong in Options.
