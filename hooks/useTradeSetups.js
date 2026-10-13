"use client";

// hooks/useTradeSetups.js
//
// localStorage-backed hook for the Trade Setup Sharing Board
// (components/community/setup/SetupBoard.jsx). Same SSR-safe hydration
// + "seed data + this browser's own submissions" pattern as
// hooks/useCommunityPosts.js: a setup posted via PostSetupModal is
// prepended to a locally-persisted list and rendered immediately, with
// no backend involved — it's real, it's just local to this browser.

import { useCallback, useEffect, useState } from "react";
import { SEED_SETUPS } from "@/lib/tradeSetupsData";

const STORAGE_KEY = "omnifin.community.setups.v1";

function readStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(userSetups) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userSetups));
  } catch {
    // Best-effort only — the UI still works for the current render, it
    // just won't persist (private browsing, storage quota, etc.).
  }
}

export function useTradeSetups() {
  const [userSetups, setUserSetups] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUserSetups(readStorage());
    setHydrated(true);
  }, []);

  const addSetup = useCallback((setup) => {
    const newSetup = {
      ...setup,
      id: `setup-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      isUserSubmitted: true,
    };
    setUserSetups((prev) => {
      const next = [newSetup, ...prev];
      writeStorage(next);
      return next;
    });
    return newSetup;
  }, []);

  // This browser's own submissions first (newest on top), then the
  // seed set — so a freshly-posted setup appears at the top of the
  // board immediately.
  const allSetups = [...userSetups, ...SEED_SETUPS];

  return { hydrated, allSetups, addSetup };
}
