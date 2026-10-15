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
//
// `gaugeStyle` (new): /market-analysis passes this to get the
// TradingView/Bloomberg-terminal-style semicircle dial
// (SentimentGaugeDial) instead of the flat SentimentMeter progress bar
// — /ai-news doesn't pass it, so its banner is byte-for-byte unchanged.
// Both branches share the exact same `composite` data and instrument
// pills/click handler below; only the dial vs. bar presentation
// differs, so nothing about the underlying numbers or the filter
// behavior forks between the two pages.

import { bandFor, bullishPctFor, directionWordFor, greedFearWordFor } from "@/lib/marketPulse";
import SentimentMeter from "@/components/SentimentMeter";
import SentimentGaugeDial from "@/components/market-pulse/SentimentGaugeDial";

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

function InstrumentPills({ pulses, activeInstrument, onSelectInstrument }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pulses.map((pulse) => {
        const active = activeInstrument === pulse.code;
        return (
          <button
            key={pulse.code}
            type="button"
            onClick={() => onSelectInstrument?.(active ? null : pulse.code)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              active
                ? "bg-white text-slate-900 ring-2 ring-brand-400 ring-offset-2 ring-offset-ink"
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
  );
}

export default function SentimentPulseBar({
  composite,
  activeInstrument = null,
  onSelectInstrument,
  sticky = true,
  gaugeStyle = false,
}) {
  if (!composite) return null;

  const { compositeScore, bullishPct, directionWord, greedFearWord, pulses } = composite;

  if (gaugeStyle) {
    // When a pill is selected, the dial switches from the composite
    // read to THAT instrument's own real score (still the same
    // buildAnalysis() output, just a different one of the `pulses`
    // already computed for the pill row — never a second number
    // invented for the dial). Clearing the selection (tapping the
    // active pill again, via the existing onSelectInstrument toggle)
    // returns the dial to the composite.
    const selectedPulse = activeInstrument ? pulses.find((p) => p.code === activeInstrument) : null;
    const gaugeScore = selectedPulse ? selectedPulse.score : compositeScore;
    const gaugeInstrumentLabel = selectedPulse ? SHORT_LABEL[selectedPulse.code] || selectedPulse.label : null;

    return (
      <div className={sticky ? "sticky top-16 z-30" : undefined}>
        <div className="rounded-2xl border border-white/10 bg-ink px-5 py-6 text-white shadow-card sm:px-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10">
            <SentimentGaugeDial score={gaugeScore} size={200} instrumentLabel={gaugeInstrumentLabel} />

            <div className="hidden h-28 w-px shrink-0 bg-white/10 lg:block" aria-hidden="true" />

            <div className="w-full flex-1">
              <p className="text-sm font-semibold text-slate-200">
                {selectedPulse ? (
                  <>
                    Showing <span className="text-white">{gaugeInstrumentLabel}</span>{" "}
                    <span className="text-slate-500">·</span> tap its pill again for the composite
                  </>
                ) : (
                  <>
                    {directionWord} <span className="text-slate-500">·</span> {greedFearWord}
                  </>
                )}
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                {selectedPulse
                  ? `The dial now reads ${gaugeInstrumentLabel}'s own technical score, not the blended composite.`
                  : `Composite read across ${pulses.length} key instruments — tap one below to focus the dial on it.`}
              </p>
              <div className="mt-4">
                <InstrumentPills
                  pulses={pulses}
                  activeInstrument={activeInstrument}
                  onSelectInstrument={onSelectInstrument}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Same binding as the gaugeStyle branch above: a selected pill drives
  // the big number, the status text AND the progress bar from THAT
  // instrument's own real score — previously this branch only passed
  // activeInstrument down to the pills for their own highlight state
  // and never read it back for the banner itself, so the big "NN%"
  // and the bar stayed pinned to the composite no matter what was
  // selected. bullishPctFor/directionWordFor/greedFearWordFor
  // (lib/marketPulse.js) are the exact same formulas
  // getCompositeSentiment() already used for the composite case, so a
  // single instrument reads on the same scale, not a second one.
  const selectedPulse = activeInstrument ? pulses.find((p) => p.code === activeInstrument) : null;
  const displayScore = selectedPulse ? selectedPulse.score : compositeScore;
  const displayPct = selectedPulse ? bullishPctFor(selectedPulse.score) : bullishPct;
  const displayDirectionWord = selectedPulse ? directionWordFor(selectedPulse.score) : directionWord;
  const displayGreedFearWord = selectedPulse ? greedFearWordFor(selectedPulse.score) : greedFearWord;
  const displayLabel = selectedPulse ? SHORT_LABEL[selectedPulse.code] || selectedPulse.label : null;

  return (
    <div className={sticky ? "sticky top-16 z-30" : undefined}>
      <div className="rounded-2xl border border-white/10 bg-ink px-5 py-5 text-white shadow-card sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              {displayLabel && (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {displayLabel}
                </p>
              )}
              <p className="font-mono text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                {displayPct}%
              </p>
              <p className="mt-1.5 text-xs font-semibold text-slate-400">
                {displayDirectionWord} · {displayGreedFearWord}
              </p>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden="true" />
            <p className="hidden max-w-xs text-xs leading-relaxed text-slate-400 sm:block">
              {selectedPulse
                ? `Showing ${displayLabel}'s own read — tap its pill again for the composite.`
                : "A live composite across the instruments below — tap one to filter the page."}
            </p>
          </div>

          <InstrumentPills pulses={pulses} activeInstrument={activeInstrument} onSelectInstrument={onSelectInstrument} />
        </div>

        <div className="mt-4 dark">
          <SentimentMeter score={displayScore} showLabels={false} />
        </div>
      </div>
    </div>
  );
}
