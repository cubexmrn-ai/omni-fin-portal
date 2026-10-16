"use client";

// components/market-analysis/WatchlistStrip.jsx
//
// PHASE 3 ADDITION — compact multi-instrument watchlist strip for
// /market-analysis: Gold (XAU/USD), Bitcoin, EUR/USD, Crude Oil (WTI),
// and a DXY proxy row, each showing live price, Technical Bias
// score/label, 24h change (crypto only — see lib/marketPulse.js's
// header comment on why the rest show "—" rather than a faked
// figure), and a "near a key level" volatility flag.
//
// Clicking a row updates `?instrument=<code>` via
// lib/instrumentParam.js's useInstrumentParam() — the same shared URL
// param AiTechnicalAnalysis reads on mount (see that component's own
// "Phase 3" comment), so clicking Bitcoin here re-points the big
// On-Demand AI Technical Analysis panel above at Bitcoin too, with no
// page reload and no prop-drilling between the two components: they
// only share a URL.

import { useInstrumentParam, TECHNICAL_TO_CANONICAL } from "@/lib/instrumentParam";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const BIAS_TONE = {
  Bullish: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Bearish: "text-rose-600 bg-rose-50 border-rose-200",
  Neutral: "text-slate-500 bg-slate-100 border-slate-200",
};

function formatPrice(price, decimals) {
  if (!Number.isFinite(price)) return "—";
  return formatNumberSafe(price, { minimumFractionDigits: decimals ?? 2, maximumFractionDigits: decimals ?? 2 });
}

export default function WatchlistStrip({ rows }) {
  const [activeCode, setInstrument] = useInstrumentParam();

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-ink/60 p-4 text-sm text-slate-400">
        Watchlist unavailable right now — the live rate feed didn&apos;t resolve for any tracked
        instrument this request.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-ink/60 p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white">Watchlist</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Click an asset to load it above
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {rows.map((row) => {
          const canonicalCode = row.code === "DXY" ? "DXY" : TECHNICAL_TO_CANONICAL[row.code];
          const isActive = canonicalCode && canonicalCode === activeCode;
          const tone = BIAS_TONE[row.biasLabel] || BIAS_TONE.Neutral;

          return (
            <button
              key={row.code}
              type="button"
              onClick={() => canonicalCode && setInstrument(canonicalCode)}
              disabled={!canonicalCode}
              className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors ${
                isActive
                  ? "border-brand-400 bg-brand-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              } ${!canonicalCode ? "cursor-default opacity-80" : ""}`}
              title={
                canonicalCode
                  ? `Load ${row.label} in the AI Technical Analysis panel above.`
                  : `${row.label} — informational only, not wired into the AI Technical Analysis symbol list.`
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">{row.label}</span>
                {row.nearKeyLevel && (
                  <span
                    className="rounded-full border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300"
                    title="Price is currently within 1.5% of a computed support/resistance level — a zone that often sees sharper, faster moves."
                  >
                    ⚡ Key level
                  </span>
                )}
              </div>

              <span className="font-mono text-base font-bold text-white">
                {formatPrice(row.price, row.decimals)}
              </span>

              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className={`rounded-full border px-1.5 py-0.5 font-semibold ${tone}`}>
                  {row.biasLabel}
                </span>
                <span
                  className={Number.isFinite(row.change24h) ? (row.change24h >= 0 ? "text-emerald-400" : "text-rose-400") : "text-slate-500"}
                  title={Number.isFinite(row.change24h) ? "24h change (live, CoinGecko)" : "24h change needs price history this project doesn't store for this asset class — see the note on the Technical Analysis report's RSI/Moving Averages sections for the same honesty rule."}
                >
                  {Number.isFinite(row.change24h)
                    ? `${row.change24h >= 0 ? "+" : ""}${row.change24h.toFixed(2)}% 24h`
                    : "— 24h"}
                </span>
              </div>

              {!row.live && (
                <span className="text-[10px] text-slate-500">Fallback price — live feed unavailable</span>
              )}
              {row.isProxy && (
                <span className="text-[10px] text-slate-500">
                  Calculated proxy, not the official index
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
