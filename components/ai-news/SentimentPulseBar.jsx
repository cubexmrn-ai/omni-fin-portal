// components/ai-news/SentimentPulseBar.jsx
//
// The /ai-news "top banner" interactive sentiment pulse — a plain
// Server Component, same architectural pattern as
// components/LiveSentimentIndicator.jsx (which it sits above on the
// page). The composite score/pills come from lib/marketPulse.js's
// getCompositeSentiment(), the SAME real, rule-based buildAnalysis()
// score (lib/technicalAnalysis.js) for Gold (XAU/USD), Bitcoin and
// EUR/USD already used by LiveSentimentIndicator — not a second,
// separately invented number — and also reused by the homepage's "AI
// Market Pulse" cards (components/HomeSections.jsx's Hero).
//
// Renders nothing (rather than a fabricated placeholder) when none of
// the three instruments resolved a live price — same honesty bar as
// the rest of this project.

import { getCompositeSentiment, bandFor } from "@/lib/marketPulse";
import SentimentMeter from "@/components/SentimentMeter";

function toneClass(score) {
  if (score >= 60) return "text-emerald-400";
  if (score >= 20) return "text-emerald-300";
  if (score > -20) return "text-slate-300";
  if (score > -60) return "text-rose-300";
  return "text-rose-400";
}

export default function SentimentPulseBar({ ratesData }) {
  const pulse = getCompositeSentiment(ratesData);
  if (!pulse) return null;

  const { compositeScore, bullishPct, directionWord, greedFearWord, scores, usdScore } = pulse;

  const pills = [
    { label: "Gold", score: scores.XAU },
    { label: "BTC", score: scores.BTC },
    { label: "USD", score: usdScore },
  ].filter((p) => Number.isFinite(p.score));

  return (
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
            A live composite across Gold, Bitcoin and EUR/USD — the same
            rule-based engine as the sentiment cards below, blended into
            one read.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span
              key={pill.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
            >
              {pill.label}:
              <span className={`font-mono ${toneClass(pill.score)}`}>{bandFor(pill.score).label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 dark">
        <SentimentMeter score={compositeScore} showLabels={false} />
      </div>
    </div>
  );
}
