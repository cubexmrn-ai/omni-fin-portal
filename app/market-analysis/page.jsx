import MarketOverviewBoard from "@/components/MarketOverviewBoard";
import MarketAnalysisHero from "@/components/MarketAnalysisHero";
import AiTechnicalAnalysis from "@/components/AiTechnicalAnalysis";
import MarketAnalysisFAQSection from "@/components/market-analysis/MarketAnalysisFAQSection";
import MarketAnalysisFAQStructuredData from "@/components/market-analysis/MarketAnalysisFAQStructuredData";
import MarketAnalysisExplorer from "@/components/market-analysis/MarketAnalysisExplorer";
import EconomicHeatmapDashboard from "@/components/market-analysis/EconomicHeatmapDashboard";
import { getCachedYoutubeAutomationFeed } from "@/lib/cachedData";
import { getUnifiedRates } from "@/lib/marketData";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Live Market Charts & AI Technical Analysis | OmniFin Portal",
  description:
    "A live market snapshot (S&P 500, Nasdaq, Gold, Bitcoin, EUR/USD), a full interactive TradingView chart, and on-demand rule-based technical analysis (Price Action, Support/Resistance, Fibonacci, RSI/EMA, Gann Theory) — free, no login required.",
  path: "/market-analysis",
});

// This page used to be `export const revalidate = 900` (ISR): Next.js
// tried to statically render it once at build time, then refresh in
// the background every 15 minutes. That build-time prerender is
// exactly what started timing out ("Static page generation for
// /market-analysis ... took more than 60 seconds") once a real paid
// GEMINI_API_KEY made getYoutubeAutomationFeed()/
// getSentimentEngineSnapshot() actually perform their full sequential
// AI calls instead of short-circuiting to instant templated fallbacks.
//
// `force-dynamic` makes Next render this page fresh on every request
// instead of attempting that build-time prerender at all — no more
// build timeout. The 15-minute "refreshes periodically, not on every
// single visitor" behavior ISR gave this page is preserved a layer
// deeper instead: both AI functions are called through
// lib/cachedData.js's unstable_cache()-wrapped versions, which cache
// their real result in Next's Data Cache for the same 900s window,
// populated lazily on first request rather than blocking `next build`.
// `maxDuration` gives a cold (cache-miss) request more time than the
// platform default to finish that first real AI pipeline run — raise
// this further if a cold request still times out on your Vercel plan.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function MarketAnalysisPage() {
  // Calling the automation lib through lib/cachedData.js's cached
  // wrapper (not lib/youtubeAutomation.js directly, and no self-fetch
  // to /api/youtube-automation either) — see that file's header for
  // why. Never throws, but guarded anyway so a truly unexpected error
  // can't take the page down.
  let videoPosts = [];
  try {
    const videoData = await getCachedYoutubeAutomationFeed();
    videoPosts = (videoData.posts || []).filter(
      (p) => p.category === "market-analysis"
    );
  } catch {
    videoPosts = [];
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

      {/* INSTITUTIONAL TERMINAL RESTRUCTURE — fixed top-to-bottom
          order is now: (1) the On-Demand AI Technical Analysis tool
          itself, as this page's real hero (the single richest tool on
          the page, now the very first thing a visitor interacts with,
          not buried at the bottom of MarketOverviewBoard); (2) the
          Macro Economic Heatmap & Impact Dial Dashboard directly below
          it; (3) AI Video Insights + the sentiment pulse dial;
          (4) the live ticker strip + full chart (MarketOverviewBoard,
          with its own AiTechnicalAnalysis instance removed — see that
          component's header comment); (5) the FAQ. */}
      {/* `dark` activates AiTechnicalAnalysis's existing dark:-variant
          classes (already written throughout that component) so this
          hero slot gets the full high-contrast terminal look rather
          than a light card dropped onto a dark section background. */}
      <section className="dark bg-slate-950 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AiTechnicalAnalysis />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-sm font-bold text-slate-900">
          Macro Economic Heatmap & Impact Dial Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Economic-release heatmap, live USD and commodities impact
          gauges, and real-time asset macro score rankings.
        </p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink p-4 sm:p-6">
          <EconomicHeatmapDashboard ratesData={ratesData} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <MarketAnalysisExplorer videoPosts={videoPosts} ratesData={ratesData} />
      </section>

      <MarketOverviewBoard />

      <MarketAnalysisFAQSection />
    </>
  );
}
