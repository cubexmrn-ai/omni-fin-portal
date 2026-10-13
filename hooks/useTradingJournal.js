"use client";

// hooks/useTradingJournal.js
//
// localStorage-backed CRUD for the Trading & Asset Journal
// (components/journal/JournalHub.jsx, app/journal/page.jsx). Same
// hydration/versioning/best-effort-persistence pattern as every other
// stateful feature on this site (hooks/useDashboardPresets.js,
// hooks/useDemoTrading.js, hooks/useAcademyProgress.js).
//
// WHY localStorage AND NOT IndexedDB: every other piece of per-browser
// state on this site already lives in localStorage, and a personal
// trade/asset journal — even a few thousand entries — is well within
// its ~5MB-per-origin budget. Matching the existing pattern keeps one
// persistence model across the whole app (and one place to reason
// about "best-effort, never load-bearing" storage failures) rather
// than introducing IndexedDB for just this one feature.
//
// CLOUD SYNC: this project has no account/sign-in system anywhere (see
// components/dashboard/DashboardHub.jsx's own closing note — "no
// separate account or sign-in... nothing here syncs across devices").
// So there is nothing real to "wire into" for cloud sync yet — this
// hook does not pretend otherwise. CSV/JSON export+import (below) is
// the actual, working way to move entries to another device or back
// them up today; components/journal/JournalHub.jsx shows cloud sync as
// a clearly-labeled "coming soon" affordance rather than a working
// button, so nothing here claims a capability that doesn't exist.
//
// STORAGE SHAPE (v1):
// { version: 1, entries: Array<{ id, category, createdAt, ...fields }> }

import { useCallback, useEffect, useState } from "react";
import { getCategory } from "@/lib/journalSchema";

const STORAGE_KEY = "omnifin.journal.entries.v1";

function emptyState() {
  return { version: 1, entries: [] };
}

function makeId() {
  return `j_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readStored() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return emptyState();
    return { version: 1, entries: parsed.entries };
  } catch {
    return emptyState();
  }
}

function writeStored(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort only — in-memory state still works for this session
    // even if persistence silently fails (e.g. private browsing, full
    // quota).
  }
}

/** Attaches each entry's schema-computed fields (P&L, cap rate, etc.)
 * without mutating the stored record itself — `derived` is always
 * recalculated from the raw fields, never persisted, so it can never
 * drift stale relative to the entry it describes. */
function withDerived(entry) {
  const category = getCategory(entry.category);
  const derived = category ? category.computeDerived(entry) : {};
  return { ...entry, derived };
}

export function useTradingJournal() {
  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStored());
    setHydrated(true);
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeStored(next);
      return next;
    });
  }, []);

  const addEntry = useCallback(
    (category, fields) => {
      const entry = { id: makeId(), category, createdAt: new Date().toISOString(), ...fields };
      persist((prev) => ({ ...prev, entries: [...prev.entries, entry] }));
      return entry.id;
    },
    [persist]
  );

  const updateEntry = useCallback(
    (id, fields) => {
      persist((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? { ...e, ...fields } : e)),
      }));
    },
    [persist]
  );

  const deleteEntry = useCallback(
    (id) => {
      persist((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
    },
    [persist]
  );

  const clearCategory = useCallback(
    (category) => {
      persist((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.category !== category) }));
    },
    [persist]
  );

  /**
   * Merges externally-sourced entries (from a JSON/CSV import) into
   * the existing set. Entries whose `id` already exists are left
   * alone — import never silently overwrites something already here;
   * duplicates get a fresh id instead of being skipped outright, since
   * a journal having "one too many" rows is a far smaller problem than
   * it silently dropping rows the person expected to see.
   */
  const importEntries = useCallback(
    (incoming) => {
      if (!Array.isArray(incoming) || incoming.length === 0) return 0;
      persist((prev) => {
        const existingIds = new Set(prev.entries.map((e) => e.id));
        const merged = [...prev.entries];
        for (const raw of incoming) {
          if (!raw || typeof raw !== "object" || !raw.category) continue;
          const id = raw.id && !existingIds.has(raw.id) ? raw.id : makeId();
          existingIds.add(id);
          merged.push({ ...raw, id, createdAt: raw.createdAt || new Date().toISOString() });
        }
        return { ...prev, entries: merged };
      });
      return incoming.length;
    },
    [persist]
  );

  const entriesByCategory = useCallback(
    (category) => state.entries.filter((e) => e.category === category).map(withDerived),
    [state.entries]
  );

  return {
    hydrated,
    entries: state.entries.map(withDerived),
    entriesByCategory,
    addEntry,
    updateEntry,
    deleteEntry,
    clearCategory,
    importEntries,
  };
}
