import Link from "next/link";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Household Financial Tools | OmniFin Portal",
  description:
    "Free household finance calculators: gold & jewellery pricing with making charges, loan EMI & salary tax, zakat, and a savings & inflation visualizer — built for everyday South Asian & Gulf households.",
  path: "/tools",
});

const HOUSEHOLD_TOOLS = [
  {
    href: "/tools/gold-jewellery-calculator",
    title: "Gold & Jewellery Price Calculator",
    description:
      "Live gold value by tola, gram or karat, plus making charges, GST/VAT, and an old-gold exchange credit.",
  },
  {
    href: "/tools/loan-emi-tax-calculator",
    title: "Loan EMI & Salary Tax Calculator",
    description:
      "Your monthly loan installment and payoff schedule, or a quick Pakistan salary-tax estimate.",
  },
  {
    href: "/tools/zakat-calculator",
    title: "Zakat Calculator",
    description:
      "Gold, silver, cash and savings checked against the live nisab threshold — 2.5% zakat-due estimate.",
  },
  {
    href: "/tools/savings-inflation-calculator",
    title: "Savings & Inflation Calculator",
    description:
      "What inflation does to cash left idle, versus saving and topping it up over time — in plain language.",
  },
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <span className="hover:text-brand-600">Dashboard</span>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Household Tools</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Household Financial Tools
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Free, everyday calculators for the household — not just the trading desk: jewellery
            pricing, loan payments, zakat, and what inflation really does to your savings.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {HOUSEHOLD_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lg"
            >
              <h2 className="text-base font-bold text-slate-900">{tool.title}</h2>
              <p className="mt-1.5 text-sm text-slate-600">{tool.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600">
                Open calculator →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-6 text-sm">
          <Link href="/calculators" className="font-medium text-brand-600 hover:underline">
            Trading &amp; financial calculators
          </Link>
          <Link href="/converters" className="font-medium text-brand-600 hover:underline">
            Currency, metals &amp; crypto converter
          </Link>
          <Link href="/learn" className="font-medium text-brand-600 hover:underline">
            Learn the formulas in OmniFin Academy
          </Link>
        </div>
      </section>
    </div>
  );
}
