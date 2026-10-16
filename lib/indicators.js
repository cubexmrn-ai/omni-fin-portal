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
