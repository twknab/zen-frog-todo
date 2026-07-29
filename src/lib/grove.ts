"use client";

import { usePersistentState } from "./storage";

/**
 * The Grove's one piece of persisted state: whether the archived-day history is
 * shown or hidden (specs/010-grove-history, US2). Collapsed by default so the
 * single live bonsai keeps center stage; the choice persists on-device and stays
 * in sync across instances via usePersistentState's same-key broadcast.
 */
const GROVE_VISIBLE_KEY = "frog-garden:grove-visible-v1";

export function useGroveVisibility() {
  return usePersistentState<boolean>(GROVE_VISIBLE_KEY, false);
}

/** Approximate column width for Grove row capacity (scene + padding). */
export const GROVE_ITEM_SLOT_PX = 120;

/** Gap between Grove columns (matches Grove.tsx `gap: 2` ≈ 16px). */
export const GROVE_ITEM_GAP_PX = 16;

/** How many ribbon items fit in one row for the current container width. */
export function computePerRow(
  containerWidth: number,
  itemSlotPx: number = GROVE_ITEM_SLOT_PX,
  gapPx: number = GROVE_ITEM_GAP_PX,
): number {
  if (containerWidth <= 0) return 1;
  const per = Math.floor((containerWidth + gapPx) / (itemSlotPx + gapPx));
  return Math.max(1, per);
}

/** Keep revealed count within [0, total] (and at least 0). */
export function clampRevealedCount(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(count, total));
}
