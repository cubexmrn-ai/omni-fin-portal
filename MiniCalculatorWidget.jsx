import Link from "next/link";
import { getCalculator } from "@/lib/calculatorsRegistry";
import LotSizeCalculator from "@/components/calculators/LotSizeCalculator";
import PipValueCalculator from "@/components/calculators/PipValueCalculator";
import RiskRewardCalculator from "@/components/calculators/RiskRewardCalculator";
import MarginCalculator from "@/components/calculators/MarginCalculator";
import InflationCalculator from "@/components/calculators/InflationCalculator";
import CompoundGrowthCalculator from "@/components/calculators/CompoundGrowthCalculator";
import ProfitMarginCalculator from "@/components/calculators/ProfitMarginCalculator";

// components/calculators/MiniCalculatorWidget.jsx
//
// Embeds one calculator from lib/calculatorsRegistry.js — by `id` —
// anywhere on the site that wants a "quick mini-widget" version: Learn
// lessons (via components/academy/EmbeddedTool.jsx's TOOL_REGISTRY) and
// Converter pages (app/converters/[pair]/page.jsx). The calculators
// themselves are already compact cards (same visual density as
// components/academy/MiniLotSizeCalculator.jsx), so this wrapper just
// adds a shared "Quick Calculator" label and a link back to the full
// Calculators Hub for the rest of the suite — no separate "mini"
// version of each calculator's logic needs to exist.
//
// The Calculators Hub's trading tools now live inside
// components/calculators/TradingTerminal.jsx's mode Selector Bar
// (client-side tab state, not page anchors), so only "profit-margin"
// — the one calculator still rendered as its own anchored section on
// that page — gets a real `#id` link below; every other id links to
// the hub itself and lets the visitor pick the matching mode.
//

// This file itself isn't a client component (no hooks of its own) —
// each calculator it renders is its own "use client" component, same
// as how components/academy/EmbeddedTool.jsx wraps client tools from a
// plain function.

const CALCULATOR_COMPONENTS = {
  "lot-size": LotSizeCalculator,
  "pip-value": PipValueCalculator,
  "risk-reward": RiskRewardCalculator,
  margin: MarginCalculator,
  inflation: InflationCalculator,
  "compound-growth": CompoundGrowthCalculator,
  "profit-margin": ProfitMarginCalculator,
};

export default function MiniCalculatorWidget({ calculatorId }) {
  const calculator = getCalculator(calculatorId);
  const Component = CALCULATOR_COMPONENTS[calculatorId];

  if (!calculator || !Component) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-400">
        Calculator &quot;{calculatorId}&quot; isn&apos;t available yet.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Quick Calculator
        </span>
        <Link
          href={calculator.id === "profit-margin" ? "/calculators#profit-margin" : "/calculators"}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Open full Calculators Hub →
        </Link>
      </div>
      <Component />
    </div>
  );
}
