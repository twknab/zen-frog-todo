# Feature Specification: Start a New Day — Day Archive & JSON Export

**Feature Branch**: `007-new-day-archive`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "create a 'new day' — the old day gets saved to JSON data, plus an export-day dropdown in the UI. Export individual entries OR the entire dump. Everything is stored locally (no DB)."

## Clarifications

### Session 2026-07-15

- Q: When a new day starts, what should the running "N focus sessions completed" count do? → A: Reset to zero each new day (per-day count); the on-screen figure shows only today's sessions and the archived day stores that day's count.
- Q: How should archived days be labelled in the export menu when more than one close happens on the same calendar date? → A: Show the date only by default; if two or more closes share a date, append a time to each so every entry is uniquely identifiable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Close today and begin a fresh day (Priority: P1)

At the end of a working day, the person wants to draw a deliberate line under it — the way you might close a journal — and start tomorrow clean without losing the record of what they did. From the "Close the day" card they choose to start a new day. After a gentle confirmation, the day just lived is tucked away into a private archive, and the board resets to a calm fresh start: unfinished tasks are still waiting, but the completed items, the reflection, and the bonsai's growth all belong to yesterday now.

**Why this priority**: This is the heart of the feature and the only part that must exist for it to deliver value. Archiving and reset together turn the app from a single ever-growing board into a day-by-day practice. Nothing else (export) has anything to work with until a day can be closed.

**Independent Test**: With a board that has some completed tasks, an unfinished task, a reflection line, and a grown bonsai, click "Start a new day," confirm, and verify: the completed tasks and reflection are gone from the live board, the unfinished task remains, the bonsai is back to a shrub, and a new archived day now exists holding what was cleared.

**Acceptance Scenarios**:

1. **Given** a board with two completed tasks, one unfinished task, a reflection line, and a bonsai grown past the shrub stage, **When** the person starts a new day and confirms, **Then** the two completed tasks and the reflection are removed from the live board, the unfinished task remains on the board, and the bonsai returns to a shrub.
2. **Given** the same starting board, **When** the person starts a new day and confirms, **Then** a new archived day is created containing that date, the two completed tasks with their notes, the reflection text, the count of focus sessions completed that day, and the bonsai growth reached that day.
3. **Given** the person clicks "Start a new day," **When** the confirmation appears and they cancel, **Then** nothing changes — no archive is created and the board is untouched.
4. **Given** a carried-over task that had been marked as today's frog, **When** a new day begins, **Then** the task remains on the board but is no longer designated the frog, so the person re-chooses their frog for the new day.
5. **Given** a completely empty day (nothing completed, no reflection, no focus sessions, bonsai still a shrub), **When** the person starts a new day, **Then** the board simply resets and no empty archive entry is created.

---

### User Story 2 - Export a single archived day (Priority: P2)

The person wants to keep or share the record of one particular day — to file it in their own notes, back it up, or look at it later. From an export control in the header they open a menu, see their archived days listed, pick one, and receive a JSON file for just that day saved to their device.

**Why this priority**: The primary payoff of keeping an archive is being able to take a day's record out of the app. Single-day export is the more common, more focused need than a full dump, so it ranks above it.

**Independent Test**: With at least one archived day present, open the header export menu, choose a specific day, and confirm a well-formed JSON file for exactly that day downloads to the device with a clear, dated filename — with no network request made.

**Acceptance Scenarios**:

1. **Given** three archived days, **When** the person opens the export menu, **Then** each archived day is listed as its own selectable entry, labelled by its date.
2. **Given** the export menu is open, **When** the person selects one archived day, **Then** a JSON file containing only that day's archived record downloads to their device with a human-readable, dated filename.
3. **Given** a day is exported, **When** the file is opened, **Then** it is valid, well-formed JSON that faithfully represents that day's completed tasks, reflection, focus-session count, and bonsai growth.
4. **Given** no days have been archived yet, **When** the person opens the export menu, **Then** the per-day list is empty or clearly indicates there is nothing archived yet, without error.

---

### User Story 3 - Export everything (Priority: P3)

The person wants a complete backup of their Frog Garden in one file — every archived day plus wherever the current day stands — so they have a single portable copy of all their data.

**Why this priority**: A full dump is valuable for backup and portability but is a heavier, less frequent action than grabbing one day. It builds on the same export surface as User Story 2, so it comes last.

**Independent Test**: From the header export menu choose "Export everything" and confirm a single well-formed JSON file downloads containing all archived days and the current live state, with a dated filename and no network request.

**Acceptance Scenarios**:

1. **Given** any number of archived days (including zero), **When** the person chooses "Export everything," **Then** a single JSON file downloads containing all archived days and the current live day's state.
2. **Given** the full-dump file, **When** it is opened, **Then** it is valid, well-formed JSON with a clear top-level structure separating archived days from the current live state.
3. **Given** the person has never archived a day, **When** they choose "Export everything," **Then** the file still downloads successfully and contains the current live state with an empty archive.

---

### Edge Cases

- **Empty / sparse day**: Starting a new day when nothing was accomplished must not create an empty archive entry, and must never produce shaming or "you did nothing" language — it simply resets. A day with *some* content (any completed task, a reflection, or a focus session) is archived normally.
- **Two closes in one calendar day**: If the person starts a new day twice on the same date, each close is archived as its own entry rather than overwriting the earlier one; such same-date entries each show a time in the export menu so they remain distinguishable (see FR-010).
- **Carried-over frog**: An unfinished frog task carries over but loses its frog designation (see US1 scenario 4).
- **Storage bound reached**: When the archive grows large, the oldest entries are pruned to respect device storage limits; the person is not blocked from closing a day because the archive is "full."
- **Export with special characters**: Task titles, notes, and reflections containing quotes, emoji, or newlines are safely escaped so the exported JSON is always valid.
- **Reduced motion**: Any transition on reset or confirmation respects the reduced-motion preference.

## Requirements *(mandatory)*

### Functional Requirements

**Starting a new day**

- **FR-001**: The system MUST provide a "Start a new day" action located on the existing "Close the day" card.
- **FR-002**: The system MUST require an explicit, gentle confirmation before starting a new day, and MUST make no changes if the person cancels.
- **FR-003**: Starting a new day MUST be a manual action only; the system MUST NOT automatically close or roll over a day at midnight or on any timer.
- **FR-004**: On confirmed close, the system MUST archive a snapshot of the day containing: the date closed, the tasks completed during that day (including their notes), the reflection text, the number of focus sessions completed that day, and the bonsai growth reached that day.
- **FR-005**: On confirmed close, the system MUST keep unfinished tasks on the board for the new day and MUST remove completed tasks from the live board and completed list (moving them into the archive).
- **FR-006**: On confirmed close, the system MUST reset the day's fresh-slate state: the bonsai returns to a shrub, the reflection is cleared, the focus-session count resets to zero, and any frog designation is cleared so it can be re-chosen.
- **FR-006a**: The focus-session count MUST be a per-day figure — the on-screen "focus sessions completed" display shows only the current day's sessions (resetting to zero on close), and the archived day records that day's final count.
- **FR-006b**: The bonsai's growth MUST be scoped to the current day-cycle: it accumulates in response to accomplishments since the last "start a new day" and resets to a shrub only on close — NOT automatically at calendar midnight. Idle wilting continues to follow the daily active-hours window (business hours) unchanged. This keeps the bonsai aligned with the completed-task and focus data, which also span "since the last close," so a day's snapshot is internally consistent even if the person does not close every calendar day.
- **FR-007**: The system MUST NOT create an archive entry for a completely empty day (no completed tasks, no reflection, no focus sessions), while still performing the reset.
- **FR-008**: The system MUST store archived days locally on the device only, with no network transmission, and MUST bound the archive so growth over time respects device storage (pruning oldest entries when necessary).

**Exporting**

- **FR-009**: The system MUST provide an export control in the header area, near the existing theme and mode controls, presented as a compact menu rather than always-visible buttons.
- **FR-010**: The export menu MUST list each archived day as an individually selectable entry, labelled by its date; when two or more archived entries share the same calendar date, each of those entries MUST additionally show a time so every entry is uniquely identifiable.
- **FR-011**: The system MUST let the person export a single archived day as a JSON file downloaded to their device.
- **FR-012**: The system MUST let the person export everything — all archived days plus the current live state — as a single JSON file downloaded to their device.
- **FR-013**: All exports MUST be performed entirely on-device (file download) with no upload, backend call, or telemetry.
- **FR-014**: Exported files MUST be valid, well-formed JSON and MUST use human-readable, dated filenames (for example, a single day as `frog-garden-<date>.json` and the full dump as `frog-garden-all-<date>.json`).
- **FR-015**: The full-dump JSON MUST have a clear top-level structure that separates archived days from the current live state.

**Experience & accessibility**

- **FR-016**: All copy for this feature MUST use calm, non-judgmental, journaling/keepsake framing; the system MUST NOT display streak counts, "X of Y completed" scoring, or any language implying failure for a light day.
- **FR-017**: The "Start a new day" action, the confirmation, and the export menu MUST be fully keyboard-operable and labelled for screen readers.
- **FR-018**: Any motion introduced by this feature MUST respect the reduced-motion preference and MUST meet the project's contrast requirements in both light and dark themes.

### Key Entities *(include if feature involves data)*

- **Archived Day**: A private, on-device snapshot of one closed day. Attributes: the date it was closed; the tasks completed that day, each with its title and note; the reflection line; the count of focus sessions completed that day; the bonsai growth reached that day. Multiple archived days accumulate over time, ordered by date, and are individually exportable.
- **Live State**: The current, not-yet-closed day as it already exists — the active task board (including carried-over unfinished tasks), the current reflection, focus progress, and the current bonsai. Included in the "export everything" dump alongside the archive.
- **Export File**: A JSON document produced on demand — either a single Archived Day, or the whole collection (all Archived Days + Live State) — saved to the person's device.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person can close the current day — archiving it and resetting the board — in a single confirmed action from the "Close the day" card, in under 15 seconds.
- **SC-002**: After closing a day, 100% of unfinished tasks remain on the board and 100% of that day's completed tasks, reflection, and bonsai growth are removed from the live board and preserved in the archive.
- **SC-003**: A person can export either one specific day or the entire archive as a downloaded JSON file in at most two interactions from the header (open menu → choose entry).
- **SC-004**: 100% of exported files open as valid, well-formed JSON in a standard text editor or JSON viewer.
- **SC-005**: No action in this feature — closing a day, listing the archive, or exporting — causes any network request; all data stays on the device.
- **SC-006**: Starting a new day on an empty board never creates an archive entry and never shows judgmental or failure-implying language.

## Assumptions

- **Storage medium**: The archive reuses the app's existing on-device local storage mechanism (a new storage key alongside the current ones); no database, server, or file system beyond browser-managed local storage is introduced. This satisfies the constitution's local-first, no-backend principle for v1.
- **"That day's" data**: Completed tasks belonging to the day being closed are those completed since the previous close (i.e., currently on the live completed list); the day's focus-session count is likewise the number completed since the previous close. Per the 2026-07-15 clarification, the focus-session count becomes a per-day figure that resets to zero on close — this replaces the current since-install cumulative display, so the on-screen number always reflects only the current day. Per FR-006b (analyze remediation of finding I1), the bonsai's growth is likewise scoped to the close-cycle rather than the calendar day, so all three data sources (tasks, focus, bonsai) cover the same period and a snapshot stays consistent across a midnight when no close happened.
- **Supersedes bonsai daily-scope (006)**: Feature 006 originally auto-reset the bonsai each calendar day. This feature changes that: the bonsai now resets only on a manual "start a new day." Growth still caps at the mature canopy and wilt is unchanged (active-hours only). See `specs/006-growing-bonsai/data-model.md` for the amendment note.
- **Frog on carry-over**: Unfinished tasks that carry over lose their frog designation so the person deliberately re-chooses a frog each day, consistent with the "swallow the frog first" ritual.
- **Retention bound**: A reasonable recent window of archived days is retained (with oldest pruned when the bound is reached) to respect device storage; the exact size is a planning/tuning detail, not a user-visible promise.
- **Date basis**: A day is identified by the local calendar date on which it is closed.
- **Import is out of scope**: Restoring or importing from an exported JSON file is explicitly not part of v1; export is one-way (out of the app).
- **Out of scope for v1**: importing/restoring from JSON, editing archived days, cloud sync / multi-device, automatic midnight rollover, and non-JSON export formats (CSV/PDF).
