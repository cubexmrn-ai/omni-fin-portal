// app/loading.jsx
//
// Same fix, same reasoning as app/market-analysis/loading.jsx's header
// comment: app/page.jsx is also `export const dynamic = "force-dynamic"`
// (converted for the same build-time timeout fix — see its own
// comment) and awaits getUnifiedRates() + getCachedSentimentEngineSnapshot()
// before rendering anything. Without this file, a cold/expired cache
// hit on "/" would give the same "nothing visibly happens" symptom on
// the Home link that Market Analysis/News had. Added proactively here
// as part of the site-wide audit, even though it wasn't the page
// reported as broken — same root cause class, same cheap fix.
export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="h-8 w-full rounded-lg bg-slate-200" />
      </div>

      <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="h-4 w-48 rounded bg-slate-200" />
          <div className="mt-4 h-10 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-64 w-full rounded-xl border border-slate-200 bg-white" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
