"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePersistentState } from "@/lib/storage";

/** Persistent engineering notepad — survives new day; not part of ArchivedDay. */
export const NOTEPAD_KEY = "frog-garden:notepad-v1";

export type NotepadTab = {
  id: string;
  title: string;
  body: string;
};

export type NotepadDocument = {
  v: 1;
  tabs: NotepadTab[];
  activeTabId: string;
};

function makeId(): string {
  return `tab-${Math.random().toString(36).slice(2, 10)}`;
}

/** Blank / whitespace titles become Untitled. */
export function normalizeTabTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : "Untitled";
}

export function createTab(title: string, body = ""): NotepadTab {
  return { id: makeId(), title: normalizeTabTitle(title), body };
}

/** Default empty collection — one My Note tab (used for missing storage). */
export function createEmptyDocument(title = "My Note"): NotepadDocument {
  const tab = createTab(title, "");
  return { v: 1, tabs: [tab], activeTabId: tab.id };
}

function isNotepadDocument(value: unknown): value is NotepadDocument {
  if (!value || typeof value !== "object") return false;
  const v = value as NotepadDocument;
  return (
    v.v === 1 &&
    Array.isArray(v.tabs) &&
    v.tabs.length > 0 &&
    typeof v.activeTabId === "string" &&
    v.tabs.every(
      (t) =>
        t &&
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        typeof t.body === "string",
    )
  );
}

/** Coerce legacy string or malformed storage into a valid document. */
export function migrateNotepadValue(value: unknown): NotepadDocument {
  if (typeof value === "string") {
    const tab = createTab("My Note", value);
    return { v: 1, tabs: [tab], activeTabId: tab.id };
  }
  if (isNotepadDocument(value)) {
    const tabs = value.tabs.map((t) => ({
      ...t,
      title: normalizeTabTitle(t.title),
    }));
    const activeTabId = tabs.some((t) => t.id === value.activeTabId)
      ? value.activeTabId
      : tabs[0].id;
    return { v: 1, tabs, activeTabId };
  }
  return createEmptyDocument();
}

/**
 * Import merge / clash helper. Exact title match; Version 2, 3, … until free.
 * Manual renames may still duplicate — this is for import only.
 */
export function uniqueTabTitle(desired: string, takenTitles: string[]): string {
  const base = normalizeTabTitle(desired);
  if (!takenTitles.includes(base)) return base;
  let n = 2;
  while (takenTitles.includes(`${base} (Version ${n})`)) n += 1;
  return `${base} (Version ${n})`;
}

/** Basename without extension; empty → Untitled. */
export function titleFromFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "";
  const withoutExt = base.replace(/\.[^.]+$/, "");
  return normalizeTabTitle(withoutExt || "Untitled");
}

/** Turn a FullExport.notepad field (document or legacy string) into tabs to merge. */
export function notepadTabsFromExportField(field: unknown): NotepadTab[] {
  if (field === undefined || field === null) return [];
  if (typeof field === "string") {
    if (field === "") return [];
    return [createTab("My Note", field)];
  }
  if (isNotepadDocument(field)) {
    return field.tabs.map((t) => createTab(t.title, t.body));
  }
  return [];
}

/** Append incoming tabs with new ids + Version N titles; keep local active. */
export function mergeNotepadDocuments(
  local: NotepadDocument,
  incomingTabs: NotepadTab[],
): NotepadDocument {
  const taken = local.tabs.map((t) => t.title);
  const appended: NotepadTab[] = [];
  for (const tab of incomingTabs) {
    const title = uniqueTabTitle(tab.title, taken);
    taken.push(title);
    appended.push({ id: makeId(), title, body: tab.body });
  }
  if (appended.length === 0) return local;
  return {
    v: 1,
    tabs: [...local.tabs, ...appended],
    activeTabId: local.activeTabId,
  };
}

export type UseNotepadResult = {
  document: NotepadDocument;
  activeTab: NotepadTab;
  setActiveTabId: (id: string) => void;
  updateActiveBody: (body: string) => void;
  addTab: () => void;
  renameTab: (id: string, title: string) => void;
  moveTab: (id: string, direction: -1 | 1) => void;
  deleteTab: (id: string) => boolean;
  importMarkdown: (title: string, body: string) => void;
  mergeImportedTabs: (tabs: NotepadTab[]) => void;
};

/**
 * Persistent tabbed eng-notepad. Migrates legacy string body → My Note on read.
 */
export function useNotepad(): UseNotepadResult {
  const [stored, setStored] = usePersistentState<NotepadDocument | string>(
    NOTEPAD_KEY,
    createEmptyDocument(),
  );
  const migratedOnce = useRef(false);

  const document = useMemo(() => migrateNotepadValue(stored), [stored]);

  // One-shot write-back when storage still holds a legacy string / invalid shape.
  useEffect(() => {
    if (migratedOnce.current) return;
    if (isNotepadDocument(stored)) {
      migratedOnce.current = true;
      return;
    }
    migratedOnce.current = true;
    setStored(migrateNotepadValue(stored));
  }, [stored, setStored]);

  const setDocument = useCallback(
    (updater: (prev: NotepadDocument) => NotepadDocument) => {
      setStored((prev) => updater(migrateNotepadValue(prev)));
    },
    [setStored],
  );

  const activeTab = useMemo(() => {
    return document.tabs.find((t) => t.id === document.activeTabId) ?? document.tabs[0];
  }, [document]);

  const setActiveTabId = useCallback(
    (id: string) => {
      setDocument((prev) =>
        prev.tabs.some((t) => t.id === id) ? { ...prev, activeTabId: id } : prev,
      );
    },
    [setDocument],
  );

  const updateActiveBody = useCallback(
    (body: string) => {
      setDocument((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) => (t.id === prev.activeTabId ? { ...t, body } : t)),
      }));
    },
    [setDocument],
  );

  const addTab = useCallback(() => {
    setDocument((prev) => {
      const tab = createTab("Untitled", "");
      return { v: 1, tabs: [...prev.tabs, tab], activeTabId: tab.id };
    });
  }, [setDocument]);

  const renameTab = useCallback(
    (id: string, title: string) => {
      setDocument((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === id ? { ...t, title: normalizeTabTitle(title) } : t,
        ),
      }));
    },
    [setDocument],
  );

  const moveTab = useCallback(
    (id: string, direction: -1 | 1) => {
      setDocument((prev) => {
        const index = prev.tabs.findIndex((t) => t.id === id);
        if (index < 0) return prev;
        const next = index + direction;
        if (next < 0 || next >= prev.tabs.length) return prev;
        const tabs = [...prev.tabs];
        const [item] = tabs.splice(index, 1);
        tabs.splice(next, 0, item);
        return { ...prev, tabs };
      });
    },
    [setDocument],
  );

  const deleteTab = useCallback(
    (id: string): boolean => {
      let deleted = false;
      setDocument((prev) => {
        if (prev.tabs.length <= 1) return prev;
        const index = prev.tabs.findIndex((t) => t.id === id);
        if (index < 0) return prev;
        deleted = true;
        const tabs = prev.tabs.filter((t) => t.id !== id);
        let activeTabId = prev.activeTabId;
        if (activeTabId === id) {
          const neighbor = tabs[Math.min(index, tabs.length - 1)];
          activeTabId = neighbor.id;
        }
        return { v: 1, tabs, activeTabId };
      });
      return deleted;
    },
    [setDocument],
  );

  const importMarkdown = useCallback(
    (title: string, body: string) => {
      setDocument((prev) => {
        const unique = uniqueTabTitle(
          title,
          prev.tabs.map((t) => t.title),
        );
        const tab = createTab(unique, body);
        // createTab re-normalizes; preserve unique Version N title
        tab.title = unique;
        return { v: 1, tabs: [...prev.tabs, tab], activeTabId: tab.id };
      });
    },
    [setDocument],
  );

  const mergeImportedTabs = useCallback(
    (tabs: NotepadTab[]) => {
      setDocument((prev) => mergeNotepadDocuments(prev, tabs));
    },
    [setDocument],
  );

  return {
    document,
    activeTab,
    setActiveTabId,
    updateActiveBody,
    addTab,
    renameTab,
    moveTab,
    deleteTab,
    importMarkdown,
    mergeImportedTabs,
  };
}
