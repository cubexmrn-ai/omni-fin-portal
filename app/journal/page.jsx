// app/journal/page.jsx
//
// Trading & Asset Journal — a server component shell (so it can
// export metadata) wrapping components/journal/JournalHub.jsx, the
// "use client" component that reads/writes the person's localStorage-
// backed journal entries (a client-only concern) — same page/
// component split as app/dashboard/page.jsx + DashboardHub.jsx and
// app/learn/page.jsx + AcademyHub.jsx.

import JournalHub from "@/components/journal/JournalHub";
import BreadcrumbStructuredData from "@/components/BreadcrumbStructuredData";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Trading & Asset Journal — Forex, Crypto, Stocks & Rental Income | OmniFin Portal",
  description:
    "A free, private trading and asset journal: log Forex & crypto trades, stock investments, and real estate/rental income, with automatic P&L and cap-rate figures, plus CSV/JSON export and import. Stored locally in your browser.",
  path: "/journal",
});

export default function JournalPage() {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", href: "/" }, { name: "Journal", href: "/journal" }]} />
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Trading &amp; Asset Journal
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Log Forex &amp; crypto trades, stock investments, and real estate/rental income in one
            place — with automatic profit/loss and cap-rate figures, and CSV/JSON export so your
            data is always yours to keep.
          </p>
        </div>
      </section>
      <JournalHub />
    </>
  );
}
