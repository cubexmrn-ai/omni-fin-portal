// lib/marketPulse.js
//
// Shared "live composite" computations built on top of
// lib/technicalAnalysis.js's real, rule-based buildAnalysis() — the
// same per-instrument score already used by
// components/LiveSentimentIndicator.jsx. Nothing here is a second,
// separately-invented number: every value is derived from the exact
// same engine, blended or compared across a small fixed instrument
// set so it can be reused anywhere a single "overall market" read is
// useful without recomputing it by hand:
//
//   - components/market-pulse/SentimentPulseBar.jsx (the shared top
//     banner used on both /ai-news and /market-analysis — the
//     composite % and the 5 clickable instrument pills)
//   - components/HomeSections.jsx's Hero (the homepage's "Technical
//     Score" and "Volatility Watch" AI Market Pulse cards)

import {
  INSTRUMENT_BY_CODE,
  resolveInstrumentPrice,
  buildAnalysis,
  getAnalysisType,
  SCORE_LABEL_BANDS,
} from "@/lib/technicalAnalysis";

// The 5 "key instruments" shown side-by-side in the pulse bar — Gold,
// Bitcoin, EUR/USD, GBP/USD and Crude Oil. Every other computation in
// this file (composite score, volatility watch) is derived from
// exactly this set, so widening/narrowing it here changes all of them
// consistently.
export const PULSE_CODES = ["XAU", "BTC", "EURUSD", "GBPUSD", "WTI"];

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

/** Same -100..100 -> 0..100 "bullish %" conversion
 * getCompositeSentiment() uses for its own compositeScore, exported so
 * a single instrument's score can be shown as the same kind of
 * percentage instead of a second formula invented elsewhere. */
export function bullishPctFor(score) {
  return Math.max(0, Math.min(100, Math.round((score + 100) / 2)));
}

/** Same Bullish/Bearish/Neutral wording and +-10 thresholds
 * getCompositeSentiment() uses for its own `directionWord`, exported so
 * a single instrument's score (e.g. one of getInstrumentPulses()'s
 * entries) can be described the exact same way, not a second set of
 * thresholds invented elsewhere. */
export function directionWordFor(score) {
  return score > 10 ? "Bullish" : score < -10 ? "Bearish" : "Neutral";
}

/** Same Greed/Fear framing getCompositeSentiment() layers on its own
 * compositeScore, exported so a single instrument can get the exact
 * same secondary label instead of a second, differently-worded scale. */
export function greedFearWordFor(score) {
  return GREED_FEAR_LABEL[bandFor(score).key] || "Neutral";
}

/**
 * Real overallSentiment.score for each of PULSE_CODES that resolves a
 * live price (skips any that can't). This is the single source every
 * other function below reads from, and what the pulse bar's pills
 * render directly — each pill IS one of these instruments, not a
 * derived/synthetic reading.
 */
export function getInstrumentPulses(ratesData) {
  const pulses = [];
  for (const code of PULSE_CODES) {
    const instrument = INSTRUMENT_BY_CODE[code];
    const price = resolveInstrumentPrice(instrument, ratesData);
    if (!Number.isFinite(price)) continue;
    const analysis = buildAnalysis(instrument, getAnalysisType("full_report"), price, ratesData);
    pulses.push({ code, label: instrument.label, score: analysis.overallSentiment.score });
  }
  return pulses;
}

/**
 * The plain average of getInstrumentPulses()'s scores as one composite
 * read, plus a 0-100 "bullish %" and a Greed/Fear word for the same
 * value. Returns null if no instrument resolved a live price.
 */
export function getCompositeSentiment(ratesData) {
  const pulses = getInstrumentPulses(ratesData);
  if (pulses.length === 0) return null;

  const compositeScore = pulses.reduce((sum, p) => sum + p.score, 0) / pulses.length;
  const bullishPct = bullishPctFor(compositeScore);
  const directionWord = directionWordFor(compositeScore);
  const greedFearWord = greedFearWordFor(compositeScore);

  return { compositeScore, bullishPct, directionWord, greedFearWord, pulses };
}

/**
 * Among PULSE_CODES, finds whichever instrument is currently closest
 * (in %) to its nearest round-number support/resistance level — the
 * same "range positioning" technique buildAnalysis()'s own priceAction
 * already computes, just compared across instruments to surface the
 * single tightest one. Returns null if none resolved a live price.
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
