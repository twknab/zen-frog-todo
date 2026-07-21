# Phase 0 Research: The Grove — Archived-Day History

All decisions below are constrained by the constitution (calm, local-first, accessible, re-themed MUI, YAGNI) and the clarified spec. No `NEEDS CLARIFICATION` items remain from the plan's Technical Context.

## Decision 1 — Render each day scene by reusing `BonsaiTree`

- **Decision**: Use the existing `src/components/BonsaiTree.tsx` at a small `size` (≈96–120px) for each archived day, driven by that day's stored `bonsai.leaves` and `bonsai.stage`. Pass `isWilting={false}` (archived days are static, not live) and let frogs default to the baseline lone frog.
- **Rationale**: The tree is already the app's visual language for "a day's growth." Reusing it makes the Grove instantly legible and on-brand with zero new artwork (Principle V, VI). `BonsaiTree` is a pure SVG driven entirely by props and uses deterministic layouts (no render randomness), so many small instances are cheap and hydration-safe.
- **Alternatives considered**: A new bespoke mini-tree/sparkline (more work, visual drift); a photo/emoji per day (off-brand, not reflective of actual growth).

## Decision 2 — Blossoms derivation shared with `deriveBonsai` (`blossomCountForLeaves`)

- **Decision**: Extract the existing blossom formula (`leaves >= 15 ? min(6, leaves - 14) : 0`) into an exported `blossomCountForLeaves(leaves)` in `bonsai.ts`, use it inside `deriveBonsai`, and reuse it for Grove scenes.
- **Rationale**: `ArchivedDay` stores `leaves` + `stage` but not `blossoms`; the scene needs blossoms to look right for lush days. Sharing one helper avoids drift between the live tree and the archived scenes (DRY, Principle VI).
- **Alternatives considered**: Recompute inline in the Grove (duplicated magic numbers, drift risk); persist `blossoms` per archived day (needless schema change to existing records).

## Decision 3 — Horizontal, newest-first scrolling ribbon

- **Decision**: Lay scenes out in a themed, horizontally scrollable flex row (`overflow-x: auto`, calm scrollbar styling), newest day first. The archive from `useArchive()` is already newest-first (writes go through `prependAndPrune`), so no re-sorting is needed.
- **Rationale**: A ribbon reads as a gentle timeline, stays compact within a bottom section, and matches the clarified arrangement and the smooth-scroll acceptance criteria (SC-007). Native scroll gives momentum/touch behavior for free.
- **Alternatives considered**: Vertical grid/list (taller, pushes the page down, less "timeline"); a carousel with paging controls (more chrome, more motion — less calm).

## Decision 4 — Show/hide via MUI `Collapse` + persisted preference

- **Decision**: A header row ("The Grove") with a toggle button (chevron) controls an MUI `Collapse` wrapping the ribbon. Visibility is persisted via a new `useGroveVisibility()` hook (`usePersistentState<boolean>("frog-garden:grove-visible-v1", false)`), defaulting to **collapsed**.
- **Rationale**: Directly satisfies US2/FR-008–FR-011 — one clear control, persisted, collapsed by default so the live bonsai keeps focus. `Collapse` is accessible and re-themeable. Following the `sand.ts` pattern, the tiny hook keeps the preference key in one place.
- **Alternatives considered**: Fully unmounting vs. `Collapse` (unmount loses smooth reflow and scroll position); a global settings panel (over-engineered for one toggle, YAGNI).

## Decision 5 — Reduced-motion behavior

- **Decision**: Read `useReducedMotion()`. When reduced: set `Collapse` `timeout={0}`, disable CSS smooth-scroll, and open the day dialog with `transitionDuration={0}`. `BonsaiTree` already honors reduced motion internally.
- **Rationale**: Principle IV / FR-014 — motion must degrade to instant, and the app already uses this exact pattern (`NewDayAction`, `page.tsx`).

## Decision 6 — Day detail is a re-themed MUI `Dialog` (US3)

- **Decision**: Selecting a scene sets a "selected day" and opens a `Dialog` showing `archiveEntryLabel(day, sameDateCount)`, the reflection (rendered only when non-empty), and the day's `completedTasks` (title + note when present). Read-only. Closing restores focus to the invoking scene; the ribbon stays mounted so scroll position is preserved.
- **Rationale**: A dialog keeps the calm ribbon intact underneath, manages focus by default (Principle IV), and reuses the same date-labelling the export menu uses for consistency (same-date disambiguation, FR-003).
- **Alternatives considered**: Inline expanding row (reflows/janks the ribbon, complicates scroll preservation); navigating to a separate route (heavier; contradicts the "inline, out of the way" clarification).

## Decision 7 — Empty state

- **Decision**: When `useArchive()` is empty, the expanded Grove shows a single calm line inviting the user to close a day (e.g. "Your grove is still a clearing. Close a day and your first little tree will appear here.") — no error, no guilt.
- **Rationale**: Principle I / FR-006. Matches the tone of existing empty states ("Nothing finished yet…").

## Decision 8 — Accessibility model

- **Decision**: The toggle button exposes `aria-expanded` and a label reflecting state ("Show the Grove" / "Hide the Grove"). The ribbon is a list (`role="list"`); each scene is a `role="listitem"` containing a button whose accessible name is `"<date> — <stage description>"` (via `bonsaiStageLabel`). The scene's inner SVG stays `aria-hidden` (the button carries the name). Dialog is labelled by the day's date heading.
- **Rationale**: Principle IV / FR-013 — every affordance keyboard-operable and announced; each day distinguishable by date + growth without relying on the visual.
- **Alternatives considered**: Making each SVG the focus target (weaker semantics, verbose SR output).

## Decision 9 — Scope guards (what we deliberately don't build)

- No virtualization/windowing (archive is bounded at 365; SVG scenes are light) — YAGNI; revisit only on evidence of jank.
- No changes to how days are archived, no new archive fields, no export changes.
- No per-day frog reconstruction (not stored) — scenes show the baseline frog only.
- No numeric stats/scoreboard surfaced by the Grove (Principle II).
