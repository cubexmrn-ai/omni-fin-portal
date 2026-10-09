"use client";

import { useState } from "react";
import TradingChart from "@/components/TradingChart";

const SYMBOLS = [
  { code: "OANDA:XAUUSD", label: "Gold (XAU/USD)" },
  { code: "FOREXCOM:SPXUSD", label: "S&P 500 (US)" },
  { code: "PSX:KSE100", label: "KSE-100 (Pakistan)" },
  { code: "NSE:NIFTY", label: "Nifty 50 (India)" },
  { code: "OANDA:EURUSD", label: "EUR/USD" },
  { code: "OANDA:GBPUSD", label: "GBP/USD" },
  { code: "BITSTAMP:BTCUSD", label: "Bitcoin (BTC/USD)" },
  { code: "TVC:USOIL", label: "Crude Oil (WTI)" },
];

export default function MarketDashboard() {
  const [symbol, setSymbol] = useState(SYMBOLS[0].code);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-50 via-white to-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Live Market Chart
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Real-time TradingView chart — pick a symbol or search for any
              other instrument inside the chart itself.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-6 py-3">
          {SYMBOLS.map((s) => {
            const active = s.code === symbol;
            return (
              <button
                key={s.code}
                type="button"
                onClick={() => setSymbol(s.code)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          <TradingChart symbol={symbol} height={520} />
        </div>
      </div>
    </section>
  );
}
