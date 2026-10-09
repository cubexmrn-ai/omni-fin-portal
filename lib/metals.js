// lib/metals.js
//
// Master precious-metals reference list, parallel to lib/currencies.js
// (fiat) and lib/crypto.js (crypto). Used by the Gold Calculator, the
// FX/Universal Currency Converter, and app/api/rates/route.js.
//
// `fallbackUsdPerOunce` is an approximate USD price per troy ounce used
// only when every live rate provider is unreachable.

export const METAL_ASSETS = [
  { code: "XAU", name: "Gold", symbol: "Au", fallbackUsdPerOunce: 2650 },
  { code: "XAG", name: "Silver", symbol: "Ag", fallbackUsdPerOunce: 31 },
  { code: "XPT", name: "Platinum", symbol: "Pt", fallbackUsdPerOunce: 980 },
  { code: "XPD", name: "Palladium", symbol: "Pd", fallbackUsdPerOunce: 1020 },
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
