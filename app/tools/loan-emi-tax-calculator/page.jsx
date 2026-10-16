import Link from "next/link";
import LoanEmiTaxCalculator from "@/components/tools/LoanEmiTaxCalculator";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Loan EMI & Salary Tax Calculator | OmniFin Portal",
    description:
      "Free loan EMI calculator with a year-by-year payoff schedule, plus an illustrative Pakistan salary tax estimate — two of the most-searched household finance calculators, in one tool.",
    path: "/tools/loan-emi-tax-calculator",
  }),
  keywords: [
    "loan EMI calculator",
    "EMI calculator Pakistan",
    "salary tax calculator Pakistan",
    "income tax calculator Pakistan",
    "monthly installment calculator",
    "personal loan calculator",
  ],
};

const FAQS = [
  {
    question: "What is EMI and how is it calculated?",
    answer:
      "EMI (Equated Monthly Installment) is a fixed monthly payment that pays off a loan's principal and interest over a set tenure, using the standard amortization formula. Early payments are weighted more toward interest; later payments pay down more principal.",
  },
  {
    question: "Does this account for processing fees or insurance?",
    answer:
      "No — this calculates the pure principal-and-interest amortization. Your actual lender may add processing fees, insurance premiums, or a variable (not fixed) rate, which would change your real monthly payment.",
  },
  {
    question: "How accurate is the salary tax estimate?",
    answer:
      "It uses the illustrative Pakistan FY2024-25 salaried-individual tax slabs, with no withholding, rebates, or non-salaried rates applied, and tax slabs change every fiscal year. For an actual filing, use FBR's own calculator or a tax professional.",
  },
];

export default function LoanEmiTaxCalculatorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/loan-emi-tax-calculator"
        name="OmniFin Loan EMI & Salary Tax Calculator"
        description="A free loan EMI calculator with a year-by-year amortization schedule, plus an illustrative Pakistan salaried-individual income tax estimate."
        featureList={[
          "Fixed-rate loan EMI calculation",
          "Year-by-year amortization schedule",
          "Total interest and total repayment",
          "Illustrative Pakistan salary tax estimate",
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
            <span className="text-slate-500">Loan EMI &amp; Salary Tax</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Loan EMI &amp; Salary Tax Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Your monthly loan installment and payoff schedule, or a quick salary-tax estimate — two
            of the most-searched household finance calculators, in one tool.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <LoanEmiTaxCalculator />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            Understanding your EMI — and what it leaves out
          </h2>
          <p className="mt-3">
            Every fixed-rate loan — a home loan, a car loan, a personal loan — reduces to the same
            formula: <strong>EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)</strong>, where P is the principal
            you borrow, r is the monthly interest rate (annual rate ÷ 12), and n is the total number
            of monthly installments. The result is a single, unchanging monthly payment for the
            full tenure — but what&apos;s inside that payment shifts dramatically over time.
          </p>
          <p className="mt-3">
            In the first year of a long-tenure loan, most of each EMI goes toward interest, not
            principal — the bank is paid first on the money it&apos;s still owed. As the outstanding
            balance shrinks year over year, a growing share of the same fixed payment finally starts
            paying down principal. That&apos;s why making extra payments early in a loan&apos;s life saves
            far more total interest than the same extra payment made in year 10 — the earlier a
            rupee of principal disappears, the more years of interest it was going to generate.
          </p>
          <p className="mt-3">
            This calculator shows that full year-by-year split — the amortization schedule — so you
            can see exactly how much of each year&apos;s payments is interest versus principal, and how
            much you&apos;ll have paid the bank in total by the end of the tenure versus what you
            actually borrowed. What it deliberately doesn&apos;t do is add a lender&apos;s processing fee,
            mandatory insurance premium, or a floating/variable rate that changes mid-tenure — all
            of which are common in real loan offers and all of which your actual lender, not this
            calculator, sets.
          </p>
          <p className="mt-3">
            The salary tax side uses Pakistan&apos;s FY2024-25 salaried-individual slab rates as a
            quick, illustrative estimate of take-home pay — useful for sanity-checking whether a
            loan&apos;s EMI fits comfortably inside your monthly income before you apply. It applies no
            withholding adjustments, zakat, provident fund deductions, or non-salaried (business)
            rates, and Pakistan&apos;s tax slabs are revised almost every fiscal year in the federal
            budget — so treat the figure here as a planning estimate, not a filing number, and
            confirm the current year&apos;s slabs with FBR or a tax professional before relying on it.
          </p>
        </div>

        <FAQAccordion
          title="Loan EMI &amp; Salary Tax — Guide &amp; FAQs"
          subtitle="How amortization works, and what the tax estimate does and doesn't cover."
          items={FAQS}
        />
      </section>
    </>
  );
}
