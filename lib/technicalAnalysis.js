// lib/technicalAnalysis.js
//
// Rule-based "On-Demand AI Technical Analysis" engine for the Market
// Analysis page. Used by app/api/market-ai/route.js.
//
// IMPORTANT HONESTY NOTE: this project stores no historical price
// series anywhere (lib/marketData.js's getUnifiedRates() only ever
// returns the CURRENT spot price for each asset — see its own header
// comment), and wires in no paid OHLC/candle data provider. That's a
// hard ceiling on what can be genuinely computed:
//
//   - Price Action / Support & Resistance: fully computable from a
//     single live price using real, named techniques (positioning
//     relative to round psychological levels) — no historical data
//     needed for these.
//   - Fibonacci Retracement: the ratio math (23.6% / 38.2% / 50% /
//     61.8% / 78.6%) is applied correctly, but a genuine retracement
//     needs a detected historical swing high/low, which isn't
//     available here. Rather than inventing a fake "detected swing,"
//     this uses an explicitly-labeled illustrative band around the
//     live price and says so in the response's `limitations` field —
//     never presented as if it were a real detected swing.
//   - RSI / EMA and Gann Theory: both fundamentally require a
//     historical price sequence (RSI/EMA) or historical swing points
//     and time cycles (Gann). Faking a single-point "RSI: 62" reading
//     would be presenting fabricated analysis as real, so these two
//     are marked `computable: false` — the route returns the honest
//     Price Action + Support/Resistance context instead, with a clear
//     note explaining why and what would unlock the real thing.
//
// This mirrors the same honesty bar kept everywhere else in this
// project (the "Live snapshot · full AI analysis coming soon" badge on
// the old Market Insights card, the News page's "AI summary coming
// soon" placeholder): structured and genuinely useful, never a fake
// AI claim or an invented number dressed up as a real indicator.

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
 * same inversion logic as the old Market Insights card used for
 * EUR/USD and GBP/USD (1 / fiat.EUR, 1 / fiat.GBP); USD/JPY needs no
 * inversion since "JPY per 1 USD" already IS the USD/JPY quote.
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
// Analysis types
// ---------------------------------------------------------------------------

export const ANALYSIS_TYPES = [
  {
    key: "price_action",
    label: "Price Action",
    computable: true,
    blurb: "Where the live price sits right now relative to the nearest round levels.",
  },
  {
    key: "support_resistance",
    label: "Support / Resistance",
    computable: true,
    blurb: "Nearby round-number support and resistance levels, a widely-used technique.",
  },
  {
    key: "fibonacci",
    label: "Fibonacci Retracement",
    computable: "illustrative",
    blurb: "Standard retracement ratios applied to an illustrative price band (see limitations).",
  },
  {
    key: "rsi_ema",
    label: "RSI / EMA",
    computable: false,
    blurb: "Needs historical price history, which isn't available in this deployment yet.",
  },
  {
    key: "gann",
    label: "Gann Theory",
    computable: false,
    blurb: "Needs historical swing points & time cycles, not available in this deployment yet.",
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
// Round-level math (shared by Price Action & Support/Resistance)
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
// Per-analysis-type builders
// ---------------------------------------------------------------------------

function buildPriceAction(instrument, price) {
  const step = niceStep(price);
  const { nearestSupport, nearestResistance } = roundLevelsAround(price, step, 1);
  const distToResistance = pct(nearestResistance, price);
  const distToSupport = pct(price, nearestSupport);
  const closerTo =
    Math.abs(distToResistance) <= Math.abs(distToSupport) ? "resistance" : "support";

  const d = instrument.decimals;
  const summary =
    `${instrument.label} is trading at ${fmt(price, d)}, between round levels ` +
    `${fmt(nearestSupport, d)} and ${fmt(nearestResistance, d)}. Price is currently ` +
    `closer to the ${closerTo} side of that range (${fmt(
      Math.abs(closerTo === "resistance" ? distToResistance : distToSupport),
      2
    )}% away), which is typically the zone traders watch first for a reaction.`;

  return {
    summary,
    dataPoints: [
      { label: "Live Price", value: fmt(price, d) },
      { label: "Nearest Support", value: fmt(nearestSupport, d) },
      { label: "Nearest Resistance", value: fmt(nearestResistance, d) },
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

// Approximate band width used for the illustrative Fibonacci swing,
// since no real historical high/low is available — see the big comment
// at the top of this file for why this is clearly labeled, not faked.
const FIBONACCI_BAND_PCT = { metal: 0.03, commodity: 0.05, crypto: 0.08, fx: 0.015 };
const FIBONACCI_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

function buildFibonacci(instrument, price) {
  const bandPct = FIBONACCI_BAND_PCT[instrument.kind] ?? 0.03;
  const low = price * (1 - bandPct / 2);
  const high = price * (1 + bandPct / 2);
  const d = instrument.decimals;

  const levels = FIBONACCI_RATIOS.map((ratio) => ({
    label: `${(ratio * 100).toFixed(1)}%`,
    value: fmt(low + (high - low) * ratio, d),
  }));

  const summary =
    `Applying standard Fibonacci retracement ratios to an illustrative ±${(
      (bandPct / 2) *
      100
    ).toFixed(1)}% band around ${instrument.label}'s live price of ${fmt(
      price,
      d
    )} (${fmt(low, d)} – ${fmt(high, d)}) gives the reference levels below. This is NOT a ` +
    `detected historical swing — no historical price series is stored in this deployment — ` +
    `so treat these as an illustrative framework rather than levels calculated from an actual price swing.`;

  return {
    summary,
    dataPoints: levels,
    methodology:
      "Real Fibonacci retracement ratios (23.6/38.2/50/61.8/78.6%) applied to an assumed symmetric band around the live price.",
    limitations:
      "No historical high/low swing is available in this deployment, so the band above/below the live price is an illustrative assumption, not a detected swing — a real implementation would need a stored OHLC price history or a charting data provider.",
  };
}

function buildUnavailable(instrument, price, analysisType) {
  // Graceful degradation: give the genuinely-computable Price Action +
  // Support/Resistance context instead of inventing a fake RSI/EMA or
  // Gann reading, and say plainly why.
  const action = buildPriceAction(instrument, price);
  const reason =
    analysisType.key === "rsi_ema"
      ? "RSI and EMA are both calculated from a sequence of historical closing prices, which this deployment does not store (only the current live spot price is available)."
      : "Gann Theory techniques (angles, squares, time cycles) need historical swing highs/lows and time-based price data, which this deployment does not store.";

  return {
    summary:
      `${analysisType.label} can't be genuinely calculated from a single live price point — ${reason} ` +
      `Showing live Price Action context for ${instrument.label} instead.`,
    dataPoints: action.dataPoints,
    methodology: action.methodology,
    limitations: `${reason} Wiring in a historical OHLC/candle data provider would unlock a real ${analysisType.label} calculation here.`,
  };
}

/**
 * Builds the full rule-based analysis response body for one instrument
 * + analysis type pair, given the instrument's resolved live price.
 */
export function buildAnalysis(instrument, analysisType, price) {
  if (analysisType.computable === true) {
    return analysisType.key === "support_resistance"
      ? buildSupportResistance(instrument, price)
      : buildPriceAction(instrument, price);
  }
  if (analysisType.computable === "illustrative") {
    return buildFibonacci(instrument, price);
  }
  return buildUnavailable(instrument, price, analysisType);
}
