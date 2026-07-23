# Feature Specification: Delete Incomplete Tasks

**Feature Branch**: `012-delete-incomplete-tasks`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Add the ability to delete incomplete tasks from the dashboard task list via a small trash icon on each incomplete row. Deleting requires a calm confirmation dialog. Completed tasks cannot be deleted this way. If the deleted task was today's frog, clear the frog designation. Persist via existing tasks store. Local-only, accessible, themed MUI, no shame UI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove a task that no longer belongs (Priority: P1)

Someone looking at today's board notices a task that was added by mistake, is no longer relevant, or was a duplicate. They want it gone from the live list — not marked complete (which would treat it as done), just quietly removed. On each unfinished task they see a small trash control. Tapping it opens a calm confirmation. Confirming removes the task from the board permanently; canceling leaves everything as it was.

**Why this priority**: Without a way to remove unfinished tasks, the board accumulates clutter that completion alone cannot clear. This is the entire value of the feature.

**Independent Test**: Add an incomplete task, open its trash control, confirm removal, and verify the task is gone from the board and does not reappear after a refresh. Cancel path leaves the task intact.

**Acceptance Scenarios**:

1. **Given** an incomplete task on the board, **When** the person activates the trash control on that row, **Then** a calm confirmation dialog appears asking whether to remove the task, and the task is not yet removed.
2. **Given** the confirmation dialog is open for an incomplete task, **When** the person confirms removal, **Then** that task disappears from the live board permanently and remains gone after the page is refreshed.
3. **Given** the confirmation dialog is open, **When** the person cancels or dismisses it (including Escape), **Then** the dialog closes and the task remains on the board unchanged.
4. **Given** several incomplete tasks on the board, **When** one is removed and confirmed, **Then** only that task is removed; other tasks are untouched.

---

### User Story 2 - Completed tasks stay non-deletable from the live list (Priority: P2)

Someone who has finished a task should not be offered a way to erase it from the live list via this trash control. Completed work has its own place in the day's record; deleting it from the board is out of scope for this feature. Incomplete rows show the trash control; completed rows do not.

**Why this priority**: Guarding completed tasks prevents accidental erasure of finished work and keeps this feature narrowly scoped to decluttering unfinished items.

**Independent Test**: Mark a task complete and confirm no trash control appears on that row. Incomplete rows still show the control.

**Acceptance Scenarios**:

1. **Given** a completed task on the live board, **When** the person views that row, **Then** no trash / delete control is shown for it.
2. **Given** a mix of completed and incomplete tasks, **When** the person views the list, **Then** only incomplete rows expose the trash control.

---

### User Story 3 - Deleting today's frog clears the frog quietly (Priority: P3)

If the unfinished task being removed was designated as today's frog, removing it must also clear that designation so the board does not point at a missing task. The person is not scolded; the frog simply becomes unset and can be chosen again later.

**Why this priority**: Correctness for an existing designation; without it the board could reference a task that no longer exists. Secondary to the basic delete flow.

**Independent Test**: Designate an incomplete task as the frog, delete it via confirm, and verify the frog designation is cleared and no other tasks are affected.

**Acceptance Scenarios**:

1. **Given** an incomplete task that is today's frog, **When** the person confirms its removal, **Then** the task is gone and no task is designated as the frog.
2. **Given** an incomplete task that is not the frog, **When** it is removed, **Then** the current frog designation (if any on another task) remains unchanged.

---

### Edge Cases

- **Empty title**: A task with a blank or whitespace-only title still shows a labelled delete control (label remains understandable, e.g. referring to "untitled" or the generic task) and can still be removed after confirmation.
- **Last incomplete task**: Removing the only incomplete task leaves an empty (or only-completed) board without error or shame copy.
- **Double-activate**: Opening confirm and confirming once removes the task once; there is no duplicate-delete error surface.
- **History untouched**: Removing an incomplete task does not invent or rewrite completed-log, Grove, or day-archive history.
- **Reduced motion**: Confirmation dialog motion respects the reduced-motion preference (instant or minimal transition).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show a small trash affordance on each incomplete task row in the dashboard task list.
- **FR-002**: The system MUST NOT show that trash affordance on completed task rows in the live list.
- **FR-003**: Activating the trash affordance MUST open a calm confirmation dialog before any removal; the system MUST NOT delete on the first click alone.
- **FR-004**: Confirming in the dialog MUST permanently remove that task from the live tasks list and persist the change on-device.
- **FR-005**: Canceling or dismissing the dialog (including Escape) MUST leave the task and all related state unchanged.
- **FR-006**: If the removed task was designated as today's frog, the system MUST clear the frog designation to unset.
- **FR-007**: Removing an incomplete task MUST NOT append to, edit, or remove entries in the completed-task log, day archive, or Grove history.
- **FR-008**: Delete-related copy MUST be calm and non-judgmental (for example, asking to remove the task and noting it leaves the board); it MUST NOT use guilt, failure, or alarm framing.
- **FR-009**: The trash control MUST be keyboard-operable and have an accessible name that includes the task title (or a clear fallback when the title is empty).
- **FR-010**: The confirmation dialog MUST be labelled for assistive technology, keyboard-operable, and honor reduced-motion preferences.
- **FR-011**: Visual treatment of the trash control MUST be muted and themed with the rest of the app — not alarm-red shame styling.
- **FR-012**: All of this behavior MUST remain local-only on the device with no network, auth, or telemetry.

### Key Entities

- **Task (live)**: An item on today's board with a title and completed/incomplete status; may optionally be designated as today's frog. Only incomplete live tasks are eligible for deletion in this feature.
- **Frog designation**: A pointer to at most one live task as today's focus frog; cleared when that task is deleted.
- **Confirmation**: A calm, dismissible prompt that gates permanent removal; Cancel leaves state unchanged, Confirm applies removal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual verification, an incomplete task can be removed end-to-end (open trash → confirm → gone after refresh) in under 10 seconds for a typical row.
- **SC-002**: 100% of cancel/dismiss paths leave the board unchanged (no accidental deletes in acceptance walkthrough).
- **SC-003**: Completed rows never expose a trash control in the live list (spot-check with mixed completed/incomplete boards).
- **SC-004**: Deleting the frog task always leaves frog unset afterward; deleting a non-frog never clears another task's frog.
- **SC-005**: Keyboard-only and screen-reader walkthrough can discover the delete control, operate the dialog, and complete or cancel without pointer use.
- **SC-006**: Completed-log / archive / Grove entry counts are unchanged after deleting an incomplete task that was never completed.

## Assumptions

- The live task list and frog designation already exist; this feature only adds removal for incomplete tasks.
- Completed tasks remain visible on the live board until existing day-close / completion flows handle them — this feature does not change those flows.
- Undo, snackbar toast, bulk delete, swipe-to-delete, and deleting from Completed log / Grove / archives are out of scope for v1.
- Persistence uses the existing on-device tasks store; no new backend or sync.
- Confirmation pattern should feel consistent with other calm confirmations already in the app (e.g. starting a new day).
