import Link from "next/link";
import ZakatCalculator from "@/components/tools/ZakatCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Zakat Calculator — Gold, Silver & Savings | OmniFin Portal",
    description:
      "Free zakat calculator using live gold and silver rates — checks your gold, silver, cash and savings against the nisab threshold and estimates the 2.5% zakat due.",
    path: "/tools/zakat-calculator",
  }),
  keywords: [
    "zakat calculator",
    "zakat calculator gold",
    "nisab calculator",
    "zakat on savings",
    "zakat calculator 2025",
    "how to calculate zakat",
  ],
};

const FAQS = [
  {
    question: "What is nisab, and which standard should I use?",
    answer:
      "Nisab is the minimum wealth threshold above which zakat becomes due — commonly 87.48 grams of gold, or 612.36 grams of silver. The silver standard gives a lower threshold and is often recommended for mixed cash-and-metal holdings; the gold standard is sometimes preferred for gold-only holdings. This is a general reference — consult a scholar if you're unsure which applies to you.",
  },
  {
    question: "What counts as \"zakatable wealth\"?",
    answer:
      "Generally: gold, silver, cash, savings, and business inventory or investments held for a full lunar year, minus short-term debts due. Personal-use items (your own home, car, or everyday-use jewellery, depending on scholarly opinion) are typically excluded — this calculator doesn't make that determination for you.",
  },
  {
    question: "What zakat rate does this use?",
    answer:
      "The standard 2.5% rate on qualifying wealth above the nisab threshold, applied once your total zakatable wealth has been held for a full lunar (Hijri) year.",
  },
];

export default function ZakatCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/zakat-calculator"
        name="OmniFin Zakat Calculator"
        description="A free zakat calculator using live gold and silver rates: checks gold, silver, cash, savings and other zakatable assets against the nisab threshold and estimates the 2.5% zakat due."
        featureList={[
          "Live gold & silver nisab threshold",
          "Gold, silver, cash & savings input",
          "Gold or silver nisab standard, selectable",
          "2.5% zakat-due estimate",
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
            <span className="text-slate-500">Zakat Calculator</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Zakat Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Gold, silver, cash and savings — checked against the live nisab threshold, with a 2.5%
            zakat-due estimate.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ZakatCalculator />
        <FAQAccordion
          title="Zakat — Guide &amp; FAQs"
          subtitle="Nisab standards, what counts as zakatable wealth, and the 2.5% rate."
          items={FAQS}
        />
      </section>
    </>
  );
}
