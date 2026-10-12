"use client";

import { useState } from "react";
import TickerStrip from "@/components/TickerStrip";
import MarketDashboard from "@/components/MarketDashboard";
import AiTechnicalAnalysis from "@/components/AiTechnicalAnalysis";

// Top strip: a small set of high-value, universally-recognized
// symbols rather than the old 15-widget grid (S&P 500 / Nasdaq 100 /
// FTSE / DAX / Nikkei indices + 5 forex pairs + 5 crypto assets). All
// four symbols proven safe earlier in this project (see git history /
// README) — FOREXCOM's broad-index CFDs, OANDA's spot forex, and
// Bitstamp's BTC/USD feed are all free, anonymous-embed-friendly
// TradingView families.
const STRIP_SYMBOLS = [
  { code: "FOREXCOM:SPXUSD", label: "S&P 500" },
  { code: "FOREXCOM:NSXUSD", label: "Nasdaq 100" },
  { code: "OANDA:XAUUSD", label: "Gold" },
  { code: "BITSTAMP:BTCUSD", label: "BTC/USD" },
  { code: "OANDA:EURUSD", label: "EUR/USD" },
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
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Market Snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A live glance at the markets, a full chart for research, and
                on-demand technical analysis below.
              </p>
            </div>
            <ThemeToggle theme={theme} onChange={setTheme} />
          </div>

          <div className="mt-5">
            <TickerStrip symbols={STRIP_SYMBOLS} theme={theme} />
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-700">
          <MarketDashboard theme={theme} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700">
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <AiTechnicalAnalysis />
          </section>
        </div>
      </div>
    </div>
  );
}
