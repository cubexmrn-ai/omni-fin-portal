// Programmatic SEO route for FX currency pairs, e.g. /converters/usd-to-pkr.
//
// NOTE ON ROUTE NAMING: Next.js App Router folder names support exactly
// one dynamic segment each (e.g. "[pair]"), not two interleaved ones
// like "[from]-to-[to]". So this route lives at app/converters/[pair]
// and resolves the URL "usd-to-pkr" into { from: "USD", to: "PKR" } in
// code via lib/fxSlugs.js — the resulting URLs are identical to what
// "/converters/[from]-to-[to]" would have produced.
//
// This folder sits alongside the literal "unit" folder
// (app/converters/unit/...), and Next.js always prefers a matching
// static segment over a dynamic one, so /converters/unit/* keeps
// resolving to the unit converter routes without any collision here.

import { notFound } from "next/navigation";
import Link from "next/link";
import CurrencyConverter from "@/components/CurrencyConverter";
import { getCurrency } from "@/lib/currencies";
import { parseFxSlug, FEATURED_FX_PAIRS } from "@/lib/fxSlugs";

export function generateStaticParams() {
  return FEATURED_FX_PAIRS.map((pair) => ({ pair: pair.slug }));
}

export function generateMetadata({ params }) {
  const parsed = parseFxSlug(params.pair);
  if (!parsed) {
    return { title: "Currency Converter | OmniFin Portal" };
  }

  const from = getCurrency(parsed.from);
  const to = getCurrency(parsed.to);
  const title = `${from.code} to ${to.code} Converter — ${from.name} to ${to.name} | OmniFin Portal`;
  const description = `Convert ${from.name} (${from.code}) to ${to.name} (${to.code}) instantly with OmniFin Portal's free, live FX converter.`;

  return { title, description };
}

export default function CurrencyPairSeoPage({ params }) {
  const parsed = parseFxSlug(params.pair);
  if (!parsed) notFound();

  const from = getCurrency(parsed.from);
  const to = getCurrency(parsed.to);

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Currency</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {from.code} to {to.code} — {from.name} to {to.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Live, instantly updating conversion from {from.name} to{" "}
            {to.name}, with a quick-reference rate table below.
          </p>
        </div>
      </section>

      <CurrencyConverter initialFrom={from.code} initialTo={to.code} />

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">
            About this pair
          </h2>
          <p className="mt-2">
            {from.code} ({from.name}) and {to.code} ({to.name}) rates are
            sourced from a cached, 15-minute-refreshed exchange rate feed.
            Enter any amount above to convert instantly in either
            direction.
          </p>
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
