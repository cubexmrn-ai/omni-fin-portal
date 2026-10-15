"use client";

// components/calculators/CalculatorsHub.jsx
//
// The interactive body of the Calculators Hub (app/calculators/page.jsx):
// category tabs ("Trading Tools" vs. "Wealth & Personal Finance") and a
// stacked grid of every calculator in that category. Split out as its
// own "use client" component so app/calculators/page.jsx itself can
// stay a plain server component with its own metadata export — same
// split used throughout this project (ConvertersTabs, AcademyHub, etc).
//
// All nine calculators are real components (not placeholders/cards
// that link elsewhere), so the hub is itself a complete, usable tool
// page — this mirrors ConvertersTabs.jsx's pattern of switching between
// full tool components rather than summary cards.

import { useState } from "react";
import { CALCULATOR_CATEGORIES, getCalculatorsByCategory } from "@/lib/calculatorsRegistry";
import LotSizeCalculator from "@/components/calculators/LotSizeCalculator";
import PipValueCalculator from "@/components/calculators/PipValueCalculator";
import RiskRewardCalculator from "@/components/calculators/RiskRewardCalculator";
import MarginCalculator from "@/components/calculators/MarginCalculator";
import InflationCalculator from "@/components/calculators/InflationCalculator";
import CompoundGrowthCalculator from "@/components/calculators/CompoundGrowthCalculator";
import ProfitMarginCalculator from "@/components/calculators/ProfitMarginCalculator";
import RentalYieldCalculator from "@/components/calculators/RentalYieldCalculator";
import TaxFeeCalculator from "@/components/calculators/TaxFeeCalculator";

// Maps a CALCULATORS registry id (lib/calculatorsRegistry.js) to the
// actual component to render. Kept local to the hub rather than in the
// registry file itself, since the registry is plain data shared with
// components/calculators/MiniCalculatorWidget.jsx, which has its own
// (smaller) component map for the subset it embeds elsewhere.
const CALCULATOR_COMPONENTS = {
  "lot-size": LotSizeCalculator,
  "pip-value": PipValueCalculator,
  "risk-reward": RiskRewardCalculator,
  margin: MarginCalculator,
  inflation: InflationCalculator,
  "compound-growth": CompoundGrowthCalculator,
  "profit-margin": ProfitMarginCalculator,
  "rental-yield": RentalYieldCalculator,
  "tax-fee": TaxFeeCalculator,
};

export default function CalculatorsHub() {
  const [activeCategory, setActiveCategory] = useState("trading");
  const calculators = getCalculatorsByCategory(activeCategory);

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
            Position sizing, pip value, risk/reward, margin, inflation, compound growth, profit
            margin, rental yield &amp; mortgage, and tax/fee estimates — nine free calculators every
            trader, investor, and household needs, all in one place.
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

      {/* Calculator Grid */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {calculators.map((calc) => {
            const Component = CALCULATOR_COMPONENTS[calc.id];
            if (!Component) return null;
            return (
              <div key={calc.id} id={calc.id}>
                <Component />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
