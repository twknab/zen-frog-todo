# Tasks: Persisted light/dark color mode toggle

**Note**: Documented retroactively — this feature was already built when this file was created. Tasks below describe what exists, not a forward plan.

## Phase 1: User Story 1 - Switch between light and dark (Priority: P1)

- [x] T001 [US1] `createZenTheme(mode)` in `src/theme/theme.ts` builds a full light or dark MUI theme from one `ColorMode` argument
- [x] T002 [US1] `ColorModeContext` + `useColorMode()` in `src/theme/ThemeRegistry.tsx`, backed by `usePersistentState("frog-garden:color-mode-v1", "dark")`
- [x] T003 [US1] Toggle `IconButton` (sun/moon icon) wired to `useColorMode()` in `src/app/page.tsx`

**Checkpoint**: Toggling switches the whole app; reload restores the last choice; fresh profiles default to dark.

## Notes

- No automated tests (project convention — see `specs/002-focus-log-sand-rocks/plan.md` Technical Context). Verified by manual toggling + reload during the doc audit on 2026-07-02.
- Not yet built: `prefers-color-scheme` detection for the first-ever load (see spec.md Edge Cases).
