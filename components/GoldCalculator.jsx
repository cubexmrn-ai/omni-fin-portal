"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  WEIGHT_UNIT_LABELS,
  KARAT_PURITY,
  calculateGoldPrice,
  calculateFlatUnitPrice,
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

// Six selectable assets. `kind: "metal"` reads its live price from
// data.metals[code] (USD per troy ounce) and supports the weight-unit
// dropdown — plus karat purity, but only for gold, since "karat" is a
// gold jewelry-purity concept that doesn't apply to the others. `kind:
// "commodity"` (crude oil) reads from data.commodities[code] instead —
// it's priced per barrel, not by weight, so it skips the weight-unit/
// karat UI entirely rather than forcing a "price per tola of oil"
// result that wouldn't mean anything (see lib/commodities.js).
const ASSET_OPTIONS = [
  { code: "XAU", label: "Gold (XAU)", kind: "metal" },
  { code: "XAG", label: "Silver (XAG)", kind: "metal" },
  { code: "XPT", label: "Platinum (XPT)", kind: "metal" },
  { code: "XPD", label: "Palladium (XPD)", kind: "metal" },
  { code: "XCU", label: "Copper (XCU)", kind: "metal" },
  { code: "WTI", label: "Crude Oil (WTI)", kind: "commodity" },
];

const ASSET_BY_CODE = ASSET_OPTIONS.reduce((acc, a) => {
  acc[a.code] = a;
  return acc;
}, {});

// Approximate placeholder spot prices shown before the first live fetch
// resolves — mirrors lib/metals.js's fallbackUsdPerOunce / lib/
// commodities.js's fallbackUsdPerBarrel. Duplicated here (rather than
// imported) because this is a client UI file with its own small
// FALLBACK_RATES copy below for the same reason — it never needs the
// full server-side asset registries, just these display defaults.
const DEFAULT_BASE_PRICE_BY_ASSET = {
  XAU: 2650,
  XAG: 31,
  XPT: 980,
  XPD: 1020,
  XCU: 0.31,
  WTI: 75,
};

// Subset of WEIGHT_UNITS exposed in this calculator's UI, in display
// order. Only used for `kind: "metal"` assets (see ASSET_OPTIONS above).
const UNIT_OPTIONS = ["troy_ounce", "gram", "tola", "kilogram"];

// Subset of KARAT_PURITY exposed in this calculator's UI. Only shown
// when the selected asset is gold (XAU) — see ASSET_OPTIONS above.
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
  const [assetCode, setAssetCode] = useState("XAU");
  const [baseUsdPrice, setBaseUsdPrice] = useState(DEFAULT_BASE_PRICE_BY_ASSET.XAU);
  const [baseTouched, setBaseTouched] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("PKR");
  const [unitCode, setUnitCode] = useState("tola");
  const [karatCode, setKaratCode] = useState("24K");
  const [quantity, setQuantity] = useState(1);

  const [rates, setRates] = useState(FALLBACK_RATES);
  const [assetRates, setAssetRates] = useState(DEFAULT_BASE_PRICE_BY_ASSET);
  const [commodityNote, setCommodityNote] = useState(null);
  const [rateStatus, setRateStatus] = useState("loading"); // loading | live | fallback | error
  const [fetchedAt, setFetchedAt] = useState(null);

  const selectedAsset = ASSET_BY_CODE[assetCode] || ASSET_OPTIONS[0];

  // Mirrors `baseTouched` / `assetCode` in refs so loadRates() and the
  // asset-switch handler always read the latest value synchronously,
  // instead of a value captured in a stale closure from whenever
  // loadRates was last created (loadRates is a useCallback with an
  // empty dependency array — same established pattern as before this
  // component supported more than one asset).
  const baseTouchedRef = useRef(baseTouched);
  useEffect(() => {
    baseTouchedRef.current = baseTouched;
  }, [baseTouched]);

  const assetCodeRef = useRef(assetCode);
  useEffect(() => {
    assetCodeRef.current = assetCode;
  }, [assetCode]);

  const assetRatesRef = useRef(assetRates);
  useEffect(() => {
    assetRatesRef.current = assetRates;
  }, [assetRates]);

  const loadRates = useCallback(async () => {
    setRateStatus((prev) => (prev === "live" ? "live" : "loading"));
    try {
      // /api/rates returns a unified { fiat, crypto, metals, commodities }
      // payload (see app/api/rates/route.js). `metals` covers gold,
      // silver, platinum, palladium and copper (all USD per troy ounce);
      // `commodities` covers crude oil (USD per barrel) separately,
      // since it isn't priced by weight — merged here into one
      // code-keyed map so the rest of this component can read any
      // selected asset's live price the same way.
      const data = await fetchRates({ noStore: true });
      if (!data || !data.fiat) throw new Error("Malformed rates payload");

      const mergedAssetRates = {
        ...DEFAULT_BASE_PRICE_BY_ASSET,
        ...(data.metals || {}),
        ...(data.commodities || {}),
      };

      setRates({ ...FALLBACK_RATES, ...data.fiat });
      setAssetRates(mergedAssetRates);
      setCommodityNote(data.commodityNote || null);
      setFetchedAt(data.fetchedAt || new Date().toISOString());
      setRateStatus(data.warnings?.length ? "fallback" : "live");

      // Auto-fill the base price from the live spot price of whichever
      // asset is CURRENTLY selected, but only if the user hasn't typed
      // their own value yet — this never overwrites a manual edit.
      const liveBase = mergedAssetRates[assetCodeRef.current];
      if (!baseTouchedRef.current && Number.isFinite(liveBase)) {
        setBaseUsdPrice(liveBase);
      }
    } catch (err) {
      setRates(FALLBACK_RATES);
      setFetchedAt(new Date().toISOString());
      setRateStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
    // Keep rates fresh client-side too, matching the 1-hour server cache.
    const interval = setInterval(loadRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRates]);

  // Switching assets always re-syncs the base price to the NEW asset's
  // live spot price (if available) and clears any manual edit on the
  // PREVIOUS asset — a price typed in for gold has no meaning once
  // silver is selected, so carrying it over would just be confusing.
  // This mirrors the "Refresh rates" button's reset-then-reload pattern
  // below, applied to an asset switch instead of a network refetch.
  function handleAssetChange(nextCode) {
    setAssetCode(nextCode);
    assetCodeRef.current = nextCode;
    setBaseTouched(false);
    baseTouchedRef.current = false;

    const liveBase = assetRatesRef.current[nextCode];
    setBaseUsdPrice(
      Number.isFinite(liveBase) ? liveBase : DEFAULT_BASE_PRICE_BY_ASSET[nextCode] ?? 0
    );
  }

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const exchangeRate = rates[currencyCode] ?? FALLBACK_RATES[currencyCode];
  const isCommodity = selectedAsset.kind === "commodity";
  const isGold = assetCode === "XAU";

  const result = useMemo(() => {
    const parsedBase = Number(baseUsdPrice);
    const parsedQty = Number(quantity);
    const safeQty = Number.isFinite(parsedQty) ? parsedQty : 0;
    const safeBase = Number.isFinite(parsedBase) ? parsedBase : 0;
    const safeFx = Number.isFinite(exchangeRate) ? exchangeRate : 0;

    // Crude oil has no weight unit or karat — it's a flat USD-per-barrel
    // conversion. Every other asset goes through the same weight-unit +
    // purity math gold always used (purity is simply 1.0/full for
    // anything other than gold, via karatCode's default below).
    const perUnit = isCommodity
      ? calculateFlatUnitPrice(safeBase, safeFx)
      : calculateGoldPrice(safeBase, safeFx, unitCode, isGold ? karatCode : "24K");

    const totalRaw = perUnit.rawPrice * safeQty;

    return {
      pricePerUnitLocal: perUnit.rawPrice,
      pricePerUnitFormatted: perUnit.formattedPrice,
      usdEquivalent: perUnit.usdEquivalent,
      totalLocal: totalRaw,
    };
  }, [baseUsdPrice, exchangeRate, unitCode, karatCode, quantity, isCommodity, isGold]);

  const statusCopy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates connected", dot: "bg-emerald-500" },
    fallback: { text: "Using fallback rates", dot: "bg-amber-500" },
    error: { text: "Live rates unavailable — using fallback", dot: "bg-rose-500" },
  }[rateStatus];

  const unitLabel = isCommodity ? "Barrel" : WEIGHT_UNIT_LABELS[unitCode]?.split(" (")[0];
  const basePriceLabel = isCommodity
    ? `Base ${selectedAsset.label} Price (USD / barrel)`
    : `Base ${selectedAsset.label} Price (USD / troy oz${isGold ? ", 24K" : ""})`;

  return (
    <section
      id="metals-calculator"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {/* Card header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-gold-50 via-white to-brand-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Metals &amp; Commodities Calculator
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Convert a live spot price into any supported currency,
              weight unit and purity — gold, silver, platinum, palladium,
              copper or crude oil.
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
                htmlFor="asset-select"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Metal / Commodity
              </label>
              <select
                id="asset-select"
                value={assetCode}
                onChange={(e) => handleAssetChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {ASSET_OPTIONS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </select>
              {isCommodity && commodityNote && (
                <p className="mt-1.5 text-xs text-amber-600">{commodityNote}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="base-usd-price"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                {basePriceLabel}
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
                  onChange={(e) => {
                    setBaseTouched(true);
                    setBaseUsdPrice(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-7 pr-3 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder={String(DEFAULT_BASE_PRICE_BY_ASSET[assetCode] ?? "")}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {baseTouched
                  ? "Edited manually — refresh rates to reset to the live spot price."
                  : `Auto-filled from the live ${selectedAsset.label} spot price; edit to override.`}
              </p>
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

              {!isCommodity && (
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
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isGold && (
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
              )}

              <div>
                <label
                  htmlFor="quantity-input"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Quantity ({unitLabel}
                  {isCommodity ? "s" : ""})
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
              onClick={() => {
                // An explicit refresh is treated as "go back to live":
                // it resets the manual-edit flag so the base price
                // re-syncs to the current spot price for whichever
                // asset is selected. The ref is set directly (not just
                // the state) so loadRates sees it immediately rather
                // than waiting on React's commit + effect cycle to sync
                // the ref from state.
                baseTouchedRef.current = false;
                setBaseTouched(false);
                loadRates();
              }}
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
                {isCommodity
                  ? `${selectedAsset.label} price per barrel`
                  : `${isGold ? `${karatCode} ` : ""}${selectedAsset.label} price per ${unitLabel?.toLowerCase()}`}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {selectedCurrency.symbol} {result.pricePerUnitFormatted}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                ≈ ${result.usdEquivalent} USD
              </p>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  Total for {quantity || 0} {unitLabel?.toLowerCase()}
                  {isCommodity ? "s" : "(s)"}
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
