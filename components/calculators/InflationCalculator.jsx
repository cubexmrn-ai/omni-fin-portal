"use client";

// components/calculators/InflationCalculator.jsx
//
// Inflation & Purchasing Power Calculator — a past amount, the year it
// dates from, and a historical average annual inflation rate in;
// purchasing-power erosion and the real value of that amount today
// out. See lib/personalCalculators.js's calculateInflation() for the
// equivalentToday vs. realValueToday distinction.

import { useMemo, useState } from "react";
import { calculateInflation } from "@/lib/personalCalculators";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const CURRENT_YEAR = new Date().getFullYear();

// See lib/formatNumber.js's header comment for why this delegates
// rather than calling toLocaleString directly.
function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function InflationCalculator() {
  const [pastAmount, setPastAmount] = useState(100);
  const [startYear, setStartYear] = useState(CURRENT_YEAR - 20);
  const [annualRate, setAnnualRate] = useState(3);

  const result = useMemo(
    () => calculateInflation({ pastAmount, startYear, annualRatePercent: annualRate }),
    [pastAmount, startYear, annualRate]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Inflation &amp; Purchasing Power Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">Compounds a historical rate forward to {CURRENT_YEAR}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Past Amount</span>
          <input
            type="number"
            min="0"
            step="any"
            value={pastAmount}
            onChange={(e) => setPastAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Year</span>
          <input
            type="number"
            min="1900"
            max={CURRENT_YEAR}
            step="1"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Historical Rate (% / yr)</span>
          <input
            type="number"
            step="any"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Real Value Today
              </p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">${formatNumber(result.realValueToday)}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">of your original ${formatNumber(pastAmount)}</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Erosion</p>
              <p className="mt-0.5 text-base font-extrabold text-rose-600">
                -{formatNumber(result.erosionPercent, 1)}%
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">lost to inflation over {result.years} yrs</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Equivalent Today
              </p>
              <p className="mt-0.5 text-base font-extrabold text-brand-700">${formatNumber(result.equivalentToday)}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">needed now for the same buying power</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter a valid amount, year (not in the future), and rate above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Assumes a constant annual rate compounded yearly — real-world inflation varies year to year.
        </p>
      </div>
    </div>
  );
}
