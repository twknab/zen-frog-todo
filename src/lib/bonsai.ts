"use client";

import { useCallback } from "react";
import { usePersistentState } from "./storage";

/**
 * The bonsai's growth is a PURE DERIVED view of data the app already stores
 * (completed-task count + focus-session count) minus idle-time wilt. Nothing
 * here is a stored score — see specs/006-growing-bonsai.
 */

export const BONSAI_STAGES = [
  "seedling",
  "sapling",
  "leafy",
  "flowering",
  "mature",
] as const;

export type BonsaiStage = (typeof BONSAI_STAGES)[number];

// --- Tuning constants (the "soften later" knobs live here) ---------------
// Growth is granular: each completion adds one leaf (a focus session adds
// three), so the tree visibly changes on *every* completion — up to a full,
// bounded canopy. Idle time sheds leaves one at a time.
export const TASK_WEIGHT = 1; // leaves grown per completed task
export const SESSION_WEIGHT = 3; // leaves grown per focus session (> task, FR-003)
export const MAX_LEAVES = 24; // full mature canopy (bounded — FR-005)
export const WILT_FLOOR_LEAVES = 3; // wilt never takes the tree below this (sapling floor)
export const ACTIVE_START = 8; // wilt-active window start (local hour)
export const ACTIVE_END = 17; // wilt-active window end (local hour)
export const IDLE_HOURS_PER_SHED = 3; // active-idle hours per shed of one leaf
// -------------------------------------------------------------------------

// Named stages are milestones over the leaf count — used for the silhouette
// and the screen-reader label, while the leaf count drives fine growth.
function stageIndexFromLeaves(leaves: number): number {
  if (leaves <= 0) return 0; // seedling
  if (leaves <= 6) return 1; // sapling
  if (leaves <= 14) return 2; // leafy
  if (leaves <= MAX_LEAVES - 1) return 3; // flowering
  return 4; // mature (full canopy)
}

const STAGE_LABELS: Record<BonsaiStage, string> = {
  seedling: "Your bonsai is a tiny seedling",
  sapling: "Your bonsai is a young sapling",
  leafy: "Your bonsai is leafing out",
  flowering: "Your bonsai is flowering",
  mature: "Your bonsai is fully grown and lush",
};

export function bonsaiStageLabel(stage: BonsaiStage): string {
  return STAGE_LABELS[stage];
}

/**
 * Sum of clock-hours between `from` and `to` that fall inside the daily
 * [ACTIVE_START, ACTIVE_END] local window. Pure; never negative; robust to
 * multi-day gaps and clock skew (a nonsensical range yields 0).
 */
export function activeIdleHours(from: string | null, to: Date): number {
  if (!from) return 0;
  const start = new Date(from);
  if (Number.isNaN(start.getTime())) return 0;
  if (to.getTime() <= start.getTime()) return 0;

  let total = 0;
  // Walk day by day from the start date to the end date, summing each day's
  // overlap with the active window. Bounded by the real elapsed days.
  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const end = to;
  // Safety cap: never iterate more than ~2 years of days regardless of input.
  for (let guard = 0; guard < 750; guard += 1) {
    if (cursor.getTime() > end.getTime()) break;

    const windowOpen = new Date(cursor);
    windowOpen.setHours(ACTIVE_START, 0, 0, 0);
    const windowClose = new Date(cursor);
    windowClose.setHours(ACTIVE_END, 0, 0, 0);

    // Intersect [max(start, windowOpen), min(end, windowClose)].
    const lo = Math.max(start.getTime(), windowOpen.getTime());
    const hi = Math.min(end.getTime(), windowClose.getTime());
    if (hi > lo) total += (hi - lo) / 3_600_000;

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

export type BonsaiInput = {
  completedCount: number;
  focusSessions: number;
  lastActivityAt: string | null;
  now: Date;
  /** Dev-only: extra idle hours to simulate wilt without waiting. */
  extraIdleHours?: number;
};

export type BonsaiResult = {
  stage: BonsaiStage;
  /** How many leaves to render (0..MAX_LEAVES). */
  leaves: number;
  /** How many blossoms to render (0 until flowering). */
  blossoms: number;
  isWilting: boolean;
};

/**
 * Derive the bonsai's current shape. Grown leaves come only from cumulative
 * completions (each adds one, a focus session three), capped at a full
 * canopy. Idle time within the active window sheds leaves one at a time,
 * never below the sapling floor. Every completion changes the leaf count, so
 * the tree visibly reacts each time (spec US1 scenario 2).
 */
export function deriveBonsai({
  completedCount,
  focusSessions,
  lastActivityAt,
  now,
  extraIdleHours = 0,
}: BonsaiInput): BonsaiResult {
  const grown = Math.min(
    completedCount * TASK_WEIGHT + focusSessions * SESSION_WEIGHT,
    MAX_LEAVES,
  );

  const idleHours = activeIdleHours(lastActivityAt, now) + Math.max(0, extraIdleHours);
  const wiltSteps = Math.floor(idleHours / IDLE_HOURS_PER_SHED);

  // Wilt can't floor above what's actually been grown (so early growth stays
  // granular), and never takes a grown tree below the sapling floor.
  const wiltFloor = Math.min(grown, WILT_FLOOR_LEAVES);
  const leaves = Math.max(wiltFloor, grown - wiltSteps);

  const blossoms = leaves >= 15 ? Math.min(6, leaves - 14) : 0;

  return {
    stage: BONSAI_STAGES[stageIndexFromLeaves(leaves)],
    leaves,
    blossoms,
    isWilting: wiltSteps > 0 && leaves < grown,
  };
}

// --- Persisted activity marker (the only new stored state) ---------------

type BonsaiActivityState = { lastActivityAt: string | null };

/**
 * The one small piece of persisted state this feature adds: the timestamp of
 * the most recent growth-affecting activity, used to compute idle wilt.
 * `focus-stats-v1` stores no timestamps, so this marker is what lets a
 * completed focus session (not just a task) reset the wilt clock.
 */
export function useBonsaiActivity() {
  const [state, setState] = usePersistentState<BonsaiActivityState>(
    "frog-garden:bonsai-v1",
    { lastActivityAt: null },
  );

  // Memoized so it's stable in effect dependency arrays (e.g. FocusTimer's
  // completion effect) and doesn't cause effect churn.
  const markActivity = useCallback(() => {
    setState({ lastActivityAt: new Date().toISOString() });
  }, [setState]);

  return { lastActivityAt: state.lastActivityAt, markActivity };
}
