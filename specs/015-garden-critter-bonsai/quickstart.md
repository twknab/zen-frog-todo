# Quickstart / Manual Verification — 015

## Setup

```bash
npm install   # if needed
npm run dev
```

Open the app; use normal completions or any existing dev growth controls to raise leaves/frogs.

## Checks

1. **Comedy frogs** — Earn many frogs (or seed events). Confirm larger frogs, wider ground spread, readable at ~28, stable on reload.
2. **Tree presence** — Mid/high leaves: tree feels bigger/more bonsai-like inside the card.
3. **Frog-fruit** — At blossom stages (leaves ≥ 15 per `blossomCountForLeaves`): multi-color tiny frogs in canopy; **no** pink blossom dots.
4. **Wilt** — Trigger idle wilt: leaves/tree dim; ground frogs + fruit stay cheerful.
5. **Reduced motion** — OS/browser `prefers-reduced-motion`: appears are instant; nothing stuck invisible.
6. **Grove** — Open Grove archived day with blossoms: fruit renders; no breakage.
7. **Gate** — `npx tsc --noEmit` and eslint clean for changed files.

## Dial-back

If density/presence feels wrong, tune knobs in the [contract](./contracts/bonsai-visual-upgrade-contract.md) table before shipping taste tweaks.
