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
    <div className="border-b border-slate-200 bg-white py-2">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-700 sm:flex">
          {t("homeTickerLabel")}
        </span>

        <div className="min-w-0 flex-1">
          <TickerStrip symbols={HOME_TICKER_SYMBOLS} theme="light" />
        </div>

        <Link
          href="/market-analysis"
          className="hidden shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700 sm:block"
        >
          {t("homeTickerCta")} →
        </Link>
      </div>
    </div>
  );
}
