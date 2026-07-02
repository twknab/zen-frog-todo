# Data Model: Focus history, completed-tasks log, and Sand Mode rocks

## CompletedLogEntry

One entry per task-completion event (not per task — a task completed twice produces two entries).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Generated at creation, independent of the task's own id. |
| `taskId` | `string` | The originating task's id, for reference only (title is snapshotted separately since the task's title could later change). |
| `taskTitle` | `string` | Snapshot of the task's title at the moment of completion. |
| `completedAt` | `string` (ISO timestamp) | When the completion happened. |
| `note` | `string` | Free-text, defaults to `""`. Editable after creation. |

**Persisted as**: an array under a new `usePersistentState` key (e.g. `frog-garden:completed-log-v1`).

**Lifecycle**: A new entry is appended when a task's `toggleTaskCompleted` transitions it from incomplete → complete. Un-completing a task does **not** remove its prior entries (spec.md Edge Cases: history is additive). Re-completing appends a new entry.

## FocusStats

| Field | Type | Notes |
|---|---|---|
| `completedSessions` | `number` | Starts at 0; incremented by 1 each time a focus session reaches natural completion (`work-done`), never on early cancel. |

**Persisted as**: a small object under a new `usePersistentState` key (e.g. `frog-garden:focus-stats-v1`), shape `{ completedSessions: number }` (object rather than a bare number so the shape can grow later, e.g. total focused minutes, without another migration).

## Rock

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Generated on drop. |
| `x`, `y` | `number` | Position within the Sand Mode canvas's local coordinate space (same space `SandCanvas` already uses for stroke points). |
| `radius` | `number` | Fixed footprint radius for collision checks; visually rendered at the same size. |

**Persisted as**: none — held in a React ref/state inside `SandCanvas`, matching the existing decision that rake trails themselves are ephemeral (spec `001-frog-garden`'s Assumption, reaffirmed in this spec's Assumptions).

## Relationships

- `CompletedLogEntry.taskId` references `Task.id` (from `src/lib/tasks.ts`) loosely — the log entry is self-contained (title snapshot) and does not require the task to still exist.
- `FocusStats` and `Rock` have no relationship to `Task` or to each other.

## Validation Rules (from spec.md Functional Requirements)

- FR-001/FR-002: a task's frog-eligibility is derived, not stored — `completed === true` disqualifies it from `setFrogTaskId`, computed at call time (no new field).
- FR-004/FR-005: `CompletedLogEntry.note` has no length limit imposed by this feature (matches the existing free-text reflection field's lack of a limit).
- FR-008/FR-009: a stroke segment is skipped (not drawn) when either endpoint's distance to a rock's center is less than that rock's `radius`.
