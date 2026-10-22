"use client";

// components/converters/ConvertersSearchBox.jsx
//
// Fulfills a promise components/SiteStructuredData.jsx's WebSite
// schema already makes: a schema.org SearchAction with
// `urlTemplate: "${siteUrl}/converters?search={search_term_string}"`
// has existed site-wide since launch, but /converters itself never
// read a `?search=` param — the URL did nothing, which is exactly the
// kind of "structured data describing a capability the page doesn't
// actually have" Google's own guidelines flag, not just an unpolished
// corner. This component makes that promise real: a plain substring
// search over every currency this project supports (not just the 15
// curated FEATURED_BASE_CURRENCIES pills below it), linking straight
// to that currency's live `/converters/<code>` rate digest page.
//
// Reads its initial value from the `?search=` query param (so the
// SearchAction's URL template actually does something when a search
// engine or a shared link uses it), then filters client-side as the
// person types — no new network request, since CURRENCIES is already
// a small in-memory list.
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CURRENCIES } from "@/lib/currencies";
import { trackEvent } from "@/lib/gtag";

const MAX_RESULTS = 8;

export default function ConvertersSearchBox() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(normalized) || c.name.toLowerCase().includes(normalized)
    ).slice(0, MAX_RESULTS);
  }, [query]);

  return (
    <div className="mt-3">
      <label htmlFor="converters-search" className="sr-only">
        Search currencies
      </label>
      <input
        id="converters-search"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim()) {
            trackEvent("converters_search", { query_length: e.target.value.trim().length });
          }
        }}
        placeholder='Search any currency — e.g. "Japanese Yen" or "JPY"'
        autoComplete="off"
        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
      />
      {query.trim() && (
        <div className="mt-2 flex flex-wrap gap-2">
          {results.length > 0 ? (
            results.map((c) => (
              <Link
                key={c.code}
                href={`/converters/${c.code.toLowerCase()}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {c.flag} {c.code} — {c.name}
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400">No currency matches &quot;{query}&quot;.</p>
          )}
        </div>
      )}
    </div>
  );
}
