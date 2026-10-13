// Programmatic SEO route for converter pairs, e.g. /converters/usd-to-pkr,
// /converters/btc-to-usd, /converters/xau-to-usd — spanning all three
// asset classes (fiat, crypto, metals), not just FX.
//
// NOTE ON ROUTE NAMING: Next.js App Router folder names support exactly
// one dynamic segment each (e.g. "[pair]"), not two interleaved ones
// like "[from]-to-[to]". So this route lives at app/converters/[pair]
// and resolves the URL "btc-to-usd" into
// { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "USD" }
// in code via lib/pairSlugs.js — the resulting URLs are identical to
// what "/converters/[from]-to-[to]" would have produced.
//
// This folder sits alongside the literal "unit" folder
// (app/converters/unit/...), and Next.js always prefers a matching
// static segment over a dynamic one, so /converters/unit/* keeps
// resolving to the unit converter routes without any collision here.
//
// ARCHITECTURAL NOTE (same lesson as lib/marketData.js / lib/newsAggregator.js):
// this Server Component calls getUnifiedRates() directly to resolve a
// live rate for the page's SEO metadata/JSON-LD and on-page copy —
// never by self-fetching this deployment's own /api/rates route by
// absolute URL during SSR/ISR, which is the well-known Next.js/Vercel
// footgun that broke a different page earlier in this project (see the
// header comment in lib/newsAggregator.js for the full story).

import { notFound } from "next/navigation";
import Link from "next/link";
import CurrencyConverter from "@/components/CurrencyConverter";
import ConverterStructuredData from "@/components/ConverterStructuredData";
import PopularPairs from "@/components/PopularPairs";
import MiniCalculatorWidget from "@/components/calculators/MiniCalculatorWidget";
import { parsePairSlug, buildPairSlug, FEATURED_PAIRS } from "@/lib/pairSlugs";
import { getPairRate } from "@/lib/assetConversion";
import { getUnifiedRates } from "@/lib/marketData";
import { getSiteUrl } from "@/lib/siteUrl";
import { formatNumber } from "@/lib/formatNumber";
import { buildMetadata } from "@/lib/pageMetadata";

export function generateStaticParams() {
  return FEATURED_PAIRS.map((pair) => ({ pair: pair.slug }));
}

const ASSET_CLASS_NOUN = {
  fiat: "currency",
  crypto: "cryptocurrency",
  metals: "metal",
};

export async function generateMetadata({ params }) {
  const parsed = parsePairSlug(params.pair);
  if (!parsed) {
    return buildMetadata({
      title: "Currency, Crypto & Metals Converter | OmniFin Portal",
      description:
        "Convert between fiat currencies, crypto and metals & commodities instantly with OmniFin Portal's free, live converter.",
      path: "/converters",
    });
  }

  const { from, to } = parsed;
  const title = `${from.code} to ${to.code} Converter — ${from.name} to ${to.name} | OmniFin Portal`;
  const description = `Convert ${from.name} (${from.code}) to ${to.name} (${to.code}) instantly with OmniFin Portal's free, live converter — covering fiat currencies, crypto and precious metals.`;

  return buildMetadata({
    title,
    description,
    path: `/converters/${buildPairSlug(parsed.fromCode, parsed.toCode)}`,
  });
}

export default async function CurrencyPairSeoPage({ params }) {
  const parsed = parsePairSlug(params.pair);
  if (!parsed) notFound();

  const { fromClass, fromCode, from, toClass, toCode, to } = parsed;
  const slug = buildPairSlug(fromCode, toCode);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/converters/${slug}`;

  // Resolved server-side, directly from the shared getUnifiedRates()
  // function — not a self-fetch (see header comment above). Used for
  // the JSON-LD exchangeRate property and the "current rate" line
  // below; null (rather than a guessed number) if a rate genuinely
  // isn't available for this pair right now.
  let rate = null;
  let fetchedAt = null;
  try {
    const ratesPayload = await getUnifiedRates();
    rate = getPairRate({ fromClass, fromCode, toClass, toCode, ratesPayload });
    fetchedAt = ratesPayload?.fetchedAt || null;
  } catch {
    // Leave rate/fetchedAt null — the client-side CurrencyConverter
    // below fetches its own live rates independently and will still
    // render correctly even if this server-side lookup fails.
  }

  const fromNoun = ASSET_CLASS_NOUN[fromClass] || "asset";
  const toNoun = ASSET_CLASS_NOUN[toClass] || "asset";

  // A fiat-involved pair (e.g. usd-to-pkr) is the kind of pair a forex
  // trader would actually size a position on, so it gets the Pip Value
  // Calculator; any other pair (crypto/metals) still benefits from a
  // generic, asset-agnostic position-sizing tool, so it gets the
  // Margin & Leverage Calculator instead. Either way, something useful
  // shows up — this is the "quick mini-widget" cross-sell called for
  // alongside Popular Pairs below.
  const isForexPair = fromClass === "fiat" || toClass === "fiat";
  const relatedCalculatorId = isForexPair ? "pip-value" : "margin";

  return (
    <>
      <ConverterStructuredData
        from={from}
        fromClass={fromClass}
        to={to}
        toClass={toClass}
        rate={rate}
        fetchedAt={fetchedAt}
        pageUrl={pageUrl}
        siteUrl={siteUrl}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500 capitalize">
              {fromClass === toClass ? fromNoun : `${fromNoun} / ${toNoun}`}
            </span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {from.code} to {to.code} — {from.name} to {to.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Live, instantly updating conversion from {from.name} to{" "}
            {to.name}, with a quick-reference rate table below.
          </p>
          {Number.isFinite(rate) && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              1 {from.code} ={" "}
              {formatNumber(rate, { maximumFractionDigits: 8 })} {to.code}
            </p>
          )}
        </div>
      </section>

      <CurrencyConverter
        initialFromClass={fromClass}
        initialFromCode={fromCode}
        initialToClass={toClass}
        initialToCode={toCode}
      />

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">
            About this pair
          </h2>
          <p className="mt-2">
            {from.code} ({from.name}) and {to.code} ({to.name}) rates are
            sourced from a cached, live-refreshed rates feed spanning
            fiat currencies, cryptocurrencies and precious metals. Enter
            any amount above to convert instantly in either direction.
          </p>
        </div>

        <div className="mt-6">
          <MiniCalculatorWidget calculatorId={relatedCalculatorId} />
        </div>

        <PopularPairs pairs={FEATURED_PAIRS} currentSlug={slug} />

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
