# Research: Mobile-First UX

**Feature**: `019-mobile-first-ux` | **Date**: 2026-07-25

## Decisions

### 1. Always-visible frog control

**Decision**: Remove hover-only opacity; frog IconButton always visible on incomplete rows (all viewports).

**Rationale**: Spec clarification — no hover dependency. Desktop clutter cost is small; discoverability wins.

**Alternatives considered**: Show only below `md` / `(hover: none)` — more CSS branching for little benefit.

### 2. Pointer-based handle reorder (no new package)

**Decision**: Implement drag-from-handle with Pointer Events (pointerdown/move/up + `setPointerCapture`) and call existing `reorderTasks(draggedId, targetId)`. Do not rely on HTML5 DnD for the primary path.

**Rationale**: HTML5 DnD is unreliable on iOS; `@dnd-kit` would add a dependency for a short list; YAGNI favors a small local handler.

**Alternatives considered**: Up/down buttons (user chose handles); `@dnd-kit` (heavier); keep HTML5 only (fails SC-002).

### 3. Options full-screen below `md`

**Decision**: Below MUI `md` (900px), render Options in `Dialog` with `fullScreen` (mirror `NotepadShell`). At `md+`, keep current `Popover`.

**Rationale**: User asked for full-screen on phone; desktop Popover remains calm and compact.

**Alternatives considered**: Always full-screen (worse desktop); bottom Drawer (also fine, but Notepad already establishes Dialog fullScreen as the app pattern).

### 4. Focus Mode xs order

**Decision**: Change xs areas from `"bonsai" "frog" "timer"` → `"frog" "timer" "bonsai"` (and `"timer" "bonsai"` when no frog card).

**Rationale**: Spec FR-008 / SC-004 — work primary above garden scene. Flow Mode on main already uses frog→timer→bonsai.

### 5. Viewport height + safe area

**Decision**: Main shell `minHeight: "100dvh"` with fallback `"100vh"`; padding includes `env(safe-area-inset-*)`. Add Next.js `viewport` export with `viewportFit: "cover"` when required for insets to apply on iOS.

**Rationale**: Classic `100vh` clips behind iOS toolbars; notches need safe-area.

### 6. Tap targets via theme

**Decision**: Set `MuiIconButton` styleOverrides to enforce minWidth/minHeight 44px (and reasonable padding). Audit small `size="small"` usages that fight the floor.

**Rationale**: One place fixes header + list controls; keeps visuals calm while growing hit area.

### 7. Compact header labels on xs

**Decision**: Mode toggle text “Flow” / “Focus” below `sm` (or `md`); keep full “Flow Mode” / “Focus Mode” on larger widths. Slightly reduce brand frog `fontSize` on xs.

**Rationale**: Addresses header density without inventing a bottom nav (YAGNI).

## Open questions

None blocking. Night Camp explicitly deferred to a future feature on its own branch.
