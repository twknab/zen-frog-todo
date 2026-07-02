# Tasks: Flow Mode layout — readable task list

**Input**: `specs/004-dashboard-layout-readability/spec.md`

**Tests**: None (no automated suite; verified via `tsc`/`eslint` + browser preview, per project convention).

## Phase 1: User Story 1 - Readable task list (Priority: P1)

- [ ] T001 [US1] Rework the Flow Mode `gridTemplateAreas`/`gridTemplateColumns` in `src/app/page.tsx` so the Focus (timer) card sits beneath the frog card (left column stack) and the task list spans full width on its own row; keep Sand Mode alongside the frog/timer stack, and reflection full width below
- [ ] T002 [US1] Update the mobile (`xs`) area order so the timer is directly beneath the frog (e.g. `frog → timer → tasks → garden → reflection`)
- [ ] T003 [US1] Verify: `tsc --noEmit` + `eslint` clean; in the browser at 1280px confirm full task titles + timer-beneath-frog; confirm Focus Mode still shows frog+timer side-by-side and all task interactions still work

## Notes

- Layout-only change; no component internals touched.
- Do not commit (per user instruction for this pass).
