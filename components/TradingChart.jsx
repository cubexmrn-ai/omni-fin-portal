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
  height = 600,
  allowSymbolChange = true,
}) {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    const widgetContainer = widgetContainerRef.current;
    if (!widgetContainer) return;

    // Clear any previous widget before re-mounting (e.g. on symbol change).
    widgetContainer.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      height: "100%",
      width: "100%",
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

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, [symbol, interval, theme, allowSymbolChange]);

  return (
    <div
      className="relative h-full min-h-[500px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      style={{ height }}
    >
      {/* TradingView requires its own container element to size against;
          this inner div fills the padded wrapper above completely. */}
      <div
        className="tradingview-widget-container h-full w-full"
        ref={widgetContainerRef}
      />
    </div>
  );
}
