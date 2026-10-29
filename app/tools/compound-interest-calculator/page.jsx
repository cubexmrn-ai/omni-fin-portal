import Link from "next/link";
import CompoundInterestCalculator from "@/components/tools/CompoundInterestCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import AdSlot from "@/components/AdSlot";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
import AeoCallout from "@/components/blog/AeoCallout";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Compound Interest Calculator | OmniFin Portal",
    description:
      "See exactly how an initial amount plus monthly contributions grows over time with compound interest — final balance, total contributed, total growth, and a year-by-year breakdown.",
    path: "/tools/compound-interest-calculator",
  }),
  keywords: [
    "compound interest calculator",
    "compound interest calculator with monthly contributions",
    "how does compound interest work",
    "savings growth calculator",
    "investment growth calculator",
  ],
};

const FAQS = [
  {
    question: "How is compound interest calculated here?",
    answer:
      "Monthly: each month, the current balance grows by your annual rate divided by 12, then that month's contribution is added — repeated for every month across your chosen number of years. Monthly compounding is both more realistic for a recurring-contribution plan and slightly more favorable than annual compounding at the same nominal rate.",
  },
  {
    question: "What's the difference between \"total contributed\" and \"total growth\"?",
    answer:
      "Total contributed is simply your initial amount plus every monthly contribution you made, added up with no growth applied. Total growth is everything the final balance is above that — the actual interest/returns earned on top of your own money.",
  },
  {
    question: "Is the interest rate guaranteed?",
    answer:
      "No — the rate you enter is a constant, long-horizon assumption you choose yourself. Real interest rates and investment returns vary year to year, sometimes significantly. This tool is a planning lens, not a forecast or a guaranteed-return product.",
  },
];

export default function CompoundInterestCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/compound-interest-calculator"
        name="OmniFin Compound Interest Calculator"
        description="A compound interest calculator with monthly contributions: projects final balance, total contributed, and total growth, with a year-by-year breakdown table."
        featureList={[
          "Monthly-compounding growth projection",
          "Initial amount plus recurring monthly contributions",
          "Year-by-year contributed/growth/balance breakdown table",
        ]}
        faqs={FAQS}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Household Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Compound Interest</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Compound Interest Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            See how an initial amount plus monthly contributions grows over time — final balance,
            total contributed, total growth, and the full year-by-year path.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <CompoundInterestCalculator />

        <FinancialDisclaimerNote className="mt-4" />

        <AdSlot slot="" label="Advertisement" minHeight={100} className="my-6" />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            Why compound interest grows faster than it looks
          </h2>
          <p className="mt-3">
            Simple interest pays you a fixed amount every period, always based on the original
            amount you started with. Compound interest is different: each period&apos;s interest is
            calculated on the CURRENT balance, which already includes every bit of interest paid
            so far — so the amount you earn grows a little larger each period, even without adding
            any new money. Over short periods the difference is small; over many years it compounds
            into a substantially larger number, which is why it&apos;s often described as earning
            &ldquo;interest on your interest.&rdquo;
          </p>
          <p className="mt-3">
            This calculator compounds monthly rather than annually: every month, the running
            balance grows by one-twelfth of your entered annual rate, and then that month&apos;s
            contribution (if any) is added on top. Repeating that for every month across your
            chosen time horizon produces the year-by-year table below the headline numbers, so you
            can see exactly how much of each year&apos;s ending balance is your own money versus
            growth.
          </p>
          <p className="mt-3">
            The rate you enter is held constant for the entire projection, which is a simplification
            — real interest rates and investment returns move up and down from year to year. Use
            this to understand how the mechanics of compounding work and to compare different
            contribution amounts or time horizons against each other, not as a prediction of what
            any specific account or investment will actually return.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Each month: Balance = Balance × (1 + Annual Rate ÷ 12) + Monthly Contribution
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Key terms:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Monthly compounding: interest calculated and added every month, not once a year</li>
              <li>Total growth: final balance minus everything you personally contributed</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A compound interest calculator projects how an initial amount plus recurring contributions grows over time by applying interest to the running balance every period (here, monthly): Balance = Balance × (1 + Annual Rate ÷ 12) + Monthly Contribution, repeated for every month, so each period's interest is earned on top of all prior growth, not just the original amount." />
        </div>

        <FAQAccordion
          title="Compound Interest — Guide &amp; FAQs"
          subtitle="How monthly compounding works, and what this isn't."
          items={FAQS}
        />
      </section>
    </>
  );
}
