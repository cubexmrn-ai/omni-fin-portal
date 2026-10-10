"use client";

// components/calculators/CompoundGrowthCalculator.jsx
//
// Compound Interest / Wealth Growth Calculator — monthly contribution,
// expected annual return %, and years in; a year-by-year compounding
// growth table out. See lib/personalCalculators.js's
// calculateCompoundGrowth() for the month-by-month simulation this
// table is built from.

import { useMemo, useState } from "react";
import { calculateCompoundGrowth } from "@/lib/personalCalculators";

function formatNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

export default function CompoundGrowthCalculator() {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(15);

  const result = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount,
        monthlyContribution,
        annualReturnPercent: annualReturn,
        years,
      }),
    [initialAmount, monthlyContribution, annualReturn, years]
  );

  // Years is capped at 40 purely so the rendered table (one row per
  // year) stays a reasonable, scrollable length rather than hundreds
  // of rows — the underlying math has no such limit.
  const cappedYears = Math.min(Number(years) || 0, 40);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Compound Interest / Wealth Growth Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">Monthly compounding, contribution added each month</p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Starting Amount</span>
          <input
            type="number"
            min="0"
            step="any"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Monthly Contribution</span>
          <input
            type="number"
            min="0"
            step="any"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Expected Return (% / yr)</span>
          <input
            type="number"
            step="any"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Years</span>
          <input
            type="number"
            min="1"
            max="40"
            step="1"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      {result ? (
        <>
          <div className="grid grid-cols-1 gap-2 px-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Final Balance</p>
              <p className="mt-0.5 text-base font-extrabold text-brand-700">${formatNumber(result.finalBalance)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Contributed</p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">${formatNumber(result.totalContributed)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Growth</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-600">${formatNumber(result.totalGrowth)}</p>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border-t border-slate-100 px-4 py-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-semibold">Year</th>
                  <th className="pb-2 font-semibold">Contributed</th>
                  <th className="pb-2 font-semibold">Growth</th>
                  <th className="pb-2 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.table.slice(0, cappedYears).map((row) => (
                  <tr key={row.year}>
                    <td className="py-1.5 font-medium text-slate-700">{row.year}</td>
                    <td className="py-1.5 text-slate-500">${formatNumber(row.contributed)}</td>
                    <td className="py-1.5 text-emerald-600">${formatNumber(row.growth)}</td>
                    <td className="py-1.5 font-semibold text-slate-900">${formatNumber(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="px-4 pb-3 text-sm text-slate-400">Enter valid, positive numbers above.</p>
      )}

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[11px] text-slate-400">
          Assumes a constant monthly-compounded return — real markets fluctuate year to year. For
          informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
