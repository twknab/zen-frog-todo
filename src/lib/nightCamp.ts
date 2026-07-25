/**
 * Night Camp ledger (specs/017-night-camp).
 * Separate day-cycle progress while the bonsai sleeps after hours.
 */

"use client";

import { useCallback, useMemo } from "react";
import {
  FROG_LEAVES,
  SESSION_LEAVES,
  TASK_LEAVES,
} from "./bonsai";
import { usePersistentState } from "./storage";

export const NIGHT_CAMP_KEY = "frog-garden:night-camp-v1";

export type NightGrowthEvent = { at: string; weight: number };

export type NightCampState = {
  events: NightGrowthEvent[];
};

export type NightCampSnapshot = {
  progress: number;
  stage: number;
  stageLabel: string;
};

export type NightCampView = NightCampSnapshot & {
  fireflies: number;
  campfireLevel: number; // 0–4
  starDensity: number; // 0–1
  moonFill: number; // 0–1
  nightFrogs: number;
};

const DEFAULT_STATE: NightCampState = { events: [] };
const MAX_EVENTS = 500;
export const MAX_NIGHT_PROGRESS = 20;

/** Poetic stage labels (scene poetry, not a scoreboard). */
export const NIGHT_STAGE_LABELS = [
  "Resting camp",
  "First fireflies",
  "Embers",
  "Campfire & stars",
  "Full moon",
] as const;

/** Dial-back thresholds — data-model suggested knobs. */
const STAGE_THRESHOLDS = [0, 2, 5, 9, 14] as const;

export const NIGHT_WEIGHTS = {
  task: TASK_LEAVES,
  session: SESSION_LEAVES,
  frog: FROG_LEAVES,
} as const;

export function nightProgressFromEvents(events: NightGrowthEvent[]): number {
  const sum = events.reduce((s, e) => s + Math.max(0, e.weight ?? 0), 0);
  return Math.min(MAX_NIGHT_PROGRESS, sum);
}

export function nightStageFromProgress(progress: number): number {
  let stage = 0;
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (progress >= STAGE_THRESHOLDS[i]) {
      stage = i;
      break;
    }
  }
  return stage;
}

export function nightStageLabel(stage: number): string {
  const i = Math.max(0, Math.min(NIGHT_STAGE_LABELS.length - 1, stage));
  return NIGHT_STAGE_LABELS[i];
}

/**
 * More day frogs ⇒ more camp frogs; night progress adds a few more.
 * Always at least 1 when any night progress or day frogs exist; 0 only at total rest.
 */
export function nightFrogCount(dayFrogs: number, progress: number): number {
  if (dayFrogs <= 0 && progress <= 0) return 0;
  const fromDay = Math.max(1, Math.min(12, Math.ceil(dayFrogs * 0.55)));
  const fromNight = Math.min(6, Math.floor(progress / 3));
  return Math.min(16, fromDay + fromNight);
}

export function deriveNightCamp(
  events: NightGrowthEvent[],
  dayFrogs = 0,
): NightCampView {
  const progress = nightProgressFromEvents(events);
  const stage = nightStageFromProgress(progress);
  const stageLabel = nightStageLabel(stage);
  const t = stage / 4;
  return {
    progress,
    stage,
    stageLabel,
    fireflies: stage === 0 ? 0 : 3 + stage * 4,
    campfireLevel: stage,
    starDensity: Math.min(1, stage * 0.22),
    moonFill: Math.min(1, 0.15 + t * 0.85),
    nightFrogs: nightFrogCount(dayFrogs, progress),
  };
}

export function nightCampSnapshot(events: NightGrowthEvent[]): NightCampSnapshot {
  const progress = nightProgressFromEvents(events);
  const stage = nightStageFromProgress(progress);
  return { progress, stage, stageLabel: nightStageLabel(stage) };
}

export function useNightCamp() {
  const [state, setState] = usePersistentState<NightCampState>(
    NIGHT_CAMP_KEY,
    DEFAULT_STATE,
  );

  const recordNightGrowth = useCallback(
    (weight: number) => {
      const atISO = new Date().toISOString();
      const w = Math.max(0, weight);
      setState((current) => {
        const events = [...current.events, { at: atISO, weight: w }];
        return {
          events:
            events.length > MAX_EVENTS
              ? events.slice(events.length - MAX_EVENTS)
              : events,
        };
      });
    },
    [setState],
  );

  const resetNightCamp = useCallback(() => {
    setState({ events: [] });
  }, [setState]);

  const view = useMemo(() => deriveNightCamp(state.events), [state.events]);

  return {
    events: state.events,
    recordNightGrowth,
    resetNightCamp,
    view,
    deriveWithDayFrogs: (dayFrogs: number) => deriveNightCamp(state.events, dayFrogs),
  };
}
