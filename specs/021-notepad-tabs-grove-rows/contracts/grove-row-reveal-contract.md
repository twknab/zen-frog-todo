# UI Contract: Grove Row Reveal

Updates the ribbon behavior in `specs/010-grove-history/contracts/grove-ui-contract.md`. Day dialog, sand lightbox, visibility preference, Focus/Hyper Minimal gates remain as today unless noted.

## Component: `Grove` — ribbon layout (revised)

| Element | Contract |
|---|---|
| Collection | `role="list"` of day/sand columns, newest-first (Today sand first when present, then archive) |
| Layout | Wrapping rows filling available width; **`overflow-x` must not scroll** the collection |
| Initial visit | When expanded after load, or when toggled hidden→shown: show only the first row’s worth of items (`revealedCount = perRow`, capped by item count) |
| Load more | Calm control below the collection (e.g. expand-more + “Show more days”); reveals **one additional row** (`revealedCount += perRow`); **hidden** when nothing remains |
| Resize | Keep approximate `revealedCount`; reflow into new `perRow` |
| Empty | Existing clearing copy; no load-more |
| Motion | Load-more reveal instant under `prefers-reduced-motion` |
| A11y | Load-more labelled and keyboard-operable; newly revealed items in tab order |

## Must

- No horizontal scrollbar on the day collection for overflow history.
- Reset reveal on each Grove visit (hide→show or full page load).
- Preserve day-scene visuals, labels, dialogs, sand peeks.

## Must not

- Persist how many rows were opened.
- Show a disabled load-more when exhausted.
- Change archive ordering or mutate archived data.
