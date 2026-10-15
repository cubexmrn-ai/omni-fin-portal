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
// Neither video posts nor news items carry a real Forex/Crypto/Metals/
// Macro label (see lib/topicTags.js's header for why), so this uses
// that module's plain keyword classifier to bucket each item — the
// same deterministic, no-AI approach already established by
// lib/sentimentKeywords.js, not a claim of precise classification.

import { useMemo, useState } from "react";
import AutomatedVideoInsights from "@/components/market-analysis/AutomatedVideoInsights";
import NewsFeed from "@/components/NewsFeed";
import { MASTER_TOPICS, topicForNewsItem, topicForVideoPost } from "@/lib/topicTags";

const TABS = ["All", ...MASTER_TOPICS];

export default function MarketInsightsExplorer({ videoPosts, newsItems, loadError, warnings }) {
  const [activeTopic, setActiveTopic] = useState("All");

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

  const filteredVideos = useMemo(
    () =>
      activeTopic === "All"
        ? videoPosts
        : taggedVideos.filter((v) => v.topic === activeTopic).map((v) => v.post),
    [activeTopic, videoPosts, taggedVideos]
  );
  const filteredNews = useMemo(
    () =>
      activeTopic === "All"
        ? newsItems
        : taggedNews.filter((n) => n.topic === activeTopic).map((n) => n.item),
    [activeTopic, newsItems, taggedNews]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by market category">
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
              No headlines match this category right now — try a different tab.
            </p>
          ) : (
            <NewsFeed items={filteredNews} showCategoryTabs={false} />
          )}
        </div>
      </div>
    </div>
  );
}
