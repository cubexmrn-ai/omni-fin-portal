// lib/technicalAnalysis.js
//
// Rule-based "On-Demand AI Technical Analysis" engine for the Market
// Analysis page. Used by app/api/market-ai/route.js.
//
// IMPORTANT HONESTY NOTE: this project stores no historical price
// series anywhere (lib/marketData.js's getUnifiedRates() only ever
// returns the CURRENT spot price for each asset — see its own header
// comment), and wires in no paid OHLC/candle data provider. That's a
// hard ceiling on what can be genuinely computed, and every builder
// below is explicit about which side of that ceiling it's on:
//
//   - Price Action / Support & Resistance / Technical Bias: fully
//     computable from a single live price using real, named techniques
//     (positioning relative to round psychological levels) — no
//     historical data needed.
//   - Fundamental Bias: a simplified but real macro linkage — USD
//     strength (itself derived live from EUR/USD, GBP/USD, AUD/USD
//     positioning) inversely correlates with USD-denominated assets.
//     Explicitly labeled "a simplified macro linkage, not comprehensive
//     fundamental analysis" everywhere it's shown.
//   - Overall Market Sentiment: a deterministic blend of the two above,
//     with an explicit note on whether they agree or conflict.
//   - Pivot Points: when real candle data resolves, Standard, Camarilla
//     AND Woodie variants are all computed from the actual previous
//     COMPLETE day's high/low/close (resampled from the real fetched
//     intraday series — lib/indicators.js's resampleToDailyBars() /
//     previousCompleteDay() — never a second fetch). When it doesn't,
//     falls back to the original real floor-trader formula applied to
//     an explicitly-labeled illustrative high/low/close band — never
//     presented as a real detected daily range either way.
//   - Fibonacci Retracement & Extensions: the ratio math (23.6% / 38.2%
//     / 50% / 61.8% / 78.6% retracement, 127.2% / 161.8% / 200%
//     extension) is applied correctly either way, but a genuine
//     reading needs a detected historical swing high/low. When real
//     candles resolve, both retracement AND extension levels are
//     anchored to the actual detected swing; otherwise falls back to
//     the same illustrative band as before, labeled in `limitations`.
//   - RSI / EMA / SMA / Golden-Death Cross: previously impossible to
//     genuinely compute (no historical price sequence was stored
//     anywhere). lib/candleData.js now fetches real intraday OHLC
//     candles (Twelve Data, falling back to Alpha Vantage — both
//     free-tier, budget-capped, see that file's header) for
//     app/api/market-ai/route.js to pass in here as an optional
//     `candleBundle` argument. When a real series resolves, this
//     computes genuine Wilder RSI(14), SMA/EMA at 20/50/200 (whichever
//     periods the fetched history is long enough for) and a real
//     Golden Cross / Death Cross read (SMA50 vs SMA200) from it
//     (lib/indicators.js). When it doesn't (no key configured, the
//     instrument isn't supported by either provider, a transient
//     outage, or the daily call-budget guard tripped), this falls back
//     to the exact same explicitly-labeled "unavailable" section as
//     before — never a fabricated reading either way.
//   - Gann Fan / Angles: when real candles resolve, anchored to the
//     actual detected swing high/low AND the real elapsed bar count
//     between them (lib/indicators.js's findSwingPointsWithIndex()) —
//     genuinely computed, not a placeholder. Gann's angle scaling
//     (how much price-per-bar one "unit" represents) is inherently a
//     convention even in real Gann analysis — there's no single
//     universally-correct choice — so this derives its unit from the
//     real swing's own price-per-bar ratio and says so plainly, rather
//     than presenting one specific scaling as definitive. Falls back
//     to the original "unavailable" section when no real swing can be
//     detected (no candle data, or too few bars to find one).
//   - Multi-Timeframe Confluence: a new section aggregating an RSI(14)
//     directional read across up to three real timeframes — 15-minute,
//     1-hour and 1-day (the daily leg is resampled from the same 1h
//     series at zero extra cost; the 15m leg is a second Twelve Data
//     request, gated by the exact same daily call-budget guard as
//     everything else in lib/candleData.js, so it degrades to 2
//     timeframes rather than ever risking the free-tier quota). Only
//     shown when at least two real timeframe reads resolve.
//
// This mirrors the same honesty bar kept everywhere else in this
// project (the News page's "AI summary coming soon" placeholder, the
// Social Buzz Tracker's persistent "Simulated" labeling): structured
// and genuinely useful, never a fake AI claim or an invented number
// dressed up as a real indicator.

import { formatNumber } from "@/lib/formatNumber";
import {
  calculateRSI,
  calculateEMA,
  calculateSMA,
  findSwingHighLow,
  findSwingPointsWithIndex,
  resampleToDailyBars,
  previousCompleteDay,
  readTimeframeBias,
} from "@/lib/indicators";
import { standardPivots, woodiePivots, camarillaPivots } from "@/lib/pivotVariants";

// ---------------------------------------------------------------------------
// Instruments — only symbols actually backed by a live number from
// lib/marketData.js's getUnifiedRates(). Each one's price is resolved
// from the SAME unified payload the Metals & Commodities Calculator
// and Currency Converter already use — no separate data source.
// ---------------------------------------------------------------------------

export const INSTRUMENT_OPTIONS = [
  { code: "XAU", label: "Gold (XAU/USD)", kind: "metal", assetCode: "XAU", decimals: 2 },
  { code: "XAG", label: "Silver (XAG/USD)", kind: "metal", assetCode: "XAG", decimals: 2 },
  { code: "XPT", label: "Platinum (XPT/USD)", kind: "metal", assetCode: "XPT", decimals: 2 },
  { code: "XPD", label: "Palladium (XPD/USD)", kind: "metal", assetCode: "XPD", decimals: 2 },
  { code: "XCU", label: "Copper (XCU/USD)", kind: "metal", assetCode: "XCU", decimals: 4 },
  { code: "WTI", label: "Crude Oil (WTI)", kind: "commodity", assetCode: "WTI", decimals: 2 },
  { code: "BTC", label: "Bitcoin (BTC/USD)", kind: "crypto", assetCode: "BTC", decimals: 2 },
  { code: "ETH", label: "Ethereum (ETH/USD)", kind: "crypto", assetCode: "ETH", decimals: 2 },
  { code: "SOL", label: "Solana (SOL/USD)", kind: "crypto", assetCode: "SOL", decimals: 2 },
  { code: "BNB", label: "BNB (BNB/USD)", kind: "crypto", assetCode: "BNB", decimals: 2 },
  { code: "XRP", label: "XRP (XRP/USD)", kind: "crypto", assetCode: "XRP", decimals: 4 },
  { code: "EURUSD", label: "EUR / USD", kind: "fx", assetCode: "EUR", invert: true, decimals: 4 },
  { code: "GBPUSD", label: "GBP / USD", kind: "fx", assetCode: "GBP", invert: true, decimals: 4 },
  { code: "AUDUSD", label: "AUD / USD", kind: "fx", assetCode: "AUD", invert: true, decimals: 4 },
  { code: "USDJPY", label: "USD / JPY", kind: "fx", assetCode: "JPY", invert: false, decimals: 3 },
];

export const INSTRUMENT_BY_CODE = INSTRUMENT_OPTIONS.reduce((acc, i) => {
  acc[i.code] = i;
  return acc;
}, {});

export function getInstrument(code) {
  return INSTRUMENT_BY_CODE[code?.toUpperCase()] || null;
}

/**
 * Pulls the live USD price for one instrument out of a getUnifiedRates()
 * payload. FX pairs use `fiat`'s "units of X per 1 USD" convention —
 * same inversion logic the old Market Insights card used for EUR/USD
 * and GBP/USD (1 / fiat.EUR, 1 / fiat.GBP); USD/JPY needs no inversion
 * since "JPY per 1 USD" already IS the USD/JPY quote.
 */
export function resolveInstrumentPrice(instrument, ratesData) {
  if (!instrument || !ratesData) return null;

  let raw = null;
  if (instrument.kind === "metal") raw = ratesData.metals?.[instrument.assetCode];
  else if (instrument.kind === "commodity") raw = ratesData.commodities?.[instrument.assetCode];
  else if (instrument.kind === "crypto") raw = ratesData.crypto?.[instrument.assetCode];
  else if (instrument.kind === "fx") raw = ratesData.fiat?.[instrument.assetCode];

  if (!Number.isFinite(raw)) return null;
  if (instrument.kind === "fx" && instrument.invert) {
    return raw !== 0 ? 1 / raw : null;
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Analysis types — the always-shown "Full Report" (meter + bias widgets
// + Price Action + Support/Resistance + Pivot Points + Oscillators) is
// the default; Fibonacci and Gann are additive deep-dive sections on
// top of it, not a replacement for it.
// ---------------------------------------------------------------------------

export const ANALYSIS_TYPES = [
  {
    key: "full_report",
    label: "Full Report",
    blurb: "Buy/Sell meter, Technical/Fundamental/Overall bias, Price Action, Support/Resistance, Pivot Points & Oscillators.",
  },
  {
    key: "fibonacci",
    label: "+ Fibonacci Retracement",
    blurb: "Adds real swing-anchored Fibonacci retracement & extension levels when candle data resolves, on top of the full report.",
  },
  {
    key: "gann",
    label: "+ Gann Theory",
    blurb: "Adds a real swing-anchored Gann Fan when candle data resolves, on top of the full report.",
  },
];

export const ANALYSIS_BY_KEY = ANALYSIS_TYPES.reduce((acc, a) => {
  acc[a.key] = a;
  return acc;
}, {});

export function getAnalysisType(key) {
  return ANALYSIS_BY_KEY[key] || null;
}

// ---------------------------------------------------------------------------
// Score <-> label bands — single source of truth for the Buy/Sell/
// Neutral meter AND the Technical/Fundamental/Overall bias widgets, so
// the gauge and the text labels can never disagree with each other.
// Score range is -100 (Strong Sell) to +100 (Strong Buy).
// ---------------------------------------------------------------------------

export const SCORE_LABEL_BANDS = [
  { key: "strong_sell", label: "Strong Sell", min: -100, max: -60 },
  { key: "sell", label: "Sell", min: -60, max: -20 },
  { key: "neutral", label: "Neutral", min: -20, max: 20 },
  { key: "buy", label: "Buy", min: 20, max: 60 },
  { key: "strong_buy", label: "Strong Buy", min: 60, max: 100 },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scoreToLabel(rawScore) {
  const score = clamp(rawScore, -100, 100);
  const band = SCORE_LABEL_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_LABEL_BANDS[2];
  return { score, key: band.key, label: band.label };
}

/** Separate wording for describing USD "strength" state (not a buy/sell call). */
function strengthLabel(score) {
  const s = clamp(score, -100, 100);
  if (s >= 60) return "Strong";
  if (s >= 20) return "Firm";
  if (s > -20) return "Neutral";
  if (s > -60) return "Soft";
  return "Weak";
}

// ---------------------------------------------------------------------------
// Round-level math (shared by Price Action, Support/Resistance, the
// Technical Bias score, and the USD-strength proxy behind Fundamental
// Bias).
// ---------------------------------------------------------------------------

/**
 * Picks a "nice" round step size (1/2/5 × a power of 10) scaled to the
 * instrument's own price magnitude, so e.g. Gold (~$2,650) gets ~$50
 * steps while EUR/USD (~1.08) gets ~0.025 steps and Bitcoin (~$65,000)
 * gets ~$2,000 steps — the same "nice number" rounding classic charting
 * libraries use for axis gridlines, applied here to price levels.
 */
function niceStep(price) {
  if (!Number.isFinite(price) || price <= 0) return 1;
  const targetDivisions = 40; // aim for a reasonably fine ~2.5%-of-price grid
  const roughStep = price / targetDivisions;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceResidual;
  if (residual > 5) niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;
  else niceResidual = 1;

  return niceResidual * magnitude;
}

function roundLevelsAround(price, step, countEachSide = 2) {
  const supportBase = Math.floor(price / step) * step;
  const supports = [];
  const resistances = [];
  for (let i = 0; i < countEachSide; i++) {
    supports.push(supportBase - i * step);
    resistances.push(supportBase + step + i * step);
  }
  return { supports, resistances, nearestSupport: supports[0], nearestResistance: resistances[0] };
}

/**
 * Where `price` sits between its nearest round-number support and
 * resistance, as both a 0..1 position (0 = at support, 1 = at
 * resistance) and a -100..+100 score (+100 = right at support, -100 =
 * right at resistance). This single real, computable quantity is the
 * basis for both the Technical Bias score (as a range-positioning
 * signal: "buy near support, sell near resistance" in a ranging
 * market — explicitly NOT a trend/momentum call, since no historical
 * direction data exists here) and, reused for EUR/USD, GBP/USD and
 * AUD/USD, the USD-strength proxy behind Fundamental Bias.
 */
function getRangeInfo(price) {
  const step = niceStep(price);
  const { nearestSupport, nearestResistance } = roundLevelsAround(price, step, 1);
  const span = nearestResistance - nearestSupport;
  const posPct = span !== 0 ? clamp((price - nearestSupport) / span, 0, 1) : 0.5;
  const score = (0.5 - posPct) * 200;
  return { step, support: nearestSupport, resistance: nearestResistance, posPct, score };
}

function describePosition(posPct) {
  if (posPct < 0.2) return "near the support / bottom of";
  if (posPct < 0.4) return "in the lower half of";
  if (posPct < 0.6) return "near the middle of";
  if (posPct < 0.8) return "in the upper half of";
  return "near the resistance / top of";
}

function pct(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return ((a - b) / b) * 100;
}

function fmt(value, decimals) {
  // Delegates to lib/formatNumber.js for the same safe clamping every
  // other formatter in the project now shares (0-100 bounds, min never
  // exceeds max, NaN-safe) — see that file's header comment. Every
  // call site here passes a fixed literal `decimals` today, but this
  // guards against that ever changing.
  return formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ---------------------------------------------------------------------------
// Bias widgets — Technical Bias, Fundamental Bias, Overall Sentiment
// ---------------------------------------------------------------------------

function buildTechnicalBias(instrument, rangeInfo) {
  const { score, label } = scoreToLabel(rangeInfo.score);
  const d = instrument.decimals;
  const note =
    `Technical Bias: ${label} — price is positioned ${describePosition(rangeInfo.posPct)} ` +
    `its nearest round-number range (${fmt(rangeInfo.support, d)}–${fmt(rangeInfo.resistance, d)}). ` +
    `This reflects range positioning (buy nearer support, sell nearer resistance), NOT a trend or ` +
    `momentum signal — no historical price direction is available in this deployment.`;
  return { score, label, note };
}

/**
 * A simplified USD-strength proxy, averaged from EUR/USD, GBP/USD and
 * AUD/USD's OWN range positioning (getRangeInfo reused — see its
 * comment). A pair sitting near the bottom of ITS range means the
 * foreign currency is relatively weak right now, i.e. USD is
 * relatively strong right now — a state reading, not a trading signal.
 */
export function computeUsdStrengthScore(ratesData) {
  const pairs = INSTRUMENT_OPTIONS.filter((i) => i.kind === "fx" && i.invert);
  const scores = [];
  for (const pair of pairs) {
    const price = resolveInstrumentPrice(pair, ratesData);
    if (Number.isFinite(price)) scores.push(getRangeInfo(price).score);
  }
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function buildFundamentalBias(instrument, usdStrengthScore) {
  const rawScore = instrument.code === "USDJPY" ? usdStrengthScore : -usdStrengthScore;
  const { score, label } = scoreToLabel(rawScore);
  const usdState = strengthLabel(usdStrengthScore);

  let relationNote;
  if (instrument.code === "USDJPY") {
    relationNote =
      "A firmer USD is typically fundamentally supportive for USD/JPY, since USD is the base currency in this pair.";
  } else if (instrument.kind === "fx") {
    relationNote =
      "A firmer USD is typically a fundamental headwind for this pair, as broad USD strength usually mirrors weakness in the other currency.";
  } else {
    relationNote =
      "A firmer USD is typically a fundamental headwind for USD-priced assets like this one, and a softer USD a tailwind.";
  }

  const note =
    `Fundamental Bias: ${label} — derived from a simplified USD-strength proxy (EUR/USD, GBP/USD & ` +
    `AUD/USD positioning), which currently reads "${usdState}". ${relationNote} This is a simplified ` +
    `macro linkage, not a comprehensive fundamental analysis.`;

  return { score, label, note, usdStrengthScore, usdState };
}

function buildOverallSentiment(technicalBias, fundamentalBias) {
  const avgScore = (technicalBias.score + fundamentalBias.score) / 2;
  const { score, label } = scoreToLabel(avgScore);
  const sameSign = Math.sign(technicalBias.score) === Math.sign(fundamentalBias.score);
  const bothMeaningful = Math.abs(technicalBias.score) >= 20 && Math.abs(fundamentalBias.score) >= 20;

  let alignmentNote;
  if (bothMeaningful && sameSign) {
    alignmentNote = "Technical and fundamental signals are aligned, which adds some conviction to this read.";
  } else if (bothMeaningful && !sameSign) {
    alignmentNote = "Technical and fundamental signals are pulling in different directions — treat this read with extra caution.";
  } else {
    alignmentNote = "One of the two signals is close to neutral, so this overall read leans mostly on the stronger of the two.";
  }

  return { score, label, note: `Overall Market Sentiment: ${label}. ${alignmentNote}` };
}

// ---------------------------------------------------------------------------
// Report sections — Price Action, Support/Resistance, Pivot Points,
// Oscillators (unavailable), Fibonacci (extra), Gann (extra)
// ---------------------------------------------------------------------------

function buildPriceAction(instrument, price, rangeInfo) {
  const { support, resistance } = rangeInfo;
  const distToResistance = pct(resistance, price);
  const distToSupport = pct(price, support);
  const closerTo = Math.abs(distToResistance) <= Math.abs(distToSupport) ? "resistance" : "support";
  const d = instrument.decimals;

  const summary =
    `${instrument.label} is trading at ${fmt(price, d)}, between round levels ` +
    `${fmt(support, d)} and ${fmt(resistance, d)}. Price is currently closer to the ${closerTo} ` +
    `side of that range (${fmt(
      Math.abs(closerTo === "resistance" ? distToResistance : distToSupport),
      2
    )}% away), which is typically the zone traders watch first for a reaction.`;

  return {
    summary,
    dataPoints: [
      { label: "Live Price", value: fmt(price, d) },
      { label: "Nearest Support", value: fmt(support, d) },
      { label: "Nearest Resistance", value: fmt(resistance, d) },
      { label: "Distance to Resistance", value: `${fmt(distToResistance, 2)}%` },
      { label: "Distance to Support", value: `${fmt(-distToSupport, 2)}%` },
    ],
    methodology:
      "Live spot price compared against the nearest round-number levels above and below it — a real, widely-used reference technique that needs no historical price series.",
    limitations: null,
  };
}

function buildSupportResistance(instrument, price) {
  const step = niceStep(price);
  const { supports, resistances } = roundLevelsAround(price, step, 2);
  const d = instrument.decimals;

  const summary =
    `${instrument.label} at ${fmt(price, d)} has its nearest round-number support around ` +
    `${fmt(supports[0], d)} (next at ${fmt(supports[1], d)}), and nearest resistance around ` +
    `${fmt(resistances[0], d)} (next at ${fmt(resistances[1], d)}). These round levels are a ` +
    `widely-watched reference zone, not a guarantee of a reaction.`;

  return {
    summary,
    dataPoints: [
      { label: "Live Price", value: fmt(price, d) },
      { label: "Support 1", value: fmt(supports[0], d) },
      { label: "Support 2", value: fmt(supports[1], d) },
      { label: "Resistance 1", value: fmt(resistances[0], d) },
      { label: "Resistance 2", value: fmt(resistances[1], d) },
    ],
    methodology:
      "Two round-number levels computed above and below the live price, scaled to the instrument's own price magnitude — the same 'nice number' step used for Price Action.",
    limitations: null,
  };
}

// Approximate band width used for BOTH the illustrative Fibonacci swing
// AND the illustrative Pivot Point high/low/close, since no real
// historical range is available — see the big comment at the top of
// this file for why this is clearly labeled, not faked.
const ILLUSTRATIVE_BAND_PCT = { metal: 0.03, commodity: 0.05, crypto: 0.08, fx: 0.015 };
const FIBONACCI_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

function illustrativeRange(instrument, price) {
  const bandPct = ILLUSTRATIVE_BAND_PCT[instrument.kind] ?? 0.03;
  return {
    bandPct,
    low: price * (1 - bandPct / 2),
    high: price * (1 + bandPct / 2),
  };
}

function buildPivotPoints(instrument, price) {
  const { low, high, bandPct } = illustrativeRange(instrument, price);
  const close = price;
  const d = instrument.decimals;

  // Classic floor-trader pivot formula.
  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);

  const summary =
    `Illustrative floor-trader pivot points for ${instrument.label}, computed from an assumed ` +
    `±${((bandPct / 2) * 100).toFixed(1)}% daily range around the live price of ${fmt(price, d)} ` +
    `(not a real detected daily high/low/close).`;

  return {
    summary,
    dataPoints: [
      { label: "Resistance 2", value: fmt(r2, d) },
      { label: "Resistance 1", value: fmt(r1, d) },
      { label: "Pivot", value: fmt(pivot, d) },
      { label: "Support 1", value: fmt(s1, d) },
      { label: "Support 2", value: fmt(s2, d) },
    ],
    methodology:
      "Real floor-trader pivot formula (P = (H+L+C)/3, with R1/S1/R2/S2 derived from P) applied to an assumed daily range.",
    limitations:
      "No real daily high/low/close is stored in this deployment, so H/L/C are an illustrative assumption around the live price, not a detected daily range — a real implementation would need a stored OHLC price history or a charting data provider.",
  };
}

/**
 * Real RSI(14)/SMA(20)/EMA(20), computed from an actual fetched candle
 * series (lib/candleData.js → lib/indicators.js) — the "unlocked"
 * counterpart to buildOscillatorsUnavailable() below. Returns null
 * (rather than a partial/fabricated report) if the series turns out
 * too short for a genuine RSI(14) reading once it's actually in hand,
 * so the caller can fall back to the unavailable version instead of
 * showing a broken or misleading section.
 */
function providerLabel(source) {
  if (!source) return "an unknown provider";
  if (source.startsWith("twelvedata")) return "Twelve Data";
  if (source.startsWith("alphavantage")) return "Alpha Vantage";
  return source;
}

/**
 * Real Golden Cross / Death Cross detection — the classic SMA(50) vs
 * SMA(200) definition. Computes "current" SMA50/200 from the full
 * closes series AND "previous" SMA50/200 from the series minus its
 * last bar (reusing calculateSMA() twice rather than maintaining a
 * second rolling-series function), so a sign flip between those two
 * snapshots is a genuine just-happened cross, not a guess. Returns
 * null if there isn't enough history for SMA(200) yet — the caller
 * omits the cross read entirely rather than showing a misleading
 * partial one.
 */
function detectGoldenDeathCross(closes) {
  const currentSma50 = calculateSMA(closes, 50);
  const currentSma200 = calculateSMA(closes, 200);
  if (currentSma50 === null || currentSma200 === null) return null;

  const prevCloses = closes.slice(0, closes.length - 1);
  const prevSma50 = calculateSMA(prevCloses, 50);
  const prevSma200 = calculateSMA(prevCloses, 200);

  const currentDiff = currentSma50 - currentSma200;
  const relation = currentDiff >= 0 ? "above" : "below";

  let crossEvent = null;
  if (prevSma50 !== null && prevSma200 !== null) {
    const prevDiff = prevSma50 - prevSma200;
    if (prevDiff < 0 && currentDiff >= 0) crossEvent = "golden_cross";
    else if (prevDiff >= 0 && currentDiff < 0) crossEvent = "death_cross";
  }

  return { sma50: currentSma50, sma200: currentSma200, relation, crossEvent };
}

/**
 * Real RSI(14)/SMA(20,50,200)/EMA(20,50,200) plus a real Golden/Death
 * Cross read, all computed from an actual fetched candle series
 * (lib/candleData.js → lib/indicators.js) — the "unlocked" counterpart
 * to buildOscillatorsUnavailable() below. SMA/EMA at 50 and 200 only
 * appear once the fetched series is actually long enough for them
 * (calculateSMA/calculateEMA return null otherwise) — never padded or
 * approximated to force a number to appear. Returns null (rather than
 * a partial/fabricated report) if the series turns out too short for
 * even a genuine RSI(14) once it's actually in hand, so the caller can
 * fall back to the unavailable version instead of showing a broken or
 * misleading section.
 */
function buildOscillatorsLive(candles) {
  const rsi = calculateRSI(candles.closes, 14);
  if (rsi === null) return null;

  const periods = [20, 50, 200];
  const smas = {};
  const emas = {};
  for (const p of periods) {
    smas[p] = calculateSMA(candles.closes, p);
    emas[p] = calculateEMA(candles.closes, p);
  }
  const cross = detectGoldenDeathCross(candles.closes);

  const rsiRead = rsi >= 70 ? "overbought" : rsi <= 30 ? "oversold" : "neutral";
  const dataPoints = [{ label: "RSI (14)", value: fmt(rsi, 1) }];
  for (const p of periods) {
    if (smas[p] !== null) dataPoints.push({ label: `SMA (${p})`, value: fmt(smas[p], 4) });
  }
  for (const p of periods) {
    if (emas[p] !== null) dataPoints.push({ label: `EMA (${p})`, value: fmt(emas[p], 4) });
  }

  let crossSentence = "";
  if (cross) {
    if (cross.crossEvent === "golden_cross") {
      crossSentence = " A Golden Cross just occurred — SMA(50) has crossed above SMA(200), a classic long-term bullish signal.";
    } else if (cross.crossEvent === "death_cross") {
      crossSentence = " A Death Cross just occurred — SMA(50) has crossed below SMA(200), a classic long-term bearish signal.";
    } else {
      crossSentence = ` SMA(50) is currently ${cross.relation} SMA(200) (no fresh cross in the last bar) — a longer-term ${
        cross.relation === "above" ? "bullish" : "bearish"
      } backdrop.`;
    }
    dataPoints.push({ label: "Golden/Death Cross", value: cross.crossEvent === "golden_cross" ? "Golden Cross" : cross.crossEvent === "death_cross" ? "Death Cross" : `50 ${cross.relation} 200` });
  }

  return {
    summary:
      `RSI(14) reads ${fmt(rsi, 1)} (${rsiRead}), computed from ${candles.closes.length} real ` +
      `${candles.interval} candles via ${providerLabel(candles.source)}.${crossSentence}`,
    dataPoints,
    methodology:
      "Wilder's RSI(14), SMA/EMA at the 20/50/200-period lengths the fetched history supports, and a Golden/Death Cross read (SMA50 vs SMA200) — all computed directly from real fetched intraday candles using standard, unmodified formulas.",
    limitations: null,
  };
}

/**
 * Real Fibonacci retracement, anchored to the actual highest-high/
 * lowest-low detected in the fetched candle window — the "unlocked"
 * counterpart to buildFibonacci()'s illustrative-band version. Returns
 * null if the series has no highs/lows (e.g. an Alpha Vantage WTI
 * series that's closes-only), so the caller can fall back cleanly.
 */
const FIBONACCI_EXTENSION_RATIOS = [1.272, 1.618, 2.0];

function buildFibonacciLive(instrument, candles) {
  const swing = findSwingHighLow(candles.highs, candles.lows);
  if (!swing) return null;
  const { high, low } = swing;
  const d = instrument.decimals;

  const levels = FIBONACCI_RATIOS.map((ratio) => ({
    label: `${(ratio * 100).toFixed(1)}%`,
    value: fmt(low + (high - low) * ratio, d),
  }));

  // Extensions project BEYOND the swing, in the direction the most
  // recent close suggests price is currently heading: if the last
  // close sits closer to the swing high than the swing low, extensions
  // project above the high (an upside continuation target); otherwise
  // they project below the low (a downside continuation target).
  const lastClose = candles.closes[candles.closes.length - 1];
  const upTrend = Math.abs(lastClose - high) <= Math.abs(lastClose - low);
  const extensions = FIBONACCI_EXTENSION_RATIOS.map((ratio) => ({
    label: `${(ratio * 100).toFixed(1)}% Ext`,
    value: fmt(upTrend ? low + (high - low) * ratio : high - (high - low) * ratio, d),
  }));

  const summary =
    `Fibonacci retracement AND extension levels for ${instrument.label}, anchored to the REAL ` +
    `detected swing high (${fmt(high, d)}) and swing low (${fmt(low, d)}) across ${candles.closes.length} ` +
    `real ${candles.interval} candles — not an illustrative band. Extensions project ${
      upTrend ? "above the swing high" : "below the swing low"
    }, since the latest close sits closer to that side of the swing.`;

  return {
    summary,
    dataPoints: [...levels, ...extensions],
    methodology:
      "Standard Fibonacci retracement ratios (23.6/38.2/50/61.8/78.6%) and extension ratios (127.2/161.8/200%) applied to the actual highest-high and lowest-low in the fetched candle window.",
    limitations: null,
  };
}

/**
 * Real Standard/Camarilla/Woodie pivot points, computed from the
 * actual previous COMPLETE day's high/low/close — resampled from the
 * real fetched intraday series (never a second fetch; see
 * lib/indicators.js's resampleToDailyBars()/previousCompleteDay()).
 * Returns null if there isn't at least one real complete day in the
 * window (e.g. a very short Alpha Vantage fallback series), so the
 * caller falls back to the illustrative-band version instead.
 *
 * Camarilla's R1/R2/S1/S2 exist in the full formula but are rarely
 * used in practice (Camarilla traders watch R3/R4/S3/S4 — breakout
 * triggers and range extremes); to keep the section's data points
 * legible, only R3/R4/S3/S4 are surfaced for that variant here. Import
 * camarillaPivots() directly from lib/pivotVariants.js for the
 * complete set.
 */
function buildPivotPointsLive(instrument, candles) {
  if (!Array.isArray(candles.times)) return null;
  const rows = candles.times.map((time, i) => ({
    time,
    close: candles.closes[i],
    high: candles.highs[i],
    low: candles.lows[i],
  }));
  const prevDay = previousCompleteDay(resampleToDailyBars(rows));
  if (!prevDay) return null;

  const d = instrument.decimals;
  const std = standardPivots(prevDay);
  const woodie = woodiePivots(prevDay);
  const cam = camarillaPivots(prevDay);

  const dataPoints = [
    { label: "Std Pivot", value: fmt(std.pivot, d) },
    { label: "Std R1", value: fmt(std.r1, d) },
    { label: "Std S1", value: fmt(std.s1, d) },
    { label: "Std R2", value: fmt(std.r2, d) },
    { label: "Std S2", value: fmt(std.s2, d) },
    { label: "Woodie Pivot", value: fmt(woodie.pivot, d) },
    { label: "Woodie R1", value: fmt(woodie.r1, d) },
    { label: "Woodie S1", value: fmt(woodie.s1, d) },
    { label: "Woodie R2", value: fmt(woodie.r2, d) },
    { label: "Woodie S2", value: fmt(woodie.s2, d) },
    { label: "Camarilla R3", value: fmt(cam.r3, d) },
    { label: "Camarilla S3", value: fmt(cam.s3, d) },
    { label: "Camarilla R4", value: fmt(cam.r4, d) },
    { label: "Camarilla S4", value: fmt(cam.s4, d) },
  ];

  const summary =
    `Standard, Woodie and Camarilla pivot points for ${instrument.label}, all computed from the ` +
    `REAL previous complete session's high (${fmt(prevDay.high, d)}), low (${fmt(prevDay.low, d)}) and ` +
    `close (${fmt(prevDay.close, d)}) on ${prevDay.date} — resampled from real fetched candles, not an ` +
    `assumed range.`;

  return {
    summary,
    dataPoints,
    methodology:
      "Standard (P=(H+L+C)/3), Woodie (P=(H+L+2C)/4) and Camarilla (level = C ± range×1.1/n) pivot formulas, each applied to the actual previous complete day's real high/low/close. Camarilla's R1/S1/R2/S2 are omitted here — only R3/R4/S3/S4 are shown, since those are the levels Camarilla's own methodology treats as actionable.",
    limitations: null,
  };
}

/**
 * Real Gann Fan/Angles — anchored to the actual detected swing pivot
 * (whichever of swing-high/swing-low occurred FIRST, chronologically,
 * in the fetched window) and the real number of bars elapsed since
 * then, not a placeholder. The price-per-bar "unit" each angle scales
 * by is derived from the swing's own real price move divided by the
 * real bar count between its high and low — a defensible, commonly
 * used convention, though Gann angle scaling is inherently a
 * convention even among professional Gann analysts (there is no
 * single universally "correct" price-per-time unit); this is
 * disclosed in the summary rather than presented as the one true
 * answer. Returns null if no swing with distinct high/low bar indices
 * can be found, so the caller falls back to the "unavailable" section.
 */
const GANN_ANGLE_RATIOS = [
  { label: "1x8", ratio: 1 / 8 },
  { label: "1x4", ratio: 1 / 4 },
  { label: "1x2", ratio: 1 / 2 },
  { label: "1x1", ratio: 1 },
  { label: "2x1", ratio: 2 },
  { label: "4x1", ratio: 4 },
  { label: "8x1", ratio: 8 },
];

function buildGannLive(instrument, candles) {
  const swing = findSwingPointsWithIndex(candles.highs, candles.lows);
  if (!swing) return null;
  const { high, highIdx, low, lowIdx } = swing;
  const barSpan = Math.abs(highIdx - lowIdx);
  if (barSpan === 0) return null;

  const d = instrument.decimals;
  const priceUnit = (high - low) / barSpan;

  // Anchor at whichever extreme occurred first — the fan then projects
  // forward across the rest of the window and to the current bar.
  const pivotIsLow = lowIdx <= highIdx;
  const pivotIdx = pivotIsLow ? lowIdx : highIdx;
  const pivotPrice = pivotIsLow ? low : high;
  const direction = pivotIsLow ? 1 : -1; // fan rises from a low, falls from a high.
  const lastIdx = candles.closes.length - 1;
  const barsElapsed = lastIdx - pivotIdx;

  const dataPoints = GANN_ANGLE_RATIOS.map(({ label, ratio }) => ({
    label: `${label} Angle (now)`,
    value: fmt(pivotPrice + direction * ratio * priceUnit * barsElapsed, d),
  }));

  const lastClose = candles.closes[lastIdx];
  let nearestLabel = GANN_ANGLE_RATIOS[0].label;
  let nearestDist = Infinity;
  for (const { label, ratio } of GANN_ANGLE_RATIOS) {
    const level = pivotPrice + direction * ratio * priceUnit * barsElapsed;
    const dist = Math.abs(lastClose - level);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestLabel = label;
    }
  }

  const summary =
    `Gann Fan for ${instrument.label}, anchored to the REAL detected swing ${pivotIsLow ? "low" : "high"} ` +
    `(${fmt(pivotPrice, d)}) and projected forward ${barsElapsed} real ${candles.interval} bars using a ` +
    `price-per-bar unit (${fmt(priceUnit, d)}) derived from that swing's own real price move. Price is ` +
    `currently closest to the ${nearestLabel} angle, which is acting as a near-term reference level. Gann ` +
    `angle scaling is inherently a convention (not a single universal formula) even in real Gann analysis — ` +
    `this uses the swing's own real range as its unit rather than an arbitrary one.`;

  return {
    summary,
    dataPoints,
    methodology:
      "Classic Gann Fan angle ratios (1x8 through 8x1) projected from the real detected swing pivot using a price-per-bar unit derived from that swing's actual price-to-bar-count ratio — not a placeholder band.",
    limitations: null,
  };
}

/**
 * Multi-Timeframe Confluence — an RSI(14)-based directional read
 * (lib/indicators.js's readTimeframeBias()) on each real timeframe
 * that resolved (up to 15m/1h/1D; see lib/candleData.js's
 * fetchCandlesMultiTimeframe()). Shown only when at least two
 * timeframes resolve, since "confluence" across a single timeframe
 * isn't a meaningful concept. Each included timeframe contributes
 * independently — a timeframe that didn't resolve (budget-gated 15m,
 * or too short a window for the 1D resample) is simply left out of
 * both the count and the data points, never backfilled with a guess.
 */
function buildConfluenceLive(timeframes) {
  const order = ["15m", "1h", "1D"];
  const reads = [];
  for (const tf of order) {
    const candles = timeframes?.[tf];
    if (!candles) continue;
    const read = readTimeframeBias(candles.closes);
    if (read) reads.push({ timeframe: tf, ...read });
  }
  if (reads.length < 2) return null;

  const bullishCount = reads.filter((r) => r.bias === "bullish").length;
  const bearishCount = reads.filter((r) => r.bias === "bearish").length;
  let overall;
  if (bullishCount === reads.length) overall = "bullish across every available timeframe";
  else if (bearishCount === reads.length) overall = "bearish across every available timeframe";
  else if (bullishCount > bearishCount) overall = `leaning bullish (${bullishCount} of ${reads.length} timeframes)`;
  else if (bearishCount > bullishCount) overall = `leaning bearish (${bearishCount} of ${reads.length} timeframes)`;
  else overall = "mixed/conflicting across timeframes";

  const dataPoints = reads.map((r) => ({
    label: `${r.timeframe} RSI / Bias`,
    value: `${fmt(r.rsi, 1)} (${r.bias})`,
  }));

  const tfList = reads.map((r) => r.timeframe).join(", ");
  const summary =
    `Multi-timeframe confluence across ${reads.length} real timeframes (${tfList}): ${overall}. ` +
    `Each timeframe's read is its own Wilder RSI(14) computed from a real fetched candle series for that ` +
    `interval (the 1D leg resampled from the same intraday series at no extra cost).` +
    `${reads.length < 3 ? " One timeframe is not shown this run — see the note below." : ""}`;

  const limitations =
    reads.length < 3
      ? "Not every timeframe resolved this run: the 15-minute leg is only attempted when the daily Twelve Data call budget allows it (see lib/candleData.js), to stay safely within the free-tier request limit — it is skipped rather than risking the quota, and this confluence read simply uses whichever real timeframes are available."
      : null;

  return {
    summary,
    dataPoints,
    methodology:
      "Wilder RSI(14) computed independently on each real timeframe's own candle series; a timeframe reads bullish at RSI≥55, bearish at RSI≤45, neutral between.",
    limitations,
  };
}

function buildConfluenceUnavailable() {
  const reason =
    "Multi-timeframe confluence needs at least two real timeframes of candle data (15-minute/1-hour/1-day), " +
    "which requires a configured candle provider.";
  return {
    summary: `${reason} No confluence read is shown.`,
    dataPoints: [],
    methodology: null,
    limitations: `${reason} Configuring TWELVE_DATA_API_KEY (or ALPHA_VANTAGE_API_KEY) unlocks this once at least two timeframes resolve for the requested instrument.`,
  };
}

function buildOscillatorsUnavailable() {
  const reason =
    "RSI and moving averages (SMA/EMA) are both calculated from a sequence of historical closing " +
    "prices, which this deployment does not store (only the current live spot price is available).";
  return {
    summary: `RSI and Moving Averages can't be genuinely calculated from a single live price point — ${reason}`,
    dataPoints: [],
    methodology: null,
    limitations: `${reason} Wiring in a historical OHLC/candle data provider would unlock real RSI/EMA/SMA calculations here.`,
  };
}

function buildFibonacci(instrument, price) {
  const { low, high, bandPct } = illustrativeRange(instrument, price);
  const d = instrument.decimals;

  const levels = FIBONACCI_RATIOS.map((ratio) => ({
    label: `${(ratio * 100).toFixed(1)}%`,
    value: fmt(low + (high - low) * ratio, d),
  }));

  const summary =
    `Applying standard Fibonacci retracement ratios to an illustrative ±${((bandPct / 2) * 100).toFixed(
      1
    )}% band around ${instrument.label}'s live price of ${fmt(price, d)} (${fmt(low, d)} – ${fmt(
      high,
      d
    )}) gives the reference levels below. This is NOT a detected historical swing — no historical ` +
    `price series is stored in this deployment — so treat these as an illustrative framework rather ` +
    `than levels calculated from an actual price swing.`;

  return {
    summary,
    dataPoints: levels,
    methodology:
      "Real Fibonacci retracement ratios (23.6/38.2/50/61.8/78.6%) applied to an assumed symmetric band around the live price.",
    limitations:
      "No historical high/low swing is available in this deployment, so the band above/below the live price is an illustrative assumption, not a detected swing — a real implementation would need a stored OHLC price history or a charting data provider.",
  };
}

function buildGannUnavailable(instrument) {
  const reason =
    "Gann Theory techniques (angles, squares, time cycles) need historical swing highs/lows and " +
    "time-based price data, which this deployment does not store.";
  return {
    summary: `${reason} No Gann-specific levels are shown for ${instrument.label}.`,
    dataPoints: [],
    methodology: null,
    limitations: `${reason} Wiring in a historical OHLC/candle data provider (with enough history to identify swing points) would unlock real Gann angle/time-cycle calculations here.`,
  };
}

// ---------------------------------------------------------------------------
// Top-level entry point
// ---------------------------------------------------------------------------

/**
 * Builds the full, always-comprehensive rule-based report for one
 * instrument, plus an optional additive Fibonacci/Gann section when
 * requested via `analysisType`. `ratesData` (a getUnifiedRates()
 * payload) is required for the Fundamental Bias's USD-strength proxy.
 *
 * `candleBundle` is optional — a lib/candleData.js
 * fetchCandlesMultiTimeframe() result ({ primary, timeframes }),
 * already fetched by the caller (this function stays synchronous;
 * only app/api/market-ai/route.js does the actual async fetch). A
 * plain single-series object ({closes, highs, lows, ...}, the old
 * fetchCandles() shape) is also accepted for backward compatibility —
 * detected by the absence of a `.primary` key — so existing callers
 * that pass one aren't broken.
 *
 * When `candleBundle.primary` is present and long enough, Oscillators,
 * Fibonacci, Pivot Points and Gann all use the real `*Live()` builders
 * above; otherwise every section falls back to exactly the same
 * illustrative/unavailable output as before candle data existed.
 * Multi-Timeframe Confluence uses `candleBundle.timeframes` separately
 * and is omitted (not just "unavailable") when fewer than two real
 * timeframes resolve. Callers that never pass anything (e.g.
 * lib/marketPulse.js's getInstrumentPulses()/getVolatilityWatch(),
 * which only need the score) are unaffected either way.
 */
export function buildAnalysis(instrument, analysisType, price, ratesData, candleBundle = null) {
  const candles = candleBundle?.primary !== undefined ? candleBundle.primary : candleBundle;
  const timeframes = candleBundle?.timeframes || null;

  const rangeInfo = getRangeInfo(price);

  const priceAction = buildPriceAction(instrument, price, rangeInfo);
  const supportResistance = buildSupportResistance(instrument, price);
  const pivotPointsLive = candles && buildPivotPointsLive(instrument, candles);
  const pivotPoints = pivotPointsLive || buildPivotPoints(instrument, price);
  const oscillators = (candles && buildOscillatorsLive(candles)) || buildOscillatorsUnavailable();
  const confluence = (timeframes && buildConfluenceLive(timeframes)) || buildConfluenceUnavailable();

  const technicalBias = buildTechnicalBias(instrument, rangeInfo);
  const usdStrengthScore = computeUsdStrengthScore(ratesData);
  const fundamentalBias = buildFundamentalBias(instrument, usdStrengthScore);
  const overallSentiment = buildOverallSentiment(technicalBias, fundamentalBias);

  let extra = null;
  if (analysisType.key === "fibonacci") {
    const live = candles && buildFibonacciLive(instrument, candles);
    extra = live
      ? { kind: "fibonacci", label: "Fibonacci Retracement", ...live }
      : { kind: "fibonacci", label: "Fibonacci Retracement", ...buildFibonacci(instrument, price) };
  } else if (analysisType.key === "gann") {
    const live = candles && buildGannLive(instrument, candles);
    extra = live
      ? { kind: "gann", label: "Gann Theory", ...live }
      : { kind: "gann", label: "Gann Theory", ...buildGannUnavailable(instrument) };
  }

  const d = instrument.decimals;
  const summary =
    `${instrument.label} is trading at ${fmt(price, d)}. ${technicalBias.note} ${fundamentalBias.note} ${overallSentiment.note}`;

  return {
    meter: { score: technicalBias.score, label: technicalBias.label },
    technicalBias,
    fundamentalBias,
    overallSentiment,
    priceAction,
    supportResistance,
    pivotPoints,
    oscillators,
    confluence,
    extra,
    summary,
    methodology:
      "Technical Bias: round-number range positioning (no historical data needed). Fundamental Bias: a simplified USD-strength macro proxy from EUR/USD, GBP/USD & AUD/USD. Overall Market Sentiment: a blend of both. None of this is predictive or a trading recommendation.",
  };
}
