# Data Model: Empty Frog Helper Copy & Garden Sounds

**Feature**: `020-garden-sounds` | **Date**: 2026-07-25

## Overview

No new persisted entities. This feature is presentation + ephemeral audio cues over existing task/bonsai state.

## Existing entities (read/use only)

### Task / frog designation (`useTasks`)

- `tasks[]`, `frogTaskId: string | null`
- Completion transition: `completed: false → true` triggers growth today; this feature also triggers ribbit/chorus
- Add: non-empty trimmed title creates a task; this feature also triggers reward sound

### Squirrel visibility (derived)

- Input: `frogCount` (bounded frog-friend count on bonsai)
- Rule: `squirrelVisible(frogCount)` in `BonsaiTree` / `SQUIRREL_MIN` in `bonsai.ts`
- Ephemeral UI state for this feature: previous `showSquirrel` boolean in a ref (not persisted)

## Audio (ephemeral)

No storage keys. Sounds are one-shot Web Audio graphs on the shared `AudioContext`.

## Out of scope

- Mute preference persistence
- Toast / encouragement copy entity
- Theme or palette tokens
