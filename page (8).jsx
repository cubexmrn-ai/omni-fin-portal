import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import SocialBuzzTracker from "@/components/SocialBuzzTracker";
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
  const sentimentTally = data?.sentimentTally || { Bullish: 0, Bearish: 0, Neutral: 0 };
  const sentimentTotal =
    sentimentTally.Bullish + sentimentTally.Bearish + sentimentTally.Neutral;
  const assetSentimentBreakdown = data?.assetSentimentBreakdown || {};
  const assetBreakdownEntries = Object.entries(assetSentimentBreakdown).sort(
    (a, b) => b[1].Bullish + b[1].Bearish + b[1].Neutral - (a[1].Bullish + a[1].Bearish + a[1].Neutral)
  );

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

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Headline Sentiment by Asset</h2>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                Rule-based
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              A keyword scan of the {sentimentTotal} headlines below, broken down by which
              instrument each one appears to impact — not AI-generated.
            </p>

            {assetBreakdownEntries.length === 0 ? (
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
                None of the current headlines were keyword-matched to a specific asset.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {assetBreakdownEntries.map(([asset, counts]) => {
                  const total = counts.Bullish + counts.Bearish + counts.Neutral;
                  return (
                    <div key={asset} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 truncate text-xs font-semibold text-slate-600">
                        {asset}
                      </span>
                      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${(counts.Bullish / total) * 100}%` }}
                          title={`Bullish ${counts.Bullish}`}
                        />
                        <div
                          className="h-full bg-slate-300"
                          style={{ width: `${(counts.Neutral / total) * 100}%` }}
                          title={`Neutral ${counts.Neutral}`}
                        />
                        <div
                          className="h-full bg-rose-400"
                          style={{ width: `${(counts.Bearish / total) * 100}%` }}
                          title={`Bearish ${counts.Bearish}`}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right text-[11px] text-slate-400">
                        {counts.Bullish}B / {counts.Neutral}N / {counts.Bearish}Be
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <SocialBuzzTracker />
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
