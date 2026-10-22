import { Suspense } from "react";
import Link from "next/link";
import ConvertersWorkspace from "@/components/ConvertersWorkspace";
import ConvertersHero from "@/components/ConvertersHero";
import ConvertersFAQSection from "@/components/converters/ConvertersFAQSection";
import ConvertersFAQStructuredData from "@/components/converters/ConvertersFAQStructuredData";
import BaseCurrencyPills from "@/components/converters/BaseCurrencyPills";
import ConvertersSearchBox from "@/components/converters/ConvertersSearchBox";
import { buildMetadata } from "@/lib/pageMetadata";
import { FEATURED_BASE_CURRENCIES } from "@/lib/pairSlugs";
import { getCurrency } from "@/lib/currencies";

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

      {/* Phase 2 pSEO addition: cross-links into the base-currency
          rate digest pages (/converters/<code>), each listing that
          currency against all 144 supported currencies. */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">Browse by base currency</h2>
          <p className="mt-1 text-sm text-slate-500">
            See one currency against every currency OmniFin Portal supports, in a single
            sortable table.
          </p>
          {/* Fulfills the WebSite SearchAction promise in
              components/SiteStructuredData.jsx (urlTemplate
              "/converters?search={search_term_string}") — wrapped in
              Suspense because useSearchParams() otherwise opts the
              whole page out of static rendering; see
              ConvertersSearchBox.jsx's header comment. */}
          <Suspense fallback={<div className="mt-3 h-10 rounded-lg bg-slate-100" />}>
            <ConvertersSearchBox />
          </Suspense>
          <BaseCurrencyPills
            currencies={FEATURED_BASE_CURRENCIES.map((code) => ({ code, currency: getCurrency(code) })).filter(
              (c) => c.currency
            )}
          />
        </div>
      </section>

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
