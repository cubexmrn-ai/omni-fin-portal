// components/FAQAccordion.jsx
//
// A generic, reusable FAQ accordion — extracted from the pattern first
// built for app/calculators/page.jsx's "Calculator Guide & Knowledge
// Notes" section, so /converters and /market-analysis (and any future
// page) can get the same visible FAQ UI without re-deriving the fix
// that mattered there: each answer is always rendered into the DOM
// (toggled with the `hidden` attribute) rather than unmounted via
// `{open && ...}`, so every answer is present in the HTML a crawler
// reads, not just whichever one is open by default.
//
// Takes `items: [{ question, answer }]` — plain-text `answer` strings
// (no JSX), so this same array can also be handed straight to a
// FAQPage JSON-LD block elsewhere on the page without re-typing the
// copy and risking the two drifting apart. See
// components/calculators/CalculatorsStructuredData.jsx,
// components/converters/ConvertersFAQStructuredData.jsx and
// components/MarketAnalysisStructuredData.jsx for the schema half of
// that pairing.

"use client";

import { useState } from "react";

function FAQItem({ question, answer, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-blue-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:text-brand-600"
      >
        {question}
        <span className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      <div hidden={!open} className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
        {answer}
      </div>
    </div>
  );
}

export default function FAQAccordion({ title, subtitle, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      {(title || subtitle) && (
        <div className="border-b border-blue-100 px-4 py-3">
          {title && <h2 className="text-sm font-bold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div>
        {items.map((item, i) => (
          <FAQItem key={item.question} question={item.question} answer={item.answer} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}
