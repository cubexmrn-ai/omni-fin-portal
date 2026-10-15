"use client";

// components/calculators/RentalYieldCalculator.jsx
//
// RETENTION UPGRADE (Multi-Persona UX & Retention Gap Audit — Real
// Estate Investor persona): the audit found the site could already
// convert sq ft ↔ sq yards/meters via UnitConverter.jsx, but had
// nothing to turn that figure into an actual investment decision —
// no rental yield, no mortgage/amortization. This pairs both into one
// tool: gross/net rental yield on the property, and a standard
// fixed-rate mortgage amortization schedule, so a unit conversion can
// become a real "should I buy this" number without leaving the site.
// See lib/realEstateCalculators.js for the underlying math.

import { useMemo, useState } from "react";
import { calculateRentalYield, calculateMortgage } from "@/lib/realEstateCalculators";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function RentalYieldCalculator() {
  const [mode, setMode] = useState("yield"); // yield | mortgage

  // Rental yield inputs
  const [propertyValue, setPropertyValue] = useState(300000);
  const [monthlyRent, setMonthlyRent] = useState(1800);
  const [annualOperatingCosts, setAnnualOperatingCosts] = useState(3000);

  // Mortgage inputs
  const [loanAmount, setLoanAmount] = useState(240000);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [loanYears, setLoanYears] = useState(30);

  const yieldResult = useMemo(
    () => calculateRentalYield({ propertyValue, monthlyRent, annualOperatingCosts }),
    [propertyValue, monthlyRent, annualOperatingCosts]
  );

  const mortgageResult = useMemo(
    () => calculateMortgage({ loanAmount, annualRatePercent: mortgageRate, years: loanYears }),
    [loanAmount, mortgageRate, loanYears]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Rental Yield &amp; Mortgage Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Gross/net rental yield on a property, or a fixed-rate loan&apos;s monthly payment &amp; payoff schedule.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 bg-white px-4 pt-3">
        {[
          { id: "yield", label: "Rental Yield" },
          { id: "mortgage", label: "Mortgage / Amortization" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              mode === tab.id
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "yield" ? (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Property Value</span>
              <input
                type="number"
                min="0"
                step="any"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Monthly Rent</span>
              <input
                type="number"
                min="0"
                step="any"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Annual Operating Costs
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={annualOperatingCosts}
                onChange={(e) => setAnnualOperatingCosts(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {yieldResult ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Gross Yield
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-brand-700">
                    {formatNumber(yieldResult.grossYieldPercent, 2)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">before operating costs</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Net Yield
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                    {formatNumber(yieldResult.netYieldPercent, 2)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">after operating costs</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Annual Rent
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-slate-900">
                    ${formatNumber(yieldResult.annualRent)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">12 × monthly rent</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Enter a valid property value and monthly rent above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Yield figures ignore financing costs (mortgage interest) and taxes — use the Mortgage tab
              alongside this to see financed cash flow.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Loan Amount</span>
              <input
                type="number"
                min="0"
                step="any"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Interest Rate (% / yr)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={mortgageRate}
                onChange={(e) => setMortgageRate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Loan Term (years)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {mortgageResult ? (
              <>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Monthly Payment
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-brand-700">
                      ${formatNumber(mortgageResult.monthlyPayment)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">principal + interest</p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Total Interest Paid
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-rose-600">
                      ${formatNumber(mortgageResult.totalInterestPaid)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">over {loanYears} years</p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Total Paid
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-slate-900">
                      ${formatNumber(mortgageResult.totalPaid)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">principal + all interest</p>
                  </div>
                </div>

                {mortgageResult.schedule.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white scrollbar-thin">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-3 py-1.5 text-left">Year</th>
                          <th className="px-3 py-1.5 text-right">Remaining Balance</th>
                          <th className="px-3 py-1.5 text-right">Cumulative Interest</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mortgageResult.schedule.map((row) => (
                          <tr key={row.year}>
                            <td className="px-3 py-1.5 font-semibold text-slate-700">Yr {row.year}</td>
                            <td className="px-3 py-1.5 text-right text-slate-600">
                              ${formatNumber(row.remainingBalance)}
                            </td>
                            <td className="px-3 py-1.5 text-right text-slate-600">
                              ${formatNumber(row.cumulativeInterest)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">Enter a valid loan amount, rate, and term above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Standard fixed-rate amortization — excludes property tax, insurance, and HOA (often bundled
              into a real-world escrow payment on top of this).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
