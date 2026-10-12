"use client";

// components/EconomicCalendar.jsx
//
// The "Full Economic Calendar" tab on app/ai-news/page.jsx — a
// ForexFactory-style filterable table (Impact: High/Medium/Low,
// Currency: USD/EUR/GBP/JPY/AUD/CAD/…), built from the plain
// serializable `events` prop the server component passes in (see
// lib/economicCalendar.js's getUpcomingEvents()).
//
// See that file's header comment for the honesty note this UI
// inherits: this is an illustrative schedule projected from each
// release's typical recurring pattern, not a confirmed live feed — the
// banner below says so plainly rather than letting the table's
// ForexFactory-style polish imply otherwise.

import { useMemo, useState } from "react";
import { IMPACT_LEVELS, CALENDAR_CURRENCIES, formatCountdown, formatEventClock } from "@/lib/economicCalendar";

const IMPACT_LABEL = { high: "High", medium: "Medium", low: "Low" };
const IMPACT_DOT = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-slate-400" };
const IMPACT_ROW_BADGE = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function EconomicCalendar({ events }) {
  const [impactFilter, setImpactFilter] = useState(new Set(IMPACT_LEVELS));
  const [currencyFilter, setCurrencyFilter] = useState(new Set(CALENDAR_CURRENCIES));

  function toggleImpact(level) {
    setImpactFilter((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }

  function toggleCurrency(code) {
    setCurrencyFilter((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const filtered = useMemo(
    () => events.filter((e) => impactFilter.has(e.impact) && currencyFilter.has(e.currency)),
    [events, impactFilter, currencyFilter]
  );

  return (
    <div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Illustrative schedule — each event is projected from its typical recurring release pattern
        (e.g. NFP is always the first Friday of the month), not pulled from a confirmed live
        economic-calendar feed. Treat times as approximate.
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Impact</span>
        {IMPACT_LEVELS.map((level) => (
          <FilterPill key={level} active={impactFilter.has(level)} onClick={() => toggleImpact(level)}>
            {IMPACT_LABEL[level]}
          </FilterPill>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Currency</span>
        {CALENDAR_CURRENCIES.map((code) => (
          <FilterPill key={code} active={currencyFilter.has(code)} onClick={() => toggleCurrency(code)}>
            {code}
          </FilterPill>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5">Time</th>
              <th className="px-4 py-2.5">Currency</th>
              <th className="px-4 py-2.5">Impact</th>
              <th className="px-4 py-2.5">Event</th>
              <th className="px-4 py-2.5 text-right">Countdown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                  No events match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={event.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatEventClock(event.timeIso)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                      {event.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${IMPACT_ROW_BADGE[event.impact]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${IMPACT_DOT[event.impact]}`} />
                      {IMPACT_LABEL[event.impact]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{event.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{event.note}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-600">
                    {formatCountdown(event.timeIso)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
