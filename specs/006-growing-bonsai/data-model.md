# Data Model: The Growing Bonsai

## Persisted state

### BonsaiState (new)

Stored under a new `usePersistentState` key `frog-garden:bonsai-v1`.

| Field | Type | Notes |
|---|---|---|
| `lastActivityAt` | `string \| null` (ISO 8601) | Timestamp of the most recent growth-affecting activity (a task completion or a natural focus-session completion). `null` for a user who has never completed anything. Refreshed to "now" on every such event. Sole input to wilt. |

This is the only new persisted state. Everything else is read from existing keys.

### Existing state consumed (read-only, unchanged)

- `frog-garden:completed-log-v1` — append-only array of completion events (spec 002). This feature uses its **length** as the completed-task count. (It does not read note text or per-entry fields beyond needing the count; timestamps are already there but wilt uses `lastActivityAt` instead — see research Decision 2.)
- `frog-garden:focus-stats-v1` — `{ completedSessions: number }` (spec 002). Used as the focus-session count.

## Derived (not stored)

### BonsaiStage

An ordered enum: `"seedling" | "sapling" | "leafy" | "flowering" | "mature"` (indices 0–4).

### Derivation contract (`src/lib/bonsai.ts`)

**Granular leaf model** (revised 2026-07-02): growth is counted in *leaves*, not discrete
stage jumps, so the tree changes visibly on every completion (spec US1 scenario 2). The five
named stages are milestones over the leaf count, used for the silhouette and screen-reader label.

```
grown      = min( completedCount*TASK_WEIGHT + focusSessions*SESSION_WEIGHT , MAX_LEAVES )
idleHours  = activeIdleHours(lastActivityAt, now) + max(0, extraIdleHours)   // extraIdleHours = dev only
wiltSteps  = floor( idleHours / IDLE_HOURS_PER_SHED )
wiltFloor  = min( grown, WILT_FLOOR_LEAVES )      // can't "floor" above what's been grown
leaves     = max( wiltFloor, grown - wiltSteps )  // one leaf shed per shed-step, floored
blossoms   = leaves >= 15 ? min(6, leaves - 14) : 0
stage      = seedling(0) | sapling(1–6) | leafy(7–14) | flowering(15–23) | mature(24)  from `leaves`
```

**Validation / invariants (traceable to FRs):**

- Per-completion feedback: each completed task adds 1 leaf, each focus session 3 — the tree changes on every completion. *(US1 scenario 2/3)*
- Bounded top: `grown` (and thus `leaves`) never exceeds `MAX_LEAVES` = mature. *(FR-005)*
- Living floor: wilt never takes a grown tree below `WILT_FLOOR_LEAVES` (sapling) — never bare. *(FR-008a)*
- Zero-history: `completedCount == 0 && focusSessions == 0` → `leaves = 0` → `seedling`. *(US1 scenario 1)*
- No numbers: derivation returns `{ stage, leaves, blossoms, isWilting }` — counts drive *rendering*, never displayed as text. *(FR-006)*
- Monotonic growth: `grown` only rises as counts rise; the completed-log is append-only (spec 002), so reopening→re-completing never reduces it. Only `wiltSteps` lowers `leaves`. *(Edge case: reopen)*
- Regrowable: any completion sets `lastActivityAt = now` → real `activeIdleHours = 0`, and raises `grown` → leaves return. *(FR-008)*
- `extraIdleHours` is a **developer-only** simulation input (see Developer tooling below); it is `0` in normal use.

### `activeIdleHours(from, to)` helper

Pure function: sum of clock-hours in `[from, to]` that fall within the daily `[ACTIVE_START, ACTIVE_END]` (08:00–17:00) local window. Returns `0` if `from` is null or `to <= from`. Robust to multi-day gaps (sums each day's window overlap) and to clock skew (never returns negative; a nonsensical range yields 0). *(FR-007, edge case: clock oddities)*

## Tunable constants (named in `src/lib/bonsai.ts`)

| Constant | Starting value | Purpose |
|---|---|---|
| `TASK_WEIGHT` | `1` | leaves grown per completed task |
| `SESSION_WEIGHT` | `3` | leaves grown per focus session (> task, FR-003) |
| `MAX_LEAVES` | `24` | full mature canopy (bounded — FR-005) |
| `WILT_FLOOR_LEAVES` | `3` | wilt never drops below this (sapling floor) |
| `ACTIVE_START` / `ACTIVE_END` | `8` / `17` | daily wilt-active window (local hours) |
| `IDLE_HOURS_PER_SHED` | `3` | active-idle hours per leaf shed |

All calibration lives here so "soften later" is a one-file change.

## Developer tooling (not a shipped user feature)

A header **Dev** toggle (persisted at `frog-garden:dev-mode-v1`) reveals test controls:
- **Complete focus session** — calls `recordSessionComplete()` + `markActivity()` (+ a completion chime), demoing a finished session's growth (+3 leaves) without running a 25-minute timer.
- **Simulate +3h idle** — increments an **in-memory** (ephemeral, non-persisted) hour counter, fed into `deriveBonsai` as `extraIdleHours`, so wilt can be exercised on demand regardless of the real clock/active window.
- **Reset** — zeroes the simulated idle.
- Dev also puts the **Focus timer in fast mode** (`fast` prop): a work "minute" lasts 1 second, so the whole finish flow (work → complete → break) is reachable in seconds for demos.

Simulated idle is **ephemeral and reset to 0 on any Dev toggle**, so enabling/disabling Dev never
changes the real tree (fixes a bug where a stale, persisted simulated-idle value re-wilted the
tree on load/enable — 2026-07-02). Development aid only; hidden unless the toggle is on.

### Timer robustness (2026-07-02)

The Focus countdown is derived from a **target end-timestamp** (`Date.now()`-based), not by
counting `setInterval` ticks, and re-syncs on `visibilitychange`. This keeps it accurate when a
backgrounded tab throttles/pauses timers (start a session, switch away to work, return: the
remaining time is correct). Purely visual growth/wilt animations use **opacity-only** fades so a
leaf is never stranded invisible if `requestAnimationFrame` is paused mid-animation.
