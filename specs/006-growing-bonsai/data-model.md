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

**Daily-momentum leaf model** (revised 2026-07-02): the bonsai reflects *today's* work. It
starts each day as a small **shrub** and grows one leaf per completed task / three per focus
session, up to a bounded canopy. Idle time within the active window wilts it aggressively — 3
leaves per idle hour — so a neglected day shrinks it back toward the shrub, scoping the tree's
"life" to roughly one day's work. Growth is a timestamped event log (`{ at, leaves }`) owned by
the bonsai itself, not derived from the task/focus counters.

```
grownToday = min( Σ leaves of events where sameLocalDay(event.at, now) , MAX_LEAVES )
lastAt     = timestamp of the most recent event (or null)
idleHours  = activeIdleHours(lastAt, now) + max(0, extraIdleHours)   // extraIdleHours = dev only
wilt       = floor(idleHours) * WILT_LEAVES_PER_HOUR
leaves     = max( 0, grownToday - wilt )     // floors at 0 = the shrub (never an empty pot)
blossoms   = leaves >= 15 ? min(6, leaves - 14) : 0
stage      = shrub(0) | sapling(1–6) | leafy(7–14) | flowering(15–23) | mature(24)  from `leaves`
```

**Validation / invariants:**

- Per-completion feedback: each completed task adds 1 leaf, each focus session 3.
- Daily scope: growth counts only today's events, so each new day starts as a shrub.
- Bounded top: `grownToday` (and thus `leaves`) never exceeds `MAX_LEAVES` = mature.
- Living floor: wilt floors at `0` leaves = the **shrub** — a small living base, never a bare pot.
- No numbers: derivation returns `{ stage, leaves, blossoms, isWilting }` — counts drive *rendering*, never displayed as text.
- Recoverable: doing work appends an event (resetting `lastAt` → idle 0) and raises today's growth, so the droop clears and today's earned leaves return.
- `extraIdleHours` is a **developer-only** simulation input (see Developer tooling below); it is `0` in normal use.

### `activeIdleHours(from, to)` helper

Pure function: sum of clock-hours in `[from, to]` that fall within the daily `[ACTIVE_START, ACTIVE_END]` (08:00–17:00) local window. Returns `0` if `from` is null or `to <= from`. Robust to multi-day gaps and clock skew (never negative; a nonsensical range yields 0). Overnight/off-hours never wilt.

## Persisted state (`frog-garden:bonsai-v2`)

`{ events: { at: ISO-timestamp, leaves: number }[] }` — appended on each growth-affecting
completion (task = 1, focus session = 3), pruned to ~2 days. Replaces the old
`bonsai-v1 { lastActivityAt }` marker; the tree is now self-contained rather than derived from
the task/focus stores.

## Tunable constants (named in `src/lib/bonsai.ts`)

| Constant | Starting value | Purpose |
|---|---|---|
| `TASK_LEAVES` | `1` | leaves grown per completed task |
| `SESSION_LEAVES` | `3` | leaves grown per focus session (> task) |
| `MAX_LEAVES` | `24` | full mature canopy (bounded) |
| `WILT_LEAVES_PER_HOUR` | `3` | leaves shed per active-idle hour |
| `ACTIVE_START` / `ACTIVE_END` | `8` / `17` | daily wilt-active window (local hours) |

All calibration lives here so tuning is a one-file change.

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
