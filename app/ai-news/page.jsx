import NewsFeed from "@/components/NewsFeed";
import SocialBuzzTracker from "@/components/SocialBuzzTracker";
import EconomicCalendar from "@/components/EconomicCalendar";
import LiveSentimentIndicator from "@/components/LiveSentimentIndicator";
import AiNewsHero from "@/components/AiNewsHero";
import { getAggregatedNews } from "@/lib/newsAggregator";
import { getUnifiedRates } from "@/lib/marketData";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Financial News & Economic Calendar — Forex, Crypto, Commodities & Stocks | OmniFin Portal",
  description:
    "Live market sentiment for Gold, EUR/USD and Bitcoin, a live real-time TradingView economic calendar (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY), and 60+ live finance headlines across Forex, Crypto, Commodities and Stocks — all on one page.",
  path: "/ai-news",
});

export const revalidate = 900; // Align with /api/news-ai's ISR cache.

export default async function AiNewsPage() {
  let data = null;
  let loadError = null;

  try {
    // Calling the aggregator directly (not via an HTTP self-fetch to
    // /api/news-ai) — see the top of lib/newsAggregator.js for why that
    // self-fetch was the actual cause of this page's "DOCTYPE is not
    // valid JSON" error in production. getAggregatedNews() is also
    // designed to never throw (per-feed try/catch + a static mock
    // fallback if every feed fails), so loadError below should now only
    // ever fire on a truly unexpected bug, not a network/feed issue.
    data = await getAggregatedNews();
  } catch (err) {
    loadError = err.message;
  }

  // Same getUnifiedRates() payload the Metals & Commodities Calculator,
  // Currency Converter, and /market-analysis's AI Technical Analysis
  // tool all read from — Tier 1's sentiment cards reuse it directly
  // rather than hitting a second data source.
  let ratesData = null;
  try {
    ratesData = await getUnifiedRates();
  } catch {
    ratesData = null; // LiveSentimentIndicator/resolveInstrumentPrice handle a null payload gracefully.
  }

  const items = data?.items || [];

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <AiNewsHero />

          <div className="mt-5 inline-flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <svg
              width="16"
              height="16"
              className="mt-0.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              {data?.aiSummarization?.note ||
                "AI-generated summaries are coming soon — this feed currently shows raw headlines only."}
            </span>
          </div>
        </div>
      </section>

      {/* Three tiers, all stacked and simultaneously visible — no tabs,
          nothing hidden behind a toggle. */}
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Tier 1: Live Market Sentiment (Gold, EUR/USD, BTC) */}
        <LiveSentimentIndicator ratesData={ratesData} />

        {/* Tier 2: official live TradingView Economic Calendar */}
        <EconomicCalendar />

        {/* Tier 3: Social Buzz + the full live news feed grid with
            category filters (Forex/Crypto/Commodities/Stocks map to
            the user's Forex/Metals/Crypto/Macro framing — see
            components/NewsFeed.jsx's CATEGORY_ORDER). */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Live News Feed</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              {items.length} headlines
            </span>
          </div>

          <div className="mt-3">
            <SocialBuzzTracker />
          </div>

          <div className="mt-6">
            {loadError && (
              <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Couldn&apos;t load the news feed right now ({loadError}). Please
                try again shortly.
              </div>
            )}

            {data?.warnings?.length > 0 && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Some sources were unavailable: {data.warnings.join(" · ")}
              </div>
            )}

            {!loadError && items.length === 0 ? (
              <p className="text-sm text-slate-500">
                No headlines available right now — please check back shortly.
              </p>
            ) : (
              <NewsFeed items={items} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
