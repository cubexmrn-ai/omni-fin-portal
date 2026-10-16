// app/ai-news/loading.jsx
//
// Same fix, same root cause as app/market-analysis/loading.jsx's header
// comment explains in full: this page's default export sequentially
// awaits getCachedAggregatedNews() and getUnifiedRates() before
// rendering anything, now that it's `force-dynamic` (see page.jsx's
// own comment for why that conversion happened). With no loading.js,
// a cold/expired cache made
// clicking the News nav link look like it did nothing for however long
// those calls took (up to the page's 120s maxDuration) — this file
// gives Next.js an instant skeleton to show the moment navigation
// starts, so the click always has visible feedback right away. Mirrors
// this page's real section layout (hero -> explorer tiers -> sentiment
// -> economic calendar) so the swap-in doesn't jump around.
export default function AiNewsLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-4 h-8 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-5 h-10 w-80 rounded-lg bg-slate-200" />
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <div className="h-16 w-full rounded-xl bg-slate-200" />
          <div className="mt-6 h-10 w-full rounded-xl bg-slate-200" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl border border-slate-200 bg-white p-4">
                <div className="h-3 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-28 w-full rounded-xl border border-slate-200 bg-white" />
        <div className="h-96 w-full rounded-xl border border-slate-200 bg-white" />
      </section>
    </div>
  );
}
