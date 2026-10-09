import Link from "next/link";
import { fetchNews } from "@/lib/fetchNews";

export const metadata = {
  title: "AI News Feed | OmniFin Portal",
  description:
    "Live finance headlines aggregated from multiple sources, with AI-generated summaries arriving soon.",
};

export const revalidate = 900; // Align with /api/news-ai's ISR cache.

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export default async function AiNewsPage() {
  let data = null;
  let loadError = null;

  try {
    data = await fetchNews();
  } catch (err) {
    loadError = err.message;
  }

  const items = data?.items || [];

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/market-analysis" className="hover:text-brand-600">
              Market Analysis
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">AI News</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            AI News Feed
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Live finance headlines, refreshed every 15 minutes.
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

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
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

        <div className="space-y-4">
          {items.map((item, idx) => (
            <article
              key={`${item.link || item.title}-${idx}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                  {item.source}
                </span>
                {item.publishedAt && <span>{timeAgo(item.publishedAt)}</span>}
              </div>

              <h2 className="mt-2 text-base font-semibold text-slate-900">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-700"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h2>

              {item.excerpt && (
                <p className="mt-1.5 text-sm text-slate-500">
                  {item.excerpt}
                  {item.excerpt.length >= 220 ? "…" : ""}
                </p>
              )}

              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8V12L15 15M21 12A9 9 0 113 12A9 9 0 0121 12Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                AI summary coming soon
              </div>
            </article>
          ))}

          {!loadError && items.length === 0 && (
            <p className="text-sm text-slate-500">
              No headlines available right now — please check back shortly.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
