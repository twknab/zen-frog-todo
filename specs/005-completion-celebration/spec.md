# Feature Specification: Task-completion celebration

**Feature Branch**: `005-completion-celebration`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Lets add a success celebration animation when we check off an item"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A calm moment of reward on completing a task (Priority: P1)

When the user marks a task complete by checking its checkbox, a brief, gentle celebratory animation plays at the point of the checkbox, acknowledging the accomplishment before fading away on its own.

**Why this priority**: This is the entire feature — the positive-reinforcement moment that makes finishing a task feel good without nagging or scoring.

**Independent Test**: Check off a task in the task list and confirm a short celebratory flourish appears near the checkbox and then disappears on its own, leaving the interface exactly as it was.

**Acceptance Scenarios**:

1. **Given** an incomplete task in the list, **When** the user checks its checkbox, **Then** a brief celebratory animation plays originating at the checkbox and then fades out completely within about a second.
2. **Given** the frog (today's most important task), **When** the user checks it complete, **Then** the same celebratory animation plays for it.
3. **Given** a task that is already complete, **When** the user un-checks it (marks it incomplete again), **Then** no celebration plays — the moment is reserved for completing, never for undoing.
4. **Given** the celebration has finished, **When** the user looks at the screen, **Then** nothing about the celebration remains (no leftover marks, no shifted layout, no lingering element).

---

### User Story 2 - Respect for reduced-motion and calm preferences (Priority: P1)

A user who has asked their system to minimize motion still gets a gentle acknowledgement of completion, but in a minimal-motion form rather than a lively burst.

**Why this priority**: The constitution makes reduced-motion support non-negotiable; a celebration that ignores it would be a defect, and would also violate the "calm technology" stance for motion-sensitive users.

**Independent Test**: Enable "reduce motion" at the OS level, check off a task, and confirm the acknowledgement is a subtle, minimal-motion effect rather than a multi-particle animation.

**Acceptance Scenarios**:

1. **Given** the user's system requests reduced motion, **When** a task is completed, **Then** the celebration degrades to a minimal, non-distracting acknowledgement rather than a full animated burst.
2. **Given** reduced motion is not requested, **When** a task is completed, **Then** the full (still gentle) celebration plays.

---

### Edge Cases

- **Rapid multiple completions**: If several tasks are checked in quick succession, each completion gets its own celebration; overlapping celebrations must not freeze, lag, or accumulate leftover elements on screen.
- **Completion triggered without a pointer** (e.g. keyboard/space on a focused checkbox): the celebration still plays at a sensible location tied to that checkbox.
- **Very small or scrolled viewports**: the celebration must stay visually contained and never introduce horizontal scroll, cover essential controls permanently, or block interaction.
- **Bulk/programmatic completion** (if it ever occurs, e.g. state restored on load): completing tasks that the user did not just click must NOT trigger a barrage of celebrations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST play a brief celebratory animation when the user marks a task complete, for both regular tasks and the frog task.
- **FR-002**: The celebration MUST originate visually at (or adjacent to) the checkbox the user acted on, so the feedback is clearly tied to the completed item.
- **FR-003**: The celebration MUST play only on the transition from incomplete → complete, and MUST NOT play when a task is un-completed.
- **FR-004**: The celebration MUST be self-dismissing — it fully clears itself within roughly one second and leaves no persistent visual artifact or layout shift.
- **FR-005**: The celebration MUST NOT block or delay the underlying action; the task is marked complete immediately regardless of the animation.
- **FR-006**: The celebration MUST respect the user's reduced-motion preference, degrading to a minimal-motion acknowledgement when reduced motion is requested (constitution Principle IV).
- **FR-007**: The celebration's visual style MUST use the app's muted, nature-derived palette and calm motion character — it MUST NOT read as loud "confetti", flashing, or an attention-grabbing reward loop (constitution Principles I, II, V).
- **FR-008**: The celebration MUST be purely positive acknowledgement with no scorekeeping — it MUST NOT show counts, streaks, points, ranks, or any comparison, and MUST NOT surface guilt or urgency (constitution Principles I, II).
- **FR-009**: Overlapping or rapid successive celebrations MUST remain performant and MUST NOT leave orphaned elements behind.
- **FR-010**: The celebration MUST be presentational only — it MUST NOT change, gate, or add any task/timer/sand/reflection data or behavior.

### Key Entities

- **Celebration burst**: a transient, self-expiring visual acknowledgement anchored to a screen position, carrying only what it needs to render and then remove itself. It holds no user data and is never persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-initiated incomplete→complete checkbox actions (task list and frog) produce a celebration; 0% of un-complete actions do.
- **SC-002**: Every celebration fully disappears within ~1 second of the completion, leaving no residual element or layout change (verified visually and by inspecting the page after the effect).
- **SC-003**: With reduced motion requested, completing a task never plays the full particle animation — only the minimal acknowledgement.
- **SC-004**: Checking off 5 tasks in rapid succession produces 5 acknowledgements with no visible jank and no leftover on-screen elements afterward.
- **SC-005**: The completion action itself remains instantaneous — users perceive no added delay to the task being marked done.

## Assumptions

- Scope is the two places a user completes a task today: the task-list rows and the frog card. Completing items in any other future surface is out of scope until that surface exists.
- The celebration is **visual only** — no sound is added by this feature (the app's existing focus/rake sounds are unrelated and unchanged).
- "Item" in the request refers to a task/frog checkbox, not the focus-timer completion or reflection notes (those have their own existing feedback).
- The celebration is always on for completions (with the reduced-motion variant as the accessibility path); a separate user setting to disable it entirely is not required for this version and can be a later follow-up if requested.
- This is a calm, single-player positive-reinforcement moment consistent with the garden metaphor, not a gamified scoreboard.
