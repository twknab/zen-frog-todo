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
