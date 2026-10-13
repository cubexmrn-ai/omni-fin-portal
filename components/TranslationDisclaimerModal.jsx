"use client";

// components/TranslationDisclaimerModal.jsx
//
// A global, one-time modal shown whenever the site's language is set
// to anything other than English — including Roman Urdu — telling the
// visitor plainly that English is OmniFin Portal's native/authoritative
// language and translated copy may carry minor terminology variations.
// Mounted once in app/layout.jsx (inside LanguageProvider) so it covers
// every page, not just specific routes.
//
// Persistence: a plain localStorage flag, same pattern as
// lib/i18n/LanguageContext.js and lib/baseCurrencyContext.js — once the
// visitor clicks "I Understand" the modal won't reappear on this
// browser, even across a later language switch, so it reads as a
// one-time notice rather than a nag on every language change.

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ACK_STORAGE_KEY = "omnifin:translationDisclaimerAck";

export default function TranslationDisclaimerModal() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (language === "en") {
      setOpen(false);
      return;
    }
    try {
      const acknowledged = window.localStorage.getItem(ACK_STORAGE_KEY);
      if (!acknowledged) setOpen(true);
    } catch {
      // Private browsing / blocked storage — fail open (show the notice
      // once this render; worst case it reappears next visit, which is
      // harmless for a plain informational notice).
      setOpen(true);
    }
  }, [language]);

  function handleAcknowledge() {
    setOpen(false);
    try {
      window.localStorage.setItem(ACK_STORAGE_KEY, "1");
    } catch {
      // Best-effort persistence only.
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="translation-disclaimer-text"
    >
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-2xl" aria-hidden="true">
            🌐
          </span>
          <p id="translation-disclaimer-text" className="text-sm leading-relaxed text-slate-700">
            {t("translationDisclaimerText")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAcknowledge}
          className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          {t("translationDisclaimerButton")}
        </button>
      </div>
    </div>
  );
}
