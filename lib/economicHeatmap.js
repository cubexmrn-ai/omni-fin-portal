// lib/economicHeatmap.js
//
// Standalone, framework-agnostic data source for the "Macro Economic
// Heatmap & Impact Dial Dashboard" on /market-analysis (see
// components/market-analysis/EconomicHeatmapDashboard.jsx). Zero
// Next.js imports, same "lift it out and reuse elsewhere" shape as
// lib/sentimentEngine.js.
//
// WHAT THIS DOES, HONESTLY — read this before touching the dashboard:
//
// Five of the seven rows (GDP Growth, CPI YoY, PPI YoY, Unemployment
// Rate, Non-Farm Payrolls) can now be real, live-sourced figures from
// FRED (Federal Reserve Economic Data, https://fred.stlouisfed.org/)
// when FRED_API_KEY is configured — see fetchFredSeries()/
// transformSeries() below. The remaining two (Manufacturing PMI,
// Services PMI) stay PERMANENTLY illustrative: ISM, the body that
// publishes those, does not make them available through FRED or any
// other free API, so there is no live source to wire in for them
// regardless of API key. Without FRED_API_KEY (or if a given series'
// fetch fails), every row falls back to the original per-metric
// illustrative generator, unchanged from before this integration.
//
// IMPORTANT HONESTY NOTE ON "FORECAST": FRED publishes actual released
// values, never a consensus forecast (no macro-calendar provider in
// this codebase has one either — see
// components/TradingViewEconomicCalendar.jsx's header comment). So for
// a live FRED row, the Forecast column honestly reads "—" rather than
// a fabricated number, and that row's Surprise/USD Impact/Stocks-Gold
// Impact are computed against the PREVIOUS release instead of a
// forecast (disclosed via each row's `impactBasis` field) — a real,
// still-meaningful comparison, just a different one than the
// illustrative rows use.
//
// Illustrative rows are generated the exact same way as before: a
// seeded PRNG keyed to the current UTC date (one draw per day, not
// re-randomized on every request), around realistic baseline ranges
// for each metric, with each row's USD Impact / Stocks-Gold Impact
// derived by simple, consistent rules (not randomly assigned) from
// that row's own surprise (actual vs. forecast) — the same inverse
// USD/USD-priced-asset linkage already used by
// computeUsdStrengthScore()/buildFundamentalBias() in
// lib/technicalAnalysis.js, not a second, unrelated convention.
//
// getEconomicHeatmapSnapshot() now returns `{ rows, isIllustrative,
// liveCount, totalCount, asOf }` — `isIllustrative` is true whenever
// AT LEAST ONE row is still illustrative (which, given the PMI rows,
// is every deployment), and each row carries its own `source`
// ("fred" | "illustrative") so the dashboard can tag rows individually
// rather than labeling the whole table one way or the other.
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
// plausibly surprise vs. forecast (used ONLY by the illustrative
// generator), plus whether a HIGHER reading is conventionally
// USD-bullish (true) or USD-bearish (false, e.g. unemployment) — used
// by BOTH the illustrative and live paths to turn a surprise into an
// Impact label, not a random coin flip per row.
//
// `fred` (present on 5 of 7 rows): the real FRED series + how to turn
// its raw observations into this row's figure.
//   - "level": the series IS already the figure (UNRATE is already a
//     %; A191RL1Q225SBEA is already QoQ-annualized % growth).
//   - "yoy": % change vs. the observation 12 periods (months) back —
//     needed for CPI/PPI, which FRED publishes as an index level, not
//     a year-over-year %.
//   - "mom_change": the difference between consecutive observations —
//     needed for PAYEMS, which FRED publishes as a cumulative
//     employment level (thousands), not the month's net change (the
//     conventional "Non-Farm Payrolls" print).
// `liveEpsilon`: the real-world-scaled "too small to call a surprise"
// band for that row's live comparison (vs. previous release) — a
// separate, appropriately-scaled number from the illustrative path's
// `surpriseNoise`, since live figures aren't generated from that noise
// model at all.
const METRICS = [
  {
    key: "gdp",
    label: "GDP Growth (QoQ, Annualized)",
    unit: "%",
    decimals: 1,
    baseline: 2.4,
    noise: 0.5,
    surpriseNoise: 0.35,
    higherIsUsdBullish: true,
    fred: { seriesId: "A191RL1Q225SBEA", transform: "level", liveEpsilon: 0.15 },
  },
  { key: "ism_mfg", label: "Manufacturing PMI", unit: "", decimals: 1, baseline: 49.6, noise: 1.1, surpriseNoise: 0.8, higherIsUsdBullish: true },
  { key: "ism_svc", label: "Services PMI", unit: "", decimals: 1, baseline: 52.1, noise: 1.0, surpriseNoise: 0.7, higherIsUsdBullish: true },
  {
    key: "cpi",
    label: "CPI YoY",
    unit: "%",
    decimals: 1,
    baseline: 2.9,
    noise: 0.3,
    surpriseNoise: 0.2,
    higherIsUsdBullish: true,
    fred: { seriesId: "CPIAUCSL", transform: "yoy", liveEpsilon: 0.05 },
  },
  {
    key: "ppi",
    label: "PPI YoY",
    unit: "%",
    decimals: 1,
    baseline: 2.1,
    noise: 0.3,
    surpriseNoise: 0.2,
    higherIsUsdBullish: true,
    fred: { seriesId: "PPIACO", transform: "yoy", liveEpsilon: 0.05 },
  },
  {
    key: "unemployment",
    label: "Unemployment Rate",
    unit: "%",
    decimals: 1,
    baseline: 4.1,
    noise: 0.2,
    surpriseNoise: 0.15,
    higherIsUsdBullish: false,
    fred: { seriesId: "UNRATE", transform: "level", liveEpsilon: 0.05 },
  },
  {
    key: "nfp",
    label: "Non-Farm Payrolls",
    unit: "K",
    decimals: 0,
    baseline: 180,
    noise: 40,
    surpriseNoise: 35,
    higherIsUsdBullish: true,
    fred: { seriesId: "PAYEMS", transform: "mom_change", liveEpsilon: 10 },
  },
];

// A deterministic, non-random "days ago" per metric so the ILLUSTRATIVE
// table reads like a real calendar (most recent releases near the top)
// without needing a real release schedule. Live FRED rows use the
// series' own real observation date instead.
const DAYS_AGO_BY_INDEX = [2, 5, 5, 9, 10, 2, 2];

const FRED_FETCH_TIMEOUT_MS = 8000;

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

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FRED_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Pulls the most recent observations for one FRED series, newest
 * first. 14 points comfortably covers every transform below (a
 * year-over-year % change on a monthly series needs the observation 12
 * periods back, plus one more for computing the PREVIOUS period's YoY
 * too). FRED marks a missing release with the literal string "." —
 * those are filtered out rather than parsed into NaN.
 */
async function fetchFredSeries(seriesId, apiKey) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=14`;
  const res = await fetchWithTimeout(url);
  const data = await res.json().catch(() => null);
  const observations = data?.observations;

  if (!res.ok || !Array.isArray(observations)) {
    const detail = data?.error_message || `HTTP ${res.status}`;
    throw new Error(`FRED ${seriesId}: ${detail}`);
  }

  const parsed = observations
    .map((o) => ({ date: o.date, value: Number(o.value) }))
    .filter((o) => Number.isFinite(o.value));

  if (parsed.length === 0) {
    throw new Error(`FRED ${seriesId}: no numeric observations returned`);
  }
  return parsed;
}

/** Turns one series' raw (newest-first) observations into this row's
 * {actual, previous, date} per its configured transform. Throws if
 * there genuinely aren't enough observations yet (e.g. a brand-new
 * series) rather than silently returning a wrong number. */
function transformSeries(obsDesc, transform) {
  if (transform === "level") {
    if (obsDesc.length < 2) throw new Error("not enough observations for a level comparison");
    return { actual: obsDesc[0].value, previous: obsDesc[1].value, date: obsDesc[0].date };
  }
  if (transform === "mom_change") {
    if (obsDesc.length < 3) throw new Error("not enough observations for a month-over-month change");
    return {
      actual: obsDesc[0].value - obsDesc[1].value,
      previous: obsDesc[1].value - obsDesc[2].value,
      date: obsDesc[0].date,
    };
  }
  if (transform === "yoy") {
    if (obsDesc.length < 14) throw new Error("not enough observations for a year-over-year change");
    // Guard the denominator explicitly: a zero/non-finite base value
    // would otherwise silently produce Infinity%/NaN% on the page
    // instead of falling back to the illustrative row.
    const pctChange = (now, yearAgo) => {
      if (!Number.isFinite(yearAgo) || yearAgo === 0) {
        throw new Error("year-ago observation is zero or invalid");
      }
      return ((now - yearAgo) / yearAgo) * 100;
    };
    return {
      actual: pctChange(obsDesc[0].value, obsDesc[12].value),
      previous: pctChange(obsDesc[1].value, obsDesc[13].value),
      date: obsDesc[0].date,
    };
  }
  throw new Error(`unknown transform "${transform}"`);
}

/** The illustrative generator, unchanged in behavior from before this
 * integration — just extracted into its own function so it can serve
 * as both "the whole table when FRED_API_KEY is absent" and "this one
 * row's fallback when its own FRED fetch fails." */
function buildIllustrativeRow(metric, index, dateBucket) {
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
    source: "illustrative",
    impactBasis: "vs a simulated forecast (no live macro-calendar provider is configured)",
  };
}

/** One row's live FRED-sourced figure. Forecast is honestly "—" (see
 * this file's header) — Surprise/Impact compare actual vs. the
 * PREVIOUS release instead. */
async function buildFredRow(metric) {
  const obsDesc = await fetchFredSeries(metric.fred.seriesId, process.env.FRED_API_KEY);
  const { actual, previous, date } = transformSeries(obsDesc, metric.fred.transform);
  if (!Number.isFinite(actual) || !Number.isFinite(previous)) {
    // Defensive — transformSeries() should already guarantee finite
    // numbers, but this is the last line of defense before a NaN/
    // Infinity could ever reach formatValue() and render on the page.
    throw new Error(`FRED ${metric.fred.seriesId}: computed a non-finite value`);
  }
  const surprise = actual - previous;
  const epsilon = metric.fred.liveEpsilon;
  const usdImpact = impactFromSurprise(surprise, metric.higherIsUsdBullish, epsilon);
  const stocksGoldImpact = riskAssetImpactFromUsdImpact(usdImpact);

  return {
    key: metric.key,
    metric: metric.label,
    date,
    actual: formatValue(actual, metric),
    forecast: "—",
    previous: formatValue(previous, metric),
    surprise: `${surprise > 0 ? "+" : ""}${round(surprise, metric.decimals)}${metric.unit}`,
    surpriseDirection: surprise > epsilon ? "up" : surprise < -epsilon ? "down" : "flat",
    usdImpact,
    stocksGoldImpact,
    source: "fred",
    impactBasis: "vs the previous FRED release (FRED publishes no consensus forecast)",
  };
}

/**
 * The 7-row Economic Data Heatmap Table. Each row is either a real
 * FRED-sourced figure (when FRED_API_KEY is configured and that row's
 * series fetch succeeds) or the original deterministic-per-UTC-day
 * illustrative figure — see this file's header for exactly which rows
 * can ever go live and why two never can.
 */
export async function getEconomicHeatmapSnapshot() {
  const dateBucket = currentDateBucket();
  const apiKey = process.env.FRED_API_KEY;

  const rows = await Promise.all(
    METRICS.map(async (metric, index) => {
      if (!metric.fred || !apiKey) {
        return buildIllustrativeRow(metric, index, dateBucket);
      }
      try {
        return await buildFredRow(metric);
      } catch (err) {
        return {
          ...buildIllustrativeRow(metric, index, dateBucket),
          fredError: err.message || "unknown error",
        };
      }
    })
  );

  const liveCount = rows.filter((r) => r.source === "fred").length;

  return {
    rows,
    // Still true the instant ANY row is illustrative — today that's
    // always true (Manufacturing/Services PMI can never go live via
    // FRED), but a caller should read per-row `source`, not this flag,
    // to decide what to label individually.
    isIllustrative: liveCount < rows.length,
    liveCount,
    totalCount: rows.length,
    asOf: dateBucket,
  };
}
