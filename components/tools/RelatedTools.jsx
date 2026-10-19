// components/tools/RelatedTools.jsx
//
// Shared "Related Tools" cross-link widget for the Utility Tools Suite
// (app/tools/*) — Phase 3 of the utility-suite roadmap calls for every
// new tool page to cross-link logically to existing financial tools,
// converters, and blog guides, rather than sitting as an island. Takes
// a plain { href, label }[] so each page decides what's actually
// relevant instead of this component guessing.

import Link from "next/link";

export default function RelatedTools({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-900">Related tools &amp; guides</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            {item.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
