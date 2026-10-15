"use client";

import { useEffect, useRef, useState } from "react";

const WIDGET_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

/**
 * Lightweight wrapper around TradingView's free "Advanced Chart" embed
 * widget. No API key required — it's a public script-tag embed.
 *
 * Docs: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/
 *
 * AUDIT FIX: this is the tallest embed on the site (600px by default)
 * and used to sit completely blank until the script loaded — the
 * largest, most visible "is this broken?" moment on the page on a slow
 * connection. A pulsing skeleton (a faux candlestick silhouette, not
 * just a gray block) now fills the same space until `onload` fires.
 */
function ChartSkeleton() {
  const bars = [40, 65, 50, 80, 55, 70, 45, 60, 85, 50, 65, 40, 75, 55, 90];
  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4" aria-hidden="true">
      <div className="flex h-full items-end gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 animate-pulse rounded-sm bg-slate-200 dark:bg-slate-700"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export default function TradingChart({
  symbol = "OANDA:XAUUSD",
  interval = "D",
  theme = "light",
  height = 600,
  allowSymbolChange = true,
}) {
  const widgetContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const widgetContainer = widgetContainerRef.current;
    if (!widgetContainer) return;

    setLoaded(false);
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
    script.onload = () => setLoaded(true);
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
      className="relative h-full min-h-[500px] w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      style={{ height }}
    >
      {!loaded && <ChartSkeleton />}
      {/* TradingView requires its own container element to size against;
          this inner div fills the padded wrapper above completely. */}
      <div
        className="tradingview-widget-container h-full w-full"
        ref={widgetContainerRef}
      />
    </div>
  );
}
