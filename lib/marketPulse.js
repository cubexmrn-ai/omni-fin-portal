// lib/marketPulse.js
//
// Shared "live composite" computations built on top of
// lib/technicalAnalysis.js's real, rule-based buildAnalysis() — the
// same per-instrument score already used by
// components/LiveSentimentIndicator.jsx. Nothing here is a second,
// separately-invented number: every value is derived from the exact
// same engine, blended or compared across a small fixed instrument
// set (Gold, Bitcoin, EUR/USD) so it can be reused anywhere a single
// "overall market" read is useful without recomputing it by hand:
//
//   - components/ai-news/SentimentPulseBar.jsx (the /ai-news top
//     banner's composite % and Gold/BTC/USD pills)
//   - components/HomeSections.jsx's Hero (the homepage's "Technical
//     Score" and "Volatility Watch" AI Market Pulse cards)

import {
  INSTRUMENT_BY_CODE,
  resolveInstrumentPrice,
  buildAnalysis,
  getAnalysisType,
  SCORE_LABEL_BANDS,
} from "@/lib/technicalAnalysis";

export const PULSE_CODES = ["XAU", "BTC", "EURUSD"];

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

export function bandFor(score) {
  return SCORE_LABEL_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_LABEL_BANDS[2];
}

/**
 * Real per-instrument overallSentiment.score for XAU/BTC/EURUSD (skips
 * any that can't resolve a live price), plus the plain average of
 * whichever resolved as one composite read.
 */
export function getCompositeSentiment(ratesData) {
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

  return { compositeScore, bullishPct, directionWord, greedFearWord, scores, usdScore };
}

/**
 * Among XAU/BTC/EURUSD, finds whichever instrument is currently
 * closest (in %) to its nearest round-number support/resistance level
 * — the same "range positioning" technique buildAnalysis()'s own
 * priceAction already computes, just compared across instruments to
 * surface the single tightest one. Returns null if none resolved a
 * live price.
 */
export function getVolatilityWatch(ratesData) {
  let best = null;
  for (const code of PULSE_CODES) {
    const instrument = INSTRUMENT_BY_CODE[code];
    const price = resolveInstrumentPrice(instrument, ratesData);
    if (!Number.isFinite(price)) continue;
    const analysis = buildAnalysis(instrument, getAnalysisType("full_report"), price, ratesData);
    const dataPoints = analysis.priceAction?.dataPoints || [];
    // "Distance to…" values are plain percentage strings (e.g.
    // "1.89%", no thousands separator) — safe to parseFloat directly.
    // "Nearest Support/Resistance" are formatted PRICE strings (e.g.
    // "2,700.00") that DO use a thousands separator, so those are kept
    // as the raw display string instead (parseFloat would stop at the
    // comma and silently return the wrong number).
    const findRaw = (label) => dataPoints.find((d) => d.label === label)?.value ?? null;
    const distToResistance = parseFloat(findRaw("Distance to Resistance"));
    const distToSupport = parseFloat(findRaw("Distance to Support"));
    if (!Number.isFinite(distToResistance) || !Number.isFinite(distToSupport)) continue;

    const side = Math.abs(distToResistance) <= Math.abs(distToSupport) ? "resistance" : "support";
    const distancePct = Math.abs(side === "resistance" ? distToResistance : distToSupport);
    const level = findRaw(side === "resistance" ? "Nearest Resistance" : "Nearest Support");

    if (!best || distancePct < best.distancePct) {
      best = {
        instrumentLabel: instrument.label,
        side,
        distancePct,
        level,
        summary: analysis.priceAction?.summary || "",
      };
    }
  }
  return best;
}
