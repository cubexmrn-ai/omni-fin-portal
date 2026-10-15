import NewsStructuredData from "@/components/NewsStructuredData";
import EconomicCalendar from "@/components/EconomicCalendar";
import LiveSentimentIndicator from "@/components/LiveSentimentIndicator";
import AiNewsHero from "@/components/AiNewsHero";
import MarketInsightsExplorer from "@/components/ai-news/MarketInsightsExplorer";
import { getCachedAggregatedNews } from "@/lib/cachedData";
import { getUnifiedRates } from "@/lib/marketData";
import { buildMetadata } from "@/lib/pageMetadata";

const aiNewsMetadata = buildMetadata({
  title: "Financial News & Economic Calendar — Forex, Crypto, Commodities & Stocks | OmniFin Portal",
  description:
    "Live market sentiment for Gold, EUR/USD and Bitcoin, a live real-time TradingView economic calendar (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY), and 60+ live finance headlines across Forex, Crypto, Commodities and Stocks — all on one page.",
  path: "/ai-news",
});

// RSS discovery (Week 4, Task 28): lets feed readers and browsers find
// /feed.xml automatically from this page, in addition to it being
// directly linkable.
export const metadata = {
  ...aiNewsMetadata,
  alternates: {
    ...aiNewsMetadata.alternates,
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

// This page used to be `export const revalidate = 900` (ISR): Next.js
// tried to statically render it once at build time, then refresh in
// the background every 15 minutes. That build-time prerender is what
// started timing out once a real paid GEMINI_API_KEY made
// getYoutubeAutomationFeed()/getAggregatedNews()'s headline
// summarization actually perform their full AI calls instead of
// short-circuiting to instant fallbacks — same root cause as
// /market-analysis (see that page's own comment for the full
// explanation). `force-dynamic` skips that build-time prerender
// entirely; the 15-minute refresh cadence is preserved a layer deeper
// via lib/cachedData.js's unstable_cache()-wrapped versions of both
// functions instead of the page-level `revalidate`.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function AiNewsPage() {
  let data = null;
  let loadError = null;

  try {
    // Calling the aggregator through lib/cachedData.js's cached
    // wrapper (not lib/newsAggregator.js directly, and no HTTP
    // self-fetch to /api/news-ai either — see the top of
    // lib/newsAggregator.js for why that self-fetch was the actual
    // cause of this page's "DOCTYPE is not valid JSON" error in
    // production). getAggregatedNews() is also designed to never throw
    // (per-feed try/catch + a static mock fallback if every feed
    // fails), so loadError below should now only ever fire on a truly
    // unexpected bug, not a network/feed issue.
    data = await getCachedAggregatedNews();
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
      <NewsStructuredData items={items} />
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <AiNewsHero />

          <div
            className={`mt-5 inline-flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
              data?.aiSummarization?.enabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
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
                "Headlines are live from RSS, with rule-based sentiment badges."}
            </span>
          </div>
        </div>
      </section>

      {/* Tiers, all stacked and simultaneously visible — no tabs at the
          page level, nothing hidden behind a toggle. Order: the unified
          category explorer (sticky multi-instrument sentiment bar, then
          the Live Macro News Wire Feed, sharing one All/Forex/Crypto/
          Metals & Commodities/Macro tab row), then Live Market
          Sentiment, then the Economic Calendar. No AI Video Insights
          grid here any more — that's /market-analysis's alone now, so
          the two pages don't duplicate each other (see
          components/ai-news/MarketInsightsExplorer.jsx's header).
          UI CLEANUP PASS: the Social Buzz Tracker (simulated/Reddit
          chatter card) was removed entirely from this page — no
          simulated social pills, no live-API toggle, no Reddit/X
          integration anywhere in this deployment any more. */}
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <MarketInsightsExplorer
          newsItems={items}
          loadError={loadError}
          warnings={data?.warnings}
          ratesData={ratesData}
        />

        <LiveSentimentIndicator ratesData={ratesData} />

        <EconomicCalendar />
      </section>
    </>
  );
}
