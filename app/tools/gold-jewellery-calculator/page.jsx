import Link from "next/link";
import GoldJewelleryCalculator from "@/components/tools/GoldJewelleryCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Gold & Jewellery Making-Charges Calculator | OmniFin Portal",
    description:
      "Free gold jewellery price calculator — live gold spot price by tola, gram or karat, plus making charges, GST/VAT, and an old-gold exchange credit. Built for South Asian & Gulf jewellery buyers.",
    path: "/tools/gold-jewellery-calculator",
  }),
  keywords: [
    "gold jewellery calculator",
    "making charges calculator",
    "gold rate calculator with making charges",
    "tola gold price today",
    "old gold exchange calculator",
    "gold GST calculator",
  ],
};

const FAQS = [
  {
    question: "What are gold \"making charges\"?",
    answer:
      "Making charges are the jeweller's labour cost for crafting the piece — charged either as a percentage of the gold's spot value, or as a flat amount per gram/tola. They're added on top of the raw gold value, before tax.",
  },
  {
    question: "Why is the price here different from what my jeweller quotes?",
    answer:
      "This calculator uses the live international gold spot price converted to your currency. Local jewellers may price slightly above or below spot depending on their own sourcing costs, and their making-charge % and GST/VAT rate are set by them — enter your own jeweller's actual figures for an accurate quote.",
  },
  {
    question: "How does the old-gold exchange credit work?",
    answer:
      "When you trade in old jewellery, a jeweller rarely credits 100% of its fresh spot value — a buyback percentage (commonly 90-98%) accounts for wastage, re-refining, and purity testing. Enter your jeweller's own buyback percentage for an accurate exchange credit.",
  },
  {
    question: "What's the difference between 24K, 22K and 18K gold?",
    answer:
      "Karat measures gold purity: 24K is 99.9% pure gold, 22K is 91.67% pure, and 18K is 75% pure, with the remainder made up of other metals for durability. Lower-karat gold is priced lower per unit weight than 24K, proportional to its purity.",
  },
];

export default function GoldJewelleryCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/gold-jewellery-calculator"
        name="OmniFin Gold & Jewellery Making-Charges Calculator"
        description="A free gold jewellery price calculator: live gold spot value by weight unit and karat, plus making charges, GST/VAT, and an old-gold exchange credit."
        featureList={[
          "Live gold spot pricing by tola, gram, troy ounce or kilogram",
          "Karat purity adjustment (24K/22K/21K/18K)",
          "Making charges — percentage or flat",
          "GST / VAT estimate",
          "Old-gold exchange buyback credit",
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
            <span className="text-slate-500">Gold &amp; Jewellery Calculator</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Gold &amp; Jewellery Price Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            What a piece of jewellery actually costs — live gold value, making charges, GST/VAT, and
            an old-gold exchange credit, all in one pass.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <GoldJewelleryCalculator />
        <FAQAccordion
          title="Gold &amp; Jewellery Pricing — Guide &amp; FAQs"
          subtitle="Making charges, old-gold exchange, and karat purity, explained."
          items={FAQS}
        />
      </section>
    </>
  );
}
