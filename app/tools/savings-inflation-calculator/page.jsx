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
        <FAQAccordion
          title="Savings &amp; Inflation — Guide &amp; FAQs"
          subtitle="What erosion means, why a return rate helps, and what this isn't."
          items={FAQS}
        />
      </section>
    </>
  );
}
