// app/calculators/layout.jsx
//
// A tiny Server Component sibling to app/calculators/page.jsx, which is
// now a fully self-contained "use client" page (see its own header
// comment for why). Next.js's App Router only allows a `metadata`
// export from a Server Component, so SEO metadata for /calculators
// lives here instead — this costs page.jsx zero imports (a layout
// isn't something a page imports; Next.js applies it by folder
// convention), so page.jsx's "no child imports" guarantee is untouched.
//
// This file is optional: if you don't need the <title>/description
// for /calculators, you can delete it and page.jsx will keep working
// exactly the same, just without page-specific metadata (it would fall
// back to whatever app/layout.jsx's root metadata provides).

import { buildMetadata } from "@/lib/pageMetadata";

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

export default function CalculatorsLayout({ children }) {
  return children;
}
