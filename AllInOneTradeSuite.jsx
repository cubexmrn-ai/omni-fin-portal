"use client";

// components/calculators/AllInOneTradeSuite.jsx
//
// The "All-in-One Trade Execution Suite" tab of the unified Trading
// Calculator Terminal (components/calculators/TradingTerminal.jsx).
// One form — pair, custom lot size (any decimal, e.g. 0.18 lots — not
// a Standard/Mini/Micro preset), Buy/Sell, Entry/Take-Profit/Stop-Loss
// — drives a single combined calculation
// (lib/tradingCalculators.js's calculateTradeExecution()) that returns
// potential profit & loss (in $ and pips), the Risk:Reward ratio, the
// live-rate pip value in USD/PKR, and the required/free margin impact
// of the exact position sized above.
//
// Rates are fetched the same way PipValueCalculator.jsx does — live
// from /api/rates with a visible live/fallback status dot and a safe
// static fallback table (lib/currencies.js) so this never blocks on a
// slow/broken rates endpoint.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TRADABLE_PAIRS,
  PAIR_CATEGORIES,
  PIP_SIZE_OPTIONS,
  getTradablePair,
  getPairsByCategory,
  getDefaultPipSize,
  calculateTradeExecution,
} from "@/lib/tradingCalculators";
import { fetchRates } from "@/lib/fetchRates";
import { FALLBACK_RATES } from "@/lib/currencies";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

function formatNumber(value, decimals = 2) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 2 });
}

export default function AllInOneTradeSuite() {
  const [pairId, setPairId] = useState("EURUSD");
  const [lots, setLots] = useState(0.18);
  const [direction, setDirection] = useState("buy");
  const [entry, setEntry] = useState(1.123);
  const [takeProfit, setTakeProfit] = useState(1.223);
  const [stopLoss, setStopLoss] = useState(1.073);
  const [pipSize, setPipSize] = useState(getDefaultPipSize("forex"));
  const [accountBalance, setAccountBalance] = useState(10000);
  const [leverage, setLeverage] = useState(100);
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [rateStatus, setRateStatus] = useState("loading");

  const pair = getTradablePair(pairId) || TRADABLE_PAIRS[0];
  const pipSizeOptions = PIP_SIZE_OPTIONS[pair.instrumentType] || PIP_SIZE_OPTIONS.forex;
  const hasSelectablePipSize = pipSizeOptions.length > 1;

  const loadRates = useCallback(async () => {
    try {
      const data = await fetchRates({ noStore: true });
      if (!data || !data.fiat) throw new Error("Malformed rates payload");
      setRates({ ...FALLBACK_RATES, ...data.fiat });
      setRateStatus(data.warnings?.length ? "fallback" : "live");
    } catch {
      setRates(FALLBACK_RATES);
      setRateStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  function handlePairChange(nextId) {
    setPairId(nextId);
    const nextPair = getTradablePair(nextId) || TRADABLE_PAIRS[0];
    setPipSize(getDefaultPipSize(nextPair.instrumentType));
  }

  const result = useMemo(
    () =>
      calculateTradeExecution({
        pairId: pair.id,
        lots,
        direction,
        entry,
        takeProfit,
        stopLoss,
        pipSize,
        rates,
        accountBalance,
        leverage,
      }),
    [pair.id, lots, direction, entry, takeProfit, stopLoss, pipSize, rates, accountBalance, leverage]
  );

  const statusCopy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates", dot: "bg-emerald-500" },
    fallback: { text: "Fallback rates", dot: "bg-amber-500" },
    error: { text: "Rates unavailable — using fallback", dot: "bg-rose-500" },
  }[rateStatus];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-black/20 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-50">All-in-One Trade Execution Suite</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Full trade math from one entry: P/L, R:R, pip value, and margin impact.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300">
          <span className={`h-1.5 w-1.5 rounded-full ${statusCopy.dot}`} />
          {statusCopy.text}
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">Pair</span>
          <select
            value={pairId}
            onChange={(e) => handlePairChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PAIR_CATEGORIES.map((cat) => {
              const pairsInCategory = getPairsByCategory(cat.id);
              if (pairsInCategory.length === 0) return null;
              return (
                <optgroup key={cat.id} label={cat.label}>
                  {pairsInCategory.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">
            Lot Size <span className="text-slate-500">(custom, e.g. 0.18)</span>
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">Order Type</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection("buy")}
              aria-pressed={direction === "buy"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                direction === "buy"
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setDirection("sell")}
              aria-pressed={direction === "sell"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                direction === "sell"
                  ? "border-rose-500/60 bg-rose-500/15 text-rose-300"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Sell
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">Entry Price</span>
          <input
            type="number"
            step="any"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">Take Profit Price</span>
          <input
            type="number"
            step="any"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">Stop Loss Price</span>
          <input
            type="number"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        {hasSelectablePipSize && (
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="mb-1 block text-xs font-semibold text-slate-400">
              Pip / Tick Size — brokers vary for {pair.label}
            </span>
            <div className="flex gap-2">
              {pipSizeOptions.map((size) => {
                const active = pipSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPipSize(size)}
                    aria-pressed={active}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "border-blue-500 bg-blue-500/15 text-blue-300"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">
            Account Balance (USD) <span className="text-slate-500">— for margin</span>
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">
            Leverage <span className="text-slate-500">— for margin</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-400">1:</span>
            <input
              type="number"
              min="1"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </label>
      </div>

      {/* Dynamic visual output dashboard */}
      <div className="border-t border-slate-800 bg-black/20 p-5">
        {result ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Potential Profit */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center shadow-[0_0_20px_-6px_rgba(16,185,129,0.5)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                  Potential Profit
                </p>
                <p className="mt-1 text-xl font-extrabold text-emerald-300">
                  {Number.isFinite(result.profitUsd) ? `$${formatNumber(result.profitUsd)}` : "—"}
                </p>
                <p className="mt-0.5 text-xs text-emerald-400/80">
                  {formatNumber(result.profitPips, 1)} pips
                </p>
              </div>

              {/* Potential Loss */}
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-center shadow-[0_0_20px_-6px_rgba(244,63,94,0.5)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-rose-300">
                  Potential Loss
                </p>
                <p className="mt-1 text-xl font-extrabold text-rose-300">
                  {Number.isFinite(result.lossUsd) ? `$${formatNumber(result.lossUsd)}` : "—"}
                </p>
                <p className="mt-0.5 text-xs text-rose-400/80">
                  {formatNumber(result.lossPips, 1)} pips
                </p>
              </div>

              {/* Risk:Reward */}
              <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-center shadow-[0_0_20px_-6px_rgba(59,130,246,0.5)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-blue-300">
                  Risk : Reward
                </p>
                <p className="mt-1 text-xl font-extrabold text-blue-300">{result.ratioLabel}</p>
                <p className="mt-0.5 text-xs text-blue-400/80">
                  {result.isLong ? "Long" : "Short"} position
                </p>
              </div>

              {/* Pip Value */}
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Pip Value
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-100">
                  {Number.isFinite(result.pipValueUsd) ? `$${formatNumber(result.pipValueUsd)}` : "—"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {Number.isFinite(result.pipValuePkr) ? `≈ Rs ${formatNumber(result.pipValuePkr)}` : "—"}
                </p>
              </div>
            </div>

            {/* Margin impact */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Required Margin
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-100">
                  {Number.isFinite(result.requiredMargin) ? `$${formatNumber(result.requiredMargin)}` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Free Margin After Entry
                </p>
                <p
                  className={`mt-1 text-lg font-extrabold ${
                    result.isOverLeveraged ? "text-rose-400" : "text-slate-100"
                  }`}
                >
                  {Number.isFinite(result.freeMargin) ? `$${formatNumber(result.freeMargin)}` : "—"}
                </p>
              </div>
            </div>

            {!result.directionConsistent && (
              <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
                Heads up: your Take Profit / Stop Loss levels look inconsistent with a{" "}
                {result.isLong ? "Buy" : "Sell"} order — double-check that TP and SL are on the
                correct sides of your entry price.
              </p>
            )}
            {result.isOverLeveraged && (
              <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
                This position&apos;s required margin exceeds your account balance at this
                leverage — free margin is negative.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Enter a valid pair, lot size, entry, take profit, and stop loss above to see your full
            trade breakdown.
          </p>
        )}
        <p className="mt-3 text-[11px] text-slate-500">
          Margin is an estimate (notional ÷ leverage) — your broker&apos;s actual rules may vary.
          For informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
