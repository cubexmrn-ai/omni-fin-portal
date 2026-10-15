// lib/marketData.js
//
// Shared unified-rates logic for OmniFin Portal. Fetches four
// independent data sources IN PARALLEL via Promise.all():
//   1. Fiat exchange rates   — ExchangeRate-API (EXCHANGE_RATE_API_KEY)
//   2. Crypto spot prices    — CoinGecko         (COINGECKO_API_KEY)
//   3. Metal prices (precious + copper) — metals-api.com (METALS_API_KEY),
//      falling back to gold-api.com (free, keyless)
//   4. Commodity prices (crude oil) — static reference only for now,
//      no live provider configured (see fetchCommodityPrices() below)
//
// This used to live inline in app/api/rates/route.js, with any other
// server-side caller (e.g. app/api/market-ai/route.js) fetching that
// route over HTTP to get live prices. Per the exact same lesson learned
// with lib/newsAggregator.js (see the comment at the top of that file),
// a server-side self-fetch of our own API route is unreliable — so the
// actual logic lives HERE as a plain async function with no Request/
// Response dependency, and app/api/rates/route.js is now a thin wrapper
// around getUnifiedRates(), exactly like app/api/news-ai/route.js is a
// thin wrapper around getAggregatedNews(). Any other route or server
// component that needs live prices (like the technical-analysis route)
// calls getUnifiedRates() directly — no HTTP round trip.

import { CURRENCY_CODES, FALLBACK_RATES as FIAT_FALLBACK } from "@/lib/currencies";
import { CRYPTO_ASSETS, CRYPTO_FALLBACK_USD } from "@/lib/crypto";
import { METAL_CODES, METAL_FALLBACK_USD } from "@/lib/metals";
import { COMMODITY_CODES, COMMODITY_FALLBACK_USD } from "@/lib/commodities";

// AUDIT FIX: was 3600 (1 hour) — on a force-dynamic page that re-renders
// every request, the PAGE refreshed but the underlying prices sat
// behind Next's Data Cache for a full hour, so the "live" composite
// sentiment gauge/calculators showed the exact same numbers across
// repeated visits within that hour and read as stuck rather than live.
// 300s (5 minutes) is comfortably inside every provider's free-tier
// budget used here (CoinGecko's free tier, gold-api.com's keyless
// endpoint, ExchangeRate-API's open fallback) at this site's traffic
// level, and makes the site feel like a live terminal instead of an
// hourly snapshot.
export const RATES_REVALIDATE_SECONDS = 300; // 5 minutes — feels live, still well inside free-tier limits.
const FETCH_TIMEOUT_MS = 8000; // Don't let one slow provider hang the build.

/**
 * fetch() with both Next.js ISR caching and a hard timeout, so a slow
 * or hanging upstream provider can't stall the whole route (or a
 * Vercel build doing static prerendering) indefinitely.
 */
async function cachedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      next: { revalidate: RATES_REVALIDATE_SECONDS },
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// 1. Fiat — ExchangeRate-API
// ---------------------------------------------------------------------------

async function fetchFiatRates() {
  // Supports either env var name: EXCHANGE_RATE_API_KEY (current) or the
  // older EXCHANGERATE_API_KEY (kept for backward compatibility with
  // earlier Phase 2 deployments of this project).
  const apiKey =
    process.env.EXCHANGE_RATE_API_KEY || process.env.EXCHANGERATE_API_KEY;

  async function fromKeyedProvider() {
    const res = await cachedFetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    );
    if (!res.ok) throw new Error(`ExchangeRate-API responded ${res.status}`);
    const data = await res.json();
    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error("ExchangeRate-API returned an unsuccessful payload");
    }
    return { rates: data.conversion_rates, source: "exchangerate-api.com (v6)" };
  }

  async function fromOpenProvider() {
    const res = await cachedFetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error(`open.er-api.com responded ${res.status}`);
    const data = await res.json();
    if (data.result !== "success" || !data.rates) {
      throw new Error("open.er-api.com returned an unsuccessful payload");
    }
    return { rates: data.rates, source: "open.er-api.com" };
  }

  try {
    const { rates, source } = apiKey
      ? await fromKeyedProvider()
      : await fromOpenProvider();

    const subset = { USD: 1 };
    for (const code of CURRENCY_CODES) {
      subset[code] = Number.isFinite(rates[code]) ? rates[code] : FIAT_FALLBACK[code];
    }
    return { rates: subset, source, warning: null };
  } catch (keyedError) {
    try {
      const { rates, source } = await fromOpenProvider();
      const subset = { USD: 1 };
      for (const code of CURRENCY_CODES) {
        subset[code] = Number.isFinite(rates[code]) ? rates[code] : FIAT_FALLBACK[code];
      }
      return { rates: subset, source, warning: null };
    } catch (openError) {
      return {
        rates: FIAT_FALLBACK,
        source: "static-fallback",
        warning: `Fiat rates unavailable (${openError.message || "unknown error"}); using fallback values.`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Crypto — CoinGecko
// ---------------------------------------------------------------------------

async function fetchCryptoPrices() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const ids = CRYPTO_ASSETS.map((c) => c.coingeckoId).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  try {
    const res = await cachedFetch(url, {
      headers: apiKey ? { "x-cg-demo-api-key": apiKey } : undefined,
    });
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
    const data = await res.json();

    const subset = {};
    for (const asset of CRYPTO_ASSETS) {
      const usd = data?.[asset.coingeckoId]?.usd;
      subset[asset.code] = Number.isFinite(usd) ? usd : CRYPTO_FALLBACK_USD[asset.code];
    }
    return { rates: subset, source: "coingecko.com", warning: null };
  } catch (err) {
    return {
      rates: CRYPTO_FALLBACK_USD,
      source: "static-fallback",
      warning: `Crypto prices unavailable (${err.message || "unknown error"}); using fallback values.`,
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Metals — metals-api.com (primary, keyed) → gold-api.com (free, keyless
//    fallback) → static values (last resort)
// ---------------------------------------------------------------------------

async function fetchFromMetalsApi(apiKey) {
  const symbols = METAL_CODES.join(",");
  const res = await cachedFetch(
    `https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=${symbols}`
  );
  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.success === false || !data.rates) {
    const detail =
      data?.error?.info || data?.error?.type || `HTTP ${res.status}`;
    throw new Error(`metals-api.com: ${detail}`);
  }

  // metals-api.com quotes rates as "troy ounces of metal per 1 USD" (the
  // same convention as fiat, base=USD) — e.g. rates.XAU ≈ 0.00038. We
  // invert to USD-per-troy-ounce so metals share crypto's "direct USD
  // value per unit" convention (see lib/assetConversion.js), which also
  // matches what the Metals & Commodities Calculator expects as its base
  // price. Some responses also include a convenience "USD<SYMBOL>" key
  // with that inversion already done — prefer it when present.
  const subset = {};
  for (const code of METAL_CODES) {
    const direct = data.rates[`USD${code}`];
    const inverse = data.rates[code];
    if (Number.isFinite(direct)) {
      subset[code] = direct;
    } else if (Number.isFinite(inverse) && inverse !== 0) {
      subset[code] = 1 / inverse;
    } else {
      throw new Error(`metals-api.com: no ${code} rate in response`);
    }
  }
  return subset;
}

/**
 * gold-api.com — free, no API key required, one request per symbol,
 * returns the USD price per troy ounce directly (no inversion needed).
 * Used as a live fallback when metals-api.com's keyed call fails, so a
 * misconfigured METALS_API_KEY degrades to "still live, different
 * source" instead of straight to a frozen static number.
 */
async function fetchFromGoldApi() {
  const settled = await Promise.all(
    METAL_CODES.map(async (code) => {
      try {
        const res = await cachedFetch(`https://api.gold-api.com/price/${code}`);
        if (!res.ok) throw new Error(`gold-api.com responded ${res.status}`);
        const data = await res.json();
        if (!Number.isFinite(data?.price)) {
          throw new Error(`gold-api.com returned no price for ${code}`);
        }
        return { code, price: data.price };
      } catch (err) {
        return { code, price: null, error: err.message };
      }
    })
  );

  const subset = {};
  const errors = [];
  for (const { code, price, error } of settled) {
    if (Number.isFinite(price)) {
      subset[code] = price;
    } else {
      errors.push(error);
    }
  }

  if (Object.keys(subset).length === 0) {
    throw new Error(errors[0] || "gold-api.com unavailable");
  }
  // Fill any individually-missing symbol (rare) with the static value
  // rather than failing the whole provider over one bad symbol.
  for (const code of METAL_CODES) {
    if (!Number.isFinite(subset[code])) subset[code] = METAL_FALLBACK_USD[code];
  }
  return subset;
}

async function fetchMetalPrices() {
  const apiKey = process.env.METALS_API_KEY;
  let keyedErrorMessage = apiKey ? null : "METALS_API_KEY not configured";

  if (apiKey) {
    try {
      const rates = await fetchFromMetalsApi(apiKey);
      return { rates, source: "metals-api.com", warning: null, metalsDebug: null };
    } catch (err) {
      keyedErrorMessage = err.message || "unknown error";
    }
  }

  try {
    const rates = await fetchFromGoldApi();
    // This is still real live data — just from the free secondary
    // provider — so it intentionally does NOT set `warning` (which the
    // UI reads as "showing stale/static numbers"). The reason the
    // primary provider was skipped is surfaced separately for debugging.
    return {
      rates,
      source: "gold-api.com",
      warning: null,
      metalsDebug: `metals-api.com not used (${keyedErrorMessage}); served live prices from gold-api.com instead.`,
    };
  } catch (freeErr) {
    return {
      rates: METAL_FALLBACK_USD,
      source: "static-fallback",
      warning: `Metal prices unavailable (${keyedErrorMessage}; gold-api.com: ${freeErr.message}); using static fallback values.`,
      metalsDebug: null,
    };
  }
}

// ---------------------------------------------------------------------------
// 4. Commodities — crude oil (WTI); EIA Open Data API (keyed, primary) →
//    Yahoo Finance's unofficial chart endpoint (free, keyless fallback) →
//    static value (last resort). Exactly the same 3-tier shape as
//    fetchMetalPrices() above.
// ---------------------------------------------------------------------------

/**
 * EIA (U.S. Energy Information Administration) Open Data API v2 —
 * requires a free API key (EIA_API_KEY) from https://www.eia.gov/opendata/
 * but has no paid tier or rate-limit cost. Series RWTC is the EIA's daily
 * WTI Cushing, Oklahoma spot price (dollars per barrel) — the standard
 * reference WTI quote. EIA only publishes daily closes (not intraday), so
 * this is "yesterday's settle," not a tick-by-tick live feed — still a
 * genuine, non-fabricated market figure, not a static placeholder.
 */
async function fetchFromEiaApi(apiKey) {
  const res = await cachedFetch(
    `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RWTC&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=1`
  );
  const data = await res.json().catch(() => null);
  const row = data?.response?.data?.[0];
  const price = Number(row?.value);

  if (!res.ok || !Number.isFinite(price)) {
    const detail = data?.error || `HTTP ${res.status}`;
    throw new Error(`EIA API: ${detail}`);
  }
  return { WTI: price };
}

/**
 * Yahoo Finance's unofficial (keyless) chart quote endpoint — the same
 * category of best-effort free public endpoint this codebase already
 * leans on elsewhere (e.g. the RSS feeds in lib/newsAggregator.js). Used
 * as the live fallback when EIA_API_KEY is missing or the EIA call fails,
 * so a misconfigured/absent key degrades to "still live, different
 * source" rather than straight to the static number. CL=F is the
 * continuous front-month WTI futures contract — intraday, unlike EIA's
 * daily settle.
 */
async function fetchFromYahooChart() {
  const res = await cachedFetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/CL=F"
  );
  const data = await res.json().catch(() => null);
  const price = Number(
    data?.chart?.result?.[0]?.meta?.regularMarketPrice
  );

  if (!res.ok || !Number.isFinite(price)) {
    throw new Error(`Yahoo Finance chart: HTTP ${res.status}`);
  }
  return { WTI: price };
}

async function fetchCommodityPrices() {
  const apiKey = process.env.EIA_API_KEY;
  let keyedErrorMessage = apiKey ? null : "EIA_API_KEY not configured";

  if (apiKey) {
    try {
      const rates = await fetchFromEiaApi(apiKey);
      return { rates, source: "eia.gov", warning: null, commodityDebug: null };
    } catch (err) {
      keyedErrorMessage = err.message || "unknown error";
    }
  }

  try {
    const rates = await fetchFromYahooChart();
    // Still real, live data from the free secondary provider — same
    // reasoning as fetchMetalPrices()'s metalsDebug: intentionally NOT a
    // `warning`, since that's read as "showing stale/static numbers."
    return {
      rates,
      source: "query1.finance.yahoo.com",
      warning: null,
      commodityDebug: `EIA API not used (${keyedErrorMessage}); served a live price from Yahoo Finance instead.`,
    };
  } catch (freeErr) {
    return {
      rates: COMMODITY_FALLBACK_USD,
      source: "static-fallback",
      warning: null,
      commodityDebug: null,
      // Kept as `note` (not `warning`) for the same reason as before:
      // this is the deliberate last-resort rung of a real fallback
      // chain, not a surprising degradation to flag loudly — but it's
      // now reachable only if BOTH live providers failed, not the
      // permanent by-design state it used to be.
      note: `Live crude oil pricing unavailable right now (${keyedErrorMessage}; Yahoo Finance: ${freeErr.message}); showing a static reference price.`,
    };
  }
}

// ---------------------------------------------------------------------------
// Unified payload
// ---------------------------------------------------------------------------

/**
 * Fetches all four sources in parallel and returns the same unified
 * shape app/api/rates/route.js has always returned over HTTP — but as a
 * plain object any server-side caller can `await` directly.
 */
export async function getUnifiedRates() {
  const [fiat, crypto, metals, commodities] = await Promise.all([
    fetchFiatRates(),
    fetchCryptoPrices(),
    fetchMetalPrices(),
    fetchCommodityPrices(),
  ]);

  const warnings = [fiat.warning, crypto.warning, metals.warning].filter(Boolean);

  return {
    base: "USD",
    fiat: fiat.rates,
    crypto: crypto.rates,
    metals: metals.rates,
    commodities: commodities.rates,
    sources: {
      fiat: fiat.source,
      crypto: crypto.source,
      metals: metals.source,
      commodities: commodities.source,
    },
    fetchedAt: new Date().toISOString(),
    revalidateSeconds: RATES_REVALIDATE_SECONDS,
    ...(warnings.length ? { warnings } : {}),
    ...(metals.metalsDebug ? { metalsDebug: metals.metalsDebug } : {}),
    ...(commodities.commodityDebug ? { commodityDebug: commodities.commodityDebug } : {}),
    ...(commodities.note ? { commodityNote: commodities.note } : {}),
  };
}
