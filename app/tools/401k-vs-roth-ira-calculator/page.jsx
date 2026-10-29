import Link from "next/link";
import TraditionalVsRothCalculator from "@/components/tools/TraditionalVsRothCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import AdSlot from "@/components/AdSlot";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
import AeoCallout from "@/components/blog/AeoCallout";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "401(k) vs Roth IRA Calculator | OmniFin Portal",
    description:
      "Compare a Traditional 401(k)/IRA against a Roth IRA at the same paycheck cost today — see which comes out ahead after tax, based on your current and expected retirement tax rates.",
    path: "/tools/401k-vs-roth-ira-calculator",
  }),
  keywords: [
    "401k vs roth ira calculator",
    "traditional vs roth calculator",
    "roth ira calculator",
    "pre-tax vs after-tax retirement",
    "should I use a roth or traditional 401k",
  ],
};

const FAQS = [
  {
    question: "Why does this compare after-tax contribution amounts, not the same dollar figure?",
    answer:
      "A Traditional contribution is pre-tax — it reduces taxable income today. A Roth contribution is after-tax — it costs the full amount out of take-home pay. Comparing the same NOMINAL dollar amount into both quietly assumes the saver can afford to put in more pre-tax than after-tax, which isn't a fair comparison. This tool instead holds the actual paycheck cost constant: the Roth side contributes whatever after-tax amount equals the same take-home-pay hit as the Traditional contribution.",
  },
  {
    question: "What if my tax rate is the same now and at retirement?",
    answer:
      "Then both accounts come out to exactly the same after-tax balance — that's the textbook result when the tax rate never changes. Traditional vs. Roth only meaningfully diverges when you expect your tax rate to be different in retirement than it is today.",
  },
  {
    question: "Should I pick whichever this calculator says comes out ahead?",
    answer:
      "This shows the pure math outcome under the tax-rate assumptions you enter, but your actual future tax rate is unknowable, and other factors matter too (required minimum distributions, estate planning, tax diversification). This is informational only, not tax or financial advice — many savers reasonably hold both account types.",
  },
];

export default function TraditionalVsRothCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/401k-vs-roth-ira-calculator"
        name="OmniFin 401(k) vs Roth IRA Calculator"
        description="A same-paycheck-cost comparison between a Traditional 401(k)/IRA and a Roth IRA: projects both accounts' after-tax balance at retirement based on your current and expected retirement tax rates."
        featureList={[
          "Same-take-home-pay-cost Traditional vs. Roth comparison",
          "After-tax balance projection for both account types",
          "Direct dollar-and-percent 'which comes out ahead' takeaway",
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
            <span className="text-slate-500">401(k) vs Roth IRA</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            401(k) vs Roth IRA Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Pre-tax now, or tax-free later? Compare both account types at the exact same cost to
            your paycheck today, and see which one wins after tax at retirement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <TraditionalVsRothCalculator />

        <FinancialDisclaimerNote className="mt-4" />

        <AdSlot slot="" label="Advertisement" minHeight={100} className="my-6" />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            Why &ldquo;same contribution amount&rdquo; isn&apos;t a fair comparison
          </h2>
          <p className="mt-3">
            A Traditional 401(k) or IRA contribution comes out of your paycheck before income tax
            is applied — it lowers your taxable income this year, and the whole balance (your
            contributions plus all its growth) is taxed as ordinary income when you eventually
            withdraw it. A Roth IRA works the opposite way: you contribute money that&apos;s already
            been taxed, so there&apos;s no deduction today, but qualifying withdrawals in retirement —
            contributions and growth alike — are completely tax-free.
          </p>
          <p className="mt-3">
            Because of that, putting the same nominal dollar amount into each one isn&apos;t actually
            an apples-to-apples comparison: a $500 Traditional contribution costs you less out of
            your take-home pay today than a $500 Roth contribution does, since the Traditional
            amount hasn&apos;t been taxed yet. This calculator fixes that by holding the real cost to
            your paycheck constant — whatever you enter is treated as the Traditional (pre-tax)
            contribution, and the Roth side automatically uses the smaller after-tax amount that
            costs you the exact same amount today.
          </p>
          <p className="mt-3">
            From there, both balances grow with the same month-by-month compounding at your chosen
            return rate. The Traditional balance is taxed at your entered retirement tax rate when
            withdrawn; the Roth balance isn&apos;t taxed at all. When your tax rate is expected to be
            lower in retirement than it is today, Traditional tends to win; when it&apos;s expected to
            be the same or higher, Roth tends to pull ahead — and when the rate never changes at
            all, the two options are mathematically identical.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Traditional net = [compound growth of pre-tax contribution] × (1 − Retirement Tax Rate)
            </p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Roth net = compound growth of [contribution × (1 − Current Tax Rate)] (untaxed)
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Key terms:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Same-cost comparison: both sides cost the same amount out of your paycheck today</li>
              <li>Tax-rate assumption: your real future tax rate is unknowable; both rates here are chosen by you</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A 401(k)/Traditional vs. Roth IRA calculator compares the two account types at the same paycheck cost today: the Traditional side grows a pre-tax contribution and taxes it on withdrawal at your retirement tax rate, while the Roth side grows the smaller after-tax-equivalent contribution and withdraws it tax-free — the two are mathematically identical when your tax rate never changes, and diverge based on whether your retirement tax rate is expected to be lower or higher than today's." />
        </div>

        <FAQAccordion
          title="401(k) vs Roth IRA — Guide &amp; FAQs"
          subtitle="Why same-cost comparison matters, and what this isn't."
          items={FAQS}
        />
      </section>
    </>
  );
}
