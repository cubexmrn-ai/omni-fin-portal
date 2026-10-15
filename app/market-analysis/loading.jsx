// app/market-analysis/loading.jsx
//
// FIX for the "Market Analysis link doesn't redirect" bug report: this
// page's default export is an async server component that sequentially
// awaits 3 real data calls (getCachedYoutubeAutomationFeed,
// getCachedSentimentEngineSnapshot, getUnifiedRates) before it can
// render anything — a side effect of converting this page to
// `force-dynamic` earlier in this project to fix a *different* bug (the
// Vercel build-time static-generation timeout; see page.jsx's own
// comment). Without a loading.js file, Next.js's App Router has no
// "instant" UI to show while a dynamic page's data is still loading, so
// clicking the nav link visually did nothing for however long the
// cached wrapper took to resolve (instant on a warm cache; up to tens
// of seconds on a cold/expired one, since `maxDuration` allows up to
// 120s) — which reads exactly like "the link is broken," even though
// navigation was actually in progress the whole time.
//
// This file is Next.js's built-in mechanism for exactly this situation:
// it's shown immediately on navigation (before the route's async
// Server Component starts resolving its data), so the click always has
// instant visible feedback regardless of how long the underlying fetch
// takes. It intentionally mirrors this page's real section layout
// (hero -> explorer -> Macro Sentiment Engine -> overview board) so the
// swap-in when real content arrives doesn't jump around.
export default function MarketAnalysisLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-4 h-8 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-10 w-full rounded-xl bg-slate-200" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-3 h-24 w-full rounded bg-slate-100" />
              <div className="mt-3 h-3 w-3/4 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-4 w-56 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-96 rounded bg-slate-200" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-80 w-full rounded-xl border border-slate-200 bg-white" />
      </section>
    </div>
  );
}
