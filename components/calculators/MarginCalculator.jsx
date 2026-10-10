"use client";

// components/calculators/MarginCalculator.jsx
//
// Margin & Leverage Calculator — account balance, leverage (1:100 to
// 1:500, plus a custom option), and position size (USD notional) in;
// required margin, free margin, and margin level (%) out. See
// lib/tradingCalculators.js's calculateMargin().

import { useMemo, useState } from "react";
import { calculateMargin } from "@/lib/tradingCalculators";

const LEVERAGE_PRESETS = [50, 100, 200, 300, 400, 500];

function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

export default function MarginCalculator() {
  const [balance, setBalance] = useState(1000);
  const [leverage, setLeverage] = useState(100);
  const [isCustomLeverage, setIsCustomLeverage] = useState(false);
  const [positionSize, setPositionSize] = useState(50000);

  const result = useMemo(
    () => calculateMargin({ accountBalance: balance, leverage, positionSizeUsd: positionSize }),
    [balance, leverage, positionSize]
  );

  function handleLeverageSelect(value) {
    if (value === "custom") {
      setIsCustomLeverage(true);
      return;
    }
    setIsCustomLeverage(false);
    setLeverage(Number(value));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Margin &amp; Leverage Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">Required Margin = Position Size ÷ Leverage</p>
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
          <span className="mb-1 block text-xs font-semibold text-slate-600">Position Size (USD notional)</span>
          <input
            type="number"
            min="0"
            step="any"
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Leverage</span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={isCustomLeverage ? "custom" : leverage}
              onChange={(e) => handleLeverageSelect(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {LEVERAGE_PRESETS.map((lev) => (
                <option key={lev} value={lev}>
                  1:{lev}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
            {isCustomLeverage && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                1:
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}
          </div>
        </label>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Required Margin</p>
                <p className="mt-0.5 text-base font-extrabold text-brand-700">${formatNumber(result.requiredMargin)}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Free Margin</p>
                <p className={`mt-0.5 text-base font-extrabold ${result.freeMargin < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  ${formatNumber(result.freeMargin)}
                </p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Margin Level</p>
                <p className="mt-0.5 text-base font-extrabold text-slate-900">
                  {Number.isFinite(result.marginLevelPercent) ? `${formatNumber(result.marginLevelPercent, 0)}%` : "—"}
                </p>
              </div>
            </div>
            {result.isOverLeveraged && (
              <p className="mt-2.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                This position size exceeds your account balance at this leverage — free margin is negative,
                meaning there isn&apos;t enough balance to safely open and sustain this trade.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter valid, positive numbers above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          Margin level is a simplified Balance ÷ Required Margin figure — your broker&apos;s actual margin-call
          and stop-out thresholds vary. For informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
