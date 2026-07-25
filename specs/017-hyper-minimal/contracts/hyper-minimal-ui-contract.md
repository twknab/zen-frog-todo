# UI Contract: Hyper Minimal

## Storage

| Key | Type | Default |
|---|---|---|
| `frog-garden:hyper-minimal-v1` | boolean | `false` |

## Options surface

| Control | Type | Label | Behavior |
|---|---|---|---|
| Hyper Minimal | Switch | "Hyper Minimal" | Toggles preference; must not close Options popover |

Placement: near Appearance / Dev (after Appearance divider, before or after Dev — calm grouping of density/dev prefs).

## Chrome hidden when ON

- Header: FaFrog brand mark, "Frog Garden" wordmark, tagline
- Card/section title rows (text + decorative icons): Largest Task chip row chrome, Sand Mode, Task list, Focus, Bonsai (+ optional decorative info if treated as chrome-only — info button MAY remain if it is a control), Close the day, Completed, Standup Summary, The Grove heading row icon+title
- Helper / instructional captions: sand rake hint, timer "minutes" caption optional keep if it labels the dial number — prefer hide session-count and phase helper sentences; empty-state prose
- Grove empty instructional copy

## Always visible / functional when ON

- Flow/Focus ToggleButtonGroup (with labels)
- Export, Notepad, Options (aria-labels required)
- Task titles, checkboxes, add/reorder/delete/frog controls
- Focus dial, time digits, Start/Cancel/Break buttons, ambient control
- Sand canvas + reset control
- Bonsai tree visuals (frogs, critters, fruit)
- Grove show/hide control + day/sand interactive surfaces
- Options popover internal labels

## A11y

- No interactive control may become unlabeled when Hyper Minimal is on.
- Decorative chrome removed from the tree (conditional render), not left as unlabeled text noise.
