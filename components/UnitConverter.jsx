"use client";

import { useMemo, useState } from "react";
import {
  UNIT_CATEGORIES,
  convertUnit,
  getCategoryKeys,
  getCategoryMeta,
} from "@/lib/conversionMath";

const CATEGORY_KEYS = getCategoryKeys(); // length, area, weight, volume, speed, data, temperature

function formatResult(value) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  // Use more precision for very small numbers so unit pairs like
  // mm -> km don't round to 0.
  const maximumFractionDigits = abs !== 0 && abs < 0.01 ? 8 : 6;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function firstTwoUnits(categoryKey) {
  const meta = getCategoryMeta(categoryKey);
  const keys = Object.keys(meta.units);
  return [keys[0], keys[1] || keys[0]];
}

/**
 * Universal Unit Converter.
 *
 * Covers length, area, weight, volume, speed, digital storage and
 * temperature, including South Asian regional units (tola, maund, seer,
 * marla, kanal) alongside globally common ones (km, miles, kg, lb,
 * gallons, °C/°F).
 *
 * Accepts optional initial props so SEO landing routes like
 * /converters/unit/sqft-to-marla can deep-link directly into a
 * pre-selected category + unit pair.
 */
export default function UnitConverter({
  initialCategory = "length",
  initialFrom,
  initialTo,
}) {
  const safeInitialCategory = CATEGORY_KEYS.includes(initialCategory)
    ? initialCategory
    : "length";
  const [defaultFrom, defaultTo] = firstTwoUnits(safeInitialCategory);

  const [category, setCategory] = useState(safeInitialCategory);
  const [fromUnit, setFromUnit] = useState(initialFrom || defaultFrom);
  const [toUnit, setToUnit] = useState(initialTo || defaultTo);
  const [inputValue, setInputValue] = useState(1);

  const categoryMeta = getCategoryMeta(category);
  const unitKeys = Object.keys(categoryMeta.units);

  const result = useMemo(() => {
    return convertUnit(category, inputValue, fromUnit, toUnit);
  }, [category, inputValue, fromUnit, toUnit]);

  const reverseResult = useMemo(() => {
    // Shows the inverse rate ("1 toUnit = X fromUnit") for context.
    return convertUnit(category, 1, toUnit, fromUnit);
  }, [category, fromUnit, toUnit]);

  function handleCategoryChange(nextCategory) {
    const [f, t] = firstTwoUnits(nextCategory);
    setCategory(nextCategory);
    setFromUnit(f);
    setToUnit(t);
  }

  function handleSwap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50 via-white to-slate-50 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            Universal Unit Converter
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Length, area, weight, volume, speed, digital storage and
            temperature — including Tola, Maund, Marla and Kanal.
          </p>
        </div>

        {/* Category tabs */}
        <div
          className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-6 py-3"
          role="tablist"
          aria-label="Unit category"
        >
          {CATEGORY_KEYS.map((key) => {
            const meta = getCategoryMeta(key);
            const active = key === category;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleCategoryChange(key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 px-6 py-6 lg:grid-cols-5">
          {/* Inputs */}
          <div className="space-y-5 lg:col-span-3">
            <div>
              <label
                htmlFor="uc-input-value"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Value
              </label>
              <input
                id="uc-input-value"
                type="number"
                inputMode="decimal"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="1"
              />
            </div>

            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div>
                <label
                  htmlFor="uc-from-unit"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  From
                </label>
                <select
                  id="uc-from-unit"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {unitKeys.map((key) => (
                    <option key={key} value={key}>
                      {categoryMeta.units[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap units"
                title="Swap units"
                className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-brand-600 sm:mb-0.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M7 7H17L14 4M17 17H7L10 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div>
                <label
                  htmlFor="uc-to-unit"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  To
                </label>
                <select
                  id="uc-to-unit"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {unitKeys.map((key) => (
                    <option key={key} value={key}>
                      {categoryMeta.units[key].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!categoryMeta.special && UNIT_CATEGORIES[category]?.popularPairs?.length > 0 && (
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Popular
                </span>
                <div className="flex flex-wrap gap-2">
                  {UNIT_CATEGORIES[category].popularPairs.map(([f, t]) => (
                    <button
                      key={`${f}-${t}`}
                      type="button"
                      onClick={() => {
                        setFromUnit(f);
                        setToUnit(t);
                      }}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      {categoryMeta.units[f]?.label.split(" (")[0]} →{" "}
                      {categoryMeta.units[t]?.label.split(" (")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Result
              </p>
              <p className="mt-3 text-2xl font-extrabold text-brand-700">
                {formatResult(result)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {categoryMeta.units[toUnit]?.label}
              </p>

              <div className="mt-5 rounded-lg bg-white px-3 py-2.5 text-xs text-slate-500 shadow-sm">
                1 {categoryMeta.units[toUnit]?.label.split(" (")[0]} ={" "}
                {formatResult(reverseResult)}{" "}
                {categoryMeta.units[fromUnit]?.label.split(" (")[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
