# Phase 1 Data Model: Task-completion celebration

This feature introduces **no persisted data and no domain entities**. The only "data" is
transient, in-memory view state that exists for the ~1 second a burst is on screen and is then
discarded. Nothing here touches localStorage, the network, or task/timer/reflection data
(FR-010, constitution Principle III).

## Transient view-state entities

### Burst

A single celebration instance currently animating.

| Field | Type | Meaning / Rules |
|-------|------|-----------------|
| `id` | number (monotonic) | Unique per burst; used as React key and for removal. Never reused within a session. |
| `x` | number (px) | Viewport X coordinate the burst is anchored to (checkbox center). |
| `y` | number (px) | Viewport Y coordinate the burst is anchored to (checkbox center). |
| `particles` | `Particle[]` | Fixed spray shape, computed once at creation (not during render). Empty/ignored in the reduced-motion path. |

**Lifecycle / state transitions**:

```
(user completes task) → celebrate(x,y) → Burst created & appended to active list
      → animates (~0.9s) → removal timer fires → Burst dropped from active list → gone
```

- Created only on an incomplete→complete, user-initiated checkbox change (FR-001, FR-003).
- Multiple Bursts may be active simultaneously (rapid completions); each is independent
  (FR-009).
- Self-removing: no Burst persists beyond its animation (FR-004, SC-002).

### Particle

One dot within a full-motion burst. Pure presentational data.

| Field | Type | Meaning / Rules |
|-------|------|-----------------|
| `dx` | number (px) | Horizontal offset from the burst origin at end of animation. |
| `dy` | number (px) | Vertical offset from the burst origin at end of animation. |
| `size` | number (px) | Small dot diameter (calm, not large). |
| `color` | string | One of the muted, nature-derived theme tones (FR-007). |

- Under `prefers-reduced-motion`, Particles are not rendered; a single soft ring is shown
  instead (FR-006).

## Non-entities (explicitly out of scope)

- No completion counters, streaks, totals, points, or history are created or read by this
  feature (FR-008, Principle II).
- No user setting/record is stored (the effect is always on, with the reduced-motion variant
  as the accessibility path — see spec Assumptions).
