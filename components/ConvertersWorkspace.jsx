"use client";

// components/ConvertersWorkspace.jsx
//
// The fully interactive body of /converters (app/converters/page.jsx):
// the clickable category cards, the Currency/Metals/Units tool tabs,
// and the "Popular Currency Conversions" / "Popular Unit Conversions"
// pill rows — all wired to ONE lifted selection state, so clicking any
// card or pill updates the single converter window in place, with no
// page navigation or reload.
//
// WHY A SEPARATE COMPONENT FROM components/ConvertersTabs.jsx:
// ConvertersTabs.jsx owns its own internal tab state and is still used
// standalone elsewhere (the homepage's embedded metals calculator at
// /#metals-calculator). This workspace needs that selection to be
// driven from OUTSIDE the tool switcher — a category card or a popular
// pill has to be able to say "switch to Units, category=area,
// marla -> kanal" in one click — so it lifts the same
// Currency/Metals/Units tab state up a level instead of reusing
// ConvertersTabs.jsx's closed-over state.
//
// HOW CLICKING A PILL "APPLIES" INSTANTLY WITHOUT A FORM SUBMIT:
// UnitConverter and CurrencyConverter each only read their
// `initialCategory`/`initialFrom`/`initialTo` props once, as their
// starting React state. To make a NEW click re-apply fresh initial
// values to an already-mounted converter, this workspace changes the
// `key` prop alongside the selection — React then remounts the
// converter with the new initial values baked in, which reads to the
// user as "the window updated instantly."

import { useRef, useState } from "react";
import GoldCalculator from "@/components/GoldCalculator";
import CurrencyConverter from "@/components/CurrencyConverter";
import UnitConverter from "@/components/UnitConverter";
import { UNIT_CATEGORIES, getCategoryKeys } from "@/lib/conversionMath";
import { parseUnitSlug, FEATURED_UNIT_PAIRS } from "@/lib/unitSlugs";
import { FEATURED_FX_PAIRS } from "@/lib/fxSlugs";

const TOOL_TABS = [
  { key: "currency", label: "Currency & Crypto" },
  { key: "metals", label: "Metals & Commodities" },
  { key: "units", label: "Units & Area" },
];

const CATEGORY_CARDS = [
  { key: "length", example: "Kilometers, Miles, Feet, Inches" },
  { key: "area", example: "Marla, Kanal, Acre, Hectare, Sq. Feet" },
  { key: "weight", example: "Kilogram, Pound, Tola, Maund, Seer" },
  { key: "volume", example: "Liter, Gallon, Quart, Cubic Meter" },
  { key: "speed", example: "km/h, mph, Knots" },
  { key: "data", example: "MB, GB, TB" },
  { key: "temperature", example: "Celsius, Fahrenheit, Kelvin" },
];

const VALID_UNIT_CATEGORIES = new Set(getCategoryKeys());

export default function ConvertersWorkspace() {
  const [activeTool, setActiveTool] = useState("currency");
  const [currencySelection, setCurrencySelection] = useState({ from: "USD", to: "PKR" });
  const [unitSelection, setUnitSelection] = useState({ category: "length", from: undefined, to: undefined });
  // Bumped on every card/pill click so the `key` below always changes,
  // forcing UnitConverter/CurrencyConverter to remount with the fresh
  // initial* props even if the same category/pair is clicked twice.
  const [selectionVersion, setSelectionVersion] = useState(0);
  const converterRef = useRef(null);

  function scrollToConverter() {
    converterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openUnitCategory(categoryKey) {
    if (!VALID_UNIT_CATEGORIES.has(categoryKey)) return;
    setActiveTool("units");
    setUnitSelection({ category: categoryKey, from: undefined, to: undefined });
    setSelectionVersion((v) => v + 1);
    scrollToConverter();
  }

  function openCurrencyPair(from, to) {
    setActiveTool("currency");
    setCurrencySelection({ from, to });
    setSelectionVersion((v) => v + 1);
    scrollToConverter();
  }

  function openUnitPair(slug) {
    const parsed = parseUnitSlug(slug);
    if (!parsed) return;
    setActiveTool("units");
    setUnitSelection({ category: parsed.category, from: parsed.fromUnit, to: parsed.toUnit });
    setSelectionVersion((v) => v + 1);
    scrollToConverter();
  }

  const unitConverterKey = `${unitSelection.category}-${unitSelection.from || ""}-${unitSelection.to || ""}-${selectionVersion}`;
  const currencyConverterKey = `${currencySelection.from}-${currencySelection.to}-${selectionVersion}`;

  return (
    <div>
      {/* Category cards — fully clickable; each one switches the
          converter window straight to that unit category, in place. */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORY_CARDS.map((c) => {
            const active = activeTool === "units" && unitSelection.category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => openUnitCategory(c.key)}
                aria-pressed={active}
                className={`rounded-xl border p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
                  active
                    ? "border-brand-400 bg-brand-50 ring-1 ring-brand-300"
                    : "border-slate-200 bg-white hover:border-brand-200"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">
                  {UNIT_CATEGORIES[c.key]?.label || "Temperature"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{c.example}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* The converter window itself — tool tabs + active tool */}
      <div ref={converterRef} className="py-10">
        <div
          className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8"
          role="tablist"
          aria-label="Converter tool"
        >
          {TOOL_TABS.map((tab) => {
            const active = tab.key === activeTool;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTool(tab.key)}
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
          {activeTool === "currency" && (
            <CurrencyConverter
              key={currencyConverterKey}
              initialFrom={currencySelection.from}
              initialTo={currencySelection.to}
            />
          )}
          {activeTool === "metals" && <GoldCalculator />}
          {activeTool === "units" && (
            <UnitConverter
              key={unitConverterKey}
              initialCategory={unitSelection.category}
              initialFrom={unitSelection.from}
              initialTo={unitSelection.to}
            />
          )}
        </div>
      </div>

      {/* Popular Currency Conversions — pill buttons that instantly load
          that pair into the converter window above, no navigation. */}
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-slate-900">Popular Currency Conversions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click any pair to load it straight into the converter above.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FEATURED_FX_PAIRS.map((pair) => {
            const active =
              activeTool === "currency" &&
              currencySelection.from === pair.from &&
              currencySelection.to === pair.to;
            return (
              <button
                key={pair.slug}
                type="button"
                onClick={() => openCurrencyPair(pair.from, pair.to)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {pair.title}
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Unit Conversions — same instant-apply pattern */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-slate-900">Popular Unit Conversions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Click any pair to load it straight into the converter above.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FEATURED_UNIT_PAIRS.map((pair) => {
            const parsed = parseUnitSlug(pair.slug);
            const active =
              activeTool === "units" &&
              parsed &&
              unitSelection.category === parsed.category &&
              unitSelection.from === parsed.fromUnit &&
              unitSelection.to === parsed.toUnit;
            return (
              <button
                key={pair.slug}
                type="button"
                onClick={() => openUnitPair(pair.slug)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {pair.title}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
