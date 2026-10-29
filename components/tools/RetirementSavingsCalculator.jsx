"use client";

// components/tools/RetirementSavingsCalculator.jsx
//
// Phase 1 of the pSEO calculator-corridor roadmap (Oct 30 2026 GA4/
// strategy round): a plain-language "will I have enough to retire?"
// calculator for household visitors, following the exact same
// template as components/tools/SavingsInflationVisualizer.jsx —
// reuses the already-tested calculateCompoundGrowth() engine from
// lib/personalCalculators.js rather than any new growth math, so this
// page's numbers can never drift from that calculator's or the
// Calculators Hub's.
//
// Framing: rather than just showing a projected balance, this ties
// the result back to the "4% rule" (a widely-cited, simple retirement
// withdrawal heuristic: a balance can typically sustain roughly 4% of
// itself per year in withdrawals without running out) to translate
// the raw number into an estimated sustainable annual/monthly income
// — and compares that against the saver's own stated target, so the
// takeaway is "on track" / "short by X" rather than an abstract
// dollar figure with no context. The 4% figure is explicitly labeled
// as a widely-used rule of thumb, not a guarantee — same honesty bar
// as every other calculator on this site.

import { useMemo, useState } from "react";
import { calculateCompoundGrowth } from "@/lib/personalCalculators";
import { useTrackCalculation } from "@/hooks/useTrackCalculation";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const SAFE_WITHDRAWAL_RATE_PERCENT = 4;

function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function RetirementSavingsCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(400);
  const [annualReturnRate, setAnnualReturnRate] = useState(7);
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState(3000);

  const years = Math.max(0, Number(retirementAge || 0) - Number(currentAge || 0));

  const growthResult = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount: currentSavings,
        monthlyContribution,
        annualReturnPercent: annualReturnRate,
        years,
      }),
    [currentSavings, monthlyContribution, annualReturnRate, years]
  );

  const sustainableAnnualIncome = growthResult
    ? growthResult.finalBalance * (SAFE_WITHDRAWAL_RATE_PERCENT / 100)
    : null;
  const sustainableMonthlyIncome = sustainableAnnualIncome !== null ? sustainableAnnualIncome / 12 : null;

  const targetAnnualIncome = Number(targetMonthlyIncome || 0) * 12;
  const targetBalanceNeeded =
    targetAnnualIncome > 0 ? targetAnnualIncome / (SAFE_WITHDRAWAL_RATE_PERCENT / 100) : null;

  const isOnTrack =
    growthResult && targetBalanceNeeded !== null ? growthResult.finalBalance >= targetBalanceNeeded : null;
  const balanceGapOrSurplus =
    growthResult && targetBalanceNeeded !== null ? growthResult.finalBalance - targetBalanceNeeded : null;

  // Analytics: one debounced `calculate_retirement_savings` GA4 event
  // per settled result (see hooks/useTrackCalculation.js).
  useTrackCalculation(
    "calculate_retirement_savings",
    growthResult ? `${currentSavings}:${monthlyContribution}:${annualReturnRate}:${years}:${targetMonthlyIncome}` : null,
    {
      tool_name: "retirement_savings_calculator",
      years,
      return_rate: annualReturnRate,
      target_monthly_income: targetMonthlyIncome,
    }
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Your Retirement Numbers</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            How much are you saving today, and when do you want to retire?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Current Age</span>
            <input
              type="number"
              min="1"
              step="1"
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Retirement Age</span>
            <input
              type="number"
              min="1"
              step="1"
              value={retirementAge}
              onChange={(e) => setRetirementAge(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Current Savings</span>
            <input
              type="number"
              min="0"
              step="any"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
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
              Target Monthly Income
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={targetMonthlyIncome}
              onChange={(e) => setTargetMonthlyIncome(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">
            Projected balance at age {retirementAge || "—"}
          </h2>
        </div>
        <div className="p-4">
          {growthResult ? (
            <>
              <p className="text-3xl font-extrabold text-slate-900">
                {formatNumber(growthResult.finalBalance)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatNumber(growthResult.totalContributed)} contributed, {formatNumber(growthResult.totalGrowth)}{" "}
                from growth, over {years} year{years === 1 ? "" : "s"}.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Enter valid, positive numbers above.</p>
          )}
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          {growthResult && sustainableMonthlyIncome !== null ? (
            <p className="text-sm leading-relaxed text-slate-700">
              Using the widely-cited &ldquo;4% rule&rdquo; of thumb, that balance could sustainably support
              roughly{" "}
              <span className="font-bold text-slate-900">{formatNumber(sustainableMonthlyIncome)}</span> per
              month ({formatNumber(sustainableAnnualIncome)}/yr) in retirement withdrawals.{" "}
              {targetBalanceNeeded !== null && isOnTrack !== null && (
                <>
                  Against your {formatNumber(targetMonthlyIncome)}/mo target, you&apos;re currently{" "}
                  {isOnTrack ? (
                    <span className="font-bold text-emerald-700">
                      on track with a projected surplus of {formatNumber(Math.abs(balanceGapOrSurplus))}
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600">
                      short by {formatNumber(Math.abs(balanceGapOrSurplus))}
                    </span>
                  )}
                  {" "}in retirement-balance terms.
                </>
              )}
            </p>
          ) : (
            <p className="text-sm text-slate-400">—</p>
          )}
          <p className="mt-2 text-[11px] text-slate-400">
            The 4% rule is a widely-used retirement-planning heuristic, not a guarantee — actual
            safe withdrawal rates vary with market conditions, retirement length, and portfolio mix.
            Growth is a constant-rate, long-horizon projection you choose yourself, not a forecast.
            For informational purposes only, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
