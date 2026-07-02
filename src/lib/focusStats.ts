"use client";

import { useCallback } from "react";
import { usePersistentState } from "./storage";

type FocusStatsState = {
  completedSessions: number;
};

const DEFAULT_STATE: FocusStatsState = {
  completedSessions: 0,
};

export function useFocusStats() {
  const [state, setState] = usePersistentState<FocusStatsState>(
    "frog-garden:focus-stats-v1",
    DEFAULT_STATE,
  );

  const recordSessionComplete = useCallback(() => {
    setState((current) => ({
      ...current,
      completedSessions: current.completedSessions + 1,
    }));
  }, [setState]);

  return {
    completedSessions: state.completedSessions,
    recordSessionComplete,
  };
}
