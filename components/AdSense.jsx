"use client";

// components/AdSense.jsx
//
// Google AdSense script loader — mounted once in the root layout's
// <head> (app/layout.jsx), per Google's own Next.js integration
// guidance for the account-verification/auto-ads snippet.
//
// strategy="beforeInteractive" (not afterInteractive, like
// components/GoogleAnalytics.jsx uses) is deliberate: it's the one
// next/script strategy Next.js guarantees gets injected into the
// server-rendered <head> of every page before hydration, which is
// what Google's site-ownership verification check and ads.txt
// crawler expect to find — afterInteractive would only add the tag
// to the DOM post-hydration, which is unnecessarily fragile for a
// one-time verification check.
//
// NEXT_PUBLIC_ADSENSE_CLIENT_ID can still override this (e.g. a
// future second property/client ID without touching this file), but
// defaults to this project's real, approved AdSense publisher ID —
// see public/ads.txt for the matching authorized-seller line. A
// "pub-" ID is meant to be public (it's embedded in every page's HTML
// and in ads.txt regardless), so hardcoding the default here is safe
// and means ad serving doesn't silently depend on a Vercel dashboard
// env var actually being set.
//
// components/AdSlot.jsx (the per-placement ad container) reads this
// same exported constant, so both stay in lockstep automatically.

import Script from "next/script";

export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-6715010917684796";

export default function AdSense() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
