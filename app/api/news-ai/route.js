// app/api/news-ai/route.js
//
// Serverless route for Module 2 (Market AI & News Aggregator).
//
// CURRENT PHASE: fetches finance RSS feeds and returns plain headlines.
// No Anthropic API key is configured yet, so each item's `summary` field
// is intentionally null and carries a `summaryStatus: "pending_ai_key"`
// flag — the UI renders this as a "AI summary coming soon" placeholder.
//
// NEXT PHASE (once an API key is available): for each item, send the
// `description`/content through the Claude API (Messages API) with a
// short prompt such as "Summarize this financial news headline and its
// 1-2 sentence takeaway for a retail investor" and store the result in
// `summary`. That call belongs right where the TODO comment is below —
// the RSS fetch/parse/caching plumbing here does not need to change.

const REVALIDATE_SECONDS = 900;
const MAX_ITEMS = 20;

// Public, no-auth-required finance RSS feeds.
const FEEDS = [
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex" },
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
  },
  {
    name: "CNBC Markets",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  },
];

function decodeEntities(text) {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Minimal, dependency-free RSS 2.0 parser. Good enough for standard
 * <item> feeds; not a full XML parser, but avoids pulling in an extra
 * package for a handful of regex-extractable fields.
 */
function parseRssItems(xml, sourceName) {
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const block of itemBlocks) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link") || extractTag(block, "guid");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date");
    const rawDescription =
      extractTag(block, "description") || extractTag(block, "content:encoded");

    if (!title) continue;

    items.push({
      title,
      link: link.trim(),
      source: sourceName,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
      excerpt: stripHtml(rawDescription).slice(0, 220),
      // --- Placeholder for Phase 2 AI summarization ---
      summary: null,
      summaryStatus: "pending_ai_key",
      // TODO (Phase 2, once EXCHANGERATE_API_KEY-style ANTHROPIC_API_KEY
      // is configured): call the Claude API here with `excerpt` and set
      // `summary` + `summaryStatus: "ready"` on the returned item.
    });
  }

  return items;
}

async function fetchFeed(feed) {
  // A hard timeout so one slow/hanging RSS host can't stall the whole
  // aggregator (or a Vercel build doing static prerendering) — same
  // guard used for the three providers in app/api/rates/route.js.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(feed.url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
      headers: {
        // Some finance RSS endpoints reject requests with no UA header.
        "User-Agent":
          "Mozilla/5.0 (compatible; OmniFinPortalBot/1.0; +https://omnifinportal.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) throw new Error(`${feed.name} responded with ${res.status}`);

    const xml = await res.text();
    return parseRssItems(xml, feed.name);
  } catch (err) {
    // A single failing feed should never break the whole aggregator.
    return { error: `${feed.name}: ${err.message}` };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const feedResults = await Promise.all(FEEDS.map(fetchFeed));

  const items = [];
  const errors = [];

  for (const result of feedResults) {
    if (Array.isArray(result)) {
      items.push(...result);
    } else if (result?.error) {
      errors.push(result.error);
    }
  }

  items.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  const responseBody = {
    items: items.slice(0, MAX_ITEMS),
    aiSummarization: {
      enabled: false,
      status: "pending_ai_key",
      note:
        "Headlines are live from RSS. AI-generated summaries will appear here once an Anthropic API key is configured on the server.",
    },
    fetchedAt: new Date().toISOString(),
    revalidateSeconds: REVALIDATE_SECONDS,
    ...(errors.length ? { warnings: errors } : {}),
  };

  return Response.json(responseBody, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=59`,
    },
  });
}
