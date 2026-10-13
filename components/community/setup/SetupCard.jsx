"use client";

// components/community/setup/SetupCard.jsx
//
// One trade setup card for the Setup Sharing Board: Asset, Direction
// (LONG 🟢 / SHORT 🔴), Entry/SL/TP, Risk/Reward ratio, and the
// author's Technical Rationale notes. `rr` is computed by the caller
// (lib/tradeSetupsData.js's computeRiskReward) from the setup's own
// real entry/SL/TP — never a separately invented number.

import { INSTRUMENT_BY_CODE } from "@/lib/technicalAnalysis";
import { formatNumber } from "@/lib/formatNumber";

export default function SetupCard({ setup, rr }) {
  const instrument = INSTRUMENT_BY_CODE[setup.instrumentCode];
  const decimals = instrument?.decimals ?? 2;
  const isLong = setup.bias === "buy";

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {instrument?.label || setup.instrumentCode}
          </p>
          <p
            className={`mt-0.5 inline-flex items-center gap-1 text-sm font-extrabold ${
              isLong ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isLong ? "LONG 🟢" : "SHORT 🔴"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">R:R</p>
          <p className="text-lg font-extrabold text-white">
            {Number.isFinite(rr) ? `1:${rr.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-3 text-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Entry</p>
          <p className="mt-0.5 text-sm font-bold text-white">
            {formatNumber(setup.entry, { maximumFractionDigits: decimals })}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Stop Loss
          </p>
          <p className="mt-0.5 text-sm font-bold text-rose-400">
            {formatNumber(setup.stopLoss, { maximumFractionDigits: decimals })}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Take Profit
          </p>
          <p className="mt-0.5 text-sm font-bold text-emerald-400">
            {formatNumber(setup.takeProfit, { maximumFractionDigits: decimals })}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-300">{setup.rationale}</p>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-semibold text-slate-400">
          {setup.isUserSubmitted ? "Posted by you" : setup.authorHandle}
        </span>
        <span>{new Date(setup.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
