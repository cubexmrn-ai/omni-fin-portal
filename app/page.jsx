import Link from "next/link";
import ConvertersTabs from "@/components/ConvertersTabs";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 3600; // Align page-level ISR with the unified rates API cache.

// The 5 pillars of the "Explore OmniFin Ecosystem" section — each a
// real, already-shipped module, not a placeholder. Keyword-rich
// title/description pairs feed both the on-page <h3>s and the matching
// JSON-LD ItemList below, so the same copy serves readers and search
// engines at once.
const ECOSYSTEM_MODULES = [
  {
    title: "Market Insights",
    href: "/market-analysis",
    cta: "View Live Charts",
    description:
      "Real-time TradingView charts for gold, forex, major indices, crude oil and crypto, plus an aggregated finance news feed covering forex, crypto, commodities and stocks.",
  },
  {
    title: "Live Rates & Converters",
    href: "/converters",
    cta: "Open Converters",
    description:
      "A universal currency & crypto converter, a 6-asset metals & commodities calculator (gold, silver, platinum, palladium, copper, crude oil), and a worldwide unit converter — including Tola, Maund, Marla & Kanal.",
  },
  {
    title: "Trading Calculators",
    href: "/calculators",
    cta: "Open Calculators",
    description:
      "A free Trading Calculator Suite: position & lot size, pip value, margin & leverage, risk/reward, and inflation & compound-growth calculators, synced to live rates.",
  },
  {
    title: "OmniFin Academy",
    href: "/learn",
    cta: "Start Learning",
    description:
      "A free, gamified trading & personal-finance curriculum — 5 levels from money basics to professional risk management, with quizzes and embedded calculators.",
  },
  {
    title: "Community",
    href: "/community",
    cta: "Join the Discussion",
    description:
      "A trader community forum for sharing trade setups, market calls and discussion across forex, crypto, metals and commodities.",
  },
];

const SUPPORTED_CURRENCIES = [
  { code: "PKR", label: "Pakistan" },
  { code: "AUD", label: "Australia" },
  { code: "EUR", label: "Eurozone" },
  { code: "INR", label: "India" },
  { code: "AED", label: "UAE" },
  { code: "NGN", label: "Nigeria" },
];

const FEATURES = [
  {
    title: "Live Fiat, Crypto, Metal & Commodity Rates",
    description:
      "One unified API route feeds Fiat, Crypto, Metals and Commodities rates in parallel, cached hourly with per-provider fallback so no card ever shows a blank screen.",
  },
  {
    title: "6-Asset Metals & Commodities Selector",
    description:
      "Switch between Gold, Silver, Platinum, Palladium, Copper and Crude Oil — karat purity adjusts automatically for gold, and oil switches to barrel-based pricing.",
  },
  {
    title: "Ounce, Gram & Tola",
    description:
      "Built for both Western troy-ounce markets and South Asian / Middle Eastern tola-based jewellery pricing.",
  },
];

function Hero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Phase 2 · Finance Portal Dashboard
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            OmniFin Portal — metals, commodities, currency &amp; crypto
            rates,
            <span className="text-brand-600"> instantly converted.</span>
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            A clean, modern dashboard for converting live gold, silver,
            platinum, palladium, copper and crude oil spot prices, 36
            world currencies and major crypto — by weight unit, karat
            purity, or any asset you&rsquo;re pricing against.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#metals-calculator"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
            >
              Open Metals &amp; Commodities
            </a>
            <a
              href="#rates"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              View Supported Currencies
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

/** "Explore OmniFin Ecosystem" — a clean, keyword-rich structural
 * section (h2 section heading, h3 per module) covering every shipped
 * module: Market Insights, Live Rates, Calculators, Academy and
 * Community. Deliberately short per module (one sentence) rather than
 * duplicating each module's own full landing-page copy. */
function EcosystemSection() {
  return (
    <section
      aria-labelledby="explore-ecosystem-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <EcosystemStructuredData />
      <h2
        id="explore-ecosystem-heading"
        className="text-lg font-bold text-slate-900"
      >
        Explore OmniFin Ecosystem
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Market insights, live currency &amp; commodity rates, trading calculators, a free
        Academy, and a trader community — one finance portal.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ECOSYSTEM_MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{m.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
              {m.cta}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SupportedCurrencies() {
  return (
    <section id="rates" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Supported Currencies
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            All rates are sourced against a USD base and cached hourly
            via Incremental Static Regeneration.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {SUPPORTED_CURRENCIES.map((c) => (
          <div
            key={c.code}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-center shadow-card"
          >
            <p className="text-base font-bold text-slate-900">{c.code}</p>
            <p className="mt-0.5 text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* id preserved here (rather than inside ConvertersTabs itself) so
          the nav's "/#metals-calculator" link and the hero's CTA above
          both still scroll to this section correctly. */}
      <div id="metals-calculator">
        <ConvertersTabs defaultTab="metals" />
      </div>
      <EcosystemSection />
      <SupportedCurrencies />
    </>
  );
}
