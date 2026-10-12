"use client";

// components/calculators/CalculatorsHub.jsx
//
// The interactive body of the Calculators Hub (app/calculators/page.jsx):
// category tabs ("Trading Tools" vs. "Wealth & Personal Finance").
// Split out as its own "use client" component so app/calculators/page.jsx
// itself can stay a plain server component with its own metadata export
// — same split used throughout this project (ConvertersTabs, AcademyHub,
// etc).
//
// "Trading Tools" now renders the unified Trading Calculator Terminal
// (components/calculators/TradingTerminal.jsx) — a single tabbed tool
// (All-in-One Trade Execution Suite, Position & Lot Size, Pip Value &
// Custom Trade Math, Margin & Leverage, Inflation & Wealth Growth) that
// replaced the old scattered grid of separate calculator cards.
// "Wealth & Personal Finance" keeps the household-finance calculators
// (Inflation, Compound Growth, Profit Margin) as their own standalone
// cards, since the Terminal's "Inflation & Wealth Growth" tab covers the
// trading-adjacent use case but a household user browsing this category
// still wants Profit Margin alongside them.

import { useState } from "react";
import { CALCULATOR_CATEGORIES, getCalculatorsByCategory } from "@/lib/calculatorsRegistry";
import TradingTerminal from "@/components/calculators/TradingTerminal";
import InflationCalculator from "@/components/calculators/InflationCalculator";
import CompoundGrowthCalculator from "@/components/calculators/CompoundGrowthCalculator";
import ProfitMarginCalculator from "@/components/calculators/ProfitMarginCalculator";

// Maps a CALCULATORS registry id (lib/calculatorsRegistry.js) to the
// actual component to render for the "Wealth & Personal Finance" grid.
// The four trading-category ids (lot-size, pip-value, risk-reward,
// margin) are no longer rendered from here — they now live inside
// TradingTerminal — but stay in the registry since
// components/calculators/MiniCalculatorWidget.jsx still embeds them
// individually elsewhere (Academy lessons, Converter pages).
const PERSONAL_CALCULATOR_COMPONENTS = {
  inflation: InflationCalculator,
  "compound-growth": CompoundGrowthCalculator,
  "profit-margin": ProfitMarginCalculator,
};

export default function CalculatorsHub() {
  const [activeCategory, setActiveCategory] = useState("trading");
  const personalCalculators = getCalculatorsByCategory("personal");

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
            Trading &amp; Financial Calculators
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A unified Trading Calculator Terminal — position sizing, pip value, risk/reward,
            margin, and wealth growth — plus dedicated household calculators for inflation,
            compound growth, and profit margin.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div
          className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
          role="tablist"
          aria-label="Calculator category"
        >
          {CALCULATOR_CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Trading Tools: the unified Terminal. Personal Finance: the
          existing standalone calculator grid. The Terminal's own body
          is dark/glassmorphic by design (see its header comment), so
          this section drops the light bg-slate-50 page background used
          elsewhere on this page while it's active. */}
      {activeCategory === "trading" ? (
        <section className="bg-slate-950/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <TradingTerminal />
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {personalCalculators.map((calc) => {
              const Component = PERSONAL_CALCULATOR_COMPONENTS[calc.id];
              if (!Component) return null;
              return (
                <div key={calc.id} id={calc.id}>
                  <Component />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
