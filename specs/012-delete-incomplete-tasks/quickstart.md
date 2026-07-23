# Quickstart: Delete Incomplete Tasks

Manual verification after implement. Gate: `npx tsc --noEmit` and `npm run lint` clean.

## Setup

1. `npm run dev` and open the dashboard.
2. Ensure at least two incomplete tasks and one completed task on the board.
3. Optionally designate one incomplete task as today's frog.

## Scenarios

### 1. Confirm delete removes incomplete task

1. Click the trash icon on an incomplete (non-frog) row.
2. Dialog appears: “Remove this task?” with calm body copy.
3. Click **Delete**.
4. Task is gone from the list.
5. Refresh the page — task stays gone; other tasks remain.

### 2. Cancel leaves board unchanged

1. Open trash on an incomplete task.
2. Press Escape or click **Cancel**.
3. Dialog closes; task still present with same title/completion.

### 3. Completed rows have no trash

1. Find a completed task row.
2. Confirm there is no trash / delete IconButton on that row.

### 4. Deleting the frog clears designation

1. Set an incomplete task as frog.
2. Delete it via confirm.
3. Frog designation is cleared (no frog badge / control shows as unset).

### 5. History untouched

1. Note completed-log length (or inspect `localStorage` `frog-garden:completed-log-v1`).
2. Delete an incomplete task that was never completed.
3. Completed-log JSON is unchanged.

### 6. Accessibility smoke

1. Tab to a trash control — name announces “Delete task: …” including title.
2. Activate with Enter/Space — dialog opens and traps focus.
3. Escape closes without delete.
4. Enable OS reduced-motion — dialog appears/disappears without animated transition.

## Done when

All scenarios pass and TypeScript + lint gates are clean.
