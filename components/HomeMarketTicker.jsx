"use client";

// components/HomeMarketTicker.jsx
//
// Homepage preview of the Live Market Snapshot from /market-analysis —
// reuses the exact same TradingView "Ticker Tape" widget
// (components/TickerStrip.jsx) and the same proven-safe free symbols
// already used there (see components/MarketOverviewBoard.jsx), so this
// is a true live pricing stream, not a static mockup. A CTA under the
// strip sends visitors to /market-analysis for the full interactive
// chart + AI technical analysis.

import Link from "next/link";
import TickerStrip from "@/components/TickerStrip";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const HOME_TICKER_SYMBOLS = [
  { code: "OANDA:XAUUSD", label: "XAU/USD (Gold)" },
  { code: "OANDA:EURUSD", label: "EUR/USD" },
  { code: "BITSTAMP:BTCUSD", label: "BTC/USD" },
  { code: "TVC:USOIL", label: "Crude Oil (WTI)" },
];

export default function HomeMarketTicker() {
  const { t } = useLanguage();
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("homeTickerLabel")}
          </p>
          <Link
            href="/market-analysis"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("homeTickerCta")}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
        <div className="mt-3">
          <TickerStrip symbols={HOME_TICKER_SYMBOLS} theme="light" />
        </div>
      </div>
    </section>
  );
}
