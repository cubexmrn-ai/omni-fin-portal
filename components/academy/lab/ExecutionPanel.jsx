"use client";

// components/academy/lab/ExecutionPanel.jsx
//
// Buy/Sell order-entry form for the Demo Trading Lab: lot size, an
// optional Stop Loss and Take Profit, and the two order buttons. Pure
// controlled-input UI — all validation and the actual "fill" happen in
// hooks/useDemoTrading.js's openPosition(), which this component calls
// and then surfaces any `error` it returns inline.

import { useState } from "react";
import { DEMO_LEVERAGE, computeRequiredMargin } from "@/lib/demoTradingInstruments";

export default function ExecutionPanel({ instrument, price, onOpenPosition }) {
  const [lots, setLots] = useState("0.10");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [error, setError] = useState(null);
  const [lastFilled, setLastFilled] = useState(null);

  const lotSize = Number(lots);
  const estMargin =
    instrument && Number.isFinite(price) && Number.isFinite(lotSize)
      ? computeRequiredMargin(instrument, lotSize, price)
      : null;

  function handleOrder(side) {
    setError(null);
    setLastFilled(null);
    const result = onOpenPosition({
      instrumentCode: instrument?.code,
      side,
      lots: lotSize,
      sl: sl === "" ? null : Number(sl),
      tp: tp === "" ? null : Number(tp),
    });
    if (!result.ok) {
      setError(result.error);
    } else {
      setLastFilled(`${side === "buy" ? "Bought" : "Sold"} ${lotSize} lot(s) of ${instrument.label} @ ${result.position.entryPrice}`);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-sm font-bold text-slate-900">Execution Panel</p>
      <p className="mt-1 text-[11px] text-slate-400">
        Simplified teaching leverage of 1:{DEMO_LEVERAGE} applies to every instrument here — not a
        quoted real-broker figure.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Lot Size</span>
          <input
            type="number"
            min={instrument?.minLots ?? 0.01}
            step={instrument?.lotStep ?? 0.01}
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Stop Loss (optional)</span>
          <input
            type="number"
            step="any"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            placeholder="price"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Take Profit (optional)</span>
          <input
            type="number"
            step="any"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
            placeholder="price"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        Est. required margin: {Number.isFinite(estMargin) ? `$${estMargin.toFixed(2)}` : "—"}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOrder("buy")}
          disabled={!Number.isFinite(price)}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy / Long
        </button>
        <button
          type="button"
          onClick={() => handleOrder("sell")}
          disabled={!Number.isFinite(price)}
          className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sell / Short
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}
      {lastFilled && !error && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {lastFilled}
        </p>
      )}
    </div>
  );
}
