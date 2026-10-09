import Link from "next/link";
import ConvertersTabs from "@/components/ConvertersTabs";
import { UNIT_CATEGORIES } from "@/lib/conversionMath";
import { FEATURED_UNIT_PAIRS } from "@/lib/unitSlugs";
import { FEATURED_FX_PAIRS } from "@/lib/fxSlugs";

export const metadata = {
  title: "Currency, Crypto, Gold & Unit Converter | OmniFin Portal",
  description:
    "Convert between fiat currencies, crypto and precious metals, gold rates, and worldwide units (length, area, weight, volume, speed, temperature) — including Tola, Maund, Marla and Kanal — instantly and for free.",
};

const CATEGORY_SUMMARY = [
  { key: "length", example: "Kilometers, Miles, Feet, Inches" },
  { key: "area", example: "Marla, Kanal, Acre, Hectare, Sq. Feet" },
  { key: "weight", example: "Kilogram, Pound, Tola, Maund, Seer" },
  { key: "volume", example: "Liter, Gallon, Quart, Cubic Meter" },
  { key: "speed", example: "km/h, mph, Knots" },
  { key: "data", example: "MB, GB, TB" },
  { key: "temperature", example: "Celsius, Fahrenheit, Kelvin" },
];

export default function ConvertersPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Module 1 · Converters
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Currency, Crypto, Gold &amp; Unit Converter
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Three tools, one dashboard: a cross-asset converter spanning
            fiat currencies, crypto and precious metals, a gold rate
            calculator by karat and weight unit, and a universal
            converter for length, area, weight, volume, speed, digital
            storage and temperature — worldwide and regional units alike.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORY_SUMMARY.map((c) => (
              <div
                key={c.key}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {UNIT_CATEGORIES[c.key]?.label || "Temperature"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{c.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-10">
        <ConvertersTabs defaultTab="currency" />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-slate-900">
          Popular Currency Conversions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Direct links to the most-searched currency pairs.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED_FX_PAIRS.map((pair) => (
            <Link
              key={pair.slug}
              href={`/converters/${pair.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {pair.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-slate-900">
          Popular Unit Conversions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Direct links to the most-searched unit conversions.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED_UNIT_PAIRS.map((pair) => (
            <Link
              key={pair.slug}
              href={`/converters/unit/${pair.slug}`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {pair.title}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
