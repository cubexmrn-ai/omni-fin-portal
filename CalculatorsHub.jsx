"use client";

// components/calculators/CalculatorsHub.jsx
//
// The interactive body of the Calculators Hub (app/calculators/page.jsx).
// This page is now ENTIRELY the unified Trading Calculator Suite
// (components/calculators/TradingTerminal.jsx) — a single Selector Bar
// switching between 5 modes (All-in-One Trade Execution Suite,
// Position Sizing & Lot Calculator, Pip Value Calculator, Margin &
// Leverage Calculator, Inflation & Wealth Growth) — replacing the old
// scattered grid of 7 separate calculator cards split across
// "Trading Tools" / "Wealth & Personal Finance" category tabs.
//
// Split out as its own "use client" component so app/calculators/
// page.jsx itself can stay a plain server component with its own
// metadata export — same split used throughout this project
// (ConvertersTabs, AcademyHub, etc).
//
// Business Profit Margin & Markup isn't one of the 5 Suite modes (it's
// a business-math tool, not a trading/wealth one), so it keeps a
// single standalone card directly below the Suite rather than being
// dropped from the page entirely.

import ProfitMarginCalculator from "@/components/calculators/ProfitMarginCalculator";
import TradingTerminal from "@/components/calculators/TradingTerminal";

export default function CalculatorsHub() {
  return (
    <div>
      {/* Header */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <span className="hover:text-brand-600">Dashboard</span>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Calculators</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trading Calculator Suite
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            One unified, high-utility calculator for traders — position sizing, pip value,
            risk/reward, margin, and wealth growth, all synced to live rates. Pick a mode below
            to get started.
          </p>
        </div>
      </section>

      {/* The Trading Calculator Suite — the entire page's primary tool.
          Its own body is dark/glassmorphic by design (see its header
          comment), so this section drops the light bg-slate-50 page
          background used elsewhere while it's on screen. */}
      <section className="bg-slate-950/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <TradingTerminal />
        </div>
      </section>

      {/* Secondary: Business Profit Margin & Markup — not a Suite mode,
          kept as its own small card so the tool isn't lost. */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Also available
        </p>
        <div id="profit-margin" className="max-w-xl">
          <ProfitMarginCalculator />
        </div>
      </section>
    </div>
  );
}
