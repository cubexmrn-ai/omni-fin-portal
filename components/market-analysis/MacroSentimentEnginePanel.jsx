"use client";

// components/market-analysis/MacroSentimentEnginePanel.jsx
//
// Renders the Macro Sentiment Engine snapshot (see
// lib/sentimentEngine.js's getSentimentEngineSnapshot()) as a card grid,
// one card per tracked asset. Visual style matches the rest of the
// project's card UI (rounded-lg borders, slate palette, text-sm body
// copy) — see components/market-analysis/AutomatedVideoInsights.jsx and
// components/MarketOverviewBoard.jsx.
//
// Market Blog cards clamp their body to ~5 lines with a per-card "Read
// full update" expand (useState — why this is a client component now)
// rather than showing the full generated paragraph on every card at
// once, which read as a dense wall of text sitting right under the
// hero. No text is cut from the underlying data, just collapsed by
// default — same "cap it, let the person expand" pattern already used
// by the video/news grids (components/market-analysis/
// AutomatedVideoInsights.jsx, components/NewsFeed.jsx).
//
// Honesty note: `snapshot.note` (surfaced directly under the heading)
// is the same kind of plain-language status string used by
// lib/socialBuzz.js and lib/newsAggregator.js — it says outright
// whether themes came from a real Claude API call or a rotating
// contextual pool, and that the sentiment scores are a deterministic
// simulation unless a real data provider is wired up.

import { useState } from "react";

function DivergenceBadge({ divergence }) {
  if (divergence === "aligned") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        Aligned
      </span>
    );
  }
  const label =
    divergence === "retail-bullish-institutional-bearish"
      ? "Retail bullish / Institutional bearish"
      : "Retail bearish / Institutional bullish";
  return (
    <span
      className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
      title="Retail-leaning and institutional/central-bank-leaning simulated scores point in different directions."
    >
      {label}
    </span>
  );
}

function ScoreBar({ labelText, value, colorClassName }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>{labelText}</span>
        <span className="font-semibold text-slate-700">{safeValue}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function AssetSentimentCard({ asset }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{asset.label}</h3>
        <DivergenceBadge divergence={asset.divergence} />
      </div>

      <div className="mt-3 space-y-2.5">
        <ScoreBar
          labelText="Retail sentiment"
          value={asset.retailSentiment}
          colorClassName="bg-brand-500"
        />
        <ScoreBar
          labelText="Institutional / CB bias"
          value={asset.institutionalBias}
          colorClassName="bg-slate-500"
        />
      </div>

      {Array.isArray(asset.themes) && asset.themes.length > 0 && (
        <div className="mt-3.5 flex-1">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>Rotating themes</span>
            <span
              className={`rounded-full px-1.5 py-0.5 font-semibold ${
                asset.usingAiThemes
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
              title={
                asset.themeProvider === "gemini"
                  ? "Generated live by the Gemini API for this asset"
                  : asset.themeProvider === "claude"
                  ? "Generated live by the Claude API for this asset"
                  : "Rotated from a per-asset-class contextual theme pool, not literally AI-generated"
              }
            >
              {asset.themeProvider === "gemini"
                ? "AI · Gemini"
                : asset.themeProvider === "claude"
                ? "AI · Claude"
                : "Pool"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {asset.themes.map((theme, idx) => (
              <span
                key={idx}
                className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function MarketBlogCard({ blog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{blog.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            blog.aiProvider === "gemini"
              ? "bg-emerald-50 text-emerald-700"
              : blog.aiProvider === "claude"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
          title={
            blog.aiProvider === "gemini"
              ? "Written live by the Gemini API from this group's computed sentiment data"
              : blog.aiProvider === "claude"
              ? "Written live by the Claude API from this group's computed sentiment data"
              : "Assembled from the same computed sentiment data using fixed sentence templates, not AI-written"
          }
        >
          {blog.aiProvider === "gemini"
            ? "Gemini AI Extracted"
            : blog.aiProvider === "claude"
            ? "AI · Claude"
            : "Template-generated"}
        </span>
      </div>

      <p
        className={`mt-3 flex-1 text-sm leading-relaxed text-slate-600 ${
          expanded ? "" : "line-clamp-5"
        }`}
      >
        {blog.body}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          {expanded ? "Show less" : "Read full update"}
        </button>
        <span className="font-mono text-[11px] text-slate-400">{blog.wordCount}w</span>
      </div>
    </article>
  );
}

export default function MacroSentimentEnginePanel({ snapshot }) {
  const assets = Array.isArray(snapshot?.assets) ? snapshot.assets : [];
  const marketBlogs = Array.isArray(snapshot?.marketBlogs) ? snapshot.marketBlogs : [];

  if (assets.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Macro sentiment data is unavailable right now — please check back shortly.
      </p>
    );
  }

  return (
    <div>
      {snapshot?.note && (
        <p className="mb-5 text-xs text-slate-400">{snapshot.note}</p>
      )}

      {marketBlogs.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Market Blog
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketBlogs.map((blog) => (
              <MarketBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <AssetSentimentCard key={asset.code} asset={asset} />
        ))}
      </div>
    </div>
  );
}
