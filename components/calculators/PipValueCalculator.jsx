"use client";

// components/calculators/PipValueCalculator.jsx
//
// Pip Value Calculator — a real, named tradable pair grouped by asset
// class (Forex / Commodities & Metals / Indices / Crypto, rendered as
// <optgroup>s — not a bare quote-currency dropdown) and a lot/contract
// size in; pip (or tick/point) value in USD and PKR out. Precision is
// auto-detected from the selected pair's instrument type
// (lib/tradingCalculators.js's TRADABLE_PAIRS / PIP_SIZE_OPTIONS):
// 0.0001 for standard FX, 0.01 for JPY and PKR-quoted pairs, a
// selectable 0.01-or-0.1 for metals/energy, a selectable 0.1-or-1 for
// indices, and a single $1 illustrative tick for crypto — every one of
// these conventions genuinely varies by broker except plain FX, so
// nothing beyond FX is silently assumed. Quote-currency conversion to
// USD/PKR is driven live from /api/rates via fetchRates — the same
// pattern GoldCalculator.jsx uses — so switching pairs recalculates
// against the current live rate, with a visible live/fallback status
// dot and a safe fallback-rate table (lib/currencies.js) if the live
// fetch fails; this never blocks static prerendering (/calculators and
// any /converters/[pair] page embedding this as a mini-widget) because
// every value synthesized above is a plain finite number or a fixed
// default, so lib/formatNumber.js's formatNumber() below never sees a
// NaN/undefined or an invalid fraction-digit combination to throw on
// (see that file's header comment for the RangeError this previously
// caused during SSG).

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  TRADABLE_PAIRS,
  PAIR_CATEGORIES,
  CONTRACT_SIZES,
  PIP_SIZE_OPTIONS,
  getTradablePair,
  getPairsByCategory,
  getDefaultPipSize,
  calculatePipValue,
} from "@/lib/tradingCalculators";
import { fetchRates } from "@/lib/fetchRates";
import { FALLBACK_RATES } from "@/lib/currencies";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const LOT_LABELS = {
  standard: "Standard",
  mini: "Mini",
  micro: "Micro",
};

// Unit noun shown next to each contract-size option, by instrument
// type — "units" for forex (all three variants), "oz" for metals,
// "barrels" for energy, "contracts" for indices. Crypto isn't in this
// map because its noun is the pair's own base asset (BTC, ETH, …),
// resolved dynamically where it's used below.
const CONTRACT_UNIT_LABEL = {
  forex: "units",
  "forex-jpy": "units",
  "forex-pkr": "units",
  metal: "oz",
  energy: "barrels",
  index: "contracts",
};

// What to call the smallest price increment, by instrument type — a
// real "pip" for forex/metals/energy, a "point" for indices (the
// conventional term for index CFDs), and an explicitly-labeled "tick"
// for crypto, which has no industry-standard term at all.
const PIP_NOUN = {
  forex: "pip",
  "forex-jpy": "pip",
  "forex-pkr": "pip",
  metal: "pip",
  energy: "pip",
  index: "point",
  crypto: "tick",
};

// Thin wrapper kept so call sites below can keep passing a single
// `decimals` number (this file's own convention) while the actual
// clamping/NaN-safety lives once in lib/formatNumber.js. Previously
// this hardcoded `minimumFractionDigits: 2` directly, which threw a
// RangeError whenever a caller (see formatContractSize below) passed
// `decimals` below 2 — see lib/formatNumber.js's header comment for
// the full story.
function formatNumber(value, decimals = 4) {
  return formatNumberSafe(value, { maximumFractionDigits: decimals, minimumFractionDigits: 2 });
}

function formatContractSize(units) {
  // Contract sizes span from 100,000 (forex) down to 0.01 (micro BTC),
  // so a single fixed decimal count would either truncate the small
  // ones or add noise to the large ones. The `units >= 1` branch
  // passes decimals=0 — below formatNumber's own minimumFractionDigits
  // of 2 — which is exactly the combination lib/formatNumber.js now
  // clamps safely instead of throwing.
  return units >= 1 ? formatNumber(units, 0) : formatNumber(units, 2);
}

export default function PipValueCalculator() {
  const [pairId, setPairId] = useState("EURUSD");
  const [lotType, setLotType] = useState("standard");
  const [pipSize, setPipSize] = useState(getDefaultPipSize("forex"));
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [rateStatus, setRateStatus] = useState("loading"); // loading | live | fallback | error
  // AUDIT FIX: GoldCalculator.jsx and CurrencyConverter.jsx both already
  // show a "fetched at HH:MM" timestamp next to their live-rate status
  // dot; this calculator had the same status dot but no timestamp, so
  // its first frame (FALLBACK_RATES) and a genuinely live frame looked
  // identical except for the dot's color. Matches the same pattern now.
  const [fetchedAt, setFetchedAt] = useState(null);

  const pair = getTradablePair(pairId) || TRADABLE_PAIRS[0];
  const contractSizes = CONTRACT_SIZES[pair.instrumentType] || CONTRACT_SIZES.forex;
  const pipSizeOptions = PIP_SIZE_OPTIONS[pair.instrumentType] || PIP_SIZE_OPTIONS.forex;
  const hasSelectablePipSize = pipSizeOptions.length > 1;

  const loadRates = useCallback(async () => {
    try {
      const data = await fetchRates({ noStore: true });
      if (!data || !data.fiat) throw new Error("Malformed rates payload");
      setRates({ ...FALLBACK_RATES, ...data.fiat });
      setFetchedAt(data.fetchedAt || new Date().toISOString());
      setRateStatus(data.warnings?.length ? "fallback" : "live");
    } catch {
      setRates(FALLBACK_RATES);
      setFetchedAt(new Date().toISOString());
      setRateStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  // Switching pairs always re-syncs pip size to the NEW instrument
  // type's default (clearing any manual gold 0.01/0.1 selection from
  // the PREVIOUS pair) — a pip size chosen for gold has no meaning
  // once a plain forex pair is selected. Mirrors the asset-switch
  // reset pattern already used in GoldCalculator.jsx.
  function handlePairChange(nextId) {
    setPairId(nextId);
    const nextPair = getTradablePair(nextId) || TRADABLE_PAIRS[0];
    setPipSize(getDefaultPipSize(nextPair.instrumentType));
  }

  const result = useMemo(
    () => calculatePipValue({ pairId: pair.id, lotType, pipSize, rates }),
    [pair.id, lotType, pipSize, rates]
  );

  const statusCopy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates", dot: "bg-emerald-500" },
    fallback: { text: "Fallback rates", dot: "bg-amber-500" },
    error: { text: "Rates unavailable — using fallback", dot: "bg-rose-500" },
  }[rateStatus];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Pip Value Calculator</h3>
          <p className="mt-0.5 text-xs text-slate-500">Pip Size × Contract Size, converted live to USD/PKR</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${statusCopy.dot}`} />
            {statusCopy.text}
          </span>
          {fetchedAt && (
            <span className="text-[10px] text-slate-400" title={fetchedAt}>
              {new Date(fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Pair / Instrument</span>
          <select
            value={pairId}
            onChange={(e) => handlePairChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
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
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            {pair.instrumentType === "index" || pair.instrumentType === "crypto"
              ? "Contract Size (this calculator's own scale, not an exchange standard)"
              : "Lot Size"}
          </span>
          <select
            value={lotType}
            onChange={(e) => setLotType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {Object.keys(contractSizes).map((key) => (
              <option key={key} value={key}>
                {LOT_LABELS[key]} ({formatContractSize(contractSizes[key])}{" "}
                {pair.instrumentType === "crypto" ? pair.base : CONTRACT_UNIT_LABEL[pair.instrumentType] || "units"})
              </option>
            ))}
          </select>
        </label>

        {hasSelectablePipSize ? (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              {PIP_NOUN[pair.instrumentType] === "point" ? "Point" : "Pip / Tick"} Size — brokers vary for{" "}
              {pair.label}
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
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </label>
        ) : (
          <p className="text-xs text-slate-400 sm:col-span-2">
            {PIP_NOUN[pair.instrumentType] || "Pip"} size for {pair.label} is auto-detected at {pipSizeOptions[0]}.
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        {result ? (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <p>
              <span className="text-slate-500">1 {PIP_NOUN[pair.instrumentType] || "pip"} = </span>
              <span className="font-bold text-slate-900">
                {formatNumber(result.pipValueQuote, 2)} {pair.quote}
              </span>
            </p>
            <p>
              <span className="text-slate-500">≈ </span>
              <span className="font-bold text-brand-700">
                {Number.isFinite(result.pipValueUsd) ? `$${formatNumber(result.pipValueUsd)}` : "—"} USD
              </span>
            </p>
            <p>
              <span className="text-slate-500">≈ </span>
              <span className="font-bold text-brand-700">
                {Number.isFinite(result.pipValuePkr) ? `Rs ${formatNumber(result.pipValuePkr, 2)}` : "—"} PKR
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Select a pair and lot size above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          {pair.instrumentType === "forex-jpy" && "JPY pairs: 1 pip = the 2nd decimal place (0.01), not the usual 4th. "}
          {pair.instrumentType === "forex-pkr" && "PKR pairs: 1 pip = the 2nd decimal place (0.01), reflecting PKR's larger nominal value, not the usual 4th. "}
          {pair.instrumentType === "metal" && "Pip/tick size varies by broker — both 0.01 and 0.10 are in genuine use, so pick the one that matches yours. "}
          {pair.instrumentType === "energy" && "Oil pip/tick size varies by broker — both 0.01 and 0.10 are in genuine use, so pick the one that matches yours. "}
          {pair.instrumentType === "index" && "Index point size varies by broker — both 0.1 and 1.0 point ticks are in genuine use, so pick the one that matches yours. Contract size shown is this calculator's own illustrative scale, not an exchange standard. "}
          {pair.instrumentType === "crypto" && "Crypto has no industry-standard \"pip\" — this treats a $1 move as the smallest tick for illustration only, and the contract size shown is this calculator's own scale, not an exchange standard. "}
          For informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
