"use client";

import { useEffect, useState } from "react";
import { INSTRUMENT_OPTIONS, ANALYSIS_TYPES } from "@/lib/technicalAnalysis";
import SentimentMeter from "@/components/SentimentMeter";
import { formatNumber as formatNumberSafe } from "@/lib/formatNumber";

const BIAS_TEXT_COLOR = {
  "Strong Buy": "text-emerald-700 dark:text-emerald-300",
  Buy: "text-emerald-600 dark:text-emerald-400",
  Neutral: "text-slate-600 dark:text-slate-300",
  Sell: "text-rose-600 dark:text-rose-400",
  "Strong Sell": "text-rose-700 dark:text-rose-300",
};

function BiasCard({ title, score, label, note, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </h4>
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

function ReportSection({ title, section }) {
  if (!section) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">{title}</h4>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{section.summary}</p>

      {Array.isArray(section.dataPoints) && section.dataPoints.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {section.dataPoints.map((dp) => (
            <div
              key={dp.label}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-center dark:border-slate-700 dark:bg-slate-900/40"
            >
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{dp.label}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">{dp.value}</p>
            </div>
          ))}
        </div>
      )}

      {section.limitations && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {section.limitations}
        </p>
      )}

      {section.methodology && (
        <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
          Method: {section.methodology}
        </p>
      )}
    </div>
  );
}

/**
 * On-demand technical analysis panel. The person picks an instrument
 * and an analysis type and hits "Run Analysis" — each click is a fresh
 * GET to /api/market-ai, which always returns the full rule-based
 * report (Buy/Sell meter, Technical/Fundamental/Overall bias, Price
 * Action, Support/Resistance, Pivot Points, Oscillators), plus an
 * additive Fibonacci or Gann section when selected. See
 * lib/technicalAnalysis.js for exactly what is and isn't genuinely
 * calculable without a stored price history.
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
              {/* Header: instrument + AI/rule-based badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {result.label} · {fmtPrice(result)}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    result.usingAi
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      result.usingAi ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {result.usingAi ? "AI-generated" : "Rule-based"}
                </span>
              </div>

              {/* Big overall meter */}
              {result.overallSentiment && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Overall Market Sentiment
                    </h4>
                    <span
                      className={`text-lg font-extrabold ${
                        BIAS_TEXT_COLOR[result.overallSentiment.label] || "text-slate-800"
                      }`}
                    >
                      {result.overallSentiment.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <SentimentMeter score={result.overallSentiment.score} />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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

              {/* Full report sections */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <ReportSection title="Price Action" section={result.priceAction} />
                <ReportSection title="Support & Resistance" section={result.supportResistance} />
                <ReportSection title="Pivot Points" section={result.pivotPoints} />
                <ReportSection title="RSI / Moving Averages" section={result.oscillators} />
              </div>

              {/* Additive Fibonacci / Gann section */}
              {result.extra && <ReportSection title={result.extra.label} section={result.extra} />}

              <p className="text-xs text-slate-400 dark:text-slate-500">
                {result.engineNote} For informational purposes only — not financial advice.
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
