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
        <FAQAccordion
          title="Loan EMI &amp; Salary Tax — Guide &amp; FAQs"
          subtitle="How amortization works, and what the tax estimate does and doesn't cover."
          items={FAQS}
        />
      </section>
    </>
  );
}
