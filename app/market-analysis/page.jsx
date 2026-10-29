import MarketOverviewBoard from "@/components/MarketOverviewBoard";
import MarketAnalysisHero from "@/components/MarketAnalysisHero";
import AiTechnicalAnalysis from "@/components/AiTechnicalAnalysis";
import MarketAnalysisFAQSection from "@/components/market-analysis/MarketAnalysisFAQSection";
import MarketAnalysisFAQStructuredData from "@/components/market-analysis/MarketAnalysisFAQStructuredData";
import MarketAnalysisExplorer from "@/components/market-analysis/MarketAnalysisExplorer";
import EconomicHeatmapDashboard from "@/components/market-analysis/EconomicHeatmapDashboard";
import WatchlistStrip from "@/components/market-analysis/WatchlistStrip";
import CorrelationMatrix from "@/components/market-analysis/CorrelationMatrix";
import AdSlot from "@/components/AdSlot";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
import GoDeeperStrip from "@/components/GoDeeperStrip";
import { getUnifiedRates } from "@/lib/marketData";
import { getWatchlistSnapshot } from "@/lib/marketPulse";
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
// GEMINI_API_KEY made getSentimentEngineSnapshot() actually perform
// its full sequential AI calls instead of short-circuiting to instant
// templated fallbacks.
//
// `force-dynamic` makes Next render this page fresh on every request
// instead of attempting that build-time prerender at all — no more
// build timeout. The 15-minute "refreshes periodically, not on every
// single visitor" behavior ISR gave this page is preserved a layer
// deeper instead: the AI function is called through
// lib/cachedData.js's unstable_cache()-wrapped version, which caches
// its real result in Next's Data Cache for the same 900s window,
// populated lazily on first request rather than blocking `next build`.
// `maxDuration` gives a cold (cache-miss) request more time than the
// platform default to finish that first real AI pipeline run — raise
// this further if a cold request still times out on your Vercel plan.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function MarketAnalysisPage() {
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

  // PHASE 3 ADDITION: the watchlist strip's 5 rows (price, live bias
  // score, 24h change where genuinely available, volatility flag) —
  // computed server-side from the exact same ratesData above, so
  // there's no second live-rate fetch for this one section.
  const watchlistRows = ratesData ? getWatchlistSnapshot(ratesData) : [];

  return (
    <>
      <MarketAnalysisFAQStructuredData />
      <MarketAnalysisHero />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <FinancialDisclaimerNote />
      </div>

      {/* INSTITUTIONAL TERMINAL RESTRUCTURE — fixed top-to-bottom
          order is now: (1) the On-Demand AI Technical Analysis tool
          itself, as this page's real hero (the single richest tool on
          the page, now the very first thing a visitor interacts with,
          not buried at the bottom of MarketOverviewBoard); (2) the
          Macro Economic Heatmap & Impact Dial Dashboard directly below
          it; (3) the sentiment pulse dial (MarketAnalysisExplorer — the
          old "AI Video Insights" grid it used to filter has been
          deleted entirely, see that component's own header comment);
          (4) the live ticker strip + full chart (MarketOverviewBoard,
          with its own AiTechnicalAnalysis instance removed — see that
          component's header comment); (5) the FAQ. The YouTube-to-blog
          "Market Insights & Video Summaries" section that used to sit
          between (3) and (4) has been removed entirely along with its
          whole admin/ingestion pipeline — nothing stands in its place,
          so the sentiment dial section flows straight into the live
          chart. */}
      {/* `dark` activates AiTechnicalAnalysis's existing dark:-variant
          classes (already written throughout that component) so this
          hero slot gets the full high-contrast terminal look rather
          than a light card dropped onto a dark section background. */}
      {/* PHASE 3 ADDITION: the Watchlist Strip sits directly below the
          AI Technical Analysis panel it controls — a "workspace"
          layout rather than a single-instrument snapshot. Clicking any
          row updates the panel above via the shared `?instrument=` URL
          param (lib/instrumentParam.js), no page reload. */}
      <section className="dark bg-slate-950 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AiTechnicalAnalysis />
          <div className="mt-6">
            <WatchlistStrip rows={watchlistRows} />
          </div>
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
        {/* PHASE 3 ADDITION: client-side asset correlation card — see
            CorrelationMatrix.jsx's header comment for why this builds
            a real correlation from live session samples rather than
            faking a historical one with no data behind it. */}
        <div className="mt-5">
          <CorrelationMatrix initialRatesData={ratesData} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <MarketAnalysisExplorer ratesData={ratesData} />
      </section>

      <MarketOverviewBoard />

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <GoDeeperStrip source="market_analysis" />
      </div>

      {/* AdSense & Monetization Readiness: bottom banner slot — see
          components/AdSlot.jsx. */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <AdSlot slot="" label="Advertisement" minHeight={120} />
      </div>

      <MarketAnalysisFAQSection />
    </>
  );
}
