// components/ai-news/SentimentPulseBar.jsx
//
// The /ai-news "top banner" interactive sentiment pulse — a plain
// Server Component, same architectural pattern as
// components/LiveSentimentIndicator.jsx (which it sits above on the
// page). The composite score is a plain average of that SAME real,
// rule-based buildAnalysis() score (lib/technicalAnalysis.js) computed
// for Gold (XAU/USD), Bitcoin and EUR/USD from real live prices — not a
// second, separately invented number living next to the detailed
// sentiment cards below it. EUR/USD's score is inverted for the "USD"
// pill only (EUR/USD bullish price action means a weaker dollar),
// matching that instrument's own `invert` flag in lib/technicalAnalysis.js.
//
// Renders nothing (rather than a fabricated placeholder) when none of
// the three instruments resolved a live price — same honesty bar as
// the rest of this project.

import {
  INSTRUMENT_BY_CODE,
  resolveInstrumentPrice,
  buildAnalysis,
  getAnalysisType,
  SCORE_LABEL_BANDS,
} from "@/lib/technicalAnalysis";
import SentimentMeter from "@/components/SentimentMeter";

const PULSE_CODES = ["XAU", "BTC", "EURUSD"];

// Greed/Fear framing layered on top of the exact same SCORE_LABEL_BANDS
// keys the rest of the site already uses (Strong Sell..Strong Buy) —
// an alternate label for the same real band, not a different metric.
const GREED_FEAR_LABEL = {
  strong_sell: "Extreme Fear",
  sell: "Fear",
  neutral: "Neutral",
  buy: "Greed",
  strong_buy: "Extreme Greed",
};

function bandFor(score) {
  return SCORE_LABEL_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_LABEL_BANDS[2];
}

function toneClass(score) {
  if (score >= 60) return "text-emerald-400";
  if (score >= 20) return "text-emerald-300";
  if (score > -20) return "text-slate-300";
  if (score > -60) return "text-rose-300";
  return "text-rose-400";
}

export default function SentimentPulseBar({ ratesData }) {
  const scores = {};
  for (const code of PULSE_CODES) {
    const instrument = INSTRUMENT_BY_CODE[code];
    const price = resolveInstrumentPrice(instrument, ratesData);
    if (!Number.isFinite(price)) continue;
    const analysis = buildAnalysis(instrument, getAnalysisType("full_report"), price, ratesData);
    scores[code] = analysis.overallSentiment.score;
  }

  const finiteScores = Object.values(scores).filter((s) => Number.isFinite(s));
  if (finiteScores.length === 0) return null;

  const compositeScore = finiteScores.reduce((sum, s) => sum + s, 0) / finiteScores.length;
  const bullishPct = Math.max(0, Math.min(100, Math.round((compositeScore + 100) / 2)));
  const directionWord = compositeScore > 10 ? "Bullish" : compositeScore < -10 ? "Bearish" : "Neutral";
  const greedFearWord = GREED_FEAR_LABEL[bandFor(compositeScore).key] || "Neutral";

  // USD pulls the opposite direction from EUR/USD's own score — a
  // stronger EUR/USD (bullish EUR/USD) is a weaker dollar, and vice
  // versa — so this is the dollar's OWN directional read, not EUR's.
  const usdScore = Number.isFinite(scores.EURUSD) ? -scores.EURUSD : null;

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
