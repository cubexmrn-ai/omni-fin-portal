import NewsStructuredData from "@/components/NewsStructuredData";
import EconomicCalendar from "@/components/EconomicCalendar";
import AiNewsHero from "@/components/AiNewsHero";
import MarketInsightsExplorer from "@/components/ai-news/MarketInsightsExplorer";
import MacroImpactHero from "@/components/ai-news/MacroImpactHero";
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
  // tool all read from — the sentiment pulse bar inside
  // MarketInsightsExplorer reuses it directly rather than hitting a
  // second data source.
  let ratesData = null;
  try {
    ratesData = await getUnifiedRates();
  } catch {
    ratesData = null; // getCompositeSentiment()/resolveInstrumentPrice handle a null payload gracefully.
  }

  const items = data?.items || [];

  return (
    <>
      <NewsStructuredData items={items} />
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <AiNewsHero />
        </div>
      </section>

      {/* LAYOUT REFACTOR: fixed top-to-bottom order is now (1) header +
          macro sentiment meter bar, (2) the NEW "AI High-Impact News &
          Sentiment" hero (MacroImpactHero — structured directional-
          impact cards for top-tier macro headlines only, replacing the
          old raw developer-status banner that used to sit right under
          the hero text above, e.g. "AI-generated one-line summaries...
          8 via Gemini"), (3) the real-time Economic Calendar widget,
          (4) the Public News Wire at the very bottom (search + category
          tabs + compact cards + Load More — see NewsWireFeed.jsx).
          MarketInsightsExplorer still owns the meter bar AND the wire
          feed (they share state — see its own header comment), so (2)
          and (3) are passed in as `children` to land in exactly that
          slot between the two. No AI Video Insights grid here any
          more — that's /market-analysis's alone, so the two pages
          don't duplicate each other. UI CLEANUP PASS: the Social Buzz
          Tracker (simulated/Reddit chatter card) and the "Live Market
          Sentiment" 3-card block (components/LiveSentimentIndicator.jsx,
          deleted — a redundant, disclaimer-heavy rule-based blend that
          duplicated what the sentiment pulse bar above already shows
          per-instrument) have both been removed entirely from this page. */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <MarketInsightsExplorer
          newsItems={items}
          loadError={loadError}
          warnings={data?.warnings}
          ratesData={ratesData}
        >
          <MacroImpactHero macroImpact={data?.macroImpact} />
          <div className="mt-10">
            <EconomicCalendar />
          </div>
        </MarketInsightsExplorer>
      </section>
    </>
  );
}
