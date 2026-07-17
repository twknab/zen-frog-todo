# Contract: `StandupSummary` Component

This is a UI-application project with no external/network API — the "contract" here is the component's prop interface and the pure derivation it performs, analogous to `BonsaiTree`'s prop contract from feature 008.

## Props

```ts
type StandupSummaryProps = {
  tasks: Task[];               // from useTasks().tasks — includes both open and completed
  completedLog: CompletedLogEntry[]; // from useTasks().completedLog
};
```

Both props are the same values `page.tsx` already holds from `useTasks()` — no new data fetching, no new hook call inside `StandupSummary`.

## Behavior contract

1. **"What I did" list** — built from `completedLog`:
   - Sorted ascending by `completedAt` (oldest first).
   - Each item renders `taskTitle`; if `note.trim()` is non-empty, the trimmed note is rendered alongside/beneath the title; if blank, only the title renders (never an empty note line, never omitted — FR-010).
   - If `completedLog` is empty, the "What I did" heading and list are omitted entirely (not rendered empty).

2. **"What's next" list** — built from `tasks.filter(t => !t.completed)`:
   - Rendered in the array's existing order (no re-sorting).
   - Each item renders `title` only (no note field on open tasks).
   - If there are no open tasks, the "What's next" heading and list are omitted entirely.

3. **Empty state** — if both `completedLog` and the open-task filter are empty, render a single calm, non-shaming placeholder message instead of either heading (FR-012). Exact copy is an implementation detail for `/speckit-tasks`, but MUST NOT imply the user has failed to do anything (Principle I).

4. **Structure** — matching the `CompletedLog` precedent, the outer "Standup Summary" `h2` heading + icon (`Stack` + `Typography variant="h6" component="h2"`) is rendered in `page.tsx`, not inside `StandupSummary` itself. `StandupSummary` renders only its internal structure: "What I did" / "What's next" as `h3` sub-headings when both are present, each with real list markup (`<ul>`/`<li>` or MUI `List`/`ListItem`) so screen readers announce list length/position (FR-013).

5. **No side effects** — `StandupSummary` reads props and renders; it does not call any setter, does not persist anything, and does not make any network/AI call (FR-009). It is a pure function of its props.

6. **Reactivity** — no explicit contract needed: because `page.tsx` re-renders on every `useTasks()` state change (existing behavior), `StandupSummary` receiving fresh `tasks`/`completedLog` props on each such render is sufficient to satisfy FR-011 (auto-regenerate on task completion). No polling, no subscription of its own.

## Non-goals (explicitly out of contract)

- No pagination, cap, or truncation of either list (FR-014 — lists are expected to stay small by construction).
- No export, copy-to-clipboard, or sharing affordance (out of scope per spec Assumptions).
- No AI/LLM summarization call of any kind (FR-009).
