"use client";

// components/calculators/RiskRewardCalculator.jsx
//
// Risk / Reward Ratio Calculator — entry, stop-loss, take-profit, and
// position size in; dollar risk, dollar reward, and R:R ratio out. See
// lib/tradingCalculators.js's calculateRiskReward() for why this works
// for any asset (forex, metals, crypto, stocks) without needing to know
// what a "pip" is.

import { useMemo, useState } from "react";
import { calculateRiskReward } from "@/lib/tradingCalculators";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

// See lib/formatNumber.js's header comment for why this delegates
// rather than calling toLocaleString directly.
function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function RiskRewardCalculator() {
  const [entry, setEntry] = useState(1.1);
  const [stopLoss, setStopLoss] = useState(1.095);
  const [takeProfit, setTakeProfit] = useState(1.11);
  const [positionSize, setPositionSize] = useState(100000);

  const result = useMemo(
    () => calculateRiskReward({ entry, stopLoss, takeProfit, positionSize }),
    [entry, stopLoss, takeProfit, positionSize]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Risk / Reward Ratio Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">R:R = Potential Reward ÷ Potential Risk</p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Entry Price</span>
          <input
            type="number"
            step="any"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Position Size (units)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Stop Loss</span>
          <input
            type="number"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Take Profit</span>
          <input
            type="number"
            step="any"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Risk</p>
                <p className="mt-0.5 text-base font-extrabold text-rose-600">${formatNumber(result.riskUsd)}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reward</p>
                <p className="mt-0.5 text-base font-extrabold text-emerald-600">${formatNumber(result.rewardUsd)}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">R:R Ratio</p>
                <p className="mt-0.5 text-base font-extrabold text-brand-700">{result.ratioLabel}</p>
              </div>
            </div>
            {!result.directionConsistent && (
              <p className="mt-2.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                Heads up: your take-profit looks like it&apos;s on the wrong side of entry for a{" "}
                {result.isLong ? "long" : "short"} trade (stop-loss implies {result.isLong ? "long" : "short"}).
                Double-check your levels.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Enter a valid entry, stop-loss (different from entry), take-profit, and position size above.
          </p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">For informational purposes only, not financial advice.</p>
      </div>
    </div>
  );
}
