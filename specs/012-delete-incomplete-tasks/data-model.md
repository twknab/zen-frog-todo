# Phase 1 Data Model: Delete Incomplete Tasks

## Entity — Task (unchanged shape)

| Attribute | Type | Notes |
|---|---|---|
| `id` | `string` | Stable id (`task-…`) |
| `title` | `string` | Free text; may be empty while editing |
| `completed` | `boolean` | Incomplete (`false`) = delete-eligible |

**Storage**: inside `frog-garden:tasks-v1` as `TasksState.tasks`.

**Delete rule**: Only incomplete tasks may be removed via this feature. Attempting to delete a completed or unknown id is a no-op.

## Entity — TasksState (existing)

| Attribute | Type | Delete interaction |
|---|---|---|
| `tasks` | `Task[]` | Confirmed delete removes the matching entry |
| `frogTaskId` | `string \| null` | Set to `null` when deleted id equals current frog |

## Entity — CompletedLog / Day archive / Grove (untouched)

Deleting an incomplete task MUST NOT:

- append or remove `CompletedLogEntry` rows
- rewrite day archive snapshots
- alter Grove history

Incomplete tasks were never completed, so there is no historical entry to invent.

## Lifecycle

```text
[incomplete on board]
        │
        ├─ trash → confirm Cancel/Escape → unchanged
        │
        └─ trash → confirm Delete
                    ├─ remove from tasks[]
                    └─ if frogTaskId === id → frogTaskId = null
```

Completed tasks stay on the board until existing completion / new-day flows handle them — out of scope here.

## Validation

- `deleteTask(id)`: if task missing OR `completed === true` → return without mutation.
- Empty title: still deletable; a11y label falls back to “Untitled”.
