# Feature Specification: Markdown Notepad — Persistent Engineering Notes

**Feature Branch**: `011-markdown-notepad`

**Created**: 2026-07-22

**Status**: Draft

**Input**: User description: "Add a universal notepad to the dashboard with a markdown editor that toggles between a raw-markdown writing mode and a live rendered preview. Notes should live per-day, exportable, consistent with how the rest of the app already handles daily data." Clarified in session: notes are **not** day-ephemeral; they persist as an ongoing engineering notepad opened from the upper-right into a bottom drawer. The existing Close-the-day **reflection** remains a separate mental-health token — not replaced by this notepad.

## Overview

Frog Garden already captures a short free-text **reflection** in the "Close the day" card — a gentle mental-health / end-of-day token that archives with the day. That stays as-is.

Separately, engineers need a place for **actual working notes** about the tasks they are doing (scratchpad, standup scraps, links, checklists). This feature adds a **persistent markdown notepad**: always available from a control in the upper-right (including during Focus Mode), opening as a **full-screen** surface with raw-markdown write mode and a live rendered preview powered by a rich client-side markdown stack. The notepad is not cleared when a new day starts; reflection and notepad are two different concepts on purpose.

## Clarifications

### Session 2026-07-22

- Q: Does the markdown notepad replace/upgrade the existing Close-the-day reflection field, or is it a distinct addition? → A: **Distinct addition** — reflection stays as the mental-health / close-the-day token; the notepad is a separate persistent surface for engineering notes about work in progress. (Overturns the earlier "replace/upgrade" recommendation.)
- Q: Are notes ephemeral to the calendar day? → A: **No** — the notepad persists across days; it is not cleared by "Start a new day."
- Q: Where does the person open the notepad? → A: **Upper-right control** that opens a **bottom drawer** containing the markdown editor/preview.
- Q: How does the persistent notepad relate to day archive / single-day export? → A: **Independent of day archive** — one ongoing document, not snapshotted on close; included in **full export only**. Single-day export stays day-only (tasks, reflection, etc.).
- Q: Is the notepad available during Focus Mode? → A: **Yes — keep control visible; drawer allowed during Focus** so the person can capture notes while in flow.
- Q: How large is the notepad surface when open? → A: **Full-screen** when open (maximum writing/preview real estate), still launched from the upper-right control.
- Q: How capable should markdown rendering be? → A: Prefer a **rich, full-featured** markdown stack (GFM-class coverage: tables, strikethrough, task lists, fenced code, etc.) over a minimal subset — richness over smallest-bundle, within still client-side/sanitized constraints.
- Q: How does save/close work? → A: **Auto-persist on edit** — closing never discards; no Save/Discard prompt.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open the notepad and write/preview markdown (Priority: P1)

An engineer working through tasks — including while in Focus / flow state — wants a calm scratchpad for markdown notes. From the upper-right they open a **full-screen** notepad with write mode for raw markdown and a toggle to a live rendered preview. Closing it keeps their text; reopening later shows the same note.

**Why this priority**: Core value. A persistent write/preview notepad in a drawer is a shippable MVP even before export wiring is complete.

**Independent Test**: Open notepad from upper-right, type markdown, toggle preview, toggle back, close drawer, reopen, and confirm the same text remains; reload the app and confirm it still persists.

**Acceptance Scenarios**:

1. **Given** the user is on the dashboard **or in Focus Mode**, **When** they activate the upper-right notepad control, **Then** a **full-screen** notepad surface opens with the markdown editor (write + live preview toggle).
2. **Given** the notepad is open in write mode, **When** they type markdown, **Then** raw source is editable and clearly labelled as writing mode.
3. **Given** markdown content exists, **When** they switch to preview mode, **Then** a calm rendered reading view appears (no network request), including rich markdown constructs the stack supports (e.g. tables, lists, fenced code).
4. **Given** preview mode, **When** they switch back to write, **Then** the raw source is unchanged.
5. **Given** they typed a note and closed the notepad, **When** they reopen it (or reload the app), **Then** the note content is still present.
6. **Given** a keyboard or screen-reader user, **When** they open the notepad and use the write/preview toggle, **Then** both are keyboard-operable and labelled; mode is announced.
7. **Given** `prefers-reduced-motion` is enabled, **When** they open/close the notepad or toggle modes, **Then** motion is instant or minimal.

---

### User Story 2 - Reflection stays; notepad survives new day (Priority: P2)

The engineer still uses Close-the-day reflection as a short mental-health token. Their engineering notepad is separate and does **not** empty when they start a new day. Closing a day continues to archive reflection (and other day data) as today; the notepad keeps rolling.

**Why this priority**: Encodes the intentional product split and the non-ephemeral persistence model — easy to get wrong if treated like daily reflection.

**Independent Test**: Write notepad content and a reflection; start a new day; confirm reflection cleared/archived as today, notepad content still in the drawer, and Close-the-day still has its reflection field.

**Acceptance Scenarios**:

1. **Given** both a reflection and notepad content exist, **When** the user starts a new day and confirms, **Then** reflection is archived/cleared per existing day-archive behavior, and the notepad content remains available in the drawer.
2. **Given** this feature ships, **When** the user looks at Close the day, **Then** the plain reflection field is still present (mental-health token) — not removed in favor of the notepad.
3. **Given** the notepad has content and the day rolls over automatically, **When** the new day begins, **Then** the notepad is unchanged (not cleared by rollover).

---

### User Story 3 - Take the notepad with you via full export (Priority: P3)

The engineer wants their working notes portable. A **full** export includes the persistent notepad as its own field alongside existing live/archive data. Single-day export remains day-scoped and does **not** embed the ongoing notepad. Reflection continues to export with each day as it does today.

**Why this priority**: Constitution Principle III — export so the user is never locked in. Additive once persistence exists.

**Independent Test**: With notepad content present, run a full export and confirm notepad markdown appears; run a single-day export and confirm the day payload does not require or embed the ongoing notepad.

**Acceptance Scenarios**:

1. **Given** notepad content exists, **When** the user runs a full export, **Then** the JSON includes the persistent notepad content in addition to existing day/reflection data.
2. **Given** notepad content exists, **When** the user exports a single archived day, **Then** that day file remains day-only (no requirement to embed the ongoing notepad).
3. **Given** notepad content contains quotes, emoji, or newlines, **When** fully exported, **Then** the JSON remains valid and the text is preserved.
4. **Given** an older export without a notepad field, **When** imported or read, **Then** the app does not fail — missing notepad is treated as empty.

---

### Edge Cases

- **Empty notepad**: write and preview handle emptiness calmly (gentle placeholder; quiet empty preview — no guilt).
- **Very long notes**: editor remains usable (scroll inside the drawer); persistence and export still succeed.
- **Malformed / exotic markdown**: preview renders what it can safely; source never corrupted by previewing.
- **Unsafe markdown** (raw HTML/scripts): preview MUST NOT execute scripts or inject unsafe HTML.
- **Focus Mode**: notepad control stays available; the person can open the full-screen notepad during Focus to capture notes without leaving flow.
- **Notepad dismissed mid-edit**: content already typed remains persisted (no discard-on-close; no Save/Discard prompt).
- **Reflection vs notepad confusion**: UI copy distinguishes them — reflection stays "reflection" / close-day language; notepad is framed as notes / scratchpad for work.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a persistent markdown notepad, distinct from the Close-the-day reflection field.
- **FR-002**: The UI MUST expose a notepad control in the upper-right that opens the notepad as a **full-screen** surface (maximum writing/preview real estate).
- **FR-003**: The notepad MUST support raw-markdown write mode and live rendered preview mode with a user-controlled toggle.
- **FR-004**: Toggling modes MUST preserve the underlying markdown source exactly (preview is read-only rendering of the same text).
- **FR-005**: Notepad content MUST persist on-device across reloads and MUST NOT be cleared when starting a new day (manual or automatic rollover).
- **FR-006**: The existing Close-the-day reflection field MUST remain as the mental-health / end-of-day token and continue to archive through the existing day-archive boundary unchanged in purpose.
- **FR-007**: Full JSON export MUST include persistent notepad content as its own field (not nested inside a single archived day) so the user is never locked in; single-day export MUST remain day-scoped and MUST NOT embed the ongoing notepad; day archive MUST NOT snapshot notepad content on close; import MUST tolerate older exports that lack notepad data.
- **FR-008**: Markdown rendering MUST happen entirely on-device with no network calls, no telemetry, and no external API.
- **FR-009**: Preview MUST sanitize output so user-authored HTML/scripts cannot execute.
- **FR-010**: Notepad open/close, control, and write/preview toggle MUST be keyboard-operable and screen-reader labelled; current mode MUST be announced.
- **FR-011**: Any open/close or mode-switch motion MUST respect `prefers-reduced-motion` (instant or minimal fallback).
- **FR-012**: Notepad UI MUST use the app's re-themed design tokens — not stock Material Design or an unstyled default look.
- **FR-013**: The notepad control MUST remain available during Focus Mode, and the person MUST be able to open the notepad while Focus is active (flow-state note capture).
- **FR-014**: The notepad MUST NOT introduce scoreboards, streak framing, word-count guilt, or judgmental empty states (Principles I & II).
- **FR-015**: Write/preview mode SHOULD default to write on open; mode need not persist across reloads unless later clarified (session-only UI state is acceptable).
- **FR-016**: Preview SHOULD use a rich, full-featured client-side markdown stack (GFM-class: tables, task lists, strikethrough, fenced code, etc.), always sanitized — prefer capability over a bare-minimum parser.
- **FR-017**: Notepad content MUST auto-persist as the person edits; closing the notepad MUST NOT discard typed content and MUST NOT require a Save/Discard confirmation.

### Key Entities

- **Engineering Notepad**: A single persistent free-text (markdown) document for working notes about tasks. Survives day boundaries; not the reflection.
- **Reflection**: Existing short daily mental-health / close-the-day text; still archived per day; unchanged in role by this feature.
- **Notepad View Mode**: Transient UI state — write vs preview — for the drawer editor. Defaults to write; need not persist across reloads.
- **Export Payload**: Full export carries notepad content as a top-level (or equivalently non-day-nested) field alongside live/archive data. Single-day export stays day-only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the full-screen notepad from the upper-right (including during Focus), type a short markdown note, and see a correct live preview in under 30 seconds on first try.
- **SC-002**: After reload, notepad content is still present 100% of the time for a normal local session (including after closing the full-screen surface without an explicit save).
- **SC-003**: After starting a new day, notepad content remains; reflection behaves as it does today (archived/cleared for the live day).
- **SC-004**: Full export contains notepad content whenever it exists; a user can recover notes from a full export alone. Single-day exports remain usable without embedding the notepad.
- **SC-005**: Keyboard-only users can open the notepad, switch write/preview, and edit without a pointer.
- **SC-006**: With reduced motion preferred, open/close and mode changes never play non-essential animation.
- **SC-007**: Close-the-day reflection and the notepad are both present as distinct surfaces — reflection is not removed.
- **SC-008**: While Focus Mode is active, the notepad control remains reachable and opening the notepad does not require leaving Focus first.

## Assumptions

- One continuous notepad document for v1 (not a multi-note library or per-task note attachments).
- Notepad is independent of day archive — not snapshotted on close; full export only (confirmed in Clarifications).
- Notepad opens **full-screen** from an upper-right control; available during Focus Mode.
- Prefer a **rich client-side markdown** stack (GFM-class) with sanitization; exact library chosen in planning. This intentionally trades some bundle size for capability (user preference) — research.md must still justify the pick against Principle VI.
- Supported authoring target is rich everyday markdown (headings, emphasis, lists, task lists, tables, links, fenced code, strikethrough) — not remote embeds or HTML authoring as a first-class goal.
- Edits auto-persist; close never discards (confirmed in Clarifications).
- No collaborative editing, cloud sync, AI assist, or image upload in v1 (YAGNI).
- No separate historical browser of notepad versions beyond export.
