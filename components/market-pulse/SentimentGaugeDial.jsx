"use client";

// components/market-pulse/SentimentGaugeDial.jsx
//
// A semicircle speedometer dial for the composite sentiment score —
// the TradingView/Bloomberg-terminal-style replacement for the flat
// progress-bar banner that used to sit at the top of /market-analysis.
// Five equal-width arc segments (Strong Sell -> Strong Buy) read
// straight from lib/technicalAnalysis.js's SCORE_LABEL_BANDS, the same
// single source of truth SentimentMeter.jsx already uses — this is a
// different SHAPE for the same real score, never a second scoring
// system. bandFor() (lib/marketPulse.js) picks the active band exactly
// the way the rest of the site already does.
//
// The needle sweeps in from dead-center on mount (one deliberate
// load-time animation, not a hover effect repeated per card) via a CSS
// transform transition — see the angle state below.
//
// Geometry: a 240x150 viewBox, dial centered at (120, 132), radius 96.
// Score -100..100 maps linearly to needle rotation -90deg..90deg around
// that center, with 0 pointing straight up — so Strong Sell's band sits
// under the needle's leftmost sweep and Strong Buy under its rightmost,
// matching this component's own left-to-right band order below.

import { useEffect, useState } from "react";
import { SCORE_LABEL_BANDS } from "@/lib/technicalAnalysis";
import { bandFor } from "@/lib/marketPulse";

// Same semantic colors SentimentMeter.jsx uses for these exact band
// keys (its BAND_COLORS, as Tailwind classes) — kept as hex here only
// because SVG stroke can't take a Tailwind class, not a second palette.
const BAND_STROKE = {
  strong_sell: "#f43f5e", // rose-500
  sell: "#fda4af", // rose-300
  neutral: "#94a3b8", // slate-400 (needs to read on the dark dial background)
  buy: "#6ee7b7", // emerald-300
  strong_buy: "#10b981", // emerald-500
};

const CX = 120;
const CY = 132;
const R = 96;
const SEGMENT_SPAN = 100 / SCORE_LABEL_BANDS.length; // 20 — bands are equal width
const ARC_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

export default function SentimentGaugeDial({ score, size = 200 }) {
  const clamped = Math.min(100, Math.max(-100, Number.isFinite(score) ? score : 0));
  const band = bandFor(clamped);
  const targetAngle = (clamped / 100) * 90;

  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAngle(targetAngle));
    return () => cancelAnimationFrame(raf);
  }, [targetAngle]);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 240 150" className="w-full" role="img" aria-hidden="true">
        {/* Track underneath the colored bands, so any sub-pixel gaps
            between segments read as "track", not a hole. */}
        <path d={ARC_PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="22" />

        {SCORE_LABEL_BANDS.map((b, i) => (
          <path
            key={b.key}
            d={ARC_PATH}
            fill="none"
            stroke={BAND_STROKE[b.key]}
            strokeWidth="18"
            pathLength={100}
            strokeDasharray={`${SEGMENT_SPAN - 1.4} ${100 - (SEGMENT_SPAN - 1.4)}`}
            strokeDashoffset={-(i * SEGMENT_SPAN)}
          />
        ))}

        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: "transform 1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <line x1={CX} y1={CY} x2={CX} y2={CY - 76} stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <circle cx={CX} cy={CY} r="7" fill="#f8fafc" />
          <circle cx={CX} cy={CY} r="3" fill="#0b0f19" />
        </g>
      </svg>

      <div className="-mt-3 text-center" role="status">
        <p className="font-mono text-2xl font-bold leading-none text-white">
          {clamped > 0 ? "+" : ""}
          {Math.round(clamped)}
        </p>
        <p
          className="mt-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: BAND_STROKE[band.key] }}
        >
          {band.label}
        </p>
      </div>
    </div>
  );
}
