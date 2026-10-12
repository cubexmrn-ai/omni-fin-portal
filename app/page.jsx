import Link from "next/link";
import ConvertersTabs from "@/components/ConvertersTabs";
import { getSiteUrl } from "@/lib/siteUrl";
import { CURRENCIES } from "@/lib/currencies";
import { CRYPTO_ASSETS } from "@/lib/crypto";

export const revalidate = 3600; // Align page-level ISR with the unified rates API cache.

// Every link target referenced by the 3 ecosystem sections below, in
// page order — kept as one flat list purely so the JSON-LD ItemList
// (SEO) and the human-readable sections can never drift out of sync
// with each other, even though the visual layout below groups them
// very differently from a flat 5-card grid.
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

// The real 5-level OmniFin Academy progression (see
// lib/academyData.js, the curriculum's source of truth) — duplicated
// here as just {id, order, title, subtitle, theme} rather than
// importing that whole lesson-content file into the homepage. Level 1
// is unlocked by default; Levels 2-5 start locked until the previous
// level's lessons are completed, matching the real logic in
// hooks/useAcademyProgress.js.
const ACADEMY_LEVELS = [
  { order: 1, title: "Rookie", subtitle: "Foundations of Money & Wealth", theme: "emerald", locked: false },
  { order: 2, title: "Apprentice", subtitle: "Market Mechanics & Charting", theme: "blue", locked: true },
  { order: 3, title: "Analyst", subtitle: "Technical Precision & Indicators", theme: "violet", locked: true },
  { order: 4, title: "Strategist", subtitle: "Macro Fundamentals & Sentiment", theme: "amber", locked: true },
  { order: 5, title: "Pro Trader", subtitle: "Professional Risk Management", theme: "rose", locked: true },
];

const ACADEMY_THEME_DOT = {
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};


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
            platinum, palladium, copper and crude oil spot prices, {CURRENCIES.length}+
            world currencies and {CRYPTO_ASSETS.length} major cryptocurrencies — by weight
            unit, karat purity, or any asset you&rsquo;re pricing against.
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

/** Small reusable "open this tool" arrow, used across all 3 ecosystem
 * sections below so the CTA styling stays identical everywhere. */
function CtaArrow() {
  return (
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
  );
}

/** Section 1 — "Unified Trading & Finance Suite": a split dark card
 * that visually connects the Converter and the Calculators as one
 * pipeline (convert a rate, then size/risk the trade on it), each
 * half a rich bg-slate-900 contrast box on the section's light
 * bg-slate-50 page background, joined by a center connector arrow. */
function UnifiedSuiteSection() {
  return (
    <section
      aria-labelledby="unified-suite-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <h2 id="unified-suite-heading" className="text-lg font-bold text-slate-900">
        Unified Trading &amp; Finance Suite
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        One live rate feed, two connected tools: convert it, then size and risk-manage the trade
        on it — without re-entering a single number.
      </p>

      <div className="mt-5 grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl border border-blue-500/40 bg-slate-900 p-6 text-white shadow-card">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-300">
            Step 1 · Convert
          </span>
          <h3 className="mt-3 text-xl font-bold">144+ Currency &amp; Metal Converter</h3>
          <p className="mt-2 text-sm text-slate-300">
            Fiat, major crypto, and 6 precious metals &amp; commodities — all converted live
            against a USD base, with a global Base Currency synced from the header.
          </p>
          <Link
            href="/converters"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Open Converters <CtaArrow />
          </Link>
        </div>

        <div
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-500 shadow-card lg:flex"
          aria-hidden="true"
        >
          <CtaArrow />
        </div>

        <div className="rounded-2xl border border-blue-500/40 bg-slate-900 p-6 text-white shadow-card">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-300">
            Step 2 · Size &amp; Risk
          </span>
          <h3 className="mt-3 text-xl font-bold">Trading Calculator Suite</h3>
          <p className="mt-2 text-sm text-slate-300">
            Position &amp; Lot Size, Pip Value, and Margin &amp; Leverage calculators — all reading
            the same live rates as the converter, with an Account Currency that inherits your
            global Base Currency too.
          </p>
          <Link
            href="/calculators"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
          >
            Open Calculators <CtaArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Section 2 — "OmniFin Academy Progression Roadmap": the real 5-level
 * curriculum (lib/academyData.js) as a horizontal badge track —
 * Level 1 unlocked, Levels 2-5 shown locked (their true default state
 * before any quiz is passed — see hooks/useAcademyProgress.js), each
 * a dark contrast box with a quiz-checkpoint note. */
function AcademyRoadmapSection() {
  return (
    <section
      aria-labelledby="academy-roadmap-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="academy-roadmap-heading" className="text-lg font-bold text-slate-900">
            OmniFin Academy Progression Roadmap
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            5 levels, Rookie to Pro Trader — each unlocks once you pass the previous level's quiz
            checkpoint at 80%+.
          </p>
        </div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          Start Learning <CtaArrow />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ACADEMY_LEVELS.map((level) => (
          <div
            key={level.order}
            className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-slate-900 p-5 text-white shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className={`h-2 w-2 rounded-full ${ACADEMY_THEME_DOT[level.theme]}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Level {level.order}
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold">{level.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{level.subtitle}</p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
              <span className="text-slate-400">Quiz checkpoint · 80%+</span>
              {level.locked ? (
                <span className="font-semibold text-amber-400">Locked 🔒</span>
              ) : (
                <span className="font-semibold text-emerald-400">Unlocked</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Section 3 — "Market Intelligence & Community Hub": 3 visual preview
 * cards for the real market-analysis and community features — TradingView
 * charts, AI-read instrument sentiment, and the trader discussion forum. */
function MarketCommunitySection() {
  const PREVIEW_CARDS = [
    {
      title: "Technical Analysis Charts",
      description:
        "Real-time TradingView charts for gold, forex, major indices, crude oil and crypto.",
      href: "/market-analysis",
      cta: "View Live Charts",
      kind: "chart",
    },
    {
      title: "Instrument Sentiment",
      description:
        "AI-read technical analysis distilled into a per-instrument bullish/bearish sentiment score.",
      href: "/market-analysis",
      cta: "Check Sentiment",
      kind: "sentiment",
    },
    {
      title: "Trader Discussions",
      description:
        "A community forum for sharing trade setups, market calls and discussion across forex, crypto, metals and commodities.",
      href: "/community",
      cta: "Join the Discussion",
      kind: "discussion",
    },
  ];

  return (
    <section
      aria-labelledby="market-community-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <h2 id="market-community-heading" className="text-lg font-bold text-slate-900">
        Market Intelligence &amp; Community Hub
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Read the market, then talk it over — live charts, AI sentiment, and a trader community in
        one place.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PREVIEW_CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group overflow-hidden rounded-2xl border border-blue-500/40 bg-slate-900 text-white shadow-card transition-shadow hover:shadow-card-hover"
          >
            {/* Visual preview strip — a small illustrative placeholder
                (not a fabricated live chart/number), distinct per card
                kind, so the card reads as a "preview" without
                pretending to be live data embedded on the homepage. */}
            <div className="flex h-24 items-end gap-1 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 p-4">
              {card.kind === "chart" && (
                <>
                  {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                    <span key={i} className="w-full rounded-t bg-blue-400/70" style={{ height: `${h}%` }} />
                  ))}
                </>
              )}
              {card.kind === "sentiment" && (
                <div className="flex w-full items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400">Bullish</span>
                </div>
              )}
              {card.kind === "discussion" && (
                <div className="flex w-full flex-col gap-1.5">
                  <span className="h-2 w-5/6 rounded-full bg-white/15" />
                  <span className="h-2 w-2/3 rounded-full bg-white/10" />
                  <span className="h-2 w-3/4 rounded-full bg-white/10" />
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-base font-bold">{card.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{card.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 group-hover:text-blue-300">
                {card.cta} <CtaArrow />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** A dense, scannable chip grid — not a 6-entry hand-picked list — so
 * this section honestly reflects the full currency range every
 * dropdown in the app (Header's Base Currency switcher, the Universal
 * Currency Converter, the Metals Calculator) actually supports, which
 * now comes straight from lib/currencies.js / lib/crypto.js rather
 * than a short curated array baked into this page. */
function CurrencyChips({ items }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.code}
          title={item.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
        >
          {item.flag && <span aria-hidden="true">{item.flag}</span>}
          {item.code}
        </span>
      ))}
    </div>
  );
}

function SupportedCurrencies() {
  return (
    <section id="rates" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Supported Currencies &amp; Crypto
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {CURRENCIES.length} fiat currencies and {CRYPTO_ASSETS.length} major
          cryptocurrencies — sourced against a USD base from
          ExchangeRate-API and CoinGecko, cached hourly via Incremental
          Static Regeneration. No hardcoded short list — pick any of
          these as your global Base Currency in the header, or inside
          any individual converter or calculator.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900">
          {CURRENCIES.length} Fiat Currencies
        </h3>
        <CurrencyChips items={CURRENCIES} />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-900">
          {CRYPTO_ASSETS.length} Major Cryptocurrencies
        </h3>
        <CurrencyChips items={CRYPTO_ASSETS.map((c) => ({ code: c.code, name: c.name }))} />
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
      <EcosystemStructuredData />
      <UnifiedSuiteSection />
      <AcademyRoadmapSection />
      <MarketCommunitySection />
      <SupportedCurrencies />
    </>
  );
}
