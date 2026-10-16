// lib/candleData.js
//
// Real intraday OHLC candle fetching for the AI Technical Analysis
// engine (lib/technicalAnalysis.js / app/api/market-ai/route.js) —
// this project previously stored NO historical price series anywhere
// (see technicalAnalysis.js's big header comment), which is exactly
// why RSI/EMA/SMA/Gann were explicitly marked unavailable and
// Fibonacci/Pivot Points fell back to an illustrative band. This file
// is the thing that comment said would "unlock" them: a real,
// provider-backed closes/highs/lows series, fetched with the same
// honesty-bar three-tier pattern already used everywhere else in this
// project (EIA→Yahoo→static for WTI, metals-api→gold-api→static for
// metals) — Twelve Data primary, Alpha Vantage fallback, and an
// explicit `null` (never a crash, never a fabricated candle) when
// neither resolves.
//
// FREE-TIER BUDGETING (why this looks more careful than
// lib/marketData.js's cachedFetch): Twelve Data's free tier caps out
// around 800 requests/day; Alpha Vantage's free tier is far smaller
// (25 requests/day as of their current limits). A plain 15-minute
// Next.js fetch cache (next.revalidate, same mechanism
// lib/marketData.js uses) already does most of the work — Vercel's
// fetch Data Cache is shared across invocations, not per-lambda, so
// one cache entry per distinct symbol really does bound calls to
// roughly once per revalidate window platform-wide. But with 15
// instruments in INSTRUMENT_OPTIONS, a worst-case day where every
// instrument is requested in every 15-minute window could still reach
// 15 × 96 = 1,440 Twelve Data calls/day — over budget. So this module
// adds a second, in-memory guard: a best-effort daily call counter per
// provider (reset on UTC date change) that stops calling that provider
// once a conservative cap is hit, falling through to the next tier
// (or to the honest "unavailable" result) instead. "Best-effort"
// because a serverless instance can restart and lose the counter —
// this is a safety margin on top of the real cache, not a substitute
// for it, and is deliberately set well under each provider's stated
// limit so an undercount never actually breaches it.

import { resampleToDailyBars } from "@/lib/indicators";

const FETCH_TIMEOUT_MS = 6000;
export const CANDLE_REVALIDATE_SECONDS = 900; // 15 minutes, per the budgeting note above.

const DAILY_CAPS = { twelvedata: 700, alphavantage: 20 }; // conservative margins under each provider's real free-tier ceiling.
const callCounters = { twelvedata: { date: null, count: 0 }, alphavantage: { date: null, count: 0 } };

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

/** True if calling `provider` again today would still be within its conservative daily cap. */
function underDailyCap(provider) {
  const counter = callCounters[provider];
  const today = todayUtc();
  if (counter.date !== today) {
    counter.date = today;
    counter.count = 0;
  }
  return counter.count < DAILY_CAPS[provider];
}

function recordCall(provider) {
  const counter = callCounters[provider];
  counter.count += 1;
}

async function fetchJson(url, { timeoutMs = FETCH_TIMEOUT_MS, revalidate = CANDLE_REVALIDATE_SECONDS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // timeout, network error, non-JSON body — all "unavailable", never a thrown error.
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Twelve Data's forward-slash symbol notation covers FX, crypto,
 * metals and several commodities (incl. WTI) under one consistent
 * `BASE/QUOTE` shape — see INSTRUMENT_OPTIONS in
 * lib/technicalAnalysis.js for the `kind`/`invert` fields this reads.
 */
function toTwelveDataSymbol(instrument) {
  if (instrument.kind === "fx") {
    return instrument.invert ? `${instrument.assetCode}/USD` : `USD/${instrument.assetCode}`;
  }
  return `${instrument.code}/USD`; // metals, WTI, crypto all quote directly against USD here.
}

/**
 * Twelve Data time_series — https://api.twelvedata.com/time_series.
 * Returns ascending-by-time {closes, highs, lows, times} or null.
 * `outputsize` defaults to 400 (bumped up from this file's original
 * 100) so EMA/SMA 200 and Woodie/Camarilla/Standard pivots (which need
 * at least one full REAL previous day of hourly bars, via
 * lib/indicators.js's resampleToDailyBars()) have enough real history
 * to work from — this costs nothing extra in daily-cap terms, since
 * it's still exactly one Twelve Data request either way, just a bigger
 * response body.
 */
async function fetchFromTwelveData(instrument, apiKey, { interval = "1h", outputsize = 400 } = {}) {
  if (!apiKey || !underDailyCap("twelvedata")) return null;

  const symbol = toTwelveDataSymbol(instrument);
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
    symbol
  )}&interval=${encodeURIComponent(interval)}&outputsize=${outputsize}&apikey=${apiKey}`;

  recordCall("twelvedata");
  const data = await fetchJson(url);

  // Twelve Data returns {status:"error", message:"..."} for an
  // unsupported symbol on a given plan — treated as "this instrument
  // isn't available from this provider", never surfaced as a crash.
  if (!data || data.status === "error" || !Array.isArray(data.values) || data.values.length === 0) {
    return null;
  }

  const rows = data.values
    .map((v) => ({
      time: v.datetime,
      close: Number(v.close),
      high: Number(v.high),
      low: Number(v.low),
    }))
    .filter((r) => Number.isFinite(r.close) && Number.isFinite(r.high) && Number.isFinite(r.low))
    .sort((a, b) => new Date(a.time) - new Date(b.time)); // Twelve Data returns newest-first; normalize to ascending.

  if (rows.length < 15) return null; // not enough bars for a genuine RSI(14).

  return {
    source: "twelvedata",
    interval,
    closes: rows.map((r) => r.close),
    highs: rows.map((r) => r.high),
    lows: rows.map((r) => r.low),
    times: rows.map((r) => r.time),
  };
}

/**
 * Alpha Vantage fallback — different function per asset kind, since
 * Alpha Vantage has no single unified symbol notation the way Twelve
 * Data does. Metals have no free Alpha Vantage intraday OHLC endpoint
 * at all, so that `kind` is left out here and simply falls through to
 * "unavailable" at the caller — never a guessed/fabricated series.
 */
async function fetchFromAlphaVantage(instrument, apiKey) {
  if (!apiKey || !underDailyCap("alphavantage")) return null;

  let url = null;
  let seriesKey = null;

  if (instrument.kind === "fx") {
    const from = instrument.invert ? instrument.assetCode : "USD";
    const to = instrument.invert ? "USD" : instrument.assetCode;
    url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${from}&to_symbol=${to}&interval=60min&outputsize=compact&apikey=${apiKey}`;
    seriesKey = "Time Series FX (60min)";
  } else if (instrument.kind === "crypto") {
    url = `https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=${instrument.code}&market=USD&interval=60min&outputsize=compact&apikey=${apiKey}`;
    seriesKey = "Time Series Crypto (60min)";
  } else {
    return null; // metals / commodities: no free Alpha Vantage OHLC endpoint — honestly unavailable, not attempted.
  }

  recordCall("alphavantage");
  const data = await fetchJson(url);
  const series = data?.[seriesKey];
  if (!series || typeof series !== "object") return null; // includes Alpha Vantage's own rate-limit "Note"/"Information" bodies.

  const rows = Object.entries(series)
    .map(([time, ohlc]) => ({
      time,
      close: Number(ohlc["4. close"]),
      high: Number(ohlc["2. high"]),
      low: Number(ohlc["3. low"]),
    }))
    .filter((r) => Number.isFinite(r.close) && Number.isFinite(r.high) && Number.isFinite(r.low))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  if (rows.length < 15) return null;

  return {
    source: "alphavantage",
    interval: "1h",
    closes: rows.map((r) => r.close),
    highs: rows.map((r) => r.high),
    lows: rows.map((r) => r.low),
    times: rows.map((r) => r.time),
  };
}

/**
 * Fetches real intraday OHLC candles for `instrument`, Twelve Data
 * first, Alpha Vantage second, or `null` if neither resolves (missing
 * keys, unsupported symbol on either provider, a transient outage, or
 * this request's conservative daily cap already reached) — the caller
 * (lib/technicalAnalysis.js) treats `null` exactly like "no candle
 * provider configured" and keeps every existing illustrative/
 * unavailable disclosure intact, so a bad key or a down provider can
 * only ever lose real-data upgrades, never break the page.
 */
export async function fetchCandles(instrument) {
  try {
    const twelveDataKey = process.env.TWELVE_DATA_API_KEY;
    const fromTwelveData = await fetchFromTwelveData(instrument, twelveDataKey);
    if (fromTwelveData) return fromTwelveData;

    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    const fromAlphaVantage = await fetchFromAlphaVantage(instrument, alphaVantageKey);
    if (fromAlphaVantage) return fromAlphaVantage;

    return null;
  } catch {
    return null; // defensive — the per-provider functions already catch their own errors.
  }
}

/**
 * Multi-Timeframe Confluence support — fetches the SAME primary 1h
 * series as fetchCandles() above (unchanged behavior/cost), then adds
 * two more timeframe legs as cheaply as possible:
 *
 *   - "1D": resampled from the already-fetched 1h series in
 *     lib/technicalAnalysis.js (via lib/indicators.js's
 *     resampleToDailyBars()) — zero extra network calls, so this leg
 *     is free and always attempted whenever the primary 1h fetch
 *     resolves.
 *   - "15m": a genuinely separate Twelve Data request (Alpha Vantage
 *     is deliberately NOT used for this leg — its free tier is far too
 *     small, ~25 requests/day, to spend on a second series per
 *     report). This reuses the exact same underDailyCap("twelvedata")
 *     guard as the primary fetch, so on a day where the budget is
 *     already tight, this leg simply comes back null — Multi-Timeframe
 *     Confluence degrades to 2 timeframes (1h + 1D) rather than ever
 *     risking the provider's real quota. Only attempted when the
 *     primary resolved via Twelve Data in the first place (if Twelve
 *     Data already failed/unsupported for this instrument, trying a
 *     second interval on the same provider would too).
 *
 * Returns { primary, timeframes: { "15m": candles|null, "1h":
 * candles|null, "1D": candles|null } } — `primary` is exactly what
 * fetchCandles() would have returned (so every existing call site
 * reading `.primary` behaves like before), and every entry in
 * `timeframes` is either a real candles object or `null`, never a
 * fabricated/guessed series.
 */
export async function fetchCandlesMultiTimeframe(instrument) {
  const primary = await fetchCandles(instrument);

  const timeframes = { "15m": null, "1h": primary, "1D": null };

  if (primary && Array.isArray(primary.times)) {
    const rows = primary.times.map((time, i) => ({
      time,
      close: primary.closes[i],
      high: primary.highs[i],
      low: primary.lows[i],
    }));
    const dailyBars = resampleToDailyBars(rows);
    if (dailyBars.length >= 15) {
      // Real daily closes/highs/lows, resampled from the real intraday
      // series — not a second fetch, not a guess.
      timeframes["1D"] = {
        source: `${primary.source}-resampled`,
        interval: "1D",
        closes: dailyBars.map((b) => b.close),
        highs: dailyBars.map((b) => b.high),
        lows: dailyBars.map((b) => b.low),
      };
    }
  }

  if (primary && primary.source === "twelvedata") {
    try {
      const twelveDataKey = process.env.TWELVE_DATA_API_KEY;
      timeframes["15m"] = await fetchFromTwelveData(instrument, twelveDataKey, {
        interval: "15min",
        outputsize: 300,
      });
    } catch {
      timeframes["15m"] = null;
    }
  }

  return { primary, timeframes };
}
