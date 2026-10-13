"use client";

// components/dashboard/TradingLabSummaryCard.jsx
//
// Dashboard tile summarizing the person's Demo Trading Lab account
// (hooks/useDemoTrading.js — the exact same hook and localStorage key
// app/learn/lab/page.jsx's TradingLab.jsx uses, so these numbers are
// always the real, current account state, never a separate snapshot
// that can drift out of sync).

import Link from "next/link";
import { formatNumber } from "@/lib/formatNumber";

function PnlFigure({ label, value }) {
  const tone = value > 0 ? "text-emerald-400" : value < 0 ? "text-rose-400" : "text-white";
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 text-lg font-extrabold ${tone}`}>
        {value >= 0 ? "+" : ""}${formatNumber(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function TradingLabSummaryCard({ account }) {
  const hasActivity = account.hydrated && (account.positions.length > 0 || account.history.length > 0);

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Demo Trading Lab</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-white">Account Snapshot</h3>
        </div>
        {account.riskManagerBadgeClaimed && (
          <span
            className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400"
            title="Risk Manager Badge earned"
          >
            🏅 Risk Manager
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Account Balance
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-white">
            ${formatNumber(account.balance, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Win Rate</p>
          <p className="mt-0.5 text-lg font-extrabold text-white">
            {hasActivity ? `${account.historyStats.winRate}%` : "—"}
          </p>
        </div>
        <PnlFigure label="Floating PnL" value={account.floatingPnl} />
        <PnlFigure label="Closed PnL" value={account.closedPnl} />
      </div>

      {!hasActivity && (
        <p className="mt-3 text-[11px] text-slate-500">
          No trades yet — open the Lab to place your first demo trade.
        </p>
      )}

      <div className="mt-4">
        <Link
          href="/learn/lab"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
        >
          Open Trading Lab →
        </Link>
      </div>
    </div>
  );
}
