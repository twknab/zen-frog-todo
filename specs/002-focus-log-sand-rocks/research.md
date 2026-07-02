# Research: Focus history, completed-tasks log, and Sand Mode rocks

No `NEEDS CLARIFICATION` markers were left in the Technical Context — this feature extends an already-decided stack (`specs/001-frog-garden`). The decisions below are the concrete implementation choices made for the three genuinely new mechanics.

## Decision: Completed log is a separate append-only array, not derived from task state alone

**Rationale**: A `Task.completed` boolean can flip back to `false` if the user reopens it (existing behavior, unchanged). If the Completed log were derived purely from "tasks where completed === true," reopening a task would make its history vanish, and re-completing it wouldn't create a second entry — both of which contradict spec.md's User Story 2 (history is additive, one entry per completion event). So completion events are appended to their own persisted list (`{ id, taskTitle, completedAt, note }`) at the moment a task transitions to completed, independent of the task's current state.

**Alternatives considered**:
- *Derive the log from `tasks` directly* — rejected: loses history on reopen, can't represent multiple completions of the same task.
- *Store the log entry keyed by task id (upsert)* — rejected: same reason, would overwrite rather than append.

## Decision: Focus-session counter is a plain persisted integer, incremented at the existing "natural completion" transition

**Rationale**: `FocusTimer.tsx` already distinguishes a natural completion (`phase` transitions `working` → `work-done`, which is where `playChime("focus-complete")` already fires) from an early cancel (`reset()`, which never reaches `work-done`). Incrementing the counter at that exact, already-existing transition point requires no new state machine — it piggybacks on a distinction the component already makes correctly.

**Alternatives considered**:
- *Derive the count from the Completed log* — rejected: focus sessions aren't tasks, they have no completed-log entry; conflating the two models would be incorrect, not just inconvenient.

## Decision: Rocks block raking via footprint containment checks in `SandCanvas`'s existing draw loop, not a separate collision/physics system

**Rationale**: `SandCanvas` already computes points along each rake stroke incrementally (`handlePointerMove`) and draws a 3-pronged segment between the last point and the new one. Adding a rock check is a matter of testing whether either endpoint of that segment falls within a rock's circular footprint before drawing it, and skipping the draw call (but still recording the point, so the stroke resumes cleanly past the rock). No physics/pathfinding library or new render pipeline is needed.

**Alternatives considered**:
- *Clip the line geometrically at the rock's boundary* — rejected as unnecessary precision for a decorative feature; spec.md's Assumptions explicitly accept "skip drawing inside the footprint" over true edge-clipping.
- *Prevent the pointer from moving over a rock entirely* — rejected: would make the rake cursor feel like it's colliding with a physical wall, a much larger interaction change than the spec calls for.

## Decision: Rocks are placed via native HTML5 drag-and-drop from a small tray, matching the existing task-list reordering pattern

**Rationale**: `TaskListCard.tsx` already uses native `draggable`/`onDragStart`/`onDrop` for reordering, with no added dependency. Reusing the same mechanism for "drag a rock from a tray into the canvas" keeps the codebase's drag-and-drop approach consistent (one pattern, not two).

**Alternatives considered**:
- *A drag library (e.g. dnd-kit)* — rejected per constitution Principle VI (simplicity/no unnecessary dependencies); native drag-and-drop already proven sufficient for the existing reorder feature.
