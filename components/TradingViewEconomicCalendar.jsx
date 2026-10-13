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

import { useEffect, useRef } from "react";

const WIDGET_SRC =
  "https://s3.tradingview.com/external-embedding/embed-widget-events.js";

export default function TradingViewEconomicCalendar({ theme = "light" }) {
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
      colorTheme: theme,
      isTransparent: false,
      width: "100%",
      height: "550",
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="tradingview-widget-container" ref={widgetContainerRef} />
    </div>
  );
}
