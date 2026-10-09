// lib/crypto.js
//
// Master cryptocurrency reference list, parallel to lib/currencies.js
// (fiat) and lib/metals.js (precious metals). Used by the FX/Universal
// Currency Converter and by app/api/rates/route.js when calling
// CoinGecko's /simple/price endpoint.
//
// `coingeckoId` is CoinGecko's internal slug (not the ticker symbol) —
// required for the /simple/price?ids=... query parameter.
// `fallbackUsd` is an approximate USD price used only when every live
// rate provider is unreachable, so the converter never shows a blank
// result.

export const CRYPTO_ASSETS = [
  { code: "BTC", coingeckoId: "bitcoin", name: "Bitcoin", symbol: "₿", fallbackUsd: 65000 },
  { code: "ETH", coingeckoId: "ethereum", name: "Ethereum", symbol: "Ξ", fallbackUsd: 3400 },
  { code: "SOL", coingeckoId: "solana", name: "Solana", symbol: "SOL", fallbackUsd: 150 },
  { code: "BNB", coingeckoId: "binancecoin", name: "BNB", symbol: "BNB", fallbackUsd: 580 },
  { code: "XRP", coingeckoId: "ripple", name: "XRP", symbol: "XRP", fallbackUsd: 0.55 },
  { code: "ADA", coingeckoId: "cardano", name: "Cardano", symbol: "ADA", fallbackUsd: 0.38 },
  { code: "DOGE", coingeckoId: "dogecoin", name: "Dogecoin", symbol: "Ð", fallbackUsd: 0.12 },
  { code: "DOT", coingeckoId: "polkadot", name: "Polkadot", symbol: "DOT", fallbackUsd: 6.2 },
  { code: "MATIC", coingeckoId: "matic-network", name: "Polygon", symbol: "MATIC", fallbackUsd: 0.65 },
  { code: "LTC", coingeckoId: "litecoin", name: "Litecoin", symbol: "Ł", fallbackUsd: 72 },
  { code: "AVAX", coingeckoId: "avalanche-2", name: "Avalanche", symbol: "AVAX", fallbackUsd: 28 },
  { code: "TRX", coingeckoId: "tron", name: "TRON", symbol: "TRX", fallbackUsd: 0.11 },
];

export const CRYPTO_CODES = CRYPTO_ASSETS.map((c) => c.code);

export const CRYPTO_BY_CODE = CRYPTO_ASSETS.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

/** Static USD fallback prices, derived from CRYPTO_ASSETS above. */
export const CRYPTO_FALLBACK_USD = CRYPTO_ASSETS.reduce((acc, c) => {
  acc[c.code] = c.fallbackUsd;
  return acc;
}, {});

export function getCrypto(code) {
  return CRYPTO_BY_CODE[code?.toUpperCase()] || null;
}

/** Maps CoinGecko's lowercase ids back to our uppercase ticker codes. */
export const COINGECKO_ID_TO_CODE = CRYPTO_ASSETS.reduce((acc, c) => {
  acc[c.coingeckoId] = c.code;
  return acc;
}, {});
