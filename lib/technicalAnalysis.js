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
//   - Pivot Points: the real floor-trader pivot formula, applied to an
//     explicitly-labeled illustrative high/low/close band (same honesty
//     pattern as Fibonacci below) — never presented as a real detected
//     daily range.
//   - Fibonacci Retracement: the ratio math (23.6% / 38.2% / 50% /
//     61.8% / 78.6%) is applied correctly, but a genuine retracement
//     needs a detected historical swing high/low, which isn't available
//     here. Uses the same illustrative band as Pivot Points and says so
//     in `limitations` — never presented as a real detected swing.
//   - RSI / EMA / SMA and Gann Theory: both fundamentally require a
//     historical price sequence (RSI/MAs) or historical swing points
//     and time cycles (Gann). Faking a single-point "RSI: 62" reading
//     would be presenting fabricated analysis as real, so these stay
//     explicitly marked unavailable, with a clear note on exactly why
//     and what would unlock the real thing.
//
// This mirrors the same honesty bar kept everywhere else in this
// project (the News page's "AI summary coming soon" placeholder, the
// Social Buzz Tracker's persistent "Simulated" labeling): structured
// and genuinely useful, never a fake AI claim or an invented number
// dressed up as a real indicator.

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
    blurb: "Adds an illustrative Fibonacci retracement section on top of the full report.",
  },
  {
    key: "gann",
    label: "+ Gann Theory",
    blurb: "Adds why Gann Theory can't be genuinely computed here, on top of the full report.",
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
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
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
function computeUsdStrengthScore(ratesData) {
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
 */
export function buildAnalysis(instrument, analysisType, price, ratesData) {
  const rangeInfo = getRangeInfo(price);

  const priceAction = buildPriceAction(instrument, price, rangeInfo);
  const supportResistance = buildSupportResistance(instrument, price);
  const pivotPoints = buildPivotPoints(instrument, price);
  const oscillators = buildOscillatorsUnavailable();

  const technicalBias = buildTechnicalBias(instrument, rangeInfo);
  const usdStrengthScore = computeUsdStrengthScore(ratesData);
  const fundamentalBias = buildFundamentalBias(instrument, usdStrengthScore);
  const overallSentiment = buildOverallSentiment(technicalBias, fundamentalBias);

  let extra = null;
  if (analysisType.key === "fibonacci") {
    extra = { kind: "fibonacci", label: "Fibonacci Retracement", ...buildFibonacci(instrument, price) };
  } else if (analysisType.key === "gann") {
    extra = { kind: "gann", label: "Gann Theory", ...buildGannUnavailable(instrument) };
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
    extra,
    summary,
    methodology:
      "Technical Bias: round-number range positioning (no historical data needed). Fundamental Bias: a simplified USD-strength macro proxy from EUR/USD, GBP/USD & AUD/USD. Overall Market Sentiment: a blend of both. None of this is predictive or a trading recommendation.",
  };
}
