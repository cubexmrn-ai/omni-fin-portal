"use client";

// components/market-analysis/MarketAnalysisExplorer.jsx
//
// /market-analysis's instance of the shared, sticky SentimentPulseBar
// (components/market-pulse/SentimentPulseBar.jsx) — the same composite
// gauge + instrument pills used on /ai-news, but with `gaugeStyle` so
// this page gets the semicircle speedometer dial instead of the flat
// progress bar.
//
// REMOVED: the old "AI Video Insights" grid (AutomatedVideoInsights.jsx
// + VideoInsightDrawer.jsx, both deleted) that used to sit below this
// bar and that the instrument pills used to filter. This component now
// only drives the gauge's displayed instrument — clicking a pill just
// changes which instrument's score the dial shows, no content below
// it to filter any more.
//
// AUDIT FIX (kept from before the video grid removal): on mount, with
// no pill explicitly clicked yet, the gauge used to show the blended
// COMPOSITE score — an "offset" number that doesn't match any single
// pill, which read as an awkward default state. `displayInstrument`
// falls back to Gold ("XAU") whenever nothing is explicitly selected,
// so the dial always reads one concrete, labeled instrument's score,
// with that instrument's pill highlighted to match.

import { useMemo, useState } from "react";
import SentimentPulseBar from "@/components/market-pulse/SentimentPulseBar";
import { getCompositeSentiment } from "@/lib/marketPulse";

const DEFAULT_GAUGE_INSTRUMENT = "XAU"; // Gold — see header comment.

export default function MarketAnalysisExplorer({ ratesData }) {
  const [activeInstrument, setActiveInstrument] = useState(null);
  const displayInstrument = activeInstrument || DEFAULT_GAUGE_INSTRUMENT;

  const composite = useMemo(() => getCompositeSentiment(ratesData), [ratesData]);

  return (
    <SentimentPulseBar
      composite={composite}
      activeInstrument={displayInstrument}
      onSelectInstrument={setActiveInstrument}
      gaugeStyle
    />
  );
}
