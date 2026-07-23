# Feature Specification: Markdown Notepad — Daily Notes

**Feature Branch**: `011-markdown-notepad`

**Created**: 2026-07-22

**Status**: Draft

**Input**: User description: "Add a universal notepad to the dashboard with a markdown editor that toggles between a raw-markdown writing mode and a live rendered preview. Notes should live per-day, exportable, consistent with how the rest of the app already handles daily data. Decide during clarify whether this REPLACES/upgrades the existing Close-the-day reflection field (recommended) or is a distinct addition."

## Overview

Frog Garden already captures a single free-text daily reflection in the "Close the day" card, and archives it with the rest of the day's data. That field is plain multiline text with no formatting and lives only in the end-of-day ritual.

This feature upgrades that daily note into a **universal markdown notepad** on the dashboard: a calm place to write throughout the day in raw markdown, toggle to a live rendered preview, and have the note travel with the day through archive and export — the same way tasks, focus sessions, and bonsai state already do. There is still one daily note concept, not two.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write and preview today's note in markdown (Priority: P1)

A user working through their day wants a place to jot thoughts, standup notes, or a short journal entry with light formatting. They open the notepad on the dashboard, type markdown in a writing mode, and toggle to a live preview to see headings, lists, and emphasis rendered calmly. Switching back to write mode preserves their text exactly. The notepad is always available for today — not locked behind the end-of-day ritual.

**Why this priority**: Core value of the feature. A write/preview notepad alone is a shippable MVP even before archive/export wiring is complete (as long as the note persists for the live day).

**Independent Test**: Type markdown in write mode, toggle to preview and confirm it renders, toggle back and confirm the raw source is unchanged; reload the page and confirm today's note is still there.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard (not in Focus Mode), **When** they find the notepad, **Then** they can enter and edit today's note as raw markdown in a clearly labelled writing mode.
2. **Given** the notepad has markdown content, **When** the user switches to preview mode, **Then** the content is shown as a calm, readable rendered view (not as raw source).
3. **Given** the user is in preview mode, **When** they switch back to write mode, **Then** the raw markdown source is unchanged and editable again.
4. **Given** the user has typed a note, **When** they reload the app, **Then** today's note is still present (persisted on-device for the live day).
5. **Given** a keyboard or screen-reader user, **When** they use the write/preview toggle, **Then** it is fully keyboard-operable, labelled, and announces the current mode.
6. **Given** `prefers-reduced-motion` is enabled, **When** the user toggles write/preview, **Then** any transition is instant or minimal — no decorative motion that ignores the preference.

---

### User Story 2 - One daily note that closes with the day (Priority: P2)

A user who has been writing in the notepad throughout the day starts a new day. Their note is archived with that day's snapshot (the same archival path as today's reflection), the live notepad clears for the fresh day, and the archived note remains available when looking back at that day (e.g. in The Grove's day recap). There is no separate "reflection" field competing with the notepad.

**Why this priority**: Ties the notepad into the app's existing daily lifecycle so notes are not orphaned. Depends on US1 existing, but is independently testable via new-day + archive inspection.

**Independent Test**: Write a note, start a new day, confirm the live notepad is empty for the new day and the previous day's archive (and Grove recap, if present) still shows the note content.

**Acceptance Scenarios**:

1. **Given** today's notepad has content, **When** the user starts a new day (manual or automatic rollover), **Then** that content is stored on the archived day record and the live notepad starts empty for the new day.
2. **Given** today's notepad is empty, **When** the user starts a new day, **Then** archival still succeeds and the archived day simply has no note (no error, no guilt copy).
3. **Given** an archived day that had a notepad entry, **When** the user peeks at that day in The Grove, **Then** the recap shows the note content (replacing what was previously labelled "reflection").
4. **Given** the old Close-the-day plain reflection field, **When** this feature ships, **Then** that separate field is gone — the notepad is the single daily note surface (existing stored reflection text migrates into the notepad / archive field so nothing is lost).

---

### User Story 3 - Take notes with you via export (Priority: P3)

A user who values portability exports a single archived day or a full export. The notepad content for each day is included in the JSON so they are never locked in. Import paths that already restore archive/live data continue to carry the note field.

**Why this priority**: Constitution Principle III requires export so the user is never locked in. Additive once US1/US2 persist the note correctly; independently testable via export file inspection.

**Independent Test**: Write a note, archive the day (or include live note in full export), export single-day and full JSON, and confirm the note text appears in both payloads under the established day/reflection field.

**Acceptance Scenarios**:

1. **Given** an archived day with notepad content, **When** the user exports that single day, **Then** the JSON includes the note text.
2. **Given** live and/or archived notes exist, **When** the user runs a full export, **Then** live note content and each archived day's note are present in the payload.
3. **Given** an older export that used the prior plain-reflection field name/shape, **When** it is imported or read, **Then** the content is still recognized (no silent data loss from renaming).

---

### Edge Cases

- **Empty note**: write and preview modes both handle emptiness calmly (gentle placeholder in write; quiet empty preview — no error, no shaming).
- **Very long notes**: the editor remains usable (scroll within the notepad area); archive and export still succeed.
- **Malformed or exotic markdown**: preview renders what it can safely; raw source is never corrupted by previewing.
- **Unsafe markdown** (e.g. raw HTML / scripts in the source): preview MUST NOT execute scripts or inject unsafe HTML — rendering stays local and sanitized.
- **Focus Mode**: the notepad follows the same hide-in-Focus convention as other secondary dashboard sections (Close-the-day, Grove, etc.).
- **Existing reflection text** already stored for the live day or in archives: must appear in the notepad / Grove recap after upgrade (migration, not wipe).
- **Same-day multiple closures**: each archived entry keeps its own note snapshot, consistent with existing archive labelling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dashboard notepad for today's daily note, available outside the end-of-day ritual alone.
- **FR-002**: The notepad MUST support a raw-markdown writing mode and a live rendered preview mode, with a user-controlled toggle between them.
- **FR-003**: Toggling modes MUST preserve the underlying markdown source exactly (preview is read-only rendering of the same text).
- **FR-004**: Today's note MUST persist on-device across reloads for the live day, using the app's existing local-first persistence patterns.
- **FR-005**: The notepad MUST replace the existing Close-the-day plain reflection field as the single daily-note concept (upgrade, not a second parallel note).
- **FR-006**: When a day is archived (manual new day or automatic rollover), the current notepad content MUST be stored on that day's archive record through the existing day-archive boundary (same module/pattern used for other day snapshot fields).
- **FR-007**: After archival, the live notepad MUST clear for the new day.
- **FR-008**: Archived note content MUST surface in The Grove's day recap (wherever reflection was previously shown), omitted gracefully when empty.
- **FR-009**: Single-day and full JSON exports MUST include notepad content for archived days and for the live day (full export), so the user is never locked in.
- **FR-010**: Existing stored reflection text (live key and archived `reflection` field) MUST migrate into the notepad experience without data loss; export field compatibility with prior exports MUST be preserved.
- **FR-011**: Markdown rendering MUST happen entirely on-device with no network calls, no telemetry, and no external API.
- **FR-012**: Preview rendering MUST sanitize output so user-authored HTML/scripts cannot execute in the preview.
- **FR-013**: The write/preview toggle and editor MUST be keyboard-operable and screen-reader labelled; current mode MUST be announced.
- **FR-014**: Any mode-switch motion MUST respect `prefers-reduced-motion` (instant or minimal fallback).
- **FR-015**: Notepad UI MUST use the app's re-themed design tokens (muted nature palette, soft elevation, generous spacing) — not stock Material Design or an unstyled default text area look.
- **FR-016**: The notepad MUST NOT appear in Focus Mode (same secondary-section convention as Close-the-day / Grove).
- **FR-017**: The notepad MUST NOT introduce scoreboards, streak framing, word-count guilt, or judgmental empty states (Principles I & II).

### Key Entities *(include if feature involves data)*

- **Daily Note**: The single free-text (markdown) note for a calendar day. For the live day it is editable in the notepad; when the day closes it is snapshotted onto the Archived Day. Replaces the former plain "reflection" concept at the product level while remaining compatible with the existing archive field.
- **Archived Day**: Existing on-device closed-day record. Continues to carry the day's note via its existing reflection/note field; this feature does not invent a parallel store.
- **Notepad View Mode**: Transient UI state — write vs preview — for the live notepad. Need not survive reloads unless a small local preference is chosen; default is write mode.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the notepad, type a short markdown note, and see a correct live preview in under 30 seconds on first try.
- **SC-002**: After reload, today's note is still present 100% of the time for a normal local session (no silent loss).
- **SC-003**: Starting a new day archives the note with that day and leaves the live notepad empty — verified by inspecting archive/export content.
- **SC-004**: Single-day and full exports both contain the note text whenever it was present; a user can recover their notes from export alone.
- **SC-005**: Keyboard-only users can switch write/preview and edit the note without needing a pointer.
- **SC-006**: With reduced motion preferred, mode changes never play non-essential animation.
- **SC-007**: There is exactly one daily-note surface in the UI (no duplicate reflection field beside the notepad).

## Assumptions

- The notepad **upgrades/replaces** the existing Close-the-day reflection field (recommended in the feature request) rather than adding a second note type — confirmed or adjusted in `/speckit-clarify`.
- Supported markdown is a common, modest subset suitable for short daily notes (headings, emphasis, lists, links, inline code, simple code blocks) — not a full CommonMark edge-case suite or embedded media.
- Default mode on load is **write** (authoring first); preview is opt-in per session.
- Notepad placement: a calm dashboard card/section near other secondary day tools (replacing or absorbing the reflection area in Close the day), visible outside Focus Mode.
- Persistence continues to use the existing reflection storage key / archive field for compatibility; product copy may say "note" or "notepad" even if the internal field remains `reflection`.
- No collaborative editing, no cloud sync, no AI assist, no image upload in v1 (YAGNI).
- No separate "notes history" browser beyond what The Grove already provides for archived days.
