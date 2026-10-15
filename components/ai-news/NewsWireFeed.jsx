"use client";

// components/ai-news/NewsWireFeed.jsx
//
// /ai-news's "Live Macro News Wire Feed" — a dense, scannable row list
// (headline + source + time per line) rather than NewsFeed.jsx's card
// grid, which /market-analysis's AI Video Insights grid already owns
// the look of (components/market-analysis/AutomatedVideoInsights.jsx).
// Deliberately a different shape for the same underlying headline data
// (still `items` from lib/newsAggregator.js via getCachedAggregatedNews
// — nothing new is fetched here), so the two pages read as genuinely
// distinct dashboards instead of two card grids wearing different
// labels. The category filter lives one level up now
// (components/ai-news/MarketInsightsExplorer.jsx's All/Forex/Crypto/
// Metals & Commodities/Macro tab row already does this job) — this
// component only searches and renders.
//
// Rule-based sentiment dot + category pill colors are the exact ones
// NewsFeed.jsx already uses (kept in sync below) so a headline reads
// the same whichever view it's shown in.

import { useEffect, useMemo, useState } from "react";

const CATEGORY_BADGE_STYLES = {
  Stocks: "bg-blue-50 text-blue-700",
  Forex: "bg-emerald-50 text-emerald-700",
  Crypto: "bg-amber-50 text-amber-700",
  Commodities: "bg-orange-50 text-orange-700",
};
const DEFAULT_BADGE_STYLE = "bg-slate-100 text-slate-600";

const SENTIMENT_DOT_STYLES = {
  Bullish: "bg-emerald-500",
  Bearish: "bg-rose-500",
  Neutral: "bg-slate-300",
};

const MAX_DEFAULT_VISIBLE = 10;

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d`;
}

// AUDIT FIX (Phase 2 item 4): the relative "4h"/"2d" labels above are
// scannable but imprecise — this gives the exact release time on
// hover/tap (a `title` tooltip, same mechanism this project already
// uses for every other "why is this the way it is" disclosure). Fixed
// to UTC, like lib/marketPulse.js's formatFetchedAt(), rather than the
// viewer's local timezone, so it reads identically for every visitor
// and never depends on their device's clock/locale settings.
function absoluteUtcLabel(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${hh}:${mm} UTC`;
}

function WireRow({ item }) {
  const dotStyle = item.sentiment ? SENTIMENT_DOT_STYLES[item.sentiment] : "bg-slate-300";
  const badgeStyle = CATEGORY_BADGE_STYLES[item.category] || DEFAULT_BADGE_STYLE;

  return (
    <article className="flex gap-3 border-t border-slate-100 py-3 first:border-t-0">
      <div className="flex w-14 shrink-0 flex-col items-start gap-1.5 pt-0.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} aria-hidden="true" />
        <span
          className="font-mono text-[11px] text-slate-400"
          title={absoluteUtcLabel(item.publishedAt) || undefined}
        >
          {timeAgo(item.publishedAt)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.category && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeStyle}`}>
              {item.category}
            </span>
          )}
          <span className="truncate text-[11px] font-medium text-slate-400">{item.source}</span>
        </div>

        <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900">
          {item.link ? (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h3>

        {item.summaryStatus === "ready" && item.summary && (
          <p className="mt-1 text-xs italic leading-relaxed text-slate-500">{item.summary}</p>
        )}

        {Array.isArray(item.relatedAssets) && item.relatedAssets.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.relatedAssets.map((asset) => (
              <span key={asset} className="text-[11px] font-medium text-slate-400">
                #{asset}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function NewsWireFeed({ items }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) => {
      const haystack = `${item.title} ${item.excerpt || ""} ${item.source || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, query]);

  // A new filter/search result should start collapsed again, same
  // convention as NewsFeed.jsx and AutomatedVideoInsights.jsx.
  useEffect(() => {
    setExpanded(false);
  }, [filtered]);

  const visible = expanded ? filtered : filtered.slice(0, MAX_DEFAULT_VISIBLE);
  const hasMore = filtered.length > MAX_DEFAULT_VISIBLE;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live Wire
        </span>

        <div className="relative w-full sm:w-56">
          <svg
            width="13"
            height="13"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
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
            placeholder="Search the wire…"
            aria-label="Search headlines"
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          No headlines match this filter right now — try a different tab or search term.
        </p>
      ) : (
        <>
          <div className="mt-1">
            {visible.map((item, idx) => (
              <WireRow key={`${item.link || item.title}-${idx}`} item={item} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-2 flex justify-center border-t border-slate-100 pt-3">
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
      )}
    </div>
  );
}
