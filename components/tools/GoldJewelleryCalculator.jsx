"use client";

// components/tools/GoldJewelleryCalculator.jsx
//
// Gold & Jewellery Making-Charges Calculator — Household/Novice
// persona, Product & UX Audit item #1. Extends the existing Metals &
// Commodities Calculator's gold-pricing math (lib/conversionMath.js's
// calculateGoldPrice(), via lib/jewelleryCalculators.js's
// calculateJewelleryPrice()) with the three things a real jewellery
// buyer in South Asia/the Gulf actually pays beyond spot-equivalent
// value: making charges (labour, % or flat), GST/VAT, and an optional
// old-gold exchange credit. Live XAU/USD + FX from the SAME /api/rates
// endpoint the Metals Calculator already uses — zero new data source.

import { useMemo, useState } from "react";
import { calculateJewelleryPrice } from "@/lib/jewelleryCalculators";
import { WEIGHT_UNIT_LABELS, KARAT_PURITY } from "@/lib/conversionMath";
import { useLiveMarketRates } from "@/hooks/useLiveMarketRates";
import { useBaseCurrency } from "@/lib/baseCurrencyContext";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { CURRENCIES } from "@/lib/currencies";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 2 });
}

const WEIGHT_UNIT_OPTIONS = ["tola", "gram", "troy_ounce", "kilogram"];
const KARAT_OPTIONS = Object.keys(KARAT_PURITY);

function LiveRateBadge({ status }) {
  const copy = {
    loading: { text: "Fetching live gold rate…", dot: "bg-amber-400" },
    live: { text: "Live rate", dot: "bg-emerald-500" },
    fallback: { text: "Fallback rate", dot: "bg-amber-500" },
    error: { text: "Rate unavailable — using fallback", dot: "bg-rose-500" },
  }[status];
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
      <span className={`h-1.5 w-1.5 rounded-full ${copy.dot}`} />
      {copy.text}
    </span>
  );
}

export default function GoldJewelleryCalculator() {
  const { metalRates, fiatRates, status } = useLiveMarketRates();
  const { baseCurrency } = useBaseCurrency();

  const [weightUnit, setWeightUnit] = useState("tola");
  const [karat, setKarat] = useState("22K");
  const [quantity, setQuantity] = useState(1);
  const [currencyCode, setCurrencyCode] = useState(baseCurrency);
  const [currencyTouched, setCurrencyTouched] = useState(false);

  const [makingChargeMode, setMakingChargeMode] = useState("percent");
  const [makingChargeValue, setMakingChargeValue] = useState(10);
  const [taxPercent, setTaxPercent] = useState(0);

  const [includeOldGold, setIncludeOldGold] = useState(false);
  const [oldGoldQuantity, setOldGoldQuantity] = useState(1);
  const [oldGoldKarat, setOldGoldKarat] = useState("22K");
  const [buybackPercent, setBuybackPercent] = useState(95);

  const effectiveCurrency = currencyTouched ? currencyCode : baseCurrency;
  const usdToLocalFx = effectiveCurrency === "USD" ? 1 : fiatRates[effectiveCurrency] || 1;

  const result = useMemo(
    () =>
      calculateJewelleryPrice({
        xauUsdRate: metalRates.XAU,
        usdToLocalFx,
        weightUnit,
        karat,
        quantity,
        makingChargeMode,
        makingChargeValue,
        taxPercent,
        oldGold: includeOldGold
          ? { weightUnit, karat: oldGoldKarat, quantity: oldGoldQuantity, buybackPercent }
          : null,
      }),
    [
      metalRates.XAU,
      usdToLocalFx,
      weightUnit,
      karat,
      quantity,
      makingChargeMode,
      makingChargeValue,
      taxPercent,
      includeOldGold,
      oldGoldKarat,
      oldGoldQuantity,
      buybackPercent,
    ]
  );

  // Analytics: one debounced `calculate_gold_making_charges` GA4
  // event per settled result (see hooks/useTrackCalculation.js).
  useTrackCalculation(
    "calculate_gold_making_charges",
    result ? `${weightUnit}:${karat}:${quantity}:${makingChargeMode}:${makingChargeValue}:${includeOldGold}` : null,
    {
      tool_name: "gold_jewellery_calculator",
      karat,
      weight_unit: weightUnit,
      currency: effectiveCurrency,
      includes_old_gold_exchange: includeOldGold,
    }
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Gold &amp; Jewellery Price Calculator</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Gold value + making charges + tax − old gold exchange credit
          </p>
        </div>
        <LiveRateBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Weight Unit</span>
          <select
            value={weightUnit}
            onChange={(e) => setWeightUnit(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {WEIGHT_UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {WEIGHT_UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Karat / Purity</span>
          <select
            value={karat}
            onChange={(e) => setKarat(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {KARAT_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Quantity ({WEIGHT_UNIT_LABELS[weightUnit]})
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Currency</span>
          <select
            value={effectiveCurrency}
            onChange={(e) => {
              setCurrencyTouched(true);
              setCurrencyCode(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Making Charges</span>
          <div className="flex gap-2">
            <select
              value={makingChargeMode}
              onChange={(e) => setMakingChargeMode(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="percent">% of gold value</option>
              <option value="flat">Flat / unit</option>
            </select>
            <input
              type="number"
              min="0"
              step="any"
              value={makingChargeValue}
              onChange={(e) => setMakingChargeValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">GST / VAT (%)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={includeOldGold}
            onChange={(e) => setIncludeOldGold(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Exchanging old gold?
        </label>

        {includeOldGold && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Old Gold Quantity ({WEIGHT_UNIT_LABELS[weightUnit]})
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={oldGoldQuantity}
                onChange={(e) => setOldGoldQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Old Gold Karat</span>
              <select
                value={oldGoldKarat}
                onChange={(e) => setOldGoldKarat(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {KARAT_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Jeweller Buyback (% of fresh value)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={buybackPercent}
                onChange={(e) => setBuybackPercent(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Gold Value</span>
              <span className="font-semibold text-slate-900">
                {formatNumber(result.goldValue)} {effectiveCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Making Charges</span>
              <span className="font-semibold text-slate-900">
                {formatNumber(result.makingCharges)} {effectiveCurrency}
              </span>
            </div>
            {taxPercent > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">GST / VAT</span>
                <span className="font-semibold text-slate-900">
                  {formatNumber(result.taxAmount)} {effectiveCurrency}
                </span>
              </div>
            )}
            {includeOldGold && result.oldGoldDetails && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Old Gold Credit</span>
                <span className="font-semibold text-emerald-700">
                  − {formatNumber(result.oldGoldCredit)} {effectiveCurrency}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Payable
              </span>
              <span className="text-lg font-extrabold text-brand-700">
                {formatNumber(result.totalPayable)} {effectiveCurrency}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter a valid quantity above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Making-charge %, GST/VAT, and old-gold buyback % all vary by jeweller and region — enter your
          own jeweller&apos;s figures for an accurate quote. For informational purposes only, not
          financial or purchase advice.
        </p>
      </div>
    </div>
  );
}
