# Analysis Report: Sand Day Snapshots (011)

**Date**: 2026-07-23  
**Artifacts**: spec.md, plan.md, tasks.md (+ research/data-model/contracts)

## Findings

### C1 — CRITICAL: Async capture vs archive ordering

**Evidence**: Plan/tasks say SandCanvas captures in a `useEffect` on `sandResetToken`. `useNewDay` builds `ArchivedDay` then calls `resetSand()`. Effects run after paint, so archive is built **before** any fresh capture lands in the today key.

**Impact**: FR-004 (“fresh capture if canvas still has strokes”) fails when the user starts a new day without mid-day smoothing first — sand keepsake is lost.

**Remediation** (apply before implement): Introduce a sync **capture/wipe registry** in `src/lib/sand.ts` that `SandCanvas` registers on mount:

- Mid-day `resetSand()`: capture-if-strokes → write today → wipe (can stay effect-driven or sync via registry).
- `useNewDay` / rollover: `takeSandSnapshotForArchive()` sync (canvas capture if strokes, else today key) → attach to archive → `clearTodaySandSnapshot()` → `wipeSandCanvas()` **without** re-saving.

Update research Decision 2, plan, T005–T007 accordingly.

### H1 — HIGH: Rollover + in-session date change

**Evidence**: Decision 5 notes today-key attach on rollover; T007 covers it. In-session midnight without reload is rare; wipe-without-save must still clear canvas if mounted.

**Remediation**: T007 should call the same wipe-without-save after attaching today key (not `resetSand()` alone).

### H2 — HIGH: T006 underspecified race

**Evidence**: T006 says “ensure resetSand runs such that capture lands before archive read” without naming the sync API.

**Remediation**: Rewrite T006/T007 to require `takeSandSnapshotForArchive` + `wipeSandCanvas` (no re-capture).

### M1 — MEDIUM: JPEG background color token

**Evidence**: Decision 7 says match `action.hover`; theme may differ light/dark. Snapshot is a keepsake — pick a stable muted sand hex (e.g. from light theme hover) for consistent archive appearance across theme toggles.

**Remediation**: Document fixed composite background hex in sand.ts constants (acceptable; not CRITICAL).

### M2 — MEDIUM: Grove “Today” vs empty archive empty-state

**Evidence**: When archive is empty but Today has a snapshot, empty-state copy must not replace the Today entry.

**Remediation**: Note in T009 — show Today even when archive length is 0; empty-state only when archive empty AND no today snapshot.

### L1 — LOW: Export size

Optional field increases export JSON size; acceptable and already assumed.

## Coverage map (abbreviated)

| Requirement | tasks |
|---|---|
| FR-001–003 capture/overwrite/skip empty | T002, T005 |
| FR-004 archive attach | T006, T007 (+ C1 fix) |
| FR-005 optional field | T004, T013 |
| FR-006–007 local + compact | T002, T012 |
| FR-008–010 Grove/lightbox/a11y | T008–T011 |
| FR-011 fail-open | T003, T005, T013 |
| FR-012–014 theme/scope/calm | T008, T011 |

## Constitution

No principle conflicts. Quota approach satisfies III + VI.

## Verdict

**Not ready to implement until C1/H1/H2 remediated** in research/plan/tasks. Then proceed.
