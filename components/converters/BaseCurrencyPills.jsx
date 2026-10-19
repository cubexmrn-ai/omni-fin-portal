"use client";

// components/converters/BaseCurrencyPills.jsx
//
// "Browse by base currency" pill row on /converters — split out into
// its own small client component purely so the click can fire a GA4
// `switch_base_currency_table` event (window.gtag calls need "use
// client"; app/converters/page.jsx itself is a Server Component).
// Pure presentation/navigation otherwise — the Link still does the
// actual navigation to /converters/<code>.

import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

export default function BaseCurrencyPills({ currencies }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {currencies.map(({ code, currency }) => (
        <Link
          key={code}
          href={`/converters/${code.toLowerCase()}`}
          onClick={() => trackEvent("switch_base_currency_table", { base_currency: code })}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          {currency.flag} {code}
        </Link>
      ))}
    </div>
  );
}
