// lib/crypto.js
//
// Master cryptocurrency reference list, parallel to lib/currencies.js
// (fiat) and lib/metals.js (precious metals). Used by the FX/Universal
// Currency Converter and by app/api/rates/route.js when calling
// CoinGecko's /simple/price endpoint.
//
// `coingeckoId` is CoinGecko's internal slug (not the ticker symbol) —
// required for the /simple/price?ids=... query parameter, and MUST be
// the exact lowercase slug CoinGecko uses: a wrong id doesn't error,
// it silently returns no price for that asset (and the UI falls back
// to the static `fallbackUsd` below). Every id here has been checked
// against CoinGecko's own coin list.
// `fallbackUsd` is an approximate USD price used only when every live
// rate provider is unreachable, so the converter never shows a blank
// result.
//
// Expanded well beyond the original 12 to cover the major-cap assets
// across L1s, L2s, DeFi and stablecoins, so the "major cryptos"
// dropdown isn't an artificially short hand-picked list.

export const CRYPTO_ASSETS = [
  // --- Top market-cap majors ------------------------------------------
  { code: "BTC", coingeckoId: "bitcoin", name: "Bitcoin", symbol: "₿", fallbackUsd: 65000 },
  { code: "ETH", coingeckoId: "ethereum", name: "Ethereum", symbol: "Ξ", fallbackUsd: 3400 },
  { code: "USDT", coingeckoId: "tether", name: "Tether", symbol: "₮", fallbackUsd: 1 },
  { code: "BNB", coingeckoId: "binancecoin", name: "BNB", symbol: "BNB", fallbackUsd: 580 },
  { code: "SOL", coingeckoId: "solana", name: "Solana", symbol: "SOL", fallbackUsd: 150 },
  { code: "USDC", coingeckoId: "usd-coin", name: "USD Coin", symbol: "USDC", fallbackUsd: 1 },
  { code: "XRP", coingeckoId: "ripple", name: "XRP", symbol: "XRP", fallbackUsd: 0.55 },
  { code: "TON", coingeckoId: "the-open-network", name: "Toncoin", symbol: "TON", fallbackUsd: 5.3 },
  { code: "DOGE", coingeckoId: "dogecoin", name: "Dogecoin", symbol: "Ð", fallbackUsd: 0.12 },
  { code: "ADA", coingeckoId: "cardano", name: "Cardano", symbol: "ADA", fallbackUsd: 0.38 },

  // --- Layer 1 / Layer 2 ------------------------------------------------
  { code: "TRX", coingeckoId: "tron", name: "TRON", symbol: "TRX", fallbackUsd: 0.11 },
  { code: "AVAX", coingeckoId: "avalanche-2", name: "Avalanche", symbol: "AVAX", fallbackUsd: 28 },
  { code: "DOT", coingeckoId: "polkadot", name: "Polkadot", symbol: "DOT", fallbackUsd: 6.2 },
  { code: "MATIC", coingeckoId: "matic-network", name: "Polygon", symbol: "MATIC", fallbackUsd: 0.65 },
  { code: "LINK", coingeckoId: "chainlink", name: "Chainlink", symbol: "LINK", fallbackUsd: 14 },
  { code: "LTC", coingeckoId: "litecoin", name: "Litecoin", symbol: "Ł", fallbackUsd: 72 },
  { code: "BCH", coingeckoId: "bitcoin-cash", name: "Bitcoin Cash", symbol: "BCH", fallbackUsd: 380 },
  { code: "NEAR", coingeckoId: "near", name: "NEAR Protocol", symbol: "NEAR", fallbackUsd: 5 },
  { code: "ATOM", coingeckoId: "cosmos", name: "Cosmos", symbol: "ATOM", fallbackUsd: 7.5 },
  { code: "XLM", coingeckoId: "stellar", name: "Stellar", symbol: "XLM", fallbackUsd: 0.11 },
  { code: "APT", coingeckoId: "aptos", name: "Aptos", symbol: "APT", fallbackUsd: 9 },
  { code: "SUI", coingeckoId: "sui", name: "Sui", symbol: "SUI", fallbackUsd: 1.8 },
  { code: "FIL", coingeckoId: "filecoin", name: "Filecoin", symbol: "FIL", fallbackUsd: 5 },
  { code: "ICP", coingeckoId: "internet-computer", name: "Internet Computer", symbol: "ICP", fallbackUsd: 10 },
  { code: "ETC", coingeckoId: "ethereum-classic", name: "Ethereum Classic", symbol: "ETC", fallbackUsd: 26 },
  { code: "HBAR", coingeckoId: "hedera-hashgraph", name: "Hedera", symbol: "HBAR", fallbackUsd: 0.08 },
  { code: "VET", coingeckoId: "vechain", name: "VeChain", symbol: "VET", fallbackUsd: 0.035 },
  { code: "ARB", coingeckoId: "arbitrum", name: "Arbitrum", symbol: "ARB", fallbackUsd: 1.1 },
  { code: "OP", coingeckoId: "optimism", name: "Optimism", symbol: "OP", fallbackUsd: 2.2 },
  { code: "ALGO", coingeckoId: "algorand", name: "Algorand", symbol: "ALGO", fallbackUsd: 0.18 },
  { code: "EGLD", coingeckoId: "elrond-erd-2", name: "MultiversX", symbol: "EGLD", fallbackUsd: 40 },
  { code: "FTM", coingeckoId: "fantom", name: "Fantom", symbol: "FTM", fallbackUsd: 0.6 },

  // --- Privacy / Monero-style -------------------------------------------
  { code: "XMR", coingeckoId: "monero", name: "Monero", symbol: "ɱ", fallbackUsd: 160 },

  // --- DeFi / Governance --------------------------------------------------
  { code: "UNI", coingeckoId: "uniswap", name: "Uniswap", symbol: "UNI", fallbackUsd: 7 },
  { code: "MKR", coingeckoId: "maker", name: "Maker", symbol: "MKR", fallbackUsd: 1500 },
  { code: "AAVE", coingeckoId: "aave", name: "Aave", symbol: "AAVE", fallbackUsd: 150 },
  { code: "GRT", coingeckoId: "the-graph", name: "The Graph", symbol: "GRT", fallbackUsd: 0.2 },
  { code: "RUNE", coingeckoId: "thorchain", name: "THORChain", symbol: "RUNE", fallbackUsd: 4.5 },
  { code: "IMX", coingeckoId: "immutable-x", name: "Immutable", symbol: "IMX", fallbackUsd: 1.6 },

  // --- Meme / Consumer ---------------------------------------------------
  { code: "SHIB", coingeckoId: "shiba-inu", name: "Shiba Inu", symbol: "SHIB", fallbackUsd: 0.000018 },
  { code: "SAND", coingeckoId: "the-sandbox", name: "The Sandbox", symbol: "SAND", fallbackUsd: 0.4 },
  { code: "MANA", coingeckoId: "decentraland", name: "Decentraland", symbol: "MANA", fallbackUsd: 0.4 },
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
