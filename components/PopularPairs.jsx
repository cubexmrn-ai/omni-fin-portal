"use client";

// components/PopularPairs.jsx
//
// Internal cross-linking block for the bottom of a converter SEO page
// (app/converters/[pair]/page.jsx) — "Popular Currency & Metal Pairs."
// Helps search engines discover the other programmatic routes and
// keeps visitors on-site. Excludes whichever pair is already showing.
//
// WEEK 4 UPGRADE: with lib/pairSlugs.js's FEATURED_PAIRS now 45 pairs
// (up from 16), the original version — a plain `.slice(0, 8)` off the
// start of the array — would show the exact same first 8 pairs on
// every single page, so most of the long tail would never get linked
// to from anywhere. Two fixes:
//   1. Category tabs (All / Fiat / Crypto / Metals) so a visitor (and
//      a crawler) can reach every pair, not just whichever 8 happen to
//      sit first in the array.
//   2. A deterministic rotation seeded by `currentSlug` — NOT
//      Math.random(), which would make the server-rendered HTML and
//      the client's first render disagree and trigger a hydration
//      mismatch. Each page's own slug produces a stable starting
//      offset into the list, so different pair pages surface
//      different slices of the full catalog (spreading internal link
//      equity across all 45 pairs) while any single page always
//      renders the same thing on every visit/build.

import { useState } from "react";
import Link from "next/link";

const CLASS_BADGE = {
  fiat: "bg-blue-50 text-blue-700",
  crypto: "bg-amber-50 text-amber-700",
  metals: "bg-orange-50 text-orange-700",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "fiat", label: "Fiat" },
  { key: "crypto", label: "Crypto" },
  { key: "metals", label: "Metals" },
];

const PAGE_SIZE = 12;

/** Small, stable string hash (not for security — just a deterministic
 * seed so rotation is a pure function of the slug, safe for SSR). */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Rotates `arr` by `offset` positions (stable, no shuffle) so a
 * different starting point is shown per seed without ever reordering
 * within that rotation. */
function rotate(arr, offset) {
  if (arr.length === 0) return arr;
  const n = offset % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

export default function PopularPairs({ pairs, currentSlug }) {
  const [tab, setTab] = useState("all");

  const available = pairs.filter((p) => p.slug !== currentSlug);
  if (available.length === 0) return null;

  const seed = hashString(currentSlug || "");
  const rotated = rotate(available, seed);

  const filtered = tab === "all" ? rotated : rotated.filter((p) => p.fromClass === tab);
  const items = filtered.slice(0, PAGE_SIZE);

  // Only show tabs that actually have at least one pair to offer,
  // "All" always included.
  const visibleTabs = TABS.filter(
    (t) => t.key === "all" || available.some((p) => p.fromClass === t.key)
  );

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Popular Currency &amp; Metal Pairs
        </h2>
        <div
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold"
          role="tablist"
          aria-label="Filter popular pairs by asset class"
        >
          {visibleTabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  active ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No other pairs in this category yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((pair) => (
            <Link
              key={pair.slug}
              href={`/converters/${pair.slug}`}
              className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="flex flex-col">
                <span className="font-semibold text-slate-800 group-hover:text-brand-700">
                  {pair.fromCode} → {pair.toCode}
                </span>
                <span className="text-[11px] text-slate-400">{pair.title}</span>
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  CLASS_BADGE[pair.fromClass] || "bg-slate-100 text-slate-500"
                }`}
              >
                {pair.fromClass}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
