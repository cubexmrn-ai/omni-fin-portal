"use client";

// components/calculators/TradingTerminal.jsx
//
// The "Trading Calculator Suite" — a single, unified tool that is now
// the ENTIRE body of the Calculators Hub (app/calculators/page.jsx via
// components/calculators/CalculatorsHub.jsx), replacing the old
// scattered grid of separate calculator cards. A Selector Bar at the
// top (pill tabs on larger screens, a <select> dropdown on small
// screens) switches between five modes:
//   Mode 1. All-in-One Trade Execution Suite — components/calculators/AllInOneTradeSuite.jsx
//   Mode 2. Position Sizing & Lot Calculator — components/calculators/LotSizeCalculator.jsx (reused as-is)
//   Mode 3. Pip Value Calculator             — components/calculators/PipValueCustomCalculator.jsx
//   Mode 4. Margin & Leverage Calculator     — components/calculators/MarginCalculator.jsx (reused as-is)
//   Mode 5. Inflation & Wealth Growth        — InflationCalculator + CompoundGrowthCalculator (reused as-is)
//
// WHY #2/#4/#5 ARE WRAPPED, NOT RESTYLED: those three calculators are
// shared components also embedded standalone elsewhere (Academy
// lessons, Converter pages, via MiniCalculatorWidget) as light,
// white-card widgets. Recoloring their internals to match this dark
// Suite shell would change how they render everywhere else they're
// used. Instead each is framed in a dark card here — the same
// "wrap, don't repaint" pattern already used by
// components/academy/EmbeddedTool.jsx for the same reason.
//
// Directly below each mode's input fields + output dashboard sits an
// expandable "Calculator Guide & Knowledge Notes" accordion covering
// pip math, lot-sizing formulas, and the 1-2% account-risk rule for
// beginners.

import { useState } from "react";
import AllInOneTradeSuite from "@/components/calculators/AllInOneTradeSuite";
import LotSizeCalculator from "@/components/calculators/LotSizeCalculator";
import PipValueCustomCalculator from "@/components/calculators/PipValueCustomCalculator";
import MarginCalculator from "@/components/calculators/MarginCalculator";
import InflationCalculator from "@/components/calculators/InflationCalculator";
import CompoundGrowthCalculator from "@/components/calculators/CompoundGrowthCalculator";

const MODES = [
  { id: "all-in-one", label: "All-in-One Trade Execution Suite" },
  { id: "lot-size", label: "Position Sizing & Lot Calculator" },
  { id: "pip-value", label: "Pip Value Calculator" },
  { id: "margin", label: "Margin & Leverage Calculator" },
  { id: "inflation-wealth", label: "Inflation & Wealth Growth" },
];

/** Frames an already-styled light/white-card calculator in a dark
 * panel so it fits the Suite's shell without altering the shared
 * component itself (see file header). */
function WrappedTool({ children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-black/20 sm:p-5">
      <div className="overflow-hidden rounded-xl">{children}</div>
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-slate-800 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-100 hover:text-white"
      >
        {title}
        <span className={`shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && <div className="px-4 pb-4 text-sm leading-relaxed text-slate-400">{children}</div>}
    </div>
  );
}

/** "Calculator Guide & Knowledge Notes" — sits directly below the
 * active mode's input fields and output dashboard. Content adapts
 * slightly per mode so the guide always feels directly relevant to
 * what's on screen, rather than one generic block repeated for every
 * mode. */
function CalculationGuide({ mode }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
      <div className="border-b border-slate-800 bg-black/20 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-50">Calculator Guide &amp; Knowledge Notes</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          A quick refresher on pip math, lot sizing, and account-risk rules — for beginners
          working through this mode.
        </p>
      </div>
      <div>
        <AccordionItem title="Pip math — what a pip is worth" defaultOpen>
          A pip (or point/tick for indices and crypto) is the smallest standard price increment
          for an instrument — 0.0001 for most forex pairs, 0.01 for JPY/PKR pairs and metals/energy
          on some brokers. Pip value in your account currency = pip size × contract size (units
          per lot) × your lot size, converted from the quote currency to USD/PKR using the current
          exchange rate. That is exactly what Modes 1 and 3 compute live.
        </AccordionItem>
        <AccordionItem title="Lot sizing formulas" defaultOpen={mode === "lot-size"}>
          Position size is solved backward from how much you&apos;re willing to lose: Risk Amount
          = Account Balance × Risk % . Standard Lots = Risk Amount ÷ (Stop-Loss Pips × Pip Value
          per Standard Lot). Mini lots are 10× that figure, micro lots 100×, since a standard lot
          is 100,000 base-currency units (10,000 mini, 1,000 micro) — see Mode 2.
        </AccordionItem>
        <AccordionItem title="The 1–2% account risk rule" defaultOpen={mode === "all-in-one"}>
          Most professional risk-management guidance caps the amount risked on any single trade
          at 1–2% of total account balance, so a string of losses doesn&apos;t cause lasting
          damage — e.g. on a $10,000 account, a 1% risk rule caps a single trade&apos;s potential
          loss at $100. Modes 1 and 2 both let you check your risk against this rule before you
          size a position.
        </AccordionItem>
        <AccordionItem title="Risk:Reward and margin" defaultOpen={mode === "margin"}>
          Risk:Reward compares potential reward to potential risk in dollar terms (e.g. 1:2 means
          you stand to make twice what you&apos;re risking). Required Margin is simply the
          position&apos;s notional value divided by your leverage ratio; Free Margin is what&apos;s
          left of your balance after that margin is set aside — a negative free margin means the
          position is too large for your account at that leverage. See Modes 1 and 4.
        </AccordionItem>
      </div>
    </div>
  );
}

export default function TradingTerminal() {
  const [activeMode, setActiveMode] = useState("all-in-one");

  return (
    <div>
      {/* Selector Bar — pill tabs on larger screens, a dropdown on mobile */}
      <div className="sm:hidden">
        <label className="block">
          <span className="sr-only">Select a calculator mode</span>
          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="hidden flex-wrap gap-2 sm:flex"
        role="tablist"
        aria-label="Trading calculator mode"
      >
        {MODES.map((mode) => {
          const active = mode.id === activeMode;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveMode(mode.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-blue-600 text-white shadow-[0_0_16px_-2px_rgba(59,130,246,0.6)]"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {activeMode === "all-in-one" && <AllInOneTradeSuite />}
        {activeMode === "lot-size" && (
          <WrappedTool>
            <LotSizeCalculator />
          </WrappedTool>
        )}
        {activeMode === "pip-value" && <PipValueCustomCalculator />}
        {activeMode === "margin" && (
          <WrappedTool>
            <MarginCalculator />
          </WrappedTool>
        )}
        {activeMode === "inflation-wealth" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <WrappedTool>
              <InflationCalculator />
            </WrappedTool>
            <WrappedTool>
              <CompoundGrowthCalculator />
            </WrappedTool>
          </div>
        )}
      </div>

      {/* Directly below the active mode's input fields + output
          dashboard, per spec. */}
      <CalculationGuide mode={activeMode} />
    </div>
  );
}
