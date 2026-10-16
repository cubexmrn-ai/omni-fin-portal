// lib/indicators.js
//
// Pure, dependency-free technical-indicator math, operating on a real
// candle series fetched by lib/candleData.js. Split out from
// lib/technicalAnalysis.js so these stay plain numeric functions (no
// instrument/formatting concerns) that are easy to unit-test and to
// reuse — RSI/EMA/SMA genuinely require a historical closing-price
// sequence (see technicalAnalysis.js's header comment on why they were
// unavailable before this file existed); all three are standard,
// textbook formulas, nothing novel.

/**
 * Wilder's RSI (Relative Strength Index), the standard 14-period
 * formula: average gain / average loss over the lookback, smoothed
 * with Wilder's own moving average for every bar after the first
 * `period` (not a plain SMA of gains/losses past the seed window).
 * Returns null if there aren't enough closes for a genuine reading.
 */
export function calculateRSI(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i += 1) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gainSum += change;
    else lossSum += -change;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  for (let i = period + 1; i < closes.length; i += 1) {
    const change = closes[i] - closes[i - 1];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Simple Moving Average of the last `period` closes. Null if too few. */
export function calculateSMA(closes, period) {
  if (!Array.isArray(closes) || closes.length < period) return null;
  const slice = closes.slice(closes.length - period);
  return slice.reduce((sum, v) => sum + v, 0) / period;
}

/**
 * Exponential Moving Average over the full series, seeded with a
 * plain SMA of the first `period` closes (the standard approach),
 * returning only the final (most recent) EMA value.
 */
export function calculateEMA(closes, period) {
  if (!Array.isArray(closes) || closes.length < period) return null;

  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((sum, v) => sum + v, 0) / period;

  for (let i = period; i < closes.length; i += 1) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

/**
 * Detects a real swing high/low across a candle series — the actual
 * highest high and lowest low in the window — for a genuine Fibonacci
 * retracement (as opposed to technicalAnalysis.js's illustrative band,
 * used when no candle data resolved). Returns null if highs/lows
 * aren't both present (e.g. a provider that only returns closes).
 */
export function findSwingHighLow(highs, lows) {
  if (!Array.isArray(highs) || !Array.isArray(lows) || highs.length === 0 || lows.length === 0) {
    return null;
  }
  const high = Math.max(...highs);
  const low = Math.min(...lows);
  if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) return null;
  return { high, low };
}

/**
 * Same real swing detection as findSwingHighLow(), but also returns
 * WHERE in the series each extreme happened (its bar index) — needed
 * for Gann Fan/Angles, which anchors to a real pivot and projects
 * angles forward by actual elapsed bars, not just a price range.
 * Picks the FIRST occurrence of the max/min (the earliest bar that set
 * the extreme), which is the standard "pivot" convention for a fan
 * projected forward across the rest of the series.
 */
export function findSwingPointsWithIndex(highs, lows) {
  if (!Array.isArray(highs) || !Array.isArray(lows) || highs.length === 0 || lows.length === 0) {
    return null;
  }
  let highIdx = 0;
  let lowIdx = 0;
  for (let i = 1; i < highs.length; i += 1) {
    if (highs[i] > highs[highIdx]) highIdx = i;
  }
  for (let i = 1; i < lows.length; i += 1) {
    if (lows[i] < lows[lowIdx]) lowIdx = i;
  }
  const high = highs[highIdx];
  const low = lows[lowIdx];
  if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) return null;
  return { high, highIdx, low, lowIdx };
}

/**
 * Groups an ascending {time, high, low, close} candle series into
 * daily OHLC(-ish) bars — only high/low/close are tracked since that's
 * all the real Pivot Point formulas (Standard/Camarilla/Woodie) need.
 * Grouping key is the UTC calendar date of each candle's timestamp;
 * for providers whose intraday timestamps aren't strictly UTC (Alpha
 * Vantage's FX/crypto intraday series uses US/Eastern), day boundaries
 * can be off by a few hours near midnight — an accepted approximation,
 * not a precision claim, same honesty bar as everywhere else in this
 * project. Returns ascending-by-date bars: [{date, high, low, close}].
 */
export function resampleToDailyBars(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const byDate = new Map();
  for (const row of rows) {
    const d = new Date(row.time);
    if (Number.isNaN(d.getTime())) continue;
    const dateKey = d.toISOString().slice(0, 10);
    const existing = byDate.get(dateKey);
    if (!existing) {
      byDate.set(dateKey, { date: dateKey, high: row.high, low: row.low, close: row.close });
    } else {
      existing.high = Math.max(existing.high, row.high);
      existing.low = Math.min(existing.low, row.low);
      existing.close = row.close; // rows arrive ascending, so the last write for a date is that day's final close.
    }
  }
  return Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

/**
 * The most recent fully-completed daily bar from a resampleToDailyBars()
 * result — i.e. not today's still-forming bar. Returns null if there
 * isn't at least one complete day in the series (e.g. a very short
 * fallback window). This is the real "previous session" H/L/C that
 * Standard/Camarilla/Woodie pivots are computed from.
 */
export function previousCompleteDay(dailyBars) {
  if (!Array.isArray(dailyBars) || dailyBars.length === 0) return null;
  const todayKey = new Date().toISOString().slice(0, 10);
  const complete = dailyBars.filter((b) => b.date !== todayKey);
  if (complete.length === 0) return null;
  return complete[complete.length - 1];
}

/**
 * A simple RSI-based directional read for one timeframe's closing
 * series, used by Multi-Timeframe Confluence — reuses calculateRSI
 * (same Wilder formula as the primary Oscillators section) rather than
 * inventing a second definition of "trend." Returns null if the series
 * is too short for a genuine RSI(14).
 */
export function readTimeframeBias(closes) {
  const rsi = calculateRSI(closes, 14);
  if (rsi === null) return null;
  const bias = rsi >= 55 ? "bullish" : rsi <= 45 ? "bearish" : "neutral";
  return { rsi, bias };
}
