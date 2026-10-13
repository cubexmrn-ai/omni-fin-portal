"use client";

// components/community/setup/SentimentGaugeCard.jsx
//
// One asset's Bullish/Bearish voting block + progress bar for the
// Live Community Sentiment Gauge. The percentages blend a seeded demo
// baseline with this browser's own real, switchable vote (see
// hooks/useSentimentVotes.js) — disclosed directly in the footnote
// rather than presented as a live cross-visitor tally, since this
// deployment has no backend to aggregate votes across visitors.

export default function SentimentGaugeCard({ label, counts, onVote }) {
  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-5 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <p className="text-sm font-bold text-white">{label}</p>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="flex h-full w-full">
          <div className="h-full bg-emerald-500" style={{ width: `${counts.bullishPercent}%` }} />
          <div className="h-full bg-rose-500" style={{ width: `${counts.bearishPercent}%` }} />
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-emerald-400">{counts.bullishPercent}% Bullish</span>
        <span className="text-rose-400">{counts.bearishPercent}% Bearish</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onVote("bullish")}
          className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
            counts.myVote === "bullish"
              ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
              : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
          }`}
        >
          Bullish
        </button>
        <button
          type="button"
          onClick={() => onVote("bearish")}
          className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
            counts.myVote === "bearish"
              ? "border-rose-400 bg-rose-500/20 text-rose-300"
              : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-rose-500/40 hover:text-rose-300"
          }`}
        >
          Bearish
        </button>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        {counts.total.toLocaleString()} votes · includes a seeded demo baseline plus your own vote
        {counts.myVote ? ` (you voted ${counts.myVote})` : ""}
      </p>
    </div>
  );
}
