"use client";

// components/AdSlot.jsx
//
// Reusable ad container slot for AdSense & Monetization Readiness.
// Every placement on the site (`/tools/*`, `/market-analysis`,
// `/converters/[pair]`) renders through this one component so there's
// a single place that decides how an ad slot behaves, rather than
// each page hand-rolling its own `adsbygoogle` markup.
//
// Two states, chosen by whether NEXT_PUBLIC_ADSENSE_CLIENT_ID and a
// `slot` id are both present:
//   - Not configured (the current state everywhere on this site,
//     since there's no live AdSense publisher ID yet — see
//     public/ads.txt): renders a quiet, clearly-labeled placeholder —
//     a thin divider, not a blank gap or a loud "ad here" box — so the
//     layout already looks and reserves space exactly like it will
//     once real ads go live.
//   - Configured: renders the real `<ins class="adsbygoogle">` unit
//     and pushes it to the adsbygoogle queue on mount.
//
// CLEAN UX / CLS GUARANTEE: both states render the SAME outer
// `minHeight`, set explicitly via inline style rather than left to
// the ad network's own (often zero until it loads) box size. That
// means turning AdSense on later — just setting the env var and a
// real `slot` id per placement — changes what's inside this box, not
// the box's size, so it can't introduce a layout shift (CLS) on a
// page that was already laid out around the placeholder.

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID } from "@/components/AdSense";

/**
 * @param {{
 *   slot?: string,        // AdSense ad-unit "data-ad-slot" id
 *   format?: string,      // "auto" (default) | "fluid" | etc.
 *   minHeight?: number,   // px — reserved height in BOTH states
 *   label?: string,       // small caption shown in both states
 *   className?: string,
 * }} props
 */
export default function AdSlot({
  slot,
  format = "auto",
  minHeight = 100,
  label = "Advertisement",
  className = "",
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const isConfigured = Boolean(ADSENSE_CLIENT_ID && slot);

  useEffect(() => {
    if (!isConfigured || pushedRef.current) return;
    if (typeof window === "undefined") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // Never let an ad-network hiccup (blocked script, network
      // error, ad blocker) surface as a page error — the placeholder
      // look (an empty, already-correctly-sized box) is a perfectly
      // safe fallback visual.
    }
  }, [isConfigured]);

  if (!isConfigured) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 ${className}`}
        style={{ minHeight }}
        aria-hidden="true"
      >
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight }}>
      <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
