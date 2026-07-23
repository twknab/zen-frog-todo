"use client";

import { useCallback } from "react";
import { usePersistentState, writePersistentValue } from "./storage";

/**
 * Sand Mode shared reset + day-snapshot keepsakes (specs/011-sand-day-snapshots).
 *
 * The canvas holds strokes in memory. Mid-day "smooth the sand" and "start a
 * new day" clear it — but first we capture a compact JPEG keepsake so The Grove
 * can show a quiet visual memory of that day.
 *
 * Quota note (research Decision 1): full-resolution PNGs would blow past
 * localStorage (~5–10MB) across MAX_ARCHIVED_DAYS=365. We downscale to a
 * 240px max edge at JPEG quality 0.55 (~4–12KB each → ~1.5–4.5MB/year).
 */

const SAND_RESET_KEY = "frog-garden:sand-reset-v1";

/** Live-day latest sand keepsake (overwrite on each mid-day clear-with-strokes). */
export const SAND_TODAY_SNAPSHOT_KEY = "frog-garden:sand-today-snapshot-v1";

/** Longest edge of the stored keepsake (CSS pixels). */
export const SAND_SNAPSHOT_MAX_EDGE = 240;
/** JPEG quality for toDataURL — balances fidelity vs localStorage budget. */
export const SAND_SNAPSHOT_JPEG_QUALITY = 0.55;
export const SAND_SNAPSHOT_MIME = "image/jpeg";

/**
 * Fixed muted sand fill when compositing (JPEG has no alpha). Matches the calm
 * light-surface sand panel tone rather than following live theme toggles, so
 * archived keepsakes stay visually stable.
 */
export const SAND_SNAPSHOT_BACKGROUND = "#E3DFD3";

type SandCanvasHandlers = {
  /** If strokes exist, return a compact JPEG data URL without wiping. */
  peekCapture: () => string | null;
  /** Clear strokes/bitmap only — no snapshot write. */
  wipeOnly: () => void;
};

let canvasHandlers: SandCanvasHandlers | null = null;

/** SandCanvas mounts/unmounts register peek + wipe for sync archive paths. */
export function registerSandCanvasHandlers(handlers: SandCanvasHandlers | null): void {
  canvasHandlers = handlers;
}

/**
 * Downscale `source` onto an offscreen canvas and encode as JPEG.
 * Returns null on zero size or any failure (never throws).
 */
export function captureSandSnapshot(source: HTMLCanvasElement): string | null {
  try {
    const srcW = source.width;
    const srcH = source.height;
    if (srcW <= 0 || srcH <= 0) return null;

    const scale = Math.min(1, SAND_SNAPSHOT_MAX_EDGE / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = SAND_SNAPSHOT_BACKGROUND;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    return offscreen.toDataURL(SAND_SNAPSHOT_MIME, SAND_SNAPSHOT_JPEG_QUALITY);
  } catch {
    return null;
  }
}

function saveTodaySnapshot(dataUrl: string): void {
  writePersistentValue<string | null>(SAND_TODAY_SNAPSHOT_KEY, dataUrl);
}

/** Non-reactive read for rollover / archive (tolerant). */
export function readTodaySandSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAND_TODAY_SNAPSHOT_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "string" && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearTodaySandSnapshot(): void {
  writePersistentValue<string | null>(SAND_TODAY_SNAPSHOT_KEY, null);
}

/**
 * Sync: prefer a fresh canvas capture when strokes exist, else today's stored
 * keepsake. Does not wipe.
 */
export function takeSandSnapshotForArchive(): string | null {
  const fresh = canvasHandlers?.peekCapture() ?? null;
  if (fresh) return fresh;
  return readTodaySandSnapshot();
}

/** Wipe the live canvas without writing a snapshot (post-archive). */
export function wipeSandCanvas(): void {
  canvasHandlers?.wipeOnly();
}

/** Reactive today snapshot for Grove browse. */
export function useTodaySandSnapshot(): string | null {
  const [value] = usePersistentState<string | null>(SAND_TODAY_SNAPSHOT_KEY, null);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function useSandReset() {
  const [sandResetToken, setToken] = usePersistentState(SAND_RESET_KEY, 0);

  const resetSand = useCallback(() => {
    // Sync capture-before-wipe so same-turn archive reads see today's key.
    try {
      const dataUrl = canvasHandlers?.peekCapture() ?? null;
      if (dataUrl) saveTodaySnapshot(dataUrl);
    } catch {
      // fail open — still wipe
    }
    canvasHandlers?.wipeOnly();
    setToken((t) => t + 1);
  }, [setToken]);

  return { sandResetToken, resetSand };
}
