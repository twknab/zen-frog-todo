# Feature Specification: Frog Friends — Reward Critters Around the Bonsai

**Feature Branch**: `008-frog-friends`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "Lean into the frogs — completing the frog adds three frogs, a focus session adds two; they build up and are distributed randomly around the bonsai. Maybe at times a squirrel makes an appearance."

## Clarifications

### Session 2026-07-15

- Q: What should make the squirrel appear (while staying deterministic per state)? → A: A deterministic (seeded) rule on the current frog count decides when the squirrel is present, so it pops in occasionally as the crowd changes and is stable for any given count — never a per-render random roll.
- Q: On a fresh day with no rewards yet, what does the scene show? → A: One baseline frog, always — the existing lone frog beside the pot stays as a baseline; a new day returns to exactly that one, so the scene is never critter-empty.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frogs gather as you get things done (Priority: P1)

As the person works through their day — finishing tasks, completing focus sessions, and swallowing their frog — little frogs quietly gather around the base of the bonsai. Each kind of accomplishment brings a different number of frogs, so a productive stretch visibly fills the scene with a small, cheerful crowd. It's a warm, wordless sign of momentum: no number, no score, just more frog friends showing up.

**Why this priority**: This is the heart of the feature and the whole reason for it — turning completions into organic, delightful visual reward. Everything else (day reset, squirrel) only matters once frogs actually accumulate.

**Independent Test**: From a fresh state, complete a regular task (see 1 frog appear), a focus session (see 2 more), and the designated frog task (see 3 more); confirm the frogs cluster around the pot, stay put as more arrive, and stop appearing once the crowd reaches its cap.

**Acceptance Scenarios**:

1. **Given** the bonsai with its baseline lone frog, **When** the person completes a regular task, **Then** one additional frog appears near the base.
2. **Given** the bonsai, **When** the person completes a focus session, **Then** two additional frogs appear.
3. **Given** the bonsai, **When** the person completes the designated frog task, **Then** three additional frogs appear.
4. **Given** the frog crowd has reached its cap, **When** the person completes more work, **Then** no further frogs are added and the scene stays calm and uncluttered.
5. **Given** some frogs are already present, **When** more are earned, **Then** the existing frogs keep their positions and the new ones fill in around them (the arrangement grows, it never reshuffles).
6. **Given** any number of frogs, **When** the view re-renders or the page reloads, **Then** the frogs appear in the same positions (no flicker, no rearrangement).

---

### User Story 2 - A fresh day, a fresh scene (Priority: P2)

When the person starts a new day (feature 007), the gathered frogs disperse along with the rest of the day's progress, returning the scene to its calm baseline so the new day starts fresh. The frogs represent today's momentum, not an ever-growing pile.

**Why this priority**: Keeps the frogs meaningfully tied to a day's effort and consistent with the bonsai's day-cycle reset. Valuable, but only after frogs accumulate (US1).

**Independent Test**: Accumulate several frogs, start a new day, and confirm the scene returns to its baseline (the single lone frog), matching the bonsai resetting to a shrub.

**Acceptance Scenarios**:

1. **Given** a crowd of earned frogs, **When** the person starts a new day, **Then** the frogs clear back to the baseline lone frog.
2. **Given** the app is left idle (including past midnight) without starting a new day, **Then** the frogs remain — they clear only on a manual new day, never automatically.

---

### User Story 3 - An occasional squirrel (Priority: P3)

Once in a while, a single squirrel wanders into the scene among the frogs — a small, gentle surprise that rewards the person with a moment of delight without any fanfare. It's rare enough to feel special and calm enough never to startle.

**Why this priority**: Pure charm on top of the core mechanic. Nice-to-have; the feature is complete and valuable without it.

**Independent Test**: Reach a state where the squirrel is present and confirm exactly one squirrel appears among the frogs, enters gently, and does not startle or animate aggressively; confirm it never appears more than one at a time.

**Acceptance Scenarios**:

1. **Given** the frogs are gathering, **When** the conditions for a squirrel are met, **Then** a single squirrel appears gently among them.
2. **Given** a squirrel is present, **Then** there is never more than one squirrel at a time.
3. **Given** the squirrel is a surprise, **Then** it appears only occasionally — not on every reward — and its arrival is calm (no sudden or attention-grabbing motion).

---

### Edge Cases

- **At the cap**: further rewards add no frogs; the scene never overcrowds (US1 scenario 4).
- **Reduced motion**: frogs and the squirrel appear without hops/animation (instant or minimal), and no critter is ever left stranded invisible if an animation is interrupted.
- **Re-completing a task**: reopening and re-completing a task counts as a new completion (consistent with how the bonsai already treats completions) and may add frogs again, still bounded by the cap.
- **Idle time**: unlike the bonsai's leaves, frogs do NOT leave during idle — they reflect work actually done this cycle and only clear on a new day.
- **Empty / baseline day**: with no rewards yet, the scene shows just the single baseline frog — never zero critters, never a crowd.
- **Small viewport**: the frog cluster stays within the bonsai scene and does not overflow its card or overlap the tree unpleasantly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Completing the designated frog task MUST add 3 frogs; completing a focus session MUST add 2 frogs; completing a regular task MUST add 1 frog.
- **FR-002**: The number of frogs MUST be bounded by a cap (about 20); once reached, further rewards add no more frogs.
- **FR-003**: Frogs MUST be rendered clustered around the pot/base of the bonsai, within the bonsai scene, without overlapping the tree or overflowing the card.
- **FR-004**: Frog positions MUST be deterministic and stable — the same count always yields the same arrangement across re-renders and reloads, with no per-render randomness (safe for server-side rendering; no visual flicker).
- **FR-005**: As the count grows, previously-shown frogs MUST keep their positions; only new frogs are added (the arrangement grows, never reshuffles).
- **FR-006**: The frog population MUST be scoped to the manual day cycle — it clears back to the baseline when the person starts a new day (feature 007) and MUST NOT reset automatically at calendar midnight.
- **FR-007**: Frogs MUST NOT leave or diminish due to idle time; they clear only on a new day (they represent completed work, not current momentum-minus-wilt).
- **FR-008**: The feature MUST be derived from the person's existing local completion signals; it MUST NOT introduce any network request, backend call, or telemetry.
- **FR-009**: Newly added frogs MUST appear with gentle, calm motion (e.g. a soft fade/settle); all motion MUST respect the reduced-motion preference (instant or minimal fallback) and MUST be opacity-based so a frog is never stranded invisible if an animation is interrupted.
- **FR-010**: Frogs and the squirrel MUST be purely decorative — hidden from assistive technology (the bonsai's existing screen-reader label remains the single source of truth) — and the feature MUST NOT display any number or count.
- **FR-011**: A single squirrel MUST appear among the frogs occasionally, determined by a deterministic (seeded) rule on the current frog count — so it pops in and out as the crowd changes, is never present on every reward, and is stable for any given count (no per-render randomness). There MUST never be more than one squirrel at a time, and its arrival MUST be gentle and non-startling.
- **FR-012**: A baseline single frog MUST remain in the scene even with no rewards yet, so the scene is never empty of critters.

### Key Entities *(include if feature involves data)*

- **Frog population**: A derived count of critters to show, computed from the day-cycle's completion signals using the per-reward weights (frog task = 3, focus session = 2, regular task = 1), bounded by the cap, and floored at the baseline of one. Not a displayed number — it drives rendering only.
- **Critter placement**: A deterministic mapping from a frog's index to a position clustered around the bonsai base (seeded, computed once), so arrangements are stable and additive. The squirrel occupies a distinct, deterministic slot when present.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Completing a regular task, a focus session, and the frog task increases the visible frog crowd by 1, 2, and 3 respectively, up to the cap.
- **SC-002**: The frog crowd never exceeds the cap (~20), and the scene remains visually uncluttered at the cap.
- **SC-003**: Starting a new day returns the scene to its baseline (the single lone frog) 100% of the time.
- **SC-004**: For a given state, the frog arrangement is identical on every re-render and reload — no reshuffling and no flicker.
- **SC-005**: The feature generates zero network requests; all critter state derives from on-device data.
- **SC-006**: With reduced motion enabled, frogs and the squirrel appear with no motion, and no critter is ever left invisible.
- **SC-007**: A squirrel appears only occasionally (never on every reward) and never more than one at a time.

## Assumptions

- **Baseline frog**: The single frog already beside the pot is the baseline; rewards add frogs on top of it, and a new day returns to just that one. The scene is never critter-empty.
- **Cap value**: "About 20" total frogs is the calm upper bound; the exact number is a tuning detail chosen during planning.
- **Regular-task weight**: A regular (non-frog) task adds 1 frog. (The user specified 3 for the frog task and 2 for a focus session; 1 for a regular task is the reasonable default to keep every completion rewarding.)
- **Squirrel rarity/trigger**: The squirrel is a rare, deterministic surprise (e.g. tied to reaching a particular state), not a per-render random roll — so it is stable across re-renders and SSR-safe. Exact trigger/frequency is a tuning detail for planning; only one squirrel is ever shown.
- **No wilt for frogs**: Frogs are not subject to the bonsai's idle-wilt; they persist through the day and clear only on a manual new day.
- **Derivation source**: The frog count is derived from the same day-cycle completion signals that already drive the bonsai. Any small change to how those completions are stored locally (e.g. recording a per-reward weight) stays on-device and is an implementation detail for planning.
- **Out of scope for v1**: sounds for critters (a separate audio/Principle VII concern), clicking or interacting with critters, user-configurable critter types or spawn rates, persisting exact individual critter positions across reloads (only the count/derivation persists), and any critter beyond frogs and the occasional squirrel.
