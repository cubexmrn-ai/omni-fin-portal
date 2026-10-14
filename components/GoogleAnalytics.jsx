"use client";

// components/GoogleAnalytics.jsx
//
// GA4 integration, mounted once in the root layout (app/layout.jsx) so
// it loads on every route. Two pieces:
//   1. next/script-loaded gtag.js + the small inline bootstrap snippet
//      that defines window.dataLayer/window.gtag and fires the first
//      page_view via the standard `gtag('config', ...)` call.
//   2. A route-change effect (usePathname) that calls lib/gtag.js's
//      pageview() on every client-side navigation — the App Router
//      does these without a full page load, so without this GA4 would
//      only ever see the very first page view of a visit and the
//      dashboard would look like near-zero traffic.
//
// Deliberately uses usePathname() only, not useSearchParams() — the
// latter opts the whole route tree it's read in out of static
// rendering unless wrapped in its own <Suspense>, which would quietly
// push every statically-generated page on this site (there are many,
// for SEO) into dynamic rendering. Pathname-level pageviews are enough
// to fix "GA4 sees nothing"; query-string-level detail isn't worth
// that trade-off here.
//
// Renders nothing (both the scripts AND the effect are skipped) if
// NEXT_PUBLIC_GA_MEASUREMENT_ID isn't configured — this component is
// always mounted, but it's a deliberate no-op rather than ever loading
// gtag.js with an empty/undefined measurement ID.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/gtag";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    pageview(pathname);
  }, [pathname]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* The actual gtag.js library — loaded after the page becomes
          interactive so it never competes with the initial render for
          bandwidth/parse time. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      {/* The standard GA4 bootstrap snippet: defines window.dataLayer/
          window.gtag and sends the first page_view for this load. Kept
          as a separate, id'd next/script (rather than inlined into the
          tag above) so Next.js dedupes/orders it correctly relative to
          the library script above across client-side navigations. */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
