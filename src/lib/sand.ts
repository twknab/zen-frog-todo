"use client";

import { useCallback } from "react";
import { usePersistentState } from "./storage";

/**
 * A tiny shared "reset token" for the Sand Mode canvas. The canvas itself holds
 * its strokes in memory (not persisted), so to clear it from elsewhere — the
 * mini reset button, or "start a new day" — we bump a token that SandCanvas
 * watches. Using usePersistentState's same-key broadcast lets any instance
 * trigger the clear without prop-drilling across the tree.
 */
const SAND_RESET_KEY = "frog-garden:sand-reset-v1";

export function useSandReset() {
  const [sandResetToken, setToken] = usePersistentState(SAND_RESET_KEY, 0);
  const resetSand = useCallback(() => setToken((t) => t + 1), [setToken]);
  return { sandResetToken, resetSand };
}
