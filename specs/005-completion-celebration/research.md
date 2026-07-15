# Phase 0 Research: Task-completion celebration

The spec contained **no `[NEEDS CLARIFICATION]` markers** and the technical stack is fully
known from the existing codebase, so research here records the key design decisions and the
best-practice rationale behind them rather than resolving open unknowns.

## Decision 1 — Trigger mechanism: imperative context callback

- **Decision**: Expose a React context providing an imperative `celebrate(x, y)` function via
  a `useCelebration()` hook. Completion checkboxes call it in their change handler when the
  new state is "checked".
- **Rationale**: The celebration is a fire-and-forget side effect anchored to a screen point,
  not derived render state. An imperative trigger keeps each call-site trivial (one line) and
  avoids threading animation state through task data. Fits FR-002 (anchored to the checkbox)
  and FR-010 (presentational only).
- **Alternatives considered**:
  - *Per-row local animation state* — rejected: duplicates logic across task rows and the
    frog card, and complicates the "burst can overflow the card bounds" behavior.
  - *Global event bus / custom DOM events* — rejected: heavier and less type-safe than a
    context for a same-tree concern (YAGNI, Principle VI).

## Decision 2 — Rendering: single fixed overlay layer

- **Decision**: Render all active bursts in one `position: fixed`, full-viewport,
  `pointer-events: none`, `aria-hidden` layer mounted once by the provider, above app content.
- **Rationale**: A single top-level overlay lets bursts render at absolute viewport
  coordinates regardless of which card triggered them, never clips against a card's
  `overflow`, never shifts layout, and never intercepts clicks. Satisfies FR-004 (no layout
  artifact), the edge cases (contained, no horizontal scroll), and Principle IV (decorative,
  non-blocking).
- **Alternatives considered**:
  - *Rendering inside the triggering card* — rejected: card `overflow`/border-radius would
    clip the burst, and it could nudge layout.

## Decision 3 — Motion library & reduced-motion fallback

- **Decision**: Use Framer Motion (`motion` elements + `useReducedMotion`). Full effect =
  a radial spray of particles fading/scaling out with calm easing `[0.22, 1, 0.36, 1]`;
  reduced-motion effect = a single soft expanding ring.
- **Rationale**: Constitution Principle V mandates Framer Motion over MUI's default ripple/
  transitions, and Principle IV mandates a `prefers-reduced-motion` fallback that degrades
  gracefully rather than disabling feedback entirely. `useReducedMotion` reads the media query
  reactively. Matches FR-006 and User Story 2.
- **Alternatives considered**:
  - *CSS keyframes only* — workable but the project already standardizes motion on Framer
    Motion; mixing would fragment the design-system discipline.
  - *Third-party confetti library* — rejected: visually loud, off-brand for a calm garden app
    (Principle I/II), and adds bundle weight for little benefit (Principle VI).

## Decision 4 — Palette & feel

- **Decision**: Particles use the muted, nature-derived theme tones (moss / clay / dusk /
  ochre family), small sizes, short (~0.9s) lifetime.
- **Rationale**: Keeps the reward "of-a-piece" with the theme and sand mode, avoiding the
  attention-grabbing, saturated look the constitution forbids (Principles I, V; FR-007).
- **Alternatives considered**: Bright primary confetti colors — rejected as an "urgency/party"
  aesthetic inconsistent with wu wei / calm technology.

## Decision 5 — Lifecycle / self-cleaning

- **Decision**: Each burst is pushed into provider state with a unique id and removed by a
  timer shortly after its animation completes; particle randomness is computed in the event
  handler (not during render) so each burst is fixed data.
- **Rationale**: Prevents orphaned DOM under rapid successive completions (FR-009, SC-004) and
  respects React render purity (no `Math.random()` during render). Self-removal satisfies
  FR-004 / SC-002 (nothing lingers).
- **Alternatives considered**: Relying on Framer's `AnimatePresence` exit alone — the explicit
  id + timer cleanup is simpler and deterministic for this ephemeral, additive list.

## Decision 6 — Guard against non-user / bulk completions

- **Decision**: Trigger only inside the interactive checkbox change handler on the
  incomplete→complete transition; do not celebrate from state hydration or programmatic
  completion.
- **Rationale**: Avoids a barrage of bursts when task state is restored on load (spec edge
  case) and enforces FR-003 (only user-initiated completion).

**Output**: All decisions resolved; no open clarifications. Proceed to Phase 1.
