"use client";

// components/LegalNoticeBanner.jsx
//
// Standard multilingual-site practice: the binding legal body text on
// Privacy/Terms/Disclaimer stays in its original English (the single
// authoritative version) rather than being machine-translated, but a
// translated notice banner tells non-English readers that plainly and
// points them to the About page for help — so they aren't just shown
// a wall of English with no explanation when every other page on the
// site is in their language.

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LegalNoticeBanner() {
  const { t } = useLanguage();
  return (
    <div className="mt-5 inline-flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <svg
        width="16"
        height="16"
        className="mt-0.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{t("legalNoticeBanner")}</span>
    </div>
  );
}
