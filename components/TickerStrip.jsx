"use client";

import { useEffect, useRef } from "react";

const WIDGET_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";

/**
 * TradingView's free "Ticker Tape" embed widget — a slim, continuously
 * scrolling horizontal strip showing a handful of symbols' live price
 * + change. Purpose-built for exactly this "clean top bar" use case,
 * rather than stacking several Mini Symbol Overview cards side by side
 * (what the old, cluttered grid did). No API key required.
 *
 * Docs: https://www.tradingview.com/widget-docs/widgets/tickers/ticker-tape/
 */
export default function TickerStrip({ symbols, theme = "light" }) {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    const widgetContainer = widgetContainerRef.current;
    if (!widgetContainer) return;

    widgetContainer.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.text = JSON.stringify({
      symbols: symbols.map((s) => ({ proName: s.code, title: s.label })),
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: theme,
      locale: "en",
    });

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, [symbols, theme]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800">
      <div
        className="tradingview-widget-container"
        ref={widgetContainerRef}
      />
    </div>
  );
}
