# Quickstart / Manual Verification: High Contrast

**Feature**: `018-high-contrast`

## Setup

1. Run the app (`npm run dev` or project equivalent).
2. Open Options (gear).

## Checks

1. **Default**: High Contrast off; Palette enabled; stored/default garden palette visible.
2. **Enable HC**: Toggle High Contrast on → app switches to HC theme for current Appearance; Options stays open; Palette disabled + calm “Using high contrast” hint.
3. **Palette preserved**: Note active palette before HC; enable HC; disable HC → same palette returns without re-selecting.
4. **Appearance under HC**: With HC on, switch Light ↔ Dark → both HC variants readable; strong focus/selected states.
5. **Persistence**: Enable HC, reload → still on. Disable, reload → still off. Key: `frog-garden:high-contrast-v1`.
6. **A11y**: Tab to High Contrast switch; announce label. With HC on, focus Palette — disabled state announced; cannot open menu to change palette.
7. **No dropdown entry**: Palette list does not include a “High Contrast” palette option.
8. **Gate**: `npx tsc --noEmit` and eslint clean.

## Contrast spot-check

- Body text vs background: AA+ in HC light and HC dark.
- Primary buttons: label contrast AA against moss.
- Selected Appearance toggle / focused controls clearly visible.
