"use client";

// components/embed/WidgetGenerator.jsx
//
// Client-side UI for app/embed/page.jsx — lets a visitor pick a pair
// (from the same curated FEATURED_PAIRS catalog used by the Popular
// Pairs cross-linking block), optional starting amount and theme, and
// get a ready-to-paste <iframe> snippet pointing at the no-chrome
// widget served by app/embed/converter/route.js. This component never
// talks to the network itself — the actual conversion happens entirely
// inside the iframe, server-rendered per-request by the route handler.

import { useMemo, useState } from "react";

export default function WidgetGenerator({ pairs, siteUrl }) {
  const [slug, setSlug] = useState(pairs[0]?.slug || "usd-to-pkr");
  const [amount, setAmount] = useState("100");
  const [theme, setTheme] = useState("light");
  const [copied, setCopied] = useState(false);

  const selected = pairs.find((p) => p.slug === slug) || pairs[0];

  const embedSrc = useMemo(() => {
    const params = new URLSearchParams({
      from: selected.fromCode,
      to: selected.toCode,
      theme,
    });
    const parsedAmount = Number.parseFloat(amount);
    if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
      params.set("amount", String(parsedAmount));
    }
    return `${siteUrl}/embed/converter?${params.toString()}`;
  }, [selected, amount, theme, siteUrl]);

  const snippet = `<iframe src="${embedSrc}" width="320" height="180" style="border:0;border-radius:12px;overflow:hidden;" loading="lazy" title="${selected.fromCode} to ${selected.toCode} converter — OmniFin Portal"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the
      // snippet is still selectable/copyable by hand from the <pre>.
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">1. Configure your widget</h2>

        <label className="mt-4 block text-xs font-semibold text-slate-500" htmlFor="widget-pair">
          Currency / metal / crypto pair
        </label>
        <select
          id="widget-pair"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        >
          {pairs.map((pair) => (
            <option key={pair.slug} value={pair.slug}>
              {pair.fromCode} → {pair.toCode} ({pair.title})
            </option>
          ))}
        </select>

        <label className="mt-4 block text-xs font-semibold text-slate-500" htmlFor="widget-amount">
          Starting amount (optional)
        </label>
        <input
          id="widget-amount"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        />

        <label className="mt-4 block text-xs font-semibold text-slate-500">Theme</label>
        <div className="mt-1.5 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded-full px-3 py-1 capitalize transition-colors ${
                theme === t ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-semibold text-slate-900">2. Copy the embed code</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2.5 text-[11px] leading-relaxed text-slate-100">
          {snippet}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {copied ? "Copied!" : "Copy embed code"}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          Paste this HTML anywhere on your site that accepts embeddable widgets. The widget
          includes a small, always-visible &quot;Powered by OmniFin Portal&quot; credit link —
          please keep it in place.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Live preview</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <iframe
            key={embedSrc}
            src={embedSrc}
            width="100%"
            height="180"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            title={`${selected.fromCode} to ${selected.toCode} converter preview`}
          />
        </div>
      </div>
    </div>
  );
}
