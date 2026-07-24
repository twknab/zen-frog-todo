# Tasks: Full-Screen Frog Celebration & Frog Favicon

**Input**: Design documents from `/specs/013-frog-celebration-favicon/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/celebration-frog-kind-contract.md, quickstart.md

**Tests**: Not included — this project has no automated test suite (established convention, see plan.md's Testing field). The release gate is `tsc --noEmit` + `eslint --max-warnings=0` plus manual verification against `quickstart.md`.

**Organization**: Tasks are grouped by user story. Unlike the prior feature in this repo, User Story 1 and User Story 2 touch **entirely disjoint files** (`Celebration.tsx` vs. `app/icon.tsx`/`favicon.ico`), so they're genuinely parallelizable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Maps the task to spec.md's US1 (celebration) or US2 (favicon)
- File paths are exact and relative to the repository root

## Phase 1: Setup

- [X] T001 Confirm the baseline is clean before starting: run `npx tsc --noEmit` and `npx eslint --max-warnings=0` at the repo root. No files are changed by this task — it's a checkpoint so any pre-existing failures aren't misattributed to this feature.

---

## Phase 2: Foundational

**None required.** Both user stories are fully independent — no shared new infrastructure to stand up first. Proceed straight to the user story phases.

---

## Phase 3: User Story 1 - A bigger celebration for the day's biggest task (Priority: P1) 🎯 MVP

**Goal**: The frog-task completion celebration fills the screen (contained, not distorted); regular task celebrations and the reduced-motion fallback are unchanged.

**Independent Test**: Designate and complete a frog task; confirm the celebration fills the screen. Complete a regular task; confirm its celebration is unchanged.

### Implementation for User Story 1

- [X] T002 [US1] In `src/components/Celebration.tsx`, edit `LottieBurst` so that when `item.kind === "frog"`, it renders inside a `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center` wrapper (instead of the current `position: absolute; left/top: item.x/item.y` centered-on-click-point wrapper), with the Lottie animation sized to fill as much of the viewport as possible without distortion or cropping (relying on Lottie's default `preserveAspectRatio="xMidYMid meet"` — e.g. a square inner element sized `min(90vw, 90vh)`). The `"task"` kind branch, `SIZES.task`, `confettiData` usage, and the `SoftRing` reduced-motion component MUST remain completely unchanged — per `contracts/celebration-frog-kind-contract.md`.
- [X] T003 [US1] Manually verify User Story 1 against `quickstart.md`'s Scenario 1 (full-screen frog celebration at desktop and mobile widths, self-clearing, page stays interactive, regular task celebration unchanged, reduced-motion still shows the existing small `SoftRing`) in the running dev server (`npm run dev`).

**Checkpoint**: User Story 1 is fully functional and independently testable/shippable at this point.

---

## Phase 4: User Story 2 - See a frog in the browser tab (Priority: P2)

**Goal**: The app's favicon is a consistent frog mark, matching the same icon used everywhere else in the app.

**Independent Test**: Load the app and check the browser tab icon; confirm it's a frog mark, not the old icon.

### Implementation for User Story 2

**Amended during implementation** (see spec.md's Amendment section): the literal 🐸 emoji rendered as a fully blank PNG in this environment (`ImageResponse`'s default emoji rendering fetches from `cdn.jsdelivr.net`, which this environment's network policy blocks — confirmed by direct testing, not assumed). Per user direction, switched to `react-icons`' `GiFrog` (Game Icons, CC BY 3.0) as one consistent, locally-bundled frog mark reused everywhere the app previously used the emoji.

- [X] T004 [P] [US2] Delete `src/app/favicon.ico` — superseded by the generated icon in T005, and keeping both risks browser-inconsistent icon selection (FR-007).
- [X] T005 [P] [US2] Add `react-icons` as a dependency (`npm install react-icons`, synced to both `package-lock.json` and `yarn.lock` since both are tracked in this repo). Create `src/app/icon.tsx`: default-export a function returning `new ImageResponse(...)` rendering a frog icon's SVG path data inline (Satori doesn't reliably render react-icons' component tree directly, so the path is embedded as a literal `<svg><path d="..."/></svg>`, colored `#6B8F71` to match `zen.moss`/`primary.main`), with `export const size = { width: 32, height: 32 }` and `export const contentType = "image/png"`, per Next.js's documented `icon.tsx` file convention. Includes a source-attribution comment.
- [X] T005a [US2] Replace the remaining two 🐸 emoji usages with `<Box component={<icon> } sx={{ color: "primary.main", ... }} />`, for one consistent mark across the app: `src/app/page.tsx` (the "Largest Task" header icon) and `src/components/TaskListCard.tsx` (the per-task "make this the frog" button icon).
- [X] T006 [US2] Manually verify User Story 2: tab icon shows the frog mark (confirmed via direct pixel inspection of the generated PNG — non-blank, correct shape/color), `<head>` references the generated icon route rather than a static favicon.ico, and the same mark renders correctly (and matches the theme's primary green) at both other call sites, with zero console/page errors, in the running dev server.

**Checkpoint**: User Stories 1 AND 2 both work independently at this point.

### Amendment 2 tasks (post-implementation follow-up, see spec.md's Amendment 2)

- [X] T010 [US2] Compare `GiFrog` against `FaFrog` (Font Awesome, `react-icons/fa6`) and two other candidates at true 16px rendering (the realistic size of a browser tab icon) via a rendered HTML comparison, since "presents better at low resolution" needs an actual side-by-side, not a guess. `GiFrog` became an indistinct blob; `FaFrog` stayed clearly legible.
- [X] T011 [US2] Swap the frog mark from `GiFrog` to `FaFrog` in `src/app/icon.tsx` (favicon), `src/app/page.tsx` ("Largest Task" header), and `src/components/TaskListCard.tsx` (per-task button), updating the attribution comment to Font Awesome (CC BY 4.0).
- [X] T012 [US2] Replace the "Frog Garden" title's `SelfImprovementOutlinedIcon` (`src/app/page.tsx`, an unrelated meditating-person icon) with the same `FaFrog` mark, removing the now-unused MUI icon import.
- [X] T013 [US2] Investigate whether `BonsaiTree.tsx`'s reward-frog critters should also switch to the icon-library mark. Confirmed (via the same low-resolution comparison, plus a screenshot of the actual multi-frog rendering) that they intentionally use a distinct, simpler primitive-shape design purpose-built for rendering up to 20 critters simultaneously at a scale well below 16px — switching them to an icon-library asset would look worse there, not better. Left unchanged; documented the reasoning in spec.md rather than silently doing nothing.
- [X] T014 Re-run `tsc --noEmit` + `eslint --max-warnings=0` and a full end-to-end smoke test (frog designation → completion → full-screen celebration, header, favicon) after the swap — all clean, zero console errors.

### Amendment 3 tasks (post-implementation follow-up, see spec.md's Amendment 3)

- [X] T015 Extract the Font Awesome frog path data to `src/lib/frogIcon.ts` (`FROG_ICON_PATH`, `FROG_ICON_VIEWBOX`), and update `src/app/icon.tsx` to import from it instead of holding its own copy — a straight refactor, no behavior change, done ahead of a second raw-path consumer.
- [X] T016 In `src/components/BonsaiTree.tsx`, replace the reward-frog critters' ellipse-based rendering with `FROG_ICON_PATH`, drawn as a `<path>` with a local `translate`/`scale` transform sized to the critters' previous footprint, matching the file's existing hand-authored-SVG-primitives style. The squirrel critter is unaffected.
- [X] T017 Manually verify at both the single-frog baseline and a multi-frog crowd (~9 critters via repeated "Complete focus session" dev-mode clicks) that the silhouette reads clearly at critter scale — it does, better than Amendment 2's stated concern anticipated (that concern held for `GiFrog`'s detail level, not `FaFrog`'s simpler one). Re-ran `tsc --noEmit` + `eslint --max-warnings=0` and the full end-to-end smoke test — all clean, zero console errors.

### Amendment 4a tasks — squirrel icon (own commit, see spec.md's Amendment 4)

- [X] T018 Compare Game Icons' and GitHub Octicons' squirrel icons against the `FaFrog` reference at true 16px (Font Awesome has no squirrel). Octicons' bold solid-fill squirrel stayed legible; Game Icons' lost definition, same pattern as the frog comparison. Added `SQUIRREL_ICON_PATH`/`SQUIRREL_ICON_VIEWBOX` (Octicons, MIT) to `src/lib/frogIcon.ts`.
- [X] T019 In `src/components/BonsaiTree.tsx`, replace the squirrel's hand-drawn ellipse/circle/path shapes with `SQUIRREL_ICON_PATH`, sized to its previous footprint via a local transform; removed the now-unused `eyeFill`/`squirrelTail` theme-color variables.
- [X] T020 Manually verify by triggering the squirrel's seeded-probability appearance (repeated dev-mode "Complete focus session" clicks past `SQUIRREL_MIN`) and screenshotting it — the curled bushy tail, its key identifying feature, reads clearly. `tsc --noEmit` + `eslint --max-warnings=0` clean, zero console errors.
- [X] T021 Commit this squirrel-icon change on its own, separate from the frog critter up-scaling in Amendment 4b, so either can be reverted independently.

### Amendment 4b tasks — 2x frog scale (own commit, see spec.md's Amendment 4)

- [X] T022 In `src/components/BonsaiTree.tsx`, double every scale factor in `FROG_POSITIONS`: the baseline frog's scale (1 → 2) and the per-frog depth-variation range (0.68..1.18 → 1.36..2.36), updating the accompanying comment to match.
- [X] T023 Manually verify at both the single-frog baseline and a multi-frog crowd via screenshot — noticeably larger at both; documented the expected tradeoff that critters overlap more at high crowd density on the same fixed-width ground band. `tsc --noEmit` + `eslint --max-warnings=0` clean, full end-to-end smoke test zero console errors.
- [X] T024 Commit this scale change separately from T018-T021's squirrel-icon change, then push both commits.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T007 Run `npx tsc --noEmit` and `npx eslint --max-warnings=0` at the repo root across the full diff (both stories) and fix any reported issues.
- [X] T008 Check the enlarged frog celebration against the constitution's Calm Technology (I) and Subtle Gamification (II) principles per `AGENTS.md`'s requirement that any visual-design-touching change be checked before being marked done — confirm it reads as a bigger positive moment for the app's one designated task, not an urgency/attention-grabbing pattern, and confirm `prefers-reduced-motion` is still fully honored (T002's constraint that `SoftRing` stays untouched).
- [X] T009 Run the full `quickstart.md` end-to-end (both scenarios) once more in the browser preview as the final "Done" gate.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — run first.
- **Foundational (Phase 2)**: None — no blocking prerequisites for this feature.
- **User Story 1 (Phase 3)**: Depends on Setup only. No dependency on User Story 2.
- **User Story 2 (Phase 4)**: Depends on Setup only. No dependency on User Story 1.
- **Polish (Phase 5)**: Depends on both user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)** and **User Story 2 (P2)** are fully independent, touching disjoint files (`src/components/Celebration.tsx` vs. `src/app/icon.tsx`/`src/app/favicon.ico`) — implement, test, and ship in either order or genuinely in parallel.

### Within Each User Story

- **US1**: T002 → T003 (manual verification).
- **US2**: T004 and T005 can run in parallel (different files: deleting the old icon vs. adding the new one) → T006 (manual verification, needs both done first to see the final state cleanly).

### Parallel Opportunities

- T002 (US1) and T004/T005 (US2) touch entirely different files — a second contributor could work User Story 2 while User Story 1 is in progress, with zero merge-conflict risk.
- T004 and T005 within US2 can run in parallel with each other too.
- T007-T009 (Polish) should run only after both stories are complete.

---

## Parallel Example: Two contributors

```bash
# Contributor A — User Story 1:
Task: "Make the frog-kind celebration full-screen in src/components/Celebration.tsx (T002)"

# Contributor B — User Story 2 (fully disjoint files):
Task: "Delete src/app/favicon.ico (T004)"
Task: "Create src/app/icon.tsx with the frog emoji via ImageResponse (T005)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 3: User Story 1 (T002-T003).
3. **STOP and VALIDATE**: confirm Scenario 1 in `quickstart.md` passes.
4. Ship — this alone delivers the more-requested, more-visible of the two fixes.

### Incremental Delivery

1. Setup → done.
2. Add User Story 1 → validate independently → ship (MVP).
3. Add User Story 2 → validate independently → ship.
4. Polish (T007-T009) once both are in.

---

## Notes

- No test tasks are included per this project's established no-automated-suite convention; `T003`/`T006`/`T009` are the manual-verification equivalents, tied to `quickstart.md`.
- Both stories are genuinely independent with zero file overlap — a first for this repo's spec-kit features so far, worth taking advantage of if working with a collaborator.
- Commit after each task or logical group (e.g., after T003 for US1, after T006 for US2).
