"use client";

import { useEffect, useRef } from "react";

const WIDGET_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

/**
 * Lightweight wrapper around TradingView's free "Advanced Chart" embed
 * widget. No API key required — it's a public script-tag embed.
 *
 * Docs: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 */
export default function TradingChart({
  symbol = "OANDA:XAUUSD",
  interval = "D",
  theme = "light",
  height = 500,
  allowSymbolChange = true,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous widget before re-mounting (e.g. on symbol change).
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      allow_symbol_change: allowSymbolChange,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, interval, theme, allowSymbolChange]);

  return (
    <div
      className="tradingview-widget-container overflow-hidden rounded-xl border border-slate-200"
      style={{ height, width: "100%" }}
      ref={containerRef}
    />
  );
}
