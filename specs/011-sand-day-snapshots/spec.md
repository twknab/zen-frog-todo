# Feature Specification: Sand Day Snapshots

**Feature Branch**: `011-sand-day-snapshots`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Persist a snapshot of sand drawings per day. Currently Sand Mode draws rake strokes entirely in-memory — nothing is persisted, and clearing (manual reset or start a new day) wipes strokes with no record. Capture a snapshot right before the sand is cleared and store it associated with that day, so the user can later browse back and see a small thumbnail per day that opens larger in a lightbox/dialog on click."

## Overview

Sand Mode is a calm rake-drawing canvas. Today its strokes live only in memory: smoothing the sand (or starting a new day) erases them forever. **Sand Day Snapshots** quietly keeps a keepsake of what was drawn — a small image saved for that day — so looking back at past days can include a soft visual memory of the sand, without changing how Sand Mode itself feels to use.

Snapshots are optional, quiet, and non-judgmental: there is no score for "how much you raked," no empty-state shame when a day has no drawing, and no redesign of the rake experience. Capture happens only when the sand is about to be cleared; browsing reuses the existing day-history surface (The Grove) so history stays in one calm place.

## Clarifications

### Session 2026-07-23 (locked for unattended cloud run)

- Q: On a manual clear mid-day, should every clear create a new snapshot or only the latest? → A: **Every manual clear snapshots, keeping only the latest for "today" (overwrite).** Empty canvas / no strokes → skip snapshot (do not store blank).
- Q: How does the current/live day relate to archive browse? → A: **Surface today's latest snapshot (if any) in the same day-history/browse UI as archived days, labelled as today.** When "start a new day" runs, that snapshot (or a fresh capture at archive time if sand still has content) becomes part of the archived day record.
- Q: When is the image captured? → A: **Immediately before clear/wipe, from the live canvas** (or an offscreen downscale of it). Theme-consistent: what the user drew, no extra styling.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep a keepsake when the sand is smoothed (Priority: P1)

A user has been raking in Sand Mode. They press the "smooth the sand" control (or start a new day, which also clears the sand). Just before the canvas clears, the app quietly saves a small image of what was drawn for today. If they smooth again later the same day, the previous keepsake is replaced by the newer one. If the canvas was empty, nothing is saved.

**Why this priority**: Without capture-and-store, there is nothing to browse. This is the core persistence slice and is independently valuable even before browse UI lands (data is ready for history).

**Independent Test**: Rake some strokes, press reset, confirm a today's snapshot exists; rake again, reset again, confirm only one today's snapshot remains and it reflects the later drawing; reset on empty canvas and confirm no blank snapshot is stored.

**Acceptance Scenarios**:

1. **Given** the sand canvas has one or more strokes, **When** the user smooths the sand, **Then** a snapshot of the current drawing is saved for today and the canvas clears.
2. **Given** today already has a saved sand snapshot, **When** the user draws again and smooths the sand, **Then** today's snapshot is replaced by the newer drawing (only one latest keepsake for today).
3. **Given** the sand canvas has no strokes, **When** the user smooths the sand, **Then** no snapshot is written (blank images are never stored).
4. **Given** the sand canvas has strokes, **When** the user confirms "start a new day", **Then** a sand snapshot is associated with the archived day (fresh capture if the canvas still has content, otherwise today's already-saved latest snapshot if any) before the board resets.
5. **Given** capture fails for any reason (storage full, unexpected error), **When** the user smooths or starts a new day, **Then** the clear/reset still completes calmly — losing a keepsake must never block smoothing the sand or starting fresh.

---

### User Story 2 - Browse sand keepsakes in day history (Priority: P2)

A user opens the existing day-history view (The Grove). Alongside past days, they can see a small sand thumbnail for any day that has a snapshot — including **today** when a latest snapshot exists, clearly labelled as today. Clicking (or activating) a thumbnail opens a larger view in a calm dialog/lightbox; dismissing returns them to the history view.

**Why this priority**: This is the user-facing payoff of capture. It depends on US1 data existing but is the reason the feature feels complete.

**Independent Test**: With today's snapshot and at least one archived day that has a sand snapshot, open The Grove, confirm thumbnails appear for those days (today labelled as today), open one into a larger dialog, and dismiss it.

**Acceptance Scenarios**:

1. **Given** one or more archived days include a sand snapshot, **When** the user views day history, **Then** each such day offers a small sand thumbnail associated with that day.
2. **Given** today has a latest sand snapshot (and the day is not yet archived), **When** the user views day history, **Then** today's snapshot appears in the same browse UI, labelled as today — not mixed up with archived closures.
3. **Given** a day has no sand snapshot, **When** it appears in day history, **Then** there is no blank thumbnail and no shaming empty-sand message — the day simply has no sand keepsake.
4. **Given** a sand thumbnail is shown, **When** the user activates it, **Then** a larger view of that drawing opens in a calm dialog/lightbox.
5. **Given** the larger view is open, **When** the user dismisses it (including via Escape), **Then** they return to day history with focus restored appropriately.
6. **Given** a keyboard or screen-reader user, **When** they reach a sand thumbnail, **Then** it is operable without a pointer, announced with alt text that references the date, and the lightbox is dismissible and announced.

---

### User Story 3 - Respect device storage limits (Priority: P3)

The app stores everything on-device. A year of full-size drawings would risk filling storage and breaking other features. Snapshots are therefore kept small (downscaled / compressed keepsakes suitable for thumbnails and a modest lightbox), and older days that predate this feature simply have no sand field — nothing breaks.

**Why this priority**: Storage safety is a hard constraint of local-first design; without it the feature can harm the whole app. It is validated by design and by checking that a full retention window of snapshots remains within a safe budget alongside existing archive data.

**Independent Test**: Confirm snapshots are stored as compact images (not full-resolution originals), that archived days without the field still load, and that saving many days of snapshots does not prevent normal archive/task use under typical device quotas.

**Acceptance Scenarios**:

1. **Given** a newly captured snapshot, **When** it is stored, **Then** it is a compact, downscaled keepsake suitable for thumbnail + lightbox — not a full-resolution canvas dump.
2. **Given** archived days created before this feature, **When** they are loaded, **Then** they work as before with no sand snapshot (optional/absent field).
3. **Given** the on-device store is under pressure, **When** a new snapshot cannot be saved, **Then** the user can still clear sand and use the rest of the app; failure is silent or gently non-blocking (no alarm UI).

---

### Edge Cases

- **Empty canvas clear**: no snapshot written.
- **Multiple clears in one day**: only the latest snapshot for today is kept.
- **Start a new day with empty canvas but an earlier today's snapshot**: that earlier snapshot is what gets attached to the archived day (when the day is archived).
- **Start a new day with strokes still on the canvas**: capture fresh immediately before clear; that becomes the archived day's sand snapshot (and replaces any mid-day "today" snapshot for the closed day).
- **Truly empty day** (no tasks/reflection/focus/growth) that would be skipped by the existing empty-day archive guard: sand-only content — if the only keepsake is a sand snapshot with nothing else to archive, the day SHOULD still be archived so the sand keepsake is not orphaned (see Assumptions).
- **Auto calendar-day rollover after the browser was closed**: in-memory strokes are already gone; only a previously saved "today" snapshot (from an earlier clear) can be carried into the archive. Live uncleared strokes cannot be recovered after process death — accepted limitation (YAGNI: no live stroke persistence).
- **Same calendar date closed more than once**: each archived closure keeps its own optional sand snapshot; labelling follows existing same-date disambiguation.
- **`prefers-reduced-motion`**: lightbox open/close uses instant or minimal motion.
- **Focus Mode**: day-history browse follows existing Grove hide-in-Focus conventions; Sand Mode itself is already hidden in Focus Mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Immediately before the sand canvas is cleared (manual smooth or new-day wipe), the system MUST attempt to capture a visual snapshot of the current canvas content when the canvas has strokes.
- **FR-002**: If the canvas has no strokes at clear time, the system MUST NOT store a blank snapshot.
- **FR-003**: For the live day, the system MUST keep at most one sand snapshot ("today's latest"), overwriting on each successful mid-day capture.
- **FR-004**: When a day is archived via "start a new day" (or the equivalent automatic rollover path where a today-snapshot already exists), the archived day record MUST include the sand snapshot when one is available — preferring a fresh capture if the live canvas still has strokes, otherwise today's stored latest snapshot.
- **FR-005**: The sand snapshot on an archived day MUST be an optional, additive field so older archived days without it remain valid.
- **FR-006**: Snapshots MUST be stored only on-device (no network, accounts, or telemetry), consistent with local-first privacy.
- **FR-007**: Stored snapshots MUST be compact (downscaled and/or lossy-compressed) so a full retention window of archived days with sand keepsakes remains within a safe on-device storage budget alongside existing app data. Exact encoding is a planning decision; full-resolution uncompressed images MUST NOT be the default.
- **FR-008**: Day history (The Grove) MUST surface sand thumbnails for archived days that have a snapshot, and MUST surface today's latest snapshot (when present) in the same browse UI labelled as today.
- **FR-009**: Activating a sand thumbnail MUST open a larger view in a calm, themed dialog/lightbox that is dismissible (including Escape) and restores focus on close.
- **FR-010**: Sand thumbnails MUST have accessible names/alt text that reference the date; thumbnails and the lightbox MUST be keyboard-operable; open/close motion MUST respect `prefers-reduced-motion`.
- **FR-011**: Snapshot capture or storage failure MUST NOT block clearing the sand or completing "start a new day".
- **FR-012**: Visual presentation of thumbnails and lightbox MUST use the app's re-themed design system (not stock Material defaults) and MUST show the drawing as captured (theme-consistent rake art, no decorative overlays or score UI on the image).
- **FR-013**: The feature MUST NOT redesign Sand Mode drawing itself (rake behavior, colors, layout) beyond the capture hook needed for snapshots.
- **FR-014**: The feature MUST NOT introduce scoreboards, rankings, or judgmental copy about how much or how little the user drew (Principle II).

### Key Entities *(include if feature involves data)*

- **Sand Snapshot**: A compact visual keepsake of the sand canvas at a moment of clear — associated with either "today" (live, overwriteable) or an archived day. Optional; absent means that day has no sand keepsake.
- **Archived Day**: Existing on-device closed-day record. Gains an optional sand-snapshot attribute; all existing attributes unchanged.
- **Today's Sand Keepsake**: The single live-day snapshot slot (latest only), shown in day history as today until the day is archived and the slot is cleared for the fresh day.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After drawing and smoothing the sand, users can find a today's sand thumbnail in day history within one deliberate navigation to The Grove (no hunting through menus).
- **SC-002**: After closing a day that had a sand keepsake, that day's thumbnail remains visible in day history on a later visit (persists across reload).
- **SC-003**: Opening and dismissing a sand lightbox is fully usable with keyboard only, and screen-reader users hear a date-referenced name for the thumbnail.
- **SC-004**: With a full year of archived days each carrying a compact sand snapshot, the app continues to load and save normal task/archive data without routine storage-quota failures attributable to snapshot size (budget validated at planning time).
- **SC-005**: Clearing empty sand never creates a blank keepsake; multiple clears in one day leave exactly one today's snapshot (the latest).

## Assumptions

- Day-history browse means the existing Grove section (and its day dialog patterns), extended to show sand thumbnails — not a separate competing history surface.
- Sand-only days (snapshot present, otherwise empty under today's empty-day guard) SHOULD still be archived so the keepsake is retained; this is a small, intentional widening of the empty-day guard.
- Automatic overnight rollover can only carry a previously saved today's snapshot; uncleared in-memory strokes after the tab was closed are out of scope (no live stroke persistence in v1).
- Compact encoding (downscale + lossy format) is chosen at plan time to satisfy FR-007 / SC-004; lightbox shows the stored keepsake (may be soft/small), not a regenerated full-resolution original.
- Export/import of archive JSON will naturally include the new optional field when present; no special export UX is required for v1 beyond existing archive export behavior.
