"use client";

// components/AdSense.jsx
//
// Google AdSense script loader — mounted once in the root layout
// (app/layout.jsx), same pattern as components/GoogleAnalytics.jsx:
// a single next/script tag loaded `afterInteractive` so it never
// competes with the initial render for bandwidth/parse time, and a
// deliberate no-op (renders nothing, loads nothing) when
// NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't configured.
//
// This project doesn't have a live AdSense publisher ID yet — see
// public/ads.txt and env.example for where the real "pub-XXXXXXXXXX"
// value goes once the account is approved. Until then, this component
// is inert, and components/AdSlot.jsx (the per-placement ad container)
// renders its unobtrusive fallback placeholder everywhere instead of
// attempting to request a real ad with no client ID — both conditions
// are driven by the same env var, so they can never disagree about
// whether AdSense is "on".

import Script from "next/script";

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

export default function AdSense() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
