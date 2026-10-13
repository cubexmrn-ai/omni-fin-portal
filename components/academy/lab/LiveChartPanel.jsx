"use client";

// components/academy/lab/LiveChartPanel.jsx
//
// A live line chart for the Demo Trading Lab's currently-selected
// instrument, built on TradingView's open-source `lightweight-charts`
// (v5 API: createChart() + chart.addSeries(LineSeries, options), not
// v4's removed chart.addLineSeries()).
//
// HONESTY NOTE: this project stores no historical OHLC/candle series
// anywhere (see lib/technicalAnalysis.js's header comment) — the only
// price source is the hourly-cached /api/rates spot snapshot (see
// lib/fetchRates.js). So this chart deliberately draws a LINE series
// that only accumulates live-polled points from the moment the Lab is
// opened — never a fabricated candle history. That limitation is
// disclosed directly in the chart's own caption, not hidden.

import { useEffect, useRef } from "react";
import { createChart, LineSeries } from "lightweight-charts";

export default function LiveChartPanel({ instrument, price, priceHistory }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Create the chart once per mount, destroy on unmount.
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)" },
        horzLines: { color: "rgba(148, 163, 184, 0.12)" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: "rgba(148, 163, 184, 0.25)",
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.25)",
      },
      crosshair: { mode: 0 },
    });

    const series = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
      priceLineVisible: true,
      lastValueVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // Intentionally re-created whenever the selected instrument changes
    // (via the `instrument.code` key below) — a fresh chart for a
    // fresh, instrument-specific price history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument?.code]);

  // Push the accumulated session price history into the series
  // whenever it grows, and fit the visible range to it.
  useEffect(() => {
    if (!seriesRef.current || !Array.isArray(priceHistory) || priceHistory.length === 0) return;
    seriesRef.current.setData(priceHistory);
    chartRef.current?.timeScale().fitContent();
  }, [priceHistory]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">{instrument?.label}</p>
          <p className="text-xs text-slate-400">Live line chart · session only</p>
        </div>
        <p className="text-lg font-extrabold text-slate-900">
          {Number.isFinite(price) ? price.toLocaleString(undefined, {
            minimumFractionDigits: instrument?.decimals ?? 2,
            maximumFractionDigits: instrument?.decimals ?? 2,
          }) : "—"}
        </p>
      </div>
      <div ref={containerRef} className="mt-3 h-64 w-full" />
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        This line plots real live prices polled from OmniFin&apos;s own rates feed (refreshed
        roughly hourly, not tick-by-tick) starting from when you opened the Lab — it is not a
        historical candle chart, since no historical price history is stored for this instrument.
      </p>
    </div>
  );
}
