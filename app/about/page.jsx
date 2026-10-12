// app/about/page.jsx
//
// Static "About Us" page: what OmniFin Portal is, its educational/
// utility mandate, and transparency disclosures about how its data and
// AI-generated content are produced. Pure server component — no
// client-side state, so no "use client" split needed (same as the
// other new legal/compliance pages in this batch).

import Link from "next/link";

export const metadata = {
  title: "About Us | OmniFin Portal",
  description:
    "OmniFin Portal is a free finance utilities platform — currency, metals and unit converters, trading and personal-finance calculators, market data, and an educational Academy. Learn our mandate and how our data and AI features work.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">About Us</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            About OmniFin Portal
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            A free, utility-first finance platform — built to help people
            convert, calculate, and understand money, not to tell them
            what to do with it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm leading-relaxed text-slate-600 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Our purpose</h2>
          <p className="mt-2">
            OmniFin Portal exists to make everyday financial math fast,
            free, and accurate. That spans three kinds of tools:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-slate-700">
                Converters
              </span>{" "}
              — currencies, cryptocurrencies, precious metals and
              commodities, and everyday units (area, weight,
              temperature, volume, distance).
            </li>
            <li>
              <span className="font-medium text-slate-700">
                Calculators
              </span>{" "}
              — trading tools (position sizing, pip value, risk/reward,
              margin) and personal-finance tools (inflation, compound
              growth, profit margin).
            </li>
            <li>
              <span className="font-medium text-slate-700">
                Education & community
              </span>{" "}
              — the OmniFin Academy&apos;s structured lessons and quizzes, and
              a community forum for discussing trade ideas and
              financial-literacy topics.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            An educational and utility mandate — not an advisory one
          </h2>
          <p className="mt-2">
            Every tool on this site is built to inform and to compute —
            never to tell a visitor what to buy, sell, or do with their
            money. OmniFin Portal is not a brokerage, not a registered
            investment adviser, and does not manage money on anyone&apos;s
            behalf. Full detail on this is in our{" "}
            <Link
              href="/disclaimer"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Financial Disclaimer
            </Link>
            , which applies to everything on this site.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Transparency about our data
          </h2>
          <p className="mt-2">
            We aim to always tell visitors plainly where a number came
            from and how current it is:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              Exchange rates, crypto prices, and metals/commodity prices
              are fetched from third-party market-data providers on a
              cached, hourly-refresh cycle, and every converter page
              shows when its rate was last fetched. Rates are provided
              for informational purposes and can differ from the exact
              rate available at any specific broker or exchange at the
              moment of a real transaction.
            </li>
            <li>
              Market analysis (technical bias, pivot points, Fibonacci
              levels, and similar) is produced by a rule-based
              calculation engine, not a licensed analyst, and is labeled
              as such wherever it appears.
            </li>
            <li>
              Features that are explicitly simulated or illustrative —
              such as the Social Buzz Tracker&apos;s sentiment estimate or a
              Community Forum trade-setup&apos;s chart preview — are
              permanently labeled "Simulated" or "Illustrative" in the
              interface itself, never presented as real, live, or
              verified data.
            </li>
            <li>
              News headlines are aggregated from public, third-party RSS
              sources and are not independently fact-checked or edited
              by OmniFin Portal before display.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Community content
          </h2>
          <p className="mt-2">
            Trade setups, discussion posts, and comments shared in our
            Community Forum are user-generated opinions, not
            professional advice and not endorsed by OmniFin Portal.
            Treat anything posted there the way you&apos;d treat a stranger&apos;s
            opinion — worth hearing, not worth following blindly.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Questions or feedback
          </h2>
          <p className="mt-2">
            OmniFin Portal is an independently built platform. If you
            have questions about these policies, see our{" "}
            <Link
              href="/privacy"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Terms of Service
            </Link>{" "}
            for the full legal terms governing your use of this site.
          </p>
        </div>
      </section>
    </>
  );
}
