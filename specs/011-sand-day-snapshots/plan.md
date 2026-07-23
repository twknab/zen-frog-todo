# Implementation Plan: Sand Day Snapshots

**Branch**: `011-sand-day-snapshots` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-sand-day-snapshots/spec.md`

## Summary

Persist a **compact sand keepsake** whenever Sand Mode is about to be cleared (manual smooth or new-day wipe), associate it with **today** (latest-only overwrite) and with **archived days** (optional additive field), and surface thumbnails in **The Grove** — including a **Today** entry — that open a calm lightbox dialog.

Technical approach: capture from the live canvas via an offscreen downscale to **JPEG (~240px max edge, quality ~0.55)** before wipe; store today's snapshot in a dedicated localStorage key; add optional `sandSnapshot?: string` on `ArchivedDay`; extend Grove + day dialog for thumbnails/lightbox. Explicitly budgeted for `MAX_ARCHIVED_DAYS = 365` under localStorage quota (see [research.md](./research.md)).

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: MUI v9 (zen theme), Framer Motion v12, Canvas 2D API (`drawImage` + `toDataURL('image/jpeg', …)`). No new npm dependencies.

**Storage**: Browser `localStorage` via existing `usePersistentState` / archive repository in `dayArchive.ts`. Adds:
- optional `sandSnapshot?: string` on `ArchivedDay` (archive key unchanged: `frog-garden:day-archive-v1`)
- new live key `frog-garden:sand-today-snapshot-v1` (string | null) for today's latest keepsake

**Testing**: No automated suite required as release gate (project convention). Prefer small pure-helper unit tests for capture sizing / empty-stroke skip if easy. Gate = `tsc --noEmit` + `eslint` clean + manual `quickstart.md` (a11y + reduced-motion).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Capture completes without perceptible hitch before clear (&lt; ~50ms typical); Grove ribbon remains smooth with up to 365 days (thumbnails are tiny JPEG data URLs decoded lazily by the browser).

**Constraints**: Local-first only; ~5–10MB typical localStorage quota — snapshots MUST be compact (FR-007); calm UX; keyboard + SR; `prefers-reduced-motion`; MUI re-themed; YAGNI (no live stroke persistence, no IndexedDB migration).

**Scale/Scope**: Single user, ≤365 archived days + one today slot. Touch points: `sand.ts` / `SandCanvas.tsx`, `dayArchive.ts`, `Grove.tsx` / `GroveDayDialog.tsx` (or small sibling components), `page.tsx` reset path.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — quiet keepsake on clear; no urgency; empty days omit sand without shame copy. |
| II. Subtle Gamification, Not Scoreboards | PASS — visual memory only; no rake counts, streaks, or comparison (FR-014). |
| III. Local-First & Private | PASS — localStorage only; no network/telemetry; export naturally includes optional field. |
| IV. Accessibility | PASS — date-referenced alt/names, keyboard open, Escape dismiss, reduced-motion dialog (FR-010). |
| V. Design System Discipline | PASS — reuse themed Grove + Dialog patterns (`NewDayAction` / `GroveDayDialog`); no stock Material look; image shows captured rake art only. |
| VI. Simplicity & Performance | PASS — additive optional field + one today key; canvas downscale JPEG; no IndexedDB, no stroke persistence, no Sand Mode redesign. |
| VII. Sound Is Calm & Shared | N/A — no new audio. |

No violations. **Watch item**: localStorage quota — mitigated by Decision 1 in research.md (downscaled JPEG), not deferred.

## Project Structure

### Documentation (this feature)

```text
specs/011-sand-day-snapshots/
├── plan.md
├── research.md          # MUST document localStorage quota solution
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sand-snapshot-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks — not created here
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── sand.ts              # EDIT — today's snapshot store + capture helpers;
│   │                        #       reset path coordinates capture-before-clear
│   ├── dayArchive.ts        # EDIT — optional sandSnapshot on ArchivedDay;
│   │                        #       wire into startNewDay / rollover; widen
│   │                        #       empty-day guard when sand keepsake exists
│   └── storage.ts           # unchanged (reuse usePersistentState)
├── components/
│   ├── SandCanvas.tsx       # EDIT — expose capture-before-clear (has strokes?
│   │                        #       + downscale toDataURL) when reset token bumps
│   ├── Grove.tsx            # EDIT — Today entry + sand thumbnails in ribbon /
│   │                        #       day scenes; open sand lightbox
│   ├── GroveDayDialog.tsx   # EDIT — optional sand thumbnail → lightbox (or
│   │                        #       sibling SandSnapshotLightbox.tsx)
│   └── SandSnapshotLightbox.tsx  # NEW (optional split) — themed Dialog for
│                                 # large view; Escape + reduced-motion
└── app/
    └── page.tsx             # EDIT only if reset button must call a capture-
                             # aware API instead of bare resetSand()
```

**Structure Decision**: Single Next.js app. Capture logic lives next to sand (`sand.ts` + `SandCanvas`); persistence extends the existing archive repository; browse extends The Grove (one history surface). Prefer a small dedicated lightbox component if `GroveDayDialog` would become crowded.

## Key design decisions (see research.md for rationale)

- **Downscale + JPEG** before persist (max edge 240px, quality 0.55) — fits ~365 days under quota.
- **Sync capture registry** in `sand.ts` (SandCanvas registers peek/wipe): mid-day `resetSand()` captures then wipes; archive uses `takeSandSnapshotForArchive()` then `wipeSandCanvas()` without re-saving (no effect-ordering race).
- **Today key** separate from archive; on new day, attach to `ArchivedDay.sandSnapshot` then clear today key.
- **Fresh capture preferred** at archive time if canvas still has strokes; else use today's stored snapshot.
- **Grove** shows a Today chip/scene when today's snapshot exists; archived days show sand thumb when `sandSnapshot` present; click opens lightbox.
- **Fail-open**: capture/storage errors never block clear or new-day.

## Complexity Tracking

> No constitution violations requiring justification.
