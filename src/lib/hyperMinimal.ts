"use client";

import { usePersistentState } from "./storage";

/**
 * Hyper Minimal preference (specs/017-hyper-minimal): when on, decorative /
 * instructional chrome is hidden in Flow and Focus while functional controls
 * and garden visuals stay. Persists on-device; same-key broadcast keeps Options
 * and dashboard consumers in sync.
 */
export const HYPER_MINIMAL_KEY = "frog-garden:hyper-minimal-v1";

export function useHyperMinimal() {
  return usePersistentState<boolean>(HYPER_MINIMAL_KEY, false);
}
