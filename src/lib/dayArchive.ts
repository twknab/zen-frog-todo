"use client";

import { useCallback } from "react";
import { deriveBonsai, useBonsai } from "./bonsai";
import { useFocusStats } from "./focusStats";
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
// -------------------------------------------------------------------------

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

    // Empty-day guard (FR-007): only archive a day that actually held something.
    const hasContent =
      completedTasks.length > 0 ||
      reflection.trim().length > 0 ||
      completedSessions > 0 ||
      derived.leaves > 0;

    if (hasContent) {
      const snapshot: ArchivedDay = {
        id: makeId("day"),
        closedAt: now.toISOString(),
        date: localDateString(now),
        completedTasks,
        reflection,
        focusSessions: completedSessions,
        bonsai: { leaves: derived.leaves, stage: derived.stage },
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
