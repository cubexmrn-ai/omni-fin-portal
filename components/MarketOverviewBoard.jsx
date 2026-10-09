"use client";

import { useState } from "react";
import MiniSymbolWidget from "@/components/MiniSymbolWidget";
import MarketDashboard from "@/components/MarketDashboard";

// ---------------------------------------------------------------------------
// Symbol groups. TradingView tickers only — no API key required for any
// of these, same free public-embed widget family already used by
// TradingChart.jsx / MarketDashboard.jsx elsewhere in this project.
// ---------------------------------------------------------------------------

const INDEX_SYMBOLS = [
  { code: "FOREXCOM:SPXUSD", label: "S&P 500 (US)" },
  { code: "FOREXCOM:NSXUSD", label: "Nasdaq 100 (US)" },
  { code: "NSE:NIFTY", label: "Nifty 50 (India)" },
  { code: "PSX:KSE100", label: "KSE-100 (Pakistan)" },
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
                Global Markets Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Live TradingView mini-charts — indices, major forex pairs
                and top crypto assets at a glance.
              </p>
            </div>
            <ThemeToggle theme={theme} onChange={setTheme} />
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
