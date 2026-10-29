"use client";

// components/tools/CompoundInterestCalculator.jsx
//
// Phase 1 of the pSEO calculator-corridor roadmap (Oct 30 2026): a
// generic, standalone Compound Interest Calculator — unlike
// SavingsInflationVisualizer.jsx, this has no inflation side at all,
// just a clean "how much will this grow to" tool for the high-volume
// generic "compound interest calculator" search query. Reuses the
// exact same calculateCompoundGrowth() engine from
// lib/personalCalculators.js, and additionally surfaces its
// year-by-year `table` as a real table — that data already exists on
// every call, it's just never been rendered on any other calculator
// page yet.

import { useMemo, useState } from "react";
import { calculateCompoundGrowth } from "@/lib/personalCalculators";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function CompoundInterestCalculator() {
  const [initialAmount, setInitialAmount] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualReturnRate, setAnnualReturnRate] = useState(8);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount,
        monthlyContribution,
        annualReturnPercent: annualReturnRate,
        years,
      }),
    [initialAmount, monthlyContribution, annualReturnRate, years]
  );

  // Analytics: one debounced `calculate_compound_interest` GA4 event
  // per settled result (see hooks/useTrackCalculation.js).
  useTrackCalculation(
    "calculate_compound_interest",
    result ? `${initialAmount}:${monthlyContribution}:${annualReturnRate}:${years}` : null,
    {
      tool_name: "compound_interest_calculator",
      years,
      return_rate: annualReturnRate,
    }
  );

  // A year-by-year table is already computed by calculateCompoundGrowth
  // for every call — showing every row gets unwieldy past ~15 years,
  // so this samples at most ~10 evenly-spaced rows plus the final year.
  const sampledTable = useMemo(() => {
    if (!result?.table?.length) return [];
    const table = result.table;
    if (table.length <= 10) return table;
    const step = Math.ceil(table.length / 9);
    const rows = table.filter((_, idx) => idx % step === 0);
    if (rows[rows.length - 1] !== table[table.length - 1]) rows.push(table[table.length - 1]);
    return rows;
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Your Numbers</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Initial Amount</span>
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
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Annual Interest Rate (%)
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Years</span>
            <input
              type="number"
              min="1"
              step="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Result after {years || 0} years</h2>
        </div>
        {result ? (
          <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Final Balance
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatNumber(result.finalBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Contributed
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-700">
                  {formatNumber(result.totalContributed)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Growth
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {formatNumber(result.totalGrowth)}
                </p>
              </div>
            </div>

            {sampledTable.length > 0 && (
              <div className="overflow-x-auto border-t border-slate-100 px-4 py-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-1.5 pr-4 font-semibold">Year</th>
                      <th className="py-1.5 pr-4 font-semibold">Contributed</th>
                      <th className="py-1.5 pr-4 font-semibold">Growth</th>
                      <th className="py-1.5 font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampledTable.map((row) => (
                      <tr key={row.year} className="border-t border-slate-100 text-slate-700">
                        <td className="py-1.5 pr-4 font-semibold">{row.year}</td>
                        <td className="py-1.5 pr-4">{formatNumber(row.contributed)}</td>
                        <td className="py-1.5 pr-4 text-emerald-700">{formatNumber(row.growth)}</td>
                        <td className="py-1.5 font-bold">{formatNumber(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[11px] text-slate-400">
                Monthly compounding, growth applied after each month&apos;s contribution. A
                constant-rate, long-horizon projection you choose yourself — real interest/return
                rates vary year to year. For informational purposes only, not financial advice.
              </p>
            </div>
          </>
        ) : (
          <p className="p-4 text-sm text-slate-400">Enter valid, positive numbers above.</p>
        )}
      </div>
    </div>
  );
}
