# Contract: Night Camp Dev Harness

**Feature**: 017-night-camp  
**Surface**: Bonsai card Dev strip (`src/app/page.tsx`) + realm/ledger libs

## Controls (Dev tools ON only)

| Control | Effective realm | Completions (incl. Complete focus session) | Simulate +1h idle | Reset |
|---------|-----------------|--------------------------------------------|-------------------|-------|
| **Force night** | `night` | Night ledger only; bonsai leaves/frogs unchanged | **No additional wilt** | Clears day + night |
| **Force day** | `day` | Day Garden growth | Wilt as today’s day Dev tool | Clears day + night |
| **Follow clock** | clock + work window | Per effective realm | Wilt only if effective realm is day | Clears day + night |

## Indicator

While Dev tools ON and override is day/night, show calm caption:

- `Dev: Night Camp (forced)` / `Dev: Day Garden (forced)`

While Follow clock: `Realm: … (clock)` is optional but helpful.

## Invariants

1. Force never changes Appearance (light/dark).
2. Force never blocks tasks, focus, Options, or Start a new day.
3. Forced night and clock night share identical routing (one `resolveRealm`).
4. Dev tools OFF ⇒ override ignored even if still stored.
5. Accessibility: ToggleButtonGroup (or equivalent) labelled `aria-label="Dev garden realm"`; each option named.

## Manual acceptance (SC-009 / SC-010)

See [quickstart.md](../quickstart.md) § Dev harness matrix.
