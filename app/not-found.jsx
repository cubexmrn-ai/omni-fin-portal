"use client";

// app/not-found.jsx
//
// Oct 2026 GA4-review finding: this project had no custom not-found
// page, so every dead link (a stale/typo'd URL, or bot/scanner traffic
// probing paths that never existed here, like /admin/youtube-importer
// and /api/cron/youtube — both real-world examples in the Sept 25-Oct
// 22 GA4 export, from a feature that was fully removed) fell through
// to Next.js's bare default 404. Two separate problems, both fixed
// here:
//
//   1. UX / retention: a real visitor who follows a dead or outdated
//      link got a plain, branding-free dead end with no way back into
//      the site except the browser's back button. This page gives
//      them real recovery paths instead.
//   2. Analytics data integrity: components/GoogleAnalytics.jsx mounts
//      unconditionally in the root layout (app/layout.jsx), which
//      wraps this not-found page exactly like every real page — so
//      every 404 hit was logging as an ordinary GA4 page_view,
//      indistinguishable in the Pages report from a genuine page view.
//      That's almost certainly why the Sept 25-Oct 22 export shows
//      "active users" and real-looking "engagement time" on URLs that
//      don't exist in this codebase at all. This page can't suppress
//      GoogleAnalytics.jsx's own automatic page_view (it fires on
//      every pathname change with no awareness of 404 status), but it
//      DOES fire an additional, distinctly-named `page_not_found`
//      event with the attempted path — giving a way to identify and
//      exclude this traffic from future GA4 analysis (filter by event
//      name, or segment out sessions where it fired) rather than
//      mixing it silently into "real" page engagement numbers.
//
// Next.js automatically serves this with a 404 HTTP status when it
// renders (the App Router's not-found.js convention) — no extra
// robots/noindex handling needed here.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

const RECOVERY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/converters", label: "Currency, Crypto & Metals Converter" },
  { href: "/tools", label: "Free Utility Tools" },
  { href: "/market-analysis", label: "Live Market Analysis" },
  { href: "/tools/zakat-calculator", label: "Zakat Calculator" },
];

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_not_found", { path: pathname });
  }, [pathname]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
        404 — Page Not Found
      </span>
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        The link you followed may be outdated, or the page may have moved. Here are a few
        places to pick back up:
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {RECOVERY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card hover:border-brand-300 hover:text-brand-700"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        ← Back to OmniFin Portal
      </Link>
    </div>
  );
}
