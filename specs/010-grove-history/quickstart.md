# Quickstart / Validation: The Grove

Manual validation guide for feature `010-grove-history`. The project's "done" gate is a clean `tsc --noEmit` + `eslint`, plus these browser checks (including a reduced-motion and a keyboard/screen-reader pass).

## Prerequisites

```bash
npm install
npm run dev   # then open the printed http://localhost:<port>
```

To exercise history quickly, either close a few real days (Dev tools → complete focus sessions / tasks, then "Start a new day"), or seed archived days directly in DevTools console:

```js
// Seed two contrasting archived days (a lush day and a shrub day), newest-first.
localStorage.setItem('frog-garden:day-archive-v1', JSON.stringify([
  { id:'day-a', closedAt:new Date().toISOString(), date:new Date().toISOString().slice(0,10),
    completedTasks:[{title:'Ship the report',note:'v2 sent',completedAt:new Date().toISOString()}],
    reflection:'Good momentum today.', focusSessions:3, bonsai:{leaves:18, stage:'flowering'} },
  { id:'day-b', closedAt:new Date(Date.now()-864e5).toISOString(), date:new Date(Date.now()-864e5).toISOString().slice(0,10),
    completedTasks:[], reflection:'', focusSessions:0, bonsai:{leaves:0, stage:'shrub'} },
]));
location.reload();
```

## Scenario 1 — Default collapsed, one action to reveal (US2, FR-011)

1. Load the app with archived days present.
2. **Expect**: the live bonsai/primary board is front-and-center; the Grove section shows only its "The Grove" header with a show control — the ribbon is not expanded.
3. Activate the show control.
4. **Expect**: the ribbon expands smoothly, revealing one small tree per archived day.

## Scenario 2 — Visual history, newest-first, differentiated (US1, FR-002/004, SC-002)

1. With the seed above, view the expanded ribbon.
2. **Expect**: two scenes, newest (lush, flowering) first, then the shrub day; the two are clearly visually different; each has a readable date caption.
3. Add many days (re-run the seed with more entries) and scroll horizontally.
4. **Expect**: smooth horizontal scrolling, no jank, no layout jumps.

## Scenario 3 — Peek at a past day (US3, FR-017)

1. Select the lush day's scene.
2. **Expect**: a read-only recap opens showing the day's date, its reflection ("Good momentum today."), and the completed task ("Ship the report" with note "v2 sent").
3. Select the shrub day (empty).
4. **Expect**: recap shows the date, no reflection block, and a calm neutral "nothing recorded" line — no guilt copy.
5. Dismiss the recap.
6. **Expect**: focus returns to the scene you opened; the ribbon's horizontal scroll position is unchanged.

## Scenario 4 — Hide persists across reloads (US2, FR-010, SC-003)

1. Hide the Grove, then reload the page.
2. **Expect**: the Grove is still collapsed. Show it, reload again.
3. **Expect**: it is still shown. (Preference persisted on-device.)

## Scenario 5 — Empty archive (FR-006)

1. Clear the archive: `localStorage.removeItem('frog-garden:day-archive-v1'); location.reload();`
2. Expand the Grove.
3. **Expect**: calm placeholder copy inviting you to close a day — no error, no empty gap, no shaming language.

## Scenario 6 — Focus Mode (FR-012)

1. Switch to Focus Mode.
2. **Expect**: the Grove section (and its toggle) are absent, like the other secondary sections.

## Scenario 7 — Reduced motion (FR-014, SC-006)

1. Enable OS "Reduce motion" (or emulate in DevTools rendering).
2. Toggle the Grove and open/close a day recap.
3. **Expect**: no animated collapse or dialog transition — changes are instant; horizontal scrolling has no smooth-scroll animation.

## Scenario 8 — Keyboard + screen reader (FR-013, SC-005)

1. Using keyboard only: Tab to the toggle (hear "Show/Hide the Grove", with expanded state), activate it, Tab into the ribbon, move across day scenes, and open a recap with Enter/Space; Esc closes it.
2. **Expect**: every affordance is reachable and operable; each scene is announced as "<date> — <stage description>"; dialog content is announced and focus is managed.

## Definition of done

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] Scenarios 1–8 pass in the browser (light + dark)
- [ ] No network requests occur for any Grove interaction (verify Network tab)
