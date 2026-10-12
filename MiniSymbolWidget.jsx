"use client";

import { useEffect, useRef } from "react";

const WIDGET_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";

/**
 * Lightweight wrapper around TradingView's free "Mini Symbol Overview"
 * embed widget — a small price + sparkline card. No API key required.
 *
 * Currently unused by components/MarketOverviewBoard.jsx — the Market
 * Analysis page was rebuilt around a single TickerStrip.jsx (ticker-
 * tape widget) instead of a grid of a dozen-plus of these cards, to
 * keep the page clean rather than cluttered. Kept here as a reusable
 * building block for any future page that wants a small per-symbol
 * price card.
 *
 * Docs: https://www.tradingview.com/widget-docs/widgets/charts/mini-chart/
 */
export default function MiniSymbolWidget({
  symbol,
  label,
  theme = "light",
  dateRange = "12M",
  height = 220,
}) {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    const widgetContainer = widgetContainerRef.current;
    if (!widgetContainer) return;

    // Clear any previous widget instance before re-mounting (symbol or
    // theme change re-runs this effect — TradingView widgets don't
    // support being reconfigured in place, they need a fresh script tag).
    widgetContainer.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.text = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange,
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    });

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, [symbol, theme, dateRange]);

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-colors dark:border-slate-700 dark:bg-slate-800"
      title={label || symbol}
    >
      <div
        className="tradingview-widget-container relative w-full"
        style={{ height }}
        ref={widgetContainerRef}
      />
    </div>
  );
}
