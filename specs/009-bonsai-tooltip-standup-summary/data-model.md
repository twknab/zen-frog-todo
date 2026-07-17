# Phase 1 Data Model: Bonsai Info Tooltip & Standup Summary

This feature introduces **no new persisted entity and no new localStorage key**. It reads two entities that already exist in the codebase and derives a third, purely in-memory, presentational shape.

## Existing entities (unchanged, read-only for this feature)

### `Task` (`src/lib/tasks.ts`)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `title` | `string` | |
| `completed` | `boolean` | Drives "What's next" membership (`completed === false`). |

Source: `frog-garden:tasks-v1`, via `useTasks().tasks`.

### `CompletedLogEntry` (`src/lib/tasks.ts`)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | |
| `taskId` | `string` | |
| `taskTitle` | `string` | Used as the "done" bullet's title. |
| `completedAt` | `string` (ISO 8601) | Sort key for oldest-first ordering. |
| `note` | `string` | May be empty/whitespace-only; treated as blank (title-only bullet) per FR-010. |

Source: `frog-garden:completed-log-v1`, via `useTasks().completedLog`. Stored newest-first (new entries prepended); the Standup Summary derivation re-sorts ascending — it does not assume this order.

## Derived (in-memory only, not persisted)

### `StandupDoneItem`

Conceptual shape produced by the derivation inside `StandupSummary` (need not be a separately exported type if the component maps `CompletedLogEntry` directly — documented here for clarity of intent):

| Field | Type | Derivation |
|---|---|---|
| `id` | `string` | `CompletedLogEntry.id` |
| `title` | `string` | `CompletedLogEntry.taskTitle` |
| `note` | `string \| null` | `CompletedLogEntry.note.trim()` if non-empty, else `null` (renders title-only) |

Ordering: ascending by `completedAt` (oldest first).

### `StandupOpenItem`

| Field | Type | Derivation |
|---|---|---|
| `id` | `string` | `Task.id` |
| `title` | `string` | `Task.title` |

Ordering: same order as `tasks.filter(t => !t.completed)` (existing task-list order).

## State transitions

None new. Both source entities already have their lifecycle owned by `useTasks()`:

- A task completing (`toggleTaskCompleted`) moves it out of the open-task filter and appends a new `CompletedLogEntry` — the Standup Summary derivation picks this up on the next render automatically (no explicit transition needed on the derived side, since nothing is persisted).
- "Start a new day" (`startNewDay`, feature 007) clears `completedLog` and drops completed tasks — the Standup Summary derivation naturally reflects an empty/smaller batch afterward, consistent with the spec's Assumptions section.

## Validation rules

- A `CompletedLogEntry.note` consisting only of whitespace is treated identically to an empty string (FR-010) — trimmed before the blank check, never rendered as an empty bullet body.
- No new validation is introduced on `Task` or `CompletedLogEntry` themselves; this feature is read-only with respect to both.
