# Quickstart: Validating The Growing Bonsai

## Prerequisites

- Dev server running (`npm run dev` / preview tooling).
- A browser profile on that origin (localStorage is per-origin).
- Verification gates first: `npx tsc --noEmit` and `npx eslint src --max-warnings=0` both clean.

## Scenario 1 — Grows with work (US1)

1. Start from a fresh profile (clear `localStorage`) and open Flow Mode. Confirm the Bonsai card shows the **seedling** stage, calm (not empty/broken).
2. Complete a task. Confirm the bonsai advances a little (new sprout/leaf) with a soft transition.
3. Complete a focus session. Confirm it advances *more* than a single task did (a blossom-level jump).
4. Reload. Confirm the bonsai shows the **same** stage (state derived from persisted history).

**Expected**: visible growth reacts to the very first completion; larger step for a focus session; survives reload.

## Scenario 2 — Bounded maturity (US2)

1. Seed enough completed history to exceed the mature threshold (e.g. via completing many tasks, or by pre-seeding `completed-log`/`focus-stats` in localStorage for the test).
2. Confirm the bonsai shows the **mature** tree.
3. Complete several more items. Confirm it does **not** grow further and shows **no number/level/count** anywhere on the card.

**Expected**: holds at mature; reward stays purely visual.

## Scenario 3 — Gentle, active-window wilt (US3) — the key one

1. Reach a mid stage (e.g. leafy/flowering).
2. Simulate idle by setting `frog-garden:bonsai-v1`'s `lastActivityAt` to a time several **active-window hours** in the past (e.g. earlier the same day). Reload.
3. Confirm the tree has shed a leaf or two, softly muted — **never dropped to bare**, never below **sapling**, no red/alarm styling, no "you're slipping"/countdown copy.
4. Set `lastActivityAt` to a time whose gap to now is entirely **overnight/off-hours** (e.g. 02:00 last night → now, before 08:00). Reload. Confirm **no wilt** occurred (active-window pause works).
5. Complete a task. Confirm the shed growth returns (regrowable) and `lastActivityAt` resets.

**Expected**: same-day droop, overnight immune, sapling floor, fully recoverable, calm framing.

## Scenario 4 — Accessibility & reduced motion

1. Inspect the bonsai `<svg>` — confirm `role="img"` and an `aria-label` naming the current stage (e.g. "Your bonsai is flowering") that changes with the stage.
2. Enable `prefers-reduced-motion` (DevTools rendering emulation). Trigger a growth change. Confirm the stage updates **instantly** with no animation and no lost state.

**Expected**: stage perceivable as text; correct final stage under reduced motion.

## Scenario 5 — Scoped, non-invasive

1. Confirm the Bonsai card appears in **Flow Mode** alongside Sand Mode, and is **absent in Focus Mode** (which shows only frog + timer).
2. Confirm Sand Mode, the task list, timer, completed log, and reflection all behave exactly as before.

**Expected**: purely additive; no regression to existing cards.

## Verification gates (run around the scenarios)

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
```

Both clean. No automated test suite is the gate (project convention); these five scenarios are the acceptance check via the browser preview.
