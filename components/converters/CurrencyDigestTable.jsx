"use client";

// components/converters/CurrencyDigestTable.jsx
//
// Phase 2 pSEO addition — the sortable/searchable rate table for the
// "/converters/<base-code>" base-currency digest pages (e.g.
// /converters/pkr, /converters/usd, /converters/aed), listing that
// base currency against every other supported fiat currency.
//
// Rates are computed server-side (app/converters/[pair]/page.jsx, same
// getUnifiedRates() call every pair page already uses — never a
// client self-fetch of this deployment's own /api/rates route; see
// that page's header comment for why) and passed in here as a plain,
// already-sorted-by-code `rows` array. This component only handles
// client-side search and re-sorting of that same data — no network
// calls of its own, keeping this page exactly as zero-API as every
// other converter route.
//
// A missing rate (provider down for that one currency) renders as
// "—" rather than a guessed number or a hidden row, same honesty bar
// as the rest of the site's live-rate surfaces.

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/formatNumber";

const SORERS = {
  code: (a, b) => a.code.localeCompare(b.code),
  name: (a, b) => a.name.localeCompare(b.name),
  rate: (a, b) => (b.rate ?? -Infinity) - (a.rate ?? -Infinity),
};

export default function CurrencyDigestTable({ baseCode, rows }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter(
          (r) => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
        )
      : rows;
    return [...list].sort(SORERS[sortKey] || SORERS.name);
  }, [rows, query, sortKey]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search currency name or code…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none sm:max-w-xs"
        />
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Sort by:</span>
          {[
            { key: "name", label: "Name" },
            { key: "code", label: "Code" },
            { key: "rate", label: "Rate" },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortKey(opt.key)}
              className={`rounded-full px-2.5 py-1 font-semibold transition-colors ${
                sortKey === opt.key
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">No currency matches &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="max-h-[32rem] overflow-y-auto overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Currency</th>
                <th className="px-4 py-2 text-right font-semibold">
                  1 {baseCode} equals
                </th>
                <th className="px-4 py-2 text-right font-semibold sm:table-cell">Open page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-slate-800">{row.code}</span>
                    <span className="ml-1.5 text-xs text-slate-400">{row.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                    {Number.isFinite(row.rate)
                      ? formatNumber(row.rate, { maximumFractionDigits: 6 })
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/converters/${baseCode.toLowerCase()}-to-${row.code.toLowerCase()}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {baseCode} → {row.code} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
