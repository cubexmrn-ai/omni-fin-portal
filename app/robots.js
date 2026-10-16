// app/robots.js
//
// Next.js App Router's built-in robots convention: a default-exported
// function returning a Robots object. Next.js serves this at
// /robots.txt automatically and derives the "Sitemap:" line from the
// url we return below (same getSiteUrl() used by app/sitemap.js, so
// the two can never point at different hosts).
//
// Allows all crawlers everywhere except the internal Next.js API
// routes (app/api/*) — those return live rate/news/AI data meant to be
// called by this app's own client code, not indexed as pages — the
// Next.js build output folder, which isn't a real route at all — and
// /admin/ as a standing precaution. There is no live route under
// /admin/ right now (the YouTube importer admin panel that used to
// live at /admin/youtube-importer was removed entirely, routes and
// all), but disallowing the whole prefix costs nothing and means any
// future admin page added under it is excluded from crawling/indexing
// by default rather than by having to remember to add it here later.

import { getSiteUrl } from "@/lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
