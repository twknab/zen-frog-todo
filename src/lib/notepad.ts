"use client";

import { usePersistentState } from "@/lib/storage";

/** Persistent engineering notepad — survives new day; not part of ArchivedDay. */
export const NOTEPAD_KEY = "frog-garden:notepad-v1";

/** Thin wrapper around the persistent eng-notepad string. */
export function useNotepad() {
  return usePersistentState(NOTEPAD_KEY, "");
}
