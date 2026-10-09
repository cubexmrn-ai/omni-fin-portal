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
  // Crypto <-> Fiat
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "USD", title: "Bitcoin to US Dollar" },
  { fromClass: "crypto", fromCode: "ETH", toClass: "fiat", toCode: "USD", title: "Ethereum to US Dollar" },
  { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "PKR", title: "Bitcoin to Pakistani Rupee" },
  { fromClass: "crypto", fromCode: "SOL", toClass: "fiat", toCode: "USD", title: "Solana to US Dollar" },
  // Metals <-> Fiat
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "USD", title: "Gold to US Dollar" },
  { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "USD", title: "Silver to US Dollar" },
  { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "PKR", title: "Gold to Pakistani Rupee" },
  { fromClass: "metals", fromCode: "XPT", toClass: "fiat", toCode: "USD", title: "Platinum to US Dollar" },
].map((pair) => ({ ...pair, slug: buildPairSlug(pair.fromCode, pair.toCode) }));
