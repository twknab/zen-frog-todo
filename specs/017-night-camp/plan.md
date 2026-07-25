# Implementation Plan: Night Camp & Work Window

**Branch**: `017-night-camp` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-night-camp/spec.md`

## Summary

Ship the constitution’s **Day Garden / Night Camp** dual-world model: configurable work window (AM/PM in Options, default 8–17 local), effective-realm derivation (clock + Dev Force night/day/Follow clock), bonsai sleep + separate night ledger after hours, Night Camp scene (fireflies / campfire / stars / moon / frogs), dual summaries + Grove archive fields, and a Dev harness where Force night/day makes existing Complete focus / Simulate idle / Reset behave correctly for both worlds.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router

**Primary Dependencies**: React, MUI (re-themed), Framer Motion; extend `gardenRealm.ts`, `bonsai.ts`, `dayArchive.ts`, `OptionsPanel.tsx`, `BonsaiTree` / new Night Camp scene layer, `page.tsx` Dev strip (partially landed)

**Storage**: localStorage via `usePersistentState` — work window, realm override (Dev), night ledger events; extend day-archive snapshot schema additively

**Testing**: `tsc --noEmit` + eslint; manual Dev Force night/day matrix (SC-009); reduced-motion + contrast under dim

**Target Platform**: Modern browsers (desktop + mobile web)

**Project Type**: Single Next.js web app (local-first)

**Performance Goals**: Lightweight SVG/CSS atmosphere; no per-frame randomness; night ornaments opacity/appear only

**Constraints**: Constitution v2.1.0 Product Model; never force Appearance; never block UI; wilt only in day effective realm; YAGNI (no fake system clock UI beyond Force realm)

**Scale/Scope**: Work-window Options + realm brain + growth routing split + Night Camp visuals + archive/summary differentiation + Dev harness completion (controls partially present)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Model | Status | Notes |
|-------------------|--------|-------|
| I Calm Technology | PASS | Night vibes up; no shame for late work; no lockout |
| II Subtle Gamification | PASS | Two organic worlds; scene poetry not scoreboards; wilt day-only |
| III Local-First | PASS | All ledgers/settings on-device; export fields additive |
| IV Accessibility | PASS | AM/PM labelled; dim preserves AA; reduced-motion on ornaments |
| V Design System | PASS | Overlay/dim only — never force light↔dark Appearance |
| VI YAGNI / Performance | PASS | Reuse bonsai/archive patterns; Force realm not a full time machine |
| VII Sound | N/A | Out of scope (living soundscape is a separate issue) |
| Product Model Day/Night | PASS | Spec mirrors constitution; Dev Mode realm testing subsection |

**Post-design re-check**: Still PASS — contracts keep one `resolveRealm` brain; Dev Force shares production routing; Night Camp is atmosphere + ledger, not a second scoreboard.

## Project Structure

### Documentation (this feature)

```text
specs/017-night-camp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── garden-realm-contract.md
│   └── night-camp-dev-harness-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── gardenRealm.ts       # EXISTS — work window + resolveRealm + override
│   ├── workWindow.ts        # NEW or fold into gardenRealm — persist + AM/PM helpers
│   ├── nightCamp.ts         # NEW — night ledger, stage derivation, frog-at-camp
│   ├── bonsai.ts            # Wilt uses configured work window; respect effective realm
│   └── dayArchive.ts        # Snapshot night camp summary on Start a new day
├── components/
│   ├── OptionsPanel.tsx     # Work hours AM/PM
│   ├── NightCampScene.tsx   # NEW — fireflies, fire, stars, moon, night frogs
│   ├── GardenBackdrop.tsx   # Night dim/overlay when effective realm = night
│   ├── BonsaiTree.tsx       # Sleeping presentation when night (optional soft rest)
│   └── Grove.tsx            # Show archived Night Camp beat
└── app/
    └── page.tsx             # Growth routing by realm; Dev strip (Force* already stubbed)
```

**Structure decision**: Single-app; extend existing Options / bonsai / archive seams; no new routes.

## Complexity Tracking

> No constitution violations. Complexity is justified by dual ledgers + Dev parity.

| Item | Why needed | Simpler alternative rejected |
|------|------------|------------------------------|
| Separate night ledger | Product lock — bonsai sleeps | Keep growing bonsai at night — violates model |
| Dev Force realm | Testability (SC-009) | Only edit work hours — too slow / error-prone |
| Night Camp SVG scene | Visual dual-world | Text-only night stage — fails “two worlds” |
| AM/PM Options UI | Human-friendly hours | 24h-only selects — fights stated UX |

## Phase 0 & 1 Outputs

- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/garden-realm-contract.md](./contracts/garden-realm-contract.md)
- [contracts/night-camp-dev-harness-contract.md](./contracts/night-camp-dev-harness-contract.md)
- [quickstart.md](./quickstart.md)
