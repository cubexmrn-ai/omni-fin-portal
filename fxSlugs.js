// lib/fxSlugs.js
//
// Parses/generates "<from>-to-<to>" slugs for FX currency pairs, e.g.
// "usd-to-pkr", mirroring the pattern used for unit conversions in
// lib/unitSlugs.js. Kept separate because currency codes are a flat,
// fixed set (ISO 4217-ish) rather than the per-category unit maps used
// for length/weight/etc.

import { CURRENCY_CODES } from "@/lib/currencies";

const CODE_SET = new Set(CURRENCY_CODES);

/**
 * Parses a route slug of the form "<from>-to-<to>" into validated
 * currency codes, or null if either side isn't a known currency.
 */
export function parseFxSlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const parts = slug.toLowerCase().split("-to-");
  if (parts.length !== 2) return null;

  const from = parts[0].toUpperCase();
  const to = parts[1].toUpperCase();

  if (!CODE_SET.has(from) || !CODE_SET.has(to)) return null;

  return { from, to };
}

export function buildFxSlug(from, to) {
  return `${from.toLowerCase()}-to-${to.toLowerCase()}`;
}

// Curated high-search-volume currency pairs, pre-rendered at build time
// and linked from the /converters directory.
export const FEATURED_FX_PAIRS = [
  { slug: "usd-to-pkr", from: "USD", to: "PKR", title: "US Dollar to Pakistani Rupee" },
  { slug: "usd-to-inr", from: "USD", to: "INR", title: "US Dollar to Indian Rupee" },
  { slug: "usd-to-aed", from: "USD", to: "AED", title: "US Dollar to UAE Dirham" },
  { slug: "usd-to-eur", from: "USD", to: "EUR", title: "US Dollar to Euro" },
  { slug: "usd-to-gbp", from: "USD", to: "GBP", title: "US Dollar to British Pound" },
  { slug: "usd-to-aud", from: "USD", to: "AUD", title: "US Dollar to Australian Dollar" },
  { slug: "usd-to-sar", from: "USD", to: "SAR", title: "US Dollar to Saudi Riyal" },
  { slug: "usd-to-ngn", from: "USD", to: "NGN", title: "US Dollar to Nigerian Naira" },
  { slug: "aed-to-pkr", from: "AED", to: "PKR", title: "UAE Dirham to Pakistani Rupee" },
  { slug: "gbp-to-pkr", from: "GBP", to: "PKR", title: "British Pound to Pakistani Rupee" },
  { slug: "eur-to-pkr", from: "EUR", to: "PKR", title: "Euro to Pakistani Rupee" },
  { slug: "cad-to-pkr", from: "CAD", to: "PKR", title: "Canadian Dollar to Pakistani Rupee" },
];
