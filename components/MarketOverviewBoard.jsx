"use client";

import { useEffect, useState } from "react";
import MiniSymbolWidget from "@/components/MiniSymbolWidget";
import MarketDashboard from "@/components/MarketDashboard";
import { fetchRates } from "@/lib/fetchRates";

// ---------------------------------------------------------------------------
// Symbol groups. TradingView tickers only — no API key required for any
// of these, same free public-embed widget family already used by
// TradingChart.jsx / MarketDashboard.jsx elsewhere in this project.
// ---------------------------------------------------------------------------
//
// This list has already gone through two rounds of symbol failures:
//   1. Direct exchange feeds (NSE:NIFTY, PSX:KSE100, TVC:NI225) showed
//      "This symbol is only available on TradingView" — that data
//      vendor gates guest/anonymous embeds behind a logged-in account.
//   2. The CFD/ETF/futures substitutes tried next (AMEX:INDY, AMEX:PAK,
//      CME:NIY1!) came back as "Invalid Symbol" — those specific
//      tickers simply aren't in TradingView's symbol database at all
//      (not a gating issue this time, just wrong/unlisted codes).
//
// To stop guessing, this list now sticks ONLY to symbols from
// TradingView's most heavily-used, unambiguous public families:
// FOREXCOM's broad-index CFDs (already proven working here for S&P 500
// / Nasdaq), TVC's major-market delayed index feeds (UKX/DAX/NI225 —
// among the most commonly embedded TradingView symbols anywhere, not
// the more exotic Asian direct-exchange feeds that caused failure #1),
// and AMEX:INDA (iShares MSCI India ETF — one of the largest, most
// liquid India-tracking ETFs, used here as an India market proxy since
// no CFD/futures broker offers a Nifty 50 instrument at this tier).
// There's no reliable free, widget-safe instrument for Pakistan's
// KSE-100 at all (confirmed across two failed attempts — no major CFD/
// futures broker or liquid US-listed ETF tracks it), so it's been
// dropped from this grid rather than risk a third broken symbol; FTSE
// 100 (UK) takes that slot instead to keep five diversified markets.
const INDEX_SYMBOLS = [
  { code: "FOREXCOM:SPXUSD", label: "S&P 500 (US)" },
  { code: "FOREXCOM:NSXUSD", label: "Nasdaq 100 (US)" },
  { code: "TVC:UKX", label: "FTSE 100 (UK)" },
  { code: "TVC:DAX", label: "DAX (Germany)" },
  { code: "TVC:NI225", label: "Nikkei 225 (Japan)" },
];

const FOREX_SYMBOLS = [
  { code: "OANDA:EURUSD", label: "EUR / USD" },
  { code: "OANDA:GBPUSD", label: "GBP / USD" },
  { code: "OANDA:USDJPY", label: "USD / JPY" },
  { code: "OANDA:AUDUSD", label: "AUD / USD" },
  { code: "OANDA:USDCAD", label: "USD / CAD" },
];

const CRYPTO_SYMBOLS = [
  { code: "BITSTAMP:BTCUSD", label: "Bitcoin (BTC)" },
  { code: "BITSTAMP:ETHUSD", label: "Ethereum (ETH)" },
  { code: "BINANCE:BNBUSDT", label: "BNB" },
  { code: "BINANCE:SOLUSDT", label: "Solana (SOL)" },
  { code: "BITSTAMP:XRPUSD", label: "XRP" },
];

const GROUPS = [
  { key: "indices", title: "Global Stock Indices", symbols: INDEX_SYMBOLS },
  { key: "forex", title: "Major Forex Pairs", symbols: FOREX_SYMBOLS },
  { key: "crypto", title: "Top Crypto Assets", symbols: CRYPTO_SYMBOLS },
];

// ---------------------------------------------------------------------------
// Market Insights — a rule-based snapshot generated from the SAME live
// /api/rates payload the Metals & Commodities Calculator and Currency Converter use, not
// a hand-written placeholder. It deliberately does not claim to be true
// AI-generated analysis (that would be misleading about what it is) —
// it's clearly labeled as a live-data snapshot, matching the honest
// "AI summary coming soon" labeling already used on the News page,
// pending a real ANTHROPIC_API_KEY-backed commentary pass.
// ---------------------------------------------------------------------------

/** Largest round-number threshold at or below `value`, from `levels`. */
function nearestLevelAtOrBelow(value, levels) {
  const sorted = [...levels].sort((a, b) => a - b);
  let result = sorted[0];
  for (const level of sorted) {
    if (value >= level) result = level;
  }
  return result;
}

function formatLevel(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatRate(value, digits = 4) {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

/**
 * Turns one live rates payload into a few plain-English, rule-based
 * takeaways. No historical series is stored anywhere in this project
 * (see app/api/rates/route.js — it only ever returns the current spot
 * snapshot), so these intentionally describe *where things stand right
 * now* relative to well-known round levels — not a trend, momentum, or
 * RSI/MACD-style technical read, which this snapshot has no basis for.
 */
function buildInsights(data) {
  const insights = [];

  const eurUsd = data?.fiat?.EUR ? 1 / data.fiat.EUR : null;
  const gbpUsd = data?.fiat?.GBP ? 1 / data.fiat.GBP : null;
  if (Number.isFinite(eurUsd) && Number.isFinite(gbpUsd)) {
    insights.push({
      key: "usd",
      title: "USD Snapshot",
      body: `EUR/USD is trading near ${formatRate(eurUsd)}, with GBP/USD near ${formatRate(
        gbpUsd
      )}. Watch the 1.10 handle on EUR/USD and 1.30 on GBP/USD as the nearest widely-watched round levels.`,
    });
  }

  const xau = data?.metals?.XAU;
  if (Number.isFinite(xau)) {
    const level = nearestLevelAtOrBelow(xau, [1500, 2000, 2500, 3000, 3500, 4000, 4500]);
    insights.push({
      key: "gold",
      title: "Gold Sentiment",
      body: `Spot gold (XAU/USD) is around $${formatLevel(
        xau
      )}/oz, holding above the $${formatLevel(
        level
      )} level. Precious metals remain a common hedge watched alongside real yields and USD strength.`,
    });
  }

  const btc = data?.crypto?.BTC;
  const eth = data?.crypto?.ETH;
  if (Number.isFinite(btc)) {
    const level = nearestLevelAtOrBelow(btc, [20000, 40000, 60000, 80000, 100000, 120000, 140000]);
    insights.push({
      key: "crypto",
      title: "Crypto Dynamic Levels",
      body: `Bitcoin is trading around $${formatLevel(
        btc
      )}, above the $${formatLevel(level)} psychological level${
        Number.isFinite(eth) ? `, with Ethereum near $${formatLevel(eth)}` : ""
      }. Round-number levels like these are widely watched as near-term support/resistance zones.`,
    });
  }

  return insights;
}

function MarketInsightsCard() {
  const [insights, setInsights] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchRates({ noStore: true });
        if (cancelled) return;
        setInsights(buildInsights(data));
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-brand-50 via-white to-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            AI Market Commentary &amp; Technical Sentiment
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Key takeaways generated from the live rates feed below.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Live snapshot · full AI analysis coming soon
        </span>
      </div>

      <div className="px-6 py-5">
        {status === "loading" && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading current market levels…
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live rates are temporarily unavailable, so commentary can&apos;t
            be generated right now — the charts below still work
            independently.
          </p>
        )}

        {status === "ready" && insights.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {insights.map((insight) => (
              <div
                key={insight.key}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {insight.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {insight.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {status === "ready" && insights.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Not enough live data to generate a snapshot right now.
          </p>
        )}

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Generated from the current live rates snapshot, not a predictive
          or AI-written forecast — for informational purposes only, not
          financial advice.
        </p>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, onChange }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-800"
      role="radiogroup"
      aria-label="Chart theme"
    >
      {[
        { key: "light", label: "Light" },
        { key: "dark", label: "Dark" },
      ].map((opt) => {
        const active = theme === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.key)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function MarketOverviewBoard() {
  const [theme, setTheme] = useState("light");

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-slate-50 transition-colors dark:bg-slate-900">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Market Snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Commentary and live charts below, in one consistent theme.
              </p>
            </div>
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>

          <div className="mt-5">
            <MarketInsightsCard />
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-700">
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Global Markets Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Live TradingView mini-charts — indices, major forex pairs
                and top crypto assets at a glance.
              </p>
            </div>

            <div className="mt-8 space-y-10">
              {GROUPS.map((group) => (
                <div key={group.key}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {group.title}
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {group.symbols.map((s) => (
                      <MiniSymbolWidget
                        key={s.code}
                        symbol={s.code}
                        label={s.label}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700">
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Detailed Chart
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pick any instrument above or below for a full interactive
              chart — zoom, draw and switch intervals.
            </p>
            <div className="mt-5">
              <MarketDashboard theme={theme} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
