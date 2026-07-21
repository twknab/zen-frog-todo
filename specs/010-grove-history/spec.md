# Feature Specification: The Grove — Archived-Day History

**Feature Branch**: `010-grove-history`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "New branch for the grove. I want the UX to be smooth and beautiful, and not distract from the primary pieces — or we might want a way to hide the grove, so the current (live) bonsai, when not in Focus Mode, still gets some traction/attention."

## Overview

Today, a day's work is snapshotted into an on-device archive whenever the user starts a new day (manually or via the automatic new-day rollover). That archive is currently only reachable as a JSON export — there is no way to *see* your past days inside the app.

**The Grove** turns that archive into a calm, scrollable visual keepsake: each archived day appears as a small bonsai "scene" that reflects how that day grew (its leaves/stage), labelled with its date. It is a gentle, non-judgmental way to look back at momentum over time — no streaks, no scores, no comparison. Because a wall of past bonsai could visually compete with the single live bonsai on the board, the Grove is quiet and out of the way by default, with an explicit control to reveal or hide it.

## Clarifications

### Session 2026-07-21

- Q: Default visibility of the Grove on first load? → A: Collapsed/hidden by default (revealable in one action).
- Q: Where should the Grove live? → A: An inline, collapsible section at the bottom of the page, below Completed / Standup Summary.
- Q: How should the day scenes be arranged? → A: A horizontal scrolling ribbon of small trees, newest-first.
- Q: Include the US3 "peek at a past day" detail (reflection + what was done) in v1? → A: Yes — include it in v1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Look back at past days as a calm grove of little trees (Priority: P1)

A returning user who has closed several days wants to glance back at their journey. They open the Grove and see a calm, scrollable row/collection of small bonsai scenes — one per archived day, newest first — each labelled with its date. The trees vary with how each day grew, so the user gets a soft, at-a-glance sense of their rhythm over time without any numbers being pushed at them.

**Why this priority**: This is the core value — making the already-stored archive visible and rewarding. It stands alone as a shippable slice: even with no toggle and no per-day details, a visible history of days delivers the "look back and feel good" payoff.

**Independent Test**: With at least two archived days present, open the Grove and confirm each archived day is represented by its own bonsai scene labelled with a human-readable date, ordered newest-first, and that the collection scrolls smoothly when there are more days than fit.

**Acceptance Scenarios**:

1. **Given** the user has one or more archived days, **When** they view the Grove, **Then** each archived day appears as its own small bonsai scene labelled with that day's date, ordered most-recent first.
2. **Given** an archived day that grew a lush tree versus one that stayed a shrub, **When** both appear in the Grove, **Then** their scenes visibly differ so the tree reflects that day's actual growth (leaves/stage).
3. **Given** more archived days than fit in the visible area, **When** the user scrolls the Grove, **Then** additional days come into view with smooth, calm motion (no janky jumps).
4. **Given** the user has no archived days yet, **When** they view the Grove, **Then** a calm, non-judgmental placeholder invites them to close a day (no empty gap, no error, no shaming copy).
5. **Given** a screen-reader or keyboard user, **When** they reach the Grove, **Then** each day scene is reachable and announced with its date and a short description (e.g., its growth stage), and the collection is navigable without a mouse.

---

### User Story 2 - Keep the Grove out of the way so the live bonsai stays center stage (Priority: P2)

A user who is focused on today doesn't want a long history competing with their single, living bonsai. They can collapse/hide the Grove with one clear control, and the app remembers that choice across visits. When hidden, the board stays centered on the primary pieces (frog, timer, live bonsai, tasks); when the user wants to reminisce, one action reveals the Grove again.

**Why this priority**: Directly addresses the stated concern that the Grove not distract from the primary pieces. It depends on US1 existing (there must be a Grove to hide) but is independently testable and materially changes the everyday experience.

**Independent Test**: Toggle the Grove hidden, reload the app, and confirm it is still hidden and the primary board is unobstructed; toggle it shown and confirm the Grove reappears and the preference persists.

**Acceptance Scenarios**:

1. **Given** the Grove is shown, **When** the user activates the hide/show control, **Then** the Grove collapses out of view and the primary board reflows to fill the space calmly.
2. **Given** the user has hidden (or shown) the Grove, **When** they reload or return later, **Then** the Grove is in the same state they left it (preference persists on-device).
3. **Given** the app is first opened by a brand-new user, **When** the page loads, **Then** the Grove defaults to a non-intrusive state so the live bonsai and primary pieces get the user's initial attention.
4. **Given** the user is in Focus Mode, **When** the board is stripped down, **Then** the Grove is not shown (it follows the same hide-in-Focus convention as other secondary sections).
5. **Given** a keyboard/screen-reader user, **When** they reach the hide/show control, **Then** it is operable and its current state (shown/hidden) is announced.
6. **Given** the user has `prefers-reduced-motion` enabled, **When** the Grove shows or hides, **Then** the transition falls back to an instant/minimal change rather than an animated collapse.

---

### User Story 3 - Peek at what a past day held (Priority: P3)

A user browsing the Grove is curious about a particular day. They select that day's scene and see a gentle, read-only recap of what that day held — its reflection and what was accomplished — without leaving the calm of the Grove.

**Why this priority**: Enriches the history from a pure glance into something explorable, but the Grove delivers value without it. It depends on US1 and is additive.

**Independent Test**: Select an archived day that had a reflection and completed tasks, and confirm a calm read-only recap of that day (date, reflection text, and what was done) is revealed and can be dismissed.

**Acceptance Scenarios**:

1. **Given** an archived day with a reflection and completed tasks, **When** the user selects its scene, **Then** a read-only recap shows that day's date, its reflection, and the tasks completed that day.
2. **Given** an archived day that had no reflection, **When** the user selects it, **Then** the recap omits the reflection gracefully (no empty label, no placeholder guilt), still showing what was done.
3. **Given** a recap is open, **When** the user dismisses it, **Then** they return to the Grove with their scroll position preserved.
4. **Given** a keyboard/screen-reader user, **When** they open and close a day's recap, **Then** focus is managed correctly and the recap content is announced.

---

### Edge Cases

- **No archived days**: the Grove shows calm placeholder copy inviting the user to close a day — never an error or an accusatory empty state.
- **A single archived day**: the Grove renders one scene without looking broken or forcing horizontal scroll affordances that have nothing to scroll to.
- **Many archived days** (up to the existing retention bound): the collection remains smooth and does not degrade the app's responsiveness; long histories load and scroll without jank.
- **Same calendar date appearing more than once** (a day closed, then another new day started the same date): each closure is its own scene, disambiguated the way the existing archive already labels same-date entries (e.g., with a time).
- **An archived day that recorded no growth** (shrub, zero leaves): its scene still renders as a small shrub with its date rather than a blank slot.
- **Very long reflection text** in the day recap (US3): the recap remains readable and scannable rather than overflowing the layout.
- **Focus Mode**: the Grove and its toggle follow the same hidden-in-Focus behavior as other secondary sections.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a "Grove" view that renders each archived day as its own visual bonsai scene.
- **FR-002**: Each day's scene MUST visually reflect that day's recorded growth (leaves and/or growth stage) so different days look meaningfully different.
- **FR-003**: Each day's scene MUST be labelled with a human-readable date, disambiguating multiple closures on the same calendar date consistently with the app's existing archive labelling.
- **FR-004**: The Grove MUST order days most-recent-first.
- **FR-005**: The Grove MUST read only from the existing on-device day archive; it MUST NOT introduce any network calls, accounts, or telemetry, and MUST NOT require a new persistent record of its own beyond a small local UI preference (see FR-010).
- **FR-006**: The Grove MUST handle the empty-archive case with calm, non-judgmental placeholder copy (no error, no shaming language).
- **FR-007**: The Grove MUST present its day scenes as a horizontal, newest-first ribbon that scrolls smoothly when there are more days than fit in the visible area, using restrained, calm motion.
- **FR-008**: Users MUST be able to hide and show the Grove via a single, clearly labelled control.
- **FR-009**: When hidden, the Grove MUST free its space so the primary board (frog, timer, live bonsai, tasks) reflows without leaving an obvious gap.
- **FR-010**: The system MUST persist the user's show/hide preference on-device so it survives reloads and return visits.
- **FR-011**: On a brand-new user's first load, the Grove MUST default to **collapsed/hidden**, keeping initial attention on the live bonsai and primary pieces; revealing it MUST take a single action.
- **FR-012**: The Grove and its show/hide control MUST NOT appear in Focus Mode, matching the visibility convention of other secondary sections.
- **FR-013**: All Grove interactions (scrolling, show/hide, and any day selection) MUST be fully keyboard-operable and screen-reader labelled, with each day scene announced by its date and a short growth description.
- **FR-014**: All Grove motion (scroll, show/hide, and any reveal of day detail) MUST respect `prefers-reduced-motion`, degrading to instant/minimal-motion states.
- **FR-015**: The Grove's visual design MUST follow the app's re-themed, calm aesthetic (muted nature palette, soft shadows, generous spacing, organic corners) and MUST NOT look like default Material Design.
- **FR-016**: The Grove MUST NOT introduce any scoreboard, streak counter, ranking, or comparative/among-users framing; any counts shown MUST be incidental and non-judgmental (Principle II).
- **FR-017** *(US3, in scope for v1)*: Selecting a day's scene MUST reveal a calm, read-only recap of that day — at minimum its date, its reflection (omitted gracefully when absent), and the tasks completed that day — dismissible back to the Grove with scroll position preserved.
- **FR-018**: The Grove MUST live as an inline, collapsible section at the bottom of the page, below the existing Completed / Standup Summary sections — not in the primary board grid.

### Key Entities *(include if feature involves data)*

- **Archived Day**: An existing on-device record of a closed day. Already stores the day's date/close time, completed tasks (with notes), reflection text, focus-session count, and the bonsai's leaves + growth stage as of close. The Grove is a **read-only consumer** of this record; it introduces no new fields.
- **Grove Visibility Preference**: A small, on-device UI setting capturing whether the user currently wants the Grove shown or hidden. The only new persisted state this feature adds.
- **Day Scene**: A derived, read-only visual representation of one Archived Day (a small bonsai reflecting that day's growth, plus its date label). Not separately persisted; computed from the Archived Day.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with archived days can, in a single action, reveal a history where 100% of their archived days are represented as individual dated scenes.
- **SC-002**: Days with different recorded growth are visually distinguishable in the Grove 100% of the time (a lush day never looks identical to a shrub day).
- **SC-003**: A user can hide the Grove and have it stay hidden across a reload/return visit 100% of the time (preference persists).
- **SC-004**: With the Grove hidden, the primary board occupies the space with no visible empty gap, keeping the live bonsai and primary pieces front-and-center.
- **SC-005**: Every Grove affordance (show/hide, scroll, and day selection) is operable by keyboard alone and correctly announced by a screen reader, with zero critical accessibility issues.
- **SC-006**: With `prefers-reduced-motion` enabled, no Grove interaction produces a distracting animation (all transitions fall back to instant/minimal).
- **SC-007**: The Grove remains smooth and responsive with a long history (up to the app's existing archive retention bound) — scrolling and show/hide feel calm, not janky.

## Assumptions

- **Default visibility** *(resolved in Clarifications)*: On first load the Grove defaults to **collapsed/hidden** (revealable in one action), because the user's primary concern was that it not distract from the live bonsai.
- **Placement** *(resolved in Clarifications)*: The Grove is an **inline, collapsible section at the bottom of the page**, below Completed / Standup Summary — not in the primary board grid — reinforcing that it is a look-back, not a primary control surface.
- **Arrangement** *(resolved in Clarifications)*: Day scenes are laid out as a **horizontal, newest-first scrolling ribbon** of small trees.
- **Day detail** *(resolved in Clarifications)*: The US3 read-only day recap is **in scope for v1**.
- **Scene contents**: Each day's scene is built from the growth data already stored per archived day (leaves + stage). Frog-friend counts are **not** stored per archived day today, so scenes reflect the bonsai's growth rather than reproducing that day's exact frog crowd; adding per-day frogs is out of scope for this feature.
- **Source of truth**: The Grove reads the existing archive only. It does not modify, delete, or re-order archived days, and it does not change how days are archived.
- **Retention**: The Grove inherits the archive's existing retention bound; it does not add its own retention or pruning rules.
- **No export changes**: The existing JSON export/import is unchanged; the Grove is a viewing surface, not an export feature.
- **Single-user / local**: Consistent with the app's local-first, single-player nature — the Grove is personal and never shared or compared across users.
