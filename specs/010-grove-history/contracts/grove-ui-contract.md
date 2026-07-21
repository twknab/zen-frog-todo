# UI Contract: The Grove

This is a client UI feature; the "contract" is the observable behavior and component boundaries, not a network API. It is the checklist the implementation and `quickstart.md` validate against.

## Component: `Grove` (`src/components/Grove.tsx`)

**Role**: Inline, bottom-of-page section that shows a collapsible, horizontal ribbon of archived-day scenes and owns the day-detail dialog.

**Inputs**: none (self-contained). Reads:
- `useArchive()` → `ArchivedDay[]` (newest-first)
- `useGroveVisibility()` → `[visible: boolean, setVisible]`
- `useReducedMotion()`

**Rendered structure & behavior**:

| Element | Contract |
|---|---|
| Section header | A heading "The Grove" + a toggle button. Toggle has `aria-expanded={visible}` and an accessible label that reflects state ("Show the Grove" / "Hide the Grove"). Activating it flips `groveVisible` (persisted). |
| Collapse region | Wraps the ribbon; controlled by `visible`. `timeout={0}` when reduced motion. When hidden, occupies no space (section reflows; only the header remains). |
| Ribbon | `role="list"`, horizontally scrollable (`overflow-x: auto`), newest-first. Smooth scroll disabled under reduced motion. |
| Day scene | One per archived day: `role="listitem"` containing a button. Button accessible name = `"<dateLabel> — <stageDescription>"`. Inner `BonsaiTree` is `aria-hidden`. Visible date caption under each tree. Activating (click / Enter / Space) opens the detail dialog for that day. |
| Empty state | When the archive is empty AND the region is expanded: a single calm line inviting the user to close a day. No error, no shame. |

**Must**:
- Order scenes newest-first (FR-004).
- Visually differentiate days by growth (a lush day ≠ a shrub day) (FR-002, SC-002).
- Reflect same-date disambiguation in the label consistent with `archiveEntryLabel` (FR-003).
- Persist and restore the show/hide preference (FR-010, SC-003).
- Default collapsed on first load (FR-011).
- Be fully keyboard-operable and screen-reader labelled (FR-013, SC-005).
- Honor `prefers-reduced-motion` for toggle + scroll (FR-014, SC-006).
- Perform no network / add no telemetry (FR-005).

**Must not**: surface streaks, ranks, or comparative "score" framing (FR-016); modify or reorder archived data.

## Component: `GroveDayDialog` (`src/components/GroveDayDialog.tsx`)

**Role**: Read-only recap of one archived day (US3 / FR-017).

**Props**:
- `day: ArchivedDay | null` — the selected day (dialog open when non-null)
- `sameDateCount: number` — for the date label
- `onClose: () => void`

**Rendered content**:
- Title: `archiveEntryLabel(day, sameDateCount)`.
- Reflection paragraph — rendered only when `day.reflection.trim()` is non-empty (omitted gracefully otherwise).
- "What was done": the day's `completedTasks` (title, with note beneath when present). If none, a calm neutral line (no guilt).
- A single dismiss control.

**Must**:
- Be read-only (no edit/delete affordances).
- Manage focus: focus moves into the dialog on open and returns to the invoking scene button on close (MUI `Dialog` default + `onClose`).
- Open/close with `transitionDuration={0}` under reduced motion.
- Keep the ribbon mounted underneath so scroll position is preserved on close (FR-017).

## Integration: `page.tsx`

- Render `<Grove />` after the Standup Summary section.
- Gate the entire section behind `!isFocus` so it is absent in Focus Mode (FR-012), matching the other bottom sections' `AnimatePresence` pattern.

## Shared helper: `blossomCountForLeaves(leaves)` (`src/lib/bonsai.ts`)

- Pure: `leaves >= 15 ? Math.min(6, leaves - 14) : 0`.
- Used by both `deriveBonsai` (live tree) and the Grove scenes (archived trees) so blossoming is consistent (Decision 2).
