"use client";

// components/academy/lab/AccountSummaryBar.jsx
//
// The Demo Trading Lab's account strip: Balance, Equity, Used Margin,
// Free Margin, Floating PnL and Closed PnL — all derived in real time
// by hooks/useDemoTrading.js from the open positions + live prices.
// Pure presentational component; every figure is already computed by
// the caller, this just formats and colors them.

import { formatNumber } from "@/lib/formatNumber";

export default function AccountSummaryBar({ account, onReset }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">Virtual Account</p>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
        >
          Reset to $10,000
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Balance</p>
          <p className="mt-0.5 text-base font-extrabold text-white">
            ${formatNumber(account.balance, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Equity</p>
          <p className="mt-0.5 text-base font-extrabold text-white">
            ${formatNumber(account.equity, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Used Margin</p>
          <p className="mt-0.5 text-base font-extrabold text-white">
            ${formatNumber(account.usedMargin, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Free Margin</p>
          <p className="mt-0.5 text-base font-extrabold text-white">
            ${formatNumber(account.freeMargin, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Floating PnL</p>
          <p
            className={`mt-0.5 text-base font-extrabold ${
              account.floatingPnl > 0
                ? "text-emerald-400"
                : account.floatingPnl < 0
                ? "text-rose-400"
                : "text-white"
            }`}
          >
            {account.floatingPnl >= 0 ? "+" : ""}
            ${formatNumber(account.floatingPnl, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Closed PnL</p>
          <p
            className={`mt-0.5 text-base font-extrabold ${
              account.closedPnl > 0
                ? "text-emerald-400"
                : account.closedPnl < 0
                ? "text-rose-400"
                : "text-white"
            }`}
          >
            {account.closedPnl >= 0 ? "+" : ""}
            ${formatNumber(account.closedPnl, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
