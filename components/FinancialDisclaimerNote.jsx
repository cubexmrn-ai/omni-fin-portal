// components/FinancialDisclaimerNote.jsx
//
// AdSense & Monetization Readiness — a compact, visible financial
// disclaimer for the pages that most need one under Google AdSense's
// financial-content policy (calculators, converters, trading/market
// tools): utility calculators and trading tools must make clear their
// output is educational/informational, not financial advice, and link
// to the full standing /disclaimer page. Deliberately a plain server
// component (static text + a Link) — no client state needed, so it
// costs nothing to render and can't affect this page's interactivity.

import Link from "next/link";

export default function FinancialDisclaimerNote({ className = "" }) {
  return (
    <p className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 ${className}`}>
      For educational and informational purposes only — not financial, investment, trading, legal
      or tax advice. See our full{" "}
      <Link href="/disclaimer" className="font-semibold underline hover:text-amber-900">
        Financial Disclaimer
      </Link>
      .
    </p>
  );
}
