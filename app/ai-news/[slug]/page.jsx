// app/ai-news/[slug]/page.jsx
//
// Individual permalink page for one AI News headline — added Oct 2026
// to close a real GSC gap: /ai-news (the hub) matched a highly
// specific long-tail query at position 8.3/72 impressions, but the
// hub's own generic title ("Financial News & Economic Calendar...")
// can't match a searcher's intent for one specific story, so it got
// 0% CTR there. Every headline now gets its own URL, metadata, and
// canonical tag instead of only existing as one row inside the hub.
//
// WHAT THIS PAGE IS, HONESTLY: the underlying headline is a third-
// party article from an external outlet (Yahoo Finance, MarketWatch,
// CNBC, FXStreet, CoinDesk, Cointelegraph, OilPrice — see
// lib/newsAggregator.js's FEEDS) that OmniFin Portal links to, not an
// article OmniFin wrote. This page is OmniFin's OWN commentary page
// ABOUT that headline — the AI-generated one-line gloss, the rule-
// based/AI macro directional read when one exists, and a live related-
// asset rate pulled from this site's own feed — with a prominent,
// unambiguous link to read the real story at its original source. See
// components/ai-news/NewsItemStructuredData.jsx for how that honesty
// bar carries into the page's own JSON-LD, matching the same
// documented principle components/NewsStructuredData.jsx already
// follows on the hub page.
//
// NO DATABASE, NO NEW DATA SOURCE: this route calls the exact same
// getCachedAggregatedNews() the hub page already calls (still the
// 15-minute Data Cache from lib/cachedData.js — no change to that
// caching or to lib/newsAggregator.js itself) and finds the matching
// item by recomputing its slug — see lib/newsSlug.js's header comment
// for why that's safe and stable without any storage. If the headline
// has rotated out of the live feed window entirely, this calls
// notFound() — a real 404 via this project's existing branded
// app/not-found.jsx, never a disguised redirect to the hub (which
// Google's own guidelines call out as a "soft 404" anti-pattern).

import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import BreadcrumbStructuredData from "@/components/BreadcrumbStructuredData";
import NewsItemStructuredData from "@/components/ai-news/NewsItemStructuredData";
import AdSlot from "@/components/AdSlot";
import { getCachedAggregatedNews } from "@/lib/cachedData";
import { getUnifiedRates } from "@/lib/marketData";
import { getPairRate } from "@/lib/assetConversion";
import { attachNewsItemSlugs, buildNewsItemSlug } from "@/lib/newsSlug";
import { buildMetadata } from "@/lib/pageMetadata";
import { getSiteUrl } from "@/lib/siteUrl";
import { formatNumber } from "@/lib/formatNumber";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Maps lib/newsAggregator.js's relatedAssets labels to a live converter
// pair on this site, for the "what does this mean for the rate right
// now" widget below — real, genuine added value beyond the scraped
// excerpt, not decoration. Assets this site has no pair page for
// (Oil, S&P 500/Stocks — there's no commodities-pair or equity-index
// converter on this platform) are intentionally left unmapped rather
// than linked somewhere irrelevant.
const ASSET_TO_PAIR = {
  Gold: { fromClass: "metals", fromCode: "XAU", toClass: "fiat", toCode: "USD" },
  Silver: { fromClass: "metals", fromCode: "XAG", toClass: "fiat", toCode: "USD" },
  BTC: { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "USD" },
  Bitcoin: { fromClass: "crypto", fromCode: "BTC", toClass: "fiat", toCode: "USD" },
  ETH: { fromClass: "crypto", fromCode: "ETH", toClass: "fiat", toCode: "USD" },
  USD: { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "USD" },
  EUR: { fromClass: "fiat", fromCode: "EUR", toClass: "fiat", toCode: "USD" },
  GBP: { fromClass: "fiat", fromCode: "GBP", toClass: "fiat", toCode: "USD" },
};

// React's cache() dedupes this within a single request — generateMetadata()
// below and the page component itself both need the same lookup, and
// without this each would independently call getCachedAggregatedNews()
// (cheap once its 15-minute Data Cache entry is warm, but not free on a
// cold cache). This guarantees exactly one call either way, scoped to
// this one request only (not a new persistent cache).
const loadMatch = cache(async (slug) => {
  const data = await getCachedAggregatedNews();
  // attachNewsItemSlugs() gives every item here a real `.slug` string
  // (mock items are already excluded by the filter below, so none of
  // these get the `slug: null` it reserves for them) — needed so
  // `item.slug`/`allItems[].slug` further down are real, comparable
  // strings, not `undefined === undefined` false-matching everything.
  const items = attachNewsItemSlugs((data?.items || []).filter((entry) => !entry.isMock));
  const item = items.find((entry) => entry.slug === slug) || null;
  const macroImpactItem =
    (data?.macroImpact?.items || [])
      .map((entry) => ({ ...entry, slug: buildNewsItemSlug(entry) }))
      .find((entry) => entry.slug === slug) || null;
  return { item, macroImpactItem, allItems: items };
});

export async function generateMetadata({ params }) {
  const { item } = await loadMatch(params.slug);

  if (!item) {
    return buildMetadata({
      title: "Story No Longer Available | OmniFin Portal AI News",
      description:
        "This headline has rotated out of our live news wire. Browse the latest financial news on OmniFin Portal.",
      path: `/ai-news/${params.slug}`,
      noIndex: true,
    });
  }

  const title = `${item.title} — ${item.source} | OmniFin Portal AI News`;
  const description = (item.summary || item.excerpt || item.title).slice(0, 300);

  return buildMetadata({
    title,
    description,
    path: `/ai-news/${item.slug}`,
    type: "article",
  });
}

export default async function AiNewsItemPage({ params }) {
  const { item, macroImpactItem, allItems } = await loadMatch(params.slug);
  if (!item) notFound();

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/ai-news/${item.slug}`;

  const relatedAssets = item.relatedAssets || [];
  const assetPairs = relatedAssets
    .map((asset) => ({ asset, pair: ASSET_TO_PAIR[asset] }))
    .filter((entry) => entry.pair);

  let ratesPayload = null;
  if (assetPairs.length > 0) {
    try {
      ratesPayload = await getUnifiedRates();
    } catch {
      ratesPayload = null; // Widget below just renders nothing per asset without a rate.
    }
  }

  const relatedHeadlines = allItems
    .filter((i) => i.slug !== item.slug && i.category === item.category)
    .slice(0, 4);

  return (
    <>
      <NewsItemStructuredData item={item} pageUrl={pageUrl} siteUrl={siteUrl} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "AI News", href: "/ai-news" },
          // No href for the category crumb: /ai-news's category tabs
          // (components/ai-news/MarketInsightsExplorer.jsx) are plain
          // client-side state, not driven by a URL query param, so
          // "/ai-news?category=X" would silently do nothing — the same
          // kind of promised-but-missing capability this project's own
          // honesty bar has flagged and fixed before (see
          // components/SiteStructuredData.jsx's SearchAction history).
          ...(item.category ? [{ name: item.category }] : []),
          { name: item.title },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/ai-news" className="hover:text-brand-600">
              AI News
            </Link>
            {item.category && (
              <>
                <span className="mx-1.5">/</span>
                <span className="text-slate-500">{item.category}</span>
              </>
            )}
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {item.title}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {item.source}
            {item.publishedAt && (
              <> · {new Date(item.publishedAt).toUTCString()}</>
            )}
          </p>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              Read the full story at {item.source} ↗
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold text-slate-900">OmniFin Portal&apos;s take</h2>
          {item.summaryStatus === "ready" && item.summary ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.summary}</p>
          ) : item.excerpt ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Excerpt from {item.source}:{" "}
              </span>
              &ldquo;{item.excerpt}&rdquo;
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No summary available yet for this headline — read the full story at the link above.
            </p>
          )}

          {item.sentiment && (
            <p className="mt-3 text-xs font-medium text-slate-500">
              Rule-based headline sentiment:{" "}
              <span className="font-semibold text-slate-700">{item.sentiment}</span>
            </p>
          )}
        </div>

        {macroImpactItem && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-900">Likely macro impact</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {macroImpactItem.favorable.map((asset) => (
                <span
                  key={`fav-${asset}`}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                >
                  🟢 Favorable for {asset}
                </span>
              ))}
              {macroImpactItem.unfavorable.map((asset) => (
                <span
                  key={`unfav-${asset}`}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700"
                >
                  🔴 Unfavorable for {asset}
                </span>
              ))}
            </div>
            {macroImpactItem.note && (
              <p className="mt-2.5 text-xs leading-relaxed text-slate-600">{macroImpactItem.note}</p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              {macroImpactItem.provider === "rule-based"
                ? "Rule-based keyword read, not AI-generated."
                : "AI-generated directional read."}
            </p>
          </div>
        )}

        {assetPairs.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-900">Live rate right now</h2>
            <div className="mt-3 space-y-2">
              {assetPairs.map(({ asset, pair }) => {
                const rate = ratesPayload
                  ? getPairRate({ ...pair, ratesPayload })
                  : null;
                const slug = `${pair.fromCode.toLowerCase()}-to-${pair.toCode.toLowerCase()}`;
                return (
                  <Link
                    key={asset}
                    href={`/converters/${slug}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="font-medium text-slate-700">{asset}</span>
                    <span className="font-mono text-slate-600">
                      {Number.isFinite(rate)
                        ? `1 ${pair.fromCode} = ${formatNumber(rate, { maximumFractionDigits: 6 })} ${pair.toCode}`
                        : "View live rate →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <AdSlot slot="" label="Advertisement" minHeight={100} className="mt-6" />

        {relatedHeadlines.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-900">
              More {item.category || "market"} headlines
            </h2>
            <div className="mt-3 space-y-2">
              {relatedHeadlines.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ai-news/${related.slug}`}
                  className="block rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-brand-300 hover:text-brand-700"
                >
                  {related.title}
                  <span className="ml-1.5 text-xs font-normal text-slate-400">— {related.source}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/ai-news" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            ← Back to all AI News
          </Link>
        </div>
      </section>
    </>
  );
}
