// components/BreadcrumbStructuredData.jsx
//
// Generic, reusable BreadcrumbList JSON-LD — takes `items`, an ordered
// array of { name, href } from the site root down to the current page
// (href is a path relative to the site, e.g. "/converters"). Every
// crumb — including the last one, representing the current page —
// must carry a real, resolvable `href`: although schema.org's spec
// treats the final item's `item` field as optional, Google Search
// Console now reports an itemListElement entry with no `item` as an
// outright error ("Missing field 'item'"), so in practice every entry
// needs one. A caller for the current page should simply pass that
// page's own canonical path as its href (see app/ai-news/[slug]/
// page.jsx for the Oct 2026 fix that found and corrected the one call
// site that didn't). If a crumb genuinely has no real URL to link to
// (e.g. a client-side-only tab/filter with nothing to deep-link), the
// right fix is to leave that crumb out of the array entirely — never
// include a name with no href, since that silently produces the exact
// GSC error above. Absolute URLs are built from lib/siteUrl.js's
// getSiteUrl(), same as every other structured-data file in this
// project, so these always resolve to the canonical production domain.
//
// Used on every programmatic SEO "detail" route that sits below a hub
// page — currency/crypto/metals pair pages, unit converter pairs,
// Academy lesson pages, blog guides, and AI News permalinks — so
// Google can render a breadcrumb trail in the search snippet instead
// of the raw URL.

import { getSiteUrl } from "@/lib/siteUrl";

export default function BreadcrumbStructuredData({ items }) {
  if (!items || items.length === 0) return null;
  const siteUrl = getSiteUrl();

  // Every entry gets a real `item` URL — a crumb without a usable
  // `href` is dropped from the list rather than emitted with a
  // missing/undefined `item` field (which is exactly what triggered
  // GSC's "Missing field 'item'" error before this fix).
  const validCrumbs = items.filter((crumb) => Boolean(crumb.href));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: validCrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
