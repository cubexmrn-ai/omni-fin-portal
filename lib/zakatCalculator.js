// lib/zakatCalculator.js
//
// Pure, UI-agnostic math for the Zakat Calculator
// (components/tools/ZakatCalculator.jsx) — the Household / Novice
// persona's #3 gap in the Product & UX Audit: highly seasonal
// (Ramadan) but very high search volume across the South Asian/Gulf/
// MENA audience this project already serves with tola-unit gold
// pricing, PKR/INR/AED currency support, and Arabic/Urdu/Roman Urdu
// localization. ZERO-API-HUDDLE: reuses the SAME live XAU/USD and
// XAG/USD spot rates (+ FX) already fetched for the Metals &
// Commodities Calculator — no new data source.
//
// HONESTY NOTE (same bar as every illustrative-figure file in this
// project — see lib/taxFeeCalculators.js and lib/loanCalculators.js):
// nisab thresholds and the exact zakat rate are matters of fiqh
// (Islamic jurisprudence), and different schools/scholars hold
// different views — most notably whether the gold or the silver nisab
// standard applies when a person holds mixed assets (cash + gold +
// silver). This calculator computes BOTH standards and lets the person
// pick which one to use, rather than silently assuming one; the
// commonly-cited nisab weights (87.48g gold / 612.36g silver) and the
// standard 2.5% rate are used, clearly labeled as a general reference,
// not a religious ruling — a person with questions about their own
// obligation should consult a scholar.

import { WEIGHT_UNITS } from "@/lib/conversionMath";

export const ZAKAT_RATE_PERCENT = 2.5;

// Nisab weights in grams — the commonly-cited thresholds (87.48g gold
// ≈ 7.5 tola; 612.36g silver ≈ 52.5 tola).
export const NISAB_GOLD_GRAMS = 87.48;
export const NISAB_SILVER_GRAMS = 612.36;

/**
 * Converts a USD-per-troy-ounce spot price to a local-currency price
 * per gram, given the FX rate. Shared by both metals here so the
 * gold/silver value and nisab-threshold value use identical math.
 */
function usdPerOunceToLocalPerGram(usdPerOunce, usdToLocalFx) {
  const ounce = Number(usdPerOunce);
  const fx = Number(usdToLocalFx);
  if (![ounce, fx].every(Number.isFinite)) return null;
  return (ounce / WEIGHT_UNITS.troy_ounce) * fx;
}

/**
 * Zakat due on gold, silver, cash/savings and other zakatable assets,
 * net of short-term liabilities, checked against whichever nisab
 * standard ("gold" or "silver") the person selects — the silver
 * standard gives a lower threshold (more wealth qualifies), which is
 * the more commonly recommended standard for mixed cash+metal
 * holdings, while the gold standard is sometimes preferred for
 * gold-only holdings; this calculator doesn't pick one for the person.
 *
 * @param {{
 *   xauUsdRate: number,         // Gold spot, USD per troy ounce
 *   xagUsdRate: number,         // Silver spot, USD per troy ounce
 *   usdToLocalFx: number,       // USD -> local currency rate
 *   goldGrams?: number,
 *   silverGrams?: number,
 *   cashAndSavings?: number,    // local currency
 *   otherZakatableAssets?: number, // e.g. business inventory, investments (local currency)
 *   liabilities?: number,       // short-term debts due (local currency)
 *   nisabStandard?: "gold"|"silver",
 * }} params
 */
export function calculateZakat({
  xauUsdRate,
  xagUsdRate,
  usdToLocalFx,
  goldGrams = 0,
  silverGrams = 0,
  cashAndSavings = 0,
  otherZakatableAssets = 0,
  liabilities = 0,
  nisabStandard = "silver",
}) {
  const goldPerGram = usdPerOunceToLocalPerGram(xauUsdRate, usdToLocalFx);
  const silverPerGram = usdPerOunceToLocalPerGram(xagUsdRate, usdToLocalFx);
  if (goldPerGram === null || silverPerGram === null) return null;

  const safeGoldGrams = Math.max(0, Number(goldGrams) || 0);
  const safeSilverGrams = Math.max(0, Number(silverGrams) || 0);
  const safeCash = Math.max(0, Number(cashAndSavings) || 0);
  const safeOther = Math.max(0, Number(otherZakatableAssets) || 0);
  const safeLiabilities = Math.max(0, Number(liabilities) || 0);

  const goldValue = safeGoldGrams * goldPerGram;
  const silverValue = safeSilverGrams * silverPerGram;

  const totalZakatableWealth = Math.max(
    0,
    goldValue + silverValue + safeCash + safeOther - safeLiabilities
  );

  const nisabThresholdValue =
    nisabStandard === "gold" ? NISAB_GOLD_GRAMS * goldPerGram : NISAB_SILVER_GRAMS * silverPerGram;

  const meetsNisab = totalZakatableWealth >= nisabThresholdValue;
  const zakatDue = meetsNisab ? totalZakatableWealth * (ZAKAT_RATE_PERCENT / 100) : 0;

  return {
    goldPerGram,
    silverPerGram,
    goldValue,
    silverValue,
    totalZakatableWealth,
    nisabStandard,
    nisabThresholdValue,
    meetsNisab,
    zakatDue,
    ratePercent: ZAKAT_RATE_PERCENT,
  };
}
