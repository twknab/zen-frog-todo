"use client";

import { useCallback } from "react";
import { usePersistentState, writePersistentValue } from "./storage";

/**
 * Sand Mode shared reset + day-drawing keepsakes (specs/011-sand-day-snapshots).
 *
 * Mid-day "smooth the sand" and "start a new day" clear the live canvas — but
 * first we capture a **vector SVG** of the strokes so The Grove can keep every
 * drawing from the day (not just the latest), crisp at any size.
 *
 * Quota note: raster JPEG thumbnails at 240px looked pixelated in the lightbox.
 * SVG of the rake strokes stays sharp and typically stays small for calm,
 * sparse drawings. Soft-cap drawings per day so a heavy session cannot blow
 * past localStorage (see MAX_SAND_DRAWINGS_PER_DAY).
 */

const SAND_RESET_KEY = "frog-garden:sand-reset-v1";

/** Live-day sand drawings for the current calendar day (append on each clear). */
export const SAND_TODAY_DRAWINGS_KEY = "frog-garden:sand-today-drawings-v1";

/** Soft cap — drop oldest when appending beyond this within one day. */
export const MAX_SAND_DRAWINGS_PER_DAY = 24;

/**
 * Fixed muted sand fill for SVG keepsakes. Matches the calm light-surface sand
 * panel rather than following live theme toggles, so archived drawings stay
 * visually stable.
 */
export const SAND_SNAPSHOT_BACKGROUND = "#E3DFD3";

/** One vector sand drawing (stored on ArchivedDay + today's list). */
export type SandDrawing = {
  id: string;
  capturedAt: string; // ISO-8601
  /** Full SVG document — export/download as-is. */
  svg: string;
  width: number;
  height: number;
};

export type SandStroke = {
  points: { x: number; y: number }[];
  color: string;
};

type SandCanvasHandlers = {
  /** If strokes exist, return a new SandDrawing without wiping. */
  peekCapture: () => SandDrawing | null;
  /** Clear strokes/bitmap only — no snapshot write. */
  wipeOnly: () => void;
};

let canvasHandlers: SandCanvasHandlers | null = null;

/** SandCanvas mounts/unmounts register peek + wipe for sync archive paths. */
export function registerSandCanvasHandlers(handlers: SandCanvasHandlers | null): void {
  canvasHandlers = handlers;
}

function makeDrawingId(): string {
  return `sand-${Math.random().toString(36).slice(2, 10)}`;
}

/** Encode SVG markup as a data URL suitable for <img src>. */
export function sandSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Turn rake strokes into an SVG document (same 5-tine geometry as SandCanvas).
 * Points are CSS-pixel coords matching the live canvas size.
 */
export function strokesToSvg(
  strokes: SandStroke[],
  width: number,
  height: number,
  background: string = SAND_SNAPSHOT_BACKGROUND,
): string {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const spacing = 5;
  const offsets = [-2 * spacing, -spacing, 0, spacing, 2 * spacing];
  const parts: string[] = [];

  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    const color = stroke.color.replace(/[^#a-fA-F0-9]/g, "") || "#6B8F71";

    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      for (const offset of offsets) {
        const x = (p.x + offset * 0.15).toFixed(1);
        const y = p.y.toFixed(1);
        parts.push(
          `<path d="M${x} ${y}h0.5" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-opacity="0.75" fill="none"/>`,
        );
      }
      continue;
    }

    for (let i = 1; i < stroke.points.length; i += 1) {
      const p0 = stroke.points[i - 1];
      const p1 = stroke.points[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      for (const offset of offsets) {
        const x1 = (p0.x + nx * offset).toFixed(1);
        const y1 = (p0.y + ny * offset).toFixed(1);
        const x2 = (p1.x + nx * offset).toFixed(1);
        const y2 = (p1.y + ny * offset).toFixed(1);
        parts.push(
          `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-opacity="0.75" fill="none"/>`,
        );
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">` +
    `<rect width="100%" height="100%" fill="${background}"/>` +
    parts.join("") +
    `</svg>`
  );
}

/** Build a SandDrawing from in-memory strokes (null if empty / invalid size). */
export function captureSandDrawingFromStrokes(
  strokes: SandStroke[],
  width: number,
  height: number,
): SandDrawing | null {
  if (strokes.length === 0 || width <= 0 || height <= 0) return null;
  try {
    const svg = strokesToSvg(strokes, width, height);
    return {
      id: makeDrawingId(),
      capturedAt: new Date().toISOString(),
      svg,
      width: Math.round(width),
      height: Math.round(height),
    };
  } catch {
    return null;
  }
}

function isSandDrawing(value: unknown): value is SandDrawing {
  if (!value || typeof value !== "object") return false;
  const d = value as SandDrawing;
  return (
    typeof d.id === "string" &&
    typeof d.capturedAt === "string" &&
    typeof d.svg === "string" &&
    d.svg.length > 0 &&
    typeof d.width === "number" &&
    typeof d.height === "number"
  );
}

function normalizeDrawings(raw: unknown): SandDrawing[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSandDrawing);
}

/** Non-reactive read for rollover / archive (tolerant). */
export function readTodaySandDrawings(): SandDrawing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAND_TODAY_DRAWINGS_KEY);
    if (raw === null) return [];
    return normalizeDrawings(JSON.parse(raw));
  } catch {
    return [];
  }
}

function saveTodayDrawings(drawings: SandDrawing[]): void {
  writePersistentValue<SandDrawing[]>(SAND_TODAY_DRAWINGS_KEY, drawings);
}

/** Append a drawing to today's list (oldest dropped past the soft cap). */
export function appendTodaySandDrawing(drawing: SandDrawing): void {
  const next = [...readTodaySandDrawings(), drawing];
  while (next.length > MAX_SAND_DRAWINGS_PER_DAY) next.shift();
  saveTodayDrawings(next);
}

export function clearTodaySandDrawings(): void {
  writePersistentValue<SandDrawing[]>(SAND_TODAY_DRAWINGS_KEY, []);
}

/**
 * Sync: today's stored drawings, plus a fresh canvas capture when strokes remain.
 * Does not wipe. Does not mutate the today key (caller clears after archive).
 */
export function takeSandDrawingsForArchive(): SandDrawing[] {
  const existing = readTodaySandDrawings();
  const fresh = canvasHandlers?.peekCapture() ?? null;
  if (!fresh) return existing;
  const next = [...existing, fresh];
  while (next.length > MAX_SAND_DRAWINGS_PER_DAY) next.shift();
  return next;
}

/** Wipe the live canvas without writing a snapshot (post-archive). */
export function wipeSandCanvas(): void {
  canvasHandlers?.wipeOnly();
}

/** Reactive today drawings for Grove browse. */
export function useTodaySandDrawings(): SandDrawing[] {
  const [value] = usePersistentState<SandDrawing[]>(SAND_TODAY_DRAWINGS_KEY, []);
  return normalizeDrawings(value);
}

/** Trigger a browser download of raw SVG markup. */
export function downloadSandSvg(drawing: SandDrawing, filename?: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([drawing.svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename ?? `sand-${drawing.id}.svg`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Normalize archived day + legacy single JPEG into a display list.
 * Prefer `sandDrawings`; fall back to legacy `sandSnapshot` data URL.
 */
export function drawingsFromArchivedDay(day: {
  sandDrawings?: SandDrawing[] | null;
  sandSnapshot?: string | null;
}): Array<{ id: string; src: string; svg?: string; drawing?: SandDrawing }> {
  const list = normalizeDrawings(day.sandDrawings ?? []);
  if (list.length > 0) {
    return list.map((d) => ({
      id: d.id,
      src: sandSvgDataUrl(d.svg),
      svg: d.svg,
      drawing: d,
    }));
  }
  if (typeof day.sandSnapshot === "string" && day.sandSnapshot.length > 0) {
    return [{ id: "legacy-sand", src: day.sandSnapshot }];
  }
  return [];
}

export function useSandReset() {
  const [sandResetToken, setToken] = usePersistentState(SAND_RESET_KEY, 0);

  const resetSand = useCallback(() => {
    // Sync capture-before-wipe so same-turn archive reads see today's key.
    try {
      const drawing = canvasHandlers?.peekCapture() ?? null;
      if (drawing) appendTodaySandDrawing(drawing);
    } catch {
      // fail open — still wipe
    }
    canvasHandlers?.wipeOnly();
    setToken((t) => t + 1);
  }, [setToken]);

  return { sandResetToken, resetSand };
}

// --- Back-compat aliases (call sites / older docs) ------------------------
/** @deprecated use clearTodaySandDrawings */
export const clearTodaySandSnapshot = clearTodaySandDrawings;
