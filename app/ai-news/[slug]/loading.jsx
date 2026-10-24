// app/ai-news/[slug]/loading.jsx
//
// Without this, Next.js would fall back to the parent
// app/ai-news/loading.jsx skeleton (shaped for the hub's wide
// multi-column layout) while this narrower single-column permalink
// page's own async lookups (getCachedAggregatedNews() via the shared
// cache() in page.jsx, getUnifiedRates()) resolve — a visible layout
// mismatch for a moment, not a functional bug, but one line of file
// avoids it entirely.
export default function AiNewsItemLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="mt-4 h-7 w-full rounded bg-slate-200" />
          <div className="mt-2 h-7 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-40 rounded bg-slate-100" />
          <div className="mt-5 h-9 w-56 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-32 rounded-xl border border-slate-100 bg-slate-100" />
      </div>
    </div>
  );
}
