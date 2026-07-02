"use client";

import { useEffect, useState } from "react";

/**
 * localStorage-backed useState. Server/first paint always uses initialValue
 * (avoids hydration mismatches); the stored value, if any, replaces it right
 * after mount. Silently keeps in-memory state if storage is unavailable
 * (e.g. private browsing) rather than throwing.
 */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount, intentionally
    // outside the render path — required so the server/first-paint render
    // stays SSR-safe (no `window`) and hydration never mismatches.
    try {
      const raw = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      // malformed or inaccessible — keep the default
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage unavailable — degrade to in-memory only
    }
  }, [key, state, hydrated]);

  return [state, setState] as const;
}
