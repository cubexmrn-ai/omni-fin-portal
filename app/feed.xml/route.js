// app/feed.xml/route.js
//
// WEEK 4 — RSS feed for /ai-news (Task 28), served at /feed.xml.
//
// A Route Handler, not a page — RSS needs to be raw XML with its own
// content type, not HTML. Hand-writes valid RSS 2.0 XML: there is no
// npm registry access in this sandbox to install an RSS-building
// library, and the format is simple enough to construct directly from
// the exact same getAggregatedNews() data already powering /ai-news and
// NewsStructuredData.jsx — so the feed is never a separate, divergent
// source of truth from what's on the page.
//
// revalidate matches the aggregator's own cache window so this doesn't
// hit the upstream feeds any more often than the page itself does.

import { getAggregatedNews } from "@/lib/newsAggregator";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 900;

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date string RSS <pubDate> requires; falls back to "now" for
 * an item whose source feed didn't supply a parseable date, rather than
 * omitting <pubDate> (some readers sort undated items oddly). */
function toRfc822(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  const d = Number.isNaN(date.getTime()) ? new Date() : date;
  return d.toUTCString();
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}/feed.xml`;
  const pageUrl = `${siteUrl}/ai-news`;

  let items = [];
  try {
    const news = await getAggregatedNews();
    items = news.items || [];
  } catch {
    items = [];
  }

  const itemsXml = items
    .map((item) => {
      const link = escapeXml(item.link);
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(item.publishedAt)}</pubDate>
      <source url="${escapeXml(item.link)}">${escapeXml(item.source)}</source>
      <description>${escapeXml(item.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuildDate = items[0]?.publishedAt
    ? toRfc822(items[0].publishedAt)
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OmniFin Portal — AI &amp; Market News</title>
    <link>${escapeXml(pageUrl)}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>Aggregated financial, crypto, and market-moving news headlines from OmniFin Portal, with rule-based sentiment tagging.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
