# Implementation Plan: Empty Frog Helper Copy & Garden Sounds

**Branch**: `020-garden-sounds` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/020-garden-sounds/spec.md`

## Summary

Two tightly scoped UX additions: (1) calm instructional helper under the empty frog card heading so users know how to designate today’s frog; (2) four synthesized Web Audio cues in the shared `sound.ts` module — frog chorus, light ribbit, squirrel chuckle, add-task reward — wired so completion sounds fire only incomplete→complete (frog vs not), squirrel chuckle once on absent→present, and reward on successful add. No theme work, no new mute, no external audio assets.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js (App Router) — unchanged.

**Primary Dependencies**: Web Audio API via existing `src/lib/sound.ts`; no new packages.

**Storage**: N/A — no new keys.

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint --max-warnings=0`, plus manual checks in `quickstart.md`.

**Target Platform**: Modern desktop + mobile browsers, client-rendered.

**Project Type**: Single Next.js web app (local-first).

**Performance Goals**: Sounds must not block UI; short one-shots on the shared `AudioContext`; failures swallowed.

**Constraints**: Principle VII (shared context, calm, synthesized, no unprompted load audio); Principle I copy; YAGNI — no mute invention, no toast for squirrel; Hyper Minimal empty-card hide left as-is.

**Scale/Scope**: Copy in `page.tsx`; four functions in `sound.ts`; wiring in `tasks.ts` + `BonsaiTree.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — helper copy is instructional, non-shaming; sounds short/soft, not alarming. |
| II. Subtle Gamification | PASS — audio rewards organic moments already celebrated visually; no scores/toasts. |
| III. Local-First & Private | PASS — synthesized on-device; no network audio. |
| IV. Accessibility | PASS — copy is readable text; sounds don’t trap focus; no invented reduced-motion mute (visual path unchanged). |
| V. Design System Discipline | PASS — MUI `Typography` only for helper; no palette/theme edits. |
| VI. Simplicity & Performance (YAGNI) | PASS — extend existing sound module; no new deps or mute system. |
| VII. Sound Is Calm & Shared | PASS — shared `AudioContext`, synthesized, gesture-tied like chime/rake, silent failure. |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/020-garden-sounds/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── garden-sounds-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── sound.ts      # EDIT — playFrogChorus, playRibbit, playSquirrelChuckle, playTaskAdded
│   └── tasks.ts      # EDIT — call completion/add sounds on success transitions
├── components/
│   └── BonsaiTree.tsx # EDIT — absent→present squirrel chuckle via effect+ref
└── app/
    └── page.tsx       # EDIT — empty frog helper Typography
```

**Structure Decision**: Keep audio synthesis centralized; keep domain transition detection in `useTasks`; keep squirrel edge detection next to `showSquirrel` derivation.

## Key design decisions (detail in research.md)

- Helper string: “Hover a task, then click its frog to choose today’s frog.”
- Completion/add sounds inside `useTasks` for one wiring path.
- Squirrel: `useEffect` on `showSquirrel` with previous-value ref.
- try/catch (or safe guard) around each new play path.
- No theme/palette/High Contrast/Night Camp work.

## Complexity Tracking

> No Constitution violations requiring justification.
