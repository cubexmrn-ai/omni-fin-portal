import { notFound } from "next/navigation";
import Link from "next/link";
import UnitConverter from "@/components/UnitConverter";
import BreadcrumbStructuredData from "@/components/BreadcrumbStructuredData";
import { getCategoryMeta, convertUnit } from "@/lib/conversionMath";
import { parseUnitSlug, FEATURED_UNIT_PAIRS } from "@/lib/unitSlugs";
import { buildMetadata } from "@/lib/pageMetadata";
import { formatNumber } from "@/lib/formatNumber";

// Pre-render the curated high-traffic pairs at build time; any other
// valid "<from>-to-<to>" slug still renders on-demand (ISR-style).
export function generateStaticParams() {
  return FEATURED_UNIT_PAIRS.map((pair) => ({ slug: pair.slug }));
}

export function generateMetadata({ params }) {
  const parsed = parseUnitSlug(params.slug);
  if (!parsed) {
    return buildMetadata({
      title: "Unit Converter | OmniFin Portal",
      description:
        "Convert length, area, weight, volume, speed, digital storage and temperature units instantly, worldwide and regional units alike.",
      path: "/converters/unit",
    });
  }

  const meta = getCategoryMeta(parsed.category);
  const fromLabel = meta.units[parsed.fromUnit]?.label.split(" (")[0];
  const toLabel = meta.units[parsed.toUnit]?.label.split(" (")[0];
  const title = `${fromLabel} to ${toLabel} Converter | OmniFin Portal`;
  const description = `Convert ${fromLabel} to ${toLabel} instantly with OmniFin Portal's free ${meta.label.toLowerCase()} converter. Accurate, fast and updated formulas.`;

  return buildMetadata({ title, description, path: `/converters/unit/${params.slug}` });
}

export default function UnitConverterSeoPage({ params }) {
  const parsed = parseUnitSlug(params.slug);
  if (!parsed) notFound();

  const meta = getCategoryMeta(parsed.category);
  const fromLabel = meta.units[parsed.fromUnit]?.label.split(" (")[0];
  const toLabel = meta.units[parsed.toUnit]?.label.split(" (")[0];

  // Exact, deterministic math (no live rate needed) — the same
  // convertUnit() the interactive UnitConverter below uses, so this
  // "1 X = Y" line and the widget can never disagree.
  const oneUnitResult = convertUnit(parsed.category, 1, parsed.fromUnit, parsed.toUnit);

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "Converters", href: "/converters" },
          { name: `${fromLabel} to ${toLabel}`, href: `/converters/unit/${params.slug}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{meta.label}</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {fromLabel} to {toLabel} Converter
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Instantly convert {fromLabel} to {toLabel} using OmniFin
            Portal&apos;s {meta.label.toLowerCase()} converter — accurate,
            free and updated in real time as you type.
          </p>
          {Number.isFinite(oneUnitResult) && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              1 {fromLabel} = {formatNumber(oneUnitResult, { maximumFractionDigits: 8 })} {toLabel}
            </p>
          )}
        </div>
      </section>

      <UnitConverter
        initialCategory={parsed.category}
        initialFrom={parsed.fromUnit}
        initialTo={parsed.toUnit}
      />

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">
            About this conversion
          </h2>
          <p className="mt-2">
            {fromLabel} and {toLabel} are both units of {meta.label.toLowerCase()}.
            Enter any value above and OmniFin Portal recalculates the
            result instantly in both directions.
          </p>
          {/* The simple "Result = Amount × factor" formula is only true
              for a linear (multiplicative) unit relationship — every
              category except temperature, which instead needs an
              offset (e.g. °F = °C × 9/5 + 32). Showing a × factor line
              for temperature would be mathematically wrong, so it's
              skipped there rather than stated incorrectly. */}
          {parsed.category !== "temperature" && Number.isFinite(oneUnitResult) && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
              Result = Amount × {formatNumber(oneUnitResult, { maximumFractionDigits: 8 })}. This
              is a fixed mathematical conversion factor (not a live market
              rate), so it never changes.
            </p>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/converters"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            ← Browse all converters
          </Link>
        </div>
      </section>
    </>
  );
}
