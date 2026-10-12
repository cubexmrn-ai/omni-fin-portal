"use client";

// lib/baseCurrencyContext.js
//
// A single, site-wide "Base Currency" — set from the dropdown in
// components/Header.jsx — that the Metals Calculator, the Universal
// Currency Converter and (via its own matching localStorage key, see
// below) the self-contained Trading Calculator Suite all read as
// their DEFAULT account/local currency, while every individual tool
// keeps its own manual-override dropdown untouched.
//
// PERSISTENCE: localStorage, under BASE_CURRENCY_STORAGE_KEY, so the
// choice survives a reload/new tab. Exported as a named constant
// (rather than only used internally) for one deliberate reason: app/
// calculators/page.jsx is a fully self-contained page with zero
// project-file imports by original design (see that file's own header
// comment) — specifically so it can never break from a missing-import
// deploy error. Importing this Context module there would quietly end
// that guarantee. Instead, that page reads/writes the SAME
// localStorage key and listens for the SAME custom event by literal
// string (duplicated as a comment-linked constant there), which keeps
// it perfectly in sync with this Context without taking on a single
// import. If you rename either constant below, update the matching
// literal in app/calculators/page.jsx too.
//
// SAME-TAB SYNC: the native "storage" event only fires in OTHER tabs,
// never the tab that made the write — so setBaseCurrency() also
// dispatches a same-tab CustomEvent (BASE_CURRENCY_EVENT) that any
// listener, Context-based or not, can subscribe to.

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const BASE_CURRENCY_STORAGE_KEY = "omnifin:baseCurrency";
export const BASE_CURRENCY_EVENT = "omnifin:baseCurrencyChange";
export const DEFAULT_BASE_CURRENCY = "USD";

const BaseCurrencyContext = createContext({
  baseCurrency: DEFAULT_BASE_CURRENCY,
  setBaseCurrency: () => {},
});

export function BaseCurrencyProvider({ children }) {
  const [baseCurrency, setBaseCurrencyState] = useState(DEFAULT_BASE_CURRENCY);

  // Hydrate from localStorage once on mount (client-only — this runs
  // after the initial server-rendered markup, so it never causes a
  // hydration mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BASE_CURRENCY_STORAGE_KEY);
      if (stored) setBaseCurrencyState(stored);
    } catch {
      // Private-browsing / blocked storage — fall back to the default
      // silently; this is a convenience, not durable state.
    }

    function handleExternalChange(e) {
      const next = e?.detail || e?.newValue;
      if (next) setBaseCurrencyState(next);
    }

    window.addEventListener(BASE_CURRENCY_EVENT, handleExternalChange);
    window.addEventListener("storage", handleExternalChange);
    return () => {
      window.removeEventListener(BASE_CURRENCY_EVENT, handleExternalChange);
      window.removeEventListener("storage", handleExternalChange);
    };
  }, []);

  const setBaseCurrency = useCallback((code) => {
    if (!code) return;
    setBaseCurrencyState(code);
    try {
      window.localStorage.setItem(BASE_CURRENCY_STORAGE_KEY, code);
    } catch {
      // Best-effort persistence only.
    }
    try {
      window.dispatchEvent(new CustomEvent(BASE_CURRENCY_EVENT, { detail: code }));
    } catch {
      // CustomEvent should always exist in a browser context, but
      // guard anyway so this never throws into a click handler.
    }
  }, []);

  return (
    <BaseCurrencyContext.Provider value={{ baseCurrency, setBaseCurrency }}>
      {children}
    </BaseCurrencyContext.Provider>
  );
}

export function useBaseCurrency() {
  return useContext(BaseCurrencyContext);
}
