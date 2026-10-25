// components/ai-news/MacroImpactHero.jsx
//
// "AI High-Impact News Summary & Sentiment" — the new hero section on
// app/ai-news/page.jsx, right below the sentiment meter bar. Replaces
// the old raw-developer-status banner ("AI-generated one-line
// summaries are live for the top 8 headlines (8 via Gemini)...") with
// something a visitor can actually act on: a small set of structured
// directional-impact cards for the top-tier macro headlines only (Fed/
// rates, inflation, employment, geopolitics — see
// lib/newsAggregator.js's isHighImpactMacro()/buildMacroImpactFeed()),
// each showing which asset(s) it's favorable/unfavorable for and a
// plain-English causal note — not a generic one-line paraphrase of
// whatever headline happened to be newest.
//
// `macroImpact` is `{ items: [...], enabled, note }` from
// getAggregatedNews() — `items` can legitimately be empty on a quiet
// news day (no fabricated cards to fill the space); in that case this
// renders a single, calm "nothing high-impact right now" line.
//
// `fallbackItems` (added Oct 2026, same round as lib/newsStore.js):
// when the live `items` array is empty, app/ai-news/page.jsx passes in
// the most recent high-impact stories pulled from the permanent
// archive instead (getLatestWithMacroImpact()) — same card shape, so
// this just renders them in place of the empty-state message, clearly
// labeled as pinned recent coverage rather than this cycle's news, so
// nothing here is ever presented as more current than it is.

import Link from "next/link";

const ASSET_EMOJI = {
  USD: "💵",
  EUR: "💶",
  GBP: "💷",
  JPY: "💴",
  Gold: "🥇",
  Silver: "🥈",
  Oil: "🛢️",
  Bitcoin: "₿",
  Stocks: "📈",
};

function assetLabel(asset) {
  return `${ASSET_EMOJI[asset] || ""} ${asset}`.trim();
}

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

function ImpactCard({ item }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-slate-50">
          {/* Same dual-link treatment as components/ai-news/NewsWireFeed.jsx's
              WireRow: headline -> this story's own OmniFin Portal
              permalink (the internal link Google needs to discover
              it), small "Source ↗" -> the original article. */}
          {item.slug ? (
            <Link href={`/ai-news/${item.slug}`} className="hover:text-brand-700 dark:hover:text-brand-300">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 text-xs font-normal text-slate-400 hover:text-brand-600 dark:text-slate-500"
            >
              Source ↗
            </a>
          )}
        </h3>
      </div>
      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
        {item.source}
        {item.publishedAt ? ` · ${timeAgo(item.publishedAt)}` : ""}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.favorable.map((asset) => (
          <span
            key={`fav-${asset}`}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            🟢 Favorable for {assetLabel(asset)}
          </span>
        ))}
        {item.unfavorable.map((asset) => (
          <span
            key={`unfav-${asset}`}
            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            🔴 Unfavorable for {assetLabel(asset)}
          </span>
        ))}
      </div>

      {item.note && (
        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.note}</p>
      )}
    </div>
  );
}

export default function MacroImpactHero({ macroImpact, fallbackItems = [] }) {
  const items = macroImpact?.items || [];
  // Only consulted when the live feed truly has nothing this cycle —
  // never used to pad out or replace a non-empty live list.
  const usingFallback = items.length === 0 && fallbackItems.length > 0;
  const displayItems = usingFallback ? fallbackItems : items;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
          AI High-Impact News &amp; Sentiment
        </h2>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          Fed · Inflation · Jobs · Geopolitics
        </span>
      </div>

      {usingFallback && (
        <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
          No new high-impact headlines this cycle — showing the most recent high-impact coverage.
        </p>
      )}

      {displayItems.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {macroImpact?.note || "No high-impact macro headlines detected right now."}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {displayItems.map((item) => (
            <ImpactCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
