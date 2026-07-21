"use client";

import { useCallback } from "react";
import { usePersistentState } from "./storage";

/**
 * The bonsai is a per-day-cycle momentum indicator: it starts as a small shrub
 * and grows with the cycle's work (a completed task = 1 leaf, a focus session =
 * 3), up to a bounded full canopy. Idle time within the active window wilts it —
 * 3 leaves per idle hour — so neglect shrinks the tree back toward the shrub,
 * and doing work restores the earned leaves.
 *
 * Scope (revised for specs/007-new-day-archive, FR-006b): growth is scoped to
 * the manual "day cycle" — it accumulates over ALL stored growth events (which
 * are cleared when the user starts a new day) rather than resetting at calendar
 * midnight. `resetBonsai()` (called by "start a new day") is the sole reset.
 * Wilt is unchanged — still active-hours only. See specs/006-growing-bonsai for
 * the original daily model this supersedes.
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

// Frog friends (specs/008-frog-friends): each completion also spawns frogs that
// gather around the pot. Weights differ from leaves; frogs never wilt.
export const TASK_FROGS = 1; // frogs per completed regular task
export const SESSION_FROGS = 2; // frogs per focus session
export const FROG_FROGS = 3; // frogs per completing the day's frog
export const MAX_FROGS = 20; // full crowd, including the baseline (bounded)
export const BASELINE_FROGS = 1; // the lone frog always present (index 0)
export const SQUIRREL_MIN = 6; // min crowd before a squirrel may appear
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
 * Blossoms shown for a given leaf count — a lush tree flowers as it fills in.
 * Shared by the live tree (`deriveBonsai`) and the archived-day scenes in The
 * Grove (specs/010-grove-history) so both flower identically for the same leaves.
 */
export function blossomCountForLeaves(leaves: number): number {
  return leaves >= 15 ? Math.min(6, leaves - 14) : 0;
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

export type GrowthEvent = { at: string; leaves: number; frogs: number };

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
  /** Frogs to show gathered around the pot (baseline..MAX_FROGS); never wilts. */
  frogs: number;
};

/**
 * Derive the bonsai's current shape from the cycle's growth events minus idle
 * wilt. Growth accumulates over ALL stored events (the events are cleared when
 * the user starts a new day — see specs/007-new-day-archive), so the tree holds
 * its growth across calendar midnights until a manual close. Wilt sheds
 * WILT_LEAVES_PER_HOUR per active-idle hour and clears when work resumes.
 */
export function deriveBonsai({ events, now, idleOffsetHours = 0 }: BonsaiInput): BonsaiResult {
  const grown = Math.min(
    events.reduce((sum, e) => sum + e.leaves, 0),
    MAX_LEAVES,
  );

  const lastAt = events.length > 0 ? events[events.length - 1].at : null;
  const idleHours = activeIdleHours(lastAt, now) + Math.max(0, idleOffsetHours);
  const wilt = Math.floor(idleHours) * WILT_LEAVES_PER_HOUR;

  const leaves = Math.max(0, grown - wilt);
  const blossoms = blossomCountForLeaves(leaves);

  // Frogs accumulate from the same events (frog weight per event) but never
  // wilt — they mark work actually done this cycle. Floored at the baseline,
  // capped at MAX_FROGS. `?? 0` keeps pre-frogs stored events safe on upgrade.
  const frogs = Math.min(
    MAX_FROGS,
    BASELINE_FROGS + events.reduce((sum, e) => sum + (e.frogs ?? 0), 0),
  );

  return {
    stage: BONSAI_STAGES[stageIndexFromLeaves(leaves)],
    leaves,
    blossoms,
    isWilting: wilt > 0 && leaves < grown,
    frogs,
  };
}

// --- Persisted tree state (this feature's only stored state) -------------

type BonsaiState = {
  events: GrowthEvent[];
  /** Extra elapsed idle hours (dev-simulated). Real, persisted state. */
  idleOffsetHours: number;
};

const DEFAULT_STATE: BonsaiState = { events: [], idleOffsetHours: 0 };
// Growth is now cleared on "start a new day" (not by calendar age), so events
// are bounded by a generous count cap for storage safety only. The displayed
// sum caps at MAX_LEAVES regardless, so this never affects the rendered tree.
const MAX_EVENTS = 500;

/**
 * The bonsai's own persisted state: a timestamped log of leaves earned plus a
 * simulated-idle offset. All stored entries drive growth (cleared on "start a
 * new day"); the most recent entry (and the offset) anchor idle wilt. The
 * offset is cleared on any growth. Self-contained, so every consumer stays
 * in sync via usePersistentState's same-key broadcast. The dev tools mutate
 * THIS real state (and it persists) rather than layering a throwaway preview.
 */
export function useBonsai() {
  const [state, setState] = usePersistentState<BonsaiState>(
    "frog-garden:bonsai-v3",
    DEFAULT_STATE,
  );

  const recordGrowth = useCallback(
    (leaves: number, frogs: number) => {
      // Timestamp computed outside the updater (the updater must stay pure).
      const atISO = new Date().toISOString();
      setState((current) => {
        // Doing any work resets the whole idle clock: the new event's
        // timestamp clears real idle, and we also clear the simulated offset
        // so completing ANYTHING restores the tree's full color (no lingering
        // wilt from a prior idle stretch, real or dev-simulated).
        const events = [...current.events, { at: atISO, leaves, frogs }];
        return {
          ...current,
          idleOffsetHours: 0,
          // Keep only the most recent MAX_EVENTS as a storage safety net.
          events: events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events,
        };
      });
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
