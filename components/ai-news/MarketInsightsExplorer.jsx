"use client";

// components/ai-news/MarketInsightsExplorer.jsx
//
// Phase 2 of the /ai-news redesign: ONE category tab row (All / Forex /
// Crypto / Metals & Commodities / Macro) filtering BOTH the AI video
// insight cards and the news headline grid, instead of the news feed's
// own separate Stocks/Forex/Crypto/Commodities tabs (still used as-is
// by every OTHER NewsFeed caller — see that component's
// `showCategoryTabs` prop) and the video grid having no topic filter
// at all.
//
// Layered on top of that (the multi-instrument sentiment bar upgrade):
// this component now also owns the shared SentimentPulseBar — clicking
// an instrument pill there (Gold, BTC, EUR/USD, GBP/USD, Crude Oil)
// ANDs an instrument-level filter on top of whichever broad category
// tab is active, using lib/topicTags.js's matchesInstrument() keyword
// match (the same deterministic, no-AI approach already established
// by lib/sentimentKeywords.js — not a claim of precise classification).
//
// Neither video posts nor news items carry a real Forex/Crypto/Metals/
// Macro label (see lib/topicTags.js's header for why), so this uses
// that module's plain keyword classifier to bucket each item.

import { useMemo, useState } from "react";
import AutomatedVideoInsights from "@/components/market-analysis/AutomatedVideoInsights";
import NewsFeed from "@/components/NewsFeed";
import SentimentPulseBar from "@/components/market-pulse/SentimentPulseBar";
import { getCompositeSentiment } from "@/lib/marketPulse";
import { MASTER_TOPICS, topicForNewsItem, topicForVideoPost, matchesInstrument } from "@/lib/topicTags";

const TABS = ["All", ...MASTER_TOPICS];

const INSTRUMENT_LABEL = {
  XAU: "Gold",
  BTC: "Bitcoin",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  WTI: "Crude Oil",
};

export default function MarketInsightsExplorer({ videoPosts, newsItems, loadError, warnings, ratesData }) {
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeInstrument, setActiveInstrument] = useState(null);

  const composite = useMemo(() => getCompositeSentiment(ratesData), [ratesData]);

  const taggedVideos = useMemo(
    () => videoPosts.map((post) => ({ post, topic: topicForVideoPost(post) })),
    [videoPosts]
  );
  const taggedNews = useMemo(
    () => newsItems.map((item) => ({ item, topic: topicForNewsItem(item) })),
    [newsItems]
  );

  const counts = useMemo(() => {
    const result = { All: videoPosts.length + newsItems.length };
    for (const topic of MASTER_TOPICS) {
      result[topic] =
        taggedVideos.filter((v) => v.topic === topic).length +
        taggedNews.filter((n) => n.topic === topic).length;
    }
    return result;
  }, [taggedVideos, taggedNews, videoPosts.length, newsItems.length]);

  const byTopicVideos = useMemo(
    () =>
      activeTopic === "All"
        ? taggedVideos
        : taggedVideos.filter((v) => v.topic === activeTopic),
    [activeTopic, taggedVideos]
  );
  const byTopicNews = useMemo(
    () => (activeTopic === "All" ? taggedNews : taggedNews.filter((n) => n.topic === activeTopic)),
    [activeTopic, taggedNews]
  );

  const filteredVideos = useMemo(() => {
    if (!activeInstrument) return byTopicVideos.map((v) => v.post);
    return byTopicVideos
      .filter((v) => matchesInstrument(`${v.post.title} ${v.post.body}`, activeInstrument))
      .map((v) => v.post);
  }, [byTopicVideos, activeInstrument]);

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
        activeInstrument={activeInstrument}
        onSelectInstrument={setActiveInstrument}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter by market category">
        {TABS.map((tab) => {
          const active = tab === activeTopic;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTopic(tab)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
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
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            Filtered: {INSTRUMENT_LABEL[activeInstrument] || activeInstrument}
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">AI Video Insights</h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {filteredVideos.length} videos
          </span>
        </div>
        <div className="mt-4">
          <AutomatedVideoInsights posts={filteredVideos} />
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Live News Feed</h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {filteredNews.length} headlines
          </span>
        </div>

        <div className="mt-4">
          {loadError && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Couldn&apos;t load the news feed right now ({loadError}). Please try again shortly.
            </div>
          )}

          {warnings?.length > 0 && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Some sources were unavailable: {warnings.join(" · ")}
            </div>
          )}

          {!loadError && filteredNews.length === 0 ? (
            <p className="text-sm text-slate-500">
              No headlines match this filter right now — try a different tab or instrument.
            </p>
          ) : (
            <NewsFeed items={filteredNews} showCategoryTabs={false} />
          )}
        </div>
      </div>
    </div>
  );
}
