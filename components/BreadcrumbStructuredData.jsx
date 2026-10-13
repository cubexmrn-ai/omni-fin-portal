// components/BreadcrumbStructuredData.jsx
//
// Generic, reusable BreadcrumbList JSON-LD — takes `items`, an ordered
// array of { name, href } from the site root down to the current page
// (href is a path relative to the site, e.g. "/converters"; the last
// item is the current page and its href is optional since
// BreadcrumbList's final item conventionally omits `item`). Absolute
// URLs are built from lib/siteUrl.js's getSiteUrl(), same as every
// other structured-data file in this project, so these always resolve
// to the canonical production domain.
//
// Used on every programmatic SEO "detail" route that sits below a hub
// page — currency/crypto/metals pair pages, unit converter pairs, and
// Academy lesson pages — so Google can render a breadcrumb trail in
// the search snippet instead of the raw URL.

import { getSiteUrl } from "@/lib/siteUrl";

export default function BreadcrumbStructuredData({ items }) {
  if (!items || items.length === 0) return null;
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
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
