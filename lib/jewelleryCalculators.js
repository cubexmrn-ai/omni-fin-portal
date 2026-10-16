// lib/jewelleryCalculators.js
//
// Pure, UI-agnostic math for the Gold & Jewellery Making-Charges
// Calculator (components/tools/GoldJewelleryCalculator.jsx) — the
// Household / Novice persona's #1 gap identified in the Product & UX
// Audit: the existing Metals & Commodities Calculator (lib/
// conversionMath.js's calculateGoldPrice()) prices gold at pure spot-
// equivalent value, but a real South Asian/Gulf jewellery buyer also
// pays making charges (labour), GST/VAT on top, and — when exchanging
// old gold — gets a buyback credit that's rarely 100% of fresh spot
// value. Builds directly on calculateGoldPrice() rather than
// duplicating its karat/weight-unit math, matching the
// jewellery-converter layer's own stacking convention (see
// lib/assetConversion.js).
//
// ZERO-API-HUDDLE: no new data source — this takes the SAME live
// XAU/USD + FX rate the Metals Calculator and /api/rates already fetch
// and transforms it client-side.

import { calculateGoldPrice } from "@/lib/conversionMath";

/**
 * Prices a piece of jewellery: gold value (spot × weight × karat purity)
 * plus making charges plus tax, minus an optional old-gold exchange
 * credit.
 *
 * @param {{
 *   xauUsdRate: number,            // Gold spot, USD per troy ounce (24K)
 *   usdToLocalFx: number,          // USD -> local currency rate
 *   weightUnit?: string,           // key of conversionMath.WEIGHT_UNITS
 *   karat?: string,                // key of conversionMath.KARAT_PURITY
 *   quantity?: number,             // how many `weightUnit`s of new gold
 *   makingChargeMode?: "percent"|"flat",
 *   makingChargeValue?: number,    // % of gold value, or flat currency/unit
 *   taxPercent?: number,           // GST/VAT on (gold value + making charges)
 *   oldGold?: {
 *     weightUnit?: string,
 *     karat?: string,
 *     quantity: number,
 *     buybackPercent?: number,     // jeweller's % of fresh value credited
 *                                  // for old gold (typically 90-98%, to
 *                                  // cover wastage/purity-testing/
 *                                  // re-refining cost — defaults to 95%)
 *   } | null,
 * }} params
 */
export function calculateJewelleryPrice({
  xauUsdRate,
  usdToLocalFx,
  weightUnit = "tola",
  karat = "22K",
  quantity = 1,
  makingChargeMode = "percent",
  makingChargeValue = 10,
  taxPercent = 0,
  oldGold = null,
}) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) return null;

  const goldPriceResult = calculateGoldPrice(xauUsdRate, usdToLocalFx, weightUnit, karat);
  const goldPricePerUnit = Number(goldPriceResult?.rawPrice);
  if (!Number.isFinite(goldPricePerUnit)) return null;

  const goldValue = goldPricePerUnit * qty;

  const mcValue = Number(makingChargeValue);
  const safeMcValue = Number.isFinite(mcValue) && mcValue >= 0 ? mcValue : 0;
  const makingCharges =
    makingChargeMode === "flat" ? safeMcValue * qty : goldValue * (safeMcValue / 100);

  const subtotal = goldValue + makingCharges;

  const taxRate = Number(taxPercent);
  const safeTaxRate = Number.isFinite(taxRate) && taxRate >= 0 ? taxRate : 0;
  const taxAmount = subtotal * (safeTaxRate / 100);

  let oldGoldCredit = 0;
  let oldGoldDetails = null;
  const oldQty = Number(oldGold?.quantity);
  if (oldGold && Number.isFinite(oldQty) && oldQty > 0) {
    const oldGoldPriceResult = calculateGoldPrice(
      xauUsdRate,
      usdToLocalFx,
      oldGold.weightUnit || weightUnit,
      oldGold.karat || karat
    );
    const oldGoldPricePerUnit = Number(oldGoldPriceResult?.rawPrice);
    const buybackRaw = Number(oldGold.buybackPercent);
    const buybackPercent = Number.isFinite(buybackRaw) ? Math.min(100, Math.max(0, buybackRaw)) : 95;

    if (Number.isFinite(oldGoldPricePerUnit)) {
      const oldGoldFreshValue = oldGoldPricePerUnit * oldQty;
      oldGoldCredit = oldGoldFreshValue * (buybackPercent / 100);
      oldGoldDetails = {
        pricePerUnit: oldGoldPricePerUnit,
        quantity: oldQty,
        freshValue: oldGoldFreshValue,
        buybackPercent,
        credit: oldGoldCredit,
      };
    }
  }

  const totalPayable = subtotal + taxAmount - oldGoldCredit;

  return {
    goldPricePerUnit,
    goldValue,
    makingCharges,
    subtotal,
    taxAmount,
    oldGoldCredit,
    oldGoldDetails,
    totalPayable,
  };
}
