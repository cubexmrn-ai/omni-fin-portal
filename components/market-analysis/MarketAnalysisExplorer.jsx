"use client";

// components/market-analysis/MarketAnalysisExplorer.jsx
//
// /market-analysis's half of the multi-instrument sentiment bar
// upgrade — the same shared, sticky SentimentPulseBar used on
// /ai-news (components/market-pulse/SentimentPulseBar.jsx), sitting
// above the AI Video Insights grid here. Passes `gaugeStyle` so this
// page gets the semicircle speedometer dial instead of the flat
// progress bar /ai-news still uses — same composite data and pill
// filter either way, only the top visualization differs. There's no
// news feed or
// broad Forex/Crypto/Metals/Macro bucket tabs on this page (that's
// /ai-news's MarketInsightsExplorer), so this only needs the
// instrument-level filter: clicking a pill (Gold, BTC, EUR/USD,
// GBP/USD, Crude Oil) narrows the video grid to posts that actually
// mention that instrument, using lib/topicTags.js's matchesInstrument()
// keyword match — the same deterministic, no-AI approach already used
// elsewhere on the site, not a claim of precise classification.

import { useMemo, useState } from "react";
import AutomatedVideoInsights from "@/components/market-analysis/AutomatedVideoInsights";
import SentimentPulseBar from "@/components/market-pulse/SentimentPulseBar";
import { getCompositeSentiment } from "@/lib/marketPulse";
import { matchesInstrument } from "@/lib/topicTags";

const INSTRUMENT_LABEL = {
  XAU: "Gold",
  BTC: "Bitcoin",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  WTI: "Crude Oil",
};

export default function MarketAnalysisExplorer({ videoPosts, ratesData }) {
  const [activeInstrument, setActiveInstrument] = useState(null);

  const composite = useMemo(() => getCompositeSentiment(ratesData), [ratesData]);

  const filteredVideos = useMemo(() => {
    if (!activeInstrument) return videoPosts;
    return videoPosts.filter((post) => matchesInstrument(`${post.title} ${post.body}`, activeInstrument));
  }, [videoPosts, activeInstrument]);

  return (
    <div>
      <SentimentPulseBar
        composite={composite}
        activeInstrument={activeInstrument}
        onSelectInstrument={setActiveInstrument}
        gaugeStyle
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">AI Video Insights</h2>
          {activeInstrument && (
            <button
              type="button"
              onClick={() => setActiveInstrument(null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
            >
              Filtered: {INSTRUMENT_LABEL[activeInstrument] || activeInstrument}
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          {filteredVideos.length} videos
        </span>
      </div>

      <div className="mt-4">
        {filteredVideos.length === 0 ? (
          <p className="text-sm text-slate-500">
            No videos match this instrument right now — try a different one or clear the filter.
          </p>
        ) : (
          <AutomatedVideoInsights posts={filteredVideos} />
        )}
      </div>
    </div>
  );
}
