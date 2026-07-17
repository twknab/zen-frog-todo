# Phase 0 Research: Bonsai Info Tooltip & Standup Summary

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature reuses established codebase patterns throughout, so research is confirmatory rather than exploratory.

## Decision 1: Bonsai info affordance = MUI `Tooltip` + `IconButton`, no new component

**Decision**: Wrap a small info icon (`InfoOutlined` or equivalent) in an `IconButton`, itself wrapped in MUI `Tooltip`, placed in the existing header `Stack` next to the "Bonsai" `Typography` heading (`page.tsx:320-325`).

**Rationale**: This exact pattern already exists three times in the codebase — `page.tsx:162` (dark/light mode toggle), `page.tsx:257` (sand reset), `ExportMenu.tsx:59` ("Export your days") — and the theme already re-skins `MuiTooltip` (`theme.ts:201-208`). Reusing it means keyboard focus/blur/Escape dismissal, touch-tap reveal, and screen-reader announcement all come from MUI's built-in behavior rather than custom code, directly satisfying FR-003/FR-005/FR-006 with no new logic.

**Alternatives considered**:
- A custom `Popover`/`Popper`-based disclosure — rejected: heavier, and MUI `Tooltip` already provides everything the spec asks for (hover/focus/tap reveal, Escape/blur dismiss, accessible description).
- A toggled inline caption (click to show/hide text in place) — rejected: reintroduces the exact visual competition with the bonsai artwork that this feature is meant to remove.

## Decision 2: Standup Summary is a pure, prop-driven derivation — no new store or hook

**Decision**: `StandupSummary` is a presentational component. `page.tsx`'s `Home()` already destructures `tasks` and `completedLog` from `useTasks()`; pass both straight through as props. All grouping/formatting happens inside `StandupSummary` as plain array operations, computed at render time (optionally memoized with `useMemo`, not required given the small bounded size).

**Rationale**: `useTasks()` already owns this state via `usePersistentState`, which re-renders every subscriber (including `page.tsx`) on change (see `storage.ts`'s pub/sub broadcast). Piggybacking on that existing reactivity gives FR-011's "regenerate automatically on completion" for free. This mirrors two existing precedents: `CompletedLog` (a presentational component taking `entries`/`onUpdateNote` as props, no state of its own) and `deriveBonsai` in `bonsai.ts` (a pure function deriving display state from a stored event log rather than storing the derived value itself).

**Alternatives considered**:
- A new `useStandupSummary()` hook with its own `usePersistentState` key — rejected: would duplicate state `useTasks()` already owns, creating a second source of truth that could drift (violates Principle VI/YAGNI and the spec's "no new persisted entity" assumption).
- Computing the summary inside `useTasks()` itself and returning it alongside `tasks`/`completedLog` — rejected: unnecessarily couples data-fetching to presentation-grouping logic; keeping the derivation in the component keeps `tasks.ts` unchanged (lower risk, smaller diff) and matches the `CompletedLog` precedent of doing per-view formatting in the component.

## Decision 3: Ordering — done items oldest-first, open items in existing list order

**Decision**: Sort `completedLog` ascending by `completedAt` before rendering "What I did" (`completedLog` is stored newest-first for the existing `CompletedLog` UI — `tasks.ts` prepends new entries — so this requires an explicit `[...completedLog].sort(...)`, not a reuse of input order). Render "What's next" using `tasks.filter(t => !t.completed)` in the array's existing order, which already reflects the user's own drag-to-reorder sequence (`reorderTasks` in `tasks.ts`).

**Rationale**: Matches the clarification answer (oldest-first narrated account) and reuses ordering signals that already exist and are already meaningful to the user, with no new sort key or UI needed for open tasks.

**Alternatives considered**: Alphabetical or creation-time ordering for open tasks — rejected, no such requirement and the existing order is already intentional (the user can drag to reorder).

## Decision 4: Semantic list markup, distinct from `CompletedLog`'s card pattern

**Decision**: Render each group as a real list (`<ul>`/`<li>` or MUI `List`/`ListItem` with `disablePadding`), with "What I did" and "What's next" as sub-headings (`h3`, given the section's own "Standup Summary" heading is `h2` per the established `variant="h6" component="h2"` convention every other section uses).

**Rationale**: FR-013 explicitly requires correct heading levels and list semantics for assistive technology. `CompletedLog` uses bordered `Stack`/`div` "cards" instead of a real list — justified there because each entry embeds an editable `TextField` (not naturally a list item), but Standup Summary's bullets are read-only text, so plain list semantics are both simpler and more correct here.

**Alternatives considered**: Copying `CompletedLog`'s div/Stack card markup verbatim — rejected: not semantically a list, and unnecessarily heavy (bordered card chrome) for single-line read-only bullets.

## Decision 5: New section header icon/accent

**Decision**: Use a checklist-style icon (`ChecklistOutlined`, falling back to `AssignmentTurnedInOutlined` if unavailable in the installed `@mui/icons-material` version) with an accent color distinct from "Completed" (`primary`) — e.g. `secondary` — for the new Card's `Stack(icon + h2 Typography "Standup Summary")` header, matching every other section's established header pattern.

**Rationale**: Keeps visual language consistent with Principle V while giving the new section its own identity rather than visually blending with "Completed". Exact icon name should be confirmed against the installed `@mui/icons-material` version during implementation (verified by `tsc`/`eslint`, which will fail loudly on an invalid import).

**Alternatives considered**: Reusing `HistoryOutlinedIcon`/`primary` from the Completed section — rejected, would visually conflate two distinct sections.

## Decision 6: Placement and visibility

**Decision**: Render `StandupSummary` as a sibling `Card` immediately after the existing "Completed" `Card` (~`page.tsx:398-420`), inside its own `AnimatePresence`/`motion.div` following the identical fade pattern, gated on the same `!isFocus` condition.

**Rationale**: Matches the spec's edge case ("Standup Summary section's visibility should follow the same convention as ... the existing Completed section") and requires no new visibility logic — reuses the `isFocus` boolean and motion variant already in scope in `Home()`.

**Alternatives considered**: A new independent visibility rule (e.g., always visible even in Focus mode) — rejected, not requested by the spec and would introduce an inconsistency with the section it's modeled after.
