"use client";

// hooks/useGuestIdentity.js
//
// A small, persistent (localStorage) display handle for guest
// (no-account) Community posting — added Oct 2026 alongside the
// friction-free guest posting path (app/api/community/posts|comments,
// lib/communityStore.js). A guest's post is now a real row in the
// public community_posts table, so it needs SOME display name, but
// requiring an account/email just to pick one would recreate the
// exact friction this feature removes. Generates a stable "Guest1234"-
// style handle on first use, lets the visitor rename it to anything
// they like, and remembers the choice for next time — same
// localStorage-first shape as hooks/useTradingJournal.js's guest mode.
//
// Deliberately NOT tied to any account: this is a per-browser display
// name, not an identity. Signing in (hooks/useSupabaseAuth.js) is a
// separate, still-optional upgrade path for a visitor who wants their
// posts tied to a real account across devices — unaffected by this.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "omnifin.community.guestHandle.v1";
const MAX_HANDLE_LENGTH = 24;

function randomHandle() {
  return `Guest${Math.floor(1000 + Math.random() * 9000)}`;
}

function sanitize(raw) {
  const cleaned = (raw || "").toString().trim().replace(/[<>]/g, "").slice(0, MAX_HANDLE_LENGTH);
  return cleaned;
}

export function useGuestIdentity() {
  const [handle, setHandleState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored = "";
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      stored = "";
    }
    if (!stored) {
      stored = randomHandle();
      try {
        window.localStorage.setItem(STORAGE_KEY, stored);
      } catch {
        // Best-effort only (private browsing, storage quota) — the
        // generated handle still works for this render, it just won't
        // persist to the next visit.
      }
    }
    setHandleState(stored);
    setHydrated(true);
  }, []);

  const setHandle = useCallback((raw) => {
    const clean = sanitize(raw) || randomHandle();
    setHandleState(clean);
    try {
      window.localStorage.setItem(STORAGE_KEY, clean);
    } catch {
      // Best-effort only — see above.
    }
  }, []);

  return { handle, setHandle, hydrated };
}
