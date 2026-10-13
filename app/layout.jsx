import Link from "next/link";
import Header from "@/components/Header";
import SiteStructuredData from "@/components/SiteStructuredData";
import { BaseCurrencyProvider } from "@/lib/baseCurrencyContext";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import TranslationDisclaimerModal from "@/components/TranslationDisclaimerModal";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const SITE_URL = getSiteUrl();
const SITE_NAME = "OmniFin Portal";
const SITE_DESCRIPTION =
  "OmniFin Portal — a universal currency, crypto & metals converter supporting 140+ world currencies and major cryptocurrencies, a metals & commodities calculator (gold, silver, platinum, palladium, copper, crude oil), a worldwide unit converter, live market charts & AI-aggregated finance news, and trading & personal-finance calculators with a global Base Currency synced across every tool.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  // A plain default title, NOT a `{ default, template }` object — every
  // child route in this project already appends its own "| OmniFin
  // Portal" suffix by hand (see app/converters/page.jsx,
  // app/learn/page.jsx, etc.), so a root `template: "%s | OmniFin
  // Portal"` would double that suffix on every single page.
  title: `${SITE_NAME} | Currency, Metals & Commodities, and Unit Converters`,
  description: SITE_DESCRIPTION,
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
    "forex trading calculator",
    "position size calculator",
    "pip value calculator",
    "trading academy free course",
    "OmniFin Portal",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Currency, Metals & Commodities, and Unit Converters`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | Currency, Metals & Commodities, and Unit Converters`,
    description: SITE_DESCRIPTION,
  },
};

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Financial Disclaimer", href: "/disclaimer" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

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
        <LanguageProvider>
          <BaseCurrencyProvider>
            <TranslationDisclaimerModal />
            <SiteStructuredData />
            <Header />
            <main id="dashboard" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </BaseCurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
