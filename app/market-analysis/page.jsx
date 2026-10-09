import Link from "next/link";
import MarketOverviewBoard from "@/components/MarketOverviewBoard";

export const metadata = {
  title: "Live Market Charts | OmniFin Portal",
  description:
    "Real-time TradingView charts for global stock indices (S&P 500, Nasdaq, Nifty 50, PSX, Nikkei 225), major forex pairs and top crypto assets — free, no login required.",
};

export default function MarketAnalysisPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Module 2 · Market AI &amp; News
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Market Analysis
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Track global stock indices, major forex pairs and top crypto
            assets with real-time TradingView charts, and catch up on the
            latest finance headlines.
          </p>
          <div className="mt-5">
            <Link
              href="/ai-news"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View Financial News
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <MarketOverviewBoard />
    </>
  );
}
