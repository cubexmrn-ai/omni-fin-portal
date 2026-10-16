"use client";

// components/calculators/CompoundGrowthCalculator.jsx
//
// Compound Interest / Wealth Growth Calculator — monthly contribution,
// expected annual return %, and years in; a year-by-year compounding
// growth table out. See lib/personalCalculators.js's
// calculateCompoundGrowth() for the month-by-month simulation this
// table is built from.
//
// RETENTION UPGRADE (Multi-Persona UX & Retention Gap Audit — Dividend
// Investor persona): this used to be the ONLY long-term compounding
// tool on the site, framed purely as generic wealth growth with no
// dividend-specific concept — no yield input, no payout frequency, no
// reinvestment toggle. The "Dividend Compounding (DRIP)" switch below
// doesn't replace the plain mode; it swaps in
// calculateDividendGrowth(), which splits one blended "return %" into
// a real price-growth rate plus a separately-accrued, optionally
// reinvested dividend — see that function's header comment for the
// mechanics.

import { useMemo, useState } from "react";
import {
  calculateCompoundGrowth,
  calculateDividendGrowth,
  calculateRealPurchasingPower,
  buildDripScenarioTakeaway,
} from "@/lib/personalCalculators";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

// See lib/formatNumber.js's header comment for why this delegates
// rather than calling toLocaleString directly.
function formatNumber(value, decimals = 0) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

export default function CompoundGrowthCalculator() {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(15);

  const [dripMode, setDripMode] = useState(false);
  const [dividendYield, setDividendYield] = useState(3);
  const [payoutFrequency, setPayoutFrequency] = useState("quarterly");
  const [reinvestDividends, setReinvestDividends] = useState(true);

  // Phase 2 item 2: a disclosed, editable inflation-rate input (not a
  // hidden assumption) feeding the new real-purchasing-power line
  // below — defaults to a commonly-cited long-run US average (~3%),
  // same "disclosed static default, visitor can change it" pattern as
  // the Inflation & Purchasing Power calculator elsewhere on this page.
  const [inflationRate, setInflationRate] = useState(3);

  const plainResult = useMemo(
    () =>
      calculateCompoundGrowth({
        initialAmount,
        monthlyContribution,
        annualReturnPercent: annualReturn,
        years,
      }),
    [initialAmount, monthlyContribution, annualReturn, years]
  );

  const dripResult = useMemo(
    () =>
      calculateDividendGrowth({
        initialAmount,
        monthlyContribution,
        priceGrowthPercent: annualReturn,
        dividendYieldPercent: dividendYield,
        payoutFrequency,
        reinvestDividends,
        years,
      }),
    [initialAmount, monthlyContribution, annualReturn, dividendYield, payoutFrequency, reinvestDividends, years]
  );

  // Phase 2 item 2: the DRIP scenario-takeaway needs BOTH the
  // reinvested and non-reinvested outcomes for the same inputs, not
  // just whichever one the `reinvestDividends` toggle currently
  // selects — these two extra calls are the deterministic second
  // simulation the comparison in buildDripScenarioTakeaway() needs,
  // not a new estimate.
  const dripReinvestedResult = useMemo(
    () =>
      calculateDividendGrowth({
        initialAmount,
        monthlyContribution,
        priceGrowthPercent: annualReturn,
        dividendYieldPercent: dividendYield,
        payoutFrequency,
        reinvestDividends: true,
        years,
      }),
    [initialAmount, monthlyContribution, annualReturn, dividendYield, payoutFrequency, years]
  );

  const dripNonReinvestedResult = useMemo(
    () =>
      calculateDividendGrowth({
        initialAmount,
        monthlyContribution,
        priceGrowthPercent: annualReturn,
        dividendYieldPercent: dividendYield,
        payoutFrequency,
        reinvestDividends: false,
        years,
      }),
    [initialAmount, monthlyContribution, annualReturn, dividendYield, payoutFrequency, years]
  );

  const dripTakeaway = useMemo(
    () =>
      buildDripScenarioTakeaway({
        reinvestedResult: dripReinvestedResult,
        nonReinvestedResult: dripNonReinvestedResult,
      }),
    [dripReinvestedResult, dripNonReinvestedResult]
  );

  const result = dripMode ? dripResult : plainResult;

  const realPurchasingPower = useMemo(
    () =>
      result
        ? calculateRealPurchasingPower({
            nominalBalance: result.finalBalance,
            years,
            inflationRatePercent: inflationRate,
          })
        : null,
    [result, years, inflationRate]
  );

  // Years is capped at 40 purely so the rendered table (one row per
  // year) stays a reasonable, scrollable length rather than hundreds
  // of rows — the underlying math has no such limit.
  const cappedYears = Math.min(Number(years) || 0, 40);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Compound Interest / Wealth Growth Calculator</h3>
            <p className="mt-0.5 text-xs text-slate-500">Monthly compounding, contribution added each month</p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            <input
              type="checkbox"
              checked={dripMode}
              onChange={(e) => setDripMode(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Dividend Compounding (DRIP) Mode
          </label>
        </div>
      </div>

      {dripMode && (
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-brand-50/40 p-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Dividend Yield (% / yr)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={dividendYield}
              onChange={(e) => setDividendYield(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Payout Frequency</span>
            <select
              value={payoutFrequency}
              onChange={(e) => setPayoutFrequency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </label>
          <label className="flex items-end pb-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={reinvestDividends}
                onChange={(e) => setReinvestDividends(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Reinvest dividends (DRIP)
            </span>
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
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
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            {dripMode ? "Price Growth (% / yr, excl. dividend)" : "Expected Return (% / yr)"}
          </span>
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

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Inflation Rate (% / yr, for real value below)
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={inflationRate}
            onChange={(e) => setInflationRate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      {result ? (
        <>
          <div
            className={`grid grid-cols-1 gap-2 px-4 ${dripMode ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
          >
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
            {dripMode && (
              <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Total Dividends
                </p>
                <p className="mt-0.5 text-base font-extrabold text-amber-600">
                  ${formatNumber(dripResult.totalDividends)}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {reinvestDividends ? "reinvested into balance" : "paid out, not reinvested"}
                </p>
              </div>
            )}
          </div>

          {/* Phase 2 item 2: real purchasing power + DRIP takeaway —
              the "so what?" lines that turn the stat tiles above into a
              directly useful read, rather than leaving the visitor to
              mentally discount the Final Balance for inflation
              themselves. Both numbers come straight from the same
              deterministic calculators, never a new estimate. */}
          {realPurchasingPower && (
            <div className="mx-4 mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Real Purchasing Power (Inflation-Adjusted)
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                In today&apos;s money, that ${formatNumber(result.finalBalance)} nominal balance is worth
                roughly <span className="font-bold text-slate-900">${formatNumber(realPurchasingPower.realValue)}</span>{" "}
                after {Number(years) || 0} years of {formatNumber(inflationRate, 1)}% assumed annual
                inflation — a {formatNumber(realPurchasingPower.erosionPercent, 1)}% erosion in purchasing
                power.
              </p>
            </div>
          )}

          {dripMode && dripTakeaway && (
            <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700/80">
                DRIP Scenario Takeaway
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900">
                Reinvesting dividends (DRIP) over {Number(years) || 0} years ends with{" "}
                <span className="font-bold">${formatNumber(dripTakeaway.reinvestedFinalBalance)}</span>{" "}
                in the account, versus{" "}
                <span className="font-bold">${formatNumber(dripTakeaway.nonReinvestedTotalWealth)}</span>{" "}
                total wealth (account balance + dividend cash paid out) if dividends are taken as cash
                instead —{" "}
                {dripTakeaway.balanceDifference >= 0
                  ? `a $${formatNumber(Math.abs(dripTakeaway.balanceDifference))} advantage for reinvesting`
                  : `a $${formatNumber(Math.abs(dripTakeaway.balanceDifference))} disadvantage for reinvesting`}
                {dripTakeaway.percentDifference !== null
                  ? ` (${formatNumber(Math.abs(dripTakeaway.percentDifference), 1)}%).`
                  : "."}
              </p>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto border-t border-slate-100 px-4 py-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-semibold">Year</th>
                  <th className="pb-2 font-semibold">Contributed</th>
                  <th className="pb-2 font-semibold">Growth</th>
                  {dripMode && <th className="pb-2 font-semibold">Dividends</th>}
                  <th className="pb-2 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.table.slice(0, cappedYears).map((row) => (
                  <tr key={row.year}>
                    <td className="py-1.5 font-medium text-slate-700">{row.year}</td>
                    <td className="py-1.5 text-slate-500">${formatNumber(row.contributed)}</td>
                    <td className="py-1.5 text-emerald-600">${formatNumber(row.growth)}</td>
                    {dripMode && (
                      <td className="py-1.5 text-amber-600">${formatNumber(row.dividendsSoFar)}</td>
                    )}
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
          {dripMode
            ? "Assumes a constant monthly price-growth rate and a constant dividend yield, accrued at the selected payout frequency — real dividends and prices fluctuate, and a company can cut or suspend a payout entirely."
            : "Assumes a constant monthly-compounded return — real markets fluctuate year to year."}{" "}
          For informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
