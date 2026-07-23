"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * Same-document pub/sub so that multiple `usePersistentState` instances sharing
 * one key stay in sync in-memory (e.g. the FocusTimer writes the session count
 * and the Bonsai card reads it in the same render tree). localStorage alone
 * only syncs across tabs via the `storage` event, not within one document.
 */
type Listener = (value: unknown) => void;
const keyListeners = new Map<string, Set<Listener>>();

function subscribe(key: string, listener: Listener): () => void {
  let set = keyListeners.get(key);
  if (!set) {
    set = new Set();
    keyListeners.set(key, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
  };
}

function broadcast(key: string, value: unknown, self: Listener | null): void {
  const set = keyListeners.get(key);
  if (!set) return;
  for (const listener of set) {
    if (listener !== self) listener(value);
  }
}

/**
 * Imperative write for non-React call sites (e.g. sync sand capture before
 * wipe). Persists to localStorage and notifies every `usePersistentState`
 * subscriber for `key`. Swallows storage errors (quota / private mode).
 */
export function writePersistentValue<T>(key: string, value: T): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // storage unavailable or quota exceeded — still broadcast in-memory
  }
  broadcast(key, value, null);
}

/**
 * localStorage-backed useState. Server/first paint always uses initialValue
 * (avoids hydration mismatches); the stored value, if any, replaces it right
 * after mount. Writes persist synchronously and notify sibling instances of
 * the same key. Silently keeps in-memory state if storage is unavailable
 * (e.g. private browsing) rather than throwing.
 */
export function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  // Mirror of the latest value so the setter can compute functional updates
  // and broadcast without doing side effects inside the state updater. Kept
  // in sync at every state-transition site (hydration, sibling listener,
  // setter) rather than during render, so it never goes stale.
  const stateRef = useRef<T>(state);

  // Stable per-instance listener identity (so we can exclude ourselves on broadcast).
  const listenerRef = useRef<Listener>(() => {});

  useEffect(() => {
    // One-time hydration from localStorage after mount, intentionally
    // outside the render path — keeps server/first-paint SSR-safe.
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        stateRef.current = parsed;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(parsed);
      }
    } catch {
      // malformed or inaccessible — keep the default
    }
  }, [key]);

  useEffect(() => {
    const listener: Listener = (value) => {
      stateRef.current = value as T;
      setState(value as T);
    };
    listenerRef.current = listener;
    return subscribe(key, listener);
  }, [key]);

  const setPersisted = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      const prev = stateRef.current;
      const next =
        typeof action === "function" ? (action as (p: T) => T)(prev) : action;
      stateRef.current = next;
      setState(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage unavailable — degrade to in-memory only
      }
      broadcast(key, next, listenerRef.current);
    },
    [key],
  );

  return [state, setPersisted] as const;
}
