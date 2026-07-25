# Data Model: Night Camp & Work Window

## WorkWindow

| Field | Type | Notes |
|-------|------|-------|
| `startHour` | `number` 0–23 | Inclusive local start of day realm. Default `8`. |
| `endHour` | `number` 0–23 | Exclusive local end of day realm. Default `17`. |

**Storage key**: `frog-garden:work-window-v1`  
**UI**: Options AM/PM ↔ convert with helpers (`hourToAmPm` / `amPmToHour`).  
**Validation**: Prefer allowing midnight-spanning windows (`start > end`). Degenerate `start === end` → treat as always-day (never brick). Same-day invalid UX: prevent end-before-start when not spanning (calm copy).

## RealmOverride (Dev)

| Value | Meaning |
|-------|---------|
| `null` | Follow clock |
| `"day"` | Force day |
| `"night"` | Force night |

**Storage key**: `frog-garden:realm-override-v1` (already used)  
**Rule**: Applied only when Dev tools (`frog-garden:dev-mode-v1`) are **on**; ignored when off.

## Effective Realm

Derived (not stored):

```
resolveRealm({ now, window, override, devToolsEnabled }) → "day" | "night"
```

Single source of truth for atmosphere, growth routing, wilt eligibility.

## Day Garden Ledger

Existing `GrowthEvent[]` + `idleOffsetHours` in `frog-garden:bonsai-v3`.

- Credited only when effective realm === `"day"`.
- Wilt applied only when effective realm === `"day"` (using configured `WorkWindow` for `activeIdleHours`).

## Night Camp Ledger

New persisted state, e.g. `frog-garden:night-camp-v1`:

| Field | Type | Notes |
|-------|------|-------|
| `events` | `NightGrowthEvent[]` | `{ at: ISO string, weight: number }` |
| | | Weights mirror day: task / session / frog magnitudes |

**Derived**:

| Field | Notes |
|-------|-------|
| `progress` | `min(sum(weights), MAX_NIGHT_PROGRESS)` |
| `stage` | `0..4` (5 discrete stages) from thresholds |
| `stageLabel` | Poetic label (e.g. Embers → Fireflies → Campfire → Starfield → Full moon) |
| `nightFrogs` | `f(dayFrogs, progress)` — more day frogs ⇒ more camp frogs |

**Credited only when effective realm === `"night"`.**  
**Cleared** on Start a new day and Dev Reset (with day ledger).

### Suggested stage thresholds (tunable)

Assuming mirrored weights and ~same density as day leaf targets:

| Stage | Min progress | Visual |
|------:|--------------|--------|
| 0 | 0 | Resting camp / quiet dark |
| 1 | 2 | First fireflies |
| 2 | 5 | Embers / small fire |
| 3 | 9 | Steady campfire + more stars |
| 4 | 14 | Full moon + rich firefly field |

(Exact numbers are dial-back knobs in `nightCamp.ts`.)

## Night Camp Scene (view model)

Not persisted — derived for render:

- `fireflies`, `campfireLevel`, `starDensity`, `moonFill` from `stage`
- `frogs` from `nightFrogs`
- `dimOverlay: true` when effective realm === `"night"`

## ArchivedDay extension

Additive optional fields on archive snapshot:

| Field | Type | Notes |
|-------|------|-------|
| `nightCamp` | `{ progress, stage, stageLabel } \| undefined` | Absent on pre-017 archives |

Grove / summaries show Day Garden + Night Camp when `nightCamp` present.

## Relationships

```text
WorkWindow ──► clockRealm / wilt window
RealmOverride + DevTools ──► resolveRealm ──► Effective Realm
Effective Realm ──► credits Day Ledger XOR Night Ledger
Day Ledger.frogs ──► Night Camp frog presence
Night Ledger ──► Night Camp stage / scene
Both ledgers ──► ArchivedDay on Start a new day
```
