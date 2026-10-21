"use client";

// components/converters/AmountConversionCard.jsx
//
// Dark-themed, interactive conversion widget for the amount-specific
// pSEO pages (app/converters/[pair]/page.jsx's AmountPairSeoPage
// branch, e.g. /converters/2000-aed-to-pkr) — the page that actually
// targets a real search query like "2000 AED to PKR" rather than a
// bare pair.
//
// Deliberately NOT the existing light-themed <CurrencyConverter/> —
// that one's a general-purpose, pick-any-asset tool and still appears
// further down this same page for visitors who want to change the
// pair entirely. This card's whole job is to answer the ONE query the
// page was built for, instantly and prominently, in the dark "hero
// stat" visual language the rest of the homepage/market pages already
// use (see components/HomeSections.jsx's PulseCard, for example).
//
// INTERACTIVITY WITHOUT A NEW FETCH: the server-resolved `rate` passed
// in as a prop is a simple multiplier, so every "quick amount" button
// and the breakdown table below just recompute `amount * rate`
// entirely client-side — no re-fetch, no loading state, no risk of a
// second rate briefly disagreeing with the first.
//
// HONESTY NOTE (same bar as ConverterStructuredData.jsx): if `rate` is
// null (the server-side live-rate lookup failed), every number here
// renders as "—" rather than a fabricated or stale-looking figure —
// never silently falls back to some hardcoded placeholder rate.

import { useState } from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/formatNumber";

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];
const BREAKDOWN_UNITS = [1, 10, 100, 1000];

export default function AmountConversionCard({ amount, from, to, rate, fetchedAt }) {
  const [selected, setSelected] = useState(amount);

  const hasRate = Number.isFinite(rate);
  const convertedSelected = hasRate ? selected * rate : null;

  // Quick-amount row: the page's own anchor amount plus the standard
  // set above, deduplicated and sorted — so a page for "2000" shows
  // 100/500/1000/2000/5000 with 2000 already highlighted as active,
  // and a page for an amount outside that standard set (e.g. "750")
  // still includes its own value in the row rather than hiding it.
  const quickAmounts = Array.from(new Set([...QUICK_AMOUNTS, amount])).sort((a, b) => a - b);

  return (
    <section className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-ink p-6 text-white shadow-card sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-300">
              Live Conversion
            </span>
            {fetchedAt && (
              <span className="text-[11px] text-slate-400">
                Rate updated {new Date(fetchedAt).toUTCString()}
              </span>
            )}
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-400">
              {formatNumber(selected, { maximumFractionDigits: 2 })} {from.code} equals
            </p>
            <p className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {hasRate ? formatNumber(convertedSelected, { maximumFractionDigits: 2 }) : "—"}{" "}
              <span className="text-2xl font-bold text-slate-300 sm:text-3xl">{to.code}</span>
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {from.name} ({from.code}) to {to.name} ({to.code})
              {hasRate && (
                <>
                  {" · "}1 {from.code} = {formatNumber(rate, { maximumFractionDigits: 6 })}{" "}
                  {to.code}
                </>
              )}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick amounts
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickAmounts.map((qa) => {
                const active = qa === selected;
                return (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setSelected(qa)}
                    aria-pressed={active}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-brand-400 bg-brand-500 text-white"
                        : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {formatNumber(qa, { maximumFractionDigits: 0 })}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2 font-bold text-slate-300">{from.code}</th>
                  <th className="px-4 py-2 font-bold text-slate-300">{to.code}</th>
                </tr>
              </thead>
              <tbody>
                {BREAKDOWN_UNITS.map((unit, i) => (
                  <tr key={unit} className={i % 2 === 0 ? "" : "bg-white/[0.03]"}>
                    <td className="px-4 py-2 font-mono text-slate-200">
                      {formatNumber(unit, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-200">
                      {hasRate ? formatNumber(unit * rate, { maximumFractionDigits: 2 }) : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/10 bg-brand-500/10">
                  <td className="px-4 py-2 font-mono font-bold text-white">
                    {formatNumber(selected, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 font-mono font-bold text-white">
                    {hasRate ? formatNumber(convertedSelected, { maximumFractionDigits: 2 }) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {!hasRate && (
            <p className="mt-4 text-xs text-amber-300">
              Live rate temporarily unavailable — try the full converter below, which fetches
              rates independently.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/tools" className="font-semibold text-brand-300 hover:text-brand-200">
              Explore Utility Tools →
            </Link>
            <Link
              href="/market-analysis"
              className="font-semibold text-brand-300 hover:text-brand-200"
            >
              Live Market Charts →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
