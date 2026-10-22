// components/converters/RelatedAmountLinks.jsx
//
// Internal-linking gap fix (Oct 2026 GSC review — see the matching
// comment on lib/pairSlugs.js's getFeaturedAmountPairsFor()): the bare
// pair page and its own amount-specific pSEO pages never linked to
// each other, so link equity never flowed between a pair and its own
// amount variants. Renders a small, plain-link row — no client state
// needed, unlike PopularPairs' rotating/tabbed grid, since this list
// is always short (a handful of curated amounts per pair at most).
//
// Used two ways:
//   - On the bare pair page (e.g. /converters/aed-to-pkr): shows every
//     curated amount for THIS pair ("100 AED to PKR", "2000 AED to
//     PKR", ...).
//   - On an amount page (e.g. /converters/2000-aed-to-pkr): shows the
//     OTHER curated amounts for the same pair, plus (via
//     `bareHref`/`bareLabel`) a link back up to the bare pair page
//     itself, so the live-rate/any-amount converter is always one
//     click away.
import Link from "next/link";

export default function RelatedAmountLinks({ amountPairs, currentSlug, bareHref, bareLabel }) {
  const items = amountPairs.filter((entry) => entry.slug !== currentSlug);
  if (items.length === 0 && !bareHref) return null;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Common Amounts for This Pair
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {bareHref && (
          <Link
            href={bareHref}
            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400"
          >
            {bareLabel || "Any amount — live converter"} →
          </Link>
        )}
        {items.map((entry) => (
          <Link
            key={entry.slug}
            href={`/converters/${entry.slug}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
          >
            {entry.amount} {entry.fromCode} to {entry.toCode}
          </Link>
        ))}
      </div>
    </div>
  );
}
