"use client";

// components/tools/ZakatCalculator.jsx
//
// Zakat Calculator — Household/Novice persona, Product & UX Audit item
// #3. Nisab-based, reusing the SAME live XAU/USD + XAG/USD + FX rates
// the Metals & Commodities Calculator already fetches (see
// lib/zakatCalculator.js's header for the nisab/rate honesty note —
// this is a general reference, not a religious ruling).

import { useMemo, useState } from "react";
import { calculateZakat, NISAB_GOLD_GRAMS, NISAB_SILVER_GRAMS } from "@/lib/zakatCalculator";
import { useLiveMarketRates } from "@/hooks/useLiveMarketRates";
import { useBaseCurrency } from "@/lib/baseCurrencyContext";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { CURRENCIES } from "@/lib/currencies";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

function LiveRateBadge({ status }) {
  const copy = {
    loading: { text: "Fetching live gold & silver rates…", dot: "bg-amber-400" },
    live: { text: "Live rates", dot: "bg-emerald-500" },
    fallback: { text: "Fallback rates", dot: "bg-amber-500" },
    error: { text: "Rates unavailable — using fallback", dot: "bg-rose-500" },
  }[status];
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
      <span className={`h-1.5 w-1.5 rounded-full ${copy.dot}`} />
      {copy.text}
    </span>
  );
}

export default function ZakatCalculator() {
  const { metalRates, fiatRates, status } = useLiveMarketRates();
  const { baseCurrency } = useBaseCurrency();

  const [currencyCode, setCurrencyCode] = useState(baseCurrency);
  const [currencyTouched, setCurrencyTouched] = useState(false);

  const [goldGrams, setGoldGrams] = useState(0);
  const [silverGrams, setSilverGrams] = useState(0);
  const [cashAndSavings, setCashAndSavings] = useState(0);
  const [otherAssets, setOtherAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [nisabStandard, setNisabStandard] = useState("silver");

  const effectiveCurrency = currencyTouched ? currencyCode : baseCurrency;
  const usdToLocalFx = effectiveCurrency === "USD" ? 1 : fiatRates[effectiveCurrency] || 1;

  const result = useMemo(
    () =>
      calculateZakat({
        xauUsdRate: metalRates.XAU,
        xagUsdRate: metalRates.XAG,
        usdToLocalFx,
        goldGrams,
        silverGrams,
        cashAndSavings,
        otherZakatableAssets: otherAssets,
        liabilities,
        nisabStandard,
      }),
    [
      metalRates.XAU,
      metalRates.XAG,
      usdToLocalFx,
      goldGrams,
      silverGrams,
      cashAndSavings,
      otherAssets,
      liabilities,
      nisabStandard,
    ]
  );

  // Analytics: one debounced `calculate_zakhat` GA4 event per settled
  // result (see hooks/useTrackCalculation.js) — not on every keystroke.
  useTrackCalculation(
    "calculate_zakhat",
    result ? `${result.meetsNisab ? "due" : "below"}:${nisabStandard}:${goldGrams}:${silverGrams}:${cashAndSavings}` : null,
    {
      tool_name: "zakat_calculator",
      nisab_standard: nisabStandard,
      currency: effectiveCurrency,
      meets_nisab: result ? result.meetsNisab : null,
    }
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Zakat Calculator</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Gold, silver, cash &amp; savings — checked against the nisab threshold, live.
          </p>
        </div>
        <LiveRateBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Gold Held (grams)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={goldGrams}
            onChange={(e) => setGoldGrams(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Silver Held (grams)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={silverGrams}
            onChange={(e) => setSilverGrams(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Cash &amp; Savings</span>
          <input
            type="number"
            min="0"
            step="any"
            value={cashAndSavings}
            onChange={(e) => setCashAndSavings(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Other Zakatable Assets <span className="text-slate-400">(investments, inventory…)</span>
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={otherAssets}
            onChange={(e) => setOtherAssets(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Short-Term Liabilities <span className="text-slate-400">(debts due)</span>
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={liabilities}
            onChange={(e) => setLiabilities(e.target.value)}
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

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Nisab Standard</span>
          <div className="flex gap-2">
            {[
              { id: "silver", label: `Silver (${NISAB_SILVER_GRAMS}g) — lower threshold` },
              { id: "gold", label: `Gold (${NISAB_GOLD_GRAMS}g) — higher threshold` },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setNisabStandard(opt.id)}
                aria-pressed={nisabStandard === opt.id}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  nisabStandard === opt.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Total Zakatable Wealth</span>
              <span className="font-semibold text-slate-900">
                {formatNumber(result.totalZakatableWealth)} {effectiveCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Nisab Threshold ({nisabStandard})</span>
              <span className="font-semibold text-slate-900">
                {formatNumber(result.nisabThresholdValue)} {effectiveCurrency}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Zakat Due (2.5%)
              </span>
              <span className="text-lg font-extrabold text-brand-700">
                {result.meetsNisab ? `${formatNumber(result.zakatDue)} ${effectiveCurrency}` : "—"}
              </span>
            </div>
            {!result.meetsNisab && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                Your total zakatable wealth is below the {nisabStandard} nisab threshold — no zakat is
                due this year.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Live gold/silver rates are still loading.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          A general reference based on commonly-cited nisab weights and the standard 2.5% rate — not a
          religious ruling. If you have questions about your own zakat obligation, consult a qualified
          scholar.
        </p>
      </div>
    </div>
  );
}
