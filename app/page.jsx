import ConvertersTabs from "@/components/ConvertersTabs";
import EconomicNewsStrip from "@/components/EconomicNewsStrip";
import {
  Hero,
  UnifiedSuiteSection,
  AcademyRoadmapSection,
  MarketCommunitySection,
  SupportedCurrencies,
} from "@/components/HomeSections";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 3600; // Align page-level ISR with the unified rates API cache.

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

export default function HomePage() {
  return (
    <>
      <EconomicNewsStrip />
      <Hero />
      {/* id preserved here (rather than inside ConvertersTabs itself) so
          the nav's "/#metals-calculator" link and the hero's CTA above
          both still scroll to this section correctly. */}
      <div id="metals-calculator">
        <ConvertersTabs defaultTab="metals" />
      </div>
      <EcosystemStructuredData />
      <UnifiedSuiteSection />
      <AcademyRoadmapSection />
      <MarketCommunitySection />
      <SupportedCurrencies />
    </>
  );
}
