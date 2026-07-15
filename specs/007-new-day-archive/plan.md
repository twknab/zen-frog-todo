# Implementation Plan: Start a New Day — Day Archive & JSON Export

**Branch**: `007-new-day-archive` | **Date**: 2026-07-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-new-day-archive/spec.md`

## Summary

Add a deliberate **"Start a new day"** ritual and a **JSON export** surface to Frog Garden. Closing a day snapshots that day's record (completed tasks + notes, reflection line, focus-session count, bonsai growth) into a private, on-device **archive**, then resets the live board to a calm fresh start — unfinished tasks carry over (minus their frog badge), while completed tasks, the reflection, the bonsai, and the focus count all reset. A compact **export menu** in the header lets the user download any single archived day, or an "export everything" full dump (all archived days + current live state), as valid JSON via a client-side Blob download — no network, satisfying the constitution's Principle III export MUST.

All persistence stays in browser `localStorage` (proof of concept). Per the user's direction, archive persistence is routed through a **single module boundary** (`src/lib/dayArchive.ts`) so a future iteration can swap the underlying store to a lightweight embedded DB (e.g. SQLite) as a localized change — see [Future considerations](#future-considerations--migration-path). We build only the localStorage version now (YAGNI): no DB code, no adapters, no multi-backend machinery — just one clean seam and a stable, serialization-friendly snapshot shape.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged from the codebase.

**Primary Dependencies**: MUI v9 (zen theme in `src/theme/theme.ts`), Framer Motion v12. No new dependencies (MUI `Dialog` + `Menu` cover the confirmation and export UI).

**Storage**: Browser `localStorage` via the existing `usePersistentState` hook (`src/lib/storage.ts`). Adds one new key `frog-garden:day-archive-v1`. Reads/resets existing keys `frog-garden:tasks-v1`, `:completed-log-v1`, `:bonsai-v3`, `:focus-stats-v1`, `:reflection-v1`.

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint --max-warnings=0` clean, then manual verification against `quickstart.md` scenarios in the browser preview (including `prefers-reduced-motion`).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Close/reset and export are O(n) over small local collections (a day's completions, the archive length). No perceptible latency; export of realistic archives is instant.

**Constraints**: Offline/local-first; no network on any action (SC-005); honor `prefers-reduced-motion`; keyboard + screen-reader operable; calm non-judgmental copy (no scoreboards); WCAG AA in light + dark.

**Scale/Scope**: Single user, single browser profile. Two new components (header export menu, new-day action + dialog), one new lib module (archive repository + new-day orchestration + export/download), small edits to `focusStats.ts`, `tasks.ts`, and `page.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — "Start a new day" is a deliberate, opt-in ritual with a gentle confirmation; copy is journaling/keepsake framed, never "you're behind." Reset is a calm fresh start, not a punitive wipe. |
| II. Subtle Gamification, Not Scoreboards | PASS — no streaks, no "X/Y" scoring. The focus counter becoming **today-only** (clarification) removes an ever-climbing lifetime number, which moves *toward* Principle II, not away. Empty days are never shamed (FR-007, FR-016). |
| III. Local-First & Private | **PASS — actively satisfies a MUST.** Principle III requires JSON export "so the user is never locked in." Archive + export are on-device only; no upload/telemetry (FR-013, SC-005). |
| IV. Accessibility | PASS — button, confirmation dialog, and export menu are keyboard-operable and screen-reader labelled (FR-017); motion respects `prefers-reduced-motion` (FR-018). MUI Dialog/Menu are accessible by default and re-themed. |
| V. Design System Discipline | PASS — reuses the zen-themed card shell and header controls; MUI `Dialog`/`Menu` re-themed to match; Framer Motion (if any) used sparingly with reduced-motion fallback. |
| VI. Simplicity & Performance | PASS (see note) — one orchestration hook + one persistence module + two components. The future-DB **seam is a single module boundary**, not speculative multi-backend scaffolding; the export requirement already forces a serializable shape, so centralizing archive persistence is ordinary hygiene, not YAGNI violation. No DB, no adapters built now. |
| VII. Sound Is Calm & Shared | N/A — no audio. (A future "new day" chime, if ever wanted, must use the shared `AudioContext` per Principle VII — out of scope.) |

No unjustified violations. **Watch item:** the future SQLite migration (below) introduces a "database," which Technology Constraints bans *in v1*. This plan does **not** build it; it only leaves a boundary. Any actual DB adoption is a separate, later decision that must (a) stay on-device to remain within Principle III, and (b) carry its own justification per Governance.

## Project Structure

### Documentation (this feature)

```text
specs/007-new-day-archive/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── archive-repository.md   # the persistence boundary (future-DB seam)
│   └── export-format.md        # stable JSON shape for single-day + full-dump exports
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── dayArchive.ts        # NEW — archive repository (persistence boundary) +
│   │                        #       useNewDay() orchestration + snapshot builder +
│   │                        #       JSON export/download helpers
│   ├── storage.ts           # unchanged — reused localStorage hook
│   ├── tasks.ts             # EDIT — add startNewDay reset (drop completed, keep
│   │                        #        unfinished, clear frog) + clear completed-log
│   ├── bonsai.ts            # EDIT — scope growth to the close-cycle (sum all
│   │                        #        stored events, not calendar-day-filtered);
│   │                        #        wilt unchanged; resetBonsai() already exists
│   │                        #        (FR-006b / research Decision 11)
│   └── focusStats.ts        # EDIT — add resetSessions() (today-only count)
├── components/
│   ├── ExportMenu.tsx       # NEW — header menu: per-day entries + "Export everything"
│   ├── NewDayAction.tsx     # NEW — "Start a new day" button + confirmation Dialog
│   │                        #        (rendered inside the existing "Close the day" card)
│   └── ...                  # existing components unchanged
└── app/
    └── page.tsx             # EDIT — mount ExportMenu in header; NewDayAction in
                             #        reflection card; wire useNewDay() orchestration
```

**Structure Decision**: Single Next.js web app (Option 1, client-only). The feature adds one library module that owns all new persistence + orchestration, and two presentational components that call into it. Existing domain hooks (`useTasks`, `useBonsai`, `useFocusStats`) and the inline reflection state are composed by the new-day orchestrator rather than duplicated.

## Cross-store coordination (key design)

Each live store is its own `usePersistentState` hook/instance. "Start a new day" must gather a snapshot from all of them and then reset them together. Design:

- A new **`useNewDay()`** hook (in `dayArchive.ts`) composes the existing hooks — `useTasks`, `useBonsai`, `useFocusStats` — and a same-key `usePersistentState("frog-garden:reflection-v1")` instance for the reflection. Because `usePersistentState` broadcasts to sibling instances on the same key (existing pattern), the orchestrator's writes propagate to the components that render those stores without prop-drilling.
- `useNewDay()` exposes `startNewDay()`, which: (1) builds the snapshot from current store values; (2) if the day has **any** content, appends it to the archive via the repository (which prunes to the retention bound); (3) resets the stores — tasks (drop completed, keep unfinished, clear frog), completed-log (clear), reflection (clear), bonsai (`resetBonsai()`), focus (`resetSessions()`). If the day is empty, it skips the archive append but still resets (FR-007).
- The archive itself is read/written **only** through the repository functions in `dayArchive.ts` — the components never touch `localStorage` for archive data. This is the future-DB seam.
- **Bonsai scoping (FR-006b / Decision 11):** `deriveBonsai` is changed so growth accumulates since the last close (sum of all stored events) rather than resetting at calendar midnight; `resetBonsai()` inside `startNewDay()` becomes the sole reset. This aligns the bonsai's period with tasks/focus so snapshots stay consistent. Wilt (active-hours) is untouched.

## Complexity Tracking

> No Constitution violations requiring justification. The future-migration seam is explicitly scoped to a single module boundary to stay within Principle VI (YAGNI); it is documented here rather than tracked as a violation.

## Future considerations / migration path

*(Recorded at the user's request; NOT implemented in this feature.)*

- **Intent**: A later iteration will move persisted data out of `localStorage` into a lightweight embedded database (e.g. SQLite via a WASM build, or a Tauri/Electron local file) — while remaining fully on-device to stay within Principle III. The current localStorage approach is a proof of concept.
- **What this plan does to enable it cheaply**:
  - All archive reads/writes go through the **`dayArchive.ts` repository module**; swapping its internals (localStorage → DB) is a localized change that does not ripple into `ExportMenu`, `NewDayAction`, or `page.tsx`.
  - The **snapshot shape is stable and serialization-friendly** (plain JSON: string ids, ISO timestamps, flat arrays of primitives/objects) so each `ArchivedDay` maps cleanly to a DB row and each completed-task to a child row. See `contracts/export-format.md`.
  - The **export format carries a `schemaVersion`**, giving a future importer/migrator a version to branch on.
- **What this plan deliberately does NOT do** (YAGNI / Principle VI): no DB dependency, no ORM, no repository *interface* with multiple implementations, no migration runner, no import path. A single module boundary is the whole seam.
- **Governance note**: adopting a DB later is a separate decision requiring its own spec and a justification against Technology Constraints ("no database in v1").
