"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { INSTRUMENT_OPTIONS, ANALYSIS_TYPES } from "@/lib/technicalAnalysis";
import SentimentMeter from "@/components/SentimentMeter";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

// AUDIT FIX (Beginner persona): this report's own section titles are
// unavoidably jargon ("RSI / Moving Averages", "Pivot Points") with no
// explanation at the point of confusion. The 34-lesson Academy
// (lib/academyData.js) already explains every one of these terms in
// plain English — it just never linked from here. This maps each
// report section title to its matching Academy lesson (level id +
// lesson id, used as /learn/<level>/<lesson>), so "Learn More" sits
// right next to the term instead of requiring the visitor to find the
// Academy on their own. "Overall Sentiment" and "Price Action"/
// "Support & Resistance" use plain-enough language on their own and
// aren't included; where no exact lesson exists (Fundamental Bias,
// Pivot Points), this points at the closest real lesson rather than
// going unlinked.
const ACADEMY_LESSON_FOR_TITLE = {
  "Technical Bias": { level: "analyst", lesson: "support-resistance" },
  "Fundamental Bias": { level: "strategist", lesson: "central-bank-rates" },
  "Pivot Points": { level: "analyst", lesson: "support-resistance" },
  "RSI / Moving Averages": { level: "analyst", lesson: "rsi-indicator" },
  "Fibonacci Retracement": { level: "analyst", lesson: "fibonacci-retracements" },
  "Gann Theory": { level: "analyst", lesson: "gann-basics" },
};

// Report sections whose dataPoints read better as a dense, bordered
// label/value table (Pivot Points, Fibonacci, Oscillators, Gann,
// Confluence — all "many short rows of numbers") rather than the
// colored accent tiles used for Price Action / Support & Resistance,
// where highlighting WHICH number is support/resistance/current price
// is the point. Anything not listed here falls back to the tile grid.
const DENSE_TABLE_TITLES = new Set([
  "Pivot Points",
  "RSI / Moving Averages",
  "Multi-Timeframe Confluence",
  "Fibonacci Retracement",
  "Gann Theory",
]);

function AcademyLink({ title }) {
  const lesson = ACADEMY_LESSON_FOR_TITLE[title];
  if (!lesson) return null;
  return (
    <Link
      href={`/learn/${lesson.level}/${lesson.lesson}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
      title="New to this term? Learn it in the Academy."
    >
      Learn More
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

/**
 * Short, plain-English availability tag shown next to a section's
 * title — the same honest distinction as before (already computed in
 * lib/technicalAnalysis.js — never a new claim invented here): no
 * dataPoints at all = genuinely unavailable; a limitations note with
 * dataPoints present = an illustrative approximation; neither = a real
 * live calculation.
 *
 * UX FIX: when the top-level badge already tells the visitor this
 * whole report is running on live data (`reportIsLive`), repeating a
 * green "Live calculation" pill on every single card underneath it is
 * noise, not signal — so that pill is suppressed in that case. The
 * amber "Illustrative" and grey "Not available" pills are NEVER
 * suppressed: those are exactly the contradictions a visitor needs to
 * see even when the report overall is live (e.g. a swing couldn't be
 * detected for one particular section).
 */
function AvailabilityTag({ section, reportIsLive }) {
  if (!section) return null;
  const hasData = Array.isArray(section.dataPoints) && section.dataPoints.length > 0;

  if (!hasData && section.limitations) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
        Not available
      </span>
    );
  }
  if (hasData && section.limitations) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        Illustrative
      </span>
    );
  }
  if (reportIsLive) return null; // already covered by the one top-level "Live" badge.
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      Live
    </span>
  );
}

/**
 * Small "ⓘ" affordance carrying a section's methodology/limitations
 * text as a native tooltip (title attribute) — replaces the old
 * always-visible paragraph blocks under every card, which buried the
 * actual numbers under a wall of disclosure text. Nothing is hidden
 * (the full text is still there, on hover/focus/tap-and-hold), it's
 * just no longer competing with the data for attention by default.
 */
function InfoNote({ section }) {
  if (!section) return null;
  const text = [section.limitations, section.methodology ? `Method: ${section.methodology}` : null]
    .filter(Boolean)
    .join(" ");
  if (!text) return null;
  return (
    <span
      tabIndex={0}
      title={text}
      className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:border-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      aria-label="Methodology and limitations"
    >
      i
    </span>
  );
}

// Phase 2 item 1: the "so what?" Actionable Verdict — a plain-English
// outlook + invalidation line computed rule-based in
// lib/technicalAnalysis.js's buildActionableVerdict() (reusing the same
// real support/resistance/RSI/sentiment numbers already shown lower in
// the report, never a separately-invented claim). Rendered at the very
// top of the report, above the Overall Sentiment terminal panel, since
// it's the single most actionable line a visitor can read before
// digging into any individual card.
const VERDICT_TONE = {
  "Oversold Bounce Potential": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Bullish Continuation Bias": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Overbought Pullback Risk": "border-rose-500/40 bg-rose-500/10 text-rose-300",
  "Bearish Continuation / Distribution Phase": "border-rose-500/40 bg-rose-500/10 text-rose-300",
  "Range-Bound — Awaiting Confirmation": "border-slate-600 bg-slate-800/60 text-slate-300",
};

function VerdictPanel({ verdict }) {
  if (!verdict) return null;
  const toneClass = VERDICT_TONE[verdict.outlook] || VERDICT_TONE["Range-Bound — Awaiting Confirmation"];
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest opacity-80">
          Actionable Verdict
        </h4>
        <span className="font-mono text-sm font-bold tracking-tight">{verdict.outlook}</span>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed">{verdict.headline}</p>
    </div>
  );
}

const BIAS_TEXT_COLOR = {
  "Strong Buy": "text-emerald-700 dark:text-emerald-300",
  Buy: "text-emerald-600 dark:text-emerald-400",
  Neutral: "text-slate-600 dark:text-slate-300",
  Sell: "text-rose-600 dark:text-rose-400",
  "Strong Sell": "text-rose-700 dark:text-rose-300",
};

// Terminal-style numeric tone for the always-dark Overall Sentiment
// panel (a different palette than BIAS_TEXT_COLOR's light/dark-aware
// one, since this panel is intentionally dark regardless of site theme).
const TERMINAL_TEXT_COLOR = {
  "Strong Buy": "text-emerald-400",
  Buy: "text-emerald-400",
  Neutral: "text-slate-300",
  Sell: "text-rose-400",
  "Strong Sell": "text-rose-400",
};

function BiasCard({ title, score, label, note, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h4>
        <AcademyLink title={title} />
      </div>
      <p className={`mt-1 text-xl font-extrabold ${BIAS_TEXT_COLOR[label] || "text-slate-800"}`}>
        {label}
      </p>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
      <div className="mt-3">
        <SentimentMeter score={score} compact showLabels={false} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  );
}

// Classifies a Price Action / Support & Resistance data point by its
// label so Resistance levels get a subtle red accent, Support levels a
// subtle green accent, and the current live price a blue accent —
// everything else (distances, percentages) stays neutral. Pure string
// matching on the labels lib/technicalAnalysis.js already emits (e.g.
// "Resistance 1", "Support 2", "Nearest Resistance", "Live Price") —
// no new claims, just a visual read of data already there.
function classifyLevel(label) {
  const l = label.toLowerCase();
  if (l.includes("resistance")) return "resistance";
  if (l.includes("support")) return "support";
  if (l.includes("live price") || l === "live price") return "price";
  return "neutral";
}

const LEVEL_TILE_CLASS = {
  resistance:
    "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10",
  support:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
  price:
    "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10",
  neutral:
    "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40",
};

const LEVEL_VALUE_CLASS = {
  resistance: "text-rose-700 dark:text-rose-300",
  support: "text-emerald-700 dark:text-emerald-300",
  price: "text-brand-700 dark:text-brand-300",
  neutral: "text-slate-900 dark:text-slate-100",
};

function AccentTileGrid({ dataPoints }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {dataPoints.map((dp) => {
        const kind = classifyLevel(dp.label);
        return (
          <div
            key={dp.label}
            className={`rounded-lg border px-2.5 py-2 text-center ${LEVEL_TILE_CLASS[kind]}`}
          >
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{dp.label}</p>
            <p className={`mt-0.5 text-sm font-bold ${LEVEL_VALUE_CLASS[kind]}`}>{dp.value}</p>
          </div>
        );
      })}
    </div>
  );
}

// Clean bordered label/value rows for the data-dense sections (Pivot
// Points, Oscillators, Confluence, Fibonacci, Gann) — a tighter,
// tabular read than tiles once a section has 8-15 data points.
function DenseDataTable({ dataPoints }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 sm:grid-cols-2">
      {dataPoints.map((dp, i) => (
        <div
          key={dp.label}
          className={`flex min-w-0 items-center justify-between gap-3 px-3 py-1.5 ${
            i % 2 === 1 ? "sm:bg-slate-50 dark:sm:bg-slate-900/40" : ""
          } border-b border-slate-100 last:border-b-0 dark:border-slate-800 sm:[&:nth-last-child(-n+2)]:border-b-0`}
        >
          <span className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">{dp.label}</span>
          <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {dp.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Unified Vertical Price Ladder — replaces the old separate Pivot
// Points and Support & Resistance cards with one stacked ladder card:
// resistances above the live price (red), the live price/pivot
// highlighted in the middle (blue/amber), supports below (green), and
// a real distance-from-spot % next to every level. Pulls raw numbers
// straight from lib/technicalAnalysis.js's buildPriceLadder() (see
// its own header comment) rather than re-parsing any already-
// formatted string, so the % distances here are computed once, from
// the same real numbers the ladder itself displays.
const LADDER_TABS = [
  { key: "roundLevels", label: "Round Levels" },
  { key: "standard", label: "Standard" },
  { key: "woodie", label: "Woodie" },
  { key: "camarilla", label: "Camarilla" },
];

function LadderRow({ row }) {
  const isResistance = row.tier.startsWith("R");
  const isSupport = row.tier.startsWith("S");
  const toneClass = row.isCenter
    ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
    : isResistance
    ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
    : isSupport
    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
    : "border-slate-700 bg-slate-800/40 text-slate-300";

  return (
    // AUDIT FIX (mobile): this row used to have no shrink/truncation
    // rule on either child — on a narrow phone (320-375px) a longer
    // label ("R3 · Resistance 3") plus the price and its +/-% distance
    // could together exceed the row's width, and since the parent
    // PriceLadderCard clips with `overflow-hidden`, the overflow was
    // silently CUT OFF rather than wrapping or shrinking — the price
    // itself (the one number that must stay fully readable) could get
    // clipped. `min-w-0` on the row lets its children actually shrink
    // below their content size (required for `truncate` to work inside
    // a flex item); the label now truncates with an ellipsis first,
    // while the price/% span is `shrink-0` so it's never the one
    // sacrificed for space.
    <div className={`flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 ${toneClass}`}>
      <span className={`min-w-0 truncate text-[11px] font-bold uppercase tracking-wide ${row.isCenter ? "" : "opacity-70"}`}>
        {row.isCenter ? row.label : `${row.tier} · ${row.label}`}
      </span>
      <span className="flex shrink-0 items-baseline gap-2 font-mono">
        <span className={`text-sm font-bold tabular-nums ${row.isCenter ? "text-base" : ""}`}>
          {row.formatted}
        </span>
        {!row.isCenter && row.distPct !== null && (
          <span className="text-[11px] tabular-nums opacity-70">
            {row.distPct > 0 ? "+" : ""}
            {row.distPct.toFixed(2)}%
          </span>
        )}
      </span>
    </div>
  );
}

function PriceLadderCard({ ladder }) {
  const [activeTab, setActiveTab] = useState("roundLevels");
  if (!ladder) return null;

  const method = ladder.methods?.[activeTab];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold text-slate-50">Price Ladder</h4>
          <span
            tabIndex={0}
            title={
              ladder.limitations ||
              "Pivot points computed from the real previous complete session's high/low/close. Round Levels are nearest-round-number levels around the live price."
            }
            className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-slate-600 text-[10px] font-bold text-slate-400 hover:text-slate-200"
            aria-label="Methodology and limitations"
          >
            i
          </span>
        </div>
        {method && !method.isLive && activeTab !== "roundLevels" && (
          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            Illustrative
          </span>
        )}
        {method && method.isLive && activeTab !== "roundLevels" && method.prevDayDate && (
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            Live · prev session {method.prevDayDate}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Pivot method">
        {LADDER_TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active ? "bg-brand-600 text-white" : "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {method && (
        <div className="mt-3 space-y-1.5">
          {method.rows.map((row) => (
            <LadderRow key={row.tier + row.label} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportSection({ title, section, reportIsLive }) {
  if (!section) return null;
  const hasData = Array.isArray(section.dataPoints) && section.dataPoints.length > 0;
  const useDenseTable = DENSE_TABLE_TITLES.has(title);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">{title}</h4>
          <InfoNote section={section} />
        </div>
        <div className="flex items-center gap-1.5">
          <AvailabilityTag section={section} reportIsLive={reportIsLive} />
          <AcademyLink title={title} />
        </div>
      </div>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{section.summary}</p>

      {hasData && (useDenseTable ? (
        <DenseDataTable dataPoints={section.dataPoints} />
      ) : (
        <AccentTileGrid dataPoints={section.dataPoints} />
      ))}
    </div>
  );
}

/**
 * On-demand technical analysis panel. The person picks an instrument
 * and an analysis type and hits "Run Analysis" — each click is a fresh
 * GET to /api/market-ai, which always returns the full rule-based
 * report (Buy/Sell meter, Technical/Fundamental/Overall bias, Price
 * Action, Support/Resistance, Pivot Points, Oscillators, Confluence),
 * plus an additive Fibonacci or Gann section when selected. See
 * lib/technicalAnalysis.js for exactly what is and isn't genuinely
 * calculable for a given instrument/provider.
 */
export default function AiTechnicalAnalysis() {
  const [symbol, setSymbol] = useState(INSTRUMENT_OPTIONS[0].code);
  const [analysisType, setAnalysisType] = useState(ANALYSIS_TYPES[0].key);
  const [result, setResult] = useState(null);
  // AUDIT FIX: this used to start "idle" (an empty dashed placeholder
  // box) until a visitor manually hit "Run Analysis" — the single
  // richest tool on /market-analysis showed nothing on first paint.
  // Starting at "loading" (rather than "idle") plus the mount effect
  // below means the very first paint already shows the "Analyzing…"
  // state instead of a flash of the empty box, and a real, live report
  // (Gold, Full Report) lands moments later with no click needed.
  // Picking a different instrument/type afterward still requires the
  // explicit "Run Analysis" click, same as before.
  const [status, setStatus] = useState("loading"); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  // Empty deps: a one-time mount effect, not meant to re-run on every
  // symbol/analysisType change (that's what the button is for).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(
        `/api/market-ai?symbol=${encodeURIComponent(symbol)}&analysisType=${encodeURIComponent(
          analysisType
        )}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  const selectedAnalysisType = ANALYSIS_TYPES.find((a) => a.key === analysisType);

  // UX FIX (badge contradiction): there used to be TWO badges — a top
  // "Rule-based"/"AI-generated" pill about who WROTE the analysis, and
  // a separate "Real intraday candles via..." pill about the DATA it's
  // based on — which could read as contradictory ("Rule-based" next to
  // "Real intraday candles" looked like two different claims about the
  // same thing). This collapses both into exactly one top-level badge:
  // AI-generated (if that ever ships), else Live Intraday Data (when a
  // real candle series resolved), else Rule-based/illustrative (when it
  // didn't). `reportIsLive` is also what ReportSection uses to decide
  // whether to repeat a redundant green pill on every card below.
  const reportIsLive = Boolean(result?.usingAi || result?.usingLiveCandles);
  const topBadge = result?.usingAi
    ? { text: "AI-generated", tone: "live" }
    : result?.usingLiveCandles
    ? {
        text: `Live Intraday Data · ${result.candleSource === "twelvedata" ? "Twelve Data" : "Alpha Vantage"}`,
        tone: "live",
      }
    : { text: "Rule-based (illustrative)", tone: "muted" };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-brand-50 via-white to-slate-50 px-6 py-5 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
          On-Demand AI Technical Analysis
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pick an instrument and an analysis type, computed live — no
          paid API dependency.
        </p>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="ai-symbol-select"
              className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Instrument
            </label>
            <select
              id="ai-symbol-select"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {INSTRUMENT_OPTIONS.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ai-analysis-select"
              className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Analysis Type
            </label>
            <select
              id="ai-analysis-select"
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {ANALYSIS_TYPES.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={runAnalysis}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>

        {selectedAnalysisType && (
          <p className="mt-2.5 text-xs text-slate-400 dark:text-slate-500">
            {selectedAnalysisType.blurb}
          </p>
        )}

        <div className="mt-5">
          {status === "idle" && (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
              Select an instrument and analysis type, then run analysis.
            </p>
          )}

          {status === "error" && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              Couldn&apos;t run that analysis ({errorMessage}). Please try again.
            </p>
          )}

          {status === "ready" && result && (
            <div className="space-y-5">
              {/* Header: instrument + ONE status badge (see reportIsLive/topBadge comment above) */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {result.label} · {fmtPrice(result)}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    topBadge.tone === "live"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      topBadge.tone === "live" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {topBadge.text}
                </span>
              </div>

              {/* Actionable Verdict — the "so what?" line, above even
                  the Overall Sentiment panel since it's the most
                  directly useful read in the whole report. */}
              <VerdictPanel verdict={result.verdict} />

              {/* Overall meter — a dark, high-contrast "terminal" panel
                  regardless of site theme, so the headline read gets
                  the most visual weight on the page. */}
              {result.overallSentiment && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      Overall Market Sentiment
                    </h4>
                    <span
                      className={`font-mono text-base font-bold tracking-tight ${
                        TERMINAL_TEXT_COLOR[result.overallSentiment.label] || "text-slate-200"
                      }`}
                    >
                      {result.overallSentiment.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <SentimentMeter score={result.overallSentiment.score} />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    {result.overallSentiment.note}
                  </p>
                </div>
              )}

              {/* Technical / Fundamental / Overall bias cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {result.technicalBias && (
                  <BiasCard
                    title="Technical Bias"
                    subtitle="Long / Short signal"
                    score={result.technicalBias.score}
                    label={result.technicalBias.label}
                    note={result.technicalBias.note}
                  />
                )}
                {result.fundamentalBias && (
                  <BiasCard
                    title="Fundamental Bias"
                    subtitle={`USD proxy: ${result.fundamentalBias.usdState}`}
                    score={result.fundamentalBias.score}
                    label={result.fundamentalBias.label}
                    note={result.fundamentalBias.note}
                  />
                )}
                {result.overallSentiment && (
                  <BiasCard
                    title="Overall Sentiment"
                    subtitle="Blend of technical & fundamental"
                    score={result.overallSentiment.score}
                    label={result.overallSentiment.label}
                    note={result.overallSentiment.note}
                  />
                )}
              </div>

              {/* Price Action + the Unified Vertical Price Ladder (replaces
                  the old separate Pivot Points / Support & Resistance
                  cards — see PriceLadderCard's header comment) stacked
                  full-width, since the ladder reads best tall rather
                  than squeezed into a half-width grid cell. */}
              <div className="grid grid-cols-1 gap-3">
                <ReportSection title="Price Action" section={result.priceAction} reportIsLive={reportIsLive} />
                <PriceLadderCard ladder={result.priceLadder} />
              </div>

              {/* Remaining report sections */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <ReportSection title="RSI / Moving Averages" section={result.oscillators} reportIsLive={reportIsLive} />
                <ReportSection title="Multi-Timeframe Confluence" section={result.confluence} reportIsLive={reportIsLive} />
              </div>

              {/* Additive Fibonacci / Gann section */}
              {result.extra && (
                <ReportSection title={result.extra.label} section={result.extra} reportIsLive={reportIsLive} />
              )}

              {/* UI CLEAN-UP (Phase 2 item 1): when live market data is
                  loaded, the top badge + per-section tags already say
                  so — repeating the full raw engineNote methodology
                  string here too (the exact "this calculator
                  intentionally never asks an AI model..." sentence)
                  read as leftover developer disclosure cluttering the
                  bottom of an otherwise clean live report. That fuller
                  methodology text now only shows when the report is
                  NOT live (i.e. still worth disclosing as an
                  illustrative-data caveat); the live case gets a single
                  short disclaimer line instead. */}
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {!reportIsLive && result.engineNote} For informational purposes only — not financial advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtPrice(result) {
  if (!Number.isFinite(result?.price)) return "—";
  const decimals = result.price >= 100 ? 2 : 4;
  // Delegates to lib/formatNumber.js for the same safe clamping every
  // other formatter in the project now shares.
  return formatNumberSafe(result.price, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
