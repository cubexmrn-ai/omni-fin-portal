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
//
// GEO / AI-citation booster: the wildcard "*" rule above already
// allows every one of these bots implicitly (there's no narrower rule
// anywhere that would override it), but they're also listed out by
// name below so this allowance is explicit and easy to verify at a
// glance, rather than relying on the absence of a block — GPTBot
// (OpenAI/ChatGPT/SearchGPT), PerplexityBot (Perplexity), ClaudeBot
// (Anthropic/Claude), Google-Extended (Google's AI-training/
// Gemini-grounding opt-in token, separate from the regular Googlebot
// token, which the wildcard rule already covers), and Bytespider
// (ByteDance/TikTok's crawler, added in the Oct 2026 LLMO audit).
const AI_SEARCH_USER_AGENTS = ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "Bytespider"];

import { getSiteUrl } from "@/lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();
  const disallow = ["/api/", "/_next/", "/admin/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: AI_SEARCH_USER_AGENTS,
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
