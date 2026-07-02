# Quickstart: Validating Focus history, completed-tasks log, and Sand Mode rocks

## Prerequisites

- Dev server running (`npm run dev`, or via the project's preview tooling).
- A fresh or existing browser profile against that server's origin (localStorage is per-origin).

## Scenario 1 — Completed tasks can't become the frog

1. Open the dashboard, switch to Flow Mode.
2. Check off a task in the Task list.
3. Confirm its 🐸 control is gone/disabled.
4. Confirm an *incomplete* task's 🐸 control still works and moves it into the Frog card.
5. In the Frog card, check off the current frog — confirm it stays in the Frog card, now shown as completed.

**Expected**: only incomplete tasks are ever frog-eligible; completing the frog itself is unaffected.

## Scenario 2 — Completed log + notes persist

1. Complete two or three tasks.
2. Scroll to the Completed log at the bottom of the dashboard — confirm one entry per completion, most recent first.
3. Type a note on one entry.
4. Reload the page.
5. Confirm the log and the note are both still present.
6. Reopen one of the completed tasks, then re-complete it — confirm a *second* entry appears rather than the first one being overwritten.

**Expected**: log is append-only, notes survive reload, no data loss on reopen/re-complete.

## Scenario 3 — Focus session count

1. Note the current count shown in the Focus card (0 on a fresh profile).
2. Start a focus session and let it run to completion (or use a shortened test duration).
3. Confirm the count increased by 1.
4. Start another session and cancel it early.
5. Confirm the count did **not** change.
6. Reload — confirm the count persisted.

**Expected**: count only increments on natural completion; survives reload.

## Scenario 4 — Sand Mode rocks block raking

1. Open Sand Mode, drag a rock from the tray into the canvas.
2. Confirm it lands and stays at the drop point.
3. Rake a stroke that passes directly through the rock.
4. Confirm the drawn trail has a gap at the rock's location, while drawing normally on either side.
5. Place a second rock and rake across both in one stroke — confirm both are respected.
6. Rake near (not through) a rock — confirm normal drawing right up to its edge.

**Expected**: no rake line ever renders inside a rock's footprint; everything else draws as before.

## Verification gates (run before/after manual scenarios)

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
```

Both must be clean. No automated test suite exists in this project; the four scenarios above are the acceptance check, run manually via the browser preview.
