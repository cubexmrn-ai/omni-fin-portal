// app/api/youtube-automation/route.js
//
// Thin HTTP wrapper around lib/youtubeAutomation.js's
// getYoutubeAutomationFeed(). This route exists for any external or
// client-side caller that wants the generated video-insights feed over
// HTTP; server components (app/market-analysis/page.jsx,
// app/ai-news/page.jsx) call getYoutubeAutomationFeed() directly during
// SSR rather than fetching this route by URL — same architectural
// pattern as lib/newsAggregator.js / app/api/news-ai/route.js (see the
// comment at the top of lib/newsAggregator.js for why a server
// component self-fetching its own API route over HTTP is a production
// footgun on Next.js/Vercel).
//
// The try/catch below is a last-resort safety net: getYoutubeAutomationFeed()
// is already designed to never throw (every network call is individually
// guarded, with mock/templated fallbacks), but this guarantees the route
// ALWAYS returns valid JSON, never Next.js's default HTML error page.

import { getYoutubeAutomationFeed } from "@/lib/youtubeAutomation";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const data = await getYoutubeAutomationFeed();

    if (category) {
      return Response.json(
        { ...data, posts: data.posts.filter((p) => p.category === category) },
        { status: 200 }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (err) {
    // Should be unreachable (see comment above), but guarantees JSON
    // over an HTML error page no matter what.
    return Response.json(
      {
        posts: [],
        usingLiveYoutubeApi: false,
        usingAiExtraction: false,
        generatedAt: new Date().toISOString(),
        note: `youtube-automation route failed unexpectedly: ${err.message || "unknown error"}`,
      },
      { status: 200 }
    );
  }
}
