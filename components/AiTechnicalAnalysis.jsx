"use client";

import { useState } from "react";
import { INSTRUMENT_OPTIONS, ANALYSIS_TYPES } from "@/lib/technicalAnalysis";

/**
 * On-demand technical analysis panel. The person picks an instrument
 * and an analysis type and hits "Run Analysis" — each click is a fresh
 * GET to /api/market-ai, which computes a structured summary from the
 * live rates payload (see lib/technicalAnalysis.js for exactly what is
 * and isn't genuinely calculable without a stored price history).
 */
export default function AiTechnicalAnalysis() {
  const [symbol, setSymbol] = useState(INSTRUMENT_OPTIONS[0].code);
  const [analysisType, setAnalysisType] = useState(ANALYSIS_TYPES[0].key);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {result.label} · {result.analysisLabel}
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

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{result.summary}</p>

              {Array.isArray(result.dataPoints) && result.dataPoints.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {result.dataPoints.map((dp) => (
                    <div
                      key={dp.label}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center dark:border-slate-700 dark:bg-slate-800"
                    >
                      <p className="text-xs text-slate-400 dark:text-slate-500">{dp.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                        {dp.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.limitations && (
                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  {result.limitations}
                </p>
              )}

              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                {result.engineNote} For informational purposes only — not financial advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
