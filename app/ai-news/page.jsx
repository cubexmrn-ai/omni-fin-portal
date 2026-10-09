import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { getAggregatedNews } from "@/lib/newsAggregator";

export const metadata = {
  title: "Financial News — Forex, Crypto, Commodities & Stocks | OmniFin Portal",
  description:
    "Live, categorized finance headlines across Forex, Crypto, Commodities and Stocks, aggregated from multiple public sources with search and category filters. AI-generated summaries arriving soon.",
};

export const revalidate = 900; // Align with /api/news-ai's ISR cache.

export default async function AiNewsPage() {
  let data = null;
  let loadError = null;

  try {
    // Calling the aggregator directly (not via an HTTP self-fetch to
    // /api/news-ai) — see the top of lib/newsAggregator.js for why that
    // self-fetch was the actual cause of this page's "DOCTYPE is not
    // valid JSON" error in production. getAggregatedNews() is also
    // designed to never throw (per-feed try/catch + a static mock
    // fallback if every feed fails), so loadError below should now only
    // ever fire on a truly unexpected bug, not a network/feed issue.
    data = await getAggregatedNews();
  } catch (err) {
    loadError = err.message;
  }

  const items = data?.items || [];

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/market-analysis" className="hover:text-brand-600">
              Market Analysis
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Financial News</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Global Financial News
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Live headlines across Forex, Crypto, Commodities and Stocks,
            aggregated from multiple public sources and refreshed every
            15 minutes. Search or filter by category below.
          </p>

          <div className="mt-5 inline-flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <svg
              width="16"
              height="16"
              className="mt-0.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              {data?.aiSummarization?.note ||
                "AI-generated summaries are coming soon — this feed currently shows raw headlines only."}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {loadError && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Couldn&apos;t load the news feed right now ({loadError}). Please
            try again shortly.
          </div>
        )}

        {data?.warnings?.length > 0 && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Some sources were unavailable: {data.warnings.join(" · ")}
          </div>
        )}

        {!loadError && items.length === 0 ? (
          <p className="text-sm text-slate-500">
            No headlines available right now — please check back shortly.
          </p>
        ) : (
          <NewsFeed items={items} />
        )}
      </section>
    </>
  );
}
