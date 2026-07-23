# Phase 0 Research: Delete Incomplete Tasks

All decisions constrained by the constitution and post-clarify spec (session 2026-07-23).

## Decision 1 — Eligibility: incomplete only

- **Decision**: Show delete affordance only when `task.completed === false`. Completed live rows never get a trash control. `deleteTask` no-ops for missing or completed ids.
- **Rationale**: Clarification + FR-001/002; avoids erasing finished work or inventing completed-log rewrites.
- **Alternatives considered**: Allow delete of completed from live list (rejected for v1); soft-delete / archive incomplete (out of scope).

## Decision 2 — Confirmation before destroy

- **Decision**: Trash click opens MUI `Dialog` (title + body + Cancel / Delete). Confirm deletes; Cancel / Escape / backdrop close leaves state unchanged. No instant delete.
- **Rationale**: Spec FR-003/005; mirrors `NewDayAction.tsx` calm confirm pattern.
- **Alternatives considered**: Instant delete with undo snackbar (rejected — undo out of scope; confirm is safer and calmer).

## Decision 3 — Store mutation shape

- **Decision**: Add `deleteTask(id: string)` on `useTasks()` that filters the task out of `state.tasks` and, if `frogTaskId === id`, sets `frogTaskId` to `null`. Does not call `setCompletedLog` or day-archive APIs.
- **Rationale**: FR-004/006/007; single seam alongside existing mutators.
- **Alternatives considered**: Separate `clearFrog` then delete (unnecessary); mark tombstone flag (YAGNI).

## Decision 4 — UI placement

- **Decision**: Wire trash + dialog inside `TaskListCard` (or a tiny child used only there). Pass `onDeleteTask` from `page.tsx`. Icon: MUI `DeleteOutline`, muted (`color="inherit"` / `text.secondary`), size small — visible on incomplete rows without hovering required (discoverable for a11y).
- **Rationale**: Grounding in existing list; Principle I/V (muted, not error-colored).
- **Alternatives considered**: Hover-only trash (hurts touch/keyboard discoverability); red `color="error"` (shame UI — forbidden).

## Decision 5 — Copy

- **Decision**: Title “Remove this task?”; body “It will leave your board. You can always add it again later.”; actions “Cancel” / “Delete” (or “Remove”). No failure/guilt language.
- **Rationale**: Clarification + FR-008.
- **Alternatives considered**: “Are you sure you want to destroy…” (too harsh); “Discard forever” (alarm framing).

## Decision 6 — Accessibility & motion

- **Decision**: `IconButton` `aria-label={`Delete task: ${title || "Untitled"}`}`; dialog `aria-labelledby` / `aria-describedby`; `transitionDuration={useReducedMotion() ? 0 : undefined}`.
- **Rationale**: FR-009/010; Principle IV; match `NewDayAction`.
- **Alternatives considered**: Title-only tooltip without aria-label (insufficient).

## Decision 7 — Scope guards

- No undo/snackbar, bulk delete, swipe-to-delete.
- No delete from Completed log, Grove, or day archives.
- No schema version bump (Task shape unchanged).
- No new localStorage keys.
