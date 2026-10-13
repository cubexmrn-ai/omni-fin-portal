// app/disclaimer/page.jsx
//
// Static Financial Disclaimer page — the single most load-bearing legal
// page on the site, since every calculator, converter, market-analysis
// and community-forum feature ultimately funnels back to this
// disclaimer. Explicit, unambiguous "educational purposes only, not
// financial advice" language, plus no-warranty / no-liability /
// third-party-data / past-performance clauses typical of a finance
// utilities site. Pure server component — static legal text, no
// client-side state.

import Link from "next/link";
import LegalNoticeBanner from "@/components/LegalNoticeBanner";

export const metadata = {
  title: "Financial Disclaimer | OmniFin Portal",
  description:
    "OmniFin Portal's tools, calculators, market analysis, news, and community content are provided for educational and informational purposes only and do not constitute financial, investment, trading, legal, or tax advice.",
};

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export default function DisclaimerPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Financial Disclaimer</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Financial Disclaimer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Please read this disclaimer carefully before using any
            calculator, converter, market analysis, news, or community
            feature on OmniFin Portal.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
            Nothing on this site is financial, investment, trading,
            legal, or tax advice.
          </p>
          <LegalNoticeBanner />
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm leading-relaxed text-slate-600 sm:px-6 lg:px-8">
        <Section title="1. Educational and informational purposes only">
          <p>
            Every tool on OmniFin Portal — including but not limited to
            the Currency, Metals & Commodities and Unit Converters; the
            Position & Lot Size, Pip Value, Risk/Reward, Margin &
            Leverage, Inflation, Compound Growth, and Profit Margin
            Calculators; the Market Analysis page (technical bias, pivot
            points, Fibonacci levels, and sentiment meters); the AI
            News feed; the Social Buzz Tracker; the OmniFin Academy; and
            the Community Forum — is provided strictly for educational
            and informational purposes. None of it constitutes
            financial, investment, trading, legal, accounting, or tax
            advice, and none of it is a recommendation to buy, sell,
            hold, or otherwise transact in any currency, cryptocurrency,
            metal, commodity, security, or other financial instrument.
          </p>
        </Section>

        <Section title="2. Not a substitute for professional advice">
          <p>
            OmniFin Portal is not a registered investment adviser,
            broker-dealer, bank, or financial institution of any kind,
            and no part of this site should be treated as a substitute
            for consultation with a licensed financial advisor,
            accountant, or attorney. You are solely responsible for
            evaluating the merits and risks associated with any
            financial decision, and should seek independent professional
            advice before making one.
          </p>
        </Section>

        <Section title="3. No warranty on data accuracy or availability">
          <p>
            Exchange rates, cryptocurrency prices, and metals/commodity
            prices are sourced from third-party market-data providers on
            a cached, periodically-refreshed basis (typically hourly),
            and may differ — sometimes significantly — from rates
            available through any specific bank, broker, or exchange at
            the moment of an actual transaction. OmniFin Portal makes no
            representation or warranty, express or implied, as to the
            accuracy, completeness, timeliness, or reliability of any
            rate, price, calculation result, chart, news item, or other
            data displayed on this site, and disclaims all such
            warranties to the fullest extent permitted by law.
          </p>
        </Section>

        <Section title="4. Simulated, illustrative, and rule-based content">
          <p>
            Some content on this site is explicitly simulated,
            illustrative, or produced by an automated, rule-based
            calculation engine rather than a human analyst — for
            example, the Social Buzz Tracker&apos;s sentiment estimate, the
            Community Forum&apos;s trade-setup chart previews, and the Market
            Analysis page&apos;s technical bias and indicator readings. Any
            such content is clearly labeled as simulated, illustrative,
            or automated within the interface itself, and must not be
            relied upon as verified market data, a real trading signal,
            or professional analysis.
          </p>
        </Section>

        <Section title="5. User-generated community content">
          <p>
            Trade setups, discussion posts, and any other content shared
            by users in the Community Forum reflect the opinions of the
            individual poster only. OmniFin Portal does not review,
            verify, endorse, or guarantee the accuracy of any
            user-submitted post, and is not responsible for any decision
            made in reliance on it.
          </p>
        </Section>

        <Section title="6. Past performance and hypothetical results">
          <p>
            Any historical data, backtested figures, or hypothetical
            calculator outputs shown on this site (including compound-
            growth projections and inflation-erosion estimates) are
            illustrative only. Past performance is not indicative of
            future results, and no calculation on this site guarantees
            or predicts any future outcome.
          </p>
        </Section>

        <Section title="7. Trading and financial risk">
          <p>
            Trading currencies, cryptocurrencies, metals, commodities,
            and other leveraged or volatile instruments carries a high
            level of risk and may not be suitable for all individuals.
            You could lose some or all of your initial investment;
            do not trade with money you cannot afford to lose. OmniFin
            Portal assumes no responsibility for any trading or
            investment losses incurred based on information obtained
            from this site.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the fullest extent permitted by applicable law, OmniFin
            Portal and its operators shall not be liable for any direct,
            indirect, incidental, consequential, or other damages
            arising from the use of, or inability to use, this site or
            its content, including but not limited to any financial
            loss resulting from reliance on any calculation, rate, chart,
            analysis, news item, or community post.
          </p>
        </Section>

        <Section title="9. Changes to this disclaimer">
          <p>
            This disclaimer may be updated from time to time as the
            site&apos;s features change. Continued use of OmniFin Portal
            after a change constitutes acceptance of the updated
            disclaimer. See also our{" "}
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
            </Link>
            .
          </p>
        </Section>
      </section>
    </>
  );
}
