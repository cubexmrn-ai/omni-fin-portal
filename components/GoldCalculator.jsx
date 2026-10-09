"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  WEIGHT_UNIT_LABELS,
  KARAT_PURITY,
  calculateGoldPrice,
} from "@/lib/conversionMath";
import { fetchRates } from "@/lib/fetchRates";

// ---------------------------------------------------------------------------
// Static reference data (UI-level — the math itself lives in lib/conversionMath.js)
// ---------------------------------------------------------------------------

const CURRENCIES = [
  { code: "PKR", label: "Pakistani Rupee", symbol: "Rs" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
];

// Subset of WEIGHT_UNITS exposed in this calculator's UI, in display order.
const UNIT_OPTIONS = ["troy_ounce", "gram", "tola"];

// Subset of KARAT_PURITY exposed in this calculator's UI.
const KARAT_OPTIONS = ["24K", "22K"];

const FALLBACK_RATES = {
  USD: 1,
  PKR: 278.5,
  AUD: 1.52,
  EUR: 0.92,
  INR: 83.9,
  AED: 3.6725,
  NGN: 1550,
};

const DEFAULT_BASE_USD_PRICE = 2650; // Approx. USD per troy ounce, 24K spot.

function formatNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "—";

  // Guard against Intl.NumberFormat's RangeError when a future call site
  // passes fewer than 2 max digits (minimumFractionDigits was hardcoded
  // to 2 here, which throws if maximumFractionDigits is ever lower —
  // see the identical, previously-crashing pattern fixed in
  // CurrencyConverter.jsx's formatAmount).
  const safeMax = Number.isFinite(maximumFractionDigits)
    ? Math.max(0, Math.min(100, maximumFractionDigits))
    : 2;
  const minimumFractionDigits = Math.min(2, safeMax);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: safeMax,
    minimumFractionDigits,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GoldCalculator() {
  const [baseUsdPrice, setBaseUsdPrice] = useState(DEFAULT_BASE_USD_PRICE);
  const [currencyCode, setCurrencyCode] = useState("PKR");
  const [unitCode, setUnitCode] = useState("tola");
  const [karatCode, setKaratCode] = useState("24K");
  const [quantity, setQuantity] = useState(1);

  const [rates, setRates] = useState(FALLBACK_RATES);
  const [rateStatus, setRateStatus] = useState("loading"); // loading | live | fallback | error
  const [fetchedAt, setFetchedAt] = useState(null);

  const loadRates = useCallback(async () => {
    setRateStatus((prev) => (prev === "live" ? "live" : "loading"));
    try {
      const data = await fetchRates({ noStore: true });
      if (!data || !data.rates) throw new Error("Malformed rates payload");

      setRates({ ...FALLBACK_RATES, ...data.rates });
      setFetchedAt(data.fetchedAt || new Date().toISOString());
      setRateStatus(data.warning ? "fallback" : "live");
    } catch (err) {
      setRates(FALLBACK_RATES);
      setFetchedAt(new Date().toISOString());
      setRateStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
    // Keep rates fresh client-side too, matching the 15 min server cache.
    const interval = setInterval(loadRates, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRates]);

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const exchangeRate = rates[currencyCode] ?? FALLBACK_RATES[currencyCode];

  const result = useMemo(() => {
    const parsedBase = Number(baseUsdPrice);
    const parsedQty = Number(quantity);
    const safeQty = Number.isFinite(parsedQty) ? parsedQty : 0;

    const perUnit = calculateGoldPrice(
      Number.isFinite(parsedBase) ? parsedBase : 0,
      Number.isFinite(exchangeRate) ? exchangeRate : 0,
      unitCode,
      karatCode
    );

    const totalRaw = perUnit.rawPrice * safeQty;

    return {
      pricePerUnitLocal: perUnit.rawPrice,
      pricePerUnitFormatted: perUnit.formattedPrice,
      usdEquivalent: perUnit.usdEquivalent,
      totalLocal: totalRaw,
    };
  }, [baseUsdPrice, exchangeRate, unitCode, karatCode, quantity]);

  const statusCopy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates connected", dot: "bg-emerald-500" },
    fallback: { text: "Using fallback rates", dot: "bg-amber-500" },
    error: { text: "Live rates unavailable — using fallback", dot: "bg-rose-500" },
  }[rateStatus];

  return (
    <section
      id="gold-calculator"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {/* Card header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-gold-50 via-white to-brand-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Universal Currency &amp; Gold Rate Calculator
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Convert a USD gold spot price into any supported currency,
              weight unit and karat purity.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
            <span className={`h-2 w-2 rounded-full ${statusCopy.dot}`} />
            {statusCopy.text}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 px-6 py-6 lg:grid-cols-5">
          {/* Inputs */}
          <div className="space-y-5 lg:col-span-3">
            <div>
              <label
                htmlFor="base-usd-price"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Base Gold Price (USD / troy oz, 24K)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
                  $
                </span>
                <input
                  id="base-usd-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={baseUsdPrice}
                  onChange={(e) => setBaseUsdPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-7 pr-3 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="2650.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="currency-select"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Local Currency
                </label>
                <select
                  id="currency-select"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="unit-select"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Weight Unit
                </label>
                <select
                  id="unit-select"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {UNIT_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {WEIGHT_UNIT_LABELS[code]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Karat
                </span>
                <div className="flex gap-2">
                  {KARAT_OPTIONS.map((code) => {
                    const active = karatCode === code;
                    const purityPct = Math.round(KARAT_PURITY[code] * 1000) / 10;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setKaratCode(code)}
                        aria-pressed={active}
                        className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                          active
                            ? "border-gold-500 bg-gold-50 text-gold-800"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        title={`${code} (${purityPct}% pure)`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="quantity-input"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Quantity ({WEIGHT_UNIT_LABELS[unitCode]?.split(" (")[0]})
                </label>
                <input
                  id="quantity-input"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="1"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={loadRates}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 4V9H4.582M20 20V15H19.419M4.582 9C5.94 5.5 9.26 3 13.17 3C17.76 3 21.5 6.58 21.86 11.09M19.419 15C18.06 18.5 14.74 21 10.83 21C6.24 21 2.5 17.42 2.14 12.91"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Refresh rates
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Result
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {karatCode} price per {WEIGHT_UNIT_LABELS[unitCode]?.split(" (")[0].toLowerCase()}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {selectedCurrency.symbol} {result.pricePerUnitFormatted}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                ≈ ${result.usdEquivalent} USD
              </p>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  Total for {quantity || 0} {unitCode.replace("_", " ")}(s)
                </p>
                <p className="mt-1 text-2xl font-extrabold text-brand-700">
                  {selectedCurrency.symbol} {formatNumber(result.totalLocal)}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                <span>
                  1 USD = {formatNumber(exchangeRate, 4)} {currencyCode}
                </span>
                {fetchedAt && (
                  <span title={fetchedAt}>
                    {new Date(fetchedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
