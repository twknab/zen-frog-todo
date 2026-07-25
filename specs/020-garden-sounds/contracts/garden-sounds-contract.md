# Contract: Garden Sounds & Empty Frog Helper

**Feature**: `020-garden-sounds`

## Empty frog helper

When `frogTask` is null and the frog card is rendered:

- Heading remains: `No frog chosen yet`
- Supporting line MUST appear beneath it with calm instructional copy equivalent to:
  `Hover a task, then click its frog to choose today’s frog.`
- Use secondary/body typography (not a second hero heading); no shame language.

When Hyper Minimal hides the empty frog card, this contract does not require showing the helper elsewhere.

## Sound exports (`src/lib/sound.ts`)

| Export | Trigger contract | Character |
|---|---|---|
| `playFrogChorus()` | Frog task incomplete→complete | Short multi-ribbit cascade; calm; ≤ ~1s perceived |
| `playRibbit()` | Non-frog incomplete→complete | Single lighter ribbit |
| `playSquirrelChuckle()` | Squirrel visibility false→true | Soft chuckle; not a ribbit |
| `playTaskAdded()` | Successful `addTask` | Short reward; distinct from ribbits and `playChime` |

Shared rules:

- Reuse single `AudioContext` (via existing getter)
- Must not throw to callers (swallow errors)
- Must not create a new `AudioContext` per call
- No external audio URLs/files

## Wiring contract

- `useTasks.toggleTaskCompleted`: if transitioning to completed, call `playFrogChorus` when `id === frogTaskId`, else `playRibbit`. Never on uncomplete.
- `useTasks.addTask`: after accepting trimmed non-empty title, call `playTaskAdded`.
- `BonsaiTree`: on `showSquirrel` rising edge only, call `playSquirrelChuckle`.
- Visual `celebrate(...)` paths remain unchanged.
