"use client";

// components/tools/TraditionalVsRothCalculator.jsx
//
// Phase 1 of the pSEO calculator-corridor roadmap (Oct 30 2026): a
// 401(k)/Traditional vs. Roth IRA comparison for household visitors.
// All math lives in lib/personalCalculators.js's
// calculateTraditionalVsRothGrowth() — see that function's header
// comment for the same-take-home-pay-cost methodology (the Roth side
// contributes the after-tax-equivalent amount, not the same nominal
// dollar figure, which would understate what the Traditional
// contribution actually costs the saver today). This component is
// presentation only — no growth math duplicated here.

import { useMemo, useState } from "react";
import { calculateTraditionalVsRothGrowth } from "@/lib/personalCalculators";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function TraditionalVsRothCalculator() {
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(25);
  const [annualReturnRate, setAnnualReturnRate] = useState(7);
  const [currentTaxRate, setCurrentTaxRate] = useState(22);
  const [retirementTaxRate, setRetirementTaxRate] = useState(15);

  const result = useMemo(
    () =>
      calculateTraditionalVsRothGrowth({
        monthlyContribution,
        annualReturnPercent: annualReturnRate,
        years,
        currentTaxRate,
        retirementTaxRate,
      }),
    [monthlyContribution, annualReturnRate, years, currentTaxRate, retirementTaxRate]
  );

  // Analytics: one debounced `calculate_traditional_vs_roth` GA4 event
  // per settled result (see hooks/useTrackCalculation.js).
  useTrackCalculation(
    "calculate_traditional_vs_roth",
    result ? `${monthlyContribution}:${years}:${annualReturnRate}:${currentTaxRate}:${retirementTaxRate}` : null,
    {
      tool_name: "traditional_vs_roth_calculator",
      years,
      return_rate: annualReturnRate,
      current_tax_rate: currentTaxRate,
      retirement_tax_rate: retirementTaxRate,
    }
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Your Numbers</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Enter the pre-tax contribution amount — the same paycheck cost today either way.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Monthly Contribution (pre-tax)
            </span>
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
            <span className="mb-1 block text-xs font-semibold text-slate-600">Years Until Withdrawal</span>
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
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Expected Return (%/yr)
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
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Current Tax Rate (%)
            </span>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={currentTaxRate}
              onChange={(e) => setCurrentTaxRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Retirement Tax Rate (%)
            </span>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={retirementTaxRate}
              onChange={(e) => setRetirementTaxRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">After-tax balance at withdrawal</h2>
        </div>
        {result ? (
          <>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Traditional 401(k)/IRA
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatNumber(result.traditional.netAtRetirement)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Grows to {formatNumber(result.traditional.grossFinalBalance)} pre-tax, taxed at{" "}
                  {retirementTaxRate}% on withdrawal
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roth IRA</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {formatNumber(result.roth.netAtRetirement)}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Contributing {formatNumber(result.roth.afterTaxContributionAmount)}/mo after-tax
                  (same paycheck cost), tax-free on withdrawal
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm leading-relaxed text-slate-700">
                {result.betterAccount === "tie" ? (
                  <>
                    At the same tax rate now and at retirement, both accounts come out to the exact
                    same after-tax balance — <span className="font-bold">{formatNumber(result.traditional.netAtRetirement)}</span>.
                  </>
                ) : (
                  <>
                    At these rates, the{" "}
                    <span className="font-bold text-brand-700">
                      {result.betterAccount === "roth" ? "Roth IRA" : "Traditional 401(k)/IRA"}
                    </span>{" "}
                    comes out ahead by{" "}
                    <span className="font-bold text-brand-700">{formatNumber(Math.abs(result.netDifference))}</span>{" "}
                    after tax, for the same cost out of your paycheck today.
                  </>
                )}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                This compares the same take-home-pay cost today, not the same nominal contribution
                — the Roth side contributes the after-tax-equivalent amount. Your actual future tax
                rate is unknowable; both rates here are assumptions you choose. For informational
                purposes only, not tax or financial advice.
              </p>
            </div>
          </>
        ) : (
          <p className="p-4 text-sm text-slate-400">Enter valid numbers above (tax rates between 0 and 100).</p>
        )}
      </div>
    </div>
  );
}
