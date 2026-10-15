"use client";

// components/TradingViewEconomicCalendar.jsx
//
// TradingView's free, official "Economic Calendar" embed widget — a
// genuinely live, real-time data feed (unlike the illustrative,
// pattern-projected table in components/EconomicCalendar.jsx, which
// stays in place below this as a filterable fallback/companion view).
// Same anonymous-embed pattern as components/TickerStrip.jsx: no API
// key, script injected into a ref'd container, cleaned up on unmount.
//
// Docs: https://www.tradingview.com/widget-docs/widgets/calendars/economic-calendar/
//
// AUDIT FIX: a fixed-height (550px) empty box used to sit blank until
// the script loaded and painted inside it — on a slow connection, a
// large blank rectangle reads as "broken," not "loading." A pulsing
// skeleton now fills that same height until the script's `onload`
// fires.

import { useEffect, useRef, useState } from "react";

const WIDGET_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
const WIDGET_HEIGHT = 550;

function CalendarSkeleton() {
  return (
    <div className="absolute inset-0 space-y-3 p-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="h-3 w-12 flex-shrink-0 animate-pulse rounded bg-slate-200" />
          <span className="h-3 w-8 flex-shrink-0 animate-pulse rounded bg-slate-200" />
          <span className="h-3 flex-1 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function TradingViewEconomicCalendar({ theme = "light" }) {
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
      colorTheme: theme,
      isTransparent: false,
      width: "100%",
      height: String(WIDGET_HEIGHT),
      locale: "en",
      importanceFilter: "-1,0,1",
      countryFilter: "us,eu,gb,jp,au,ca,ch,cn",
    });

    widgetContainer.appendChild(widgetDiv);
    widgetContainer.appendChild(script);

    return () => {
      widgetContainer.innerHTML = "";
    };
  }, [theme]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
      style={{ minHeight: WIDGET_HEIGHT }}
    >
      {!loaded && <CalendarSkeleton />}
      <div className="tradingview-widget-container" ref={widgetContainerRef} />
    </div>
  );
}
