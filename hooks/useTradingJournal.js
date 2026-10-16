"use client";

// hooks/useTradingJournal.js
//
// CRUD for the Trading & Asset Journal (components/journal/JournalHub.jsx,
// app/journal/page.jsx) — now with real cloud sync.
//
// RETENTION UPGRADE (Multi-Persona UX & Retention Gap Audit's
// structural roadmap item: "give the Journal... real accounts + cloud
// sync"): this hook used to be localStorage-only by necessity — the
// project had no accounts or backend at all (see the previous header
// comment's note that there was "nothing real to wire into yet").
// lib/supabase.js + hooks/useSupabaseAuth.js now provide both, so:
//
//   - Signed in, Supabase configured: entries live in the
//     `trading_journal` Postgres table (see SUPABASE_SETUP.md for the
//     schema + required Row Level Security policies), synced across
//     every device the person signs into.
//   - Guest (not signed in), OR Supabase not configured for this
//     deployment, OR a cloud call fails: falls back to the exact same
//     localStorage behavior this hook always had — never a crash,
//     never a blocked UI, never data silently dropped. A guest's
//     localStorage entries are offered a one-time upload the first
//     time they sign in (see `migrateLocalToCloud` below), so signing
//     up doesn't orphan work already done as a guest.
//
// STORAGE SHAPE (v1, unchanged for the localStorage path):
// { version: 1, entries: Array<{ id, category, createdAt, ...fields }> }
//
// CLOUD TABLE SHAPE: one row per entry — id (text, client-generated,
// so local and cloud ids are interchangeable), user_id (uuid), category
// (text), created_at (timestamptz), fields (jsonb — every entry field
// other than id/category/createdAt, since the field set varies per
// category; see lib/journalSchema.js).

import { useCallback, useEffect, useRef, useState } from "react";
import { getCategory } from "@/lib/journalSchema";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const STORAGE_KEY = "omnifin.journal.entries.v1";
const TABLE = "trading_journal";

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

/** Entry (flat, app-shape) <-> cloud row (id/user_id/category/created_at + fields jsonb). */
function toRow(entry, userId) {
  const { id, category, createdAt, ...fields } = entry;
  return { id, user_id: userId, category, created_at: createdAt, fields };
}
function fromRow(row) {
  return { id: row.id, category: row.category, createdAt: row.created_at, ...(row.fields || {}) };
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
  const { user, authLoading } = useSupabaseAuth();
  const cloudReady = isSupabaseConfigured();
  const cloudActive = cloudReady && Boolean(user);

  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState("");
  const migratedForUser = useRef(null);

  // Guest/local hydration — always runs, so there's a safe default even
  // while auth is still resolving or cloud calls are in flight.
  useEffect(() => {
    setState(readStored());
    setHydrated(true);
  }, []);

  // Cloud hydration + one-time guest->cloud migration, whenever a user
  // becomes available. Falls back to whatever's already in `state`
  // (local) on any failure — never clears entries the person can see.
  useEffect(() => {
    if (!cloudActive || authLoading) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (cancelled) return;

        let cloudEntries = (data || []).map(fromRow);

        // One-time migration: a guest who had local entries before
        // signing in gets them uploaded once per session, deduped by
        // id, so switching to an account never loses journal history.
        if (migratedForUser.current !== user.id) {
          migratedForUser.current = user.id;
          const local = readStored().entries;
          const cloudIds = new Set(cloudEntries.map((e) => e.id));
          const toUpload = local.filter((e) => !cloudIds.has(e.id));
          if (toUpload.length > 0) {
            const { error: insertError } = await supabase
              .from(TABLE)
              .insert(toUpload.map((e) => toRow(e, user.id)));
            if (!insertError) cloudEntries = [...cloudEntries, ...toUpload];
          }
        }

        if (!cancelled) {
          setState({ version: 1, entries: cloudEntries });
          setSyncError("");
        }
      } catch (err) {
        if (!cancelled) setSyncError(err.message || "Couldn't reach the cloud journal — showing this browser's local entries.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cloudActive, authLoading, user]);

  // Local persistence — still runs even in cloud mode, so a signed-in
  // person always has an up-to-date offline copy if a Supabase call
  // ever fails mid-session.
  const persistLocal = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeStored(next);
      return next;
    });
  }, []);

  const addEntry = useCallback(
    (category, fields) => {
      const entry = { id: makeId(), category, createdAt: new Date().toISOString(), ...fields };

      if (cloudActive) {
        persistLocal((prev) => ({ ...prev, entries: [...prev.entries, entry] }));
        const supabase = getSupabaseClient();
        supabase
          ?.from(TABLE)
          .insert(toRow(entry, user.id))
          .then(({ error }) => {
            if (error) setSyncError("Saved locally, but couldn't sync to the cloud right now.");
          });
      } else {
        persistLocal((prev) => ({ ...prev, entries: [...prev.entries, entry] }));
      }
      return entry.id;
    },
    [cloudActive, persistLocal, user]
  );

  const updateEntry = useCallback(
    (id, fields) => {
      persistLocal((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? { ...e, ...fields } : e)),
      }));

      if (cloudActive) {
        const supabase = getSupabaseClient();
        const { category, createdAt, id: _id, ...restFields } = fields;
        supabase
          ?.from(TABLE)
          .update({ fields: restFields })
          .eq("id", id)
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (error) setSyncError("Updated locally, but couldn't sync to the cloud right now.");
          });
      }
    },
    [cloudActive, persistLocal, user]
  );

  const deleteEntry = useCallback(
    (id) => {
      persistLocal((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));

      if (cloudActive) {
        const supabase = getSupabaseClient();
        supabase
          ?.from(TABLE)
          .delete()
          .eq("id", id)
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (error) setSyncError("Deleted locally, but couldn't sync to the cloud right now.");
          });
      }
    },
    [cloudActive, persistLocal, user]
  );

  const clearCategory = useCallback(
    (category) => {
      const idsToRemove = state.entries.filter((e) => e.category === category).map((e) => e.id);
      persistLocal((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.category !== category) }));

      if (cloudActive && idsToRemove.length > 0) {
        const supabase = getSupabaseClient();
        supabase
          ?.from(TABLE)
          .delete()
          .in("id", idsToRemove)
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (error) setSyncError("Cleared locally, but couldn't sync to the cloud right now.");
          });
      }
    },
    [cloudActive, persistLocal, state.entries, user]
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
      let uploaded = [];
      persistLocal((prev) => {
        const existingIds = new Set(prev.entries.map((e) => e.id));
        const merged = [...prev.entries];
        for (const raw of incoming) {
          if (!raw || typeof raw !== "object" || !raw.category) continue;
          const id = raw.id && !existingIds.has(raw.id) ? raw.id : makeId();
          existingIds.add(id);
          const entry = { ...raw, id, createdAt: raw.createdAt || new Date().toISOString() };
          merged.push(entry);
          uploaded.push(entry);
        }
        return { ...prev, entries: merged };
      });

      if (cloudActive && uploaded.length > 0) {
        const supabase = getSupabaseClient();
        supabase
          ?.from(TABLE)
          .insert(uploaded.map((e) => toRow(e, user.id)))
          .then(({ error }) => {
            if (error) setSyncError("Imported locally, but couldn't sync to the cloud right now.");
          });
      }
      return incoming.length;
    },
    [cloudActive, persistLocal, user]
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
    // New — cloud sync status, additive to the existing API above so
    // every current call site keeps working unchanged.
    cloudReady, // Supabase is configured for this deployment at all
    cloudActive, // AND this person is actually signed in right now
    syncError,
  };
}
