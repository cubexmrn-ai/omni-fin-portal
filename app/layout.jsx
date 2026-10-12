import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "OmniFin Portal | Currency, Metals & Commodities, and Unit Converters",
  description:
    "OmniFin Portal — a universal currency converter, a metals & commodities calculator (gold, silver, platinum, palladium, copper, crude oil), a worldwide unit converter, and live market charts with AI news, for PKR, AUD, EUR, INR, AED and NGN.",
  keywords: [
    "metals and commodities calculator",
    "gold rate calculator",
    "silver rate calculator",
    "crude oil price calculator",
    "currency converter",
    "unit converter",
    "sq ft to marla",
    "km to miles",
    "tola gold price",
    "22k gold price",
    "24k gold price",
    "live gold chart",
    "OmniFin Portal",
  ],
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/" },
  { label: "Metals & Commodities", href: "/#metals-calculator" },
  { label: "Converters", href: "/converters" },
  { label: "Calculators", href: "/calculators" },
  { label: "Market Analysis", href: "/market-analysis" },
  { label: "News", href: "/ai-news" },
  { label: "Academy", href: "/learn" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Financial Disclaimer", href: "/disclaimer" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-card">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 17L9 11L13 15L21 7"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 7H21V13"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        OmniFin<span className="text-brand-600">Portal</span>
      </span>
    </Link>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <HeaderLogo />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live rates · hourly cache
          </span>
          <Link
            href="/#metals-calculator"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
          >
            Open Calculator
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden"
        aria-label="Primary mobile"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              OmniFin Portal
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              A finance utilities portal for traders, jewellers and
              households — starting with a universal currency converter
              and a metals &amp; commodities calculator.
            </p>
          </div>
          <p className="max-w-sm text-xs text-slate-400">
            Rates, calculators, and market analysis are provided for
            educational and informational purposes only and do not
            constitute financial advice. See our{" "}
            <Link href="/disclaimer" className="underline hover:text-slate-500">
              Financial Disclaimer
            </Link>
            .
          </p>
        </div>

        <nav
          className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-6"
          aria-label="Legal"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-slate-500 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} OmniFin Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <main id="dashboard" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
