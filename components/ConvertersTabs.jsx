"use client";

import { useState } from "react";
import GoldCalculator from "@/components/GoldCalculator";
import CurrencyConverter from "@/components/CurrencyConverter";
import UnitConverter from "@/components/UnitConverter";

const TABS = [
  { key: "currency", label: "Currency & Crypto" },
  { key: "metals", label: "Metals & Commodities" },
  { key: "units", label: "Units & Area" },
];

/**
 * Tabbed shell switching between the three Module 1 tools: the
 * cross-asset Currency Converter (fiat + crypto + metals), the Metals
 * & Commodities Calculator, and the Universal Unit Converter. Keeping
 * each tool itself a standalone component means every tool also still
 * works standing alone on its own SEO landing page.
 */
export default function ConvertersTabs({ defaultTab = "currency" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <div
        className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8"
        role="tablist"
        aria-label="Converter tool"
      >
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2">
        {activeTab === "currency" && <CurrencyConverter />}
        {activeTab === "metals" && <GoldCalculator />}
        {activeTab === "units" && <UnitConverter />}
      </div>
    </div>
  );
}
