# Feature Specification: Bonsai Info Tooltip & Standup Summary

**Feature Branch**: `009-bonsai-tooltip-standup-summary`

**Created**: 2026-07-17

**Status**: Draft

**Input**: User description: "Two related additions to the Zen Frog Todo app: (1) move the descriptive caption under the bonsai tree into a tooltip triggered by an info icon next to the Bonsai heading, so it stops visually competing with the artwork; (2) add a 'Standup Summary' section at the bottom of the page that auto-generates a bulleted, plain-language recap of completed tasks (using their notes), regenerating automatically whenever a task is completed, built deterministically on-device with no external AI/network calls."

## Clarifications

### Session 2026-07-17

- Q: How should the summary handle a large number of tasks? → A: No cap (Option A) — the current unarchived batch is inherently bounded to roughly a day or a few days' worth of work (a daily log), not weeks or a lifetime board, since the app's existing "start a new day" action periodically resets it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the bonsai's meaning without it crowding the artwork (Priority: P1)

A user looking at their garden dashboard sees the bonsai tree and a simple "Bonsai" heading. They're curious what the tree represents, so they engage an info affordance next to the heading and read a short explanation. When they're not curious, the explanation stays out of the way and doesn't compete visually with the tree illustration.

**Why this priority**: This is the smaller, self-contained change and directly addresses the stated visual-distraction complaint. It has no dependency on the second feature and can ship alone.

**Independent Test**: Load the dashboard, confirm no caption text appears under the bonsai by default, engage the info icon next to the "Bonsai" heading (via mouse, keyboard focus, and tap), and confirm the same explanatory text that used to sit under the tree now appears in a tooltip and can be dismissed.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** the user looks at the Bonsai card, **Then** no static caption paragraph appears under the tree, and an info icon is visible next to the "Bonsai" heading.
2. **Given** the info icon is visible, **When** the user hovers it with a mouse, **Then** a tooltip appears showing the explanatory text ("Grows as you finish tasks and focus sessions.") near the icon.
3. **Given** the info icon is visible, **When** the user reaches it via keyboard (Tab) and it receives focus, **Then** the same tooltip appears, and pressing Escape or moving focus away dismisses it.
4. **Given** a screen reader is active, **When** the user navigates to the info icon, **Then** the icon's accessible name/description communicates that it reveals information about the bonsai, and the tooltip content is announced.
5. **Given** the user has `prefers-reduced-motion` enabled at the OS level, **When** the tooltip appears, **Then** it appears without a distracting entrance animation.

---

### User Story 2 - Get a ready-made recap of the current batch of work (Priority: P2)

A user who completed several tasks (each with an optional note about what they did) wants a quick, standup-style recap they can read off in a meeting — without retyping anything. They scroll to the bottom of the page and find a "Standup Summary" section already populated: what's done (with notes), plus a brief mention of what's still open, giving the full picture of the current batch of work. It updates itself the moment they complete another task.

**Why this priority**: This is the larger, higher-value addition but depends on task data that already exists (completed-task notes and the current open task list) and is additive — it doesn't block or get blocked by User Story 1.

**Independent Test**: Complete a task with a note while one other task remains open, scroll to the bottom of the page, and confirm a "Standup Summary" section shows the completed task's title and note as a bullet, and briefly lists the still-open task. Complete the remaining task and confirm the section updates automatically.

**Acceptance Scenarios**:

1. **Given** the user has completed at least one task today with a note, **When** they view the bottom of the page, **Then** a "Standup Summary" section lists that task, showing its title and note text as a bullet.
2. **Given** the user completes a task that has no note (blank), **When** the Standup Summary section refreshes, **Then** the task still appears in the summary, represented by its title alone (never silently omitted).
3. **Given** the user has one or more tasks still open (not completed), **When** they view the Standup Summary section, **Then** it briefly lists those open tasks separately from the completed ones (e.g., under a "still in progress" or "not yet done" grouping), so the summary reflects the full current batch of work rather than only what's finished.
4. **Given** the user has completed no tasks and has no open tasks either, **When** they view the Standup Summary section, **Then** it shows calm, non-judgmental placeholder copy (no "you haven't done anything" or similar shaming language) rather than an empty gap or error.
5. **Given** the Standup Summary section is currently visible with existing entries, **When** the user completes another task, **Then** the section updates to include the new entry (and drop that task from the open list) without requiring a page reload or manual refresh action.
6. **Given** the user navigates the page via keyboard/screen reader, **When** they reach the Standup Summary section, **Then** its heading and list content are properly structured and announced (heading level, list semantics).

---

### Edge Cases

- What happens if a completed task's note contains only whitespace? It should be treated as blank (title-only bullet), not shown as an empty bullet.
- What happens if an unusually large number of tasks have been completed or are open? All items are still listed (no cap) — the data is expected to stay naturally small (a day or a few days' worth) because the existing "start a new day" action resets the batch periodically.
- What happens when everything is done (no open tasks) but some tasks were completed? The summary should show the done portion normally and either omit the "still open" grouping or show it as empty/complete, without implying something is missing.
- What happens if the user is in Focus mode, where other sections of the page are currently hidden? The Standup Summary section's visibility should follow the same convention as the other bottom-of-page sections (e.g., the existing Completed section) it sits alongside.
- What happens to the bonsai tooltip if the info icon is activated repeatedly in quick succession (e.g., rapid taps on mobile)? It should simply toggle/re-show without stacking multiple tooltips or crashing.
- What happens on a touch-only device where there's no hover state? Tapping the info icon must still reveal the tooltip, and tapping elsewhere must dismiss it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the static explanatory caption currently displayed underneath the bonsai tree illustration.
- **FR-002**: System MUST display an info icon adjacent to the "Bonsai" section heading.
- **FR-003**: System MUST reveal the bonsai's explanatory text in a tooltip when the info icon is hovered, focused, or tapped, and MUST hide it when the user moves away, unfocuses, or presses Escape.
- **FR-004**: The bonsai tooltip's visual style MUST be consistent with the app's existing re-themed tooltip styling used elsewhere in the app.
- **FR-005**: The bonsai info icon MUST be operable via keyboard alone and MUST expose an accessible name/description so screen reader users can discover and read its content.
- **FR-006**: Any entrance animation for the bonsai tooltip MUST respect the user's reduced-motion preference.
- **FR-007**: System MUST provide a "Standup Summary" section positioned at the bottom of the main page, below the existing Completed-tasks section.
- **FR-008**: System MUST populate the Standup Summary's "done" portion from the current, not-yet-archived batch of completed tasks' titles and notes — everything completed since the last day-reset (typically a day or a few days' worth) — not from historical archived days. The summary represents the current batch of work in progress, not an exhaustive history.
- **FR-008a**: System MUST populate the Standup Summary's "still open" portion from tasks that are not yet completed, listed briefly (title only — open tasks don't carry notes), so the summary conveys the full current picture (what's done and what's left) rather than completions alone.
- **FR-009**: System MUST generate the Standup Summary entirely on-device from existing local data, with no calls to an external AI/summarization service and no data leaving the device.
- **FR-010**: System MUST include every completed task in the summary, representing tasks with a blank/whitespace-only note by title alone rather than omitting them.
- **FR-011**: System MUST regenerate the Standup Summary automatically whenever a task is newly marked complete (moving it from the open portion to the done portion), without requiring a manual "generate" or "refresh" action.
- **FR-012**: When there are no completed tasks and no open tasks to summarize, the Standup Summary section MUST show calm, non-judgmental placeholder copy consistent with the app's tone (no shaming or guilt language).
- **FR-013**: The Standup Summary section's heading and list structure MUST be properly labeled for assistive technology (correct heading level, list semantics), with the done and still-open portions distinguishable (e.g., via separate sub-headings or grouped lists).
- **FR-014**: The Standup Summary section MUST list every done and open item without an artificial cap or truncation; this is acceptable because the underlying data is naturally bounded to the current unarchived batch (a day or a few days' worth), not long-term history.

### Key Entities

- **Completed Task Entry**: A record of a finished task used as the source material for a "done" standup bullet — includes the task's title, its free-text note (may be blank), and the timestamp it was completed. Scoped to today's not-yet-archived completions. Already exists in the app today; this feature reads from it rather than introducing a new record type.
- **Open Task**: A task that has not yet been marked complete — used as the source material for a "still open" standup bullet, represented by title only. Already exists in the app's task list today.
- **Standup Summary**: A derived, read-only view — not separately persisted user data — that groups and formats Completed Task Entries and Open Tasks into a bulleted recap of the current batch of work. Recomputed whenever its underlying task data changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the time, no static caption text is visible under the bonsai tree by default — the area is visually clear except for the tree itself.
- **SC-002**: A user can reveal the bonsai's explanatory text via mouse, keyboard, or touch in under 2 seconds of interaction, with no more than one action (hover/focus/tap the icon).
- **SC-003**: 100% of completed tasks with notes recorded on a given day appear in the Standup Summary without any manual step from the user.
- **SC-004**: A user can read a complete, ready-to-say-aloud standup recap directly from the Standup Summary section without needing to open or re-read individual tasks.
- **SC-005**: The Standup Summary section updates to reflect a newly completed task within the same interaction that marks the task complete (no separate refresh needed).
- **SC-006**: Both new UI affordances (bonsai info icon, Standup Summary section) are fully operable using keyboard-only navigation and are correctly announced by screen readers, verified with zero critical accessibility issues.

## Assumptions

- The explanatory text shown in the bonsai tooltip is the same copy currently shown under the tree ("Grows as you finish tasks and focus sessions."); no new copywriting is required unless the user wants to revise it.
- The Standup Summary is a derived/computed view of existing task and completed-task data; it does not require a new persistent data store of its own.
- The Standup Summary reflects the current, not-yet-archived batch of work only (completions since the last day-reset, plus currently open tasks) — it is intentionally not an exhaustive history across archived days, and typically spans a day or a few days rather than a strict single calendar day. Starting a new day (via the existing archive feature) naturally resets the summary along with the rest of the board.
- "Standup Summary" is understood as an internal, personal recap tool (matching this app's local-first, single-player nature) — it is not shared, exported to a team tool, or sent anywhere; any future export/sharing capability is out of scope for this feature.
- No AI/LLM-based summarization is in scope for this feature, per the project's local-first & private constitution principle; the summary is produced by deterministic formatting/grouping of existing task titles and notes.
- The Standup Summary section follows the same show/hide behavior as the adjacent Completed section (e.g., hidden during Focus mode) rather than introducing new visibility rules.
