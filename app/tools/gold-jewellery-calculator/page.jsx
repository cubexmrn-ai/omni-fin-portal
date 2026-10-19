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

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            How gold jewellery is actually priced
          </h2>
          <p className="mt-3">
            A jewellery price tag is never just the metal. It starts with the live gold spot
            price — the same international rate that moves every converter and gold calculator on
            this site — then layers on three things a raw spot quote never includes: purity, craft,
            and tax. Together they explain why two shops quoting the &ldquo;same&rdquo; gold rate can hand
            you very different final bills for what looks like an identical piece.
          </p>
          <p className="mt-3">
            <strong>Purity</strong> comes first. Spot price is quoted for 24-karat (99.9% pure)
            gold, but very little everyday jewellery is actually made at 24K — it&apos;s too soft to
            hold its shape in a ring or bangle. South Asian and Gulf jewellery is usually 22K
            (91.67% pure) or 21K, and Western-style pieces are often 18K (75% pure) mixed with
            stronger alloy metals. Each karat step down scales the metal value down proportionally,
            which is why this calculator asks for karat before anything else.
          </p>
          <p className="mt-3">
            <strong>Making charges</strong> are the jeweller&apos;s labour — cutting, soldering,
            polishing, stone-setting — charged either as a percentage of the gold value (commonly
            8-25%, higher for intricate handwork) or as a flat rate per gram or tola. Two jewellers
            selling the same design can set very different making-charge percentages, which is
            usually the single biggest source of price variation between shops — bigger than any
            day-to-day move in the gold rate itself.
          </p>
          <p className="mt-3">
            <strong>Tax</strong> — GST in India, VAT in the Gulf, or a local sales tax elsewhere —
            is then applied on top of metal value plus making charges, not on the metal alone. And
            if you&apos;re trading in old jewellery toward a new piece, the buyback credit almost never
            equals the new piece&apos;s fresh spot value: jewellers typically credit 90-98% of it to
            cover re-refining losses, wastage, and the cost of verifying purity on something they
            didn&apos;t sell you originally.
          </p>
          <p className="mt-3">
            This calculator walks through all four steps — spot value, karat, making charges and
            tax, plus an optional old-gold trade-in — using the same live gold rate the rest of
            OmniFin Portal fetches. None of it replaces your own jeweller&apos;s actual invoice, since
            their making-charge percentage, local premium over spot, and buyback rate are theirs to
            set; it&apos;s here so you can walk in already knowing roughly what a fair number should
            look like.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Final Price = (Gold Spot Price × Weight × Karat Purity) + Making Charges + Tax −
              Old-Gold Exchange Credit
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Key rates:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>24K gold purity: 99.9%</li>
              <li>22K gold purity: 91.67%</li>
              <li>21K gold purity: 87.5%</li>
              <li>18K gold purity: 75%</li>
              <li>Typical making charges: 8–25% of gold value</li>
              <li>Typical old-gold buyback credit: 90–98% of fresh spot value</li>
            </ul>
          </div>
        </div>

        <FAQAccordion
          title="Gold &amp; Jewellery Pricing — Guide &amp; FAQs"
          subtitle="Making charges, old-gold exchange, and karat purity, explained."
          items={FAQS}
        />
      </section>
    </>
  );
}
