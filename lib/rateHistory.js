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
