import Link from "next/link";
import RetirementSavingsCalculator from "@/components/tools/RetirementSavingsCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import AdSlot from "@/components/AdSlot";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
import AeoCallout from "@/components/blog/AeoCallout";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Retirement Savings Calculator | OmniFin Portal",
    description:
      "See whether your current savings and monthly contributions are on track for retirement — projected balance, the 4% rule's sustainable income estimate, and the gap against your target.",
    path: "/tools/retirement-calculator",
  }),
  keywords: [
    "retirement calculator",
    "retirement savings calculator",
    "how much do I need to retire",
    "4% rule calculator",
    "am I on track for retirement",
  ],
};

const FAQS = [
  {
    question: "What is the \"4% rule\"?",
    answer:
      "It's a widely-cited retirement-planning rule of thumb that says a retirement balance can typically support withdrawing about 4% of itself per year, adjusted for inflation, without running out over a roughly 30-year retirement. It's a heuristic, not a guarantee — real safe withdrawal rates depend on market returns, how long retirement lasts, and portfolio mix.",
  },
  {
    question: "How is my projected balance calculated?",
    answer:
      "Your current savings plus your monthly contribution are compounded monthly at your chosen expected return rate, for the number of years between your current age and retirement age — the same month-by-month compounding this site's other wealth-growth calculators use.",
  },
  {
    question: "What does \"on track\" or \"short by\" mean?",
    answer:
      "Your target monthly income is converted into the balance that the 4% rule says would be needed to sustainably support it (target annual income ÷ 4%). Your projected balance is then compared against that required balance — a surplus means on track, a shortfall means short by that amount.",
  },
];

export default function RetirementCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/retirement-calculator"
        name="OmniFin Retirement Savings Calculator"
        description="A plain-language retirement savings calculator: projects your balance at retirement age and estimates sustainable monthly income using the 4% rule, compared against your own income target."
        featureList={[
          "Compound savings growth to retirement age",
          "4%-rule sustainable withdrawal estimate",
          "On-track / shortfall comparison against your target income",
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
            <span className="text-slate-500">Retirement Savings</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Retirement Savings Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Are your current savings and monthly contributions on track for the retirement income
            you want? See your projected balance and what it could sustainably pay you each month.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <RetirementSavingsCalculator />

        <FinancialDisclaimerNote className="mt-4" />

        <AdSlot slot="" label="Advertisement" minHeight={100} className="my-6" />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            Turning a savings balance into a retirement income estimate
          </h2>
          <p className="mt-3">
            A retirement balance on its own is just a number — the question that actually matters
            is what it can pay you, year after year, without running out. The most widely-cited
            rule of thumb for answering that is the <strong>4% rule</strong>: withdraw about 4% of
            the starting balance in the first year, adjust that amount for inflation each year
            after, and historically that has held up over most 30-year retirement periods. It is a
            planning heuristic built from historical market data, not a mathematical guarantee —
            a severe or prolonged downturn early in retirement can still strain it.
          </p>
          <p className="mt-3">
            This calculator compounds your current savings plus your monthly contribution, month
            by month, at your chosen expected return rate, over however many years separate your
            current age from your target retirement age. It then applies the 4% rule to that
            projected balance to estimate a sustainable monthly income, and compares that estimate
            against the monthly income target you entered — so instead of an abstract balance, you
            get a direct answer: on track, or short by how much.
          </p>
          <p className="mt-3">
            The expected return rate you enter is a long-horizon assumption held constant across
            the whole projection. Real investment returns vary significantly year to year — this
            tool is a planning lens for understanding the mechanics of saving toward a target, not
            a forecast of what any specific account or investment will actually return.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Projected Balance = compound growth of (Current Savings + Monthly Contribution) at
              Expected Return, monthly, for (Retirement Age − Current Age) years
            </p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Sustainable Monthly Income ≈ Projected Balance × 4% ÷ 12
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Key terms:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>4% rule: a widely-used, historically-grounded withdrawal heuristic, not a guarantee</li>
              <li>On track / shortfall: your projected balance compared against the balance your target income would need</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A retirement savings calculator projects your current savings plus monthly contributions compounded at an expected return rate out to your retirement age, then applies the widely-cited 4% rule (balance × 4% ÷ 12 for a monthly figure) to estimate sustainable retirement income, comparing it against your own target to show whether you're on track or short." />
        </div>

        <FAQAccordion
          title="Retirement Savings — Guide &amp; FAQs"
          subtitle="What the 4% rule means, how the projection works, and what this isn't."
          items={FAQS}
        />
      </section>
    </>
  );
}
