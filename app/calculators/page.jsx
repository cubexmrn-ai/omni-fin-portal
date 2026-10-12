"use client";

// app/calculators/page.jsx
//
// Trading Calculator Suite — a FULLY SELF-CONTAINED page. Every pair
// definition, every calculation formula, every output card, and the
// educational accordion are all defined directly in this one file. The
// only imports are React itself and Next's `fetch` (via the browser
// runtime) against this project's own existing `/api/rates` endpoint —
// there are NO imports of any other component or lib file, so dropping
// this single file in at app/calculators/page.jsx cannot produce a
// missing-child-import error, regardless of what else does or doesn't
// exist elsewhere in the project.
//
// WHY THIS FILE HAS NO `export const metadata`: Next.js's App Router
// only allows a `metadata`/`generateMetadata` export from a Server
// Component, and this page needs live React state (the mode selector,
// every input field, the accordion) which requires "use client" at the
// top — the two are mutually exclusive in one file. If SEO metadata
// for /calculators matters, add a small sibling
// `app/calculators/layout.jsx` server component that exports
// `metadata` and simply renders `{children}` — that costs zero
// imports *inside this file* (this page still has none), since a
// layout isn't something page.jsx imports; Next.js wires it up by
// folder convention.
//
// THEME: a clean, light, "border-only" look. The page and every
// panel/card use a white or slate-50 background with no heavy fills;
// the only strong color is a precise blue (border-blue-500) outline on
// interactive elements — inputs, dropdowns, toggle buttons, and result
// value boxes. Profit/loss/ratio are conveyed with text color
// (emerald/rose/blue), never a colored background block.
//
// MODES (one Selector Bar, five panels):
//   1. All-in-One Trade Execution Suite — combined profit/loss, R:R,
//      pip value, and margin math from one set of inputs.
//   2. Position & Lot Size Calculator — risk-based position sizing.
//   3. Pip Value & Custom Math — pip value for any custom decimal lot.
//   4. Margin & Leverage Calculator — required/free margin.
//   5. Wealth & Personal Finance — Inflation, Compound Growth, and
//      Business Profit Margin, stacked as three sub-cards.

import { useCallback, useEffect, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Inlined data: tradable instruments, contract sizes, pip sizes,
// fallback rates. All self-contained — nothing imported from lib/.
// ---------------------------------------------------------------------------

const PAIR_CATEGORIES = [
  { id: "forex", label: "Forex" },
  { id: "commodity", label: "Commodities & Metals" },
  { id: "index", label: "Indices" },
  { id: "crypto", label: "Crypto" },
];

const TRADABLE_PAIRS = [
  { id: "EURUSD", label: "EUR/USD", base: "EUR", quote: "USD", category: "forex", instrumentType: "forex" },
  { id: "GBPUSD", label: "GBP/USD", base: "GBP", quote: "USD", category: "forex", instrumentType: "forex" },
  { id: "USDJPY", label: "USD/JPY", base: "USD", quote: "JPY", category: "forex", instrumentType: "forex-jpy" },
  { id: "AUDUSD", label: "AUD/USD", base: "AUD", quote: "USD", category: "forex", instrumentType: "forex" },
  { id: "USDCAD", label: "USD/CAD", base: "USD", quote: "CAD", category: "forex", instrumentType: "forex" },
  { id: "USDCHF", label: "USD/CHF", base: "USD", quote: "CHF", category: "forex", instrumentType: "forex" },
  { id: "NZDUSD", label: "NZD/USD", base: "NZD", quote: "USD", category: "forex", instrumentType: "forex" },
  { id: "EURJPY", label: "EUR/JPY", base: "EUR", quote: "JPY", category: "forex", instrumentType: "forex-jpy" },
  { id: "GBPJPY", label: "GBP/JPY", base: "GBP", quote: "JPY", category: "forex", instrumentType: "forex-jpy" },
  { id: "USDPKR", label: "USD/PKR", base: "USD", quote: "PKR", category: "forex", instrumentType: "forex-pkr" },
  { id: "XAUUSD", label: "XAU/USD (Gold)", base: "XAU", quote: "USD", category: "commodity", instrumentType: "metal" },
  { id: "XAGUSD", label: "XAG/USD (Silver)", base: "XAG", quote: "USD", category: "commodity", instrumentType: "metal" },
  { id: "WTIUSD", label: "WTI/USD (Crude Oil)", base: "WTI", quote: "USD", category: "commodity", instrumentType: "energy" },
  { id: "US500", label: "US500 (S&P 500)", base: "US500", quote: "USD", category: "index", instrumentType: "index" },
  { id: "NAS100", label: "NAS100 (Nasdaq)", base: "NAS100", quote: "USD", category: "index", instrumentType: "index" },
  { id: "BTCUSD", label: "BTC/USD", base: "BTC", quote: "USD", category: "crypto", instrumentType: "crypto" },
  { id: "ETHUSD", label: "ETH/USD", base: "ETH", quote: "USD", category: "crypto", instrumentType: "crypto" },
];

function getPair(id) {
  return TRADABLE_PAIRS.find((p) => p.id === id) || TRADABLE_PAIRS[0];
}
function getPairsByCategory(categoryId) {
  return TRADABLE_PAIRS.filter((p) => p.category === categoryId);
}

// Pip/tick size by instrument type — metals/energy and indices
// genuinely vary by broker, so both options are offered rather than
// one being silently assumed.
const PIP_SIZE_OPTIONS = {
  forex: [0.0001],
  "forex-jpy": [0.01],
  "forex-pkr": [0.01],
  metal: [0.01, 0.1],
  energy: [0.01, 0.1],
  index: [0.1, 1],
  crypto: [1],
};
function getDefaultPipSize(instrumentType) {
  return PIP_SIZE_OPTIONS[instrumentType]?.[0] ?? 0.0001;
}

// Contract size (base units) per 1 "standard lot", by instrument type.
const CONTRACT_SIZES = {
  forex: 100000,
  "forex-jpy": 100000,
  "forex-pkr": 100000,
  metal: 100,
  energy: 1000,
  index: 1,
  crypto: 1,
};

// Static USD-base fallback rates, used whenever the live /api/rates
// fetch fails or is unreachable — this page never shows a blank result
// just because a network call didn't come back.
const FALLBACK_RATES = {
  USD: 1,
  PKR: 278.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  NZD: 1.66,
};

// ---------------------------------------------------------------------------
// Inlined pure calculation functions — no lib/ import, all local to
// this file.
// ---------------------------------------------------------------------------

function safeFormat(value, maxDecimals = 2, minDecimals = 2) {
  if (!Number.isFinite(value)) return "—";
  const safeMax = Math.max(0, Math.min(20, Math.round(maxDecimals)));
  const safeMin = Math.max(0, Math.min(safeMax, Math.round(minDecimals)));
  return value.toLocaleString(undefined, {
    maximumFractionDigits: safeMax,
    minimumFractionDigits: safeMin,
  });
}

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Pip value for an arbitrary custom lot size (e.g. 0.18 lots), live-
 * rate converted to USD/PKR. */
function calcPipValueForLots({ pairId, lots, pipSize, rates }) {
  const pair = getPair(pairId);
  const lotsNum = Number(lots);
  if (!pair || !Number.isFinite(lotsNum) || lotsNum <= 0) return null;

  const standardUnits = CONTRACT_SIZES[pair.instrumentType] || CONTRACT_SIZES.forex;
  const units = lotsNum * standardUnits;
  const resolvedPipSize =
    Number.isFinite(pipSize) && pipSize > 0 ? pipSize : getDefaultPipSize(pair.instrumentType);

  const pipValueQuote = resolvedPipSize * units;

  const safeRates = rates && typeof rates === "object" ? rates : {};
  const quoteCode = pair.quote.toUpperCase();
  const quoteRate = quoteCode === "USD" ? 1 : safeRates[quoteCode];
  const pkrRate = safeRates.PKR;

  const pipValueUsd =
    Number.isFinite(quoteRate) && quoteRate > 0 ? pipValueQuote / quoteRate : null;
  const pipValuePkr =
    Number.isFinite(pipValueUsd) && Number.isFinite(pkrRate) ? pipValueUsd * pkrRate : null;

  return { pair, pipSize: resolvedPipSize, units, lots: lotsNum, pipValueQuote, pipValueUsd, pipValuePkr };
}

/** The All-in-One combined calculation: profit/loss ($ & pips), R:R,
 * pip value, and (when balance+leverage are supplied) required/free
 * margin — all from one set of trade inputs. */
function calcTradeExecution({
  pairId,
  lots,
  direction,
  entry,
  takeProfit,
  stopLoss,
  pipSize,
  rates,
  accountBalance,
  leverage,
}) {
  const pipInfo = calcPipValueForLots({ pairId, lots, pipSize, rates });
  if (!pipInfo) return null;

  const e = Number(entry);
  const tp = Number(takeProfit);
  const sl = Number(stopLoss);
  if (![e, tp, sl].every(Number.isFinite) || e <= 0 || e === sl) return null;

  const { pair, pipSize: resolvedPipSize, units, pipValueUsd, pipValuePkr, pipValueQuote } = pipInfo;

  const profitPips = Math.abs(tp - e) / resolvedPipSize;
  const lossPips = Math.abs(e - sl) / resolvedPipSize;

  const profitUsd = Number.isFinite(pipValueUsd) ? profitPips * pipValueUsd : null;
  const lossUsd = Number.isFinite(pipValueUsd) ? lossPips * pipValueUsd : null;
  const ratio =
    Number.isFinite(profitUsd) && Number.isFinite(lossUsd) && lossUsd > 0 ? profitUsd / lossUsd : null;

  const isLong = direction !== "sell";
  const directionConsistent = isLong ? tp > e && sl < e : tp < e && sl > e;

  let requiredMargin = null;
  let freeMargin = null;
  const bal = Number(accountBalance);
  const lev = Number(leverage);
  if (Number.isFinite(bal) && bal > 0 && Number.isFinite(lev) && lev > 0) {
    const safeRates = rates && typeof rates === "object" ? rates : {};
    const quoteCode = pair.quote.toUpperCase();
    const quoteRate = quoteCode === "USD" ? 1 : safeRates[quoteCode];
    const positionValueQuote = units * e;
    const positionValueUsd =
      Number.isFinite(quoteRate) && quoteRate > 0 ? positionValueQuote / quoteRate : null;
    if (Number.isFinite(positionValueUsd)) {
      requiredMargin = positionValueUsd / lev;
      freeMargin = bal - requiredMargin;
    }
  }

  return {
    pair,
    pipValueQuote,
    pipValueUsd,
    pipValuePkr,
    profitPips,
    lossPips,
    profitUsd,
    lossUsd,
    ratio,
    ratioLabel: Number.isFinite(ratio) ? `1:${round(ratio, 2)}` : "—",
    isLong,
    directionConsistent,
    requiredMargin,
    freeMargin,
    isOverLeveraged: Number.isFinite(freeMargin) && freeMargin < 0,
  };
}

/** Position & Lot Size: solves backward from risk tolerance. */
function calcLotSize({ accountBalance, riskPercent, stopLossPips, pipValuePerStandardLot }) {
  const bal = Number(accountBalance);
  const risk = Number(riskPercent);
  const pips = Number(stopLossPips);
  const pipVal = Number(pipValuePerStandardLot);
  if (![bal, risk, pips, pipVal].every(Number.isFinite) || bal <= 0 || risk <= 0 || pips <= 0 || pipVal <= 0) {
    return null;
  }
  const riskAmount = bal * (risk / 100);
  const standardLots = riskAmount / (pips * pipVal);
  return { riskAmount, standardLots, miniLots: standardLots * 10, microLots: standardLots * 100 };
}

/** Margin & Leverage. */
function calcMargin({ accountBalance, leverage, positionSizeUsd }) {
  const bal = Number(accountBalance);
  const lev = Number(leverage);
  const size = Number(positionSizeUsd);
  if (![bal, lev, size].every(Number.isFinite) || bal <= 0 || lev <= 0 || size <= 0) return null;
  const requiredMargin = size / lev;
  const freeMargin = bal - requiredMargin;
  const marginLevelPercent = requiredMargin > 0 ? (bal / requiredMargin) * 100 : null;
  return { requiredMargin, freeMargin, marginLevelPercent, isOverLeveraged: freeMargin < 0 };
}

/** Inflation / purchasing power. */
function calcInflation({ pastAmount, years, annualRatePercent }) {
  const amount = Number(pastAmount);
  const yrs = Number(years);
  const rate = Number(annualRatePercent);
  if (![amount, yrs, rate].every(Number.isFinite) || amount <= 0 || yrs <= 0) return null;
  const futureEquivalent = amount * Math.pow(1 + rate / 100, yrs);
  const purchasingPowerLossPercent = 100 - (amount / futureEquivalent) * 100;
  return { futureEquivalent, purchasingPowerLossPercent };
}

/** Compound growth / wealth projection with monthly contributions. */
function calcCompoundGrowth({ initial, monthlyContribution, annualRatePercent, years }) {
  const init = Number(initial);
  const monthly = Number(monthlyContribution);
  const rate = Number(annualRatePercent);
  const yrs = Number(years);
  if (![init, monthly, rate, yrs].every(Number.isFinite) || yrs <= 0) return null;

  const monthlyRate = rate / 100 / 12;
  const totalMonths = Math.round(yrs * 12);
  let balance = init;
  const yearlyTable = [];
  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    if (m % 12 === 0) {
      yearlyTable.push({ year: m / 12, balance });
    }
  }
  const totalContributed = init + monthly * totalMonths;
  return { finalBalance: balance, totalContributed, totalGrowth: balance - totalContributed, yearlyTable };
}

/** Business profit margin & markup. */
function calcProfitMargin({ cost, price }) {
  const c = Number(cost);
  const p = Number(price);
  if (![c, p].every(Number.isFinite) || c <= 0 || p <= 0) return null;
  const profit = p - c;
  const grossMarginPercent = (profit / p) * 100;
  const markupPercent = (profit / c) * 100;
  return { profit, grossMarginPercent, markupPercent };
}

// ---------------------------------------------------------------------------
// Small inline UI building blocks — no child-file components, all
// defined and used only within this page.
// ---------------------------------------------------------------------------

function FieldLabel({ children }) {
  return <span className="mb-1 block text-xs font-semibold text-slate-600">{children}</span>;
}

function TextInput(props) {
  return (
    <input
      type="number"
      step="any"
      {...props}
      className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}

/** A single high-contrast output tile, colored per the spec's exact
 * palette for profit (emerald) / loss (rose) / neutral (slate/blue). */
function StatCard({ label, value, sub, tone = "neutral" }) {
  const toneClasses = {
    profit: "border-blue-500 bg-white text-emerald-600",
    loss: "border-blue-500 bg-white text-rose-600",
    ratio: "border-blue-500 bg-white text-blue-600",
    neutral: "border-blue-500 bg-white text-slate-900",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 text-center ${toneClasses}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-blue-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:text-brand-600"
      >
        {title}
        <span className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600">{children}</div>}
    </div>
  );
}

function PairSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {PAIR_CATEGORIES.map((cat) => {
        const pairs = getPairsByCategory(cat.id);
        if (pairs.length === 0) return null;
        return (
          <optgroup key={cat.id} label={cat.label}>
            {pairs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

function PipSizePicker({ pair, pipSize, onChange }) {
  const options = PIP_SIZE_OPTIONS[pair.instrumentType] || PIP_SIZE_OPTIONS.forex;
  if (options.length <= 1) return null;
  return (
    <label className="block sm:col-span-2 lg:col-span-3">
      <FieldLabel>Pip / Tick Size — brokers vary for {pair.label}</FieldLabel>
      <div className="flex gap-2">
        {options.map((size) => {
          const active = pipSize === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              aria-pressed={active}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </label>
  );
}

function LiveRateBadge({ status }) {
  const copy = {
    loading: { text: "Fetching live rates…", dot: "bg-amber-400" },
    live: { text: "Live rates", dot: "bg-emerald-500" },
    fallback: { text: "Fallback rates", dot: "bg-amber-500" },
    error: { text: "Rates unavailable — using fallback", dot: "bg-rose-500" },
  }[status];
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
      <span className={`h-1.5 w-1.5 rounded-full ${copy.dot}`} />
      {copy.text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Shared live-rates hook (inline — not a separate hooks/ file import).
// ---------------------------------------------------------------------------

function useLiveRates() {
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rates", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      if (!data || !data.fiat) throw new Error("malformed payload");
      setRates({ ...FALLBACK_RATES, ...data.fiat });
      setStatus(data.warnings?.length ? "fallback" : "live");
    } catch {
      setRates(FALLBACK_RATES);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rates, status };
}

// ---------------------------------------------------------------------------
// Mode 1 — All-in-One Trade Execution Suite
// ---------------------------------------------------------------------------

function AllInOnePanel() {
  const { rates, status } = useLiveRates();
  const [pairId, setPairId] = useState("EURUSD");
  const [lots, setLots] = useState(0.18);
  const [direction, setDirection] = useState("buy");
  const [accountBalance, setAccountBalance] = useState(10000);
  const [entry, setEntry] = useState(1.123);
  const [takeProfit, setTakeProfit] = useState(1.223);
  const [stopLoss, setStopLoss] = useState(1.073);
  const [leverage, setLeverage] = useState(100);
  const [pipSize, setPipSize] = useState(getDefaultPipSize("forex"));

  const pair = getPair(pairId);

  function handlePairChange(nextId) {
    setPairId(nextId);
    setPipSize(getDefaultPipSize(getPair(nextId).instrumentType));
  }

  const result = useMemo(
    () =>
      calcTradeExecution({
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

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-blue-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">All-in-One Trade Execution Suite</h3>
          <p className="mt-0.5 text-xs text-slate-600">
            Full trade math from one entry: P/L, R:R, pip value, and margin impact.
          </p>
        </div>
        <LiveRateBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <FieldLabel>Instrument / Pair</FieldLabel>
          <PairSelect value={pairId} onChange={handlePairChange} />
        </label>

        <label className="block">
          <FieldLabel>
            Lot Size <span className="text-slate-500">(custom, e.g. 0.18)</span>
          </FieldLabel>
          <TextInput min="0" step="0.01" value={lots} onChange={(e) => setLots(e.target.value)} />
        </label>

        <label className="block">
          <FieldLabel>Order Type</FieldLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection("buy")}
              aria-pressed={direction === "buy"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                direction === "buy"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600"
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
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              Sell
            </button>
          </div>
        </label>

        <label className="block">
          <FieldLabel>Account Balance (USD)</FieldLabel>
          <TextInput min="0" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
        </label>

        <label className="block">
          <FieldLabel>Entry Price</FieldLabel>
          <TextInput value={entry} onChange={(e) => setEntry(e.target.value)} />
        </label>

        <label className="block">
          <FieldLabel>Take Profit Price</FieldLabel>
          <TextInput value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
        </label>

        <label className="block">
          <FieldLabel>Stop Loss Price</FieldLabel>
          <TextInput value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
        </label>

        <label className="block">
          <FieldLabel>Leverage</FieldLabel>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-600">1:</span>
            <TextInput min="1" step="1" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
          </div>
        </label>

        <PipSizePicker pair={pair} pipSize={pipSize} onChange={setPipSize} />
      </div>

      <div className="border-t border-blue-100 p-5">
        {result ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                tone="profit"
                label="Potential Profit"
                value={Number.isFinite(result.profitUsd) ? `$${safeFormat(result.profitUsd)}` : "—"}
                sub={`${safeFormat(result.profitPips, 1)} pips`}
              />
              <StatCard
                tone="loss"
                label="Potential Loss"
                value={Number.isFinite(result.lossUsd) ? `$${safeFormat(result.lossUsd)}` : "—"}
                sub={`${safeFormat(result.lossPips, 1)} pips`}
              />
              <StatCard
                tone="ratio"
                label="Risk : Reward"
                value={result.ratioLabel}
                sub={result.isLong ? "Long position" : "Short position"}
              />
              <StatCard
                tone="neutral"
                label="Pip Value"
                value={Number.isFinite(result.pipValueUsd) ? `$${safeFormat(result.pipValueUsd)}` : "—"}
                sub={Number.isFinite(result.pipValuePkr) ? `≈ Rs ${safeFormat(result.pipValuePkr)}` : "—"}
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard
                tone="neutral"
                label="Required Margin"
                value={Number.isFinite(result.requiredMargin) ? `$${safeFormat(result.requiredMargin)}` : "—"}
              />
              <StatCard
                tone={result.isOverLeveraged ? "loss" : "neutral"}
                label="Free Margin After Entry"
                value={Number.isFinite(result.freeMargin) ? `$${safeFormat(result.freeMargin)}` : "—"}
              />
            </div>

            {!result.directionConsistent && (
              <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                Heads up: your Take Profit / Stop Loss levels look inconsistent with a{" "}
                {result.isLong ? "Buy" : "Sell"} order.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Enter a valid pair, lot size, entry, take profit, and stop loss above.
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

// ---------------------------------------------------------------------------
// Mode 2 — Position & Lot Size Calculator
// ---------------------------------------------------------------------------

function LotSizePanel() {
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [pipValuePerLot, setPipValuePerLot] = useState(10);

  const result = useMemo(
    () =>
      calcLotSize({
        accountBalance: balance,
        riskPercent,
        stopLossPips: stopPips,
        pipValuePerStandardLot: pipValuePerLot,
      }),
    [balance, riskPercent, stopPips, pipValuePerLot]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Position &amp; Lot Size Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-600">
          Risk Amount ÷ (Stop-Loss Pips × Pip Value per Lot) = Standard Lots
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Account Balance (USD)</FieldLabel>
          <TextInput min="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Risk per Trade (%)</FieldLabel>
          <TextInput min="0" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Stop-Loss Distance (pips)</FieldLabel>
          <TextInput min="0" value={stopPips} onChange={(e) => setStopPips(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Pip Value per Standard Lot (USD)</FieldLabel>
          <TextInput min="0" value={pipValuePerLot} onChange={(e) => setPipValuePerLot(e.target.value)} />
        </label>
      </div>

      <div className="border-t border-blue-100 p-5">
        {result ? (
          <div>
            <p className="text-sm text-slate-600">
              Risk Amount: <span className="font-bold text-slate-900">${safeFormat(result.riskAmount)}</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <StatCard tone="neutral" label="Standard" value={safeFormat(result.standardLots, 2)} />
              <StatCard tone="neutral" label="Mini" value={safeFormat(result.miniLots, 2)} />
              <StatCard tone="neutral" label="Micro" value={safeFormat(result.microLots, 2)} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Enter valid, positive numbers above.</p>
        )}
        <p className="mt-3 text-[11px] text-slate-500">
          Pip value per standard lot varies by pair and account currency — check your broker&apos;s
          actual figure, or use Mode 3, before sizing a real trade. For informational purposes only.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode 3 — Pip Value & Custom Math
// ---------------------------------------------------------------------------

function PipValuePanel() {
  const { rates, status } = useLiveRates();
  const [pairId, setPairId] = useState("EURUSD");
  const [lots, setLots] = useState(0.18);
  const [pipSize, setPipSize] = useState(getDefaultPipSize("forex"));

  const pair = getPair(pairId);

  function handlePairChange(nextId) {
    setPairId(nextId);
    setPipSize(getDefaultPipSize(getPair(nextId).instrumentType));
  }

  const result = useMemo(
    () => calcPipValueForLots({ pairId: pair.id, lots, pipSize, rates }),
    [pair.id, lots, pipSize, rates]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-blue-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Pip Value Calculator</h3>
          <p className="mt-0.5 text-xs text-slate-600">
            Custom decimal lot size (e.g. 0.18) — not just Standard/Mini/Micro presets.
          </p>
        </div>
        <LiveRateBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Pair / Instrument</FieldLabel>
          <PairSelect value={pairId} onChange={handlePairChange} />
        </label>
        <label className="block">
          <FieldLabel>
            Lot Size <span className="text-slate-500">(custom, e.g. 0.18)</span>
          </FieldLabel>
          <TextInput min="0" step="0.01" value={lots} onChange={(e) => setLots(e.target.value)} />
        </label>
        <PipSizePicker pair={pair} pipSize={pipSize} onChange={setPipSize} />
      </div>

      <div className="border-t border-blue-100 px-5 py-4">
        {result ? (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <p>
              <span className="text-slate-600">1 pip ({safeFormat(result.lots, 2)} lots) = </span>
              <span className="font-bold text-slate-900">
                {safeFormat(result.pipValueQuote, 2)} {pair.quote}
              </span>
            </p>
            <p>
              <span className="text-slate-600">≈ </span>
              <span className="font-bold text-emerald-600">
                {Number.isFinite(result.pipValueUsd) ? `$${safeFormat(result.pipValueUsd)}` : "—"} USD
              </span>
            </p>
            <p>
              <span className="text-slate-600">≈ </span>
              <span className="font-bold text-emerald-600">
                {Number.isFinite(result.pipValuePkr) ? `Rs ${safeFormat(result.pipValuePkr)}` : "—"} PKR
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Enter a valid pair and lot size above.</p>
        )}
        <p className="mt-2 text-[11px] text-slate-500">For informational purposes only, not financial advice.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode 4 — Margin & Leverage Calculator
// ---------------------------------------------------------------------------

function MarginPanel() {
  const [balance, setBalance] = useState(1000);
  const [leverage, setLeverage] = useState(100);
  const [positionSize, setPositionSize] = useState(50000);

  const result = useMemo(
    () => calcMargin({ accountBalance: balance, leverage, positionSizeUsd: positionSize }),
    [balance, leverage, positionSize]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Margin &amp; Leverage Calculator</h3>
        <p className="mt-0.5 text-xs text-slate-600">Required Margin = Position Size ÷ Leverage</p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Account Balance (USD)</FieldLabel>
          <TextInput min="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Position Size (USD notional)</FieldLabel>
          <TextInput min="0" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>Leverage</FieldLabel>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-600">1:</span>
            <TextInput min="1" step="1" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
          </div>
        </label>
      </div>

      <div className="border-t border-blue-100 p-5">
        {result ? (
          <div>
            <div className="grid grid-cols-3 gap-2">
              <StatCard tone="neutral" label="Required Margin" value={`$${safeFormat(result.requiredMargin)}`} />
              <StatCard
                tone={result.isOverLeveraged ? "loss" : "profit"}
                label="Free Margin"
                value={`$${safeFormat(result.freeMargin)}`}
              />
              <StatCard
                tone="neutral"
                label="Margin Level"
                value={Number.isFinite(result.marginLevelPercent) ? `${safeFormat(result.marginLevelPercent, 0)}%` : "—"}
              />
            </div>
            {result.isOverLeveraged && (
              <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                This position size exceeds your account balance at this leverage — free margin is
                negative.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Enter valid, positive numbers above.</p>
        )}
        <p className="mt-3 text-[11px] text-slate-500">
          Margin level is a simplified Balance ÷ Required Margin figure — your broker&apos;s actual
          margin-call and stop-out thresholds vary. For informational purposes only.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode 5 — Wealth & Personal Finance (Inflation + Compound Growth +
// Business Profit Margin, stacked)
// ---------------------------------------------------------------------------

function InflationCard() {
  const [pastAmount, setPastAmount] = useState(10000);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(7);

  const result = useMemo(
    () => calcInflation({ pastAmount, years, annualRatePercent: annualRate }),
    [pastAmount, years, annualRate]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Inflation &amp; Purchasing Power</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
        <label className="block">
          <FieldLabel>Amount Today</FieldLabel>
          <TextInput min="0" value={pastAmount} onChange={(e) => setPastAmount(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Years Forward</FieldLabel>
          <TextInput min="0" value={years} onChange={(e) => setYears(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Annual Inflation (%)</FieldLabel>
          <TextInput min="0" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} />
        </label>
      </div>
      <div className="border-t border-blue-100 p-5">
        {result ? (
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              tone="neutral"
              label="Equivalent Future Amount"
              value={`$${safeFormat(result.futureEquivalent)}`}
            />
            <StatCard
              tone="loss"
              label="Purchasing Power Lost"
              value={`${safeFormat(result.purchasingPowerLossPercent, 1)}%`}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-600">Enter valid, positive numbers above.</p>
        )}
      </div>
    </div>
  );
}

function CompoundGrowthCard() {
  const [initial, setInitial] = useState(5000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(15);

  const result = useMemo(
    () => calcCompoundGrowth({ initial, monthlyContribution: monthly, annualRatePercent: rate, years }),
    [initial, monthly, rate, years]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Compound Interest / Wealth Growth</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Initial Amount (USD)</FieldLabel>
          <TextInput min="0" value={initial} onChange={(e) => setInitial(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Monthly Contribution (USD)</FieldLabel>
          <TextInput min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Annual Return (%)</FieldLabel>
          <TextInput min="0" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Years</FieldLabel>
          <TextInput min="0" value={years} onChange={(e) => setYears(e.target.value)} />
        </label>
      </div>
      <div className="border-t border-blue-100 p-5">
        {result ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <StatCard tone="profit" label="Final Balance" value={`$${safeFormat(result.finalBalance, 0)}`} />
              <StatCard tone="neutral" label="Contributed" value={`$${safeFormat(result.totalContributed, 0)}`} />
              <StatCard tone="neutral" label="Growth" value={`$${safeFormat(result.totalGrowth, 0)}`} />
            </div>
            {result.yearlyTable.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-blue-500">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-blue-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-semibold">Year</th>
                      <th className="px-3 py-1.5 text-right font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100 bg-white">
                    {result.yearlyTable.map((row) => (
                      <tr key={row.year}>
                        <td className="px-3 py-1.5 text-slate-600">{row.year}</td>
                        <td className="px-3 py-1.5 text-right text-slate-900">${safeFormat(row.balance, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-600">Enter valid numbers above.</p>
        )}
      </div>
    </div>
  );
}

function ProfitMarginCard() {
  const [cost, setCost] = useState(100);
  const [price, setPrice] = useState(140);

  const result = useMemo(() => calcProfitMargin({ cost, price }), [cost, price]);

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Business Profit Margin &amp; Markup</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Cost</FieldLabel>
          <TextInput min="0" value={cost} onChange={(e) => setCost(e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Selling Price</FieldLabel>
          <TextInput min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
      </div>
      <div className="border-t border-blue-100 p-5">
        {result ? (
          <div className="grid grid-cols-3 gap-2">
            <StatCard tone="profit" label="Profit" value={`$${safeFormat(result.profit)}`} />
            <StatCard tone="neutral" label="Gross Margin" value={`${safeFormat(result.grossMarginPercent, 1)}%`} />
            <StatCard tone="neutral" label="Markup" value={`${safeFormat(result.markupPercent, 1)}%`} />
          </div>
        ) : (
          <p className="text-sm text-slate-600">Enter valid, positive numbers above.</p>
        )}
      </div>
    </div>
  );
}

function WealthPanel() {
  return (
    <div className="space-y-5">
      <InflationCard />
      <CompoundGrowthCard />
      <ProfitMarginCard />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Educational accordion — "Calculator Guide & Knowledge Notes"
// ---------------------------------------------------------------------------

function CalculationGuide() {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">Calculator Guide &amp; Knowledge Notes</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          A quick refresher on pip math, lot sizing, and account-risk rules for beginner traders.
        </p>
      </div>
      <div>
        <AccordionItem title="Pip math — what a pip is worth" defaultOpen>
          A pip (or point/tick for indices and crypto) is the smallest standard price increment
          for an instrument — 0.0001 for most forex pairs, 0.01 for JPY/PKR pairs and
          metals/energy on some brokers. Pip value in your account currency = pip size ×
          contract size (units per lot) × your lot size, converted from the quote currency to
          USD/PKR using the current exchange rate — exactly what Modes 1 and 3 compute live.
        </AccordionItem>
        <AccordionItem title="Lot sizing formulas">
          Position size is solved backward from how much you&apos;re willing to lose: Risk
          Amount = Account Balance × Risk %. Standard Lots = Risk Amount ÷ (Stop-Loss Pips × Pip
          Value per Standard Lot). Mini lots are 10× that figure, micro lots 100×, since a
          standard lot is 100,000 base-currency units (10,000 mini, 1,000 micro) — see Mode 2.
        </AccordionItem>
        <AccordionItem title="The 1–2% account risk rule">
          Most professional risk-management guidance caps the amount risked on any single trade
          at 1–2% of total account balance, so a string of losses doesn&apos;t cause lasting
          damage — e.g. on a $10,000 account, a 1% risk rule caps a single trade&apos;s potential
          loss at $100. Modes 1 and 2 both let you check your risk against this rule before you
          size a position.
        </AccordionItem>
        <AccordionItem title="Risk:Reward and margin">
          Risk:Reward compares potential reward to potential risk in dollar terms (e.g. 1:2 means
          you stand to make twice what you&apos;re risking). Required Margin is simply the
          position&apos;s notional value divided by your leverage ratio; Free Margin is what&apos;s
          left of your balance after that margin is set aside — a negative free margin means the
          position is too large for your account at that leverage. See Modes 1 and 4.
        </AccordionItem>
        <AccordionItem title="Inflation, compounding, and margin — Mode 5">
          Inflation math projects a nominal amount forward at a compounding annual rate to show
          what today&apos;s money will need to grow to just to keep its buying power. Compound
          growth does the reverse direction — projecting a starting balance plus regular monthly
          contributions forward at a compounding annual return. Both are long-horizon estimates,
          not guarantees.
        </AccordionItem>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const MODES = [
  { id: "all-in-one", label: "All-in-One Trade Execution Suite" },
  { id: "lot-size", label: "Position & Lot Size Calculator" },
  { id: "pip-value", label: "Pip Value Calculator" },
  { id: "margin", label: "Margin & Leverage Calculator" },
  { id: "wealth", label: "Inflation & Wealth Growth" },
];

export default function CalculatorsPage() {
  const [activeMode, setActiveMode] = useState("all-in-one");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — light surface */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <span className="hover:text-brand-600">Dashboard</span>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Calculators</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trading Calculator Suite
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            One unified, high-utility calculator for traders and households — position sizing,
            pip value, risk/reward, margin, and wealth growth, all synced to live rates.
          </p>
        </div>
      </section>

      {/* Terminal body — light page surface; every panel, input, and
          result box below uses the clean white/blue-border look (see
          components above). */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Mode selector — dropdown on mobile, pill tabs on larger screens */}
          <div className="sm:hidden">
            <label className="block">
              <span className="sr-only">Select a calculator mode</span>
              <select
                value={activeMode}
                onChange={(e) => setActiveMode(e.target.value)}
                className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="hidden flex-wrap gap-2 sm:flex" role="tablist" aria-label="Calculator mode">
            {MODES.map((mode) => {
              const active = mode.id === activeMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveMode(mode.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-blue-100 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            {activeMode === "all-in-one" && <AllInOnePanel />}
            {activeMode === "lot-size" && <LotSizePanel />}
            {activeMode === "pip-value" && <PipValuePanel />}
            {activeMode === "margin" && <MarginPanel />}
            {activeMode === "wealth" && <WealthPanel />}
          </div>

          <CalculationGuide />
        </div>
      </section>
    </div>
  );
}
