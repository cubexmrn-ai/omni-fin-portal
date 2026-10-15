"use client";

import { useEffect, useRef, useState } from "react";

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
 *
 * AUDIT FIX: this used to leave the container visually empty (sized,
 * so no layout shift, but blank) until TradingView's script loaded and
 * painted — on a slow connection that reads as "broken embed," not
 * "loading." A pulsing skeleton bar now covers the container until the
 * injected script's `onload` fires, then is removed.
 */
export default function TickerStrip({ symbols, theme = "light" }) {
  const widgetContainerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const widgetContainer = widgetContainerRef.current;
    if (!widgetContainer) return;

    setLoaded(false);
    widgetContainer.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => setLoaded(true);
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
    <div className="relative min-h-[46px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800">
      {!loaded && (
        <div className="absolute inset-0 flex items-center gap-4 px-3 py-2.5" aria-hidden="true">
          {symbols.map((s, idx) => (
            <span key={s.code || idx} className="h-3 w-20 flex-shrink-0 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      )}
      <div
        className="tradingview-widget-container"
        ref={widgetContainerRef}
      />
    </div>
  );
}
