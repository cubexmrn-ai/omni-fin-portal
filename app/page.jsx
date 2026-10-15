import ConvertersTabs from "@/components/ConvertersTabs";
import EconomicNewsStrip from "@/components/EconomicNewsStrip";
import HomeMarketTicker from "@/components/HomeMarketTicker";
import {
  Hero,
  UnifiedSuiteSection,
  AcademyRoadmapSection,
  MarketCommunitySection,
  SupportedCurrencies,
} from "@/components/HomeSections";
import { getSiteUrl } from "@/lib/siteUrl";
import { getUnifiedRates } from "@/lib/marketData";
import { getCachedSentimentEngineSnapshot } from "@/lib/cachedData";
import { getCompositeSentiment, getVolatilityWatch } from "@/lib/marketPulse";

// This page used to be `export const revalidate = 3600` (ISR), which
// made Next.js try to statically prerender it at build time — the same
// build-time static generation that started timing out on
// /market-analysis and /api/sentiment-engine once a real paid
// GEMINI_API_KEY made getSentimentEngineSnapshot() actually run its
// full sequential per-asset AI calls instead of short-circuiting to an
// instant fallback (see app/market-analysis/page.jsx's comment for the
// full explanation — this page calls the exact same function for its
// hero's "AI Market Pulse" cards). `force-dynamic` skips that
// build-time prerender; the hourly refresh cadence is preserved a
// layer deeper via lib/cachedData.js's unstable_cache()-wrapped
// version of getSentimentEngineSnapshot (getUnifiedRates below keeps
// its own existing fetch-level cache either way).
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Every link target referenced by the 3 ecosystem sections below, in
// page order — kept as one flat list purely so the JSON-LD ItemList
// (SEO, invisible to visitors, so kept in English like other
// structured data on the site) can never drift out of sync with the
// human-readable sections, even though those live in
// components/HomeSections.jsx now (so they can translate via
// useLanguage()) and group these very differently from a flat list.
const ECOSYSTEM_MODULES = [
  {
    title: "Universal Currency, Crypto & Metals Converter",
    href: "/converters",
    description:
      "144+ fiat currencies, major cryptocurrencies, and 6 precious metals & commodities, converted live against a USD base.",
  },
  {
    title: "Trading Calculator Suite",
    href: "/calculators",
    description:
      "Position & lot size, pip value, margin & leverage, and inflation & compound-growth calculators, synced to the same live rates.",
  },
  {
    title: "OmniFin Academy",
    href: "/learn",
    description:
      "A free, gamified trading & personal-finance curriculum — 5 levels from money basics to professional risk management, with quizzes and embedded calculators.",
  },
  {
    title: "Market Insights & Technical Analysis",
    href: "/market-analysis",
    description:
      "Real-time TradingView charts for gold, forex, major indices, crude oil and crypto, plus AI-read technical analysis and instrument sentiment.",
  },
  {
    title: "Community",
    href: "/community",
    description:
      "A trader community forum for sharing trade setups, market calls and discussion across forex, crypto, metals and commodities.",
  },
];

/** JSON-LD ItemList for the "Explore OmniFin Ecosystem" section — lets
 * search engines index the 5 modules as a structured list of the
 * site's own tools, in the same order they appear on the page. Same
 * honesty bar as components/ConverterStructuredData.jsx: no fabricated
 * rating/review fields, just the real module list. */
function EcosystemStructuredData() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OmniFin Portal Ecosystem",
    description: "The finance tools and resources available across OmniFin Portal.",
    itemListElement: ECOSYSTEM_MODULES.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.title,
      description: m.description,
      url: `${siteUrl}${m.href}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function HomePage() {
  // Same direct-call pattern used by app/market-analysis/page.jsx and
  // app/ai-news/page.jsx (no self-fetch to an API route — see
  // lib/newsAggregator.js's header comment for why that pattern broke
  // production previously). Both calls are guarded independently so a
  // failure in one never blocks the other or the rest of the page —
  // the Hero falls back to its static feature copy (see
  // components/HomeSections.jsx) if neither resolves anything useful.
  let ratesData = null;
  try {
    ratesData = await getUnifiedRates();
  } catch {
    ratesData = null;
  }

  let sentimentSnapshot = { assets: [] };
  try {
    sentimentSnapshot = await getCachedSentimentEngineSnapshot();
  } catch {
    sentimentSnapshot = { assets: [] };
  }

  // The hero's 3 "AI Market Pulse" cards — every number/theme here is
  // read from the SAME real engines already used elsewhere on the site
  // (lib/marketPulse.js wraps lib/technicalAnalysis.js's buildAnalysis;
  // macroThemes reads lib/sentimentEngine.js's own rotating/AI-generated
  // theme snapshot), not separately invented for the homepage.
  const technical = getCompositeSentiment(ratesData);
  const volatility = getVolatilityWatch(ratesData);
  const macroThemes = Array.from(
    new Set((sentimentSnapshot.assets || []).flatMap((asset) => asset.themes || []))
  ).slice(0, 3);

  const marketPulse = { technical, volatility, macroThemes };

  return (
    <>
      {/* Two stacked top bars, directly under the global header and
          above the fold: Bar 1 is the high-impact economic news
          ticker, Bar 2 immediately below it is the live market
          pricing ticker (Gold, EUR/USD, BTC/USD, Crude Oil). Both are
          deliberately thin single-row strips so they never push the
          Hero below the fold. */}
      <EconomicNewsStrip />
      <HomeMarketTicker />
      <Hero marketPulse={marketPulse} />
      {/* id preserved here (rather than inside ConvertersTabs itself) so
          the nav's "/#metals-calculator" link and the hero's CTA above
          both still scroll to this section correctly. The glass frame
          below is homepage-only — ConvertersTabs/GoldCalculator/
          CurrencyConverter are shared with /converters and /calculators,
          so this wraps around them here rather than styling those
          components themselves. */}
      <div id="metals-calculator" className="bg-gradient-to-b from-slate-50 to-white py-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/60 py-6 shadow-card backdrop-blur-md sm:py-8">
          <ConvertersTabs defaultTab="metals" />
        </div>
      </div>
      <EcosystemStructuredData />
      <UnifiedSuiteSection />
      <AcademyRoadmapSection />
      <MarketCommunitySection />
      <SupportedCurrencies />
    </>
  );
}
