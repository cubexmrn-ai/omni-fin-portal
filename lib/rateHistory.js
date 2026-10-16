// lib/rateHistory.js
//
// Real 24h-trend support for the Universal Currency Converter
// (components/CurrencyConverter.jsx). Previously this was a labeled
// "coming soon" placeholder — see that component's old TrendBadge
// comment — because no historical rate store existed. Rather than
// build and operate a new KV/DB just to cache one snapshot per day,
// this reuses the same "free keyless secondary provider" pattern
// already established in lib/marketData.js (EIA→Yahoo, metals-api→
// gold-api): two free, keyless, no-signup historical APIs that
// already publish the exact numbers needed, so "yesterday's rate" is
// a real fetched value, never a derived guess.
//
//   - Fiat ↔ fiat:    Frankfurter (https://api.frankfurter.app), the
//                      European Central Bank's free daily reference
//                      rates, going back to 1999. No key, no rate
//                      limit disclosed, CORS-friendly.
//   - Crypto:          CoinGecko's free /coins/{id}/history endpoint
//                      (lib/crypto.js already carries a `coingeckoId`
//                      per asset for exactly this kind of lookup).
//   - Metals:          No free keyless historical source was found
//                      for this. Rather than fake one, metals legs
//                      return `null` here and the UI discloses
//                      "historical trend isn't available for this
//                      asset" instead of a number — same honesty-bar
//                      convention as RSI/EMA in lib/technicalAnalysis.js.
//
// Both providers are hit with a short per-leg timeout and wrapped so
// a transient failure degrades to "unavailable", never a thrown error
// or a raw failure string reaching the page.

const FETCH_TIMEOUT_MS = 4000;

function isoDateDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function fetchJsonWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // timeout, network error, or non-JSON body — treated as "unavailable"
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Historical USD value of 1 unit of a fiat currency on `isoDate`.
 * Frankfurter's historical endpoint already snaps a weekend/holiday
 * date back to the most recent business day, so a single request
 * covers that case without extra lookback logic here.
 */
async function historicalFiatUsdValue(code, isoDate) {
  const upper = code.toUpperCase();
  if (upper === "USD") return 1;

  const data = await fetchJsonWithTimeout(
    `https://api.frankfurter.app/${isoDate}?from=USD&to=${upper}`
  );
  const rate = data?.rates?.[upper]; // units of `code` per 1 USD
  if (!Number.isFinite(rate) || rate === 0) return null;
  return 1 / rate;
}

/**
 * Historical USD price of 1 unit of a crypto asset on `isoDate`, via
 * CoinGecko's free history endpoint (date format is DD-MM-YYYY, not
 * ISO — a CoinGecko-specific quirk, converted here).
 */
async function historicalCryptoUsdValue(coingeckoId, isoDate) {
  if (!coingeckoId) return null;
  const [year, month, day] = isoDate.split("-");
  const cgDate = `${day}-${month}-${year}`;

  const data = await fetchJsonWithTimeout(
    `https://api.coingecko.com/api/v3/coins/${coingeckoId}/history?date=${cgDate}&localization=false`
  );
  const price = data?.market_data?.current_price?.usd;
  return Number.isFinite(price) ? price : null;
}

/**
 * Dispatches to the right free historical provider for an asset
 * class. Metals (and anything unrecognized) return `null` — a
 * disclosed "unavailable", never a fabricated figure.
 *
 * `meta` carries whatever per-asset lookup field each provider needs
 * (currently just crypto's `coingeckoId`, passed straight from
 * lib/crypto.js's getCrypto() by the caller).
 */
export async function getHistoricalUsdValue(assetClass, code, isoDate, meta = {}) {
  switch (assetClass) {
    case "fiat":
      return historicalFiatUsdValue(code, isoDate);
    case "crypto":
      return historicalCryptoUsdValue(meta.coingeckoId, isoDate);
    case "metals":
    default:
      return null;
  }
}

/**
 * Yesterday's date in UTC, as the YYYY-MM-DD both providers expect.
 * Exported so the API route and this module stay on the exact same
 * "24h" definition.
 */
export function yesterdayIsoDate() {
  return isoDateDaysAgo(1);
}

// ---------------------------------------------------------------------------
// Phase 2 item 3 — 30-day volatility series (Expat & FX Decision Layer)
// ---------------------------------------------------------------------------
//
// Extends the single-day lookups above into real multi-day series, so
// a genuine 30-day day-over-day return volatility can be computed
// (rather than approximated from a single 24h delta). Same provider
// chain and the same honesty rule: a metals leg (or a leg whose
// provider fails) returns `null` for its OWN series, which propagates
// to a `null` whole-pair result in getPairVolatility() below — this
// deliberately does NOT fall back to treating a missing leg as zero
// volatility, since that would silently understate/mislead rather
// than disclose "not available."
//
// Cross-rate volatility is approximated via quadrature
// (sqrt(volFrom² + volTo²)), treating each leg's own volatility vs.
// USD as independent — a standard, disclosed approximation, not a
// true joint-series calculation (Frankfurter's fiat business-day
// calendar and CoinGecko's crypto calendar-day series aren't
// necessarily date-aligned, so fetching and aligning a true joint
// ratio series isn't attempted here).

const DEFAULT_VOLATILITY_DAYS = 30;
const MIN_SERIES_POINTS = 5; // below this, a volatility estimate isn't meaningful.

/**
 * Daily USD-value series for a fiat currency over the last `days`
 * days, via Frankfurter's range syntax. USD itself is a constant
 * series of 1s — a real, exactly-zero-volatility fact, not a missing
 * data point, so it's returned directly rather than fetched.
 */
async function historicalFiatSeries(code, days = DEFAULT_VOLATILITY_DAYS) {
  const upper = code.toUpperCase();
  if (upper === "USD") {
    return Array.from({ length: days + 1 }, () => 1);
  }

  const start = isoDateDaysAgo(days);
  const end = yesterdayIsoDate();
  const data = await fetchJsonWithTimeout(`https://api.frankfurter.app/${start}..${end}?from=USD&to=${upper}`);
  const ratesByDate = data?.rates;
  if (!ratesByDate || typeof ratesByDate !== "object") return null;

  const series = Object.keys(ratesByDate)
    .sort()
    .map((d) => ratesByDate[d]?.[upper])
    .filter((rate) => Number.isFinite(rate) && rate !== 0)
    .map((rate) => 1 / rate); // USD value of 1 unit of `code`

  return series.length >= MIN_SERIES_POINTS ? series : null;
}

/**
 * Daily USD-price series for a crypto asset over the last `days` days,
 * via CoinGecko's free market_chart endpoint.
 */
async function historicalCryptoSeries(coingeckoId, days = DEFAULT_VOLATILITY_DAYS) {
  if (!coingeckoId) return null;

  const data = await fetchJsonWithTimeout(
    `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
  );
  const prices = data?.prices;
  if (!Array.isArray(prices)) return null;

  const series = prices.map(([, price]) => price).filter((p) => Number.isFinite(p));
  return series.length >= MIN_SERIES_POINTS ? series : null;
}

/**
 * Dispatches to the right free series provider for an asset class —
 * the multi-day counterpart of getHistoricalUsdValue() above. Metals
 * (and anything unrecognized) return `null`.
 */
export async function getHistoricalSeries(assetClass, code, days = DEFAULT_VOLATILITY_DAYS, meta = {}) {
  switch (assetClass) {
    case "fiat":
      return historicalFiatSeries(code, days);
    case "crypto":
      return historicalCryptoSeries(meta.coingeckoId, days);
    case "metals":
    default:
      return null;
  }
}

/**
 * Population standard deviation of day-over-day % returns, as a
 * percent (e.g. 1.2 means ~1.2% typical daily move) — the standard
 * realized-volatility estimate, computed directly from a real price
 * series, never a modeled/implied figure. Returns `null` if the
 * series is too short (or too degenerate) for a meaningful estimate.
 */
export function computeDailyReturnVolatilityPct(series) {
  if (!Array.isArray(series) || series.length < MIN_SERIES_POINTS) return null;

  const returns = [];
  for (let i = 1; i < series.length; i += 1) {
    const prev = series[i - 1];
    const curr = series[i];
    if (!Number.isFinite(prev) || !Number.isFinite(curr) || prev === 0) continue;
    returns.push((curr - prev) / prev);
  }
  if (returns.length < MIN_SERIES_POINTS - 1) return null;

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

/**
 * Real 30-day pair volatility, combining each leg's own USD-relative
 * volatility via quadrature (see header note above for why). Returns
 * `null` for the WHOLE pair if either leg's volatility can't be
 * computed — e.g. a metals leg, or a provider outage — rather than
 * ever treating a missing leg as zero (which would silently
 * understate the real figure).
 */
export async function getPairVolatility(fromClass, fromCode, toClass, toCode, fromMeta = {}, toMeta = {}, days = DEFAULT_VOLATILITY_DAYS) {
  const [fromSeries, toSeries] = await Promise.all([
    getHistoricalSeries(fromClass, fromCode, days, fromMeta),
    getHistoricalSeries(toClass, toCode, days, toMeta),
  ]);

  const fromVolPct = computeDailyReturnVolatilityPct(fromSeries);
  const toVolPct = computeDailyReturnVolatilityPct(toSeries);
  if (fromVolPct === null || toVolPct === null) return null;

  return {
    pairVolPct: Math.sqrt(fromVolPct ** 2 + toVolPct ** 2),
    fromVolPct,
    toVolPct,
    days,
  };
}
