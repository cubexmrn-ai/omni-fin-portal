// lib/economicHeatmap.js
//
// Standalone, framework-agnostic data source for the "Macro Economic
// Heatmap & Impact Dial Dashboard" on /market-analysis (see
// components/market-analysis/EconomicHeatmapDashboard.jsx). Zero
// Next.js imports, same "lift it out and reuse elsewhere" shape as
// lib/sentimentEngine.js and lib/socialBuzz.js.
//
// WHAT THIS DOES, HONESTLY — read this before touching the dashboard:
//
// This project stores no historical economic-release data anywhere
// and wires in no paid macro-calendar data provider (the ONE real
// economic-calendar data source in this codebase is the TradingView
// iframe embed in components/TradingViewEconomicCalendar.jsx — a
// third-party widget, not something this app can read figures back
// out of to build its own table). So the 7-row "Economic Data
// Heatmap Table" below (GDP Growth, Manufacturing PMI, Services PMI,
// CPI YoY, PPI YoY, Unemployment Rate, Non-Farm Payrolls) cannot be
// real Actual/Forecast/Previous release figures — there is no live
// feed for those in this deployment.
//
// Rather than silently inventing numbers and presenting them as real
// releases (which this project's own honesty bar — see
// lib/technicalAnalysis.js's header comment — explicitly rules out),
// this module generates the table the exact same way
// lib/sentimentEngine.js and lib/socialBuzz.js already generate their
// own illustrative numbers: a seeded PRNG keyed to the current UTC
// date (one draw per day, not re-randomized on every request), around
// realistic baseline ranges for each metric, with each row's USD
// Impact / Stocks-Gold Impact derived by simple, consistent rules
// (not randomly assigned) from that row's own surprise (actual vs.
// forecast) — the same inverse USD/USD-priced-asset linkage already
// used by computeUsdStrengthScore()/buildFundamentalBias() in
// lib/technicalAnalysis.js, not a second, unrelated convention.
//
// getEconomicHeatmapSnapshot() returns `{ rows, isIllustrative: true,
// asOf }` — never `isIllustrative: false` in this deployment, so a
// caller can never accidentally present this as live.
//
// Duplicates hashString()/mulberry32() from lib/sentimentEngine.js
// rather than importing them, for the same "no cross-file dependency"
// reason stated there.

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned
}

/** A tiny deterministic PRNG (mulberry32) seeded from a 32-bit integer. */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Current UTC date bucket, e.g. "2026-10-16" — stable for a full day
 * (a macro calendar updates daily/monthly in real life, not hourly),
 * same bucketing convention as lib/sentimentEngine.js's hour bucket. */
function currentDateBucket() {
  return new Date().toISOString().slice(0, 10);
}

// Each metric's realistic current-cycle baseline + how far actual can
// plausibly surprise vs. forecast, plus whether a HIGHER reading is
// conventionally USD-bullish (true) or USD-bearish (false, e.g.
// unemployment) — this is what Impact derives from, not a random coin
// flip per row.
const METRICS = [
  { key: "gdp", label: "GDP Growth (QoQ, Annualized)", unit: "%", decimals: 1, baseline: 2.4, noise: 0.5, surpriseNoise: 0.35, higherIsUsdBullish: true },
  { key: "ism_mfg", label: "Manufacturing PMI", unit: "", decimals: 1, baseline: 49.6, noise: 1.1, surpriseNoise: 0.8, higherIsUsdBullish: true },
  { key: "ism_svc", label: "Services PMI", unit: "", decimals: 1, baseline: 52.1, noise: 1.0, surpriseNoise: 0.7, higherIsUsdBullish: true },
  { key: "cpi", label: "CPI YoY", unit: "%", decimals: 1, baseline: 2.9, noise: 0.3, surpriseNoise: 0.2, higherIsUsdBullish: true },
  { key: "ppi", label: "PPI YoY", unit: "%", decimals: 1, baseline: 2.1, noise: 0.3, surpriseNoise: 0.2, higherIsUsdBullish: true },
  { key: "unemployment", label: "Unemployment Rate", unit: "%", decimals: 1, baseline: 4.1, noise: 0.2, surpriseNoise: 0.15, higherIsUsdBullish: false },
  { key: "nfp", label: "Non-Farm Payrolls", unit: "K", decimals: 0, baseline: 180, noise: 40, surpriseNoise: 35, higherIsUsdBullish: true },
];

// A deterministic, non-random "days ago" per metric so the table
// reads like a real calendar (most recent releases near the top)
// without needing a real release schedule.
const DAYS_AGO_BY_INDEX = [2, 5, 5, 9, 10, 2, 2];

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatValue(value, metric) {
  const rounded = round(value, metric.decimals);
  return `${rounded}${metric.unit}`;
}

function isoDateDaysAgo(daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** USD Impact for one row, from its own surprise — not a separate
 * random draw. A SMALL surprise reads as Neutral (an epsilon band),
 * same "don't overstate a rounding difference" spirit as this
 * project's other derived labels. */
function impactFromSurprise(surprise, higherIsUsdBullish, epsilon) {
  if (Math.abs(surprise) < epsilon) return "Neutral";
  const beatsExpectations = higherIsUsdBullish ? surprise > 0 : surprise < 0;
  return beatsExpectations ? "Bullish" : "Bearish";
}

/** Stocks/Gold Impact: the simplified inverse-of-USD linkage this
 * project already uses elsewhere (a firmer dollar is a headwind for
 * USD-priced assets like Gold — see lib/technicalAnalysis.js's
 * buildFundamentalBias()) — derived FROM the row's own usdImpact, not
 * an independently invented number. */
function riskAssetImpactFromUsdImpact(usdImpact) {
  if (usdImpact === "Bullish") return "Bearish";
  if (usdImpact === "Bearish") return "Bullish";
  return "Neutral";
}

/**
 * The 7-row illustrative Economic Data Heatmap Table. Deterministic
 * per UTC day (same seed -> same numbers all day, every visitor), not
 * re-randomized per request and never presented as a live release
 * feed — see this file's header for exactly why this stays
 * illustrative rather than real.
 */
export function getEconomicHeatmapSnapshot() {
  const dateBucket = currentDateBucket();

  const rows = METRICS.map((metric, index) => {
    const rand = mulberry32(hashString(`econ-heatmap:${metric.key}:${dateBucket}`));
    const previous = metric.baseline + (rand() * 2 - 1) * metric.noise;
    const forecast = previous + (rand() * 2 - 1) * metric.noise * 0.6;
    const actual = forecast + (rand() * 2 - 1) * metric.surpriseNoise;
    const surprise = actual - forecast;
    const epsilon = metric.surpriseNoise * 0.12;
    const usdImpact = impactFromSurprise(surprise, metric.higherIsUsdBullish, epsilon);
    const stocksGoldImpact = riskAssetImpactFromUsdImpact(usdImpact);

    return {
      key: metric.key,
      metric: metric.label,
      date: isoDateDaysAgo(DAYS_AGO_BY_INDEX[index]),
      actual: formatValue(actual, metric),
      forecast: formatValue(forecast, metric),
      previous: formatValue(previous, metric),
      surprise: `${surprise > 0 ? "+" : ""}${round(surprise, metric.decimals)}${metric.unit}`,
      surpriseDirection: surprise > epsilon ? "up" : surprise < -epsilon ? "down" : "flat",
      usdImpact,
      stocksGoldImpact,
    };
  });

  return {
    rows,
    isIllustrative: true,
    asOf: dateBucket,
  };
}
