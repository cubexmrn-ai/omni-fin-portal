"use client";

// components/calculators/TaxFeeCalculator.jsx
//
// RETENTION UPGRADE (Multi-Persona UX & Retention Gap Audit — General
// Public persona): the one confirmed gap for this persona was a
// tax/fee-estimate tool — a repo-wide grep for capital gains/tax
// bracket/withholding returned zero matches before this file. Two
// modes: a progressive income-tax estimate (illustrative US federal
// brackets — see lib/taxFeeCalculators.js's header for exactly what
// that does and doesn't cover) and a flat-rate estimator for capital
// gains tax or a broker/exchange trade fee, where the user supplies
// their own known rate rather than this tool guessing one.

import { useMemo, useState } from "react";
import { estimateIncomeTax, estimateFlatRateFee } from "@/lib/taxFeeCalculators";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function TaxFeeCalculator() {
  const [mode, setMode] = useState("income"); // income | flat

  const [annualIncome, setAnnualIncome] = useState(75000);

  const [flatAmount, setFlatAmount] = useState(5000);
  const [flatRate, setFlatRate] = useState(15);

  const incomeResult = useMemo(() => estimateIncomeTax({ annualIncome }), [annualIncome]);
  const flatResult = useMemo(
    () => estimateFlatRateFee({ amount: flatAmount, ratePercent: flatRate }),
    [flatAmount, flatRate]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Tax &amp; Fee Estimator</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Quick ballpark estimates — not tax advice, and not specific to your country or filing status.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 bg-white px-4 pt-3">
        {[
          { id: "income", label: "Income Tax" },
          { id: "flat", label: "Capital Gains / Trade Fee" },
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

      {mode === "income" ? (
        <>
          <div className="grid grid-cols-1 gap-3 p-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Annual Income (USD)</span>
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
            {incomeResult ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Estimated Tax
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-rose-600">
                    ${formatNumber(incomeResult.estimatedTax)}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Effective Rate
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-slate-900">
                    {formatNumber(incomeResult.effectiveRatePercent, 1)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    vs. {formatNumber(incomeResult.topMarginalRatePercent, 0)}% top bracket
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Take-Home
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                    ${formatNumber(incomeResult.takeHome)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Enter a valid annual income above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Illustrative 2024 US federal single-filer brackets only — no state/local tax, deductions,
              credits, or other-country brackets are included. For an actual filing, use a tax
              professional or official calculator.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Gain / Trade Amount</span>
              <input
                type="number"
                min="0"
                step="any"
                value={flatAmount}
                onChange={(e) => setFlatAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Tax / Fee Rate (%) — your own
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={flatRate}
                onChange={(e) => setFlatRate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {flatResult ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Tax / Fee Owed
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-rose-600">
                    ${formatNumber(flatResult.feeOrTax)}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Net Amount
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-emerald-700">
                    ${formatNumber(flatResult.netAmount)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Enter a valid amount and rate above.</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Capital-gains rates and broker/exchange fees vary too widely by country, holding period, and
              platform for a single built-in table — enter the rate that applies to you.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
