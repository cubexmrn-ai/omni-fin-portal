// lib/tradingCalculators.js
//
// Pure, UI-agnostic math for the four Trading Tools calculators on the
// Calculators Hub (app/calculators/page.jsx): Position & Lot Size,
// Pip Value, Risk/Reward Ratio, and Margin & Leverage. Kept dependency-
// free (no React, no fetch) so every function here is trivially unit-
// testable and reusable from any component, including the "mini
// widget" embeds used in Academy lessons and Converter pages.

// A standard lot is 100,000 units of the base currency; mini = 10,000;
// micro = 1,000. These are fixed, universal forex conventions — not
// configurable.
export const LOT_UNITS = {
  standard: 100000,
  mini: 10000,
  micro: 1000,
};

/**
 * Position & Lot Size Calculator.
 *
 * Solves backward from how much a trader is willing to lose: given an
 * account balance, a risk percentage, a stop-loss distance (in pips),
 * and the pip value of ONE standard lot (quote-currency dependent —
 * defaults to the common $10/pip-per-standard-lot USD-quoted-pair
 * figure, but is always editable since it varies by pair), returns the
 * ideal position size expressed in all three lot conventions.
 *
 * @param {{accountBalance:number, riskPercent:number, stopLossPips:number, pipValuePerStandardLot:number}} params
 * @returns {{riskAmount:number, standardLots:number, miniLots:number, microLots:number, units:number}|null}
 */
export function calculateLotSize({
  accountBalance,
  riskPercent,
  stopLossPips,
  pipValuePerStandardLot,
}) {
  const bal = Number(accountBalance);
  const risk = Number(riskPercent);
  const pips = Number(stopLossPips);
  const pipVal = Number(pipValuePerStandardLot);

  if (
    ![bal, risk, pips, pipVal].every(Number.isFinite) ||
    bal <= 0 ||
    risk <= 0 ||
    pips <= 0 ||
    pipVal <= 0
  ) {
    return null;
  }

  const riskAmount = bal * (risk / 100);
  const standardLots = riskAmount / (pips * pipVal);

  return {
    riskAmount,
    standardLots,
    miniLots: standardLots * 10,
    microLots: standardLots * 100,
    units: standardLots * LOT_UNITS.standard,
  };
}

// ---------------------------------------------------------------------------
// Pip Value Calculator — tradable pair registry
// ---------------------------------------------------------------------------
//
// Real, named pairs (rather than a bare "pick any quote currency"
// dropdown) so the pip size and contract size are both auto-detected
// from the pair itself instead of left for the user to guess. Each
// pair's `instrumentType` drives two things below: its default pip
// size (PIP_SIZE_OPTIONS) and its per-"lot" contract size
// (CONTRACT_SIZES) — e.g. a standard forex lot is 100,000 base-currency
// units, but a standard gold lot is conventionally 100 troy ounces, and
// crypto has no exchange-standardized "lot" at all (see the note on
// CONTRACT_SIZES.crypto below).
export const TRADABLE_PAIRS = [
  { id: "EURUSD", label: "EUR/USD", base: "EUR", quote: "USD", instrumentType: "forex" },
  { id: "GBPUSD", label: "GBP/USD", base: "GBP", quote: "USD", instrumentType: "forex" },
  { id: "USDJPY", label: "USD/JPY", base: "USD", quote: "JPY", instrumentType: "forex-jpy" },
  { id: "AUDUSD", label: "AUD/USD", base: "AUD", quote: "USD", instrumentType: "forex" },
  { id: "USDCAD", label: "USD/CAD", base: "USD", quote: "CAD", instrumentType: "forex" },
  { id: "USDCHF", label: "USD/CHF", base: "USD", quote: "CHF", instrumentType: "forex" },
  { id: "XAUUSD", label: "XAU/USD (Gold)", base: "XAU", quote: "USD", instrumentType: "metal" },
  { id: "BTCUSD", label: "BTC/USD", base: "BTC", quote: "USD", instrumentType: "crypto" },
];

export function getTradablePair(id) {
  return TRADABLE_PAIRS.find((p) => p.id === id) || null;
}

// Pip/tick size by instrument type. Metal (gold) genuinely has two
// conventions in use across brokers — $0.01 (1-cent) and $0.10 — so
// both are offered as selectable options rather than one being
// silently assumed; every other type has one unambiguous default.
export const PIP_SIZE_OPTIONS = {
  forex: [0.0001],
  "forex-jpy": [0.01],
  metal: [0.01, 0.1],
  // Crypto has no standardized "pip" convention at all — this project
  // treats one whole quote-currency unit ($1) as the smallest
  // reportable tick, which is called out explicitly in the UI rather
  // than presented as an official pip size.
  crypto: [1],
};

export function getDefaultPipSize(instrumentType) {
  return PIP_SIZE_OPTIONS[instrumentType]?.[0] ?? 0.0001;
}

// Contract size (base-currency units) per "lot" selection, by
// instrument type. Forex is the standard 100,000/10,000/1,000 units.
// Gold's standard lot is conventionally 100 troy ounces (10 mini, 1
// micro) — a different convention from forex, which is exactly why
// this is keyed by instrumentType rather than reusing LOT_UNITS
// directly. Crypto has no broker-standardized lot size at all, so
// "Standard/Mini/Micro" here is only this calculator's own stand-in
// scale (1 / 0.1 / 0.01 BTC) for a consistent 3-tier UI — not an
// industry convention, and labeled as such in the component.
export const CONTRACT_SIZES = {
  forex: { standard: 100000, mini: 10000, micro: 1000 },
  "forex-jpy": { standard: 100000, mini: 10000, micro: 1000 },
  metal: { standard: 100, mini: 10, micro: 1 },
  crypto: { standard: 1, mini: 0.1, micro: 0.01 },
};

/**
 * Pip Value Calculator.
 *
 * Pip value in the quote currency is simply pipSize × contract size in
 * units; converting that to USD/PKR uses a unified rates payload shaped
 * like { fiat: { CODE: unitsPerUsd } } (see lib/fetchRates.js /
 * app/api/rates/route.js) — the same shape every other calculator in
 * this project already consumes, so this function accepts it as a
 * plain object rather than fetching anything itself.
 *
 * @param {{pairId:string, lotType:keyof typeof CONTRACT_SIZES.forex, pipSize?:number, rates:Record<string,number>}} params
 */
export function calculatePipValue({ pairId, lotType, pipSize, rates }) {
  const pair = getTradablePair(pairId);
  if (!pair) return null;

  const quoteCode = pair.quote.toUpperCase();
  const contractSizes = CONTRACT_SIZES[pair.instrumentType] || CONTRACT_SIZES.forex;
  const units = contractSizes[lotType] ?? contractSizes.standard;
  const resolvedPipSize = Number.isFinite(pipSize) && pipSize > 0
    ? pipSize
    : getDefaultPipSize(pair.instrumentType);

  const pipValueQuote = resolvedPipSize * units;

  const safeRates = rates && typeof rates === "object" ? rates : {};
  const quoteRate = quoteCode === "USD" ? 1 : safeRates[quoteCode];
  const pkrRate = safeRates.PKR;

  // pipValueQuote is in units of the QUOTE currency. To convert to USD:
  // if quoteRate = (quote units per 1 USD), then USD = quote / quoteRate.
  const pipValueUsd = Number.isFinite(quoteRate) && quoteRate > 0
    ? pipValueQuote / quoteRate
    : null;
  const pipValuePkr = Number.isFinite(pipValueUsd) && Number.isFinite(pkrRate)
    ? pipValueUsd * pkrRate
    : null;

  return { pair, pipSize: resolvedPipSize, units, pipValueQuote, pipValueUsd, pipValuePkr };
}

/**
 * Risk / Reward Ratio Calculator.
 *
 * Works for any instrument (forex, metals, crypto, stocks) because it
 * never needs to know what a "pip" is — it just takes raw price levels
 * plus a position size in base-asset units, so the risk/reward in
 * price terms (the ratio) is asset-agnostic, and the dollar figures
 * scale with whatever position size is entered.
 *
 * @param {{entry:number, stopLoss:number, takeProfit:number, positionSize:number}} params
 */
export function calculateRiskReward({ entry, stopLoss, takeProfit, positionSize }) {
  const e = Number(entry);
  const sl = Number(stopLoss);
  const tp = Number(takeProfit);
  const size = Number(positionSize);

  if (![e, sl, tp, size].every(Number.isFinite) || size <= 0 || e === sl) {
    return null;
  }

  const riskPerUnit = Math.abs(e - sl);
  const rewardPerUnit = Math.abs(tp - e);
  const riskUsd = riskPerUnit * size;
  const rewardUsd = rewardPerUnit * size;
  const ratio = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : null;

  // Direction sanity check: is the take-profit even on the "winning"
  // side of entry relative to the stop-loss? (e.g. for a long trade,
  // stop below entry and target above). Purely informational — the
  // math above still works regardless, this just flags a likely typo.
  const isLong = sl < e;
  const directionConsistent = isLong ? tp > e : tp < e;

  return {
    riskPerUnit,
    rewardPerUnit,
    riskUsd,
    rewardUsd,
    ratio,
    ratioLabel: Number.isFinite(ratio) ? `1:${round(ratio, 2)}` : "—",
    isLong,
    directionConsistent,
  };
}

/**
 * Margin & Leverage Calculator.
 *
 * Required margin is simply the position's notional USD value divided
 * by the leverage ratio. Also reports the account's free margin and
 * margin level (%) — the standard broker-platform metric for how much
 * cushion remains before a margin call.
 *
 * @param {{accountBalance:number, leverage:number, positionSizeUsd:number}} params
 */
export function calculateMargin({ accountBalance, leverage, positionSizeUsd }) {
  const bal = Number(accountBalance);
  const lev = Number(leverage);
  const size = Number(positionSizeUsd);

  if (![bal, lev, size].every(Number.isFinite) || bal <= 0 || lev <= 0 || size <= 0) {
    return null;
  }

  const requiredMargin = size / lev;
  const freeMargin = bal - requiredMargin;
  const marginLevelPercent = requiredMargin > 0 ? (bal / requiredMargin) * 100 : null;
  const effectiveLeverage = size / bal;

  return {
    requiredMargin,
    freeMargin,
    marginLevelPercent,
    effectiveLeverage,
    isOverLeveraged: freeMargin < 0,
  };
}

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
