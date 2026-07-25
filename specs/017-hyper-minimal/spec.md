# Feature Specification: Hyper Minimal Mode

**Feature Branch**: `017-hyper-minimal`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Add an Options panel toggle labeled Hyper Minimal that strips the UI down to raw functionality in both Flow and Focus modes. When ON: hide app name/wordmark, frog logo/brand mark, all decorative/instructional headings/captions/taglines/section titles that aren't strictly needed to operate. When ON: keep garden bonsai/frogs/critters/frog-fruit, interactive controls, Options gear, Flow/Focus switch, essential actions (export/notepad) with aria-labels if labels hidden, task list content, focus timer UI guts, sand, grove as functional surfaces. Same preference for Flow and Focus. Persist on-device like other Options prefs (`frog-garden:hyper-minimal-v1`, default false). Calm Toggle near Appearance/Dev; changing it must NOT close Options; don't hide Options dialog chrome so hard they can't toggle it off."

## Clarifications

### Session 2026-07-25

Self-resolved from the product request (no blocking questions):

- Q: Does Hyper Minimal hide chrome inside the Options popover itself? → A: **No.** Options dialog title, section labels (Palette / Appearance / Dev / Hyper Minimal), and control labels stay fully visible so the user can always turn Hyper Minimal off and change other settings.
- Q: Are Flow/Focus toggle button labels hidden? → A: **No.** The mode switch remains labeled and usable; it is explicitly kept as functional chrome.
- Q: Are decorative card header icons (Waves, Timer, Spa, etc.) hidden with their titles? → A: **Yes.** They are title-row chrome, not interactive controls. Functional icon-only buttons (reset sand, Options, Export, Notepad, ambient sound, info tooltips if kept as controls) remain with `aria-label`s.
- Q: Empty-state instructional copy (e.g. "No frog chosen yet", Grove empty prose, timer session-count captions)? → A: **Hide** as instructional chrome. Interactive empty surfaces remain operable; accessible names cover meaning.
- Q: Timer phase helper sentences ("Focus session complete…")? → A: **Hide** the helper sentences; keep the action buttons that advance the flow.
- Q: Scope vs garden palette contrast themes? → A: **Out of scope** — this feature is Hyper Minimal only; no new color themes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Hyper Minimal from Options (Priority: P1)

A user opens Options, turns on **Hyper Minimal**, and the main dashboard immediately drops decorative brand and instructional chrome while remaining fully operable. Turning it off restores the familiar labeled UI. The choice survives reload. Fresh visits default to off.

**Why this priority**: Core job-to-be-done — a calm density control without leaving the local-first Options surface.

**Independent Test**: Open Options → enable Hyper Minimal → confirm chrome gone and controls still work → reload → still on → disable → chrome returns; Options never auto-closes on toggle.

**Acceptance Scenarios**:

1. **Given** Hyper Minimal is off, **When** the user enables Hyper Minimal in Options, **Then** the wordmark "Frog Garden", header frog brand mark, and tagline disappear immediately without navigation.
2. **Given** Hyper Minimal is on, **When** the user reloads the app, **Then** Hyper Minimal remains on.
3. **Given** a fresh profile with no stored preference, **When** the app loads, **Then** Hyper Minimal is off (full chrome visible).
4. **Given** the Options popover is open, **When** the user toggles Hyper Minimal, **Then** the preference applies immediately and the Options popover stays open and usable.
5. **Given** Hyper Minimal is on, **When** the user opens Options, **Then** Options chrome (title, section labels, Hyper Minimal switch label) remains readable so they can turn it off.

---

### User Story 2 - Raw functionality in Flow and Focus (Priority: P1)

With Hyper Minimal on, both Flow Mode and Focus Mode show only functional surfaces: tasks, frog task interaction, focus timer guts, bonsai/garden goodies, sand, grove, and essential header actions. Decorative section titles, captions, helper copy, and similar chrome are hidden equally in both modes.

**Why this priority**: Equal first-class requirement — a mode that only strips Flow would fail the product request.

**Independent Test**: Enable Hyper Minimal; switch Flow ↔ Focus; confirm chrome stays hidden in both and garden/timer/tasks remain interactive.

**Acceptance Scenarios**:

1. **Given** Hyper Minimal is on in Flow Mode, **When** the user views the dashboard, **Then** card/section titles (e.g. Task list, Sand Mode, Focus, Bonsai, Close the day, Completed, Standup Summary, The Grove) and helper captions/taglines are not visually shown, while task content, sand canvas, bonsai (with frogs/critters/fruit), timer controls, and grove interactive surfaces remain usable.
2. **Given** Hyper Minimal is on, **When** the user switches to Focus Mode, **Then** the same preference applies — brand/tagline/section chrome stay hidden; frog task, bonsai, and timer remain operable.
3. **Given** Hyper Minimal is on, **When** the user uses Export, Notepad, Options, sand reset, or other icon-only essential actions, **Then** those controls remain available and announce meaningful names to assistive tech even if visible captions were never present or were removed.
4. **Given** Hyper Minimal is on, **When** the user interacts with the focus timer, **Then** dial, countdown, start/cancel/break buttons, and ambient control still work; decorative session-count or phase helper captions are hidden.

---

### User Story 3 - Accessibility preserved under stripped chrome (Priority: P1)

Hyper Minimal removes visual instructional chrome without breaking keyboard use or screen-reader understanding. Icon-only controls keep accessible names. The app does not rely on hidden decorative headings for operability.

**Why this priority**: Constitution Principle IV — accessibility is not optional; density mode must not strip meaning from AT.

**Independent Test**: With Hyper Minimal on, tab through header and primary controls; confirm aria-labels / accessible names; confirm Options and mode switch remain understandable.

**Acceptance Scenarios**:

1. **Given** Hyper Minimal is on, **When** a keyboard user tabs through primary actions, **Then** every interactive control remains focusable and operable.
2. **Given** Hyper Minimal is on, **When** a screen reader focuses Options, Export, Notepad, mode switch, and other icon-only controls, **Then** each announces a meaningful accessible name.
3. **Given** Hyper Minimal is on, **When** decorative headings/captions are hidden, **Then** they are not required for understanding primary tasks (accessible names and control labels suffice).

---

### Edge Cases

- Corrupted or unavailable local storage → treat Hyper Minimal as off; app remains usable with full chrome; no shame/error UI.
- Rapid toggles while Options is open → last value wins; popover stays open; UI matches stored preference.
- Focus Mode already hides some Flow-only cards → Hyper Minimal does not re-show those cards; it only strips chrome on whatever is visible.
- `prefers-reduced-motion` → Options open/close and existing motion fallbacks unchanged; Hyper Minimal itself is show/hide of chrome, not a motion dependency.
- Closing Options does not reset Hyper Minimal — preference persists as last set.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an Options control labeled **Hyper Minimal** (calm toggle/switch) near Appearance / Dev.
- **FR-002**: Hyper Minimal MUST default to off for new users / missing preference.
- **FR-003**: System MUST persist Hyper Minimal on-device and restore it on subsequent loads (constitution Principle III).
- **FR-004**: Changing Hyper Minimal MUST apply immediately to the visible dashboard without page navigation.
- **FR-005**: Changing Hyper Minimal MUST NOT forcibly close the Options surface.
- **FR-006**: While Hyper Minimal is on, the system MUST hide the app wordmark ("Frog Garden"), the header frog brand mark/logo, and the header tagline.
- **FR-007**: While Hyper Minimal is on, the system MUST hide decorative and instructional headings, captions, subtitles, overlines, section/card titles, and similar chrome that are not required to operate the app (in both Flow and Focus).
- **FR-008**: While Hyper Minimal is on, the system MUST keep interactive functionality: tasks, frog task controls, focus timer controls and time display, Flow/Focus mode switch, Options entry, Export, Notepad, sand canvas and essential sand actions, grove as a functional surface, and garden bonsai including frogs, critters, and frog-fruit.
- **FR-009**: Hyper Minimal MUST use one shared preference for Flow and Focus (not per-mode).
- **FR-010**: Options popover chrome (title, section labels, and the Hyper Minimal label itself) MUST remain visible and usable when Hyper Minimal is on so the user can disable it.
- **FR-011**: Icon-only and essential controls MUST retain meaningful accessible names (`aria-label` or equivalent) when visual captions/labels are absent (constitution Principle IV).
- **FR-012**: User-facing label for the preference MUST be **Hyper Minimal**.
- **FR-013**: This feature MUST NOT introduce new garden color themes or contrast palettes.

### Key Entities

- **Hyper Minimal preference**: persisted boolean; default `false`; when `true`, decorative/instructional chrome is hidden app-wide (except Options surface chrome); orthogonal to palette, appearance, and Dev.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can enable Hyper Minimal and see brand/tagline/section chrome disappear within one interaction.
- **SC-002**: After enabling Hyper Minimal and reloading, 100% of such sessions restore Hyper Minimal without further action.
- **SC-003**: With Hyper Minimal on, users can still complete core flows (mark frog/task done, run focus timer, rake sand, open Options/Notepad/Export, switch Flow/Focus) without needing the hidden chrome.
- **SC-004**: Options remains open across Hyper Minimal toggles; users can disable Hyper Minimal from Options without hunting for a hidden control.
- **SC-005**: Keyboard and screen-reader users can operate primary controls with Hyper Minimal on (meaningful names present).

## Assumptions

- Existing Options Popover pattern (from garden palette) remains the home for this toggle.
- "Chrome" means decorative/instructional text and title-row decoration, not interactive task titles, timer digits, or garden visuals.
- Button labels that *are* the control (e.g. "Start focus", "Flow Mode") stay visible; helper sentences beside them may hide.
- Persistence follows the same on-device mechanism as other Options prefs; concrete storage key is an implementation detail aligned with the product request (`frog-garden:hyper-minimal-v1`).
- No backend, auth, or telemetry (constitution Principle III).
