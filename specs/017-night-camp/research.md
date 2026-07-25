# Research: Night Camp & Work Window

Phase 0 decisions. Binding: constitution v2.1.0 Product Model, `docs/product-model.md`, `specs/017-night-camp/spec.md`.

## Decision 1 — One `resolveRealm` brain for clock and Dev Force

**Decision**: All atmosphere, growth routing, and wilt eligibility read a single **effective realm** from `resolveRealm({ now, window, override, devToolsEnabled })`. Dev Force night/day is not a parallel fake UI path.

**Rationale**: FR-017 / SC-009 — forced and clock-derived realms must behave identically. Already stubbed in `src/lib/gardenRealm.ts`.

**Alternatives considered**: Separate `devNightPreview` boolean that only dims UI — would desync ledger credit and confuse testers.

## Decision 2 — Work window persisted; wilt migrates off hardcoded ACTIVE_* only

**Decision**: Persist `{ startHour, endHour }` (0–23, end exclusive, default 8/17). Options show AM/PM. `activeIdleHours` / wilt use the configured window. Keep exporting helpers that accept `WorkWindow` so bonsai and realm share one source.

**Rationale**: FR-001/002/007; constitution defaults 8 AM–5 PM.

**Alternatives considered**: Keep hardcoded 8–17 forever — blocks night owls. Minute-level precision — YAGNI for v1.

## Decision 3 — Night ledger mirrors day weights

**Decision**: Night events store `{ at, weight }` (or leaves/frogs-shaped weights) using the same task/focus/frog magnitudes as day (`TASK_*`, `SESSION_*`, `FROG_*`), mapped into a night progress total that unlocks **5 stages** (0 resting + 4 advancing, or 5 labelled stages — pick thresholds in data-model so SC-004 passes).

**Rationale**: Spec assumption; familiar pacing; frog completion at night still feels meaningful.

**Alternatives considered**: Flat +1 per completion — simpler but frog/focus lose relative weight.

## Decision 4 — Wilt suppressed when effective realm is night

**Decision**: `deriveBonsai` (or wrapper) applies wilt only when `effectiveRealm === "day"`. Dev Simulate +1h idle may still bump `idleOffsetHours`, but wilt presentation/calculation is gated by day realm (FR-023). When returning to day, existing offset may apply again — acceptable for Dev harness; document in quickstart.

**Rationale**: Bonsai sleeps at night; Force night must not wilt (US4).

**Alternatives considered**: Make Simulate a no-op at night — also fine; gating wilt is clearer and preserves offset for day testing after toggle.

## Decision 5 — Night Camp is a sibling scene layer, not a second bonsai

**Decision**: New `NightCampScene` (SVG) composited with/near the bonsai card when effective realm is night (or always mounted with opacity). Stages drive fireflies, campfire, stars, moon; frog count = f(dayFrogs, nightProgress). Day bonsai may show a soft “asleep” treatment but does not grow.

**Rationale**: Product metaphor “sit by the fire”; two worlds visually.

**Alternatives considered**: Replace bonsai entirely at night — loses continuity. Text-only stage — fails dual-world feel.

## Decision 6 — Dev Reset clears both ledgers

**Decision**: Extend Reset to clear night ledger + day bonsai (and idle offset) for the cycle.

**Rationale**: FR-024; testers need a full wipe.

## Decision 7 — Archive Night Camp additively

**Decision**: On Start a new day, snapshot night stage label + progress summary onto `ArchivedDay` as optional fields; Grove renders a differentiated Night Camp beat when present. Old archives without fields show calm resting/absent night.

**Rationale**: FR-012/013; forward-compatible.

## Decision 8 — Soft dusk is P3 / optional polish

**Decision**: v1 may hard-switch atmosphere at the window edge; optional short crossfade later.

**Rationale**: Spec P3; don’t block P1 on animation polish.

## Decision 9 — Partial code already landed

**Decision**: Keep and complete `gardenRealm.ts` + page Dev ToggleButtonGroup; wire them into growth/wilt/atmosphere once night ledger exists. Remove the temporary “Night scenes wire up with 017” caption when scenes land.

**Rationale**: Spec already required Dev Force; early wiring reduces implement risk.
