"use client";

// components/ComplianceDisclaimerModal.jsx
//
// PHASE 5 — a reusable financial-education compliance disclaimer,
// distinct from components/TranslationDisclaimerModal.jsx (which only
// warns that translated COPY may carry minor terminology variations).
// This one restates the same "educational only, not financial advice"
// position already codified on /disclaimer, but as a one-time,
// must-acknowledge modal rather than a page a visitor has to go find —
// standard practice for a site that teaches people how to size trades
// and manage risk.
//
// TRIGGER CONDITIONS (either one shows it, same single flag covers
// both so acknowledging once covers both reasons):
//   1. The site language is anything other than English — the
//      moment a learner is reading translated educational material is
//      exactly when a clear, native-language risk notice matters most.
//   2. The visitor opens any Academy lesson page (/learn/[level]/[lesson])
//      — nearly all Academy content is financial/trading education, so
//      "financial lessons" in practice means "the lesson reader."
//
// Persistence: one localStorage flag, same best-effort pattern as every
// other consent flag on this site (lib/i18n/LanguageContext.js,
// TranslationDisclaimerModal.jsx) — once acknowledged, it doesn't
// reappear on this browser, on any language or any lesson.
//
// Mounted once in app/layout.jsx (inside LanguageProvider), so it can
// watch the current route via usePathname() without every page having
// to render it itself.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ACK_STORAGE_KEY = "omnifin:complianceDisclaimerAck";

export default function ComplianceDisclaimerModal() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isLessonPage = Boolean(pathname && /^\/learn\/[^/]+\/[^/]+/.test(pathname));
  const shouldShow = language !== "en" || isLessonPage;

  useEffect(() => {
    if (!shouldShow) {
      setOpen(false);
      return;
    }
    try {
      const acknowledged = window.localStorage.getItem(ACK_STORAGE_KEY);
      if (!acknowledged) setOpen(true);
    } catch {
      // Private browsing / blocked storage — fail open (show the
      // notice once this render; worst case it reappears next visit,
      // which is harmless for a plain informational notice).
      setOpen(true);
    }
  }, [shouldShow]);

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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-disclaimer-text"
    >
      <div className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-2xl" aria-hidden="true">
            ⚠️
          </span>
          <p id="compliance-disclaimer-text" className="text-sm leading-relaxed text-slate-700">
            {t("complianceDisclaimerText")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAcknowledge}
          className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          {t("complianceDisclaimerButton")}
        </button>
      </div>
    </div>
  );
}
