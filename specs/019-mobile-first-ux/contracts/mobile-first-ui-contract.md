# UI Contract: Mobile-First UX

**Feature**: `019-mobile-first-ux`

## Task row (Flow Mode list)

| Control | Visibility | Interaction |
|---|---|---|
| Drag handle | Always visible when list unlocked | Pointer drag reorders; inert when locked |
| Frog designate | Always visible on incomplete rows | Click/tap sets frog; accessible name includes task title |
| Delete | Existing incomplete-only rules | Unchanged confirm flow |
| Checkbox / title | Unchanged | Unchanged |

## Options shell

| Viewport | Surface |
|---|---|
| `< md` | `Dialog` `fullScreen`, scrollable body, explicit close, Escape dismisses |
| `≥ md` | Existing `Popover` anchored to Options button |

Settings sections and persistence semantics unchanged — only the shell changes by viewport.

## Focus Mode stacking (`xs` / below `md`)

| Frog card | Vertical order |
|---|---|
| Shown | frog → timer → bonsai |
| Hidden | timer → bonsai |

`md+` layouts unchanged.

## Shell

- Main: stable mobile height (`dvh` + `vh` fallback) and safe-area padding
- Primary IconButtons: ≥ 44×44 CSS px hit target
- Header below `sm`/`md`: compact mode labels; no horizontal document scroll at 320px
