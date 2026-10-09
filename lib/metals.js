// lib/metals.js
//
// Master precious + base metals reference list, parallel to
// lib/currencies.js (fiat) and lib/crypto.js (crypto). Used by the
// Metals & Commodities Calculator, the FX/Universal Currency Converter,
// and app/api/rates/route.js.
//
// `fallbackUsdPerOunce` is an approximate USD price per troy ounce used
// only when every live rate provider is unreachable. Copper is
// genuinely priced by weight (unlike crude oil — see lib/commodities.js
// for why that one is a separate, non-weight-based bucket), so it fits
// this same "USD per troy ounce" convention even though real-world
// copper trading quotes it per pound — 1 lb ≈ 14.5833 troy oz, so a
// typical ~$4.50/lb copper price works out to ≈ $0.31/troy oz, which is
// what `fallbackUsdPerOunce` below reflects.
export const METAL_ASSETS = [
  { code: "XAU", name: "Gold", symbol: "Au", fallbackUsdPerOunce: 2650 },
  { code: "XAG", name: "Silver", symbol: "Ag", fallbackUsdPerOunce: 31 },
  { code: "XPT", name: "Platinum", symbol: "Pt", fallbackUsdPerOunce: 980 },
  { code: "XPD", name: "Palladium", symbol: "Pd", fallbackUsdPerOunce: 1020 },
  { code: "XCU", name: "Copper", symbol: "Cu", fallbackUsdPerOunce: 0.31 },
];

export const METAL_CODES = METAL_ASSETS.map((m) => m.code);

export const METAL_BY_CODE = METAL_ASSETS.reduce((acc, m) => {
  acc[m.code] = m;
  return acc;
}, {});

/** Static USD-per-troy-ounce fallback prices, derived from METAL_ASSETS. */
export const METAL_FALLBACK_USD = METAL_ASSETS.reduce((acc, m) => {
  acc[m.code] = m.fallbackUsdPerOunce;
  return acc;
}, {});

export function getMetal(code) {
  return METAL_BY_CODE[code?.toUpperCase()] || null;
}
