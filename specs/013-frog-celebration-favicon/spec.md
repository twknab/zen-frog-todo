# Feature Specification: Full-Screen Frog Celebration & Frog Favicon

**Feature Branch**: `013-frog-celebration-favicon`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Two small, independent UI fixes: (1) when closing the frog task, the celebration should be full screen and full width; (2) the favicon should be the frog emoji so it shows on the browser tab."

## Amendment (2026-07-23, post-implementation)

During implementation, the literal 🐸 Unicode emoji was found to render as a **fully blank image** for the favicon: `ImageResponse`'s default emoji rendering fetches the colored glyph from `cdn.jsdelivr.net` at request time, which this environment's network policy blocks (confirmed directly). Rather than ship an untestable, network-dependent favicon, the user asked to bring in an icon library and use **one consistent frog mark everywhere** the app currently uses the 🐸 emoji, not just the favicon.

Resolution: added `react-icons` (`GiFrog`, from the Game Icons set, CC BY 3.0 — attributed in `src/app/icon.tsx`) as a new dependency, and replaced all three existing 🐸 emoji usages with this one icon, rendered via the app's theme (`primary.main` / `zen.moss`):
- `src/app/icon.tsx` (favicon) — rendered as a raw inline SVG path through `ImageResponse` (no network fetch, unlike the emoji path).
- `src/app/page.tsx` — the "Largest Task" section header icon.
- `src/components/TaskListCard.tsx` — the per-task "make this the frog" button icon.

This does **not** extend to `BonsaiTree.tsx`'s decorative, procedurally-placed frog critters (feature 008-frog-friends) — those are a distinct, hand-drawn garden-pet visual, not an iconographic UI mark, and were left untouched as out of scope for this amendment.

FR-006/FR-007 (favicon requirements) are satisfied by this icon-library approach rather than a literal emoji glyph; the user-facing outcome (SC-004, "identify the frog mark at a glance") is unchanged.

## Amendment 2 (2026-07-23, post-implementation)

Follow-up feedback after the first amendment: (a) `GiFrog` presents poorly at small sizes — confirmed by rendering it at true 16px (the realistic size of a browser tab icon) alongside three alternatives; `GiFrog`'s front-facing, detailed silhouette became an indistinct blob, while Font Awesome's simpler side-profile `FaFrog` stayed clearly legible; (b) the main "Frog Garden" header used an unrelated meditating-person icon (`SelfImprovementOutlinedIcon`) rather than any frog mark; (c) a question about whether the bonsai's reward-frog critters (feature 008-frog-friends) use "the same old" icon.

Resolution:
- Swapped the frog mark from `GiFrog` to `FaFrog` (`react-icons/fa6`, Font Awesome, CC BY 4.0 — attributed in `icon.tsx`) everywhere it's used (favicon, "Largest Task" header, per-task frog button), based on the direct low-resolution legibility comparison.
- Replaced the "Frog Garden" title's `SelfImprovementOutlinedIcon` with the same `FaFrog` mark, so the app's primary header is now part of the same consistent frog identity rather than a generic meditation icon.
- Investigated the bonsai reward-frog critters (`BonsaiTree.tsx`) and confirmed they intentionally use a distinct, much simpler primitive-shape design (a few ellipses + dots, not an icon asset) — necessary because up to 20 of them render simultaneously at a scale well below 16px. The same low-resolution test that motivated the `FaFrog` switch confirms this: any of the icon-library options would look worse, not better, multiplied at that scale. Left unchanged, deliberately — this is not "the same old" icon, it's a different, purpose-built design for a different rendering constraint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A bigger celebration for the day's biggest task (Priority: P1)

A user checks off their designated "frog" — the one task they've marked as today's biggest/most important — and the resulting celebration fills the screen, making it clearly feel like a bigger moment than checking off an ordinary task. Regular task completions keep their existing smaller, click-positioned celebration unchanged.

**Why this priority**: This is the more requested, more visible of the two changes, and directly follows from the app's own "swallow the frog first" framing (see the dashboard's own tagline) — finishing the frog is already the app's signature moment; the celebration should reflect that.

**Independent Test**: Designate a task as the frog, check it off, and confirm the celebration animation fills the screen/full width rather than appearing as a small burst near the checkbox. Then complete a different, non-frog task and confirm its celebration is unchanged (small, positioned at the click point).

**Acceptance Scenarios**:

1. **Given** a task is designated as today's frog, **When** the user checks it off, **Then** the celebration animation fills the screen (full-width, prominent) rather than appearing as a small burst positioned at the checkbox.
2. **Given** the user completes a regular (non-frog) task, **When** the celebration fires, **Then** it keeps its existing small, click-positioned appearance — unaffected by this change.
3. **Given** the user has `prefers-reduced-motion` enabled at the OS level, **When** the frog task is completed, **Then** a reduced-motion-appropriate alternative plays instead of the full animation (no full-screen motion forced on users who've opted out of it).
4. **Given** the full-screen frog celebration is playing, **When** it finishes, **Then** it clears completely on its own (no lingering overlay, no blocking of the page underneath) with the same reliability as today's celebration (which already self-clears even if the animation's own completion event doesn't fire).

---

### User Story 2 - See a frog in the browser tab (Priority: P2)

A user with the app open in a browser tab can identify it at a glance among other open tabs by its icon — a frog emoji — instead of the current generic favicon.

**Why this priority**: Small, cosmetic, and fully independent of User Story 1 — a nice-to-have identity touch, not core functionality.

**Independent Test**: Load the app in a browser and look at the tab strip / bookmark icon; confirm it shows a frog emoji rather than the previous icon.

**Acceptance Scenarios**:

1. **Given** the app is loaded in a browser tab, **When** the user looks at the tab strip, **Then** the tab's icon is a frog emoji.
2. **Given** the user bookmarks the page or views it in a browser UI surface that displays site icons (e.g. history, bookmarks), **When** that icon is shown, **Then** it is the same frog emoji icon (not a mismatched fallback).

---

### Edge Cases

- What happens if the user completes the frog task and then immediately completes another task before the full-screen celebration finishes? Both celebrations may be visible briefly; this is acceptable (matches today's existing behavior where multiple celebrations can already overlap) as long as neither gets stuck on-screen.
- What happens on a very small viewport (mobile)? "Full-width" should mean the full width of that viewport, not a fixed desktop-oriented pixel size — the celebration must scale to whatever screen it's shown on.
- What happens if the browser or OS doesn't render emoji favicons well (very old browsers)? Acceptable to fall back to whatever default the browser itself substitutes; this is not a case the app needs to work around.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the frog-task completion celebration as a full-screen, full-width animation, distinctly larger/more prominent than the existing small per-task celebration.
- **FR-002**: System MUST leave the celebration for regular (non-frog) task completions unchanged in size and positioning.
- **FR-003**: The full-screen frog celebration MUST respect `prefers-reduced-motion`, offering a non-full-motion alternative rather than forcing full animation on users who have that preference enabled.
- **FR-004**: The full-screen frog celebration MUST clear itself automatically without requiring user interaction, and MUST NOT block interaction with the page underneath once it has cleared (matching the self-clearing reliability of the existing celebration system).
- **FR-005**: The full-screen frog celebration MUST scale appropriately to the viewport it's displayed in (mobile and desktop), not assume a fixed desktop-sized viewport.
- **FR-006**: System MUST display a frog emoji as the site's favicon/tab icon, replacing the current icon.
- **FR-007**: The frog emoji favicon MUST be what's shown consistently across browser surfaces that display site icons (tab strip, bookmarks, history), not just one of several inconsistent icons.

### Key Entities

- **Celebration (frog kind)**: The existing celebration-animation concept, already distinguished internally as a "frog" kind versus the regular "task" kind (see existing celebration system) — this feature changes only the frog kind's presentation (size/positioning), not its trigger conditions or the task-completion logic that fires it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the time, completing the day's frog task produces a celebration that visually fills the screen, distinguishable at a glance from a regular task's small celebration.
- **SC-002**: 100% of regular task completions continue to show the existing small, click-positioned celebration, unchanged by this feature.
- **SC-003**: The full-screen celebration never remains visible more than a few seconds after playing, and never blocks the user from continuing to interact with the app once it's done.
- **SC-004**: A user can identify the app's browser tab by its frog emoji icon without needing to hover or click into the tab.

## Assumptions

- The existing distinction between "frog" and "task" celebration kinds (already present in the codebase) is reused as-is for triggering; this feature only changes how the "frog" kind is presented, not when it fires.
- "Full screen and full width" is interpreted as: the celebration animation itself is sized/scaled to fill the viewport (or a clearly dominant portion of it), not merely repositioned to the center at its current small size.
- The favicon replacement is a static, permanent change (the frog emoji becomes the app's one and only icon going forward) — not a temporary/conditional swap tied to any app state. (This is unrelated to and does not conflict with a separate in-progress feature that considers a *temporary* favicon change tied to focus-timer completion; that is a distinct, not-yet-implemented feature and out of scope here.)
- No new dependencies are required for either fix — both are achievable with the existing Lottie/Framer Motion celebration infrastructure and the project's existing icon-file conventions, to be confirmed during `/speckit-plan`.
