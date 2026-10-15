"use client";

import { SCORE_LABEL_BANDS } from "@/lib/technicalAnalysis";

// Segment colors keyed to SCORE_LABEL_BANDS' keys in lib/technicalAnalysis.js
// — that file is the single source of truth for where each band's
// boundaries sit, so this component only ever reads them, never
// hard-codes its own -100..100 thresholds.
const BAND_COLORS = {
  strong_sell: "bg-rose-500",
  sell: "bg-rose-300",
  neutral: "bg-slate-300 dark:bg-slate-600",
  buy: "bg-emerald-300",
  strong_buy: "bg-emerald-500",
};

/**
 * A 5-segment Strong Sell → Strong Buy gauge bar with a marker pinned
 * at `score` (-100..100). Purely a visual rendering of a score that was
 * already computed server-side in lib/technicalAnalysis.js — this
 * component does no scoring of its own.
 */
export default function SentimentMeter({ score, compact = false, showLabels = true }) {
  const clamped = Math.min(100, Math.max(-100, Number.isFinite(score) ? score : 0));
  const markerPct = ((clamped + 100) / 200) * 100;

  return (
    <div>
      <div
        className={`relative w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 ${
          compact ? "h-2" : "h-3"
        }`}
      >
        <div className="flex h-full w-full">
          {SCORE_LABEL_BANDS.map((band) => (
            <div
              key={band.key}
              className={`h-full ${BAND_COLORS[band.key]}`}
              style={{ width: `${((band.max - band.min) / 200) * 100}%` }}
              title={band.label}
            />
          ))}
        </div>
        <div
          className="absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-slate-900 ring-2 ring-white transition-[left] duration-700 ease-out dark:bg-white dark:ring-slate-900"
          style={{ left: `${markerPct}%` }}
          aria-hidden="true"
        />
      </div>
      {showLabels && !compact && (
        <div className="mt-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {SCORE_LABEL_BANDS.map((band) => (
            <span key={band.key}>{band.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
