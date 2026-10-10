"use client";

// components/calculators/PipValueCalculator.jsx
//
// Pip Value Calculator — pair (represented here by its quote currency,
// since pip value only depends on the quote side) and lot size in,
// pip value in USD and PKR out. Fetches live rates the same way
// GoldCalculator.jsx does (fetchRates + FALLBACK_RATES, with a visible
// live/fallback status dot) so the USD/PKR conversion is never just a
// hardcoded guess, but still works offline via lib/currencies.js's
// fallback table.

import { useEffect, useMemo, useState, useCallback } from "react";
import { calculatePipValue } from "@/lib/tradingCalculators";
import { fetchRates } from "@/lib/fetchRates";
import { CURRENCIES, FALLBACK_RATES } from "@/lib/currencies";

// Most pip-value lookups are for a handful of common quote currencies;
// the full CURRENCIES list is still used for the USD/PKR conversion
// rates themselves.
const QUOTE_OPTIONS = ["USD", "EUR", "GBP", "JPY", "AUD", "CHF", "CAD", "NZD"];

const LOT_OPTIONS = [
  { id: "standard", label: "Standard (100,000 units)" },
  { id: "mini", label: "Mini (10,000 units)" },
  { id: "micro", label: "Micro (1,000 units)" },
];

function formatNumber(value, decimals = 4) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 2 });
}

export default function PipValueCalculator() {
  const [quoteCode, setQuoteCode] = useState("USD");
  const [lotType, setLotType] = useState("standard");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [rateStatus, setRateStatus] = useState("loading"); // loading | live | fallback | error

  const loadRates = useCallback(async () => {
    try {
      const data = await fetchRates({ noStore: true });
      if (!data || !data.fiat) throw new Error("Malformed rates payload");
      setRates({ ...FALLBACK_RATES, ...data.fiat });
      setRateStatus(data.warnings?.length ? "fallback" : "live");
    } catch {
      setRates(FALLBACK_RATES);
      setRateStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const result = useMemo(
    () => calculatePipValue({ quoteCode, lotType, rates }),
    [quoteCode, lotType, rates]
  );

  const statusCopy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates", dot: "bg-emerald-500" },
    fallback: { text: "Fallback rates", dot: "bg-amber-500" },
    error: { text: "Rates unavailable — using fallback", dot: "bg-rose-500" },
  }[rateStatus];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Pip Value Calculator</h3>
          <p className="mt-0.5 text-xs text-slate-500">Pip Size × Lot Units, converted to USD/PKR</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${statusCopy.dot}`} />
          {statusCopy.text}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Quote Currency (Pair)</span>
          <select
            value={quoteCode}
            onChange={(e) => setQuoteCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {QUOTE_OPTIONS.map((code) => (
              <option key={code} value={code}>
                XXX/{code}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Lot Size</span>
          <select
            value={lotType}
            onChange={(e) => setLotType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {LOT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <p>
              <span className="text-slate-500">1 pip = </span>
              <span className="font-bold text-slate-900">
                {formatNumber(result.pipValueQuote, 2)} {quoteCode}
              </span>
            </p>
            <p>
              <span className="text-slate-500">≈ </span>
              <span className="font-bold text-brand-700">
                {Number.isFinite(result.pipValueUsd) ? `$${formatNumber(result.pipValueUsd)}` : "—"} USD
              </span>
            </p>
            <p>
              <span className="text-slate-500">≈ </span>
              <span className="font-bold text-brand-700">
                {Number.isFinite(result.pipValuePkr) ? `Rs ${formatNumber(result.pipValuePkr, 2)}` : "—"} PKR
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Select a quote currency and lot size above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Pip is the 2nd decimal (0.01) for JPY-quoted pairs and the 4th decimal (0.0001) for all other pairs.
          For informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
