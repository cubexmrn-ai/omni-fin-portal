// lib/pairSlugs.js
//
// Universal "<from>-to-<to>" slug parser/builder for the programmatic
// SEO converter route (app/converters/[pair]/page.jsx), spanning all
// three asset classes — fiat, crypto, and metals — e.g. "usd-to-pkr",
// "btc-to-usd", "xau-to-usd".
//
// This is a superset of lib/fxSlugs.js, which stays in place
// unchanged (fiat-only, still used by app/converters/page.jsx's
// existing "Popular Currency Pairs" listing there). This file resolves
// a code against all three registries instead of just CURRENCY_CODES,
// so the same "<from>-to-<to>" URL shape now also covers crypto and
// metal pairs. There's no collision risk between the three code sets
// (ISO 4217 fiat codes, crypto tickers like BTC/ETH, and metal codes
// like XAU/XAG) — verified against lib/currencies.js — so resolving a
// code's class is unambiguous.

import { CURRENCY_CODES } from "@/lib/currencies";
import { CRYPTO_CODES } from "@/lib/crypto";
import { METAL_CODES } from "@/lib/metals";
import { getAssetMeta } from "@/lib/assetConversion";

const FIAT_SET = new Set(CURRENCY_CODES);
const CRYPTO_SET = new Set(CRYPTO_CODES);
const METAL_SET = new Set(METAL_CODES);

/** Which asset class a code belongs to, or null if it's unknown everywhere. */
function resolveAssetClass(code) {
  if (FIAT_SET.has(code)) return "fiat";
  if (CRYPTO_SET.has(code)) return "crypto";
  if (METAL_SET.has(code)) return "metals";
  return null;
}

/**
 * Parses a route slug of the form "<from>-to-<to>" into validated
 * { fromClass, fromCode, from, toClass, toCode, to } across fiat,
 * crypto and metals, or null if either side isn't a known asset in any
 * of the three registries.
 */
export function parsePairSlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const parts = slug.toLowerCase().split("-to-");
  if (parts.length !== 2) return null;

  const fromCode = parts[0].toUpperCase();
  const toCode = parts[1].toUpperCase();

  const fromClass = resolveAssetClass(fromCode);
  const toClass = resolveAssetClass(toCode);
  if (!fromClass || !toClass) return null;

  const from = getAssetMeta(fromClass, fromCode);
  const to = getAssetMeta(toClass, toCode);
  if (!from || !to) return null;

  return { fromClass, fromCode, from, toClass, toCode, to };
}

export function buildPairSlug(fromCode, toCode) {
  return `${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`;
}

/**
 * PHASE 2 ADDITION — base-currency rate digest pages
 * (app/converters/[pair]/page.jsx branches on this).
 *
 * Resolves a bare single-code slug (no "-to-", e.g. "pkr", "usd") to a
 * base currency, for the "/converters/<code>" digest-table page that
 * lists that currency against every other supported fiat currency.
 * Deliberately fiat-only — a bare crypto or metal code (e.g. "/converters/btc")
 * isn't a page this route serves, so it still 404s via parsePairSlug's
 * existing behavior, same as before this addition. This function is
 * intentionally separate from parsePairSlug/resolveAssetClass rather
 * than folded into them, so the pair page's other three callers
 * (the embed route and the OG image route) keep their exact existing
 * behavior for any slug without a "-to-" in it — only the page
 * component itself needs to know about this second slug shape.
 */
export function parseBaseOnlySlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  if (slug.includes("-to-")) return null;
  const code = slug.toUpperCase();
  if (!FIAT_SET.has(code)) return null;
  const meta = getAssetMeta("fiat", code);
  if (!meta) return null;
  return { assetClass: "fiat", code, meta };
}

/**
 * PHASE 3 ADDITION — amount-specific pSEO pages
 * (app/converters/[pair]/page.jsx's AmountPairSeoPage branch).
 *
 * Parses a route slug of the form "<amount>-<from>-to-<to>" (e.g.
 * "2000-aed-to-pkr", "100-usd-to-pkr") — captures real, high-volume
 * search queries like "2000 AED to PKR" that a bare pair page
 * (/converters/aed-to-pkr) doesn't itself rank for, since the amount
 * is part of what's actually typed into Google.
 *
 * Deliberately a SEPARATE function from parsePairSlug rather than
 * folding amount-detection into it: parsePairSlug's exact
 * "<from>-to-<to>" two-part split is relied on elsewhere (the embed
 * route, the OG image route) and must keep rejecting a 3-part slug
 * exactly as it does today. This route's page component tries this
 * parser FIRST, falling back to parsePairSlug/parseBaseOnlySlug for
 * every slug that isn't amount-prefixed, so none of this route's three
 * existing slug shapes gain or lose any behavior.
 *
 * The leading segment is a positive integer or decimal (no commas, no
 * thousands separators) — matches how these URLs are generated
 * (buildAmountPairSlug below) and how FEATURED_AMOUNT_PAIRS is written.
 * UPDATED Phase 6 (Oct 23 2026): originally integer-only, widened to
 * accept one optional decimal fraction (same `\d+(?:\.\d+)?` shape
 * already used by matchCurrency/matchZakatGold in
 * components/UniversalSmartSearch.jsx) once FEATURED_AMOUNT_PAIRS
 * needed real non-integer amounts — a confirmed "$X.99 USD to ARS"
 * app-pricing search cluster — and a decimal leading segment creates
 * no new ambiguity against parsePairSlug/parseBaseOnlySlug, whose
 * first segment is always a currency CODE (letters), never a digit.
 */
export function parseAmountPairSlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const match = slug.toLowerCase().match(/^(\d+(?:\.\d+)?)-([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const fromCode = match[2].toUpperCase();
  const toCode = match[3].toUpperCase();

  const fromClass = resolveAssetClass(fromCode);
  const toClass = resolveAssetClass(toCode);
  if (!fromClass || !toClass) return null;

  const from = getAssetMeta(fromClass, fromCode);
  const to = getAssetMeta(toClass, toCode);
  if (!from || !to) return null;

  return { amount, fromClass, fromCode, from, toClass, toCode, to };
}

export function buildAmountPairSlug(amount, fromCode, toCode) {
  return `${amount}-${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`;
}

/**
 * Curated base currencies pre-rendered at build time via
 * generateStaticParams for "/converters/<code>" digest pages — the
 * same "pre-render the high-value ones, resolve anything else on
 * demand through ISR" split FEATURED_PAIRS already uses below. Any
 * other valid fiat code (e.g. /converters/jpy) still renders fine at
 * request time; it's just not build-time pre-rendered.
 */
export const FEATURED_BASE_CURRENCIES = [
  "PKR", "USD", "AED", "INR", "GBP", "EUR", "SAR", "QAR",
  "KWD", "BDT", "NPR", "CNY", "CAD", "AUD", "TRY",
];

/**
 * Curated, cross-asset-class pairs, pre-rendered at build time
 * (generateStaticParams) and used for the "Popular Currency & Metal
 * Pairs" cross-linking component at the bottom of every converter SEO
 * page. Deliberately spans all three classes — this is the whole point
 * of extending the route past fiat-only.
 */
export const FEATURED_PAIRS = [
  // Fiat <-> Fiat (mirrors lib/fxSlugs.js's FEATURED_FX_PAIRS)
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PKR", title: "US Dollar to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "INR", title: "US Dollar to Indian Rupee" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "AED", title: "US Dollar to UAE Dirham" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "EUR", title: "US Dollar to Euro" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "GBP", title: "US Dollar to British Pound" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "SAR", title: "US Dollar to Saudi Riyal" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "PKR", title: "British Pound to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "PKR", title: "Euro to Pakistani Rupee" },
  // Fiat <-> Fiat — Week 3 additions: major global pairs and
  // Gulf-to-South Asia remittance corridors (this platform's existing
  // pairs already skew heavily toward a Pakistan/South Asia + Gulf
  // audience, so these extend that same real-world search demand
  // rather than guessing at an unrelated market).
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "USD", title: "Euro to US Dollar" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "USD", title: "British Pound to US Dollar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "JPY", title: "US Dollar to Japanese Yen" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "CNY", title: "US Dollar to Chinese Yuan" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "CAD", title: "US Dollar to Canadian Dollar" },
  { fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "USD", title: "UAE Dirham to US Dollar" },
  { fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "INR", title: "UAE Dirham to Indian Rupee" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "PKR", title: "Saudi Riyal to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "PKR", title: "Qatari Riyal to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "PKR", title: "Kuwaiti Dinar to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "BDT", title: "US Dollar to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "NPR", title: "US Dollar to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "EGP", title: "US Dollar to Egyptian Pound" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "TRY", title: "US Dollar to Turkish Lira" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ZAR", title: "US Dollar to South African Rand" },
  // Crypto <-> Fiat
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "USD", title: "Bitcoin to US Dollar" },
  { fromClass: "crypto", fromCode: "ETH", toClass: "fiat", toCode: "USD", title: "Ethereum to US Dollar" },
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "PKR", title: "Bitcoin to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "SOL", toClass: "fiat", toCode: "USD", title: "Solana to US Dollar" },
  // Crypto <-> Fiat — Week 3 additions
  { fromClass: "crypto", fromCode: "ETH", toClass: "fiat", toCode: "PKR", title: "Ethereum to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "USDT", toClass: "fiat", toCode: "USD", title: "Tether to US Dollar" },
  { fromClass: "crypto", fromCode: "USDT", toClass: "fiat", toCode: "PKR", title: "Tether to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "USDT", toClass: "fiat", toCode: "INR", title: "Tether to Indian Rupee" },
  { fromClass: "crypto", fromCode: "BNB", toClass: "fiat", toCode: "USD", title: "BNB to US Dollar" },
  { fromClass: "crypto", fromCode: "XRP", toClass: "fiat", toCode: "USD", title: "XRP to US Dollar" },
  { fromClass: "crypto", fromCode: "DOGE", toClass: "fiat", toCode: "USD", title: "Dogecoin to US Dollar" },
  { fromClass: "crypto", fromCode: "ADA", toClass: "fiat", toCode: "USD", title: "Cardano to US Dollar" },
  // Metals <-> Fiat
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "USD", title: "Gold to US Dollar" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "USD", title: "Silver to US Dollar" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "PKR", title: "Gold to Pakistani Rupee" },
  { fromClass: "metals", fromCode: "XPT", toClass: "fiat", toCode: "USD", title: "Platinum to US Dollar" },
  // Metals <-> Fiat — Week 3 additions
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "INR", title: "Gold to Indian Rupee" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "AED", title: "Gold to UAE Dirham" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "PKR", title: "Silver to Pakistani Rupee" },
  { fromClass: "metals", fromCode: "XPT", toClass: "fiat", toCode: "PKR", title: "Platinum to Pakistani Rupee" },
  { fromClass: "metals", fromCode: "XPD", toClass: "fiat", toCode: "USD", title: "Palladium to US Dollar" },
  { fromClass: "metals", fromCode: "XCU", toClass: "fiat", toCode: "USD", title: "Copper to US Dollar" },
  // --- Phase 2 pSEO scale-out: 150-200 pair target -----------------------
  { fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "PKR", title: "UAE Dirham to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "BDT", title: "UAE Dirham to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "NPR", title: "UAE Dirham to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "LKR", title: "UAE Dirham to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "INR", title: "Saudi Riyal to Indian Rupee" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "BDT", title: "Saudi Riyal to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "NPR", title: "Saudi Riyal to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "LKR", title: "Saudi Riyal to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "INR", title: "Qatari Riyal to Indian Rupee" },
  { fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "BDT", title: "Qatari Riyal to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "NPR", title: "Qatari Riyal to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "LKR", title: "Qatari Riyal to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "INR", title: "Kuwaiti Dinar to Indian Rupee" },
  { fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "BDT", title: "Kuwaiti Dinar to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "NPR", title: "Kuwaiti Dinar to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "LKR", title: "Kuwaiti Dinar to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "OMR", toClass: "fiat", toCode: "PKR", title: "Omani Rial to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "OMR", toClass: "fiat", toCode: "INR", title: "Omani Rial to Indian Rupee" },
  { fromClass: "fiat", fromCode: "OMR", toClass: "fiat", toCode: "BDT", title: "Omani Rial to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "OMR", toClass: "fiat", toCode: "NPR", title: "Omani Rial to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "OMR", toClass: "fiat", toCode: "LKR", title: "Omani Rial to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "BHD", toClass: "fiat", toCode: "PKR", title: "Bahraini Dinar to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "BHD", toClass: "fiat", toCode: "INR", title: "Bahraini Dinar to Indian Rupee" },
  { fromClass: "fiat", fromCode: "BHD", toClass: "fiat", toCode: "BDT", title: "Bahraini Dinar to Bangladeshi Taka" },
  { fromClass: "fiat", fromCode: "BHD", toClass: "fiat", toCode: "NPR", title: "Bahraini Dinar to Nepalese Rupee" },
  { fromClass: "fiat", fromCode: "BHD", toClass: "fiat", toCode: "LKR", title: "Bahraini Dinar to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "AUD", title: "US Dollar to Australian Dollar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "CHF", title: "US Dollar to Swiss Franc" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "SGD", title: "US Dollar to Singapore Dollar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "HKD", title: "US Dollar to Hong Kong Dollar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "NGN", title: "US Dollar to Nigerian Naira" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "KES", title: "US Dollar to Kenyan Shilling" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "MYR", title: "US Dollar to Malaysian Ringgit" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PHP", title: "US Dollar to Philippine Peso" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "IDR", title: "US Dollar to Indonesian Rupiah" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "THB", title: "US Dollar to Thai Baht" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "MXN", title: "US Dollar to Mexican Peso" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "BRL", title: "US Dollar to Brazilian Real" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "LKR", title: "US Dollar to Sri Lankan Rupee" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "GHS", title: "US Dollar to Ghanaian Cedi" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "TZS", title: "US Dollar to Tanzanian Shilling" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "UGX", title: "US Dollar to Ugandan Shilling" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "VND", title: "US Dollar to Vietnamese Dong" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "KRW", title: "US Dollar to South Korean Won" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "TWD", title: "US Dollar to Taiwan Dollar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "SEK", title: "US Dollar to Swedish Krona" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "NOK", title: "US Dollar to Norwegian Krone" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "DKK", title: "US Dollar to Danish Krone" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PLN", title: "US Dollar to Polish Zloty" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "CZK", title: "US Dollar to Czech Koruna" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "HUF", title: "US Dollar to Hungarian Forint" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "RON", title: "US Dollar to Romanian Leu" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ILS", title: "US Dollar to Israeli New Shekel" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ARS", title: "US Dollar to Argentine Peso" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "COP", title: "US Dollar to Colombian Peso" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PEN", title: "US Dollar to Peruvian Sol" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "CLP", title: "US Dollar to Chilean Peso" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "JOD", title: "US Dollar to Jordanian Dinar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "QAR", title: "US Dollar to Qatari Riyal" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "KWD", title: "US Dollar to Kuwaiti Dinar" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "OMR", title: "US Dollar to Omani Rial" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "BHD", title: "US Dollar to Bahraini Dinar" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "GBP", title: "Euro to British Pound" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "JPY", title: "Euro to Japanese Yen" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "JPY", title: "British Pound to Japanese Yen" },
  { fromClass: "fiat", fromCode: "AUD", toClass: "fiat", toCode: "USD", title: "Australian Dollar to US Dollar" },
  { fromClass: "fiat", fromCode: "CAD", toClass: "fiat", toCode: "USD", title: "Canadian Dollar to US Dollar" },
  { fromClass: "fiat", fromCode: "CHF", toClass: "fiat", toCode: "USD", title: "Swiss Franc to US Dollar" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "AED", title: "Euro to UAE Dirham" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "SAR", title: "Euro to Saudi Riyal" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "AED", title: "British Pound to UAE Dirham" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "SAR", title: "British Pound to Saudi Riyal" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "TRY", title: "Euro to Turkish Lira" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "TRY", title: "British Pound to Turkish Lira" },
  { fromClass: "crypto", fromCode: "USDC", toClass: "fiat", toCode: "USD", title: "USD Coin to US Dollar" },
  { fromClass: "crypto", fromCode: "TON", toClass: "fiat", toCode: "USD", title: "Toncoin to US Dollar" },
  { fromClass: "crypto", fromCode: "TRX", toClass: "fiat", toCode: "USD", title: "TRON to US Dollar" },
  { fromClass: "crypto", fromCode: "AVAX", toClass: "fiat", toCode: "USD", title: "Avalanche to US Dollar" },
  { fromClass: "crypto", fromCode: "DOT", toClass: "fiat", toCode: "USD", title: "Polkadot to US Dollar" },
  { fromClass: "crypto", fromCode: "MATIC", toClass: "fiat", toCode: "USD", title: "Polygon to US Dollar" },
  { fromClass: "crypto", fromCode: "LINK", toClass: "fiat", toCode: "USD", title: "Chainlink to US Dollar" },
  { fromClass: "crypto", fromCode: "LTC", toClass: "fiat", toCode: "USD", title: "Litecoin to US Dollar" },
  { fromClass: "crypto", fromCode: "BCH", toClass: "fiat", toCode: "USD", title: "Bitcoin Cash to US Dollar" },
  { fromClass: "crypto", fromCode: "NEAR", toClass: "fiat", toCode: "USD", title: "NEAR Protocol to US Dollar" },
  { fromClass: "crypto", fromCode: "ATOM", toClass: "fiat", toCode: "USD", title: "Cosmos to US Dollar" },
  { fromClass: "crypto", fromCode: "XLM", toClass: "fiat", toCode: "USD", title: "Stellar to US Dollar" },
  { fromClass: "crypto", fromCode: "APT", toClass: "fiat", toCode: "USD", title: "Aptos to US Dollar" },
  { fromClass: "crypto", fromCode: "SUI", toClass: "fiat", toCode: "USD", title: "Sui to US Dollar" },
  { fromClass: "crypto", fromCode: "FIL", toClass: "fiat", toCode: "USD", title: "Filecoin to US Dollar" },
  { fromClass: "crypto", fromCode: "ICP", toClass: "fiat", toCode: "USD", title: "Internet Computer to US Dollar" },
  { fromClass: "crypto", fromCode: "ETC", toClass: "fiat", toCode: "USD", title: "Ethereum Classic to US Dollar" },
  { fromClass: "crypto", fromCode: "SOL", toClass: "fiat", toCode: "PKR", title: "Solana to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "BNB", toClass: "fiat", toCode: "PKR", title: "BNB to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "XRP", toClass: "fiat", toCode: "PKR", title: "XRP to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "DOGE", toClass: "fiat", toCode: "PKR", title: "Dogecoin to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "ADA", toClass: "fiat", toCode: "PKR", title: "Cardano to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "LTC", toClass: "fiat", toCode: "PKR", title: "Litecoin to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "INR", title: "Bitcoin to Indian Rupee" },
  { fromClass: "crypto", fromCode: "ETH", toClass: "fiat", toCode: "INR", title: "Ethereum to Indian Rupee" },
  { fromClass: "crypto", fromCode: "SOL", toClass: "fiat", toCode: "INR", title: "Solana to Indian Rupee" },
  { fromClass: "crypto", fromCode: "XRP", toClass: "fiat", toCode: "INR", title: "XRP to Indian Rupee" },
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "EUR", title: "Bitcoin to Euro" },
  { fromClass: "crypto", fromCode: "ETH", toClass: "fiat", toCode: "EUR", title: "Ethereum to Euro" },
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "GBP", title: "Bitcoin to British Pound" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "SAR", title: "Gold to Saudi Riyal" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "GBP", title: "Gold to British Pound" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "EUR", title: "Gold to Euro" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "QAR", title: "Gold to Qatari Riyal" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "KWD", title: "Gold to Kuwaiti Dinar" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "BDT", title: "Gold to Bangladeshi Taka" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "NPR", title: "Gold to Nepalese Rupee" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "TRY", title: "Gold to Turkish Lira" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "CNY", title: "Gold to Chinese Yuan" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "INR", title: "Silver to Indian Rupee" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "AED", title: "Silver to UAE Dirham" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "SAR", title: "Silver to Saudi Riyal" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "GBP", title: "Silver to British Pound" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "EUR", title: "Silver to Euro" },
  { fromClass: "metals", fromCode: "XPT", toClass: "fiat", toCode: "INR", title: "Platinum to Indian Rupee" },
  { fromClass: "metals", fromCode: "XPT", toClass: "fiat", toCode: "AED", title: "Platinum to UAE Dirham" },
  { fromClass: "metals", fromCode: "XPD", toClass: "fiat", toCode: "PKR", title: "Palladium to Pakistani Rupee" },
  { fromClass: "metals", fromCode: "XPD", toClass: "fiat", toCode: "INR", title: "Palladium to Indian Rupee" },
  { fromClass: "metals", fromCode: "XCU", toClass: "fiat", toCode: "PKR", title: "Copper to Pakistani Rupee" },
  { fromClass: "metals", fromCode: "XCU", toClass: "fiat", toCode: "INR", title: "Copper to Indian Rupee" },
  // --- Phase 5 — GSC-driven expansion (Oct 2026) -------------------------
  // The CNY -> <frontier currency> cluster below was already resolving
  // and ranking on demand (parsePairSlug accepts any valid code pair at
  // request time — see that function's header comment) WITHOUT being in
  // this curated list, which meant none of these pages were in
  // generateStaticParams(), app/sitemap.js, or PopularPairs' internal-
  // link rotation. The Oct 2026 GSC export showed real, meaningful
  // demand for exactly these pairs already landing near page 1 purely
  // from Google's own discovery (e.g. /converters/cny-to-tjs: 61
  // impressions at position 8.8; /converters/cny-to-kzt: 27 impressions
  // at position 10.9) — featuring them gives each one a static
  // pre-render, a sitemap entry, and an internal-link path, which is the
  // most direct lever available for nudging a page hovering just outside
  // the top 10 onto page 1. QAR<->GBP is a second, smaller confirmed gap
  // from the same export ("qatari riyal to british pound" / "qatari
  // riyal to sterling" queries, currently unfeatured in either direction).
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "TJS", title: "Chinese Yuan to Tajikistani Somoni" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT", title: "Chinese Yuan to Kazakhstani Tenge" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "GEL", title: "Chinese Yuan to Georgian Lari" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "VND", title: "Chinese Yuan to Vietnamese Dong" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "AMD", title: "Chinese Yuan to Armenian Dram" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "MGA", title: "Chinese Yuan to Malagasy Ariary" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "SGD", title: "Chinese Yuan to Singapore Dollar" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "GBP", title: "Chinese Yuan to British Pound" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "AUD", title: "Chinese Yuan to Australian Dollar" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "INR", title: "Chinese Yuan to Indian Rupee" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "MYR", title: "Chinese Yuan to Malaysian Ringgit" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "PHP", title: "Chinese Yuan to Philippine Peso" },
  { fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "GBP", title: "Qatari Riyal to British Pound" },
  { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "QAR", title: "British Pound to Qatari Riyal" },
  // --- Phase 6 — GSC-driven expansion (Oct 23 2026) ----------------------
  // The Oct 23 export (1 day after Phase 5 shipped) shows cny-to-tjs
  // jumping from 61 to 326 impressions at a steady ~pos 8.7 — direct
  // confirmation that featuring a demand cluster (not just letting it
  // resolve on demand) measurably compounds. The SAME export shows the
  // CNY cluster is far bigger than Phase 5 covered (CNY -> IRR/PLN/GNF/
  // AOA/GHS/AFN/IDR/IQD/QAR/PKR/NIO all landing striking-distance,
  // 9-17, completely unfeatured) and a second, new EUR -> frontier-
  // currency cluster of similar shape (EUR -> UZS at position 11.2 with
  // 98 impressions alone), plus early signal on TRY -> frontier
  // currencies. Featuring all of it now, on the same evidence-only
  // basis as Phase 5.
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "IRR", title: "Chinese Yuan to Iranian Rial" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "PLN", title: "Chinese Yuan to Polish Zloty" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "GNF", title: "Chinese Yuan to Guinean Franc" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "AOA", title: "Chinese Yuan to Angolan Kwanza" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "GHS", title: "Chinese Yuan to Ghanaian Cedi" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "AFN", title: "Chinese Yuan to Afghan Afghani" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "IDR", title: "Chinese Yuan to Indonesian Rupiah" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "IQD", title: "Chinese Yuan to Iraqi Dinar" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "QAR", title: "Chinese Yuan to Qatari Riyal" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "PKR", title: "Chinese Yuan to Pakistani Rupee" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "NIO", title: "Chinese Yuan to Nicaraguan Córdoba" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "UZS", title: "Euro to Uzbekistani Som" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "IRR", title: "Euro to Iranian Rial" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "AOA", title: "Euro to Angolan Kwanza" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "AZN", title: "Euro to Azerbaijani Manat" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "MGA", title: "Euro to Malagasy Ariary" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "MZN", title: "Euro to Mozambican Metical" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "DZD", title: "Euro to Algerian Dinar" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "MKD", title: "Euro to Macedonian Denar" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "UAH", title: "Euro to Ukrainian Hryvnia" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "CVE", title: "Euro to Cape Verdean Escudo" },
  { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "THB", title: "Euro to Thai Baht" },
  { fromClass: "fiat", fromCode: "TRY", toClass: "fiat", toCode: "AFN", title: "Turkish Lira to Afghan Afghani" },
  { fromClass: "fiat", fromCode: "TRY", toClass: "fiat", toCode: "VND", title: "Turkish Lira to Vietnamese Dong" },
  { fromClass: "fiat", fromCode: "TRY", toClass: "fiat", toCode: "IRR", title: "Turkish Lira to Iranian Rial" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "MAD", title: "Saudi Riyal to Moroccan Dirham" },
  { fromClass: "fiat", fromCode: "NPR", toClass: "fiat", toCode: "VND", title: "Nepalese Rupee to Vietnamese Dong" },
  // PHASE 7 (Oct 24 2026 GSC review): these 20 pairs were already
  // ranking striking-distance (position 5-20) at real, nonzero
  // impression volume in that export WITHOUT being in this list —
  // Google found and indexed them anyway (most likely discovered via
  // each base currency's digest page at /converters/<code>, which
  // links every pair from that base). Featuring them gets them the
  // same thing Phase 5/6 proved compounds results for cny-to-tjs:
  // build-time pre-rendering (generateStaticParams, faster TTFB),
  // PopularPairs cross-linking, and sitemap inclusion — none of which
  // an on-demand, unfeatured page gets today. Same evidence-only basis
  // as every prior phase; no speculative additions.
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "MZN", title: "US Dollar to Mozambican Metical" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "AED", title: "Chinese Yuan to UAE Dirham" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "MXN", title: "Chinese Yuan to Mexican Peso" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "MAD", title: "Chinese Yuan to Moroccan Dirham" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "ETB", title: "Chinese Yuan to Ethiopian Birr" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "ZMW", title: "Chinese Yuan to Zambian Kwacha" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "RON", title: "Chinese Yuan to Romanian Leu" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "MGA", title: "US Dollar to Malagasy Ariary" },
  { fromClass: "fiat", fromCode: "INR", toClass: "fiat", toCode: "AMD", title: "Indian Rupee to Armenian Dram" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "AZN", title: "Chinese Yuan to Azerbaijani Manat" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "AZN", title: "Saudi Riyal to Azerbaijani Manat" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KGS", title: "Chinese Yuan to Kyrgystani Som" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "ILS", title: "Chinese Yuan to Israeli New Shekel" },
  { fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "HUF", title: "Chinese Yuan to Hungarian Forint" },
  { fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "SEK", title: "Saudi Riyal to Swedish Krona" },
  { fromClass: "fiat", fromCode: "NPR", toClass: "fiat", toCode: "IDR", title: "Nepalese Rupee to Indonesian Rupiah" },
  { fromClass: "fiat", fromCode: "INR", toClass: "fiat", toCode: "TWD", title: "Indian Rupee to Taiwan Dollar" },
  { fromClass: "fiat", fromCode: "NPR", toClass: "fiat", toCode: "BTN", title: "Nepalese Rupee to Bhutanese Ngultrum" },
  { fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "WST", title: "US Dollar to Samoan Tala" },
  { fromClass: "fiat", fromCode: "TRY", toClass: "fiat", toCode: "CZK", title: "Turkish Lira to Czech Koruna" },
].map((pair) => ({ ...pair, slug: buildPairSlug(pair.fromCode, pair.toCode) }));

/**
 * PHASE 3 ADDITION — curated amount+pair combinations, pre-rendered at
 * build time (generateStaticParams), targeting real high-volume search
 * queries like "2000 AED to PKR" and "100 USD to PKR" that a bare pair
 * page can't itself rank for. Each entry's `amount` is chosen to match
 * how that corridor is actually searched/sent in practice (e.g. Gulf
 * remittance corridors skew toward round hundreds/thousands; the
 * EUR/GBP <-> USD pairs skew toward smaller reference amounts) rather
 * than a single flat amount list applied everywhere — a thin, unlikely
 * query (e.g. "5000 EUR to USD") isn't worth a dedicated page when
 * nobody searches it, so this is a curated list, not a cross product
 * of every amount × every FEATURED_PAIRS entry.
 *
 * Any other valid "<amount>-<from>-to-<to>" slug still resolves fine at
 * request time via parseAmountPairSlug — it's just not build-time
 * pre-rendered, same "curate the high-value ones, resolve the rest on
 * demand" split as FEATURED_PAIRS/FEATURED_BASE_CURRENCIES above.
 */
export const FEATURED_AMOUNT_PAIRS = [
  // USD -> PKR — this site's single highest-volume corridor
  { amount: 100, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PKR" },
  { amount: 500, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PKR" },
  { amount: 2000, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PKR" },
  { amount: 5000, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "PKR" },
  // AED -> PKR — Gulf remittance corridor
  { amount: 100, fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "PKR" },
  { amount: 500, fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "PKR" },
  { amount: 2000, fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "PKR" },
  { amount: 5000, fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "PKR" },
  // SAR -> PKR — Gulf remittance corridor
  { amount: 100, fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "PKR" },
  { amount: 500, fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "PKR" },
  { amount: 5000, fromClass: "fiat", fromCode: "SAR", toClass: "fiat", toCode: "PKR" },
  // QAR / KWD -> PKR — smaller but real Gulf corridors
  { amount: 500, fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "fiat", fromCode: "QAR", toClass: "fiat", toCode: "PKR" },
  { amount: 100, fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "PKR" },
  { amount: 500, fromClass: "fiat", fromCode: "KWD", toClass: "fiat", toCode: "PKR" },
  // GBP / EUR -> PKR
  { amount: 100, fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "PKR" },
  { amount: 100, fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "PKR" },
  // USD -> INR — South Asia's other major corridor
  { amount: 100, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "INR" },
  { amount: 1000, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "INR" },
  { amount: 100, fromClass: "fiat", fromCode: "AED", toClass: "fiat", toCode: "INR" },
  // Major-to-major reference amounts — smaller round numbers, matching
  // how these pairs are actually searched (travel/shopping reference,
  // not remittance-sized sums)
  { amount: 100, fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "USD" },
  { amount: 1000, fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "USD" },
  { amount: 100, fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "USD" },
  { amount: 1000, fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "USD" },
  // Crypto reference amounts — round, commonly-searched sizes
  { amount: 100, fromClass: "crypto", fromCode: "USDT", toClass: "fiat", toCode: "PKR" },
  { amount: 1000, fromClass: "crypto", fromCode: "USDT", toClass: "fiat", toCode: "PKR" },
  // CNY -> frontier-currency corridor (Phase 5 — Oct 2026 GSC export):
  // the Queries.csv export showed a long tail of specific small-amount
  // "<N> cny to tjs/kzt/gel/vnd" searches (e.g. "30 cny to kzt", "156
  // cny to tjs") that don't share one common amount — rather than chase
  // every odd figure (which still resolves fine on demand via
  // parseAmountPairSlug, just not pre-rendered/sitemapped), this adds
  // the standard round reference amounts this project already uses
  // everywhere else, for the handful of corridors with real confirmed
  // volume (see the matching FEATURED_PAIRS comment above).
  { amount: 100, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "TJS" },
  { amount: 500, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "TJS" },
  { amount: 100, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
  { amount: 500, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
  { amount: 100, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "GEL" },
  { amount: 100, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "VND" },
  { amount: 1000, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "VND" },
  // USD -> ARS app/subscription-pricing cluster (Phase 6 — Oct 23 2026
  // GSC export): a recurring, confirmed pattern of "$X.99 USD to ARS"
  // searches (someone pricing a $X.99 app/subscription and checking the
  // Argentine peso equivalent) — unlike the CNY corridor above, round
  // numbers don't fit this intent at all, so these are the exact figures
  // the export actually showed with real volume, not round substitutes.
  { amount: 1.99, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ARS" },
  { amount: 6.99, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ARS" },
  { amount: 13.99, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ARS" },
  { amount: 19.9, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ARS" },
  { amount: 27.99, fromClass: "fiat", fromCode: "USD", toClass: "fiat", toCode: "ARS" },
  // GBP -> SAR (Phase 6): "1 gbp to sar" alone is 22 impressions at
  // position 10.9 — real volume despite the small amount, because the
  // bare pair page's own "1 X = rate Y" line isn't what's ranking for
  // this exact phrasing; a dedicated amount page with its own FAQ/
  // schema is.
  { amount: 1, fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "SAR" },
  { amount: 1700, fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "SAR" },
  // CNY -> KZT specific-amount cluster (Phase 8 — Oct 27 2026 GSC
  // export): the 100/500 round amounts above already cover this pair,
  // but the export shows a separate, repeated cluster of real, ODD
  // amounts all landing at striking distance (position ~10-12) —
  // "200 cny to kzt" (28 impr), "300 cny to kzt" (34 impr), "1300 cny
  // to kzt" (11 impr), "55000 cny to kzt" (17 impr) — same
  // exact-figures-over-round-substitutes call as the USD -> ARS
  // cluster above, since these are what people are actually typing.
  // A handful of even-smaller variants in the same export (10/27/34
  // cny to kzt, ~10 impressions each) are left to resolve on demand
  // via parseAmountPairSlug rather than featured here — below this
  // phase's own impr >= 10 at striking-distance bar isn't met by a
  // wide enough margin yet to justify a dedicated static page.
  { amount: 200, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
  { amount: 300, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
  { amount: 1300, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
  { amount: 55000, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
  // CNY -> KZT, round-million (Phase 9 — Oct 28 2026 GSC export): the
  // Phase 8 amounts above are all still showing impressions a day
  // later (confirming the pattern holds), and this export adds
  // "1000000 cny to kzt" at 12 impressions, position 9.25 — a round,
  // trade-scale figure (unlike the sub-15-impression odd amounts in
  // the same export — 10/27/34/39/119/198 — which stay unfeatured,
  // resolved on demand via parseAmountPairSlug, rather than stacking
  // yet another near-duplicate page onto this one pair for figures
  // that thin).
  { amount: 1000000, fromClass: "fiat", fromCode: "CNY", toClass: "fiat", toCode: "KZT" },
].map((entry) => ({
  ...entry,
  slug: buildAmountPairSlug(entry.amount, entry.fromCode, entry.toCode),
}));

/**
 * INTERNAL-LINKING GAP FIX (Oct 2026 GSC review): the bare pair page
 * and its own amount-specific pages (e.g. /converters/aed-to-pkr and
 * /converters/100-aed-to-pkr, /converters/2000-aed-to-pkr, ...) never
 * linked to each other — PopularPairs only surfaces OTHER pairs, not
 * amount variants of the CURRENT one, so link equity never flowed
 * between a pair and its own amount pages. Returns every
 * FEATURED_AMOUNT_PAIRS entry for one specific (fromCode, toCode) pair,
 * for a small "Common Amounts" cross-link row rendered on both the
 * bare pair page and each of its amount pages.
 */
export function getFeaturedAmountPairsFor(fromCode, toCode) {
  return FEATURED_AMOUNT_PAIRS.filter(
    (entry) => entry.fromCode === fromCode && entry.toCode === toCode
  );
}

/**
 * PHASE 4 ADDITION — "zakat-on-<N>-tola-gold" pSEO pages
 * (app/converters/[pair]/page.jsx's ZakatGoldSeoPage branch), e.g.
 * "zakat-on-10-tola-gold" for the literal search query
 * "Zakat on 10 Tola Gold". Lives in this same file (and this same
 * dynamic [pair] route) rather than a separate module/route purely
 * because that's where the person asked for it — it's a different
 * search intent from every other slug shape this file parses (zakat
 * obligation, not a currency conversion), so it gets its own parser
 * rather than being shoehorned into parseAmountPairSlug/parsePairSlug.
 *
 * `tolaAmount` may be fractional (e.g. "7.5" for the commonly-cited
 * gold nisab threshold of 7.5 tola) — captured as a string by the
 * regex and parsed with Number(), same numeric-safety pattern as
 * parseAmountPairSlug above.
 */
export function parseZakatGoldSlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const match = slug.toLowerCase().match(/^zakat-on-(\d+(?:\.\d+)?)-tola-gold$/);
  if (!match) return null;

  const tolaAmount = Number(match[1]);
  if (!Number.isFinite(tolaAmount) || tolaAmount <= 0) return null;

  return { tolaAmount };
}

export function buildZakatGoldSlug(tolaAmount) {
  return `zakat-on-${tolaAmount}-tola-gold`;
}

/**
 * Curated tola amounts pre-rendered at build time for the Zakat Gold
 * pSEO pages — 7.5 tola is the commonly-cited gold nisab threshold
 * itself (87.48g ÷ 11.6638g/tola), included because "zakat on 7.5
 * tola gold" is a real, threshold-specific query; the rest are round
 * holdings sizes someone might actually type.
 */
export const FEATURED_ZAKAT_GOLD_AMOUNTS = [1, 5, 7.5, 10, 15, 20, 25, 50].map((tolaAmount) => ({
  tolaAmount,
  slug: buildZakatGoldSlug(tolaAmount),
}));
