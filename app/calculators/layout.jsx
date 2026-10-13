// app/calculators/layout.jsx
//
// A tiny Server Component sibling to app/calculators/page.jsx, which is
// now a fully self-contained "use client" page (see its own header
// comment for why). Next.js's App Router only allows a `metadata`
// export — and only renders real content for JSON-LD scripts — from a
// Server Component, so both SEO metadata and structured data for
// /calculators live here instead — this costs page.jsx zero imports (a
// layout isn't something a page imports; Next.js applies it by folder
// convention), so page.jsx's "no child imports" guarantee is untouched.
//
// CalculatorsStructuredData renders the SoftwareApplication +
// FAQPage JSON-LD for this route (see that file's own header comment).
//
// The `metadata` export is optional: if you don't need the
// <title>/description for /calculators, you can remove it and
// page.jsx will keep working exactly the same, just without
// page-specific metadata.

import Link from "next/link";
import { buildMetadata } from "@/lib/pageMetadata";
import CalculatorsStructuredData from "@/components/calculators/CalculatorsStructuredData";

export const metadata = {
  ...buildMetadata({
    title: "Trading Calculator Suite | OmniFin Portal",
    description:
      "A unified Trading Calculator Suite for traders and households: All-in-One Trade Execution (profit/loss, R:R, pip value, margin in one pass), Position & Lot Size, Pip Value & Custom Math, Margin & Leverage, and Wealth & Personal Finance (inflation, compound growth, profit margin).",
    path: "/calculators",
  }),
  keywords: [
    "trading calculator suite",
    "all-in-one trade calculator",
    "lot size calculator",
    "pip value calculator",
    "margin calculator",
    "leverage calculator",
    "inflation calculator",
    "compound interest calculator",
    "profit margin calculator",
    "forex position size calculator",
  ],
};

// A plain server-rendered link row — /calculators' own page.jsx is a
// "use client" file with zero imports (see its header comment) and so
// has no internal links of its own at all. Rendered here instead,
// below {children}, so this route isn't an internal-linking dead end:
// crawl depth and PageRank flow to the Academy, Market Analysis and
// Dashboard routes these calculators are conceptually tied to (lesson
// pages already embed and link back to several of these calculators —
// see components/academy/LessonViewer.jsx).
const RELATED_LINKS = [
  { href: "/learn", label: "Learn the formulas in OmniFin Academy" },
  { href: "/converters", label: "Currency, metals & crypto converter" },
  { href: "/market-analysis", label: "Live market analysis & charts" },
  { href: "/dashboard", label: "Your Dashboard" },
];

function RelatedToolsFooter() {
  return (
    <nav
      aria-label="Related tools and guides"
      className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-6 text-sm">
        {RELATED_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="font-medium text-brand-600 hover:underline">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function CalculatorsLayout({ children }) {
  return (
    <>
      <CalculatorsStructuredData />
      {children}
      <RelatedToolsFooter />
    </>
  );
}
