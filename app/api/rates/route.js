// app/api/rates/route.js
//
// Unified serverless rates endpoint for OmniFin Portal. Fetches three
// independent data sources IN PARALLEL via Promise.all():
//   1. Fiat exchange rates   — ExchangeRate-API (EXCHANGE_RATE_API_KEY)
//   2. Crypto spot prices    — CoinGecko         (COINGECKO_API_KEY)
//   3. Precious metal prices — metals-api.com    (METALS_API_KEY)
//
// Each provider has its own try/catch and static fallback, so one
// provider being down/rate-limited never breaks the other two (or the
// whole route) — the response just carries a `warnings` entry for that
// asset class and keeps serving fallback numbers for it.
//
// Uses Next.js's fetch cache with a 3600s (1 hour) revalidation window
// per provider call, so this behaves like an ISR-cached endpoint: the
// first request after the window expires triggers a background
// refresh, while all other requests are served instantly from cache —
// protecting every provider's free-tier rate limits.

import { CURRENCY_CODES, FALLBACK_RATES as FIAT_FALLBACK } from "@/lib/currencies";
import { CRYPTO_ASSETS, CRYPTO_FALLBACK_USD } from "@/lib/crypto";
import { METAL_CODES, METAL_FALLBACK_USD } from "@/lib/metals";

const REVALIDATE_SECONDS = 3600; // 1 hour — protects free-tier API limits.
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
      next: { revalidate: REVALIDATE_SECONDS },
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
//
// metals-api.com (and its sister products under the same provider, e.g.
// metalpriceapi.com) commonly fail silently for reasons that have nothing
// to do with this code being wrong: a free/trial key that doesn't include
// `base` currency switching, HTTPS access gated to a paid tier, a key tied
// to the wrong product domain, or a monthly quota already spent. Any of
// these show up here as `res.ok === false` or `data.success === false`.
//
// Rather than dropping straight to a frozen static price the moment that
// happens (which is what was happening — hence the stuck $2650 / "Using
// fallback rates" badge), we add a free, keyless secondary provider
// (gold-api.com) so the Gold Calculator still gets a real live spot price
// even when the paid provider's key is misconfigured. The *actual* reason
// the keyed call failed is preserved in `metalsDebug` below so it's visible
// in the API response while diagnosing the METALS_API_KEY setup, without
// flipping the UI into its "fallback" state over what is still live data.

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
  // matches what the Gold Calculator expects as its base price. Some
  // responses also include a convenience "USD<SYMBOL>" key with that
  // inversion already done — prefer it when present.
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
// Route handler
// ---------------------------------------------------------------------------

export async function GET() {
  const [fiat, crypto, metals] = await Promise.all([
    fetchFiatRates(),
    fetchCryptoPrices(),
    fetchMetalPrices(),
  ]);

  const warnings = [fiat.warning, crypto.warning, metals.warning].filter(Boolean);

  const responseBody = {
    base: "USD",
    fiat: fiat.rates,
    crypto: crypto.rates,
    metals: metals.rates,
    sources: {
      fiat: fiat.source,
      crypto: crypto.source,
      metals: metals.source,
    },
    fetchedAt: new Date().toISOString(),
    revalidateSeconds: REVALIDATE_SECONDS,
    ...(warnings.length ? { warnings } : {}),
    // Diagnostic only (not a user-facing warning): set whenever
    // metals-api.com was skipped/failed but gold-api.com still served
    // live data, so the METALS_API_KEY setup can be debugged from the
    // response itself (e.g. via `curl /api/rates` or Vercel logs) without
    // the UI showing a misleading "fallback rates" state.
    ...(metals.metalsDebug ? { metalsDebug: metals.metalsDebug } : {}),
  };

  return Response.json(responseBody, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=59`,
    },
  });
}
