"use client";

// hooks/useDashboardPresets.js
//
// localStorage-backed "quick presets" for the User Dashboard
// (app/dashboard/page.jsx): a favorited currency pair, a default lot
// size, and a preferred metal — so the dashboard has something real to
// show under "Saved Conversion & Calculator Presets" instead of
// fabricated numbers. Same persistence pattern as
// hooks/useAcademyProgress.js and hooks/useDemoTrading.js.
//
// HONESTY NOTE: this project has no account/server-side presets system
// for the Converter or Calculator Suite, so there was nothing existing
// to merely "display" here (the one real site-wide preference that
// already existed — Base Currency — is read separately, via
// lib/baseCurrencyContext.js's useBaseCurrency()). This hook adds the
// smallest real mechanism that can back the dashboard's "favorited
// currency pair / default lot size / metal preference" cards: the
// person sets them once on the dashboard itself, and they persist from
// then on — never invented defaults presented as if the person chose
// them.
//
// STORAGE SHAPE (v1):
// { version: 1, favoritePair: string|null, defaultLotSize: number|null, preferredMetal: string|null }

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "omnifin.dashboard.presets.v1";

function emptyState() {
  return {
    version: 1,
    favoritePair: null,
    defaultLotSize: null,
    preferredMetal: null,
  };
}

function readStoredPresets() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      version: 1,
      favoritePair: typeof parsed.favoritePair === "string" ? parsed.favoritePair : null,
      defaultLotSize: Number.isFinite(parsed.defaultLotSize) ? parsed.defaultLotSize : null,
      preferredMetal: typeof parsed.preferredMetal === "string" ? parsed.preferredMetal : null,
    };
  } catch {
    return emptyState();
  }
}

function writeStoredPresets(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort only — in-memory state still works for this session
    // even if persistence silently fails.
  }
}

export function useDashboardPresets() {
  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredPresets());
    setHydrated(true);
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeStoredPresets(next);
      return next;
    });
  }, []);

  const setFavoritePair = useCallback(
    (pair) => persist((prev) => ({ ...prev, favoritePair: pair || null })),
    [persist]
  );

  const setDefaultLotSize = useCallback(
    (lots) =>
      persist((prev) => ({
        ...prev,
        defaultLotSize: Number.isFinite(Number(lots)) && Number(lots) > 0 ? Number(lots) : null,
      })),
    [persist]
  );

  const setPreferredMetal = useCallback(
    (metal) => persist((prev) => ({ ...prev, preferredMetal: metal || null })),
    [persist]
  );

  return {
    hydrated,
    favoritePair: state.favoritePair,
    defaultLotSize: state.defaultLotSize,
    preferredMetal: state.preferredMetal,
    setFavoritePair,
    setDefaultLotSize,
    setPreferredMetal,
  };
}
