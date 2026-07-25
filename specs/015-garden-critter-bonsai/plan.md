# Implementation Plan: Garden Critter & Bonsai Visual Upgrade

**Branch**: `015-garden-critter-bonsai` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-garden-critter-bonsai/spec.md`

## Summary

Upgrade the Bonsai card’s visual garden: larger/wider comedy ground frogs (cap 28), stronger bonsai presence, richer leaves, and **frog-fruit** replacing pink blossom dots at the same blossom unlock pacing. Stay on hand SVG + Framer Motion opacity/appear, deterministic placement, wilt-exempt critters (ground + fruit), Grove contract preserved. No new dependencies unless research rejects that (default: none).

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router

**Primary Dependencies**: React, MUI (re-themed), Framer Motion; existing `src/lib/bonsai.ts`, `src/lib/frogIcon.ts`, `src/components/BonsaiTree.tsx`

**Storage**: Unchanged — localStorage day-cycle bonsai events (no new keys)

**Testing**: `tsc --noEmit` + eslint; manual browser check (incl. reduced-motion + wilt); optional quick logic smoke if easy

**Target Platform**: Modern browsers (desktop + mobile web)

**Project Type**: Single Next.js web app (local-first)

**Performance Goals**: Instant prop-driven SVG scene; no per-render random; no new heavy deps

**Constraints**: Constitution (calm UX, local-first, a11y, reduced-motion, YAGNI); no Math.random at render; decorative critters under `role="img"`; Grove non-breaking

**Scale/Scope**: One primary component (`BonsaiTree`) + small `bonsai.ts` constant/helper tweaks; optional tiny helpers in `frogIcon.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I Calm Technology | PASS | Visual delight without urgency, scores, or clutter sludge |
| II Subtle Gamification | PASS | Organic garden reward only; no counts/scoreboards |
| III Local-First | PASS | No backend/auth/telemetry |
| IV Accessibility | PASS | Decorative under existing img label; reduced-motion on appear |
| V Design System | PASS | Theme-aware fills; no stock Material look; sparse Framer Motion |
| VI YAGNI / Performance | PASS | Hand SVG; no game engine; dial-back knobs instead of over-architecture |
| VII Sound | N/A | Out of scope (no per-frog sound) |

**Post-design re-check**: Still PASS — contracts keep derivation in `bonsai.ts`, render-pure `BonsaiTree`, frog-fruit outside wilt group.

## Project Structure

### Documentation (this feature)

```text
specs/015-garden-critter-bonsai/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── QUESTIONS_FOR_USER.md
├── contracts/
│   └── bonsai-visual-upgrade-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── BonsaiTree.tsx       # primary visual changes
│   └── Grove.tsx            # keep prop contract; inherits blossom→fruit via BonsaiTree
├── lib/
│   ├── bonsai.ts            # MAX_FROGS=28; blossomCountForLeaves unchanged API
│   └── frogIcon.ts          # shared paths; optional fruit color helper / notes
└── app/
    └── page.tsx             # wiring unchanged (still passes blossoms/frogs)
```

**Structure decision**: Single-app layout; no new packages or routes.

## Complexity Tracking

> No constitution violations requiring justification. Complexity stays in SVG composition + constants.

| Item | Why needed | Simpler alternative rejected |
|------|------------|------------------------------|
| Raised MAX_FROGS (28) | Spec comedy crowd | Keep 20 — under-delivers “more frogs” |
| Frog-fruit as scaled frog mark | Brand cohesion | New fruit shapes — extra art language |
| No drawing library | YAGNI / bundle | rough.js etc. — not justified |

## Phase 0 & 1 Outputs

- [research.md](./research.md) — decisions (fruit replace blossoms, dials, no deps)
- [data-model.md](./data-model.md) — entities & constants
- [contracts/bonsai-visual-upgrade-contract.md](./contracts/bonsai-visual-upgrade-contract.md)
- [quickstart.md](./quickstart.md) — manual verification
