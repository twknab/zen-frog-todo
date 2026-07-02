# Feature Specification: Flow Mode layout — readable task list

**Feature Branch**: `004-dashboard-layout-readability`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "The task list is too narrow — titles get clipped. Put the timer box beneath the frog box, and make the task list full width so it's fully readable."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task titles are fully readable (Priority: P1)

In Flow Mode, the task list sits in its own narrow column, so titles like "Expense Report", "Water the plants", and "Draft Q3 notes" are truncated mid-word. The user wants the list wide enough to read every title in full.

**Why this priority**: A todo list whose items you can't read is the core function failing; this is the whole point of the request.

**Independent Test**: Load Flow Mode on a desktop viewport with a few tasks whose titles are longer than the current column; confirm every title renders in full with no clipping/ellipsis, at typical desktop widths.

**Acceptance Scenarios**:

1. **Given** several tasks with medium-length titles, **When** the dashboard renders in Flow Mode on desktop, **Then** each title is shown in full (no mid-word truncation).
2. **Given** the timer previously sat to the *right* of the task list, **When** the layout re-renders, **Then** the Focus/timer card sits **beneath** the frog card instead, freeing horizontal space for the task list.
3. **Given** a narrow (mobile) viewport, **When** the dashboard renders, **Then** all cards remain in a single readable column with the timer directly beneath the frog.

### Edge Cases

- Very long single-word titles (longer than even the widened row) should wrap or ellipsize gracefully rather than force horizontal scroll — full-width makes this rare but it must not break the grid.
- Focus Mode (frog + timer only) is out of scope here and keeps its existing side-by-side arrangement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In Flow Mode on desktop, the task list MUST occupy a full-width (or near-full-width) region so typical task titles render without truncation.
- **FR-002**: The Focus (timer) card MUST be positioned beneath the frog card, not beside the task list.
- **FR-003**: The layout MUST remain responsive — a single readable column on mobile, with the timer beneath the frog.
- **FR-004**: The change MUST be visual/layout only — no task, timer, sand, or reflection behavior changes.
- **FR-005**: Focus Mode's existing frog+timer arrangement MUST remain unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the three seed task titles (and similar medium-length titles), 100% render in full with no clipping at a 1280px-wide viewport.
- **SC-002**: The timer card renders below the frog card in Flow Mode at all supported widths.
- **SC-003**: No behavioral regression — completing, adding, reordering, and frog-designating tasks all still work exactly as before.

## Assumptions

- This is purely a rework of the Flow Mode Bento grid template in `src/app/page.tsx`; no component internals change.
- "Full width" for the task list means spanning the dashboard's content width (or the large majority of it), not literally edge-to-edge of the viewport.
- Sand Mode remains a prominent card; it may share a row with the frog/timer stack rather than being removed.
