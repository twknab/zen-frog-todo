# Quickstart: Validate Bonsai Info Tooltip & Standup Summary

## Prerequisites

- Repo dependencies installed (`npm install`).
- Dev server running: `npm run dev` (or equivalent per `package.json`).
- A fresh or existing browser profile for the app (localStorage-backed — no seed data required, but a couple of tasks help exercise both states).

## Static gates (run first)

```bash
npx tsc --noEmit
npx eslint --max-warnings=0
```

Both must be clean before manual verification (project convention — no automated test suite exists yet).

## Scenario 1 — Bonsai info tooltip (User Story 1)

1. Load the dashboard. **Expect**: no caption text under the bonsai tree; an info icon sits next to the "Bonsai" heading.
2. Hover the info icon with a mouse. **Expect**: a tooltip appears near the icon showing "Grows as you finish tasks and focus sessions." styled consistently with the app's other tooltips (e.g. the dark/light mode toggle).
3. Move the mouse away. **Expect**: tooltip dismisses.
4. Tab to the info icon via keyboard only. **Expect**: it receives visible focus and the same tooltip appears.
5. Press Escape (or Tab away). **Expect**: tooltip dismisses.
6. With a screen reader (VoiceOver/NVDA) active, navigate to the icon. **Expect**: an accessible name/description is announced, and the tooltip content is read.
7. Enable OS-level "reduce motion", reload, repeat step 2. **Expect**: tooltip appears without a sliding/fading entrance animation (or with a negligible instant appearance).
8. On a touch device (or browser touch emulation), tap the icon. **Expect**: tooltip appears; tapping elsewhere dismisses it. Tap rapidly several times. **Expect**: no stacked tooltips, no crash.

## Scenario 2 — Standup Summary, populated (User Story 2)

1. Ensure at least one task is open (not completed) and complete a different task, adding a note (e.g. "Fixed the login bug").
2. Scroll to the bottom of the page, below the "Completed" section. **Expect**: a "Standup Summary" section appears with a "What I did" list containing the completed task's title and note.
3. **Expect**: a "What's next" list appears below it, containing the still-open task's title only (no note field/placeholder).
4. Complete a task with no note. **Expect**: it appears under "What I did" by title alone — never omitted, never an empty note line.
5. Complete the remaining open task. **Expect**: the Standup Summary updates automatically (no reload, no manual refresh) — "What's next" no longer shows it, "What I did" gains it in the correct chronological (oldest-first) position.
6. Toggle to Focus mode. **Expect**: the Standup Summary section hides/shows exactly like the "Completed" section does (same visibility convention).
7. With a screen reader, navigate into the Standup Summary section. **Expect**: proper heading levels ("Standup Summary" as a section heading, "What I did"/"What's next" as sub-headings) and real list semantics (item count/position announced).
8. Add and complete roughly 15-20 tasks (some with notes, some without), leaving a few open. **Expect**: every completed task appears under "What I did" and every open task appears under "What's next" — no truncation, no "+N more" indicator, no internal scrollbar cutting off items (FR-014).

## Scenario 3 — Standup Summary, empty states (Edge Cases)

1. Start a new day (via the existing "start a new day" action) to clear both completed and open tasks, or use a fresh profile.
2. View the Standup Summary section with zero completed and zero open tasks. **Expect**: calm, non-judgmental placeholder copy — no "you haven't done anything" or similar language — and no empty/broken list markup.
3. Add one open task, complete none of them. **Expect**: only "What's next" renders; "What I did" heading/list is omitted (not shown empty).
4. Complete every open task so none remain open. **Expect**: only "What I did" renders; "What's next" heading/list is omitted (not shown empty, and no implication that something is missing).

## Done criteria

All scenarios above pass visually and via keyboard/screen-reader spot checks, `tsc --noEmit` and `eslint --max-warnings=0` are clean, and no network requests are observed in the browser devtools Network tab while interacting with either feature (confirms FR-009's no-AI/no-network constraint).
