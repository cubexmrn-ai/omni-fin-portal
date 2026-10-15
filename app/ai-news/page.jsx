import NewsStructuredData from "@/components/NewsStructuredData";
import SocialBuzzTracker from "@/components/SocialBuzzTracker";
import EconomicCalendar from "@/components/EconomicCalendar";
import LiveSentimentIndicator from "@/components/LiveSentimentIndicator";
import AiNewsHero from "@/components/AiNewsHero";
import SentimentPulseBar from "@/components/ai-news/SentimentPulseBar";
import MarketInsightsExplorer from "@/components/ai-news/MarketInsightsExplorer";
import { getAggregatedNews } from "@/lib/newsAggregator";
import { getYoutubeAutomationFeed } from "@/lib/youtubeAutomation";
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

  // Same direct-call pattern as getAggregatedNews()/getUnifiedRates()
  // above — no self-fetch to /api/youtube-automation. Never throws, but
  // guarded anyway so a truly unexpected error can't take the page down.
  let videoPosts = [];
  try {
    const videoData = await getYoutubeAutomationFeed();
    videoPosts = (videoData.posts || []).filter((p) => p.category === "ai-news");
  } catch {
    videoPosts = [];
  }

  return (
    <>
      <NewsStructuredData items={items} />
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <AiNewsHero />

          <div className="mt-6">
            <SentimentPulseBar ratesData={ratesData} />
          </div>

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
          category explorer (AI Video Insights + Live News Feed, one
          shared All/Forex/Crypto/Metals & Commodities/Macro tab row),
          then Live Market Sentiment, then the Economic Calendar. */}
      <section className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <SocialBuzzTracker />
          <div className="mt-6">
            <MarketInsightsExplorer
              videoPosts={videoPosts}
              newsItems={items}
              loadError={loadError}
              warnings={data?.warnings}
            />
          </div>
        </div>

        <LiveSentimentIndicator ratesData={ratesData} />

        <EconomicCalendar />
      </section>
    </>
  );
}
