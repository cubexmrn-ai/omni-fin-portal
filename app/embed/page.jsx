// app/embed/page.jsx
//
// Embeddable Widget Generator (Week 4, Task 26) — a normal page, so it
// keeps the site's regular layout/chrome/SEO metadata, unlike the
// no-chrome widget itself (app/embed/converter/route.js). Visitors pick
// a pair/amount/theme in components/embed/WidgetGenerator.jsx ("use
// client") and get a copyable <iframe> snippet pointing at that route.

import WidgetGenerator from "@/components/embed/WidgetGenerator";
import { FEATURED_PAIRS } from "@/lib/pairSlugs";
import { getSiteUrl } from "@/lib/siteUrl";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Free Embeddable Currency Converter Widget | OmniFin Portal",
  description:
    "Generate a free, embeddable live currency, crypto, and metals converter widget for your website or blog — pick a pair, copy the iframe code, done.",
  path: "/embed",
});

export default function EmbedGeneratorPage() {
  const siteUrl = getSiteUrl();

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Embeddable Converter Widget
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Add a free, live-updating currency, crypto, or metals converter to your own site
            or blog in one paste — no sign-up, no API key. Pick a pair below and copy the
            embed code.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <WidgetGenerator pairs={FEATURED_PAIRS} siteUrl={siteUrl} />
      </section>
    </>
  );
}
