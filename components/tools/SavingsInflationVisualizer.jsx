"use client";

// components/tools/SavingsInflationVisualizer.jsx
//
// Standalone Savings & Inflation Visualizer — Product & UX Audit item
// #4: promotes the "Inflation & Wealth Growth" mode that was previously
// buried as Mode 5 of the Trading Calculator Suite (app/calculators/
// page.jsx's WealthPanel) into its own plain-language page aimed at a
// household visitor, not a trader. Reuses the EXACT SAME, already-
// tested pure math — lib/personalCalculators.js's calculateInflation()
// and calculateCompoundGrowth() — rather than re-deriving it, so this
// page's numbers can never drift from the Calculator Suite's. No live
// data needed for either calculation (both are pure formulas), so this
// component makes zero network calls.
//
// Visual: a simple inline bar comparison (no new charting dependency)
// — "if you leave it in cash" vs. "if you save/invest it" — framed as
// a plain-English takeaway sentence rather than a raw numbers table,
// per the audit's "plain-language, household-first" brief.

import { useMemo, useState } from "react";
import { calculateInflation, calculateCompoundGrowth } from "@/lib/personalCalculators";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

function Bar({ label, value, maxValue, tone }) {
  const pct = maxValue > 0 ? Math.max(2, Math.min(100, (value / maxValue) * 100)) : 0;
  const toneClass = { loss: "bg-rose-500", gain: "bg-emerald-500", neutral: "bg-brand-500" }[tone];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{formatNumber(value)}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SavingsInflationVisualizer() {
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(7);
  const [monthlyTopUp, setMonthlyTopUp] = useState(100);
  const [investReturnRate, setInvestReturnRate] = useState(10);

  const inflationResult = useMemo(
    () =>
      calculateInflation({
        pastAmount: amount,
        startYear: new Date().getFullYear(),
        annualRatePercent: inflationRate,
        endYear: new Date().getFullYear() + Number(years || 0),
      }),
    [amount, inflationRate, years]
  );

  const growthResult = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount: amount,
        monthlyContribution: monthlyTopUp,
        annualReturnPercent: investReturnRate,
        years,
      }),
    [amount, monthlyTopUp, investReturnRate, years]
  );

  // Analytics: one debounced `calculate_savings_inflation` GA4 event
  // per settled result (see hooks/useTrackCalculation.js).
  useTrackCalculation(
    "calculate_savings_inflation",
    inflationResult && growthResult ? `${amount}:${years}:${inflationRate}:${investReturnRate}:${monthlyTopUp}` : null,
    {
      tool_name: "savings_inflation_calculator",
      years,
      inflation_rate: inflationRate,
      return_rate: investReturnRate,
    }
  );

  const maxBarValue = Math.max(
    Number(amount) || 0,
    inflationResult?.equivalentToday || 0,
    growthResult?.finalBalance || 0
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Your Numbers</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            How much are you starting with, and over how many years?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Amount Today</span>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Inflation Rate (%/yr)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Monthly Top-Up</span>
            <input
              type="number"
              min="0"
              step="any"
              value={monthlyTopUp}
              onChange={(e) => setMonthlyTopUp(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              If Invested, Return (%/yr)
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={investReturnRate}
              onChange={(e) => setInvestReturnRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">
            What happens to your money over {years || 0} years
          </h2>
        </div>
        <div className="space-y-4 p-4">
          <Bar label="Kept as cash today" value={Number(amount) || 0} maxValue={maxBarValue} tone="neutral" />
          {inflationResult && (
            <Bar
              label="Kept as cash — what it's really worth in today's buying power"
              value={inflationResult.realValueToday}
              maxValue={maxBarValue}
              tone="loss"
            />
          )}
          {growthResult && (
            <Bar
              label={`Saved & topped up monthly, growing at ${investReturnRate}%/yr`}
              value={growthResult.finalBalance}
              maxValue={maxBarValue}
              tone="gain"
            />
          )}
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          {inflationResult && growthResult ? (
            <p className="text-sm leading-relaxed text-slate-700">
              If you leave {formatNumber(amount)} sitting as cash for {years} years at{" "}
              {inflationRate}% inflation, it will only buy what{" "}
              <span className="font-bold text-rose-600">{formatNumber(inflationResult.realValueToday)}</span>{" "}
              buys today — a loss of{" "}
              <span className="font-bold text-rose-600">
                {formatNumber(inflationResult.erosionPercent, 1)}%
              </span>{" "}
              of its purchasing power. If instead you save it and top up{" "}
              {formatNumber(monthlyTopUp)} every month at {investReturnRate}% a year, it grows to{" "}
              <span className="font-bold text-emerald-700">{formatNumber(growthResult.finalBalance)}</span>{" "}
              — of which{" "}
              <span className="font-bold text-emerald-700">{formatNumber(growthResult.totalGrowth)}</span> is
              growth, not your own contributions.
            </p>
          ) : (
            <p className="text-sm text-slate-400">Enter valid, positive numbers above.</p>
          )}
          <p className="mt-2 text-[11px] text-slate-400">
            Both are long-horizon projections at a constant assumed rate — real inflation and real
            investment returns vary year to year. For informational purposes only, not financial
            advice.
          </p>
        </div>
      </div>
    </div>
  );
}
