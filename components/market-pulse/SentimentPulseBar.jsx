"use client";

// components/market-pulse/SentimentPulseBar.jsx
//
// The shared "terminal ticker rail" used on both /ai-news and
// /market-analysis: a composite Bullish/Bearish % + Greed/Fear read,
// a gradient gauge, and 5 clickable instrument pills (Gold, Bitcoin,
// EUR/USD, GBP/USD, Crude Oil). Every number comes from
// lib/marketPulse.js's getCompositeSentiment() — the SAME real,
// rule-based buildAnalysis() score (lib/technicalAnalysis.js) used
// elsewhere on the site, not a second, invented number.
//
// Purely presentational + the sticky/click behavior — the composite
// data is computed by the caller (each page's data already fetched
// server-side) and `onSelectInstrument` is how a click here reaches
// whatever's filtering the content below (see
// components/ai-news/MarketInsightsExplorer.jsx and
// components/market-analysis/MarketAnalysisExplorer.jsx).
//
// Sticks under the global header on scroll (`sticky top-16`, matching
// Header.jsx's `h-16`) rather than changing shape when pinned — a
// persistent ticker rail, not a second shrink/expand animation to get
// wrong on every viewport.

import { bandFor } from "@/lib/marketPulse";
import SentimentMeter from "@/components/SentimentMeter";

const SHORT_LABEL = {
  XAU: "Gold",
  BTC: "BTC",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",
  WTI: "Crude Oil",
};

function toneClass(score) {
  if (score >= 60) return "text-emerald-400";
  if (score >= 20) return "text-emerald-300";
  if (score > -20) return "text-slate-300";
  if (score > -60) return "text-rose-300";
  return "text-rose-400";
}

export default function SentimentPulseBar({
  composite,
  activeInstrument = null,
  onSelectInstrument,
  sticky = true,
}) {
  if (!composite) return null;

  const { compositeScore, bullishPct, directionWord, greedFearWord, pulses } = composite;

  return (
    <div className={sticky ? "sticky top-16 z-30" : undefined}>
      <div className="rounded-2xl border border-white/10 bg-ink px-5 py-5 text-white shadow-card sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-mono text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                {bullishPct}%
              </p>
              <p className="mt-1.5 text-xs font-semibold text-slate-400">
                {directionWord} · {greedFearWord}
              </p>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden="true" />
            <p className="hidden max-w-xs text-xs leading-relaxed text-slate-400 sm:block">
              A live composite across the instruments below — tap one to filter the page.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {pulses.map((pulse) => {
              const active = activeInstrument === pulse.code;
              return (
                <button
                  key={pulse.code}
                  type="button"
                  onClick={() => onSelectInstrument?.(active ? null : pulse.code)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-white text-slate-900"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {SHORT_LABEL[pulse.code] || pulse.code}:
                  <span className={active ? "font-mono text-slate-700" : `font-mono ${toneClass(pulse.score)}`}>
                    {bandFor(pulse.score).label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 dark">
          <SentimentMeter score={compositeScore} showLabels={false} />
        </div>
      </div>
    </div>
  );
}
