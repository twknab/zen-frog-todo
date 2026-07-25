# Contract: Garden Realm & Work Window

**Feature**: 017-night-camp  
**Module**: `src/lib/gardenRealm.ts` (+ work-window persistence helpers)

## API

### Types

- `GardenRealm = "day" | "night"`
- `RealmOverride = GardenRealm | null`
- `WorkWindow = { startHour: number; endHour: number }`
- `DEFAULT_WORK_WINDOW = { startHour: 8, endHour: 17 }`

### Functions

| Function | Contract |
|----------|----------|
| `isInsideWorkWindow(now, window)` | Day when inside window; supports midnight span; `start === end` ⇒ always day |
| `clockRealm(now, window)` | `"day"` if inside, else `"night"` |
| `resolveRealm({ now, window, override, devToolsEnabled })` | If `devToolsEnabled` and override is day/night → override; else `clockRealm` |
| `normalizeRealmOverride(value)` | Only `"day"` \| `"night"` pass; else `null` |
| AM/PM helpers | Round-trip local hour ↔ `{ hour12, period }` for Options |

## Consumers MUST

1. Route **all** completion credit through effective realm (day → bonsai growth; night → night ledger).
2. Apply wilt only when effective realm is `"day"`, using configured `WorkWindow`.
3. Drive night atmosphere / Night Camp visibility from effective realm.
4. **Never** toggle Appearance from realm changes.

## Dev Mode

| Storage | Key |
|---------|-----|
| Dev tools | `frog-garden:dev-mode-v1` |
| Override | `frog-garden:realm-override-v1` |
| Work window | `frog-garden:work-window-v1` |

When Dev tools off → `resolveRealm` ignores override (Follow clock).
