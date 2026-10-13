"use client";

// components/EconomicCalendar.jsx
//
// The "Economic Calendar" tab on app/ai-news/page.jsx. Used to pair a
// hand-built, pattern-projected table with TradingView's official
// live widget; now that the real widget is live, the illustrative
// table was removed entirely (rather than kept as a "fallback") so
// there's a single, unambiguous source of calendar data on this page.

import TradingViewEconomicCalendar from "@/components/TradingViewEconomicCalendar";

export default function EconomicCalendar() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Live Economic Calendar</h2>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          Real-time · TradingView
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        A live, real-time economic calendar feed (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY) from
        TradingView — release times, actual/forecast/previous values, and impact, updated as they
        happen.
      </p>
      <div className="mt-3">
        <TradingViewEconomicCalendar />
      </div>
    </div>
  );
}
