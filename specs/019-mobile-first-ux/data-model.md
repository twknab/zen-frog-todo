# Data Model: Mobile-First UX

**Feature**: `019-mobile-first-ux` | **Date**: 2026-07-25

This feature does **not** introduce new persisted entities or storage keys.

## Existing entities (unchanged shape)

### Task

- **id**, **title**, **completed**, list **order** (array order in `frog-garden:tasks-v1`)
- Frog designation: existing `frogTaskId` (or equivalent) in tasks store — unchanged semantics

### Options preferences

- Palette, appearance, high contrast, hyper-minimal / density — existing keys only
- Presentation shell (Popover vs full-screen Dialog) is **ephemeral UI state**, not persisted

## Ephemeral UI state (session)

| State | Purpose |
|---|---|
| Options open/closed | Unchanged boolean / anchor |
| Viewport tier (derived) | `breakpoints.down('md')` drives Options shell + any compact chrome |
| Active reorder drag | `draggedId` + optional over-target id during pointer drag |

## Invariants

- Reorder only mutates task array order via existing `reorderTasks`
- Locked Focus list: no reorder mutations
- Frog designate still single-frog semantics
