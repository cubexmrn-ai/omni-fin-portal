// app/api/news-ai/route.js
//
// Thin HTTP wrapper around lib/newsAggregator.js's getAggregatedNews().
// This route exists for any external or client-side caller that wants
// the news feed over HTTP; app/ai-news/page.jsx itself calls
// getAggregatedNews() directly during server-side rendering rather than
// fetching this route by URL — see the comment at the top of
// lib/newsAggregator.js for exactly why that self-fetch was the root
// cause of the page breaking with an "Unexpected token '<' ... DOCTYPE"
// JSON-parse error in production.
//
// The try/catch below is a last-resort safety net: getAggregatedNews()
// is already designed to never throw (every feed has its own try/catch,
// and a total outage falls back to static mock items), but if something
// truly unexpected still happens, this guarantees the route ALWAYS
// returns a valid JSON body — never Next.js's default HTML error page —
// so a caller's res.json() never breaks here again.
//
// CURRENT PHASE: no Anthropic API key is configured yet, so each item's
// `summary` field is intentionally null and carries a
// `summaryStatus: "pending_ai_key"` flag — the UI renders this as an
// "AI summary coming soon" placeholder. Each item DOES already carry a
// rule-based `sentiment` (Bullish/Bearish/Neutral) from a keyword scan —
// that one needs no API key and is always computed (see
// computeSentiment() in lib/newsAggregator.js).
//
// NEXT PHASE (once an API key is available): for each item, send the
// `description`/content through the Claude API (Messages API) with a
// short prompt such as "Summarize this financial news headline and its
// 1-2 sentence takeaway for a retail investor" and store the result in
// `summary`. That call belongs in lib/newsAggregator.js's
// parseRssItems()/getAggregatedNews() — the TODO comment there marks
// the spot; the RSS fetch/parse/caching plumbing does not need to change.

import { NEWS_REVALIDATE_SECONDS } from "@/lib/newsAggregator";
import { getCachedAggregatedNews } from "@/lib/cachedData";

// `force-dynamic` stops Next.js from attempting to statically
// prerender this route at build time — same build-time static
// generation that started timing out elsewhere once a real paid
// GEMINI_API_KEY made per-headline AI summarization actually run (see
// app/api/sentiment-engine/route.js's comment for the fuller
// explanation). Calling the cached wrapper (lib/cachedData.js) means a
// direct hit on this route shares the same cached result the pages
// use, instead of re-summarizing every headline on every request.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const responseBody = await getCachedAggregatedNews();

    return Response.json(responseBody, {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${NEWS_REVALIDATE_SECONDS}, stale-while-revalidate=59`,
      },
    });
  } catch (err) {
    // Should be unreachable (see comment above), but guarantees JSON
    // over an HTML error page no matter what.
    return Response.json(
      {
        items: [],
        usingMockFallback: true,
        sentimentTally: { Bullish: 0, Bearish: 0, Neutral: 0 },
        assetSentimentBreakdown: {},
        aiSummarization: { enabled: false, status: "error", note: null },
        fetchedAt: new Date().toISOString(),
        revalidateSeconds: NEWS_REVALIDATE_SECONDS,
        warnings: [`news-ai route failed unexpectedly: ${err.message || "unknown error"}`],
      },
      { status: 200 }
    );
  }
}
