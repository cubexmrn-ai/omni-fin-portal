"use client";

// components/ai-news/MarketInsightsExplorer.jsx
//
// /ai-news's content explorer: the shared SentimentPulseBar (composite
// gauge + instrument pills) at the top, then whatever's passed in as
// `children` (the AI High-Impact hero + Economic Calendar — see the
// LAYOUT REFACTOR comment below), then the Public News Wire section:
// one category tab row (All / Forex / Crypto / Metals & Commodities /
// Macro) and the search+paginate feed (components/ai-news/NewsWireFeed.jsx).
//
// DEDUPE PASS: this used to also render AutomatedVideoInsights — the
// exact same AI Video Insights grid /market-analysis already shows —
// which made the two pages feel like duplicates of each other. Removed
// entirely here (video posts aren't fetched by app/ai-news/page.jsx
// any more either, so nothing gets pulled or AI-processed just to be
// thrown away). /market-analysis keeps the only AI Video Insights grid
// on the site; /ai-news's own identity is this wire feed instead — a
// dense headline list, not a card grid, so the two pages read as
// genuinely different tools rather than the same grid under two names.
//
// The category tab row still ANDs with the pill-row instrument filter
// using lib/topicTags.js's matchesInstrument() keyword match (the same
// deterministic, no-AI approach used elsewhere) — now applied to news
// items only.
//
// News items don't carry a real Forex/Crypto/Metals/Macro label (see
// lib/topicTags.js's header for why), so this still uses that module's
// plain keyword classifier to bucket each headline.
//
// AUDIT FIX: same default-binding fix as
// components/market-analysis/MarketAnalysisExplorer.jsx — on mount,
// with no pill clicked yet, the flat meter used to show the blended
// COMPOSITE score (an "offset" number matching no single pill).
// `activeInstrument` (the real, nullable filter that drives the news
// feed + "Filtered: X" chip) still starts `null` so the feed shows
// every headline by default — but `displayInstrument` (passed to
// SentimentPulseBar for the meter + pill highlight) falls back to
// Gold ("XAU") whenever nothing is explicitly selected.

import { useMemo, useState } from "react";
import NewsWireFeed from "@/components/ai-news/NewsWireFeed";
import SentimentPulseBar from "@/components/market-pulse/SentimentPulseBar";
import { getCompositeSentiment } from "@/lib/marketPulse";
import { MASTER_TOPICS, topicForNewsItem, matchesInstrument } from "@/lib/topicTags";

const TABS = ["All", ...MASTER_TOPICS];

const INSTRUMENT_LABEL = {
  XAU: "Gold",
  BTC: "Bitcoin",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  WTI: "Crude Oil",
};

const DEFAULT_GAUGE_INSTRUMENT = "XAU"; // Gold — see header comment.

// LAYOUT REFACTOR: this component owns the shared activeInstrument/
// activeTopic state the sentiment meter bar AND the Public News Wire
// tabs both need, so it still renders both — but the page's required
// top-to-bottom order is meter bar → AI High-Impact hero → Economic
// Calendar → Public News Wire, with two whole OTHER components (the
// hero, the calendar) physically between this component's own two
// halves. Rather than lifting all this state up into a server
// component page (which can't hold client state) or duplicating it
// across two separate client components, this accepts `children` and
// renders it in exactly that slot — the page passes
// <MacroImpactHero/> and <EconomicCalendar/> in as children.
export default function MarketInsightsExplorer({
  newsItems,
  loadError,
  warnings,
  ratesData,
  archiveAvailable,
  children,
}) {
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeInstrument, setActiveInstrument] = useState(null);
  const displayInstrument = activeInstrument || DEFAULT_GAUGE_INSTRUMENT;

  const composite = useMemo(() => getCompositeSentiment(ratesData), [ratesData]);

  const taggedNews = useMemo(
    () => newsItems.map((item) => ({ item, topic: topicForNewsItem(item) })),
    [newsItems]
  );

  const counts = useMemo(() => {
    const result = { All: newsItems.length };
    for (const topic of MASTER_TOPICS) {
      result[topic] = taggedNews.filter((n) => n.topic === topic).length;
    }
    return result;
  }, [taggedNews, newsItems.length]);

  const byTopicNews = useMemo(
    () => (activeTopic === "All" ? taggedNews : taggedNews.filter((n) => n.topic === activeTopic)),
    [activeTopic, taggedNews]
  );

  const filteredNews = useMemo(() => {
    if (!activeInstrument) return byTopicNews.map((n) => n.item);
    return byTopicNews
      .filter((n) => matchesInstrument(`${n.item.title} ${n.item.excerpt || ""}`, activeInstrument))
      .map((n) => n.item);
  }, [byTopicNews, activeInstrument]);

  return (
    <div>
      <SentimentPulseBar
        composite={composite}
        activeInstrument={displayInstrument}
        onSelectInstrument={setActiveInstrument}
      />

      {children}

      <h2 className="mt-10 text-base font-bold text-slate-900">Public News Wire</h2>
      <p className="mt-1 text-xs text-slate-400">
        Search or filter by category, then load more as needed.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by market category">
        {TABS.map((tab) => {
          const active = tab === activeTopic;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTopic(tab)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
              <span className={`ml-1.5 font-mono text-xs ${active ? "text-white/70" : "text-slate-400"}`}>
                {counts[tab] ?? 0}
              </span>
            </button>
          );
        })}

        {activeInstrument && (
          <button
            type="button"
            onClick={() => setActiveInstrument(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            Filtered: {INSTRUMENT_LABEL[activeInstrument] || activeInstrument}
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-end gap-3">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {filteredNews.length} headlines
          </span>
        </div>

        <div className="mt-3">
          {loadError && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Couldn&apos;t load the news feed right now ({loadError}). Please try again shortly.
            </div>
          )}

          {/* UI CLEANUP PASS: this used to print raw per-source HTTP
              failure strings (e.g. "Yahoo Finance responded with
              404...") straight to the public page. That's purely an
              internal diagnostic — the feed already failed over
              server-side and every headline actually shown below is
              real, so there's nothing for a visitor to act on. Kept
              out of the UI entirely now; `warnings` itself is still
              passed in from app/ai-news/page.jsx and logged server-side
              (see lib/newsAggregator.js), just not surfaced here. */}

          {!loadError && filteredNews.length === 0 ? (
            <p className="text-sm text-slate-500">
              No headlines match this filter right now — try a different tab or instrument.
            </p>
          ) : (
            <NewsWireFeed items={filteredNews} archiveAvailable={archiveAvailable} />
          )}
        </div>
      </div>
    </div>
  );
}
