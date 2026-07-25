# Research: Hyper Minimal Mode

**Feature**: 017-hyper-minimal | **Date**: 2026-07-25

## Decision 1 — Preference distribution: shared hook, not theme provider

**Decision**: Expose Hyper Minimal via a small `useHyperMinimal` hook backed by `usePersistentState` (same-key broadcast), matching `useGroveVisibility` / notepad — not a ThemeRegistry-style provider.

**Rationale**: Preference is a boolean UI flag, not a theme token. Multiple subscribers already sync through `usePersistentState` without prop drilling or another React context layer.

**Alternatives considered**:
- Context in ThemeRegistry — works but over-couples density to theming.
- Prop drilling from `page.tsx` — rejected; too many leaf components (FocusTimer, Grove, OptionsPanel).

## Decision 2 — Hide mechanism: conditional chrome wrapper

**Decision**: A tiny `Chrome` (or equivalent) helper that returns `null` when Hyper Minimal is on; wrap decorative title rows, taglines, helper captions. Keep functional children outside the wrapper.

**Rationale**: Clean a11y — decorative text leaves the accessibility tree instead of `display: none` leftovers. Layout spacing tied to those stacks disappears with them.

**Alternatives considered**:
- CSS `[data-hyper-minimal] .chrome { display: none }` — faster to blanket-apply but easy to hide the wrong thing and leave SR noise if not also `aria-hidden`.
- Separate "minimal" layout components — YAGNI / duplication.

## Decision 3 — What stays labeled

**Decision**: Keep Flow/Focus toggle text, Options popover labels, and action button labels that *are* the control. Hide section titles, brand, taglines, helper captions, empty instructional prose, timer session-count line, and decorative title-row icons.

**Rationale**: Matches product request + constitution a11y; Options must remain escapable.

## Decision 4 — Scope boundary

**Decision**: No palette/theme work in this feature.

**Rationale**: Explicit product constraint (separate MR for contrast themes).
