// lib/tradeSetupsData.js
//
// Pure data + helpers for the Trader Community & Setup Hub's new Setup
// Board and Sentiment Gauge (components/community/setup/*) — kept as
// its own file, separate from lib/communityData.js's general
// discussion-forum posts, since setups carry a different, more
// structured shape (instrument code, numeric entry/SL/TP, a computed
// Risk/Reward ratio) that the general forum posts don't need.
//
// Instrument codes/labels/kind are read from lib/technicalAnalysis.js's
// INSTRUMENT_OPTIONS — the project's single source of truth for
// instrument metadata — rather than re-defined here, so "XAU/USD",
// "BTC/USD" etc. always mean the same thing everywhere on the site.
//
// HONESTY NOTE (same discipline as lib/communityData.js's SEED_POSTS
// and the Social Buzz Tracker's "Simulated" badge): SEED_SETUPS and
// SENTIMENT_SEED_BASE below are illustrative demo data, not real trader
// activity — there's no backend in this deployment to aggregate real
// votes or setups across visitors. Every place this reaches the UI
// discloses that. A setup YOU post, or a vote YOU cast, is genuinely
// yours and genuinely stored (client-side, via the matching hook) —
// it's only the pre-seeded baseline that's illustrative.

import { INSTRUMENT_OPTIONS, INSTRUMENT_BY_CODE } from "@/lib/technicalAnalysis";

export { INSTRUMENT_OPTIONS };

export const SETUP_FILTER_TABS = [
  { id: "all", label: "All Setups" },
  { id: "forex", label: "Forex" },
  { id: "metals", label: "Metals & Commodities" },
  { id: "crypto", label: "Crypto" },
  { id: "highRR", label: "High R:R Setups" },
];

export const HIGH_RR_THRESHOLD = 2;

/** Maps an instrument's `kind` (lib/technicalAnalysis.js) to one of
 * this board's three asset-class filter tabs. Indices aren't offered
 * as an instrument here, so every kind resolves cleanly. */
export function getAssetClass(instrumentCode) {
  const instrument = INSTRUMENT_BY_CODE[instrumentCode?.toUpperCase()];
  if (!instrument) return null;
  if (instrument.kind === "metal" || instrument.kind === "commodity") return "metals";
  if (instrument.kind === "crypto") return "crypto";
  if (instrument.kind === "fx") return "forex";
  return null;
}

/** Risk/Reward ratio = reward distance ÷ risk distance. Returns null
 * (rendered as "—", never a fabricated ratio) if any price is missing
 * or the stop is placed exactly at entry (zero risk, undefined ratio). */
export function computeRiskReward(entry, stopLoss, takeProfit) {
  if (!Number.isFinite(entry) || !Number.isFinite(stopLoss) || !Number.isFinite(takeProfit)) {
    return null;
  }
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  if (risk <= 0) return null;
  return reward / risk;
}

// ---------------------------------------------------------------------------
// Seed setups — illustrative only (see header note). `authorHandle` is
// a made-up demo handle, same convention as lib/communityData.js's
// SEED_POSTS. A setup a real visitor posts via PostSetupModal carries
// isUserSubmitted: true and is labeled "You" instead of a handle — see
// hooks/useTradeSetups.js.
// ---------------------------------------------------------------------------
export const SEED_SETUPS = [
  {
    id: "setup-seed-1",
    authorHandle: "@goldpip_asif",
    instrumentCode: "XAU",
    bias: "buy",
    entry: 2652,
    stopLoss: 2634,
    takeProfit: 2698,
    rationale:
      "Gold reclaimed the 2,640 shelf that's held three times this month. Watching for a clean close above 2,655 before adding — this is a reaction to the shelf, not a confirmed breakout yet.",
    createdAt: "2026-10-09T06:12:00.000Z",
    isUserSubmitted: false,
  },
  {
    id: "setup-seed-2",
    authorHandle: "@fx_marnie",
    instrumentCode: "EURUSD",
    bias: "sell",
    entry: 1.0912,
    stopLoss: 1.0948,
    takeProfit: 1.082,
    rationale:
      "Price tagged the descending weekly trendline for a third time and is already rejecting. Stop sits just above the wick high — if this breaks and holds above instead, the whole short thesis is invalid.",
    createdAt: "2026-10-09T09:40:00.000Z",
    isUserSubmitted: false,
  },
  {
    id: "setup-seed-3",
    authorHandle: "@satoshi_sana",
    instrumentCode: "BTC",
    bias: "buy",
    entry: 67800,
    stopLoss: 66200,
    takeProfit: 72500,
    rationale:
      "Daily close back above the 68k range high after five sessions of compression, with volume confirming. Risking a defined amount against the range low rather than chasing.",
    createdAt: "2026-10-08T14:05:00.000Z",
    isUserSubmitted: false,
  },
  {
    id: "setup-seed-4",
    authorHandle: "@indextrader_leo",
    instrumentCode: "WTI",
    bias: "buy",
    entry: 71.4,
    stopLoss: 69.8,
    takeProfit: 76.2,
    rationale:
      "WTI pulled back exactly into the rising 4H trendline + prior breakout shelf confluence. Sizing small given this is still inside an extended move — a continuation trade, not a fresh breakout.",
    createdAt: "2026-10-09T11:22:00.000Z",
    isUserSubmitted: false,
  },
  {
    id: "setup-seed-5",
    authorHandle: "@silverstacker_q",
    instrumentCode: "XAG",
    bias: "buy",
    entry: 31.85,
    stopLoss: 30.9,
    takeProfit: 33.4,
    rationale:
      "Silver's been coiling under the 31.80 shelf for a week. Waiting for a confirmed close above before entering, since this level has rejected price twice already this month.",
    createdAt: "2026-10-08T21:10:00.000Z",
    isUserSubmitted: false,
  },
  {
    id: "setup-seed-6",
    authorHandle: "@ethwatcher_dev",
    instrumentCode: "ETH",
    bias: "sell",
    entry: 2480,
    stopLoss: 2560,
    takeProfit: 2260,
    rationale:
      "Rejected hard off the descending supply zone with a bearish engulfing candle on the 4H. Invalidated on a close back above the zone high.",
    createdAt: "2026-10-07T10:50:00.000Z",
    isUserSubmitted: false,
  },
  {
    id: "setup-seed-7",
    authorHandle: "@centralbank_watcher",
    instrumentCode: "GBPUSD",
    bias: "buy",
    entry: 1.2985,
    stopLoss: 1.2945,
    takeProfit: 1.3045,
    rationale:
      "Modest continuation long off the reclaimed daily pivot — tight stop, conservative target, this is a lower-conviction scalp-style idea rather than a swing position.",
    createdAt: "2026-10-06T08:15:00.000Z",
    isUserSubmitted: false,
  },
];

// Seeded baseline sentiment tallies for the 3 assets the Sentiment
// Gauge tracks — illustrative demo data (see header note). A visitor's
// own vote (hooks/useSentimentVotes.js) is tracked separately,
// client-side, and added on top of these at render time, the exact
// same "base + own state" pattern hooks/useCommunityPosts.js uses for
// post votes — so a single browser's vote is never double-counted
// across visits.
export const SENTIMENT_ASSET_CODES = ["XAU", "BTC", "EURUSD"];

export const SENTIMENT_SEED_BASE = {
  XAU: { bullish: 341, bearish: 206 },
  BTC: { bullish: 288, bearish: 254 },
  EURUSD: { bullish: 197, bearish: 223 },
};
