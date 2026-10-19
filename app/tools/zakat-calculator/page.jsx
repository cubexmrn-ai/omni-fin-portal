import Link from "next/link";
import ZakatCalculator from "@/components/tools/ZakatCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import AdSlot from "@/components/AdSlot";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
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

        <FinancialDisclaimerNote className="mt-4" />

        {/* AdSense & Monetization Readiness: below the main calculation
            result, above the explainer content — see components/AdSlot.jsx. */}
        <AdSlot slot="" label="Advertisement" minHeight={100} className="my-6" />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            How this calculator works out zakat
          </h2>
          <p className="mt-3">
            Zakat is due once a Muslim&apos;s total qualifying wealth — gold, silver, cash, and
            savings held for a full lunar (Hijri) year — sits above the <strong>nisab</strong>, a
            minimum threshold below which zakat isn&apos;t owed at all. Nisab is set in weight, not
            currency, which is exactly why this calculator leans on the same live gold and silver
            rates used across the rest of OmniFin Portal: a fixed rupee or dollar nisab figure would
            go stale the moment metal prices move, while a weight-based threshold stays accurate
            indefinitely.
          </p>
          <p className="mt-3">
            Two nisab standards are in common use, and this calculator lets you pick either one.
            The <strong>gold standard</strong> — 87.48 grams of gold — gives a higher wealth
            threshold, since gold is worth more per gram than silver. The{" "}
            <strong>silver standard</strong> — 612.36 grams of silver — gives a lower threshold, and
            is the standard many scholars recommend specifically for mixed cash-and-metal holdings,
            since it means more lower-wealth individuals end up owing zakat (and therefore more
            zakat reaches those who need it), which is consistent with zakat&apos;s purpose as a
            redistributive obligation rather than a tax on only the very wealthy.
          </p>
          <p className="mt-3">
            Once your total zakatable wealth clears whichever nisab you select, the rate applied is
            fixed and universal: <strong>2.5%</strong> of the total, not just the portion above the
            threshold — a distinction that trips up a lot of manual calculations. Add your gold and
            silver (converted to today&apos;s value via the live rate), cash on hand, and savings
            balances; this calculator totals them, checks the sum against your chosen nisab, and
            multiplies by 2.5% if you clear it.
          </p>
          <p className="mt-3">
            What it can&apos;t do for you is the judgment call on what actually counts as
            &ldquo;zakatable&rdquo; in your specific situation — personal-use jewellery, your family
            home, short-term debts you owe, and business inventory are all treated differently by
            different scholarly opinions, and this calculator doesn&apos;t take a position on any of
            that. It&apos;s a wealth-and-threshold calculator, not a religious ruling — for anything
            beyond the arithmetic, a knowledgeable scholar is the right person to ask.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Zakat Due = 2.5% × Total Zakatable Wealth (if Total Zakatable Wealth ≥ Nisab)
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              Key rates &amp; nisab thresholds:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Gold nisab standard: 87.48 grams of gold</li>
              <li>Silver nisab standard: 612.36 grams of silver</li>
              <li>Zakat rate: 2.5% of total qualifying wealth</li>
              <li>Holding period: a full lunar (Hijri) year</li>
            </ul>
          </div>
        </div>

        <FAQAccordion
          title="Zakat — Guide &amp; FAQs"
          subtitle="Nisab standards, what counts as zakatable wealth, and the 2.5% rate."
          items={FAQS}
        />
      </section>
    </>
  );
}
