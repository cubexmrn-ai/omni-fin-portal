"use client";

// components/tools/LoanEmiTaxCalculator.jsx
//
// Loan / EMI & Salary Tax Calculator — Household/Novice persona,
// Product & UX Audit item #2. Two pure, formula-driven modes (see
// lib/loanCalculators.js) — no live data needed for either, so this
// component makes zero network calls. Same two-tab shape as
// components/calculators/TaxFeeCalculator.jsx, so a person who's used
// that tool already recognizes the pattern here.

import { useMemo, useState } from "react";
import { calculateLoanEmi, estimateSalaryTaxPK } from "@/lib/loanCalculators";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function LoanEmiTaxCalculator() {
  const [mode, setMode] = useState("emi"); // emi | tax

  const [loanAmount, setLoanAmount] = useState(2000000);
  const [annualRate, setAnnualRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(5);

  const [annualIncome, setAnnualIncome] = useState(1800000);

  const emiResult = useMemo(
    () => calculateLoanEmi({ loanAmount, annualRatePercent: annualRate, tenureYears }),
    [loanAmount, annualRate, tenureYears]
  );
  const taxResult = useMemo(() => estimateSalaryTaxPK({ annualIncome }), [annualIncome]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900">Loan / EMI &amp; Salary Tax Calculator</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Monthly loan installment, or a quick salary-tax estimate — not financial or tax advice.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 bg-white px-4 pt-3">
        {[
          { id: "emi", label: "Loan / EMI" },
          { id: "tax", label: "Salary Tax (Pakistan)" },
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

      {mode === "emi" ? (
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
              <span className="mb-1 block text-xs font-semibold text-slate-600">Annual Interest Rate (%)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Tenure (years)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {emiResult ? (
              <>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Monthly EMI
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-brand-700">
                      {formatNumber(emiResult.emi)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Total Interest
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-rose-600">
                      {formatNumber(emiResult.totalInterestPaid)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Total Repayment
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-slate-900">
                      {formatNumber(emiResult.totalPayment)}
                    </p>
                  </div>
                </div>
                {emiResult.schedule.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-600">
                        <tr>
                          <th className="px-3 py-1.5 text-left font-semibold">Year</th>
                          <th className="px-3 py-1.5 text-right font-semibold">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {emiResult.schedule.map((row) => (
                          <tr key={row.year}>
                            <td className="px-3 py-1.5 text-slate-600">{row.year}</td>
                            <td className="px-3 py-1.5 text-right text-slate-900">
                              {formatNumber(row.remainingBalance, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">Enter valid, positive numbers above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Standard fixed-rate amortization — your actual lender may charge processing fees,
              insurance, or a variable rate not reflected here. For informational purposes only.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Annual Taxable Income (PKR)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {taxResult ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Estimated Tax
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-rose-600">
                    {formatNumber(taxResult.estimatedTax)} PKR
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Effective Rate
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-slate-900">
                    {formatNumber(taxResult.effectiveRatePercent, 1)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    vs. {formatNumber(taxResult.topMarginalRatePercent, 0)}% top slab
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Take-Home
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                    {formatNumber(taxResult.takeHome)} PKR
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Enter a valid annual income above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Illustrative Pakistan FY2024-25 salaried-individual slabs only — no withholding,
              rebates, or non-salaried rates included, and slabs change every fiscal year. For an
              actual filing, use FBR&apos;s own calculator or a tax professional.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
