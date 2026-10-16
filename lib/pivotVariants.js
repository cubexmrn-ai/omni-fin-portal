// lib/pivotVariants.js
//
// Standard/Camarilla/Woodie pivot-point formulas — three well-known,
// unmodified floor-trader variants, each a pure function of one
// previous session's {high, low, close}. Split out from
// lib/technicalAnalysis.js because all three share that same single
// input shape and are easiest to keep correct side by side.
//
// All three need a REAL previous session's H/L/C to mean anything —
// lib/technicalAnalysis.js's buildPivotPointsLive() is what supplies
// that (resampled from real fetched candles via
// lib/indicators.js's resampleToDailyBars()/previousCompleteDay()).
// The pre-existing illustrative-band version (buildPivotPoints() in
// technicalAnalysis.js) stays as the fallback when no real daily bar
// is available — these functions don't know or care which kind of
// H/L/C they're given, so there is one formula implementation shared
// by both the live and illustrative paths.

/** Classic floor-trader ("Standard") pivot — P = (H+L+C)/3. */
export function standardPivots({ high, low, close }) {
  const pivot = (high + low + close) / 3;
  return {
    pivot,
    r1: 2 * pivot - low,
    s1: 2 * pivot - high,
    r2: pivot + (high - low),
    s2: pivot - (high - low),
  };
}

/**
 * Woodie's pivot — weights the close twice as heavily as Standard's:
 * P = (H + L + 2C) / 4. R1/S1/R2/S2 use the same "mirror around P"
 * shape as Standard, just computed from Woodie's own P.
 */
export function woodiePivots({ high, low, close }) {
  const pivot = (high + low + 2 * close) / 4;
  return {
    pivot,
    r1: 2 * pivot - low,
    s1: 2 * pivot - high,
    r2: pivot + (high - low),
    s2: pivot - (high - low),
  };
}

/**
 * Camarilla pivot — a different shape entirely from Standard/Woodie:
 * each level is the close plus a shrinking fraction of the day's
 * range, rather than a mirror around one central pivot. R3/R4 and
 * S3/S4 are the levels Camarilla traders actually watch (breakout
 * triggers / range extremes); R1/R2/S1/S2 exist in the full formula
 * but are rarely used in practice, so buildPivotPointsLive() in
 * technicalAnalysis.js only surfaces R3/R4/S3/S4 — this function still
 * returns the complete set for anyone importing it directly.
 */
export function camarillaPivots({ high, low, close }) {
  const range = high - low;
  return {
    pivot: (high + low + close) / 3,
    r1: close + (range * 1.1) / 12,
    s1: close - (range * 1.1) / 12,
    r2: close + (range * 1.1) / 6,
    s2: close - (range * 1.1) / 6,
    r3: close + (range * 1.1) / 4,
    s3: close - (range * 1.1) / 4,
    r4: close + (range * 1.1) / 2,
    s4: close - (range * 1.1) / 2,
  };
}
