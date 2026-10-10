"use client";

// components/academy/MiniLotSizeCalculator.jsx
//
// A small, self-contained position-sizing calculator embedded directly
// inside the "Pips & Lot Sizes" and "Position Sizing Math" lessons (see
// lib/academyData.js's `{ type: "tool", toolId: "lot-size-calculator" }`
// sections, rendered via components/academy/EmbeddedTool.jsx).
//
// Deliberately pure client-side arithmetic — no live rates needed, since
// the lesson's formula (Lot Size is approximately Risk Amount divided by
// Stop-Loss Pips times Pip Value per Lot) only needs numbers the
// learner types in themselves. The "pip value per standard lot" field
// defaults to $10 (the typical value for a USD-quoted pair) but is
// editable, with an explicit note that it varies by pair and account
// currency — never presented as a universal constant.

import { useMemo, useState } from "react";

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function MiniLotSizeCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [pipValuePerLot, setPipValuePerLot] = useState(10);

  const result = useMemo(() => {
    const bal = Number(balance);
    const risk = Number(riskPercent);
    const pips = Number(stopPips);
    const pipVal = Number(pipValuePerLot);

    if (![bal, risk, pips, pipVal].every(Number.isFinite) || pips <= 0 || pipVal <= 0) {
      return null;
    }

    const riskAmount = bal * (risk / 100);
    const lots = riskAmount / (pips * pipVal);
    return { riskAmount, lots };
  }, [balance, riskPercent, stopPips, pipValuePerLot]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Mini Lot Size Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Lot Size ≈ (Account Balance × Risk %) ÷ (Stop-Loss Pips × Pip Value per Lot)
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
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <p>
              <span className="text-slate-500">Risk Amount: </span>
              <span className="font-bold text-slate-900">${formatNumber(result.riskAmount)}</span>
            </p>
            <p>
              <span className="text-slate-500">Suggested Lot Size: </span>
              <span className="font-bold text-brand-700">{formatNumber(result.lots, 2)} standard lots</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter valid, positive numbers above to see a suggested lot size.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Pip value per lot varies by currency pair and account currency — $10/pip for a standard
          lot is typical for USD-quoted pairs, but always check your broker&apos;s actual figure
          before sizing a real trade. For informational/educational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
