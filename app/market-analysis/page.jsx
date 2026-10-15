import MarketOverviewBoard from "@/components/MarketOverviewBoard";
import MarketAnalysisHero from "@/components/MarketAnalysisHero";
import MarketAnalysisFAQSection from "@/components/market-analysis/MarketAnalysisFAQSection";
import MarketAnalysisFAQStructuredData from "@/components/market-analysis/MarketAnalysisFAQStructuredData";
import MarketAnalysisExplorer from "@/components/market-analysis/MarketAnalysisExplorer";
import MacroSentimentEnginePanel from "@/components/market-analysis/MacroSentimentEnginePanel";
import { getYoutubeAutomationFeed } from "@/lib/youtubeAutomation";
import { getSentimentEngineSnapshot } from "@/lib/sentimentEngine";
import { getUnifiedRates } from "@/lib/marketData";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Live Market Charts & AI Technical Analysis | OmniFin Portal",
  description:
    "A live market snapshot (S&P 500, Nasdaq, Gold, Bitcoin, EUR/USD), a full interactive TradingView chart, and on-demand rule-based technical analysis (Price Action, Support/Resistance, Fibonacci, RSI/EMA, Gann Theory) — free, no login required.",
  path: "/market-analysis",
});

// Without this, this page (unlike app/ai-news/page.jsx, which already
// sets this) has no revalidate/dynamic export, so Next.js statically
// renders it once at build time and the YouTube video insights below
// would stay frozen at whatever they were at the last deploy — the
// scheduled cron at app/api/cron/youtube/route.js calls
// revalidatePath("/market-analysis") to force an early refresh, but
// this 900s (15 min) ISR window is what keeps the page updating even
// between cron runs. Matches /ai-news's own value.
export const revalidate = 900;

export default async function MarketAnalysisPage() {
  // Calling the automation lib directly (no self-fetch to
  // /api/youtube-automation) — same architectural pattern as
  // lib/newsAggregator.js / app/ai-news/page.jsx. Never throws, but
  // guarded anyway so a truly unexpected error can't take the page down.
  let videoPosts = [];
  try {
    const videoData = await getYoutubeAutomationFeed();
    videoPosts = (videoData.posts || []).filter(
      (p) => p.category === "market-analysis"
    );
  } catch {
    videoPosts = [];
  }

  // Calling the sentiment engine lib directly (no self-fetch to
  // /api/sentiment-engine) — same architectural pattern as
  // getYoutubeAutomationFeed() above and lib/newsAggregator.js. Never
  // throws, but guarded anyway so a truly unexpected error can't take
  // the page down.
  let sentimentSnapshot = { assets: [], note: "" };
  try {
    sentimentSnapshot = await getSentimentEngineSnapshot();
  } catch {
    sentimentSnapshot = { assets: [], note: "" };
  }

  // Same getUnifiedRates() payload /ai-news and the homepage read from
  // — powers this page's own copy of the shared multi-instrument
  // sentiment bar (components/market-pulse/SentimentPulseBar.jsx) via
  // MarketAnalysisExplorer below.
  let ratesData = null;
  try {
    ratesData = await getUnifiedRates();
  } catch {
    ratesData = null;
  }

  return (
    <>
      <MarketAnalysisFAQStructuredData />
      <MarketAnalysisHero />

      {/* Order: AI Video Insights at the top, then the Macro Sentiment
          Engine (this page's "Live Market Sentiment" equivalent), then
          the live charts/overview board, then the FAQ. */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <MarketAnalysisExplorer videoPosts={videoPosts} ratesData={ratesData} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-sm font-bold text-slate-900">
          Macro Sentiment Engine
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Autonomous retail-vs-institutional sentiment comparison and
          rotating contextual themes across metals, energy, forex, and
          crypto.
        </p>
        <div className="mt-5">
          <MacroSentimentEnginePanel snapshot={sentimentSnapshot} />
        </div>
      </section>

      <MarketOverviewBoard />

      <MarketAnalysisFAQSection />
    </>
  );
}
