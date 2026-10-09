"use client";

import { useMemo, useState } from "react";

// Stable display order for category pills; any category present in the
// data but not listed here still shows up, just appended at the end —
// so a new feed/category added to app/api/news-ai/route.js never
// silently disappears from the filter bar.
const CATEGORY_ORDER = ["Stocks", "Forex", "Crypto", "Commodities"];

const CATEGORY_BADGE_STYLES = {
  Stocks: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  Forex: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Crypto: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Commodities: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
};
const DEFAULT_BADGE_STYLE = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

function NewsCard({ item }) {
  const badgeStyle = CATEGORY_BADGE_STYLES[item.category] || DEFAULT_BADGE_STYLE;

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
        {item.category && (
          <span className={`rounded-full px-2 py-0.5 font-semibold ${badgeStyle}`}>
            {item.category}
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {item.source}
        </span>
        {item.publishedAt && <span>{timeAgo(item.publishedAt)}</span>}
      </div>

      <h3 className="mt-2.5 text-base font-semibold text-slate-900">
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-700"
          >
            {item.title}
          </a>
        ) : (
          item.title
        )}
      </h3>

      {item.excerpt && (
        <p className="mt-1.5 flex-1 text-sm text-slate-500">
          {item.excerpt}
          {item.excerpt.length >= 220 ? "…" : ""}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 8V12L15 15M21 12A9 9 0 113 12A9 9 0 0121 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        AI summary coming soon
      </div>
    </article>
  );
}

/**
 * Client-side search + category filtering over the full headline list
 * fetched server-side (app/ai-news/page.jsx). Filtering client-side
 * (rather than re-fetching per filter) is deliberate: the whole list is
 * already small (≤60 items, see MAX_ITEMS in app/api/news-ai/route.js)
 * and ISR-cached, so there's nothing to gain from a server round trip
 * per keystroke/category click, and the UI feels instant either way.
 */
export default function NewsFeed({ items }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c));
    return ["All", ...ordered, ...extra];
  }, [items]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategory !== "All" && item.category !== activeCategory) {
        return false;
      }
      if (!normalizedQuery) return true;
      const haystack = `${item.title} ${item.excerpt || ""} ${item.source || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, query, activeCategory]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter news by category"
        >
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <svg
            width="15"
            height="15"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M21 21L15.8 15.8M18 10.5A7.5 7.5 0 113 10.5A7.5 7.5 0 0118 10.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headlines…"
            aria-label="Search headlines"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Showing {filtered.length} of {items.length} headlines
        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        {query.trim() ? ` matching "${query.trim()}"` : ""}.
      </p>

      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <NewsCard key={`${item.link || item.title}-${idx}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-slate-500">
          No headlines match your filters right now — try a different
          category or search term.
        </p>
      )}
    </div>
  );
}
