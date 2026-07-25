# Feature Specification: High Contrast Toggle

**Feature Branch**: `018-high-contrast`

**Created**: 2026-07-25

**Status**: In progress

**Input**: User description: "Add an Options toggle labeled High Contrast. When ON, apply one dedicated high-contrast theme override for the whole app (not pick among greys), disable the Palette dropdown visually and functionally, persist preference on-device (`frog-garden:high-contrast-v1`, default false), and keep the Options popover open when toggling. When OFF, re-enable Palette and restore the user’s stored garden palette visually without having wiped it. Invent one hard-set HC theme with light + dark variants meeting AA (prefer AAA where practical). Prefer keeping Appearance available if both HC light and HC dark are solid. Override sits above selected PaletteId. Coexist with Hyper Minimal density if present. No new palettes in the dropdown."

## Clarifications

### Session 2026-07-25

Self-resolved from the product brief (no blocking human questions):

- Q: Keep Appearance (Light/Dark) while High Contrast is on? → A: **Yes.** High Contrast provides dedicated light and dark variants that both meet WCAG AA (AAA-ish where practical). Appearance remains available; only Palette is locked while HC is on.
- Q: One override vs grey palette picker? → A: **One hard-set override** (internal id `highContrast`) — not added to the Palette dropdown and not selectable as a garden palette.
- Q: Persistence key / default? → A: `frog-garden:high-contrast-v1`, default `false`.
- Q: Palette preference while HC is on? → A: **Preserve** stored `frog-garden:palette-v1`; visually ignore/override it while HC is active; restore on turn-off.
- Q: Spec number collision with Hyper Minimal / Night Camp (both used `017` on other branches)? → A: Use **`018-high-contrast`** so those PRs keep their numbering.
- Q: Atmosphere under HC? → A: Keep a simplified, low-wash atmosphere so contrast is not washed out.
- Q: Moss / frog identity? → A: Use a high-contrast green-family primary that passes AA for UI chrome; ground frogs may still read green.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Turn on High Contrast (Priority: P1)

A user who needs stronger contrast opens Options and enables **High Contrast**. The whole app immediately switches to the dedicated high-contrast look. The Palette control becomes disabled with a calm hint. Their previous palette choice is still stored. The Options popover stays open.

**Why this priority**: Core accessibility affordance; primary value of the feature.

**Independent Test**: Toggle High Contrast on with any palette selected; verify HC theme, disabled Palette, persistence key, and open popover.

**Acceptance Scenarios**:

1. **Given** Options is open and High Contrast is off, **When** the user turns High Contrast on, **Then** the app applies the single HC theme for the current Appearance (light or dark) and Options remains open.
2. **Given** High Contrast is on, **When** the user looks at Palette, **Then** the Palette dropdown is visually and functionally disabled and shows a short calm hint such as “Using high contrast”.
3. **Given** High Contrast is on and a non-default palette was previously selected, **When** the user inspects stored preferences, **Then** their palette preference is unchanged (not wiped).
4. **Given** High Contrast was turned on, **When** the user reloads the app, **Then** High Contrast remains on and the HC theme is applied.

---

### User Story 2 - Turn off High Contrast and regain Palette (Priority: P1)

A user turns High Contrast off. The Palette control re-enables and the app returns to their stored garden palette. Options stays open.

**Why this priority**: Must cleanly reverse the override without data loss.

**Independent Test**: Enable HC, change nothing else, disable HC; confirm stored palette reappears and Palette is interactive again.

**Acceptance Scenarios**:

1. **Given** High Contrast is on and palette preference is e.g. Prism Bloom, **When** the user turns High Contrast off, **Then** the app rethemes to Prism Bloom (stored preference) and Palette is enabled.
2. **Given** High Contrast is toggled off, **When** the Options popover was open, **Then** it remains open.
3. **Given** High Contrast is off after having been on, **When** the user changes Palette, **Then** palette changes apply normally as before.

---

### User Story 3 - Appearance still works under High Contrast (Priority: P2)

While High Contrast is on, the user can still switch Light/Dark. Each Appearance uses the corresponding HC light or HC dark token set, both meeting AA contrast.

**Why this priority**: Keeps orthogonal Appearance control without locking an extra axis when HC variants are solid.

**Independent Test**: With HC on, toggle Appearance Light ↔ Dark; verify both variants remain highly readable and HC-specific.

**Acceptance Scenarios**:

1. **Given** High Contrast is on and Appearance is Dark, **When** the user selects Light, **Then** the HC light theme applies (near-white surfaces, near-black text, strong focus/selected states).
2. **Given** High Contrast is on and Appearance is Light, **When** the user selects Dark, **Then** the HC dark theme applies (near-black surfaces, near-white text, strong focus/selected states).
3. **Given** High Contrast is on, **When** the user uses keyboard focus and selection, **Then** focus and selected states remain clearly visible in both appearances.

---

### Edge Cases

- Corrupted / unavailable local storage for HC → treat as off (`false`); app still runs; no shame messaging.
- Invalid boolean coercion → normalize to `false`.
- Rapid HC toggles → last write wins; palette preference untouched.
- `prefers-reduced-motion` → Options motion stays instant/minimal; HC is color/contrast only.
- Hyper Minimal density (if present on a later merge) → HC toggle coexists; neither feature breaks the other.
- User cannot select HC as a garden palette from the dropdown (it is not a PaletteId option).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Options MUST provide a toggle labeled **High Contrast** near Appearance / Density / Dev.
- **FR-002**: When High Contrast is ON, the system MUST apply exactly one dedicated high-contrast theme override for the whole app (internal id `highContrast`), not a selectable garden palette.
- **FR-003**: When High Contrast is ON, the Palette control MUST be disabled visually and functionally; copy MUST stay calm (optional short hint: “Using high contrast”); no shame/preachy language.
- **FR-004**: When High Contrast is OFF, the Palette control MUST re-enable and the app MUST use the user’s stored garden palette.
- **FR-005**: Turning High Contrast on MUST NOT wipe or rewrite the stored palette preference; HC only overrides presentation while active.
- **FR-006**: System MUST persist High Contrast on-device under `frog-garden:high-contrast-v1` with default `false`.
- **FR-007**: Changing the High Contrast toggle MUST NOT close the Options popover.
- **FR-008**: Appearance (Light/Dark) MUST remain available while High Contrast is on; HC MUST define both light and dark variants meeting WCAG AA minimum (AAA-ish where practical).
- **FR-009**: Theme resolution MUST prefer High Contrast over the selected `PaletteId` when HC is on (HC tokens regardless of palette).
- **FR-010**: HC surfaces MUST use near-black / near-white with very strong text contrast and clear focus/selected states.
- **FR-011**: Primary/moss MAY remain green-family for frog identity only if it meets HC contrast for UI chrome; otherwise use a HC-safe green or accent that passes.
- **FR-012**: Atmosphere under HC MUST keep or simplify washes so contrast is not washed out (lower opacity / flatter is fine).
- **FR-013**: High Contrast MUST NOT add a new entry to the Palette dropdown.
- **FR-014**: Interactive controls for High Contrast and the disabled Palette MUST be keyboard-operable and screen-reader labelled; disabled Palette MUST announce sensibly.
- **FR-015**: Feature MUST coexist with Hyper Minimal density if/when that toggle exists; this feature MUST NOT depend on Hyper Minimal being merged.

### Key Entities

- **High Contrast preference**: Boolean on-device setting (`frog-garden:high-contrast-v1`), default false.
- **High Contrast theme (`highContrast`)**: Hard-set token bags for light and dark appearances, plus simplified atmosphere; applied as an override above `PaletteId`.
- **Palette preference**: Existing garden palette selection; preserved while HC overrides visuals.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can enable High Contrast from Options in one toggle action and see the HC theme applied immediately without navigating away.
- **SC-002**: With High Contrast on, 100% of attempts to change Palette via the Options control fail (control disabled); stored palette remains unchanged.
- **SC-003**: After disabling High Contrast, the previously stored palette is visibly restored without the user re-selecting it.
- **SC-004**: High Contrast preference survives reload (on stays on; off stays off) for a normal browser session with local storage available.
- **SC-005**: HC light and HC dark both meet WCAG AA for body text and interactive chrome; focus/selected states remain distinguishable.
- **SC-006**: Toggling High Contrast never closes the Options popover in manual verification.

## Assumptions

- Spec number `018` avoids collision with open PRs that already claimed `017` on other branches.
- Existing Options Popover patterns (Appearance ToggleButtonGroup, Dev Switch) are reused; no new dialog surface.
- Persistence uses the existing `usePersistentState` helper.
- No backend, auth, or telemetry.
- No automated contrast-audit tooling is required for the release gate; manual AA check + `tsc`/`eslint` suffice per constitution.
- Scope stays tight: toggle + one override theme + Palette disable — no new palettes, no Density work in this feature.
