"use client";

// components/calculators/PipValueCustomCalculator.jsx
//
// "Pip Value & Custom Trade Math" tab of the Trading Calculator
// Terminal (components/calculators/TradingTerminal.jsx) — the same
// pair registry and live-rate conversion as
// components/calculators/PipValueCalculator.jsx, but with a free-form
// decimal Lot Size input (e.g. 0.18 lots) instead of the fixed
// Standard/Mini/Micro preset buttons, via
// lib/tradingCalculators.js's calculatePipValueForLots().

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TRADABLE_PAIRS,
  PAIR_CATEGORIES,
  PIP_SIZE_OPTIONS,
  getTradablePair,
  getPairsByCategory,
  getDefaultPipSize,
  calculatePipValueForLots,
} from "@/lib/tradingCalculators";
import { fetchRates } from "@/lib/fetchRates";
import { FALLBACK_RATES } from "@/lib/currencies";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const PIP_NOUN = {
  forex: "pip",
  "forex-jpy": "pip",
  "forex-pkr": "pip",
  metal: "pip",
  energy: "pip",
  index: "point",
  crypto: "tick",
};

function formatNumber(value, decimals = 4) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 2 });
}

export default function PipValueCustomCalculator() {
  const [pairId, setPairId] = useState("EURUSD");
  const [lots, setLots] = useState(0.18);
  const [pipSize, setPipSize] = useState(getDefaultPipSize("forex"));
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
    () => calculatePipValueForLots({ pairId: pair.id, lots, pipSize, rates }),
    [pair.id, lots, pipSize, rates]
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
          <h3 className="text-sm font-bold text-slate-50">Pip Value &amp; Custom Trade Math</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Any decimal lot size — not just Standard/Mini/Micro presets.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300">
          <span className={`h-1.5 w-1.5 rounded-full ${statusCopy.dot}`} />
          {statusCopy.text}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-400">Pair / Instrument</span>
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

        {hasSelectablePipSize ? (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-400">
              {PIP_NOUN[pair.instrumentType] === "point" ? "Point" : "Pip / Tick"} Size — brokers
              vary for {pair.label}
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
        ) : (
          <p className="text-xs text-slate-500 sm:col-span-2">
            {PIP_NOUN[pair.instrumentType] || "Pip"} size for {pair.label} is auto-detected at{" "}
            {pipSizeOptions[0]}.
          </p>
        )}
      </div>

      <div className="border-t border-slate-800 bg-black/20 px-5 py-4">
        {result ? (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <p>
              <span className="text-slate-400">
                1 {PIP_NOUN[pair.instrumentType] || "pip"} ({formatNumber(result.lots, 2)} lots) ={" "}
              </span>
              <span className="font-bold text-slate-100">
                {formatNumber(result.pipValueQuote, 2)} {pair.quote}
              </span>
            </p>
            <p>
              <span className="text-slate-400">≈ </span>
              <span className="font-bold text-emerald-300">
                {Number.isFinite(result.pipValueUsd) ? `$${formatNumber(result.pipValueUsd)}` : "—"} USD
              </span>
            </p>
            <p>
              <span className="text-slate-400">≈ </span>
              <span className="font-bold text-emerald-300">
                {Number.isFinite(result.pipValuePkr) ? `Rs ${formatNumber(result.pipValuePkr, 2)}` : "—"} PKR
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Enter a valid pair and lot size above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-500">For informational purposes only, not financial advice.</p>
      </div>
    </div>
  );
}
