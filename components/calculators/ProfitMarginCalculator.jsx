"use client";

// components/calculators/ProfitMarginCalculator.jsx
//
// Business Profit Margin & Markup Calculator — cost and selling price
// in; gross profit, gross margin %, and markup % out. See
// lib/personalCalculators.js's calculateMarginMarkup() for why margin
// and markup are deliberately returned as two separate numbers.

import { useMemo, useState } from "react";
import { calculateMarginMarkup } from "@/lib/personalCalculators";

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState(60);
  const [sellingPrice, setSellingPrice] = useState(100);

  const result = useMemo(() => calculateMarginMarkup({ cost, sellingPrice }), [cost, sellingPrice]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Business Profit Margin &amp; Markup Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">Margin = Profit ÷ Price · Markup = Profit ÷ Cost</p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Cost</span>
          <input
            type="number"
            min="0"
            step="any"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Selling Price</span>
          <input
            type="number"
            min="0"
            step="any"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Gross Profit</p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">${formatNumber(result.grossProfit)}</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Gross Margin %</p>
              <p className="mt-0.5 text-base font-extrabold text-brand-700">{formatNumber(result.grossMarginPercent, 1)}%</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Markup %</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-600">
                {Number.isFinite(result.markupPercent) ? `${formatNumber(result.markupPercent, 1)}%` : "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter a valid, non-negative cost and selling price above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Margin and markup are different numbers for the same sale — margin is profit as a % of the
          selling price, markup is profit as a % of cost. For informational purposes only.
        </p>
      </div>
    </div>
  );
}
