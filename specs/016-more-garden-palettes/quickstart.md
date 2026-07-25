# Quickstart / Manual Verification: More Garden Palettes

## Setup

```bash
npm install
npm run dev
```

Open the app in a browser. Also prepare a narrow viewport (~360px) or device emulation.

## Checklist

### Persistence & default

1. Fresh storage (or clear `frog-garden:palette-v1`) → app loads on **Natural**.
2. Select **Guestbook** → reload → still Guestbook.
3. Set storage to garbage (`"neon"`) → reload → Natural, no crash/shame UI.

### Six palettes × light/dark

For each of Natural, Vibrant, Dusk, Guestbook, Sunlily, Tide Pool:

1. Select palette in Options.
2. Toggle Appearance Light then Dark.
3. Confirm: readable text/controls, coherent surfaces, atmosphere feels on-palette, no leftover colors from prior palette.

### Distinctiveness

Flip Guestbook ↔ Vibrant ↔ Dusk ↔ Tide Pool ↔ Sunlily ↔ Natural — each should read as a different garden mood (SC-007).

### Options layout (crowding)

1. Open Options at ~360px width.
2. Palette section shows a wrap/grid (≈2×3), not one cramped row of six.
3. No horizontal scroll of Popover content; labels legible.
4. Change palette — Popover stays open.
5. Appearance + Dev still work.

### A11y smoke

1. Keyboard: Tab to Options → Enter/Space open → move through palette buttons → select.
2. Screen reader (or a11y tree): Palette group + each option name announced.
3. `prefers-reduced-motion: reduce` → Popover open/close minimal/instant.

### Regression

1. Create/complete a task; bonsai/garden still themed via tokens.
2. Flow/Focus, Export, Notepad still in header; no sun/moon or Dev in header.
3. Guestbook wordmark may gradient; Sunlily/Tide Pool solid.

### Gate commands

```bash
npx tsc --noEmit
npm run lint
```
