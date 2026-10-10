"use client";

// components/calculators/LotSizeCalculator.jsx
//
// Position & Lot Size Calculator — full version of the math already
// proven out in components/academy/MiniLotSizeCalculator.jsx, extended
// to also show the Mini and Micro lot equivalents (the academy version
// only needed Standard lots for its one lesson). See
// lib/tradingCalculators.js for the underlying pure calculateLotSize().

import { useMemo, useState } from "react";
import { calculateLotSize } from "@/lib/tradingCalculators";

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function LotSizeCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [pipValuePerLot, setPipValuePerLot] = useState(10);

  const result = useMemo(
    () =>
      calculateLotSize({
        accountBalance: balance,
        riskPercent,
        stopLossPips: stopPips,
        pipValuePerStandardLot: pipValuePerLot,
      }),
    [balance, riskPercent, stopPips, pipValuePerLot]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Position &amp; Lot Size Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Risk Amount ÷ (Stop-Loss Pips × Pip Value per Lot) = Standard Lots
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Account Balance (USD)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Risk per Trade (%)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Stop-Loss Distance (pips)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={stopPips}
            onChange={(e) => setStopPips(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Pip Value per Standard Lot (USD)
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={pipValuePerLot}
            onChange={(e) => setPipValuePerLot(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div>
            <p className="text-sm text-slate-500">
              Risk Amount: <span className="font-bold text-slate-900">${formatNumber(result.riskAmount)}</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Standard</p>
                <p className="mt-0.5 text-base font-extrabold text-brand-700">{formatNumber(result.standardLots)}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mini</p>
                <p className="mt-0.5 text-base font-extrabold text-brand-700">{formatNumber(result.miniLots)}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Micro</p>
                <p className="mt-0.5 text-base font-extrabold text-brand-700">{formatNumber(result.microLots)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter valid, positive numbers above to see a suggested lot size.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Pip value per standard lot varies by currency pair and account currency — check your broker&apos;s
          actual figure (or use the Pip Value Calculator) before sizing a real trade. For informational
          purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
