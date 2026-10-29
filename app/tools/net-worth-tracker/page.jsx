import Link from "next/link";
import NetWorthTracker from "@/components/tools/NetWorthTracker";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import AdSlot from "@/components/AdSlot";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
import AeoCallout from "@/components/blog/AeoCallout";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = {
  ...buildMetadata({
    title: "Net Worth Tracker & Calculator | OmniFin Portal",
    description:
      "Add your assets and liabilities to calculate your net worth instantly, and save the snapshot to your browser to pick up again later — nothing is sent anywhere else.",
    path: "/tools/net-worth-tracker",
  }),
  keywords: [
    "net worth calculator",
    "net worth tracker",
    "how to calculate net worth",
    "assets and liabilities calculator",
    "personal balance sheet",
  ],
};

const FAQS = [
  {
    question: "How is net worth calculated?",
    answer:
      "Net worth is simply everything you own (assets — cash, savings, investments, property, vehicles) minus everything you owe (liabilities — credit cards, loans, mortgages). A positive net worth means your assets outweigh your debts; a negative one means the reverse.",
  },
  {
    question: "Where is my snapshot saved?",
    answer:
      "Only in this browser, on this device, using your browser's local storage — it's never sent to OmniFin Portal or anywhere else. Saving again overwrites your previous snapshot, and clearing your browser's site data will remove it.",
  },
  {
    question: "Why doesn't this track net worth over time?",
    answer:
      "This tool is a simple snapshot calculator, not a historical tracker — it shows your net worth right now, based on whatever you enter. For tracking trades or assets over time, see OmniFin Portal's Journal.",
  },
];

export default function NetWorthTrackerPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/net-worth-tracker"
        name="OmniFin Net Worth Tracker"
        description="A net worth calculator: add any number of asset and liability line items to instantly see total assets, total liabilities, and net worth, with an optional browser-only saved snapshot."
        featureList={[
          "Unlimited custom asset and liability line items",
          "Instant total assets, total liabilities, and net worth calculation",
          "Optional snapshot saved to your own browser only",
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
            <span className="text-slate-500">Net Worth Tracker</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Net Worth Tracker &amp; Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            List what you own and what you owe to see your net worth instantly — and optionally
            save the snapshot to this browser to pick up again later.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <NetWorthTracker />

        <FinancialDisclaimerNote className="mt-4" />

        <AdSlot slot="" label="Advertisement" minHeight={100} className="my-6" />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">
            Why net worth is the single number worth tracking
          </h2>
          <p className="mt-3">
            Income, savings-account balances, and investment returns all tell you part of your
            financial picture, but none of them alone tell you whether you&apos;re actually getting
            wealthier. Net worth does: it&apos;s everything you own, added up, minus everything you
            owe. A high income with high debt can still mean a low or negative net worth; a modest
            income with steady saving and no debt can mean a healthy, growing one.
          </p>
          <p className="mt-3">
            This tool keeps the calculation as simple as the concept actually is — add every asset
            (cash, savings, investment accounts, property, vehicles, anything else of value) on one
            side, every liability (credit card balances, loans, mortgages, anything you owe) on the
            other, and the difference is your net worth. There&apos;s no limit on how many line items
            you add, so it scales from a quick back-of-envelope check to a fuller personal balance
            sheet.
          </p>
          <p className="mt-3">
            Because this is a snapshot rather than a tracked history, the real value comes from
            checking back periodically — monthly or quarterly — and comparing the number against
            your last check-in. Saving a snapshot to your own browser makes that easy without
            needing an account or sending any of your financial details anywhere.
          </p>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              Net Worth = Total Assets − Total Liabilities
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Key terms:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Assets: anything of value you own</li>
              <li>Liabilities: anything you owe</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="Net worth is calculated as total assets minus total liabilities — add up everything you own (cash, savings, investments, property) and subtract everything you owe (credit cards, loans, mortgages) to get a single number that reflects your overall financial position, unlike income or any single account balance alone." />
        </div>

        <FAQAccordion
          title="Net Worth Tracker — Guide &amp; FAQs"
          subtitle="How the calculation works, where your data is saved, and what this isn't."
          items={FAQS}
        />
      </section>
    </>
  );
}
