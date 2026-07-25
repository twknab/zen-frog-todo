/**
 * Day Garden vs Night Camp realm derivation (specs/017-night-camp).
 *
 * Shared clock + Dev Force override brain. Work window defaults 8–17 local.
 */

import { useCallback, useMemo } from "react";
import { usePersistentState } from "./storage";

export type GardenRealm = "day" | "night";

/** `null` = follow local clock + work window. */
export type RealmOverride = GardenRealm | null;

export type WorkWindow = {
  /** Local hour 0–23 inclusive start of day realm. */
  startHour: number;
  /** Local hour 0–23 exclusive end of day realm (matches bonsai ACTIVE_END). */
  endHour: number;
};

export type AmPmTime = {
  hour12: number; // 1–12
  period: "AM" | "PM";
};

/** Default work window: 8:00 AM – 5:00 PM local (constitution / 017). */
export const DEFAULT_WORK_WINDOW: WorkWindow = {
  startHour: 8,
  endHour: 17,
};

export const WORK_WINDOW_KEY = "frog-garden:work-window-v1";
export const REALM_OVERRIDE_KEY = "frog-garden:realm-override-v1";
export const DEV_MODE_KEY = "frog-garden:dev-mode-v1";

export function normalizeHour(hour: number): number {
  if (!Number.isFinite(hour)) return 0;
  const h = Math.trunc(hour);
  if (h < 0) return 0;
  if (h > 23) return 23;
  return h;
}

export function normalizeWorkWindow(value: unknown): WorkWindow {
  if (!value || typeof value !== "object") return { ...DEFAULT_WORK_WINDOW };
  const v = value as Partial<WorkWindow>;
  return {
    startHour: normalizeHour(Number(v.startHour ?? DEFAULT_WORK_WINDOW.startHour)),
    endHour: normalizeHour(Number(v.endHour ?? DEFAULT_WORK_WINDOW.endHour)),
  };
}

/**
 * Degenerate window (start === end) is invalid for Options save — we coerce to defaults.
 * Overnight windows (start > end) are valid. Same-day (start < end) is valid.
 */
export function isDegenerateWorkWindow(window: WorkWindow): boolean {
  return normalizeHour(window.startHour) === normalizeHour(window.endHour);
}

/**
 * Whether `now` falls inside the work window (day realm by clock).
 * Supports windows that span midnight (e.g. 22 → 6).
 */
export function isInsideWorkWindow(
  now: Date,
  window: WorkWindow = DEFAULT_WORK_WINDOW,
): boolean {
  const start = normalizeHour(window.startHour);
  const end = normalizeHour(window.endHour);
  const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  if (start === end) {
    // Degenerate: treat as always-day so the app never bricks.
    return true;
  }

  if (start < end) {
    // Same-day window, end exclusive (8–17 ⇒ day while hour ∈ [8, 17)).
    return hour >= start && hour < end;
  }

  // Spans midnight: day while hour >= start OR hour < end.
  return hour >= start || hour < end;
}

export function clockRealm(
  now: Date,
  window: WorkWindow = DEFAULT_WORK_WINDOW,
): GardenRealm {
  return isInsideWorkWindow(now, window) ? "day" : "night";
}

/**
 * Effective realm for atmosphere / growth routing.
 * When `devToolsEnabled` is false, overrides are ignored (Follow clock).
 */
export function resolveRealm(options: {
  now?: Date;
  window?: WorkWindow;
  override?: RealmOverride;
  devToolsEnabled?: boolean;
}): GardenRealm {
  const now = options.now ?? new Date();
  const window = options.window ?? DEFAULT_WORK_WINDOW;
  const override =
    options.devToolsEnabled === false ? null : (options.override ?? null);
  if (override === "day" || override === "night") return override;
  return clockRealm(now, window);
}

export function normalizeRealmOverride(value: unknown): RealmOverride {
  if (value === "day" || value === "night") return value;
  return null;
}

/** Convert 0–23 hour to 1–12 + AM/PM. */
export function hourToAmPm(hour24: number): AmPmTime {
  const h = normalizeHour(hour24);
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const mod = h % 12;
  return { hour12: mod === 0 ? 12 : mod, period };
}

/** Convert 1–12 + AM/PM to 0–23 hour. */
export function amPmToHour(hour12: number, period: "AM" | "PM"): number {
  let h = Math.trunc(hour12);
  if (h < 1) h = 1;
  if (h > 12) h = 12;
  if (period === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

/**
 * Persist + share the user's work window (Options + wilt + realm).
 */
export function useWorkWindow() {
  const [raw, setRaw] = usePersistentState<WorkWindow>(
    WORK_WINDOW_KEY,
    DEFAULT_WORK_WINDOW,
  );
  const window = useMemo(() => normalizeWorkWindow(raw), [raw]);

  const setWorkWindow = useCallback(
    (next: WorkWindow) => {
      const normalized = normalizeWorkWindow(next);
      // Degenerate equal hours → keep previous / default rather than brick.
      if (isDegenerateWorkWindow(normalized)) {
        setRaw({ ...DEFAULT_WORK_WINDOW });
        return;
      }
      setRaw(normalized);
    },
    [setRaw],
  );

  return { workWindow: window, setWorkWindow };
}
