import Link from "next/link";
import SavingsInflationVisualizer from "@/components/tools/SavingsInflationVisualizer";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Savings & Inflation Calculator | OmniFin Portal",
    description:
      "See exactly what inflation does to money left as cash, versus saving and topping it up over time — a plain-language savings & inflation visualizer for everyday households.",
    path: "/tools/savings-inflation-calculator",
  }),
  keywords: [
    "inflation calculator",
    "savings calculator",
    "purchasing power calculator",
    "what is my money worth in 10 years",
    "savings goal calculator",
  ],
};

const FAQS = [
  {
    question: "What does \"purchasing power erosion\" mean?",
    answer:
      "It's how much less your money can actually buy after inflation, even though the number in your account hasn't changed. If inflation runs at 7% a year, money sitting idle loses roughly 7% of its buying power every year, compounding over time.",
  },
  {
    question: "Why does saving at a return rate help?",
    answer:
      "If your savings grow at a rate higher than inflation, your purchasing power actually increases over time instead of eroding — this tool compounds your starting amount plus any monthly top-up at your chosen growth rate, the same way a savings or investment account would.",
  },
  {
    question: "Is this a guarantee of future returns?",
    answer:
      "No — both the inflation and investment-return figures are constant-rate, long-horizon projections you choose yourself. Real inflation and real investment returns vary from year to year, and this tool doesn't predict either.",
  },
];

export default function SavingsInflationCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/savings-inflation-calculator"
        name="OmniFin Savings & Inflation Calculator"
        description="A plain-language savings & inflation visualizer: what inflation does to cash left idle, compared with saving and topping it up over time."
        featureList={[
          "Purchasing-power erosion projection",
          "Compound savings growth with monthly top-ups",
          "Plain-language side-by-side comparison",
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
            <span className="text-slate-500">Savings &amp; Inflation</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Savings &amp; Inflation Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            What happens to your money if you leave it as cash — versus saving it and topping it up
            over time. In plain language, not trader jargon.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <SavingsInflationVisualizer />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            Why idle cash quietly loses value
          </h2>
          <p className="mt-3">
            The number in a savings account doesn&apos;t change just because prices go up — but what
            that number can actually buy does. If prices rise 7% over a year, the same amount of
            cash buys roughly 7% less than it did twelve months earlier, even though the figure on
            the bank statement is identical. That gap between the number and what it&apos;s worth is
            what this tool calls <strong>purchasing-power erosion</strong>, and it compounds: a
            second year of 7% inflation doesn&apos;t just add another 7% loss, it takes 7% off an
            already-shrunk base, the same way compound interest works in reverse.
          </p>
          <p className="mt-3">
            Left as cash under a mattress or in a zero-interest account, money has no defense
            against this at all — it simply erodes, year after year, for as long as it sits still.
            The only way to counter it is to put that money somewhere it grows at a rate of its own.
            If a savings or investment return rate is higher than the inflation rate, purchasing
            power doesn&apos;t just stop shrinking — it actually grows in real terms, because the
            money is now compounding faster than prices are rising.
          </p>
          <p className="mt-3">
            This calculator runs both scenarios side by side from the same starting amount: one
            path where the money sits idle and loses ground to inflation every year, and another
            where it earns a return you choose — optionally topped up with a fixed amount every
            month, the same way a standing savings-account deposit or investment contribution would
            work. Comparing the two numbers after your chosen number of years makes the abstract
            idea of &ldquo;inflation eating your savings&rdquo; into an actual figure: exactly how much
            better off (or worse off) that money ends up, in today&apos;s purchasing power, depending
            on where it sits.
          </p>
          <p className="mt-3">
            Both the inflation rate and the return rate you enter are long-horizon assumptions you
            choose yourself, held constant for the whole projection — real inflation and real
            investment returns both vary year to year in practice, sometimes sharply. This tool is a
            planning lens for understanding the mechanics of erosion versus growth, not a forecast
            of what will actually happen to any specific currency or investment.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Idle cash (real value) = Starting Amount ÷ (1 + Inflation Rate) ^ Years
            </p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Saved amount (future value) = [Starting Amount × (1 + Return Rate) ^ Years] +
              compounded monthly top-ups
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Key terms:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Inflation rate and return rate: constant, user-chosen annual rates</li>
              <li>Purchasing-power erosion: compounds the same way interest does, in reverse</li>
            </ul>
          </div>
        </div>

        <FAQAccordion
          title="Savings &amp; Inflation — Guide &amp; FAQs"
          subtitle="What erosion means, why a return rate helps, and what this isn't."
          items={FAQS}
        />
      </section>
    </>
  );
}
