// lib/commodities.js
//
// Non-metal commodities for the Metals & Commodities Calculator —
// currently just crude oil (WTI). Deliberately kept OUT of
// lib/metals.js / METAL_ASSETS: every value in that list is "USD per
// troy ounce of one unit," a convention lib/assetConversion.js's
// cross-asset engine (used by the Currency Converter) and the Metals
// Calculator both rely on. Oil isn't priced by weight at all — it
// trades per barrel — so folding it into the same bucket under that
// unit convention would silently corrupt both of those features' math
// for anyone who picked it. This file's "USD per unit" always means
// "per barrel," a different convention the calling code must know to
// use the barrel-specific math for (see calculateFlatUnitPrice() in
// lib/conversionMath.js), not the weight-based calculateGoldPrice().
//
// Live pricing comes from lib/marketData.js's fetchCommodityPrices():
// EIA Open Data API (keyed via EIA_API_KEY, daily WTI settle) → Yahoo
// Finance's keyless chart endpoint (intraday CL=F futures) → the static
// fallback below, used only if both live providers fail (or EIA_API_KEY
// isn't configured and Yahoo is also unreachable).

export const COMMODITY_ASSETS = [
  {
    code: "WTI",
    name: "Crude Oil (WTI)",
    symbol: "WTI",
    unit: "barrel",
    fallbackUsdPerBarrel: 75,
  },
];

export const COMMODITY_CODES = COMMODITY_ASSETS.map((c) => c.code);

export const COMMODITY_BY_CODE = COMMODITY_ASSETS.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

/** Static USD-per-barrel fallback prices, derived from COMMODITY_ASSETS. */
export const COMMODITY_FALLBACK_USD = COMMODITY_ASSETS.reduce((acc, c) => {
  acc[c.code] = c.fallbackUsdPerBarrel;
  return acc;
}, {});

export function getCommodity(code) {
  return COMMODITY_BY_CODE[code?.toUpperCase()] || null;
}
