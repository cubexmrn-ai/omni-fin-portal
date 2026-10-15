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

import { bandFor, bullishPctFor, directionWordFor, greedFearWordFor, formatFetchedAt } from "@/lib/marketPulse";
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
            title={
              pulse.live
                ? undefined
                : `${SHORT_LABEL[pulse.code] || pulse.label} has no live price provider in this deployment yet — this score is computed from a static reference price, not a live feed.`
            }
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
            {/* AUDIT FIX: a quiet marker (no layout-shifting badge) on any
                pill whose price isn't actually live right now — today
                that's only Crude Oil/WTI, which has no live provider in
                this deployment (see lib/marketData.js). Hover/tap for why. */}
            {!pulse.live && (
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${active ? "bg-amber-500" : "bg-amber-400/80"}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** AUDIT FIX: shown instead of returning null when the rates payload
 * couldn't resolve a price for ANY of the pulse instruments (every
 * other section of these pages already has a stated empty state —
 * this banner previously just vanished with no explanation). In
 * practice getUnifiedRates() almost always resolves at least a
 * fallback price for everything, so this is a rare, defensive state,
 * not something visitors will normally see. */
function SentimentPulseBarFallback({ sticky }) {
  return (
    <div className={sticky ? "sticky top-16 z-30" : undefined}>
      <div className="rounded-2xl border border-white/10 bg-ink px-5 py-6 text-center text-white shadow-card sm:px-8">
        <p className="text-sm font-semibold text-slate-200">Sentiment data initializing…</p>
        <p className="mt-1 text-xs text-slate-400">
          Live prices are temporarily unavailable — this refreshes automatically once they&apos;re back.
        </p>
      </div>
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
  if (!composite) return <SentimentPulseBarFallback sticky={sticky} />;

  const { compositeScore, bullishPct, directionWord, greedFearWord, pulses, liveCount, totalCount, fetchedAt } =
    composite;
  // Only worth a visible note when it's NOT all-live — stays silent in
  // the common case so it never becomes noise on a page where
  // everything really is live right now.
  const liveCoverageNote =
    Number.isFinite(liveCount) && Number.isFinite(totalCount) && liveCount < totalCount
      ? `${liveCount} of ${totalCount} live feeds active`
      : null;
  const freshnessLabel = formatFetchedAt(fetchedAt);

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
              {(freshnessLabel || liveCoverageNote) && (
                <p className="mt-3 text-[11px] text-slate-500">
                  {freshnessLabel && <span>As of {freshnessLabel}</span>}
                  {freshnessLabel && liveCoverageNote && <span className="mx-1.5">·</span>}
                  {liveCoverageNote}
                </p>
              )}
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

        {(freshnessLabel || liveCoverageNote) && (
          <p className="mt-2.5 text-[11px] text-slate-500">
            {freshnessLabel && <span>As of {freshnessLabel}</span>}
            {freshnessLabel && liveCoverageNote && <span className="mx-1.5">·</span>}
            {liveCoverageNote}
          </p>
        )}
      </div>
    </div>
  );
}
