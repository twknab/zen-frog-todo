# Contract: deleteTask (live tasks store)

**Consumer**: `TaskListCard` (via `onDeleteTask` from `page.tsx` / `useTasks`).

**Provider**: `useTasks()` in `src/lib/tasks.ts`.

## Signature

```ts
deleteTask(id: string): void
```

## Preconditions

- `id` identifies a task in the current live `tasks` array with `completed === false`.

## Postconditions (success)

1. Task with `id` is absent from persisted `frog-garden:tasks-v1` → `tasks`.
2. If previous `frogTaskId === id`, then `frogTaskId === null`.
3. `frog-garden:completed-log-v1` byte-identical (no append/edit/remove).
4. Day archive / Grove stores unchanged.

## No-op cases

- Unknown `id`
- Task exists but `completed === true`

## UI contract (TaskListCard)

| Surface | Rule |
|---|---|
| Trash IconButton | Rendered only when `!task.completed` and not locked |
| `aria-label` | `Delete task: {title}` or `Delete task: Untitled` if blank |
| Dialog | Opens on trash activate; Confirm calls `onDeleteTask(id)` then closes |
| Cancel / Escape / backdrop | Close dialog; no `onDeleteTask` call |
| Copy | Title “Remove this task?”; body “It will leave your board. You can always add it again later.” |
| Motion | `transitionDuration={0}` when `prefers-reduced-motion` |
| Color | Muted / inherit — not `error` / alarm red |

## Non-goals

Undo toast, bulk API, archive/Grove delete endpoints.
