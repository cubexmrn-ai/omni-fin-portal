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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Framework import, not a project-file import — allowed under this
// file's zero-project-file-import rule (see header comment above).
// Powers the Cross-Tool URL Param Sync below.
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// PHASE 3 ADDITION: this page's Cross-Tool URL Param Sync (further
// below) reads `?instrument=` via next/navigation's useSearchParams()
// inside AllInOnePanel. Next.js 14 requires either a <Suspense>
// boundary around any useSearchParams() call or opting the whole
// route out of static generation — the same tradeoff
// app/market-analysis/page.jsx already made (see its own `dynamic`
// export) for the exact same hook. This page's content is 100% client
// state anyway (every input is localStorage-persisted, nothing here
// is meaningfully pre-renderable), so `force-dynamic` is the simpler,
// zero-new-component fix — it just renders fresh per request instead
// of attempting a build-time static shell.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Global Base Currency sync — WITHOUT an import.
//
// components/Header.jsx's Base Currency switcher writes its choice to
// lib/baseCurrencyContext.js's BaseCurrencyProvider, which persists it
// to localStorage under the key below and also fires a same-tab
// CustomEvent (the native "storage" event only fires in OTHER tabs).
// This page deliberately has ZERO imports of any other project file
// (see the header comment above) so it can never break from a
// missing-import deploy error — so instead of importing that Context,
// it reads/writes the exact same localStorage key and listens for the
// exact same event name, by literal string. If either constant is
// ever renamed in lib/baseCurrencyContext.js, update the two literals
// below to match.
const GLOBAL_BASE_CURRENCY_STORAGE_KEY = "omnifin:baseCurrency";
const GLOBAL_BASE_CURRENCY_EVENT = "omnifin:baseCurrencyChange";

// Same zero-imports pattern as above, for the Language switcher (see
// lib/i18n/LanguageContext.js / lib/i18n/translations.js): this page
// reads the identical localStorage key and CustomEvent name by literal
// string, and keeps just the 4 trading terms it actually displays
// (Buy, Sell, Potential Profit, Potential Loss) as a small inline
// dictionary — a duplicate of those 4 keys from each language's entry
// in lib/i18n/translations.js, not the full dictionary, since that's
// all this page needs translated. Keep these in sync if those 4
// values ever change there.
const GLOBAL_LANGUAGE_STORAGE_KEY = "omnifin:language";
const GLOBAL_LANGUAGE_EVENT = "omnifin:languageChange";
const CALC_TERMS_BY_LANGUAGE = {
  en: { buy: "Buy", sell: "Sell", profit: "Potential Profit", loss: "Potential Loss" },
  "ur-Latn": { buy: "Khareedna", sell: "Bechna", profit: "Mumkin Nafa", loss: "Mumkin Nuqsan" },
  ur: { buy: "خریدیں", sell: "بیچیں", profit: "ممکنہ نفع", loss: "ممکنہ نقصان" },
  hi: { buy: "खरीदें", sell: "बेचें", profit: "संभावित लाभ", loss: "संभावित हानि" },
  ar: { buy: "شراء", sell: "بيع", profit: "الربح المحتمل", loss: "الخسارة المحتملة" },
  es: { buy: "Comprar", sell: "Vender", profit: "Ganancia Potencial", loss: "Pérdida Potencial" },
  fr: { buy: "Acheter", sell: "Vendre", profit: "Profit Potentiel", loss: "Perte Potentielle" },
  de: { buy: "Kaufen", sell: "Verkaufen", profit: "Möglicher Gewinn", loss: "Möglicher Verlust" },
  it: { buy: "Compra", sell: "Vendi", profit: "Profitto Potenziale", loss: "Perdita Potenziale" },
  tr: { buy: "Al", sell: "Sat", profit: "Olası Kâr", loss: "Olası Zarar" },
  zh: { buy: "买入", sell: "卖出", profit: "潜在盈利", loss: "潜在亏损" },
  ja: { buy: "買い", sell: "売り", profit: "潜在利益", loss: "潜在損失" },
  ko: { buy: "매수", sell: "매도", profit: "예상 수익", loss: "예상 손실" },
  pt: { buy: "Comprar", sell: "Vender", profit: "Lucro Potencial", loss: "Perda Potencial" },
  ru: { buy: "Купить", sell: "Продать", profit: "Потенциальная Прибыль", loss: "Потенциальный Убыток" },
  id: { buy: "Beli", sell: "Jual", profit: "Potensi Untung", loss: "Potensi Rugi" },
  vi: { buy: "Mua", sell: "Bán", profit: "Lợi Nhuận Dự Kiến", loss: "Lỗ Dự Kiến" },
};

// ---------------------------------------------------------------------------
// PHASE 3 — Cross-Tool URL Param Sync — WITHOUT an import.
//
// Mirrors lib/instrumentParam.js's shared `?instrument=` convention:
// same param name, same canonical codes (this file's own
// TRADABLE_PAIRS ids ARE that canonical space — "XAUUSD", "BTCUSD",
// etc. — plus "DXY", which this page doesn't trade but passes through
// unchanged so it round-trips if a person arrives from the Watchlist's
// DXY row). Picking Gold here and then clicking through to
// /market-analysis or /journal preserves XAUUSD as the active
// instrument automatically, and vice-versa. Duplicated inline (not
// imported) per this file's zero-project-file-import rule above — if
// lib/instrumentParam.js's param name or alias list ever changes,
// mirror the change here too.
const INSTRUMENT_PARAM_NAME = "instrument";
const INSTRUMENT_PARAM_ALIASES = {
  GOLD: "XAUUSD", SILVER: "XAGUSD", BITCOIN: "BTCUSD", ETHEREUM: "ETHUSD",
  OIL: "WTIUSD", CRUDE: "WTIUSD", XAU: "XAUUSD", XAG: "XAGUSD", BTC: "BTCUSD",
  ETH: "ETHUSD", WTI: "WTIUSD",
};
function normalizeInstrumentParam(raw) {
  if (!raw) return null;
  const upper = String(raw).trim().toUpperCase();
  return INSTRUMENT_PARAM_ALIASES[upper] || upper;
}

// ---------------------------------------------------------------------------
// PHASE 3 — One-Click Trade Journal Integration — WITHOUT an import.
//
// hooks/useTradingJournal.js persists entries to localStorage under
// the key below as `{ version: 1, entries: [...] }`, each entry
// shaped `{ id, category, createdAt, ...fields }`. The "forex-crypto"
// category (lib/journalSchema.js) takes
// `{ instrument, direction, size, entryPrice, exitPrice, openedAt,
// closedAt, notes }`. Duplicated here (not imported) per this file's
// zero-project-file-import rule — if that hook's storage key, id
// format, or schema shape ever changes, mirror the change here too.
const JOURNAL_STORAGE_KEY = "omnifin.journal.entries.v1";
function makeJournalId() {
  return `j_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
/** Appends one "forex-crypto" entry to the shared local Trade Journal.
 * Returns true on success, false if localStorage couldn't be written
 * to (private browsing, storage quota, etc.) — callers surface that
 * honestly instead of claiming a save that didn't happen. */
function appendToLocalJournal(fields) {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const entries = parsed && Array.isArray(parsed.entries) ? parsed.entries : [];
    const entry = {
      id: makeJournalId(),
      category: "forex-crypto",
      createdAt: new Date().toISOString(),
      ...fields,
    };
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify({ version: 1, entries: [...entries, entry] }));
    return true;
  } catch {
    return false;
  }
}

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
// just because a network call didn't come back. Duplicated (not
// imported) from lib/currencies.js's FALLBACK_RATES for the same
// zero-imports reason explained at the top of this file — this is the
// full 140+ currency set, so the "Account / Local Currency" picker
// below is never more restrictive than the rest of the site's
// dropdowns.
const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CHF: 0.88, CAD: 1.36, AUD: 1.52, NZD: 1.66,
  CNY: 7.24, HKD: 7.82, SGD: 1.34,
  PKR: 278.5, INR: 83.9, BDT: 119.5, LKR: 304, NPR: 134, BTN: 83.9, MVR: 15.4,
  THB: 34.8, IDR: 15750, PHP: 56.8, VND: 25400, MYR: 4.47, MMK: 2100, KHR: 4100, LAK: 21700, BND: 1.34,
  KRW: 1365, TWD: 32.4, MOP: 8.05, MNT: 3450,
  FJD: 2.27, PGK: 4.0, WST: 2.75, TOP: 2.37, SBD: 8.45, VUV: 119,
  KZT: 480, UZS: 12800, TJS: 10.6, KGS: 87.5, TMT: 3.5, AMD: 387, AZN: 1.7, GEL: 2.66,
  AED: 3.6725, SAR: 3.75, QAR: 3.64, KWD: 0.307, OMR: 0.385, BHD: 0.376,
  ILS: 3.7, JOD: 0.709, LBP: 89500, IQD: 1310, IRR: 42000, YER: 250, AFN: 70, TRY: 34.1,
  EGP: 48.5, NGN: 1550, ZAR: 18.3, DZD: 134.5, AOA: 920, XOF: 610, XAF: 610,
  BWP: 13.6, CDF: 2850, DJF: 177.7, ETB: 123, GHS: 15.6, GNF: 8600, KES: 129,
  LSL: 18.3, LYD: 4.85, MAD: 10.0, MGA: 4550, MUR: 46.5, MWK: 1740, MZN: 63.9,
  NAD: 18.3, RWF: 1390, SCR: 13.6, SDG: 601, SLL: 22700, SOS: 571, SSP: 4500,
  SZL: 18.3, TND: 3.11, TZS: 2520, UGX: 3700, XPF: 109, ZMW: 26.8, ZWL: 26.8,
  CVE: 101, GMD: 72, KMF: 450, MRU: 39.8, STN: 22.3, ERN: 15, BIF: 2890,
  SEK: 10.4, NOK: 10.7, DKK: 6.86, ISK: 138, PLN: 4.0, CZK: 23.5, HUF: 385,
  RON: 4.58, BGN: 1.80, UAH: 41.5, RSD: 108, ALL: 94, MKD: 56.8, BAM: 1.80, MDL: 17.7, BYN: 3.3, RUB: 96.5,
  MXN: 18.2, BRL: 5.65, ARS: 990, CLP: 970, COP: 4300, PEN: 3.78, UYU: 42.5, BOB: 6.91,
  PYG: 7850, VES: 50, GYD: 209, SRD: 36.5, TTD: 6.78, JMD: 158, BSD: 1.0, BBD: 2.0,
  BZD: 2.02, XCD: 2.70, HTG: 132, DOP: 60.0, CRC: 505, GTQ: 7.72, HNL: 24.8, NIO: 36.8, PAB: 1.0, CUP: 24.0,
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
 * rate converted to USD and to `accountCurrency` — the global Base
 * Currency from the header by default, or whatever the panel's own
 * "Account / Local Currency" dropdown was manually overridden to. */
function calcPipValueForLots({ pairId, lots, pipSize, rates, accountCurrency }) {
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
  const accountCode = (accountCurrency || "PKR").toUpperCase();
  const accountRate = accountCode === "USD" ? 1 : safeRates[accountCode];

  const pipValueUsd =
    Number.isFinite(quoteRate) && quoteRate > 0 ? pipValueQuote / quoteRate : null;
  const pipValueAccountCcy =
    Number.isFinite(pipValueUsd) && Number.isFinite(accountRate) ? pipValueUsd * accountRate : null;

  return {
    pair,
    pipSize: resolvedPipSize,
    units,
    lots: lotsNum,
    pipValueQuote,
    pipValueUsd,
    accountCurrency: accountCode,
    pipValueAccountCcy,
  };
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
  accountCurrency,
}) {
  const pipInfo = calcPipValueForLots({ pairId, lots, pipSize, rates, accountCurrency });
  if (!pipInfo) return null;

  const e = Number(entry);
  const tp = Number(takeProfit);
  const sl = Number(stopLoss);
  if (![e, tp, sl].every(Number.isFinite) || e <= 0 || e === sl) return null;

  const {
    pair,
    pipSize: resolvedPipSize,
    units,
    pipValueUsd,
    pipValueAccountCcy,
    accountCurrency: resolvedAccountCurrency,
    pipValueQuote,
  } = pipInfo;

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
    accountCurrency: resolvedAccountCurrency,
    pipValueAccountCcy,
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
      {/* Always rendered into the DOM (never unmounted) and toggled
          with the `hidden` attribute rather than `{open && ...}` —
          this is still visually collapsed by default, but it means
          all 5 answers in the Calculator Guide below are actually
          present in the page's HTML for crawlers to read, matching
          the FAQPage JSON-LD in components/calculators/
          CalculatorsStructuredData.jsx, which quotes this same text.
          An unmount-based accordion would leave 4 of 5 answers absent
          from the rendered DOM entirely, contradicting that schema. */}
      <div hidden={!open} className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
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
// Global Base Currency sync hook (inline — see the literal-constant
// note at the top of this file for why this reads localStorage/a
// CustomEvent directly instead of importing
// lib/baseCurrencyContext.js). Returns the header's current Base
// Currency selection so a panel can use it as its default "Account /
// Local Currency", without ever importing another project file.
// ---------------------------------------------------------------------------

function useGlobalBaseCurrency() {
  const [baseCurrency, setBaseCurrencyState] = useState("USD");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(GLOBAL_BASE_CURRENCY_STORAGE_KEY);
      if (stored) setBaseCurrencyState(stored);
    } catch {
      // Private browsing / blocked storage — stay on the "USD" default.
    }

    function handleChange(e) {
      const next = e?.detail || e?.newValue;
      if (next) setBaseCurrencyState(next);
    }

    window.addEventListener(GLOBAL_BASE_CURRENCY_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(GLOBAL_BASE_CURRENCY_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return baseCurrency;
}

/** Mirrors useGlobalBaseCurrency() above for the Language switcher —
 * returns just the 4 translated trading terms this page displays
 * (buy/sell/profit/loss), re-synced live when the header's Language
 * pill changes. */
function useCalcTerms() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(GLOBAL_LANGUAGE_STORAGE_KEY);
      if (stored) setLanguage(stored);
    } catch {
      // Private browsing / blocked storage — stay on the "en" default.
    }

    function handleChange(e) {
      const next = e?.detail || e?.newValue;
      if (next) setLanguage(next);
    }

    window.addEventListener(GLOBAL_LANGUAGE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(GLOBAL_LANGUAGE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return CALC_TERMS_BY_LANGUAGE[language] || CALC_TERMS_BY_LANGUAGE.en;
}

// ---------------------------------------------------------------------------
// Session persistence (Pro Trader Quick Win) — localStorage, inline,
// same zero-imports constraint as the rest of this file: a page reload
// (or coming back later the same day) restores exactly what was last
// entered in each mode — account balance, leverage, instrument, entry/
// TP/SL prices, risk %, etc. — rather than resetting every panel back
// to its hardcoded defaults. Each panel's inputs live under their own
// key inside ONE shared JSON blob, so panels never clobber each other's
// saved state. Best-effort only (wrapped in try/catch): a blocked or
// full localStorage (private browsing, storage quota) silently falls
// back to the in-memory defaults, same convention as
// hooks/useDashboardPresets.js and hooks/useAcademyProgress.js.
// ---------------------------------------------------------------------------

const CALCULATORS_STORAGE_KEY = "omnifin.calculators.inputs.v1";

function readStoredCalculatorInputs() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CALCULATORS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredCalculatorPanel(panelKey, panelState) {
  if (typeof window === "undefined") return;
  try {
    const all = readStoredCalculatorInputs();
    window.localStorage.setItem(
      CALCULATORS_STORAGE_KEY,
      JSON.stringify({ ...all, [panelKey]: panelState })
    );
  } catch {
    // Best-effort only — the panel keeps working from in-memory state
    // for the rest of this session even if persistence silently fails.
  }
}

/**
 * Persists one panel's plain-object input state under `panelKey` inside
 * the single shared localStorage blob above. Starts from `initial` on
 * both the server render and the first client render (so there's never
 * a hydration mismatch), then patches in whatever was saved for this
 * panel right after mount. Returns `[state, update]`, where `update`
 * works like a functional setState but always merges into the existing
 * object rather than replacing it outright — so a single field's
 * onChange (`update({ balance: e.target.value })`) never has to spread
 * every other field back in by hand.
 */
function usePersistedPanelState(panelKey, initial) {
  const [state, setState] = useState(initial);
  const hydratedRef = useRef(false);

  // Hydrate once, right after mount — never during SSR/first paint.
  useEffect(() => {
    const stored = readStoredCalculatorInputs()[panelKey];
    if (stored && typeof stored === "object") {
      setState((prev) => ({ ...prev, ...stored }));
    }
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelKey]);

  // Persist on every change AFTER hydration — guarded so the initial
  // (pre-hydration) default values are never written over whatever was
  // actually saved from a previous visit.
  useEffect(() => {
    if (!hydratedRef.current) return;
    writeStoredCalculatorPanel(panelKey, state);
  }, [panelKey, state]);

  const update = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  }, []);

  return [state, update];
}

/** "Account / Local Currency" dropdown shared by the panels that
 * display a secondary-currency figure (All-in-One, Pip Value) —
 * defaults to the header's global Base Currency, but a manual pick
 * here always overrides it for that panel (same pattern as the pip
 * size / pair pickers elsewhere on this page). */
function AccountCurrencySelect({ value, onChange, touched }) {
  const codes = Object.keys(FALLBACK_RATES);
  return (
    <label className="block">
      <FieldLabel>Account / Local Currency</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {codes.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-slate-400">
        {touched ? "Manually selected." : "Synced to the header's Base Currency."}
      </p>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Mode 1 — All-in-One Trade Execution Suite
// ---------------------------------------------------------------------------

const ALL_IN_ONE_DEFAULTS = {
  pairId: "EURUSD",
  lots: 0.18,
  direction: "buy",
  accountBalance: 10000,
  accountCurrency: "USD",
  accountCurrencyTouched: false,
  entry: 1.123,
  takeProfit: 1.223,
  stopLoss: 1.073,
  leverage: 100,
  pipSize: getDefaultPipSize("forex"),
};

function AllInOnePanel() {
  const { rates, status } = useLiveRates();
  const globalBaseCurrency = useGlobalBaseCurrency();
  const terms = useCalcTerms();
  const [inputs, update] = usePersistedPanelState("all-in-one", ALL_IN_ONE_DEFAULTS);
  const {
    pairId,
    lots,
    direction,
    accountBalance,
    accountCurrency,
    accountCurrencyTouched,
    entry,
    takeProfit,
    stopLoss,
    leverage,
    pipSize,
  } = inputs;

  const pair = getPair(pairId);

  // PHASE 3 — Cross-Tool URL Param Sync (see the constants above).
  // On first mount, `?instrument=` (if present and a pair this panel
  // actually trades) wins over the persisted panel state — so landing
  // here from the Watchlist, a Journal link, or any other page that
  // picked an instrument lands on that same instrument. After that,
  // picking a pair here keeps writing the param back (via
  // handlePairChange below), so the next tool this person opens
  // inherits it in turn.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appliedUrlInstrumentRef = useRef(false);

  useEffect(() => {
    if (appliedUrlInstrumentRef.current) return;
    appliedUrlInstrumentRef.current = true;
    const paramCode = normalizeInstrumentParam(searchParams.get(INSTRUMENT_PARAM_NAME));
    if (paramCode && paramCode !== pairId && TRADABLE_PAIRS.some((p) => p.id === paramCode)) {
      update({ pairId: paramCode, pipSize: getDefaultPipSize(getPair(paramCode).instrumentType) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function writeInstrumentParam(nextId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(INSTRUMENT_PARAM_NAME, nextId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handlePairChange(nextId) {
    update({ pairId: nextId, pipSize: getDefaultPipSize(getPair(nextId).instrumentType) });
    writeInstrumentParam(nextId);
  }

  // Keeps Account Currency synced to the header's global Base
  // Currency until the person manually picks a different one here (or
  // until a previously SAVED manual pick is restored on reload).
  useEffect(() => {
    if (!accountCurrencyTouched) update({ accountCurrency: globalBaseCurrency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalBaseCurrency, accountCurrencyTouched]);

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
        accountCurrency,
      }),
    [pair.id, lots, direction, entry, takeProfit, stopLoss, pipSize, rates, accountBalance, leverage, accountCurrency]
  );

  // PHASE 3 — One-Click Trade Journal Integration + Quick Export.
  const [journalNote, setJournalNote] = useState(null);
  const [exportNote, setExportNote] = useState(null);

  function handleLogToJournal() {
    const ok = appendToLocalJournal({
      instrument: pair.label,
      direction: direction === "sell" ? "Short" : "Long",
      size: lots,
      entryPrice: entry,
      exitPrice: "",
      openedAt: new Date().toISOString().slice(0, 10),
      closedAt: "",
      notes: result
        ? `Logged from Trading Calculator Suite — R:R ${result.ratioLabel}, leverage 1:${leverage}.`
        : "Logged from Trading Calculator Suite.",
    });
    setJournalNote(
      ok
        ? "Saved to your local Trade Journal — open /journal to view it (if you're signed in, confirm it synced to the cloud)."
        : "Couldn't save to this browser's local storage — try again or check your browser's privacy settings."
    );
  }

  function buildExportRows() {
    return [
      ["Field", "Value"],
      ["Instrument", pair.label],
      ["Order Type", direction === "sell" ? terms.sell : terms.buy],
      ["Lot Size", String(lots)],
      ["Entry Price", String(entry)],
      ["Take Profit", String(takeProfit)],
      ["Stop Loss", String(stopLoss)],
      ["Leverage", `1:${leverage}`],
      ["Account Balance", `${accountBalance} USD`],
      ["Account Currency", accountCurrency],
      [terms.profit, result && Number.isFinite(result.profitUsd) ? `$${safeFormat(result.profitUsd)}` : "—"],
      [terms.loss, result && Number.isFinite(result.lossUsd) ? `$${safeFormat(result.lossUsd)}` : "—"],
      ["Risk : Reward", result ? result.ratioLabel : "—"],
      ["Pip Value (USD)", result && Number.isFinite(result.pipValueUsd) ? `$${safeFormat(result.pipValueUsd)}` : "—"],
      ["Required Margin", result && Number.isFinite(result.requiredMargin) ? `$${safeFormat(result.requiredMargin)}` : "—"],
      ["Free Margin After Entry", result && Number.isFinite(result.freeMargin) ? `$${safeFormat(result.freeMargin)}` : "—"],
    ];
  }

  async function handleCopyAsTable() {
    const rows = buildExportRows();
    const tsv = rows.map((r) => r.join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
      setExportNote("Copied — paste directly into Excel, Sheets, or Notion.");
    } catch {
      setExportNote("Couldn't access the clipboard — try the CSV download instead.");
    }
  }

  function handleDownloadCsv() {
    const rows = buildExportRows();
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pair.id}-trade-calculation.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportNote("CSV downloaded.");
    } catch {
      setExportNote("Couldn't generate the CSV in this browser — try Copy as Table instead.");
    }
  }

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
          <TextInput min="0" step="0.01" value={lots} onChange={(e) => update({ lots: e.target.value })} />
        </label>

        <label className="block">
          <FieldLabel>Order Type</FieldLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update({ direction: "buy" })}
              aria-pressed={direction === "buy"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                direction === "buy"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {terms.buy}
            </button>
            <button
              type="button"
              onClick={() => update({ direction: "sell" })}
              aria-pressed={direction === "sell"}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                direction === "sell"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {terms.sell}
            </button>
          </div>
        </label>

        <label className="block">
          <FieldLabel>Account Balance (USD)</FieldLabel>
          <TextInput min="0" value={accountBalance} onChange={(e) => update({ accountBalance: e.target.value })} />
        </label>

        <label className="block">
          <FieldLabel>Entry Price</FieldLabel>
          <TextInput value={entry} onChange={(e) => update({ entry: e.target.value })} />
        </label>

        <label className="block">
          <FieldLabel>Take Profit Price</FieldLabel>
          <TextInput value={takeProfit} onChange={(e) => update({ takeProfit: e.target.value })} />
        </label>

        <label className="block">
          <FieldLabel>Stop Loss Price</FieldLabel>
          <TextInput value={stopLoss} onChange={(e) => update({ stopLoss: e.target.value })} />
        </label>

        <label className="block">
          <FieldLabel>Leverage</FieldLabel>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-600">1:</span>
            <TextInput min="1" step="1" value={leverage} onChange={(e) => update({ leverage: e.target.value })} />
          </div>
        </label>

        <PipSizePicker pair={pair} pipSize={pipSize} onChange={(size) => update({ pipSize: size })} />

        <AccountCurrencySelect
          value={accountCurrency}
          touched={accountCurrencyTouched}
          onChange={(code) => update({ accountCurrencyTouched: true, accountCurrency: code })}
        />
      </div>

      <div className="border-t border-blue-100 p-5">
        {result ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                tone="profit"
                label={terms.profit}
                value={Number.isFinite(result.profitUsd) ? `$${safeFormat(result.profitUsd)}` : "—"}
                sub={`${safeFormat(result.profitPips, 1)} pips`}
              />
              <StatCard
                tone="loss"
                label={terms.loss}
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
                sub={
                  Number.isFinite(result.pipValueAccountCcy)
                    ? `≈ ${safeFormat(result.pipValueAccountCcy)} ${result.accountCurrency}`
                    : "—"
                }
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
                {result.isLong ? terms.buy : terms.sell} order.
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

        {/* PHASE 3 — One-Click Trade Journal Integration + Quick Export */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-blue-100 pt-4">
          <button
            type="button"
            onClick={handleLogToJournal}
            className="rounded-lg border border-blue-500 bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            title="Saves this setup as an open position in your local Trade Journal (/journal)."
          >
            📓 Log to Journal
          </button>
          <button
            type="button"
            onClick={handleCopyAsTable}
            className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600"
          >
            Copy as Table
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600"
          >
            Download CSV
          </button>
          {(journalNote || exportNote) && (
            <span className="text-xs text-slate-500">{journalNote || exportNote}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode 2 — Position & Lot Size Calculator
// ---------------------------------------------------------------------------

const LOT_SIZE_DEFAULTS = { balance: 10000, riskPercent: 1, stopPips: 20, pipValuePerLot: 10 };

function LotSizePanel() {
  const [inputs, update] = usePersistedPanelState("lot-size", LOT_SIZE_DEFAULTS);
  const { balance, riskPercent, stopPips, pipValuePerLot } = inputs;

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
          <TextInput min="0" value={balance} onChange={(e) => update({ balance: e.target.value })} />
        </label>
        <label className="block">
          <FieldLabel>Risk per Trade (%)</FieldLabel>
          <TextInput min="0" value={riskPercent} onChange={(e) => update({ riskPercent: e.target.value })} />
        </label>
        <label className="block">
          <FieldLabel>Stop-Loss Distance (pips)</FieldLabel>
          <TextInput min="0" value={stopPips} onChange={(e) => update({ stopPips: e.target.value })} />
        </label>
        <label className="block">
          <FieldLabel>Pip Value per Standard Lot (USD)</FieldLabel>
          <TextInput min="0" value={pipValuePerLot} onChange={(e) => update({ pipValuePerLot: e.target.value })} />
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

const PIP_VALUE_DEFAULTS = {
  pairId: "EURUSD",
  lots: 0.18,
  pipSize: getDefaultPipSize("forex"),
  accountCurrency: "USD",
  accountCurrencyTouched: false,
};

function PipValuePanel() {
  const { rates, status } = useLiveRates();
  const globalBaseCurrency = useGlobalBaseCurrency();
  const [inputs, update] = usePersistedPanelState("pip-value", PIP_VALUE_DEFAULTS);
  const { pairId, lots, pipSize, accountCurrency, accountCurrencyTouched } = inputs;

  const pair = getPair(pairId);

  function handlePairChange(nextId) {
    update({ pairId: nextId, pipSize: getDefaultPipSize(getPair(nextId).instrumentType) });
  }

  useEffect(() => {
    if (!accountCurrencyTouched) update({ accountCurrency: globalBaseCurrency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalBaseCurrency, accountCurrencyTouched]);

  const result = useMemo(
    () => calcPipValueForLots({ pairId: pair.id, lots, pipSize, rates, accountCurrency }),
    [pair.id, lots, pipSize, rates, accountCurrency]
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
          <TextInput min="0" step="0.01" value={lots} onChange={(e) => update({ lots: e.target.value })} />
        </label>
        <PipSizePicker pair={pair} pipSize={pipSize} onChange={(size) => update({ pipSize: size })} />

        <AccountCurrencySelect
          value={accountCurrency}
          touched={accountCurrencyTouched}
          onChange={(code) => update({ accountCurrencyTouched: true, accountCurrency: code })}
        />
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
                {Number.isFinite(result.pipValueAccountCcy) ? `${safeFormat(result.pipValueAccountCcy)}` : "—"}{" "}
                {result.accountCurrency}
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

const MARGIN_DEFAULTS = { balance: 1000, leverage: 100, positionSize: 50000 };

function MarginPanel() {
  const [inputs, update] = usePersistedPanelState("margin", MARGIN_DEFAULTS);
  const { balance, leverage, positionSize } = inputs;

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
          <TextInput min="0" value={balance} onChange={(e) => update({ balance: e.target.value })} />
        </label>
        <label className="block">
          <FieldLabel>Position Size (USD notional)</FieldLabel>
          <TextInput min="0" value={positionSize} onChange={(e) => update({ positionSize: e.target.value })} />
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>Leverage</FieldLabel>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-600">1:</span>
            <TextInput min="1" step="1" value={leverage} onChange={(e) => update({ leverage: e.target.value })} />
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
          USD and then to your selected Account / Local Currency (defaults to the Base Currency
          set in the header) using the current exchange rate — exactly what Modes 1 and 3 compute
          live.
          <a
            href="/learn/apprentice/pips-and-lot-sizes"
            className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            Full lesson: Pips &amp; Lot Sizes →
          </a>
        </AccordionItem>
        <AccordionItem title="Lot sizing formulas">
          Position size is solved backward from how much you&apos;re willing to lose: Risk
          Amount = Account Balance × Risk %. Standard Lots = Risk Amount ÷ (Stop-Loss Pips × Pip
          Value per Standard Lot). Mini lots are 10× that figure, micro lots 100×, since a
          standard lot is 100,000 base-currency units (10,000 mini, 1,000 micro) — see Mode 2.
          <a
            href="/learn/pro-trader/position-sizing-math"
            className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            Full lesson: Position-Sizing Math →
          </a>
        </AccordionItem>
        <AccordionItem title="The 1–2% account risk rule">
          Most professional risk-management guidance caps the amount risked on any single trade
          at 1–2% of total account balance, so a string of losses doesn&apos;t cause lasting
          damage — e.g. on a $10,000 account, a 1% risk rule caps a single trade&apos;s potential
          loss at $100. Modes 1 and 2 both let you check your risk against this rule before you
          size a position.
          <a
            href="/learn/pro-trader/position-sizing-math"
            className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            Full lesson: Position-Sizing Math →
          </a>
        </AccordionItem>
        <AccordionItem title="Risk:Reward and margin">
          Risk:Reward compares potential reward to potential risk in dollar terms (e.g. 1:2 means
          you stand to make twice what you&apos;re risking). Required Margin is simply the
          position&apos;s notional value divided by your leverage ratio; Free Margin is what&apos;s
          left of your balance after that margin is set aside — a negative free margin means the
          position is too large for your account at that leverage. See Modes 1 and 4.
          <a
            href="/learn/pro-trader/risk-to-reward-ratio"
            className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            Full lesson: Risk:Reward Ratio →
          </a>
        </AccordionItem>
        <AccordionItem title="Inflation, compounding, and margin — Mode 5">
          Inflation math projects a nominal amount forward at a compounding annual rate to show
          what today&apos;s money will need to grow to just to keep its buying power. Compound
          growth does the reverse direction — projecting a starting balance plus regular monthly
          contributions forward at a compounding annual return. Both are long-horizon estimates,
          not guarantees.
          <a
            href="/tools/savings-inflation-calculator"
            className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            Try the plain-language Savings &amp; Inflation Calculator →
          </a>
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

const MODE_IDS = MODES.map((m) => m.id);

// ---------------------------------------------------------------------------
// PHASE 3 — High-Impact Economic Calendar Banner — WITHOUT an import.
//
// Duplicates components/TradingViewEconomicCalendar.jsx's anonymous
// script-injection pattern (same widget, same "no API key" embed:
// https://www.tradingview.com/widget-docs/widgets/calendars/economic-calendar/)
// at a compact banner height instead of that component's full 550px
// calendar, and filtered to `importanceFilter: "1"` (TradingView's own
// "high impact only" bucket — CPI, NFP, rate decisions, etc.) so it
// fits inline above the calculator inputs without pushing them far
// down the page. Not imported, per this file's zero-project-file-
// import rule above — if the widget script URL or its JSON config
// shape ever changes there, mirror the change here too.
const ECONOMIC_BANNER_WIDGET_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
const ECONOMIC_BANNER_HEIGHT = 240;

function EconomicCalendarBanner() {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoaded(false);
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = ECONOMIC_BANNER_WIDGET_SRC;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.text = JSON.stringify({
      colorTheme: "light",
      isTransparent: false,
      width: "100%",
      height: String(ECONOMIC_BANNER_HEIGHT),
      locale: "en",
      importanceFilter: "1",
      countryFilter: "us,eu,gb,jp,au,ca,ch,cn",
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-blue-100 px-4 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">High-Impact Events (CPI, NFP, Rate Decisions)</h3>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Live — TradingView</span>
      </div>
      <div className="relative" style={{ minHeight: ECONOMIC_BANNER_HEIGHT }}>
        {!loaded && (
          <div className="absolute inset-0 space-y-2.5 p-3" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-3 w-12 flex-shrink-0 animate-pulse rounded bg-slate-200" />
                <span className="h-3 w-8 flex-shrink-0 animate-pulse rounded bg-slate-200" />
                <span className="h-3 flex-1 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}
        <div ref={containerRef} className="tradingview-widget-container" />
      </div>
    </div>
  );
}

export default function CalculatorsPage() {
  const [activeMode, setActiveMode] = useState("all-in-one");

  // Restores the last-used mode on reload (e.g. a pro who always opens
  // this page to check Margin & Leverage doesn't land back on Mode 1
  // every time). Session persistence quick win — see
  // usePersistedPanelState() above for the per-panel field storage.
  useEffect(() => {
    const stored = readStoredCalculatorInputs().activeMode;
    if (typeof stored === "string" && MODE_IDS.includes(stored)) {
      setActiveMode(stored);
    }
  }, []);

  function handleModeChange(nextMode) {
    setActiveMode(nextMode);
    writeStoredCalculatorPanel("activeMode", nextMode);
  }

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
          {/* PHASE 3 — High-Impact Economic Calendar Banner, surfaced
              once here above every mode so CPI/NFP/rate-decision risk
              is visible no matter which calculator a trader opens. */}
          <EconomicCalendarBanner />

          {/* Mode selector — dropdown on mobile, pill tabs on larger screens */}
          <div className="sm:hidden">
            <label className="block">
              <span className="sr-only">Select a calculator mode</span>
              <select
                value={activeMode}
                onChange={(e) => handleModeChange(e.target.value)}
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
                  onClick={() => handleModeChange(mode.id)}
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
