# Research: Start a New Day — Day Archive & JSON Export

Phase 0 decisions. Each resolves a design unknown for the plan; no external technology spikes were required (the stack and patterns already exist in the codebase).

## Decision 1 — Archive storage location & key

**Decision**: Store the archive as a single JSON array under a new `localStorage` key `frog-garden:day-archive-v1`, read/written exclusively through a repository module (`src/lib/dayArchive.ts`), backed by the existing `usePersistentState` hook for reactive reads in the export menu.

**Rationale**: Consistent with every other store in the app; no new dependency; the same-key broadcast keeps the export menu live as days are archived. A single array is trivial to serialize for the full dump. Versioned key (`-v1`) matches the codebase convention and leaves room to evolve.

**Alternatives considered**: One key per archived day (`...:day:<date>`) — rejected: complicates enumeration and the full dump, and offers no benefit at this scale. IndexedDB — rejected as premature (Principle VI); localStorage comfortably holds thousands of tiny snapshots.

## Decision 2 — Retention bound

**Decision**: Retain the most recent **365** archived entries; prune oldest beyond that when appending. Constant `MAX_ARCHIVED_DAYS` lives in `dayArchive.ts`.

**Rationale**: A day snapshot is a few KB; 365 entries is well under localStorage's ~5 MB budget while covering ~a year of daily use — generous enough that pruning effectively never bites for a real user, but still a hard bound so storage can't grow without limit (FR-008). Pruning the *oldest* preserves the recent journal the user is most likely to want.

**Alternatives considered**: No bound — rejected (FR-008 requires one). Byte-size budgeting — rejected as over-engineered for KB-scale entries.

## Decision 3 — Cross-store reset coordination

**Decision**: A `useNewDay()` hook composes the existing domain hooks (`useTasks`, `useBonsai`, `useFocusStats`) plus a same-key `usePersistentState` instance for the reflection, and exposes a single `startNewDay()` that snapshots then resets all of them. Bonsai reuses the existing `resetBonsai()`; `useTasks` and `useFocusStats` gain small reset methods.

**Rationale**: Reuses established hooks and the same-key broadcast sync (no prop-drilling, no new global state library). Keeping the whole "close the day" transaction in one function makes the ordering explicit and testable, and gives the future DB migration one place to wrap in a real transaction.

**Alternatives considered**: A React context / reducer holding all app state — rejected: a large refactor of working stores for no v1 benefit (Principle VI). Having each component reset itself — rejected: scatters the transaction and risks partial resets.

**Atomicity note**: localStorage writes are synchronous and can't be wrapped in a true transaction. `startNewDay()` appends to the archive *first*, then resets; if a later reset threw, the snapshot is already safely archived (fail-safe toward preserving data). In practice these are plain synchronous state writes with negligible failure surface.

## Decision 4 — "That day's" data sources

**Decision**: The snapshot's completed tasks come from the live completed-log (`frog-garden:completed-log-v1`) entries (title, note, completedAt); reflection from `:reflection-v1`; focus count from `:focus-stats-v1` `completedSessions`; bonsai growth from `deriveBonsai(...)` (today's `leaves` + `stage`). All represent "since the previous close" because those stores are cleared on each close.

**Rationale**: The completed-log already carries exactly the per-task detail the archive needs (including notes). Deriving bonsai leaves/stage stores a human-meaningful figure rather than the raw event log.

## Decision 5 — Focus count becomes today-only (from clarification)

**Decision**: `useFocusStats` gains `resetSessions()`; `startNewDay()` calls it so `completedSessions` resets to 0 each new day. The Focus card's existing "N focus sessions completed" text now reflects only the current day.

**Rationale**: Directly implements the 2026-07-15 clarification. Also nudges the app *toward* Principle II by removing an ever-climbing lifetime number. No schema change — same key, reset value.

## Decision 6 — Empty-day guard

**Decision**: Before archiving, compute `hasContent = completedTasks.length > 0 || reflection.trim().length > 0 || focusSessions > 0 || bonsaiLeaves > 0`. If false, skip the archive append but still perform the reset (FR-007).

**Rationale**: Keeps the journal free of empty entries and avoids any "you did nothing today" artifact, honoring the calm-UX principle.

## Decision 7 — Export mechanism (client-side download)

**Decision**: A framework-free helper in `dayArchive.ts` serializes data with `JSON.stringify(data, null, 2)`, wraps it in a `Blob` (`application/json`), creates an object URL, clicks a temporary `<a download=...>`, then revokes the URL. Single-day and full-dump share this helper.

**Rationale**: Standard, fully offline, no dependency, no network (SC-005). Pretty-printed output is human-readable (FR-014). Object-URL revoke avoids leaks.

**Alternatives considered**: `showSaveFilePicker` (File System Access API) — rejected: inconsistent browser support; the anchor-download pattern works everywhere and needs no permission prompt.

## Decision 8 — Filenames & same-date labelling (from clarification)

**Decision**: Single day → `frog-garden-<YYYY-MM-DD>.json`; when multiple entries share a date, disambiguate the filename with a time suffix `frog-garden-<YYYY-MM-DD>-<HHmm>.json`. Full dump → `frog-garden-all-<YYYY-MM-DD>.json`. In the export **menu**, entries show the date; entries sharing a date additionally show a time (e.g. "Jul 14, 2:30 PM"), driven by `closedAt`.

**Rationale**: Implements the clarification (date-only by default, time only when needed) for both the on-screen label and the filename, keeping the common case clean.

## Decision 9 — Confirmation dialog pattern

**Decision**: MUI `Dialog` re-themed to the zen palette, with calm copy (e.g. title "Start a new day?" / body "Today's finished tasks and reflection will be tucked into your archive, and your board will start fresh. Unfinished tasks stay with you.") and two actions ("Not yet" / "Start fresh"). Under `prefers-reduced-motion`, dialog transition is reduced/instant.

**Rationale**: Accessible by default (focus trap, Esc, ARIA), matches Principle IV/V; the copy sets a keepsake, non-alarming tone (FR-002, FR-016).

## Decision 11 — Bonsai growth scoped to the close-cycle (analyze I1 remediation)

**Decision**: Change `deriveBonsai` (feature 006) so growth accumulates over **all stored events (since the last close)** rather than being filtered to the current calendar day. `resetBonsai()` (already called by `startNewDay()`) is now the *only* thing that returns the tree to a shrub. Wilt is unchanged — still `activeIdleHours` over the business-hours window plus the persisted offset. Event pruning switches from age-based (the old 2-day window would silently drop growth if a user went days without closing) to a generous count cap for storage safety only.

**Rationale**: Resolves finding I1. Previously the bonsai auto-reset at midnight while tasks/focus/completed-log persisted until a manual close, so a snapshot spanning a midnight paired a full task list with only the current day's tree. Scoping all three to the close-cycle makes the snapshot internally consistent and matches the user's intent: "grow in reaction to accomplishments until a new day is started; wilting still sticks to business hours."

**Impact**: Modifies feature 006's daily-momentum model. Captured in this feature's spec (FR-006b) and tasks, with an amendment note added to `specs/006-growing-bonsai/data-model.md` (no silent drift, per the constitution's Development Workflow rule).

**Alternatives considered**: Keep 006's calendar-day scope and just document the mismatch — rejected: the user asked for the consistent model. Store a cumulative bonsai figure separate from the daily one — rejected as redundant state (Principle VI).

## Decision 10 — Future DB seam (from user direction)

**Decision**: Route all archive persistence through `dayArchive.ts` and keep the snapshot shape flat/serializable with a `schemaVersion` on exports. Do **not** build any DB, adapter, interface-with-multiple-impls, or importer now.

**Rationale**: Gives the requested low-churn migration target without violating YAGNI/Principle VI. Recorded in plan.md → "Future considerations / migration path". A real DB is a separate, later, on-device-only decision.
