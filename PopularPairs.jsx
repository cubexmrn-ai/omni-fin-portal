import Link from "next/link";

const CLASS_BADGE = {
  fiat: "bg-blue-50 text-blue-700",
  crypto: "bg-amber-50 text-amber-700",
  metals: "bg-orange-50 text-orange-700",
};

/**
 * Internal cross-linking block for the bottom of a converter SEO page
 * (app/converters/[pair]/page.jsx) — "Popular Currency & Metal Pairs."
 * Helps search engines discover the other programmatic routes and
 * keeps visitors on-site. Excludes whichever pair is already showing.
 */
export default function PopularPairs({ pairs, currentSlug }) {
  const items = pairs.filter((p) => p.slug !== currentSlug).slice(0, 8);
  if (items.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-sm font-semibold text-slate-900">
        Popular Currency &amp; Metal Pairs
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((pair) => (
          <Link
            key={pair.slug}
            href={`/converters/${pair.slug}`}
            className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="flex flex-col">
              <span className="font-semibold text-slate-800 group-hover:text-brand-700">
                {pair.fromCode} → {pair.toCode}
              </span>
              <span className="text-[11px] text-slate-400">{pair.title}</span>
            </span>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                CLASS_BADGE[pair.fromClass] || "bg-slate-100 text-slate-500"
              }`}
            >
              {pair.fromClass}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
