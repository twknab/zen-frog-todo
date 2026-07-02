# Feature Specification: Persisted light/dark color mode toggle

**Feature Branch**: `003-dark-mode-toggle`

**Created**: 2026-07-02

**Status**: Implemented (documented after the fact — this spec describes work already built outside this session; see Note below)

**Input**: User description: "Persisted light/dark color mode toggle for the whole app"

**Note**: This feature was implemented directly (via `src/theme/ThemeRegistry.tsx`, `src/theme/theme.ts`, and a toggle button in `src/app/page.tsx`) outside the spec-first workflow used elsewhere in this project. This spec documents it retroactively so `.specify` stays an accurate record of what the app actually does, per the constitution's spec-driven-development principle.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch between light and dark (Priority: P1)

A user can toggle the whole app between a light and a dark variant of the zen theme, and the app remembers their choice.

**Why this priority**: Sole purpose of this feature.

**Independent Test**: Toggle the mode, confirm every surface (backgrounds, cards, text, canvas) re-themes consistently; reload and confirm the choice persisted.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user clicks the mode toggle in the header, **Then** the entire app switches between light and dark palettes immediately.
2. **Given** a mode has been chosen, **When** the user reloads the app, **Then** it opens in the previously chosen mode.
3. **Given** a fresh profile with no stored preference, **When** the app first loads, **Then** it defaults to dark.

### Edge Cases

- No system-preference (`prefers-color-scheme`) detection is implemented — the app always starts in dark for a new profile regardless of OS setting. Flagging as a possible follow-up, not a defect.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a single control that switches the entire app between a light and a dark theme variant.
- **FR-002**: System MUST persist the chosen mode locally and restore it on subsequent loads (constitution Principle III — local-first, on-device only).
- **FR-003**: System MUST default to dark mode when no preference has been stored yet.
- **FR-004**: Both theme variants MUST maintain WCAG AA contrast (constitution Principle IV), matching the standard already set for the light theme in `specs/001-frog-garden`.

### Key Entities

- **Color mode preference**: a single persisted value, `"light" | "dark"`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every screen re-themes fully (no mixed light/dark surfaces) within one click of the toggle.
- **SC-002**: The chosen mode survives a full page reload with no additional user action.

## Assumptions

- No system-preference detection for the initial default (see Edge Cases) — a deliberate simplification, not yet confirmed as final with the user.
- This spec covers only the light/dark mechanism itself. The accompanying visual changes seen alongside it in the codebase — renamed mode-toggle labels ("Flow Mode"/"Focus Mode" in place of "Frog Mode"/"Flow Mode") and per-card accent colors — are a separate, currently undocumented change to `specs/001-frog-garden`'s core terminology and are called out separately rather than folded in here, since that rename touches another spec's core concept and hasn't been confirmed as intentional/final.
