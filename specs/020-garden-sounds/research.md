# Research: Empty Frog Helper Copy & Garden Sounds

**Feature**: `020-garden-sounds` | **Date**: 2026-07-25

## Decision 1 — Helper copy placement and wording

**Decision**: Add one short supporting `Typography` line beneath the existing “No frog chosen yet” heading in `src/app/page.tsx` empty frog branch. Wording: “Hover a task, then click its frog to choose today’s frog.”

**Rationale**: Matches the brief’s instructional intent; stays calm and short (Principle I); only appears when the empty card is already shown (Hyper Minimal may hide the card — no extra HM logic required).

**Alternatives considered**: Tooltip on frog buttons (more discoverability surface, more scope); modal/coachmark (too heavy, YAGNI).

## Decision 2 — Sound API surface

**Decision**: Extend `src/lib/sound.ts` with four exports sharing `getAudioContext()`:

| Function | Role |
|---|---|
| `playFrogChorus()` | Short cascade of soft ribbits for frog completion |
| `playRibbit()` | Single light ribbit for non-frog completion |
| `playSquirrelChuckle()` | Soft chuckle for squirrel absent→present |
| `playTaskAdded()` | Short non-ribbit reward pluck/pad for successful add |

Each wrapped in try/catch (or equivalent) so failures never throw to UI.

**Rationale**: Matches existing `playChime` / `playRake` pattern and Principle VII (shared context, synthesized, calm).

**Alternatives considered**: External MP3/OGG assets (offline/licensing cost — rejected); separate AudioContext per sound (known rake-lag regression — prohibited).

## Decision 3 — Completion / add wiring location

**Decision**: Play completion and add sounds inside `useTasks` (`toggleTaskCompleted` when `nowCompleted`, and `addTask` after a successful trim), using `id === state.frogTaskId` for chorus vs ribbit.

**Rationale**: Single source of truth for incomplete→complete and frog identity; covers frog card checkbox and `TaskListCard` without duplicating call sites. UI celebrations stay at call sites (FR-011 additive).

**Alternatives considered**: Wire only in page/`TaskListCard` (easy to miss a path); custom event bus (overkill).

## Decision 4 — Squirrel transition effect

**Decision**: In `BonsaiTree`, keep deriving `showSquirrel` from `squirrelVisible(frogCount)`. Add a `useEffect` + `useRef` for previous visibility; call `playSquirrelChuckle()` only on `false → true`.

**Rationale**: Spec requires once per absent→present, not every render; seeded visibility already avoids flicker.

**Alternatives considered**: Play inside the AnimatePresence mount callback (harder to reason about Strict Mode double-mount); play from bonsai growth hook (farther from visibility truth).

## Decision 5 — Mute / reduced-motion

**Decision**: No new mute toggle. Do not gate sounds on `prefers-reduced-motion`. Ambient remains independently toggled in FocusTimer.

**Rationale**: Brief and constitution: match chime/rake defaults; don’t invent mute; reduced-motion is a visual a11y preference.

## Decision 6 — No squirrel toast

**Decision**: Sound-only for squirrel appearance.

**Rationale**: Brief prefers no clutter; any encouragement copy risks scoreboard/shame tone (Principles I–II).
