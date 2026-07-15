"use client";

import { useCallback } from "react";
import { usePersistentState } from "./storage";

/**
 * The bonsai is a DAILY momentum indicator: it starts each day as a small shrub
 * and grows with the day's work (a completed task = 1 leaf, a focus session = 3),
 * up to a bounded full canopy. Idle time within the active window wilts it — 3
 * leaves per idle hour — so a neglected day shrinks the tree back toward the
 * shrub, and doing work restores the day's earned leaves. Its "life" is scoped
 * to roughly one day's work. See specs/006-growing-bonsai.
 */

export const BONSAI_STAGES = [
  "shrub",
  "sapling",
  "leafy",
  "flowering",
  "mature",
] as const;

export type BonsaiStage = (typeof BONSAI_STAGES)[number];

// --- Tuning constants (all the calibration knobs live here) --------------
export const TASK_LEAVES = 1; // leaves grown per completed task
export const SESSION_LEAVES = 3; // leaves grown per focus session (> task)
export const FROG_LEAVES = 5; // completing the day's frog — the whole point — grows most
export const MAX_LEAVES = 24; // full mature canopy (bounded)
export const WILT_LEAVES_PER_HOUR = 3; // leaves shed per active-idle hour
export const ACTIVE_START = 8; // wilt-active window start (local hour)
export const ACTIVE_END = 17; // wilt-active window end (local hour)
// -------------------------------------------------------------------------

// Named stages are milestones over the leaf count — used for the silhouette
// and the screen-reader label, while the leaf count drives fine growth.
function stageIndexFromLeaves(leaves: number): number {
  if (leaves <= 0) return 0; // shrub (day's starting state)
  if (leaves <= 6) return 1; // sapling
  if (leaves <= 14) return 2; // leafy
  if (leaves <= MAX_LEAVES - 1) return 3; // flowering
  return 4; // mature (full canopy)
}

const STAGE_LABELS: Record<BonsaiStage, string> = {
  shrub: "Your bonsai is a small shrub — grow it with today's work",
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
 * multi-day gaps and clock skew (a nonsensical range yields 0). Overnight and
 * off-hours never count, so the tree never wilts while you're away for the day.
 */
export function activeIdleHours(from: string | null, to: Date): number {
  if (!from) return 0;
  const start = new Date(from);
  if (Number.isNaN(start.getTime())) return 0;
  if (to.getTime() <= start.getTime()) return 0;

  let total = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  for (let guard = 0; guard < 750; guard += 1) {
    if (cursor.getTime() > to.getTime()) break;

    const windowOpen = new Date(cursor);
    windowOpen.setHours(ACTIVE_START, 0, 0, 0);
    const windowClose = new Date(cursor);
    windowClose.setHours(ACTIVE_END, 0, 0, 0);

    const lo = Math.max(start.getTime(), windowOpen.getTime());
    const hi = Math.min(to.getTime(), windowClose.getTime());
    if (hi > lo) total += (hi - lo) / 3_600_000;

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

function isSameLocalDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export type GrowthEvent = { at: string; leaves: number };

export type BonsaiInput = {
  events: GrowthEvent[];
  now: Date;
  /**
   * Extra, already-elapsed idle hours added on top of real idle. Persisted
   * (see BonsaiState.idleOffsetHours) and applied always — the dev "simulate
   * idle" tool edits this real value; it is 0 in normal use.
   */
  idleOffsetHours?: number;
};

export type BonsaiResult = {
  stage: BonsaiStage;
  leaves: number;
  blossoms: number;
  isWilting: boolean;
};

/**
 * Derive the bonsai's current shape from today's growth events minus idle wilt.
 * Growth is scoped to the local day, so each day starts as a shrub; wilt sheds
 * WILT_LEAVES_PER_HOUR per active-idle hour and clears when work resumes.
 */
export function deriveBonsai({ events, now, idleOffsetHours = 0 }: BonsaiInput): BonsaiResult {
  const grownToday = Math.min(
    events.reduce((sum, e) => (isSameLocalDay(e.at, now) ? sum + e.leaves : sum), 0),
    MAX_LEAVES,
  );

  const lastAt = events.length > 0 ? events[events.length - 1].at : null;
  const idleHours = activeIdleHours(lastAt, now) + Math.max(0, idleOffsetHours);
  const wilt = Math.floor(idleHours) * WILT_LEAVES_PER_HOUR;

  const leaves = Math.max(0, grownToday - wilt);
  const blossoms = leaves >= 15 ? Math.min(6, leaves - 14) : 0;

  return {
    stage: BONSAI_STAGES[stageIndexFromLeaves(leaves)],
    leaves,
    blossoms,
    isWilting: wilt > 0 && leaves < grownToday,
  };
}

// --- Persisted tree state (this feature's only stored state) -------------

type BonsaiState = {
  events: GrowthEvent[];
  /** Extra elapsed idle hours (dev-simulated). Real, persisted state. */
  idleOffsetHours: number;
};

const DEFAULT_STATE: BonsaiState = { events: [], idleOffsetHours: 0 };
const PRUNE_AGE_MS = 2 * 24 * 60 * 60 * 1000; // keep ~2 days of events

/**
 * The bonsai's own persisted state: a timestamped log of leaves earned plus a
 * simulated-idle offset. Today's entries drive growth; the most recent entry
 * (and the offset) anchor idle wilt. Self-contained, so every consumer stays
 * in sync via usePersistentState's same-key broadcast. The dev tools mutate
 * THIS real state (and it persists) rather than layering a throwaway preview.
 */
export function useBonsai() {
  const [state, setState] = usePersistentState<BonsaiState>(
    "frog-garden:bonsai-v3",
    DEFAULT_STATE,
  );

  const recordGrowth = useCallback(
    (leaves: number) => {
      // Timestamp computed outside the updater (the updater must stay pure).
      const atISO = new Date().toISOString();
      const cutoff = Date.now() - PRUNE_AGE_MS;
      setState((current) => ({
        ...current,
        // Doing any work resets the whole idle clock: the new event's
        // timestamp clears real idle, and we also clear the simulated offset
        // so completing ANYTHING restores the tree's full color (no lingering
        // wilt from a prior idle stretch, real or dev-simulated).
        idleOffsetHours: 0,
        events: [
          ...current.events.filter((e) => new Date(e.at).getTime() >= cutoff),
          { at: atISO, leaves },
        ],
      }));
    },
    [setState],
  );

  // Dev: permanently add simulated idle hours to the real tree state.
  const addIdleHours = useCallback(
    (hours: number) => {
      setState((current) => ({
        ...current,
        idleOffsetHours: Math.max(0, current.idleOffsetHours + hours),
      }));
    },
    [setState],
  );

  // Dev: reset the real tree back to a fresh shrub.
  const resetBonsai = useCallback(() => {
    setState({ events: [], idleOffsetHours: 0 });
  }, [setState]);

  return {
    events: state.events,
    idleOffsetHours: state.idleOffsetHours,
    recordGrowth,
    addIdleHours,
    resetBonsai,
  };
}
