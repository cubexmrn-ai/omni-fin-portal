"use client";

// components/academy/lab/TradeHistory.jsx
//
// Closed-trade history for the Demo Trading Lab, plus win-rate/total
// PnL summary stats (both already computed in hooks/useDemoTrading.js
// from the real closed-trade list — nothing here is fabricated, a
// trade only appears once closePosition() has actually run).

import { formatNumber } from "@/lib/formatNumber";
import { getDemoLabInstrument } from "@/lib/demoTradingInstruments";

const CLOSE_REASON_LABEL = {
  manual: "Manual",
  sl: "Stop Loss",
  tp: "Take Profit",
};

export default function TradeHistory({ history, stats }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-bold text-slate-900">Trade History</p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            <span className="font-bold text-slate-900">{stats.total}</span> trades
          </span>
          <span>
            <span className="font-bold text-slate-900">{stats.winRate}%</span> win rate
          </span>
          <span className={stats.totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"}>
            <span className="font-bold">
              {stats.totalPnl >= 0 ? "+" : ""}$
              {formatNumber(stats.totalPnl, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </span>{" "}
            total
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-400">
          No closed trades yet — your trade history will appear here once you close a position.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2.5">Instrument</th>
                <th className="px-4 py-2.5">Side</th>
                <th className="px-4 py-2.5">Lots</th>
                <th className="px-4 py-2.5">Entry → Close</th>
                <th className="px-4 py-2.5">Closed Via</th>
                <th className="px-4 py-2.5">PnL</th>
              </tr>
            </thead>
            <tbody>
              {history.map((trade) => {
                const instrument = getDemoLabInstrument(trade.instrumentCode);
                const decimals = instrument?.decimals ?? 2;
                const pnlTone = trade.pnl > 0 ? "text-emerald-600" : trade.pnl < 0 ? "text-rose-600" : "text-slate-500";
                return (
                  <tr key={trade.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      {instrument?.label || trade.instrumentCode}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          trade.side === "buy" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {trade.side === "buy" ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{trade.lots}</td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {formatNumber(trade.entryPrice, { maximumFractionDigits: decimals })} →{" "}
                      {formatNumber(trade.closePrice, { maximumFractionDigits: decimals })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {CLOSE_REASON_LABEL[trade.closeReason] || "Manual"}
                    </td>
                    <td className={`px-4 py-2.5 font-bold ${pnlTone}`}>
                      {trade.pnl >= 0 ? "+" : ""}$
                      {formatNumber(trade.pnl, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
