import ConvertersWorkspace from "@/components/ConvertersWorkspace";

export const metadata = {
  title: "Currency, Crypto, Metals & Commodities, Unit Converter | OmniFin Portal",
  description:
    "Convert between fiat currencies, crypto and metals & commodities (gold, silver, platinum, palladium, copper, crude oil), and worldwide units (length, area, weight, volume, speed, temperature) — including Tola, Maund, Marla and Kanal — instantly and for free.",
};

export default function ConvertersPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Module 1 · Converters
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Currency, Crypto, Metals &amp; Commodities, Unit Converter
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Three tools, one dashboard: a cross-asset converter spanning
            fiat currencies, crypto and precious metals, a metals &amp;
            commodities calculator covering gold, silver, platinum,
            palladium, copper and crude oil by karat and weight unit (or
            barrel for oil), and a universal converter for length, area,
            weight, volume, speed, digital storage and temperature —
            worldwide and regional units alike.
          </p>
        </div>
      </section>

      {/* Every category card, tool tab, and "Popular" pill below is
          wired to one shared selection — clicking any of them updates
          the converter window in place, with no page reload. */}
      <ConvertersWorkspace />
    </>
  );
}
