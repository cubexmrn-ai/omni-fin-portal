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
import BreadcrumbStructuredData from "@/components/BreadcrumbStructuredData";
import PopularPairs from "@/components/PopularPairs";
import MiniCalculatorWidget from "@/components/calculators/MiniCalculatorWidget";
import AdSlot from "@/components/AdSlot";
import { getPairEducationalContent } from "@/components/converters/pairEducationalContent";
import AmountConversionCard from "@/components/converters/AmountConversionCard";
import AmountConverterStructuredData from "@/components/converters/AmountConverterStructuredData";
import ZakatGoldStructuredData from "@/components/converters/ZakatGoldStructuredData";
import RelatedAmountLinks from "@/components/converters/RelatedAmountLinks";
import BaseDigestStructuredData from "@/components/converters/BaseDigestStructuredData";
import ZakatCalculator from "@/components/tools/ZakatCalculator";
import FAQAccordion from "@/components/FAQAccordion";
import {
  parsePairSlug,
  parseBaseOnlySlug,
  parseAmountPairSlug,
  parseZakatGoldSlug,
  buildPairSlug,
  buildAmountPairSlug,
  buildZakatGoldSlug,
  getFeaturedAmountPairsFor,
  FEATURED_PAIRS,
  FEATURED_BASE_CURRENCIES,
  FEATURED_AMOUNT_PAIRS,
  FEATURED_ZAKAT_GOLD_AMOUNTS,
} from "@/lib/pairSlugs";
import { getPairRate } from "@/lib/assetConversion";
import { getUnifiedRates } from "@/lib/marketData";
import { getSiteUrl } from "@/lib/siteUrl";
import { formatNumber } from "@/lib/formatNumber";
import { buildMetadata } from "@/lib/pageMetadata";
import { CURRENCIES } from "@/lib/currencies";
import { WEIGHT_UNITS } from "@/lib/conversionMath";
import { calculateZakat } from "@/lib/zakatCalculator";
import CurrencyDigestTable from "@/components/converters/CurrencyDigestTable";

export function generateStaticParams() {
  // PHASE 2/3: all three shapes this one dynamic [pair] segment now
  // serves — real "<from>-to-<to>" pairs, bare single-code
  // base-currency digest slugs (e.g. "pkr"), and PHASE 3's
  // "<amount>-<from>-to-<to>" pSEO pages (e.g. "2000-aed-to-pkr") — see
  // parseBaseOnlySlug's and parseAmountPairSlug's header comments in
  // lib/pairSlugs.js for why all three live in the same route.
  return [
    ...FEATURED_PAIRS.map((pair) => ({ pair: pair.slug })),
    ...FEATURED_BASE_CURRENCIES.map((code) => ({ pair: code.toLowerCase() })),
    ...FEATURED_AMOUNT_PAIRS.map((entry) => ({ pair: entry.slug })),
    ...FEATURED_ZAKAT_GOLD_AMOUNTS.map((entry) => ({ pair: entry.slug })),
  ];
}

const ASSET_CLASS_NOUN = {
  fiat: "currency",
  crypto: "cryptocurrency",
  metals: "metal",
};

// CTR-OVERHAUL NOTE (Oct 2026 GSC review): the live Search Console
// export for this project shows near-zero CTR at an average position
// of ~60 — page 6+, where almost nobody scrolls regardless of how
// compelling the snippet is. These titles/descriptions are written to
// win the click once a page actually reaches page 1-2 (the real
// queries people type: "dollar to pkr today", "euro to pkr today",
// "42 euro to pkr", "1 euro to pkr"), using honest power words (Live
// Rate, Today, Updated 2026, Free, Instant, No Sign-Up) — deliberately
// NOT "0% Fee", which would misread as a money-transfer promise this
// site doesn't make (it's a free calculator, not a remittance
// service). CTR copy alone won't move position; see this change's
// accompanying IndexNow/indexing notes for the other half of that.
const CURRENT_YEAR = new Date().getFullYear();

export async function generateMetadata({ params }) {
  // PHASE 4: checked before every other parser — "zakat-on-10-tola-gold"
  // doesn't collide with any of the other three slug shapes (no
  // "-to-", doesn't start with a bare digit, isn't a single currency
  // code), so this ordering is for clarity, not correctness.
  const zakatParsed = parseZakatGoldSlug(params.pair);
  if (zakatParsed) {
    const { tolaAmount } = zakatParsed;
    return buildMetadata({
      title: `Zakat on ${tolaAmount} Tola Gold (${CURRENT_YEAR}) — Free Live Nisab Calculator | OmniFin Portal`,
      description: `How much zakat is due on ${tolaAmount} tola of gold today? Free instant calculator checked against the live nisab threshold at today's gold rate — covers silver, cash, and other assets too.`,
      path: `/converters/${buildZakatGoldSlug(tolaAmount)}`,
    });
  }

  // Checked first since parsePairSlug/parseBaseOnlySlug both naturally
  // reject an amount-prefixed slug on their own (see
  // parseAmountPairSlug's header comment in lib/pairSlugs.js) — this
  // ordering is for clarity/efficiency, not correctness.
  const amountParsed = parseAmountPairSlug(params.pair);
  if (amountParsed) {
    const { amount, from, to, fromClass, fromCode, toClass, toCode } = amountParsed;

    // Oct 24 2026 GSC review: these pages' CTR was 0% despite decent
    // positions (7-16) for queries like "1.99 usd to ars" — the meta
    // description never showed the actual converted number, just "the
    // live rate" as a vague promise. Baking the real computed result
    // straight into the snippet pre-answers the query right there in
    // the SERP, which is the single biggest lever available for this
    // query shape (an app-pricing-tier amount is specific enough that
    // Google's own built-in currency-converter answer box is much less
    // likely to intercept the click the way it does for generic "X to
    // Y" queries — see the bare-pair branch below for that distinction).
    // getUnifiedRates() is Next's fetch-memoized per request, so this
    // doesn't add a second real network round trip when the page body
    // below also calls it.
    let convertedLabel = "";
    try {
      const ratesPayload = await getUnifiedRates();
      const rate = getPairRate({ fromClass, fromCode, toClass, toCode, ratesPayload });
      if (Number.isFinite(rate)) {
        convertedLabel = ` ≈ ${formatNumber(amount * rate, { maximumFractionDigits: 2 })} ${to.code}`;
      }
    } catch {
      // No live rate available right now — fall back to the
      // non-numeric copy below, same as before this change.
    }

    const title = `${amount} ${from.code} to ${to.code}${convertedLabel} Today | OmniFin Portal`;
    const description = convertedLabel
      ? `${amount} ${from.name} (${from.code}) is${convertedLabel} ${to.name} (${to.code}) right now, at today's live exchange rate. Free instant currency calculator — no sign-up, updated hourly.`
      : `${amount} ${from.name} (${from.code}) in ${to.name} (${to.code}) right now, calculated from today's live exchange rate. Free instant currency calculator — no sign-up, updated in real time.`;
    return buildMetadata({
      title,
      description,
      path: `/converters/${buildAmountPairSlug(amount, amountParsed.fromCode, amountParsed.toCode)}`,
    });
  }

  const baseOnly = parseBaseOnlySlug(params.pair);
  if (baseOnly) {
    const { code, meta } = baseOnly;
    return buildMetadata({
      title: `${meta.name} (${code}) Exchange Rate Today — Live Rates vs All Currencies | OmniFin Portal`,
      description: `Live ${meta.name} (${code}) exchange rate today against every currency OmniFin Portal supports — a free, instant, sortable rate digest, updated in real time from the same live feed as the rest of the site.`,
      path: `/converters/${code.toLowerCase()}`,
    });
  }

  const parsed = parsePairSlug(params.pair);
  if (!parsed) {
    return buildMetadata({
      title: "Currency, Crypto & Metals Converter | OmniFin Portal",
      description:
        "Convert between fiat currencies, crypto and metals & commodities instantly with OmniFin Portal's free, live converter.",
      path: "/converters",
    });
  }

  const { from, to, fromClass, fromCode, toClass, toCode } = parsed;

  // Oct 24 2026 GSC review: a generic "X to Y" query (e.g. "dollar to
  // euro", "cny to tjs") is exactly the shape Google's own built-in
  // currency-converter answer box tends to intercept directly on the
  // SERP — this project's export shows pages ranking position 8-20
  // for queries like this at real impression volume with a flat 0%
  // CTR, which title/meta copy alone can't fix if Google is already
  // answering the question before the click. Baking the live rate in
  // here isn't aimed at beating that box on Google specifically — it's
  // for the AI answer engines (Perplexity, SearchGPT, Claude) that
  // have no such box and rely on crawled title/description/schema as
  // their citation source, where a precise, current number is exactly
  // what earns the citation.
  let rateLabel = "";
  let rateFormatted = null;
  try {
    const ratesPayload = await getUnifiedRates();
    const rate = getPairRate({ fromClass, fromCode, toClass, toCode, ratesPayload });
    if (Number.isFinite(rate)) {
      rateFormatted = formatNumber(rate, { maximumFractionDigits: 6 });
      rateLabel = `1 ${from.code} = ${rateFormatted} ${to.code}. `;
    }
  } catch {
    // No live rate available right now — title/description fall back
    // to the non-numeric copy below, same as before this change.
  }

  // Oct 26 2026 GSC review: the Oct 24 description-only rate bake did
  // NOT move the needle — three export cycles later, every striking-
  // distance bare-pair query (position 5-20, real impression volume)
  // still shows a flat 0% CTR, confirming the suspicion above: for the
  // common pairs Google's answer box really is intercepting the click
  // regardless of our snippet. Two changes here that specifically
  // target what the answer box CAN'T cover: (1) literally including
  // the phrase "Exchange Rate" in the title — the single biggest
  // striking-distance query by impressions, "exchange rate usd to
  // eur" (129 impr, pos 10.9), doesn't exact-match anything in the old
  // "USD to EUR Today — Live..." title at all; (2) leading the title
  // itself with the computed number (not just the description) for
  // the many EXOTIC pairs in this export (OMR/NPR, INR/AMD, KWD/NPR,
  // CNY/KZT, EUR/AZN) that Google's converter box has no combinatorial
  // coverage for — there, a title that already answers the question is
  // the actual differentiator, not a description Google may rewrite
  // anyway. from.name/to.name is intentionally kept OUT of the
  // rate-available title (codes read as a cleaner, more scannable
  // numeric answer, same lesson as the amount-pair title's "≈ X"
  // treatment below) — the full names stay in the H1, body copy, and
  // the no-rate fallback title, so existing name-based query matches
  // ("pound to riyal") aren't put at any risk.
  const title = rateFormatted
    ? `${from.code} to ${to.code} Exchange Rate Today: 1 ${from.code} = ${rateFormatted} ${to.code} | OmniFin Portal`
    : `${from.code} to ${to.code} Exchange Rate Today — Live ${from.name} to ${to.name} Rate (${CURRENT_YEAR}) | OmniFin Portal`;
  const description = `${rateLabel}Live ${from.code} to ${to.code} exchange rate, updated in real time. Free instant converter for ${from.name} to ${to.name} — covers fiat, crypto and precious metals, no sign-up needed.`;

  return buildMetadata({
    title,
    description,
    path: `/converters/${buildPairSlug(parsed.fromCode, parsed.toCode)}`,
  });
}

export default async function CurrencyPairSeoPage({ params }) {
  const zakatParsed = parseZakatGoldSlug(params.pair);
  if (zakatParsed) return <ZakatGoldSeoPage tolaAmount={zakatParsed.tolaAmount} />;

  const amountParsed = parseAmountPairSlug(params.pair);
  if (amountParsed) return <AmountPairSeoPage amountParsed={amountParsed} />;

  const baseOnly = parseBaseOnlySlug(params.pair);
  if (baseOnly) return <BaseCurrencyDigestPage baseOnly={baseOnly} />;

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

  const breadcrumbCrumbLabel = fromClass === toClass ? fromNoun : `${fromNoun} / ${toNoun}`;
  const { intro: pairIntro, formulaNote } = getPairEducationalContent({
    fromClass,
    toClass,
    from,
    to,
  });
  const faqs = buildBarePairFaqs({ from, to, rate, fetchedAt });

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
        faqs={faqs}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "Converters", href: "/converters" },
          { name: `${from.code} to ${to.code}`, href: `/converters/${slug}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500 capitalize">{breadcrumbCrumbLabel}</span>
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
          <p className="mt-2">{pairIntro}</p>
          <p className="mt-3 text-xs font-semibold text-slate-900">Formula used:</p>
          <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
            {formulaNote}
          </p>
        </div>

        {/* AdSense & Monetization Readiness: between the static
            explainer block above and the next content block below —
            see components/AdSlot.jsx. */}
        <AdSlot slot="" label="Advertisement" minHeight={100} className="mt-6" />

        <div className="mt-6">
          <MiniCalculatorWidget calculatorId={relatedCalculatorId} />
        </div>

        <FAQAccordion title={`${from.code} to ${to.code} — FAQs`} items={faqs} />

        <RelatedAmountLinks
          amountPairs={getFeaturedAmountPairsFor(fromCode, toCode)}
          currentSlug={slug}
        />

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

/** Parametric FAQ copy for the bare pair page (e.g.
 * /converters/usd-to-pkr) — added in the Oct 2026 LLMO audit; this
 * page branch previously had no FAQ content at all, unlike the
 * amount/zakat branches, despite being this project's highest-
 * impression page type. Kept local for the same reason
 * buildAmountFaqs is: every answer is built directly from this page's
 * own from/to/rate values. */
function buildBarePairFaqs({ from, to, rate, fetchedAt }) {
  const hasRate = Number.isFinite(rate);

  return [
    {
      question: `What is ${from.code} to ${to.code} today?`,
      answer: hasRate
        ? `1 ${from.name} (${from.code}) is currently worth ${formatNumber(rate, { maximumFractionDigits: 6 })} ${to.name} (${to.code}). Use the converter above to calculate any amount at this live rate.`
        : `Live rates for this pair are temporarily unavailable — the converter above fetches rates independently and will usually still work even if this figure didn't load.`,
    },
    {
      question: `How is ${from.code} to ${to.code} calculated?`,
      answer: `The converted amount is your starting amount multiplied by the current ${from.code}/${to.code} exchange rate: amount × rate = result. This is the live mid-market rate, not a quote from any specific bank or money-transfer service, which typically add their own markup.`,
    },
    {
      question: "Does this rate update in real time?",
      answer: `Yes — this page pulls from the same live rate feed used across OmniFin Portal, refreshed hourly.${fetchedAt ? ` Last refreshed ${new Date(fetchedAt).toUTCString()}.` : ""}`,
    },
  ];
}

/** Parametric FAQ copy for an amount-specific pSEO page — kept local
 * to this file (rather than a shared helper) since every answer here
 * is built directly from the page's own amount/from/to/rate values,
 * not reusable educational content like getPairEducationalContent's. */
function buildAmountFaqs({ amount, from, to, rate, fetchedAt }) {
  const hasRate = Number.isFinite(rate);
  const convertedAmount = hasRate ? amount * rate : null;

  const faqs = [
    {
      question: `How much is ${amount} ${from.code} in ${to.code}?`,
      answer: hasRate
        ? `${amount} ${from.name} (${from.code}) is approximately ${formatNumber(convertedAmount, { maximumFractionDigits: 2 })} ${to.name} (${to.code}) at the current live exchange rate of 1 ${from.code} = ${formatNumber(rate, { maximumFractionDigits: 6 })} ${to.code}.`
        : `Live rates for this pair are temporarily unavailable — try the full converter on this page, which fetches rates independently.`,
    },
    {
      question: `What is the ${from.code} to ${to.code} exchange rate today?`,
      answer: hasRate
        ? `As of the last update, 1 ${from.code} equals ${formatNumber(rate, { maximumFractionDigits: 6 })} ${to.code}. This rate updates automatically and is not fixed — use the converter above for the current figure whenever you check.`
        : `Rates for this pair couldn't be loaded just now. The interactive converter further down this page fetches rates independently and will usually still work even if this figure didn't load.`,
    },
    {
      question: "Does this rate update in real time?",
      answer: `Yes — this page pulls from the same live rate feed used across OmniFin Portal, refreshed hourly.${fetchedAt ? ` The figure above was last refreshed ${new Date(fetchedAt).toUTCString()}.` : ""} It's not a fixed or delayed rate.`,
    },
    {
      question: "Is this rate the same one I'd get sending money through a bank or exchange?",
      answer:
        "This is the live mid-market exchange rate, not a quote from any specific bank, exchange house, or money-transfer service — those typically add their own markup or fee on top. Use this figure as a reference point to compare against what any provider actually offers you.",
    },
  ];

  return faqs;
}

/** PHASE 3 — amount-specific pSEO page, e.g. /converters/2000-aed-to-pkr
 * (targets the literal search query "2000 AED to PKR"). Shares the
 * same live-rate lookup, educational content, mini-calculator
 * cross-sell, and Popular Pairs block as the bare pair page above, but
 * leads with the dark AmountConversionCard widget instead of the plain
 * rate line, and adds amount-specific FAQ + structured data. */
async function AmountPairSeoPage({ amountParsed }) {
  const { amount, fromClass, fromCode, from, toClass, toCode, to } = amountParsed;
  const slug = buildAmountPairSlug(amount, fromCode, toCode);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/converters/${slug}`;

  let rate = null;
  let fetchedAt = null;
  try {
    const ratesPayload = await getUnifiedRates();
    rate = getPairRate({ fromClass, fromCode, toClass, toCode, ratesPayload });
    fetchedAt = ratesPayload?.fetchedAt || null;
  } catch {
    // Leave rate/fetchedAt null — AmountConversionCard and the FAQ copy
    // below both render an honest "unavailable" state rather than a
    // fabricated number, and the interactive CurrencyConverter further
    // down the page fetches its own rates independently regardless.
  }

  const fromNoun = ASSET_CLASS_NOUN[fromClass] || "asset";
  const toNoun = ASSET_CLASS_NOUN[toClass] || "asset";
  const breadcrumbCrumbLabel = fromClass === toClass ? fromNoun : `${fromNoun} / ${toNoun}`;

  const isForexPair = fromClass === "fiat" || toClass === "fiat";
  const relatedCalculatorId = isForexPair ? "pip-value" : "margin";

  const { intro: pairIntro, formulaNote } = getPairEducationalContent({
    fromClass,
    toClass,
    from,
    to,
  });

  const faqs = buildAmountFaqs({ amount, from, to, rate, fetchedAt });

  return (
    <>
      <AmountConverterStructuredData
        amount={amount}
        from={from}
        fromClass={fromClass}
        to={to}
        toClass={toClass}
        rate={rate}
        fetchedAt={fetchedAt}
        pageUrl={pageUrl}
        siteUrl={siteUrl}
        faqs={faqs}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "Converters", href: "/converters" },
          { name: `${amount} ${from.code} to ${to.code}`, href: `/converters/${slug}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500 capitalize">{breadcrumbCrumbLabel}</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {amount} {from.code} to {to.code} — {amount} {from.name} to {to.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Live conversion of {amount} {from.name} to {to.name}, with alternative amounts and a
            quick breakdown table below.
          </p>
        </div>
      </section>

      <AmountConversionCard amount={amount} from={from} to={to} rate={rate} fetchedAt={fetchedAt} />

      <section className="mx-auto max-w-5xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">About this pair</h2>
          <p className="mt-2">{pairIntro}</p>
          <p className="mt-3 text-xs font-semibold text-slate-900">Formula used:</p>
          <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
            {formulaNote}
          </p>
        </div>

        <AdSlot slot="" label="Advertisement" minHeight={100} className="mt-6" />

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Need a different amount or pair?
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Use the full converter below to try any amount, or any currency, crypto, or metal.
          </p>
        </div>

        <CurrencyConverter
          initialFromClass={fromClass}
          initialFromCode={fromCode}
          initialToClass={toClass}
          initialToCode={toCode}
        />

        <div className="mt-6">
          <MiniCalculatorWidget calculatorId={relatedCalculatorId} />
        </div>

        <FAQAccordion title={`${from.code} to ${to.code} — FAQs`} items={faqs} />

        <RelatedAmountLinks
          amountPairs={getFeaturedAmountPairsFor(fromCode, toCode)}
          currentSlug={slug}
          bareHref={`/converters/${buildPairSlug(fromCode, toCode)}`}
          bareLabel={`Any amount of ${from.code} to ${to.code} — live converter`}
        />

        <PopularPairs pairs={FEATURED_PAIRS} currentSlug={slug} />

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/converters" className="font-medium text-brand-600 hover:text-brand-700">
            ← Browse all converters
          </Link>
          <Link href="/tools" className="font-medium text-brand-600 hover:text-brand-700">
            Household financial tools
          </Link>
          <Link href="/market-analysis" className="font-medium text-brand-600 hover:text-brand-700">
            Live market analysis
          </Link>
        </div>
      </section>
    </>
  );
}

/** Parametric FAQ copy for a Zakat Gold pSEO page, same local-helper
 * pattern as buildAmountFaqs above. */
function buildZakatGoldFaqs({ tolaAmount, grams, zakatResult }) {
  const hasResult = Boolean(zakatResult);

  return [
    {
      question: `How much zakat is due on ${tolaAmount} tola of gold?`,
      answer: hasResult
        ? zakatResult.meetsNisab
          ? `At today's gold rate, ${tolaAmount} tola (${grams.toFixed(2)}g) of gold is worth approximately ${formatNumber(zakatResult.goldValue, { maximumFractionDigits: 0 })} PKR — above the gold nisab threshold, so zakat of 2.5% would be approximately ${formatNumber(zakatResult.zakatDue, { maximumFractionDigits: 0 })} PKR, assuming this gold is your only zakatable asset.`
          : `At today's gold rate, ${tolaAmount} tola (${grams.toFixed(2)}g) of gold is worth approximately ${formatNumber(zakatResult.goldValue, { maximumFractionDigits: 0 })} PKR — below the gold nisab threshold (87.48g), so no zakat would be due on this gold alone. Use the calculator below to add any other cash, savings, or assets you hold.`
        : "Live gold rates are temporarily unavailable — use the interactive calculator below, which fetches rates independently.",
    },
    {
      question: "What is the gold nisab threshold?",
      answer:
        "The commonly-cited gold nisab threshold is 87.48 grams (about 7.5 tola) of gold. If your total zakatable wealth is at or above the value of this much gold, zakat becomes due at 2.5% of your total zakatable wealth — not just the gold portion.",
    },
    {
      question: "Does this use the gold or silver nisab standard?",
      answer:
        "This reference page uses the gold standard, since it's specifically about a gold holding. If you also hold cash, savings, or silver, the silver standard (a lower, more inclusive threshold) is often recommended for mixed holdings — the full calculator below lets you switch between both and add every asset you hold.",
    },
    {
      question: "Is this a religious ruling on my own zakat obligation?",
      answer:
        "No — nisab thresholds and the exact zakat rate are matters of Islamic jurisprudence (fiqh), and different scholars hold different views, most notably on which nisab standard applies to mixed holdings. This is a general reference using commonly-cited figures, not a fatwa — consult a scholar for guidance on your own specific situation.",
    },
  ];
}

/** PHASE 4 — Zakat Gold pSEO page, e.g.
 * /converters/zakat-on-10-tola-gold (targets the literal search query
 * "Zakat on 10 Tola Gold"). Computes a live, gold-nisab-standard quick
 * reference (via the same lib/zakatCalculator.js math the interactive
 * tool uses) assuming this gold is the visitor's only zakatable asset,
 * then hands off to the full <ZakatCalculator/> — pre-filled with this
 * page's gram equivalent — for anyone who also holds cash, savings, or
 * silver. */
async function ZakatGoldSeoPage({ tolaAmount }) {
  const slug = buildZakatGoldSlug(tolaAmount);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/converters/${slug}`;
  const grams = tolaAmount * WEIGHT_UNITS.tola;

  let zakatResult = null;
  try {
    const ratesPayload = await getUnifiedRates();
    zakatResult = calculateZakat({
      xauUsdRate: ratesPayload?.metals?.XAU,
      xagUsdRate: ratesPayload?.metals?.XAG,
      usdToLocalFx: ratesPayload?.fiat?.PKR,
      goldGrams: grams,
      nisabStandard: "gold",
    });
  } catch {
    // Leave zakatResult null — the page's copy and FAQ both render an
    // honest "unavailable" state, and the interactive ZakatCalculator
    // further down the page fetches its own rates independently.
  }

  const faqs = buildZakatGoldFaqs({ tolaAmount, grams, zakatResult });

  return (
    <>
      <ZakatGoldStructuredData
        tolaAmount={tolaAmount}
        grams={grams}
        zakatResult={zakatResult}
        pageUrl={pageUrl}
        siteUrl={siteUrl}
        faqs={faqs}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "Converters", href: "/converters" },
          { name: `Zakat on ${tolaAmount} Tola Gold`, href: `/converters/${slug}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Zakat on {tolaAmount} Tola Gold</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Zakat on {tolaAmount} Tola Gold
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {tolaAmount} tola ({grams.toFixed(2)} grams) of gold, checked against the live gold
            nisab threshold — with a full calculator below for silver, cash, and other assets.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-ink p-6 text-white shadow-card sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-300">
              Live Gold-Standard Reference
            </span>

            {zakatResult ? (
              <>
                <p className="mt-5 text-sm font-medium text-slate-400">
                  {tolaAmount} tola ({grams.toFixed(2)}g) of gold is worth approximately
                </p>
                <p className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {formatNumber(zakatResult.goldValue, { maximumFractionDigits: 0 })}{" "}
                  <span className="text-2xl font-bold text-slate-300 sm:text-3xl">PKR</span>
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Gold Nisab Threshold (87.48g)
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">
                      {formatNumber(zakatResult.nisabThresholdValue, { maximumFractionDigits: 0 })}{" "}
                      PKR
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {zakatResult.meetsNisab ? "Zakat Due (2.5%)" : "Zakat Due"}
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">
                      {zakatResult.meetsNisab
                        ? `${formatNumber(zakatResult.zakatDue, { maximumFractionDigits: 0 })} PKR`
                        : "None — below nisab"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  Assumes this gold is your only zakatable asset, using the gold nisab standard.
                  Add cash, savings, or silver in the calculator below for your full picture.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-amber-300">
                Live gold rate temporarily unavailable — use the calculator below, which fetches
                rates independently.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/tools/zakat-calculator" className="font-semibold text-brand-300 hover:text-brand-200">
                Open Full Zakat Calculator →
              </Link>
              <Link href="/market-analysis" className="font-semibold text-brand-300 hover:text-brand-200">
                Live Market Charts →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <h2 className="text-sm font-semibold text-slate-900">
          Adjust for silver, cash, or other assets
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Pre-filled with {grams.toFixed(2)}g of gold — add anything else you hold below.
        </p>
        <div className="mt-3">
          <ZakatCalculator initialGoldGrams={Number(grams.toFixed(2))} />
        </div>

        <AdSlot slot="" label="Advertisement" minHeight={100} className="mt-6" />

        <FAQAccordion title="Zakat on Gold — FAQs" items={faqs} />

        {/* Internal-linking gap fix (Oct 2026 GSC review): the other
            tola-amount zakat pages, and the live gold/silver converter
            pages, were previously never linked from here — only
            reachable via sitemap.xml, with zero internal-link equity
            flowing between this cluster of pages. */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Zakat on Other Gold Amounts
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEATURED_ZAKAT_GOLD_AMOUNTS.filter((entry) => entry.tolaAmount !== tolaAmount).map(
              (entry) => (
                <Link
                  key={entry.slug}
                  href={`/converters/${entry.slug}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
                >
                  {entry.tolaAmount} Tola
                </Link>
              )
            )}
            <Link
              href="/converters/xau-to-pkr"
              className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400"
            >
              Live Gold Rate →
            </Link>
            <Link
              href="/converters/xag-to-pkr"
              className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400"
            >
              Live Silver Rate →
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/converters" className="font-medium text-brand-600 hover:text-brand-700">
            ← Browse all converters
          </Link>
          <Link href="/tools" className="font-medium text-brand-600 hover:text-brand-700">
            Household financial tools
          </Link>
          <Link href="/tools/gold-jewellery-calculator" className="font-medium text-brand-600 hover:text-brand-700">
            Gold &amp; Jewellery Calculator
          </Link>
        </div>
      </section>
    </>
  );
}

// PHASE 2 ADDITION — "/converters/<base-code>" base-currency rate
// digest page (e.g. /converters/pkr, /converters/usd, /converters/aed):
// a sortable/searchable table of that one base currency against every
// other fiat currency OmniFin Portal supports, computed from the same
// single getUnifiedRates() server-side call every pair page already
// uses (see this file's top-of-file ARCHITECTURAL NOTE) — zero new API
// calls, zero new scraping, just a wider view of rates already fetched
// for the site's other converter pages.
async function BaseCurrencyDigestPage({ baseOnly }) {
  const { code: baseCode, meta: baseMeta } = baseOnly;
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/converters/${baseCode.toLowerCase()}`;

  let rows = [];
  let fetchedAt = null;
  try {
    const ratesPayload = await getUnifiedRates();
    fetchedAt = ratesPayload?.fetchedAt || null;
    rows = CURRENCIES.filter((c) => c.code !== baseCode).map((c) => ({
      code: c.code,
      name: c.name,
      rate: getPairRate({
        fromClass: "fiat",
        fromCode: baseCode,
        toClass: "fiat",
        toCode: c.code,
        ratesPayload,
      }),
    }));
  } catch {
    // Leave rows empty — the table component's own "no currency
    // matches" copy covers this gracefully rather than crashing the
    // page if every rate provider is briefly unreachable.
    rows = CURRENCIES.filter((c) => c.code !== baseCode).map((c) => ({
      code: c.code,
      name: c.name,
      rate: null,
    }));
  }

  // A handful of this base currency's own FEATURED_PAIRS entries, so
  // the digest table's full long tail still links back up into the
  // site's existing pair-page internal-linking graph both ways.
  const relatedFeaturedPairs = FEATURED_PAIRS.filter(
    (p) =>
      (p.fromClass === "fiat" && p.fromCode === baseCode) ||
      (p.toClass === "fiat" && p.toCode === baseCode)
  ).slice(0, 8);

  return (
    <>
      <BaseDigestStructuredData
        baseCode={baseCode}
        baseName={baseMeta.name}
        rows={rows}
        pageUrl={pageUrl}
        siteUrl={siteUrl}
        fetchedAt={fetchedAt}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "Converters", href: "/converters" },
          { name: `${baseCode} Rate Digest`, href: `/converters/${baseCode.toLowerCase()}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/converters" className="hover:text-brand-600">
              Converters
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{baseCode} Rate Digest</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {baseMeta.name} ({baseCode}) Exchange Rate — All Currencies
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Live {baseMeta.name} rates against every currency OmniFin Portal supports — search,
            sort, or jump straight into any pair&apos;s own live converter page below.
          </p>
          {fetchedAt && (
            <p className="mt-2 text-xs text-slate-400">
              Rates last updated {new Date(fetchedAt).toUTCString()}.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <CurrencyDigestTable baseCode={baseCode} rows={rows} />

        {relatedFeaturedPairs.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {relatedFeaturedPairs.map((p) => (
              <Link
                key={p.slug}
                href={`/converters/${p.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {p.title} →
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/converters" className="font-medium text-brand-600 hover:text-brand-700">
            ← Browse all converters
          </Link>
          <Link href="/tools" className="font-medium text-brand-600 hover:text-brand-700">
            Household financial tools
          </Link>
        </div>
      </section>
    </>
  );
}
