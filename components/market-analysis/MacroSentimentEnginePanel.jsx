"use client";

// components/market-analysis/MacroSentimentEnginePanel.jsx
//
// Renders the Macro Sentiment Engine snapshot (see
// lib/sentimentEngine.js's getSentimentEngineSnapshot()) as a
// category-tabbed terminal panel, not a flat 9-card wall.
//
// REDESIGN (terminal-dashboard pass): the asset grid used to show all
// 9 tracked assets (metals, energy, forex, crypto) at once, each with
// two separate labeled progress bars and every rotating theme chip —
// reads fine as one card, but as a 9-up grid it became the repetitive
// "wall of text" this pass fixes. Two changes:
//   1. Category tabs (All Major / Metals & Energy / Forex / Crypto),
//      driven by each asset's own `assetClass` from
//      lib/sentimentEngine.js (the single source of truth — not a
//      second classification invented here) — same filter applies to
//      the Market Blog cards via BLOG_ASSET_CLASS below, so switching
//      to "Crypto" narrows both sections together, not just one.
//   2. Each card: the two Retail/Institutional numbers collapse into
//      one compact "Retail NN% vs Inst NN%" line over two thin bars
//      (RetailVsInstitutionalBar) instead of two separately labeled
//      rows, and rotating themes cap at 2 chips (asset.themes.slice(0,
//      2)) — the full theme list still exists in the underlying data,
//      just not all dumped on the tile at once.
//
// Market Blog cards keep their own per-card expand (useState — why
// this stays a client component) from the earlier line-clamp pass;
// not touched by this redesign beyond the shared tab filter and a
// card-style pass (rounded-xl + translucent "glass" surface) to match
// AutomatedVideoInsights.jsx's card language elsewhere on this page,
// so the whole page reads as one dashboard rather than two different
// card systems stitched together.
//
// Honesty note (unchanged): `snapshot.note` still says outright
// whether themes/blogs came from a real AI call or a deterministic
// pool/template, and nothing here hides or relabels that.

import { useMemo, useState } from "react";

const CATEGORIES = [
  { id: "all", label: "All Major", classes: null },
  { id: "metals-energy", label: "Metals & Energy", classes: ["metals", "energy"] },
  { id: "forex", label: "Forex", classes: ["forex"] },
  { id: "crypto", label: "Crypto", classes: ["crypto"] },
];

// Market Blog groups (lib/sentimentEngine.js's MARKET_BLOG_GROUPS) are
// keyed by a plain id, not an assetClass field — this is the one place
// that maps between them, kept next to CATEGORIES so the two stay easy
// to compare at a glance.
const BLOG_ASSET_CLASS = { gold: "metals", wti: "energy", dxy: "forex", crypto: "crypto" };

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
      ? "Retail bullish / Inst. bearish"
      : "Retail bearish / Inst. bullish";
  return (
    <span
      className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
      title="Retail-leaning and institutional/central-bank-leaning simulated scores point in different directions."
    >
      {label}
    </span>
  );
}

/** One compact "Retail NN% vs Inst NN%" line over two thin bars — the
 * two numbers stay independently visible (never averaged into a fake
 * single figure), just presented as one scannable unit instead of two
 * separately labeled rows. */
function RetailVsInstitutionalBar({ retail, institutional }) {
  const r = Number.isFinite(retail) ? Math.max(0, Math.min(100, retail)) : 50;
  const inst = Number.isFinite(institutional) ? Math.max(0, Math.min(100, institutional)) : 50;

  return (
    <div>
      <p className="font-mono text-[11px] font-semibold text-slate-600">
        Retail {r}% <span className="font-sans font-normal text-slate-400">vs</span> Inst {inst}%
      </p>
      <div className="mt-1.5 space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${r}%` }} />
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-500" style={{ width: `${inst}%` }} />
        </div>
      </div>
    </div>
  );
}

function AssetSentimentCard({ asset }) {
  const themes = Array.isArray(asset.themes) ? asset.themes.slice(0, 2) : [];

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-card backdrop-blur-sm transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{asset.label}</h3>
        <DivergenceBadge divergence={asset.divergence} />
      </div>

      <div className="mt-3">
        <RetailVsInstitutionalBar retail={asset.retailSentiment} institutional={asset.institutionalBias} />
      </div>

      {themes.length > 0 && (
        <div className="mt-3.5 flex flex-1 flex-wrap items-center gap-1.5">
          {themes.map((theme, idx) => (
            <span
              key={idx}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
            >
              {theme}
            </span>
          ))}
          <span
            className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              asset.usingAiThemes ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
            title={
              asset.themeProvider === "gemini"
                ? "Generated live by the Gemini API for this asset"
                : asset.themeProvider === "claude"
                ? "Generated live by the Claude API for this asset"
                : "Rotated from a per-asset-class contextual theme pool, not literally AI-generated"
            }
          >
            {asset.themeProvider === "gemini" ? "AI" : asset.themeProvider === "claude" ? "AI" : "Pool"}
          </span>
        </div>
      )}
    </article>
  );
}

function MarketBlogCard({ blog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200/70 bg-white/90 p-4 shadow-card backdrop-blur-sm transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{blog.title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            blog.aiProvider === "gemini" || blog.aiProvider === "claude"
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

function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <div
      className="inline-flex flex-wrap gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 text-xs font-semibold"
      role="tablist"
      aria-label="Filter by asset category"
    >
      {categories.map((cat) => {
        const active = cat.id === activeId;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(cat.id)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export default function MacroSentimentEnginePanel({ snapshot }) {
  const assets = Array.isArray(snapshot?.assets) ? snapshot.assets : [];
  const marketBlogs = Array.isArray(snapshot?.marketBlogs) ? snapshot.marketBlogs : [];
  const [activeCategory, setActiveCategory] = useState("all");

  const category = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  const filteredAssets = useMemo(() => {
    if (!category.classes) return assets;
    return assets.filter((a) => category.classes.includes(a.assetClass));
  }, [assets, category]);

  const filteredBlogs = useMemo(() => {
    if (!category.classes) return marketBlogs;
    return marketBlogs.filter((b) => category.classes.includes(BLOG_ASSET_CLASS[b.id]));
  }, [marketBlogs, category]);

  if (assets.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Macro sentiment data is unavailable right now — please check back shortly.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryTabs categories={CATEGORIES} activeId={activeCategory} onChange={setActiveCategory} />
        {snapshot?.note && <p className="text-xs text-slate-400">{snapshot.note}</p>}
      </div>

      {filteredBlogs.length > 0 && (
        <div className="mb-8 mt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Market Blog
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredBlogs.map((blog) => (
              <MarketBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}

      {filteredAssets.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">
          No tracked assets in this category right now.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <AssetSentimentCard key={asset.code} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
