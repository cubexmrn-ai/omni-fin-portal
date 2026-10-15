"use client";

import { useEffect, useMemo, useState } from "react";

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

// Rule-based sentiment dot colors (see computeSentiment() in
// lib/newsAggregator.js — a keyword scan, not an AI/NLP call). Folded
// into the single category pill as a colored dot rather than a second
// badge, so one card only ever shows one tag.
const SENTIMENT_DOT_STYLES = {
  Bullish: "bg-emerald-500",
  Bearish: "bg-rose-500",
  Neutral: "bg-slate-400",
};

const MAX_DEFAULT_VISIBLE = 6;

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

function NewsCard({ item, compact }) {
  const badgeStyle = CATEGORY_BADGE_STYLES[item.category] || DEFAULT_BADGE_STYLE;
  const dotStyle = item.sentiment ? SENTIMENT_DOT_STYLES[item.sentiment] : null;

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-400">
        {item.category && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold ${badgeStyle}`}
            title={
              item.sentiment
                ? `Rule-based sentiment from a keyword scan, not AI-generated: ${item.sentiment}`
                : undefined
            }
          >
            {dotStyle && <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} aria-hidden="true" />}
            {item.category}
          </span>
        )}
        <span className="truncate text-slate-400">
          {item.source}
          {item.publishedAt && <span className="font-mono"> · {timeAgo(item.publishedAt)}</span>}
        </span>
      </div>

      <h3 className={`font-semibold text-slate-900 ${compact ? "mt-2 line-clamp-2 text-sm" : "mt-2.5 text-base"}`}>
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

      {!compact && item.excerpt && (
        <p className="mt-1.5 flex-1 text-sm text-slate-500">
          {item.excerpt}
          {item.excerpt.length >= 220 ? "…" : ""}
        </p>
      )}

      {!compact && Array.isArray(item.relatedAssets) && item.relatedAssets.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.relatedAssets.map((asset) => (
            <span
              key={asset}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500"
              title={`This headline was keyword-matched as relevant to ${asset}`}
            >
              #{asset}
            </span>
          ))}
        </div>
      )}

      {!compact && item.summaryStatus === "ready" && item.summary && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <svg
            width="12"
            height="12"
            className="mt-0.5 shrink-0"
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
          <span>
            <span className="font-semibold">
              {item.summaryProvider === "gemini" ? "Gemini AI summary: " : "AI summary: "}
            </span>
            {item.summary}
          </span>
        </div>
      )}
    </article>
  );
}

function DensityToggle({ compact, onChange }) {
  return (
    <div
      className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold"
      role="tablist"
      aria-label="Card density"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!compact}
        onClick={() => onChange(false)}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          !compact ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Comfortable
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={compact}
        onClick={() => onChange(true)}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          compact ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Compact
      </button>
    </div>
  );
}

/**
 * Client-side search + category filtering over the full headline list
 * fetched server-side (app/ai-news/page.jsx). Filtering client-side
 * (rather than re-fetching per filter) is deliberate: the whole list is
 * already small (≤60 items, see MAX_ITEMS in app/api/news-ai/route.js)
 * and ISR-cached, so there's nothing to gain from a server round trip
 * per keystroke/category click, and the UI feels instant either way.
 *
 * `showCategoryTabs` (default true) hides this component's own
 * Stocks/Forex/Crypto/Commodities tab row and category filtering when
 * a parent already provides a broader category filter — see
 * components/ai-news/MarketInsightsExplorer.jsx, which pre-filters
 * `items` by its own All/Forex/Crypto/Metals & Commodities/Macro tabs
 * on /ai-news so there's only ever one set of category tabs on screen.
 * The search box still works either way.
 *
 * The filtered grid caps to MAX_DEFAULT_VISIBLE cards by default (a
 * "View all" expand reveals the rest, no refetch) and offers the same
 * Compact/Comfortable density toggle as the video insights grid, so a
 * broad search/filter never dumps a 15+ card wall on screen at once.
 */
export default function NewsFeed({ items, showCategoryTabs = true }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);

  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category).filter(Boolean));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c));
    return ["All", ...ordered, ...extra];
  }, [items]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      if (showCategoryTabs && activeCategory !== "All" && item.category !== activeCategory) {
        return false;
      }
      if (!normalizedQuery) return true;
      const haystack = `${item.title} ${item.excerpt || ""} ${item.source || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, query, activeCategory, showCategoryTabs]);

  // A new filter/search result (fewer or different items) should start
  // collapsed again, rather than silently staying "expanded" from a
  // previous, longer list.
  useEffect(() => {
    setExpanded(false);
  }, [filtered]);

  const visible = expanded ? filtered : filtered.slice(0, MAX_DEFAULT_VISIBLE);
  const hasMore = filtered.length > MAX_DEFAULT_VISIBLE;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {showCategoryTabs && (
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
        )}

        <div className="flex w-full items-center gap-2.5 sm:w-auto">
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
          <DensityToggle compact={compact} onChange={setCompact} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Showing {visible.length} of {filtered.length} headlines
        {showCategoryTabs && activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        {query.trim() ? ` matching "${query.trim()}"` : ""}.
      </p>

      {filtered.length > 0 ? (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${
              compact ? "mt-4 gap-2.5" : "mt-5 gap-4"
            }`}
          >
            {visible.map((item, idx) => (
              <NewsCard key={`${item.link || item.title}-${idx}`} item={item} compact={compact} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                {expanded ? "Show less" : `View all ${filtered.length} headlines`}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-10 text-center text-sm text-slate-500">
          No headlines match your filters right now — try a different
          category or search term.
        </p>
      )}
    </div>
  );
}
