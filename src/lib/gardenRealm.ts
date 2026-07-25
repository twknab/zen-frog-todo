/**
 * Day Garden vs Night Camp realm derivation (specs/017-night-camp).
 *
 * Work window defaults match today's wilt window (8–17 local). Configurable
 * hours + Night Camp UI land with the rest of 017; this module is the shared
 * clock/override brain so Dev Mode can Force night/day for testing now.
 */

export type GardenRealm = "day" | "night";

/** `null` = follow local clock + work window. */
export type RealmOverride = GardenRealm | null;

export type WorkWindow = {
  /** Local hour 0–23 inclusive start of day realm. */
  startHour: number;
  /** Local hour 0–23 exclusive end of day realm (matches bonsai ACTIVE_END). */
  endHour: number;
};

/** Default work window: 8:00 AM – 5:00 PM local (constitution / 017). */
export const DEFAULT_WORK_WINDOW: WorkWindow = {
  startHour: 8,
  endHour: 17,
};

export function normalizeHour(hour: number): number {
  if (!Number.isFinite(hour)) return 0;
  const h = Math.trunc(hour);
  if (h < 0) return 0;
  if (h > 23) return 23;
  return h;
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
