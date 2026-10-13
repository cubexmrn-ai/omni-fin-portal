// lib/demoTradingInstruments.js
//
// The 4 instruments offered in the Academy's Interactive Demo Trading
// Lab (components/academy/TradingLab.jsx): Gold, Bitcoin, EUR/USD and
// Crude Oil. Deliberately NOT a fresh set of instrument definitions —
// `code`/`label`/`kind`/`assetCode`/`invert`/`decimals` are read
// straight from lib/technicalAnalysis.js's INSTRUMENT_BY_CODE (the
// project's single source of truth for resolving a live USD price from
// a getUnifiedRates() payload), via resolveInstrumentPrice(). This file
// only adds the extra fields a *simulated* trading engine needs that
// technicalAnalysis.js has no reason to carry: a contract size and a
// flat illustrative leverage ratio.
//
// HONESTY NOTE (see lib/technicalAnalysis.js's own header comment for
// the project-wide convention this follows): there is no real broker
// behind this Lab, so "contract size" and "leverage" below are not real
// market conventions quoted from any exchange — they're simplified,
// clearly-labeled teaching conventions chosen to make lot-size math
// behave the way a real CFD/forex account's does, so the Academy's risk
// -management lessons (position sizing, SL/TP, margin) transfer. The
// Lab's UI must disclose this; this file just centralizes the numbers.

import { INSTRUMENT_BY_CODE } from "@/lib/technicalAnalysis";

// A flat, illustrative 1:100 margin requirement across every
// instrument in the Lab — real brokers vary this by instrument and
// jurisdiction; this is a single simplified number chosen for teaching
// clarity, not a quoted real-world figure.
export const DEMO_LEVERAGE = 100;

export const DEMO_STARTING_BALANCE = 10000;

// contractSize = units of the underlying per 1.00 lot.
export const DEMO_LAB_INSTRUMENTS = [
  {
    ...INSTRUMENT_BY_CODE.XAU,
    contractSize: 100, // 100 troy oz / lot — standard full-lot gold CFD convention
    minLots: 0.01,
    lotStep: 0.01,
  },
  {
    ...INSTRUMENT_BY_CODE.BTC,
    contractSize: 1, // 1 BTC / lot
    minLots: 0.01,
    lotStep: 0.01,
  },
  {
    ...INSTRUMENT_BY_CODE.EURUSD,
    contractSize: 100000, // 100,000 units / standard lot — standard forex convention
    minLots: 0.01,
    lotStep: 0.01,
  },
  {
    ...INSTRUMENT_BY_CODE.WTI,
    contractSize: 1000, // 1,000 barrels / lot — standard WTI CFD convention
    minLots: 0.01,
    lotStep: 0.01,
  },
];

export const DEMO_LAB_INSTRUMENT_BY_CODE = DEMO_LAB_INSTRUMENTS.reduce((acc, i) => {
  acc[i.code] = i;
  return acc;
}, {});

export function getDemoLabInstrument(code) {
  return DEMO_LAB_INSTRUMENT_BY_CODE[code?.toUpperCase()] || null;
}

/** Margin required to open `lots` of `instrument` at `price`, under the
 * flat DEMO_LEVERAGE above. */
export function computeRequiredMargin(instrument, lots, price) {
  if (!instrument || !Number.isFinite(lots) || !Number.isFinite(price)) return 0;
  return (price * lots * instrument.contractSize) / DEMO_LEVERAGE;
}

/** Floating or realized PnL for a single position/trade. `side` is
 * "buy" or "sell"; a buy profits when markPrice > entryPrice. */
export function computePnl(instrument, side, lots, entryPrice, markPrice) {
  if (!instrument || !Number.isFinite(lots) || !Number.isFinite(entryPrice) || !Number.isFinite(markPrice)) {
    return 0;
  }
  const direction = side === "sell" ? -1 : 1;
  return (markPrice - entryPrice) * lots * instrument.contractSize * direction;
}
