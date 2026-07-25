# Quickstart / Manual Verification: 020 Garden Sounds

## Prerequisites

- `npm run dev` (or equivalent) on a branch with this feature
- Browser with Web Audio; interact with the page once so audio can resume

## Scenario A — Empty frog helper (US1)

1. Ensure no frog is designated (new day or clear frog).
2. Confirm density is **not** Hyper Minimal (so empty frog card shows).
3. **Expect**: “No frog chosen yet” plus helper: hover a task / click its frog…
4. Hover a task, click frog icon → frog card shows that task; helper gone.

## Scenario B — Completion ribbits (US2)

1. Add two tasks; designate one as frog.
2. Complete the **non-frog** → hear a **single light ribbit**; visual celebration still runs.
3. Complete the **frog** → hear a **short ribbit chorus**; frog celebration still runs.
4. Uncomplete the non-frog (if allowed) → **no** ribbit.

## Scenario C — Squirrel chuckle (US3)

1. Use growth (complete tasks / focus / available dev affordances) until frog friends ≥ squirrel threshold and seeded rule shows squirrel.
2. **Expect**: one chuckle as it appears.
3. Re-render / stay on page without count change → **no** repeat chuckle.
4. If squirrel later disappears and reappears → chuckle may play again on that rising edge.

## Scenario D — Add-task reward (US4)

1. Add a task with a real title → short reward sound (not a ribbit, not focus chime).
2. Submit empty title → no sound, no task.

## Scenario E — Failure silence

1. If possible, block/break audio (unsupported context) → completing/adding still works; no error UI.

## Gate

```bash
npx tsc --noEmit
npx eslint --max-warnings=0
```
