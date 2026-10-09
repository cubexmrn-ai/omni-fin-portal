import Link from "next/link";
import GoldCalculator from "@/components/GoldCalculator";

export const revalidate = 900; // Align page-level ISR with the rates API cache.

const MODULES = [
  {
    title: "Converters",
    tagline: "Module 1",
    description:
      "Gold & currency pricing plus a universal unit converter — length, area, weight, volume, speed, temperature and more, including Tola, Maund, Marla & Kanal.",
    href: "/converters",
    cta: "Open Converters",
  },
  {
    title: "Market Analysis",
    tagline: "Module 2",
    description:
      "Real-time TradingView charts for gold, forex, indices, oil and crypto, plus an aggregated finance news feed (AI summaries coming soon).",
    href: "/market-analysis",
    cta: "View Live Charts",
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
    title: "Live Exchange Rates",
    description:
      "Rates refresh from a serverless API route every 15 minutes, with automatic fallback so the calculator never shows a blank screen.",
  },
  {
    title: "Karat-Accurate Pricing",
    description:
      "Switch between 24K and 22K purity and the calculator instantly re-weights the spot price for you.",
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
            OmniFin Portal — currency &amp; gold rates,
            <span className="text-brand-600"> instantly converted.</span>
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            A clean, modern dashboard for converting live gold spot prices
            into the currency, weight unit and karat purity you actually
            work with — PKR, AUD, EUR, INR, AED and NGN.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#gold-calculator"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
            >
              Launch Gold Calculator
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

function ModulesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-lg font-bold text-slate-900">
        Explore the Platform
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        OmniFin Portal is growing into a full finance utilities suite.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              {m.tagline}
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              {m.title}
            </h3>
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
            All rates are sourced against a USD base and cached for 15
            minutes via Incremental Static Regeneration.
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
      <GoldCalculator />
      <ModulesGrid />
      <SupportedCurrencies />
    </>
  );
}
