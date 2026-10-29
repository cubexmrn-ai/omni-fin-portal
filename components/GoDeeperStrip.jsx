"use client";

// components/GoDeeperStrip.jsx
//
// Oct 29 2026 GA4 review: /market-analysis (145 views) and /ai-news
// (52 views) are the site's #2 and #3 pages by traffic, combined
// bigger than the homepage — and until now, neither had a single
// in-content link toward Converters, Academy, or the Journal. Both
// pages are dense, self-contained dashboards/feeds genuinely worth
// consuming on their own (this isn't a "thin content" problem), but
// that also means a visitor has no obvious next step once they're
// done watching. One small, honest, identical strip on both closes
// that gap — three real, always-relevant destinations (every visitor
// here cares about rates, could use the free curriculum, and might
// want to log a trade), not a stretch for any single story the way a
// per-headline calculator match could be (see app/ai-news/[slug]/
// page.jsx's own Academy-CTA comment for that same reasoning).
//
// `source` is passed straight into the GA4 event so /market-analysis
// vs. the /ai-news hub are distinguishable in reporting without two
// near-duplicate components.

import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

const DESTINATIONS = [
  { href: "/converters", label: "Currency & Metals Converters", id: "converters" },
  { href: "/learn", label: "OmniFin Academy", id: "academy" },
  { href: "/journal", label: "Trading & Asset Journal", id: "journal" },
];

export default function GoDeeperStrip({ source }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-sm font-bold text-slate-900">Go deeper on OmniFin Portal</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {DESTINATIONS.map((dest) => (
          <Link
            key={dest.id}
            href={dest.href}
            onClick={() => trackEvent("go_deeper_click", { source, destination: dest.id })}
            className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {dest.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
