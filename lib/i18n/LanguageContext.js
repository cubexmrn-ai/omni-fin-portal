"use client";

// lib/i18n/LanguageContext.js
//
// A single, site-wide UI language — set from the Language dropdown in
// components/Header.jsx, right next to the Base Currency switcher —
// following the exact same pattern as lib/baseCurrencyContext.js:
// localStorage-persisted, with a same-tab CustomEvent (the native
// "storage" event only fires in OTHER tabs) so every component using
// useLanguage() re-renders immediately when the choice changes.
//
// `t(key)` looks the key up in lib/i18n/translations.js's dictionary
// for the current language, falling back to English and then to the
// raw key itself, so a missing translation never renders blank.
//
// Just like BASE_CURRENCY_STORAGE_KEY/_EVENT in baseCurrencyContext.js,
// app/calculators/page.jsx (zero project-file imports, by design) does
// NOT import this module — it reads/writes the identical localStorage
// key and listens for the identical CustomEvent by literal string
// instead. Keep LANGUAGE_STORAGE_KEY/LANGUAGE_EVENT here in sync with
// the matching literals there if you ever rename them.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_LANGUAGE, translate } from "@/lib/i18n/translations";

export const LANGUAGE_STORAGE_KEY = "omnifin:language";
export const LANGUAGE_EVENT = "omnifin:languageChange";

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) setLanguageState(stored);
    } catch {
      // Private-browsing / blocked storage — stay on the default.
    }

    function handleExternalChange(e) {
      const next = e?.detail || e?.newValue;
      if (next) setLanguageState(next);
    }

    window.addEventListener(LANGUAGE_EVENT, handleExternalChange);
    window.addEventListener("storage", handleExternalChange);
    return () => {
      window.removeEventListener(LANGUAGE_EVENT, handleExternalChange);
      window.removeEventListener("storage", handleExternalChange);
    };
  }, []);

  const setLanguage = useCallback((code) => {
    if (!code) return;
    setLanguageState(code);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // Best-effort persistence only.
    }
    try {
      window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: code }));
    } catch {
      // Guard only — CustomEvent always exists in a browser context.
    }
  }, []);

  const t = useCallback((key) => translate(language, key), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
