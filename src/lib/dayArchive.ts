"use client";

import { useCallback, useEffect, useRef } from "react";
import { deriveBonsai, useBonsai, type GrowthEvent } from "./bonsai";
import { useFocusStats } from "./focusStats";
import {
  clearTodaySandSnapshot,
  readTodaySandSnapshot,
  takeSandSnapshotForArchive,
  wipeSandCanvas,
} from "./sand";
import { usePersistentState } from "./storage";
import { useTasks, type CompletedLogEntry, type Task } from "./tasks";

/**
 * The day archive + the "start a new day" ritual (see specs/007-new-day-archive).
 *
 * All archive persistence is routed through THIS module — components never touch
 * localStorage for archive data. That single boundary is the seam a future
 * migration off localStorage (e.g. to an on-device SQLite) can target without
 * rippling into the UI. The snapshot shape below is deliberately flat and
 * serialization-friendly so each `ArchivedDay` maps cleanly to a DB row later.
 */

// --- Constants (calibration + storage keys) ------------------------------
export const ARCHIVE_KEY = "frog-garden:day-archive-v1";
export const MAX_ARCHIVED_DAYS = 365; // retention bound; prune oldest beyond this
export const SCHEMA_VERSION = 1 as const; // stamped on every export document
const REFLECTION_KEY = "frog-garden:reflection-v1";

// The local calendar date (YYYY-MM-DD) the board was last active on — drives the
// automatic new-day rollover (see useDailyRollover below).
export const LAST_ACTIVE_DAY_KEY = "frog-garden:last-active-day-v1";

// Live-state keys owned by their domain hooks. The auto-rollover reads them
// directly (raw, non-reactive) to build an accurate previous-day snapshot, and
// resets them through their reactive setters. Kept in sync with the source
// modules: tasks.ts, focusStats.ts, bonsai.ts.
const TASKS_KEY = "frog-garden:tasks-v1";
const COMPLETED_LOG_KEY = "frog-garden:completed-log-v1";
const FOCUS_STATS_KEY = "frog-garden:focus-stats-v1";
const BONSAI_KEY = "frog-garden:bonsai-v3";
// -------------------------------------------------------------------------

// Flat shapes of the live stores, mirrored here so the rollover can read them
// without importing each hook's internal state type.
type TasksSnapshot = { tasks: Task[]; frogTaskId: string | null };
type FocusSnapshot = { completedSessions: number };
type BonsaiSnapshot = { events: GrowthEvent[]; idleOffsetHours: number };

/** Total, non-throwing JSON read from localStorage. Returns `fallback` on any
 * absent/malformed/inaccessible value (mirrors readArchive's tolerance). */
function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type ArchivedTask = {
  title: string;
  note: string;
  completedAt: string; // ISO-8601
};

export type ArchivedDay = {
  id: string;
  closedAt: string; // ISO-8601 — exact moment of close (drives same-date labelling)
  date: string; // YYYY-MM-DD, local calendar date of the close
  completedTasks: ArchivedTask[];
  reflection: string;
  focusSessions: number;
  bonsai: { leaves: number; stage: string };
  /** Compact JPEG data URL of the day's sand keepsake (011). Optional for back-compat. */
  sandSnapshot?: string;
};

// Export document shapes (bodies land with US2/US3; types are stable now).
export type SingleDayExport = {
  schemaVersion: typeof SCHEMA_VERSION;
  exportedAt: string;
  kind: "day";
  day: ArchivedDay;
};

export type FullExport = {
  schemaVersion: typeof SCHEMA_VERSION;
  exportedAt: string;
  kind: "full";
  archive: ArchivedDay[];
  live: {
    tasks: Task[];
    frogTaskId: string | null;
    completedLog: CompletedLogEntry[];
    reflection: string;
    focusSessions: number;
    bonsai: { leaves: number; stage: string };
  };
};

// --- Small pure helpers ---------------------------------------------------

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Local calendar date as YYYY-MM-DD (not UTC — the day is the user's local day). */
function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Prepend a day (newest-first) and enforce the retention bound. Pure. */
export function prependAndPrune(archive: ArchivedDay[], day: ArchivedDay): ArchivedDay[] {
  const next = [day, ...archive];
  return next.length > MAX_ARCHIVED_DAYS ? next.slice(0, MAX_ARCHIVED_DAYS) : next;
}

// --- Repository (persistence boundary) ------------------------------------

/**
 * Total, non-throwing read of the archive for non-reactive callers. Returns []
 * on absent/malformed storage. Reactive UI should use `useArchive()` instead so
 * it stays in sync via the same-key broadcast.
 */
export function readArchive(): ArchivedDay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ArchivedDay[]) : [];
  } catch {
    return [];
  }
}

/** Reactive archive read (newest-first), kept in sync across instances. */
export function useArchive(): ArchivedDay[] {
  const [archive] = usePersistentState<ArchivedDay[]>(ARCHIVE_KEY, []);
  return archive;
}

// --- Export helpers (client-side JSON download, no network) ----------------

/** Wrap one archived day as a self-describing single-day export document. */
export function buildSingleDayExport(day: ArchivedDay): SingleDayExport {
  return { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), kind: "day", day };
}

/**
 * Filename for a single day: `frog-garden-<date>.json`, with an `-HHmm` suffix
 * when more than one entry shares that date (so downloads never collide).
 */
export function archiveFilename(day: ArchivedDay, sameDateCount: number): string {
  if (sameDateCount > 1) {
    const d = new Date(day.closedAt);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `frog-garden-${day.date}-${hh}${mm}.json`;
  }
  return `frog-garden-${day.date}.json`;
}

/** Human-readable menu label: the date, plus a time only when the date repeats. */
export function archiveEntryLabel(day: ArchivedDay, sameDateCount: number): string {
  const d = new Date(day.closedAt);
  const dateLabel = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (sameDateCount > 1) {
    const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${dateLabel}, ${timeLabel}`;
  }
  return dateLabel;
}

/** Wrap the whole archive + current live state as a full-dump export document. */
export function buildFullExport(archive: ArchivedDay[], live: FullExport["live"]): FullExport {
  return { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), kind: "full", archive, live };
}

/** Filename for the full dump: `frog-garden-all-<date>.json`. */
export function fullExportFilename(now: Date): string {
  return `frog-garden-all-${localDateString(now)}.json`;
}

/**
 * Returns a callback that exports EVERYTHING — all archived days plus the
 * current live state — as one JSON file. Live state is gathered lazily at click
 * time (not every render) from the domain stores. Works with an empty archive.
 */
export function useExportEverything(): () => void {
  const [archive] = usePersistentState<ArchivedDay[]>(ARCHIVE_KEY, []);
  const { tasks, frogTaskId, completedLog } = useTasks();
  const { events, idleOffsetHours } = useBonsai();
  const { completedSessions } = useFocusStats();
  const [reflection] = usePersistentState(REFLECTION_KEY, "");

  return useCallback(() => {
    const now = new Date();
    const derived = deriveBonsai({ events, now, idleOffsetHours });
    const live: FullExport["live"] = {
      tasks,
      frogTaskId,
      completedLog,
      reflection,
      focusSessions: completedSessions,
      bonsai: { leaves: derived.leaves, stage: derived.stage },
    };
    downloadJson(fullExportFilename(now), buildFullExport(archive, live));
  }, [archive, tasks, frogTaskId, completedLog, events, idleOffsetHours, completedSessions, reflection]);
}

/**
 * Download `data` as a pretty-printed JSON file, entirely on-device: build a
 * Blob, click a temporary object-URL anchor, then revoke the URL. No network.
 */
export function downloadJson(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// --- The "start a new day" orchestration ----------------------------------

/**
 * Composes the live stores so a single `startNewDay()` can snapshot the day
 * into the archive (skipping empty days) and reset everything to a fresh start.
 * Writes go through each store's own `usePersistentState`, whose same-key
 * broadcast propagates the reset to the components rendering those stores.
 */
export function useNewDay() {
  const [archive, setArchive] = usePersistentState<ArchivedDay[]>(ARCHIVE_KEY, []);
  const { completedLog, startNewDay: resetTasks } = useTasks();
  const { events: bonsaiEvents, idleOffsetHours, resetBonsai } = useBonsai();
  const { completedSessions, resetSessions } = useFocusStats();
  const [reflection, setReflection] = usePersistentState(REFLECTION_KEY, "");

  const startNewDay = useCallback(() => {
    // `now` computed outside any state updater (keeps updaters pure).
    const now = new Date();
    const derived = deriveBonsai({ events: bonsaiEvents, now, idleOffsetHours });
    const completedTasks: ArchivedTask[] = completedLog.map((e) => ({
      title: e.taskTitle,
      note: e.note,
      completedAt: e.completedAt,
    }));

    // Prefer a fresh canvas capture if strokes remain; else today's mid-day keepsake.
    const sandSnapshot = takeSandSnapshotForArchive() ?? undefined;

    // Empty-day guard (FR-007): only archive a day that actually held something.
    // Sand keepsakes count as content so a sand-only day is not orphaned (011).
    const hasContent =
      completedTasks.length > 0 ||
      reflection.trim().length > 0 ||
      completedSessions > 0 ||
      derived.leaves > 0 ||
      Boolean(sandSnapshot);

    if (hasContent) {
      const snapshot: ArchivedDay = {
        id: makeId("day"),
        closedAt: now.toISOString(),
        date: localDateString(now),
        completedTasks,
        reflection,
        focusSessions: completedSessions,
        bonsai: { leaves: derived.leaves, stage: derived.stage },
        ...(sandSnapshot ? { sandSnapshot } : {}),
      };
      // Append-first (fail-safe): the snapshot is stored before any reset runs.
      setArchive((prev) => prependAndPrune(prev, snapshot));
    }

    // Reset the live board to a fresh day: tasks → completed-log → reflection
    // → bonsai → focus (see contracts/archive-repository.md).
    resetTasks(); // drops completed, keeps unfinished, clears frog + completed-log
    setReflection("");
    resetBonsai();
    resetSessions();
    // Wipe sand without re-saving into the today key (already attached above).
    clearTodaySandSnapshot();
    wipeSandCanvas();
  }, [
    bonsaiEvents,
    idleOffsetHours,
    completedLog,
    reflection,
    completedSessions,
    setArchive,
    resetTasks,
    setReflection,
    resetBonsai,
    resetSessions,
  ]);

  return { archive, startNewDay };
}

// --- Automatic new-day rollover -------------------------------------------

/** The stored live state a rollover reads, and the reset outcome it produces. */
export type RolloverInput = {
  now: Date;
  tasksState: TasksSnapshot;
  completedLog: CompletedLogEntry[];
  reflection: string;
  focus: FocusSnapshot;
  bonsai: BonsaiSnapshot;
  /** Today's sand keepsake from storage (in-memory strokes are already gone after process death). */
  sandSnapshot?: string | null;
};

export type RolloverPlan = {
  /** The previous day to archive, or null when the empty-day guard skips it. */
  snapshot: ArchivedDay | null;
  /** Unfinished tasks that carry over into the fresh day (frog is cleared). */
  keptTasks: Task[];
};

/**
 * Pure core of the daily rollover: given the previous day's stored live state
 * and the current clock, produce the archive snapshot (or null when the day held
 * nothing — the same FR-007 empty-day guard as the manual ritual) and the tasks
 * to keep. Deterministic apart from the snapshot's random id. Callers decide
 * WHETHER to roll over (a date change); this only computes WHAT the rollover does.
 */
export function buildRolloverPlan({
  now,
  tasksState,
  completedLog,
  reflection,
  focus,
  bonsai,
  sandSnapshot,
}: RolloverInput): RolloverPlan {
  const derived = deriveBonsai({
    events: bonsai.events ?? [],
    now,
    idleOffsetHours: bonsai.idleOffsetHours ?? 0,
  });
  const completedTasks: ArchivedTask[] = (completedLog ?? []).map((e) => ({
    title: e.taskTitle,
    note: e.note,
    completedAt: e.completedAt,
  }));

  const sand =
    typeof sandSnapshot === "string" && sandSnapshot.length > 0 ? sandSnapshot : undefined;

  const hasContent =
    completedTasks.length > 0 ||
    (reflection ?? "").trim().length > 0 ||
    (focus?.completedSessions ?? 0) > 0 ||
    derived.leaves > 0 ||
    Boolean(sand);

  const snapshot: ArchivedDay | null = hasContent
    ? {
        id: makeId("day"),
        closedAt: now.toISOString(),
        date: localDateString(now),
        completedTasks,
        reflection: reflection ?? "",
        focusSessions: focus?.completedSessions ?? 0,
        bonsai: { leaves: derived.leaves, stage: derived.stage },
        ...(sand ? { sandSnapshot: sand } : {}),
      }
    : null;

  return { snapshot, keptTasks: (tasksState.tasks ?? []).filter((t) => !t.completed) };
}

/**
 * On app load, if the local calendar day has changed since the board was last
 * used, automatically do what "Start a new day" does: archive the previous day
 * (skipping a truly empty one) and reset the live board — so the Standup Summary,
 * reflection ("standup") box, tasks, bonsai and focus count all start fresh on a
 * genuinely new day, not just when the button is pressed. Unfinished tasks carry
 * over, exactly like the manual ritual.
 *
 * Why it reads raw localStorage instead of reusing `startNewDay()`: the domain
 * stores hydrate from localStorage in a mount effect (see usePersistentState),
 * so on the first render their reactive values are still defaults. Building the
 * previous-day snapshot from a direct, non-reactive read avoids that hydration
 * race (it never archives an empty default over real data), while the resets go
 * through each key's reactive setter so the same-key broadcast updates the UI.
 *
 * MUST be called AFTER the page's domain hooks (useTasks/useBonsai/…) so this
 * hook's reset broadcast lands after their hydration, not before it. Runs once
 * per load; a same-day load is a no-op; a first-ever load only records today.
 */
export function useDailyRollover(): void {
  const [, setArchive] = usePersistentState<ArchivedDay[]>(ARCHIVE_KEY, []);
  const [, setTasks] = usePersistentState<TasksSnapshot>(TASKS_KEY, {
    tasks: [],
    frogTaskId: null,
  });
  const [, setCompletedLog] = usePersistentState<CompletedLogEntry[]>(COMPLETED_LOG_KEY, []);
  const [, setReflection] = usePersistentState(REFLECTION_KEY, "");
  const [, setFocus] = usePersistentState<FocusSnapshot>(FOCUS_STATS_KEY, {
    completedSessions: 0,
  });
  const [, setBonsai] = usePersistentState<BonsaiSnapshot>(BONSAI_KEY, {
    events: [],
    idleOffsetHours: 0,
  });
  const [, setLastActiveDay] = usePersistentState<string | null>(LAST_ACTIVE_DAY_KEY, null);
  const ranRef = useRef(false);

  useEffect(() => {
    // One-shot per load, after the stores above (and the page's) have hydrated.
    if (ranRef.current) return;
    ranRef.current = true;

    const now = new Date();
    const today = localDateString(now);
    const lastActive = readJson<string | null>(LAST_ACTIVE_DAY_KEY, null);

    if (lastActive === today) return; // same day — nothing to do
    if (lastActive === null) {
      // First-ever load (or storage cleared): remember today, don't reset.
      setLastActiveDay(today);
      return;
    }

    // A new calendar day. Read the previous day's live state straight from
    // storage so the snapshot reflects real data regardless of hydration timing.
    // Sand: only a previously saved today-key survives process death; uncleared
    // in-memory strokes cannot be recovered (011 Decision 5).
    const { snapshot, keptTasks } = buildRolloverPlan({
      now,
      tasksState: readJson<TasksSnapshot>(TASKS_KEY, { tasks: [], frogTaskId: null }),
      completedLog: readJson<CompletedLogEntry[]>(COMPLETED_LOG_KEY, []),
      reflection: readJson<string>(REFLECTION_KEY, ""),
      focus: readJson<FocusSnapshot>(FOCUS_STATS_KEY, { completedSessions: 0 }),
      bonsai: readJson<BonsaiSnapshot>(BONSAI_KEY, { events: [], idleOffsetHours: 0 }),
      sandSnapshot: readTodaySandSnapshot(),
    });

    if (snapshot) {
      // Read the archive raw too, so we prepend onto the real list rather than a
      // possibly-not-yet-hydrated reactive value.
      setArchive(prependAndPrune(readArchive(), snapshot));
    }

    // Reset the live board (explicit values — no stale-state functional updates):
    // keep unfinished tasks, clear the frog, drop the completed-log/reflection,
    // and reset the bonsai + focus count for the fresh day.
    setTasks({ tasks: keptTasks, frogTaskId: null });
    setCompletedLog([]);
    setReflection("");
    setFocus({ completedSessions: 0 });
    setBonsai({ events: [], idleOffsetHours: 0 });
    clearTodaySandSnapshot();
    wipeSandCanvas();
    setLastActiveDay(today);
  }, [
    setArchive,
    setTasks,
    setCompletedLog,
    setReflection,
    setFocus,
    setBonsai,
    setLastActiveDay,
  ]);
}
