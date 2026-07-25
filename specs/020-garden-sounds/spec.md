# Feature Specification: Empty Frog Helper Copy & Garden Sounds

**Feature Branch**: `020-garden-sounds`

**Created**: 2026-07-25

**Status**: In progress

**Input**: User description: "Where the UI says something like 'No frog chosen yet', add clear instructional copy beneath it telling the user how to designate a frog (hover a task, click its frog icon). Add joyful calm Web Audio sounds: frog-task complete → ribbit chorus; regular task complete → light single ribbit; squirrel appears → squirrel chuckle (once on absent→present); add task → short reward sound. Extend shared sound.ts; wire incomplete→complete only; honor existing mute/opt-in patterns; sound-only for squirrel (no clutter toast); Hyper Minimal may hide empty frog card — helper only when empty state is visible. Spec Kit 020; no theme work; no High Contrast / Night Camp branch edits."

## Clarifications

### Session 2026-07-25

Self-resolved from the product brief (no blocking human questions):

- Q: Exact empty-state helper wording? → A: Calm, short instructional line under the existing heading — e.g. “Hover a task, then click its frog to choose today’s frog.” (may be lightly edited for brevity; must stay non-judgmental).
- Q: Mute / opt-in for new sounds? → A: Match existing `playChime` / `playRake` behavior (shared `AudioContext`, resume on use). No new global mute unless one already exists (it does not). Do **not** invent reduced-motion muting.
- Q: Squirrel encouragement toast/copy? → A: **Sound-only** — no toast or scoreboard-like encouragement copy.
- Q: Where to fire completion sounds? → A: On incomplete→complete only; distinguish frog vs non-frog via designated frog task id; do not play on uncomplete.
- Q: Hyper Minimal empty frog card? → A: If Hyper Minimal hides the empty frog panel, no change required; when the empty state is visible (normal density), helper copy MUST show.
- Q: Feature number? → A: **`020-garden-sounds`** (019 is mobile-first on main; 018 is High Contrast).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learn how to pick today’s frog (Priority: P1)

A new or returning user opens the garden with no frog designated. Beneath “No frog chosen yet” they see a short, calm line explaining how to designate one: hover a task and click its frog icon.

**Why this priority**: Removes a discoverability gap for the core frog mechanic without adding UI chrome elsewhere.

**Independent Test**: With no frog selected (and frog card visible), read the empty-state copy; designate a frog via a task’s frog control and confirm the empty state disappears.

**Acceptance Scenarios**:

1. **Given** no frog is designated and the frog card is shown, **When** the user looks at the empty frog area, **Then** they see the existing “No frog chosen yet” heading plus instructional helper copy beneath it explaining hover + frog-icon designation.
2. **Given** Hyper Minimal density hides the empty frog card, **When** no frog is designated, **Then** the helper is not required (panel absent); when a frog exists and the card shows, behavior is unchanged by this story.
3. **Given** the helper is visible, **When** the user follows it and designates a frog, **Then** the empty state (heading + helper) is replaced by the frog task as today.

---

### User Story 2 - Joyful sounds on completing tasks (Priority: P1)

When a user marks a task complete, they hear a gentle ribbit: a short cheerful chorus for the designated frog, and a lighter single ribbit for any other task. Uncompleting never plays these sounds. Visual celebrations remain as they are; sound is additive.

**Why this priority**: Core joyful feedback for the app’s primary action.

**Independent Test**: Complete a non-frog task (single ribbit); designate and complete a frog (chorus); toggle a completed non-frog back to incomplete (no sound).

**Acceptance Scenarios**:

1. **Given** an incomplete non-frog task, **When** the user marks it complete, **Then** a short, light single ribbit plays once and the existing visual celebration still occurs.
2. **Given** an incomplete designated frog task, **When** the user marks it complete, **Then** a short cheerful multi-ribbit chorus plays (delightful, not long or spammy) and the frog visual celebration still occurs.
3. **Given** a completed non-frog task, **When** the user marks it incomplete, **Then** no ribbit / chorus plays.
4. **Given** audio cannot start (no Web Audio, or play throws), **When** the user completes a task, **Then** the UI still completes normally with no error UI or console-blocking failure (silent failure).

---

### User Story 3 - Squirrel chuckle on appearance (Priority: P2)

When the bonsai’s occasional squirrel transitions from not visible to visible, the user hears a soft squirrel-like chuckle once — not on every re-render while it stays present.

**Why this priority**: Delight tied to an existing rare visual moment; secondary to task sounds.

**Independent Test**: Grow frogs until the squirrel’s seeded rule makes it appear; hear one chuckle; confirm no repeat while it remains visible; if it leaves and returns later, chuckle may play again on the next absent→present transition.

**Acceptance Scenarios**:

1. **Given** the squirrel is not visible, **When** frog-friend count changes such that the squirrel becomes visible, **Then** a calm squirrel-like chuckle plays once.
2. **Given** the squirrel remains visible across re-renders, **When** the tree re-renders without an absent→present transition, **Then** the chuckle does not replay.
3. **Given** no toast/copy for the squirrel is shown, **When** the chuckle plays, **Then** encouragement remains sound-only (no scoreboard or shame language).

---

### User Story 4 - Reward sound when adding a task (Priority: P2)

When a user successfully adds a task, they hear a short positive reward sound that is distinct from ribbits and from the focus chime.

**Why this priority**: Small positive reinforcement for capturing work; independent of completion sounds.

**Independent Test**: Add a non-empty task title; hear the reward sound once; submit empty title; no sound.

**Acceptance Scenarios**:

1. **Given** the add-task control, **When** the user successfully adds a task with a non-empty title, **Then** a short calm reward sound plays once.
2. **Given** an empty/whitespace-only title, **When** the user attempts to add, **Then** no task is added and no reward sound plays.
3. **Given** the reward sound, **When** compared to ribbits and the focus chime, **Then** it is audibly distinct from both.

---

### Edge Cases

- AudioContext suspended until gesture → resume on play attempt (existing pattern); if still unavailable, fail silently.
- Rapid completions → each incomplete→complete may play its sound; keep each sound short so overlaps stay gentle, not jarring.
- Frog already completed (locked) → no toggle / no new completion sound (existing frog-lock behavior).
- Squirrel flickers avoided by deterministic seeded visibility; effect must key off boolean transition, not render count.
- `prefers-reduced-motion` → does not mute these sounds (visual celebrations already have their own reduced-motion path).
- No external audio downloads; offline-capable synthesis only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the empty frog card is visible (no designated frog), the system MUST show calm instructional helper copy beneath “No frog chosen yet” that explains designating today’s frog by hovering a task and clicking its frog control.
- **FR-002**: Helper copy MUST be non-judgmental and easy to understand (Principle I); no shame, urgency, or scoreboard framing.
- **FR-003**: If Hyper Minimal (or similar) hides the empty frog card, that remains acceptable; helper applies whenever the empty state is shown.
- **FR-004**: System MUST play a short cheerful multi-ribbit chorus when the designated frog task transitions incomplete→complete.
- **FR-005**: System MUST play a lighter single ribbit when a non-frog task transitions incomplete→complete.
- **FR-006**: System MUST NOT play frog/regular completion ribbits when a task transitions complete→incomplete.
- **FR-007**: System MUST play a squirrel-like chuckle exactly once per absent→present squirrel visibility transition on the bonsai.
- **FR-008**: System MUST play a short positive reward sound on successful task add; MUST NOT play it for rejected empty titles.
- **FR-009**: All new sounds MUST be synthesized via the shared Web Audio helper module (no new audio asset downloads), reuse the single shared `AudioContext`, stay calm/short/non-jarring, and fail silently without blocking UI.
- **FR-010**: New sounds MUST follow the same opt-in/default behavior as existing chime/rake helpers (no new mute invented; honor any existing mute if present — currently none beyond ambient’s own toggle).
- **FR-011**: Sounds are additive to existing visual celebrations; they MUST NOT replace or remove celebration visuals.
- **FR-012**: Scope MUST stay limited to empty-state copy, sound helpers, and wiring — no theme/palette work.

### Key Entities

- **Designated frog task**: The single task id marked as today’s frog; used to choose chorus vs single ribbit on completion.
- **Squirrel visibility**: Derived boolean from bonsai frog-friend count + seeded rule; transitions drive the chuckle.
- **Garden sound effects**: Synthesized one-shot cues (chorus, ribbit, chuckle, add-reward) sharing the app audio context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the empty frog card visible, 100% of manual reviewers can state how to designate a frog after reading the helper alone (no other docs).
- **SC-002**: Completing a frog vs a non-frog produces two audibly different ribbit experiences in manual verification.
- **SC-003**: Uncompleting a task produces zero new ribbit/chorus playback in manual verification.
- **SC-004**: Squirrel chuckle fires once on first appearance for a given absent→present transition and does not spam while remaining visible.
- **SC-005**: Successful add-task plays the reward sound; empty submit does not.
- **SC-006**: Completing tasks / adding tasks / squirrel appearance never blocks UI when audio fails; `tsc --noEmit` and eslint stay clean for the change set.

## Assumptions

- Existing shared `AudioContext` and resume-on-use pattern in the sound module is the correct base (Principle VII).
- No global sound mute preference exists yet; ambient focus loop remains independently toggled.
- Task completion and add-task always occur from user gestures in current UI, satisfying autoplay policies after first interaction.
- Optional squirrel encouragement copy is out of scope (sound-only).
- Night Camp / other open branches are untouched; this work ships from a branch based on latest `main`.
