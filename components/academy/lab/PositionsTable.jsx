"use client";

// components/academy/lab/PositionsTable.jsx
//
// Live grid of the Demo Trading Lab's open positions: entry price,
// current mark price, floating PnL (green/red), and a one-click Close
// Position button. `positions` already carries `markPrice`/`pnl`
// computed by hooks/useDemoTrading.js from the latest live prices.

import { formatNumber } from "@/lib/formatNumber";

export default function PositionsTable({ positions, onClosePosition }) {
  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-400 shadow-card">
        No open positions — place a Buy or Sell order above to open one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-2.5">Instrument</th>
            <th className="px-4 py-2.5">Side</th>
            <th className="px-4 py-2.5">Lots</th>
            <th className="px-4 py-2.5">Entry</th>
            <th className="px-4 py-2.5">Mark</th>
            <th className="px-4 py-2.5">SL / TP</th>
            <th className="px-4 py-2.5">Floating PnL</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const decimals = position.instrument?.decimals ?? 2;
            const pnlTone =
              position.pnl > 0 ? "text-emerald-600" : position.pnl < 0 ? "text-rose-600" : "text-slate-500";
            return (
              <tr key={position.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-semibold text-slate-900">
                  {position.instrument?.label || position.instrumentCode}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      position.side === "buy"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {position.side === "buy" ? "BUY" : "SELL"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-700">{position.lots}</td>
                <td className="px-4 py-2.5 text-slate-700">
                  {formatNumber(position.entryPrice, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
                </td>
                <td className="px-4 py-2.5 text-slate-700">
                  {Number.isFinite(position.markPrice)
                    ? formatNumber(position.markPrice, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">
                  {position.sl ? `SL ${formatNumber(position.sl, { maximumFractionDigits: decimals })}` : "—"} /{" "}
                  {position.tp ? `TP ${formatNumber(position.tp, { maximumFractionDigits: decimals })}` : "—"}
                </td>
                <td className={`px-4 py-2.5 font-bold ${pnlTone}`}>
                  {Number.isFinite(position.pnl)
                    ? `${position.pnl >= 0 ? "+" : ""}$${formatNumber(position.pnl, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}`
                    : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => onClosePosition(position.id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
