import Link from "next/link";
import ConvertersWorkspace from "@/components/ConvertersWorkspace";
import ConvertersHero from "@/components/ConvertersHero";
import ConvertersFAQSection from "@/components/converters/ConvertersFAQSection";
import ConvertersFAQStructuredData from "@/components/converters/ConvertersFAQStructuredData";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Currency, Crypto, Metals & Commodities, Unit Converter | OmniFin Portal",
  description:
    "Convert between fiat currencies, crypto and metals & commodities (gold, silver, platinum, palladium, copper, crude oil), and worldwide units (length, area, weight, volume, speed, temperature) — including Tola, Maund, Marla and Kanal — instantly and for free.",
  path: "/converters",
});

export default function ConvertersPage() {
  return (
    <>
      <ConvertersFAQStructuredData />
      <ConvertersHero />

      {/* Every category card, tool tab, and "Popular" pill below is
          wired to one shared selection — clicking any of them updates
          the converter window in place, with no page reload. */}
      <ConvertersWorkspace />

      <ConvertersFAQSection />

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-600">
            Have a site or blog? Add a free, live-updating converter widget to it.
          </p>
          <Link
            href="/embed"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Get the embeddable widget →
          </Link>
        </div>
      </section>
    </>
  );
}
