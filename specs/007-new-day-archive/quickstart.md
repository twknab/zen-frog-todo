# Quickstart / Validation: Start a New Day — Day Archive & JSON Export

Manual validation in the browser preview (project gate — no automated suite). Each scenario maps to acceptance criteria in `spec.md`.

## Prerequisites

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
```

Then run the dev server (via the preview tooling) and open the app. Start each scenario from a known state; the Dev tools (Dev switch) can quickly grow the bonsai / complete focus sessions.

## Scenario 1 — Close a day, verify archive + reset (US1)

1. Complete two tasks, leave one task unfinished, type a reflection line, and grow the bonsai past a shrub (e.g. Dev → "Complete focus session" a few times).
2. On the "Close the day" card, click **Start a new day** → confirm in the dialog.
3. **Expect**: the two completed tasks and the reflection are gone from the live board; the unfinished task remains; the bonsai is a shrub; the Focus card shows **0** sessions; a new archived day now appears in the header export menu. *(FR-001, FR-004–FR-006a, SC-002)*
4. If the unfinished task had been the frog, confirm it is no longer marked the frog. *(US1 scenario 4)*

## Scenario 2 — Cancel does nothing (US1)

1. Click **Start a new day**, then **Not yet** (cancel).
2. **Expect**: no archive entry created; board unchanged. *(FR-002, US1 scenario 3)*

## Scenario 3 — Empty day is not archived (US1)

1. From a fresh board (nothing completed, no reflection, no focus sessions, bonsai a shrub), click **Start a new day** → confirm.
2. **Expect**: board simply resets; **no** new entry in the export menu; no judgmental copy anywhere. *(FR-007, SC-006)*

## Scenario 4 — Export a single archived day (US2)

1. With ≥1 archived day, open the **export menu** in the header.
2. **Expect**: each archived day listed by date; select one → a `frog-garden-<date>.json` file downloads. *(FR-009–FR-011)*
3. Open the file: valid JSON matching `contracts/export-format.md`, faithfully containing that day's completed tasks (with notes), reflection, focus count, and bonsai growth. *(FR-014, SC-004, US2 scenario 3)*
4. **Network check**: with DevTools Network tab open, confirm the download triggers **no** network request. *(FR-013, SC-005)*

## Scenario 5 — Same-date entries are distinguishable (clarification)

1. Close two days on the same calendar date.
2. **Expect**: both appear in the menu, each showing a time (e.g. "Jul 14, 2:30 PM"); their downloaded filenames differ (time suffix). *(FR-010, edge case "two closes in one day")*

## Scenario 6 — Export everything (US3)

1. Choose **Export everything** from the menu.
2. **Expect**: one `frog-garden-all-<date>.json` downloads containing `archive` (all days) and `live` (current state) as distinct top-level keys. *(FR-012, FR-015, US3)*
3. With zero archived days, confirm the dump still downloads with `"archive": []` and a populated `live`. *(US3 scenario 3)*

## Scenario 7 — Empty archive menu state (US2)

1. Before any day is archived, open the export menu.
2. **Expect**: the per-day list is empty or clearly says nothing is archived yet; "Export everything" still works; no error. *(US2 scenario 4)*

## Scenario 8 — Accessibility & reduced motion

1. Operate the **Start a new day** button, confirmation dialog, and export menu **by keyboard only** (Tab/Enter/Esc); confirm focus handling and screen-reader labels. *(FR-017)*
2. Enable `prefers-reduced-motion`; confirm dialog/menu transitions are reduced/instant and nothing breaks. *(FR-018)*
3. Check contrast of the new controls in **both** light and dark themes. *(FR-018)*

## Done when

- All scenarios pass in the browser preview.
- `tsc --noEmit` and `eslint --max-warnings=0` are clean.
- No scenario produced a network request (SC-005).
