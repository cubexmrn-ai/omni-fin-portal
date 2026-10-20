"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchRates } from "@/lib/fetchRates";
import {
  getAssetMeta,
  getPairRate,
  convertBetweenAssets,
  buildUnifiedAssetList,
} from "@/lib/assetConversion";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";
import { trackEvent } from "@/lib/gtag";

const MATRIX_MULTIPLIERS = [1, 10, 100, 1000];

const ASSET_CLASS_LABELS = {
  fiat: "Fiat Currencies",
  crypto: "Cryptocurrencies",
  metals: "Precious Metals",
};

const UNIFIED_ASSETS = buildUnifiedAssetList();

// Delegates to lib/formatNumber.js, which now owns the clamp this
// function used to do by hand (see that file's header comment) — a
// call site asking for fewer than 2 max digits (e.g. formatAmount
// (multiplier, 0) in the rate matrix below) is clamped safely instead
// of throwing a RangeError.
function formatAmount(value, maximumFractionDigits = 2) {
  return formatNumberSafe(value, { maximumFractionDigits, minimumFractionDigits: 2, locale: "en-US" });
}

/**
 * Picks sensible decimal precision for a converted amount so very
 * cheap assets (e.g. DOGE, NGN) and very expensive ones (e.g. BTC, XAU)
 * both read naturally instead of showing "0.00" or needless zeros.
 */
function precisionFor(assetClass, value) {
  if (assetClass === "crypto") {
    if (!Number.isFinite(value)) return 2;
    if (Math.abs(value) < 1) return 6;
    if (Math.abs(value) < 100) return 4;
    return 2;
  }
  return 2;
}

function assetKey(assetClass, code) {
  return `${assetClass}:${code}`;
}

/**
 * Searchable, grouped asset picker spanning Fiat / Crypto / Metals. A
 * plain <select> can't be filtered by typing a query or show section
 * headers, so this renders a text input + grouped dropdown instead,
 * while staying a controlled component driven by value/onChange.
 */
function AssetSelect({ id, label, assetClass, code, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selected = getAssetMeta(assetClass, code);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupedFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = { fiat: [], crypto: [], metals: [] };

    for (const asset of UNIFIED_ASSETS) {
      if (q) {
        const matches =
          asset.code.toLowerCase().includes(q) ||
          asset.name.toLowerCase().includes(q);
        if (!matches) continue;
      }
      groups[asset.assetClass].push(asset);
    }

    return groups;
  }, [query]);

  function handleSelect(nextClass, nextCode) {
    // Analytics: only counts as a "rate search" if the person actually
    // typed something before picking a result — opening the dropdown
    // and clicking the first/default entry isn't a search.
    if (query.trim()) {
      trackEvent("search_rate", { search_term: query.trim(), selected_asset: nextCode });
    }
    // Lightweight engagement signal: fires on every dropdown selection,
    // searched or not, so GA4 registers a widget interaction as soon as
    // someone touches the converter — not just on a typed search. Kept
    // separate from search_rate above rather than folded into it, since
    // this is meant to be a cheap, always-on "did they engage" ping,
    // not a search-quality metric.
    trackEvent("widget_interaction", { widget: "currency_converter", selected_asset: nextCode });
    onChange(nextClass, nextCode);
    setOpen(false);
    setQuery("");
  }

  const hasAnyResults = Object.values(groupedFiltered).some((g) => g.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true">{selected?.flag}</span>
          <span>
            {selected ? `${selected.code} — ${selected.name}` : "Select asset"}
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-slate-200 bg-white shadow-card-hover">
          <div className="border-b border-slate-100 p-2">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currency, crypto or metal…"
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin" role="listbox">
            {!hasAnyResults && (
              <p className="px-3 py-2 text-sm text-slate-400">
                No assets match &quot;{query}&quot;
              </p>
            )}
            {["fiat", "crypto", "metals"].map((groupClass) => {
              const items = groupedFiltered[groupClass];
              if (!items || items.length === 0) return null;
              return (
                <div key={groupClass}>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {ASSET_CLASS_LABELS[groupClass]}
                  </p>
                  <ul>
                    {items.map((asset) => {
                      const active =
                        asset.assetClass === assetClass && asset.code === code;
                      return (
                        <li
                          key={assetKey(asset.assetClass, asset.code)}
                          role="option"
                          aria-selected={active}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(asset.assetClass, asset.code)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 ${
                              active
                                ? "bg-brand-50 font-semibold text-brand-700"
                                : "text-slate-700"
                            }`}
                          >
                            <span aria-hidden="true">{asset.flag}</span>
                            <span className="font-semibold">{asset.code}</span>
                            <span className="text-slate-400">{asset.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Real 24h trend badge — RETENTION UPGRADE: this used to be a
 * permanent "coming soon" placeholder (no historical rate store
 * existed). It now fetches yesterday's pair rate from
 * /api/rate-history (lib/rateHistory.js: Frankfurter for fiat,
 * CoinGecko for crypto) and compares it against `pairRate`, the exact
 * same live rate already shown above this badge — no second,
 * differently-sourced "today" number.
 *
 * Metals have no free keyless historical source, so that leg of the
 * pair always resolves `available: false` — shown here as an honest
 * "not available for this pair" state, never a fabricated percentage.
 */
function TrendBadge({ fromClass, fromCode, toClass, toCode, pairRate }) {
  const [state, setState] = useState({ status: "loading", pct: null });

  useEffect(() => {
    if (!fromClass || !fromCode || !toClass || !toCode || !Number.isFinite(pairRate)) {
      setState({ status: "unavailable", pct: null });
      return;
    }

    let cancelled = false;
    setState({ status: "loading", pct: null });

    const params = new URLSearchParams({ fromClass, fromCode, toClass, toCode });
    fetch(`/api/rate-history?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.available || !Number.isFinite(data.pairRate) || data.pairRate === 0) {
          setState({ status: "unavailable", pct: null });
          return;
        }
        const pct = ((pairRate - data.pairRate) / data.pairRate) * 100;
        setState({ status: "ready", pct });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unavailable", pct: null });
      });

    return () => {
      cancelled = true;
    };
  }, [fromClass, fromCode, toClass, toCode, pairRate]);

  if (state.status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400">
        24h trend · loading…
      </span>
    );
  }

  if (state.status === "unavailable") {
    return (
      <span
        title="A real 24h change needs a historical rate for both sides of this pair. That's not available yet for this asset combination (most often because one side is a precious metal, which has no free historical price source wired up)."
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-400"
      >
        24h trend · not available for this pair
      </span>
    );
  }

  const pct = state.pct;
  const isUp = pct > 0;
  const isFlat = Math.abs(pct) < 0.005;
  const toneClass = isFlat
    ? "border-slate-200 bg-slate-50 text-slate-500"
    : isUp
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <span
      title={`1 ${fromCode} = ${toCode} rate vs. this time yesterday (yesterday's rate from a free historical FX/crypto provider).`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={isUp ? "" : "rotate-180"}
      >
        <path
          d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {isFlat ? "Flat" : `${isUp ? "+" : ""}${pct.toFixed(2)}%`} · 24h
    </span>
  );
}

/**
 * Phase 2 item 3 — Expat & FX Decision Layer: a one-line actionable
 * volatility note, independent of TrendBadge above (its own fetches
 * to /api/rate-history for the 24h delta and the new
 * /api/fx-volatility for real 30-day historical volatility), so
 * TrendBadge's already-working logic is left untouched. Combines both
 * real, fetched numbers into one plain-English read — never a new
 * invented statistic.
 *
 * Deliberately rule-based (stable/near-resistance framing, not a
 * trading signal): "stable + tight volatility" suggests normal
 * day-to-day noise; "material move + wide volatility" suggests this
 * is a genuinely active week for the pair, worth timing around rather
 * than converting on autopilot.
 */
function FxDecisionNote({ fromClass, fromCode, toClass, toCode, pairRate }) {
  const [trend, setTrend] = useState({ status: "loading", pct: null });
  const [vol, setVol] = useState({ status: "loading", pct: null });

  useEffect(() => {
    if (!fromClass || !fromCode || !toClass || !toCode || !Number.isFinite(pairRate)) {
      setTrend({ status: "unavailable", pct: null });
      setVol({ status: "unavailable", pct: null });
      return;
    }

    let cancelled = false;
    setTrend({ status: "loading", pct: null });
    setVol({ status: "loading", pct: null });

    const params = new URLSearchParams({ fromClass, fromCode, toClass, toCode });

    fetch(`/api/rate-history?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.available || !Number.isFinite(data.pairRate) || data.pairRate === 0) {
          setTrend({ status: "unavailable", pct: null });
          return;
        }
        setTrend({ status: "ready", pct: ((pairRate - data.pairRate) / data.pairRate) * 100 });
      })
      .catch(() => {
        if (!cancelled) setTrend({ status: "unavailable", pct: null });
      });

    fetch(`/api/fx-volatility?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.available || !Number.isFinite(data.pairVolPct)) {
          setVol({ status: "unavailable", pct: null });
          return;
        }
        setVol({ status: "ready", pct: data.pairVolPct });
      })
      .catch(() => {
        if (!cancelled) setVol({ status: "unavailable", pct: null });
      });

    return () => {
      cancelled = true;
    };
  }, [fromClass, fromCode, toClass, toCode, pairRate]);

  if (trend.status === "loading" || vol.status === "loading") {
    return <p className="mt-2 text-xs text-slate-400">Loading volatility context…</p>;
  }

  if (trend.status === "unavailable" && vol.status === "unavailable") {
    return (
      <p
        className="mt-2 text-xs text-slate-400"
        title="A volatility read needs real historical data for both sides of this pair — not available yet for this combination (most often because one side is a precious metal, which has no free historical price source wired up)."
      >
        FX volatility context isn&apos;t available for this pair.
      </p>
    );
  }

  const trendPct = trend.pct;
  const volPct = vol.pct;
  const trendIsFlat = trendPct === null || Math.abs(trendPct) < 0.3;
  // "Tight" vs "wide" 30-day daily volatility is a rough, disclosed
  // read of the number itself (a day-over-day stdev above ~0.8% is a
  // genuinely active pair for most fiat/crypto combinations), not a
  // claim of statistical significance.
  const volIsTight = volPct !== null && volPct < 0.8;

  const trendClause =
    trendPct === null
      ? `${fromCode}/${toCode} has no 24h trend data available`
      : `${fromCode}/${toCode} is ${trendIsFlat ? "stable" : trendPct > 0 ? "up" : "down"} over the last 24h (${
          trendPct > 0 ? "+" : ""
        }${trendPct.toFixed(2)}%)`;

  const volClause =
    volPct === null
      ? "30-day volatility isn't available for this pair"
      : `30-day historical volatility is ${volIsTight ? "tight" : "wide"} (~${volPct.toFixed(2)}%/day)`;

  const recommendation =
    volPct !== null && !volIsTight
      ? "Recommended: consider timing a time-sensitive conversion rather than converting on autopilot."
      : volPct !== null
      ? "Recommended: a tight spread like this makes timing less critical for routine conversions."
      : null;

  return (
    <p className="mt-2 text-xs leading-relaxed text-slate-500">
      {trendClause}, but {volClause}
      {recommendation ? `. ${recommendation}` : "."}
    </p>
  );
}

/**
 * Cross-asset converter: searchable From/To pickers spanning fiat
 * currencies, cryptocurrencies and precious metals, a swap button,
 * instant conversion against the unified /api/rates payload, and a
 * quick-reference rate matrix (1 / 10 / 100 / 1000 units).
 *
 * Accepts either the newer { initialFromClass, initialFromCode,
 * initialToClass, initialToCode } props, or the original
 * { initialFrom, initialTo } fiat-only props (still used by the
 * /converters/[pair] FX SEO route) — both forms default to "fiat"
 * when no class is given, so existing call sites keep working as-is.
 */
export default function CurrencyConverter({
  initialFrom = "USD",
  initialTo = "PKR",
  initialFromClass = "fiat",
  initialToClass = "fiat",
  initialFromCode,
  initialToCode,
}) {
  const [fromClass, setFromClass] = useState(initialFromClass);
  const [fromCode, setFromCode] = useState(initialFromCode || initialFrom);
  const [toClass, setToClass] = useState(initialToClass);
  const [toCode, setToCode] = useState(initialToCode || initialTo);
  const [amount, setAmount] = useState(1);

  const [ratesPayload, setRatesPayload] = useState(null);
  const [rateStatus, setRateStatus] = useState("loading"); // loading | live | fallback | error
  const [fetchedAt, setFetchedAt] = useState(null);

  const loadRates = useCallback(async () => {
    setRateStatus((prev) => (prev === "live" ? "live" : "loading"));
    try {
      const data = await fetchRates({ noStore: true });
      if (!data || !data.fiat) throw new Error("Malformed rates payload");

      setRatesPayload(data);
      setFetchedAt(data.fetchedAt || new Date().toISOString());
      setRateStatus(data.warnings?.length ? "fallback" : "live");
    } catch (err) {
      setRateStatus("error");
    }
  }, []);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRates]);

  const fromMeta = getAssetMeta(fromClass, fromCode);
  const toMeta = getAssetMeta(toClass, toCode);

  const pairRate = useMemo(() => {
    if (!ratesPayload) return null;
    return getPairRate({
      fromClass,
      fromCode,
      toClass,
      toCode,
      ratesPayload,
    });
  }, [ratesPayload, fromClass, fromCode, toClass, toCode]);

  const convertedAmount = useMemo(() => {
    if (!ratesPayload) return null;
    return convertBetweenAssets({
      amount,
      fromClass,
      fromCode,
      toClass,
      toCode,
      ratesPayload,
    });
  }, [amount, ratesPayload, fromClass, fromCode, toClass, toCode]);

  const reversePairRate = useMemo(() => {
    if (pairRate === null || pairRate === 0) return null;
    return 1 / pairRate;
  }, [pairRate]);

  function handleSwap() {
    setFromClass(toClass);
    setFromCode(toCode);
    setToClass(fromClass);
    setToCode(fromCode);
  }

  const statusCopy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates connected", dot: "bg-emerald-500" },
    fallback: { text: "Using fallback rates", dot: "bg-amber-500" },
    error: { text: "Live rates unavailable — using fallback", dot: "bg-rose-500" },
  }[rateStatus];

  return (
    <section
      id="currency-converter"
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-50 via-white to-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Universal Currency Converter
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Convert across fiat currencies, crypto and precious
              metals — any asset to any other.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
            <span className={`h-2 w-2 rounded-full ${statusCopy.dot}`} />
            {statusCopy.text}
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Amount + From/To/Swap */}
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <AssetSelect
              id="fx-from-asset"
              label="From"
              assetClass={fromClass}
              code={fromCode}
              onChange={(nextClass, nextCode) => {
                setFromClass(nextClass);
                setFromCode(nextCode);
              }}
            />

            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap assets"
              title="Swap assets"
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-brand-600 sm:mb-0.5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 7H17L14 4M17 17H7L10 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <AssetSelect
              id="fx-to-asset"
              label="To"
              assetClass={toClass}
              code={toCode}
              onChange={(nextClass, nextCode) => {
                setToClass(nextClass);
                setToCode(nextCode);
              }}
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="fx-amount"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Amount ({fromCode})
            </label>
            <input
              id="fx-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="1"
            />
          </div>

          {/* Result */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Converted Amount
              </p>
              <TrendBadge
                fromClass={fromClass}
                fromCode={fromCode}
                toClass={toClass}
                toCode={toCode}
                pairRate={pairRate}
              />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-brand-700">
              {toMeta?.symbol}{" "}
              {formatAmount(convertedAmount, precisionFor(toClass, convertedAmount))}{" "}
              <span className="text-base font-semibold text-slate-400">
                {toCode}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {pairRate !== null
                ? `1 ${fromCode} = ${formatAmount(pairRate, precisionFor(toClass, pairRate))} ${toCode}`
                : "Rate unavailable"}
              {reversePairRate !== null && (
                <>
                  {" "}
                  · 1 {toCode} = {formatAmount(reversePairRate, precisionFor(fromClass, reversePairRate))} {fromCode}
                </>
              )}
            </p>
            <FxDecisionNote
              fromClass={fromClass}
              fromCode={fromCode}
              toClass={toClass}
              toCode={toCode}
              pairRate={pairRate}
            />
          </div>

          {/* Rate Matrix */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700">
              Quick Reference — {fromCode} to {toCode}
            </h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2.5">{fromCode}</th>
                    <th className="px-4 py-2.5 text-right">{toCode}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MATRIX_MULTIPLIERS.map((multiplier) => {
                    const rowValue = pairRate !== null ? multiplier * pairRate : null;
                    return (
                      <tr key={multiplier} className="bg-white">
                        <td className="px-4 py-2.5 font-medium text-slate-700">
                          {fromMeta?.symbol} {formatAmount(multiplier, 0)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                          {rowValue !== null
                            ? `${toMeta?.symbol} ${formatAmount(rowValue, precisionFor(toClass, rowValue))}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={loadRates}
              className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
            >
              <svg
                width="12"
                height="12"
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
            {fetchedAt && (
              <span title={fetchedAt}>
                Last updated{" "}
                {new Date(fetchedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {ratesPayload?.sources && (
                  <>
                    {" "}
                    · {ratesPayload.sources.fiat} · {ratesPayload.sources.crypto} ·{" "}
                    {ratesPayload.sources.metals}
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
