// lib/youtubeAutomation.js
//
// Standalone YouTube ingestion automation pipeline: tracks a small list
// of finance/trading YouTube channels & videos, pulls recent uploads,
// and "extracts" a structured blog-post-style insight post from each
// one (technical levels + fundamental takeaways).
//
// DELIBERATELY FRAMEWORK-AGNOSTIC: this file has zero Next.js imports
// and zero Request/Response dependency — only plain exported async
// functions using the built-in `fetch`/`AbortController`. Both the API
// route (app/api/youtube-automation/route.js) and any server component
// call `getYoutubeAutomationFeed()` directly, the same architectural
// pattern as lib/newsAggregator.js (see the big comment at the top of
// that file for why a server component self-fetching its own API route
// over HTTP is a production footgun on Next.js/Vercel). This module is
// written to be copy-pasted into another project as a standalone tool
// with no changes beyond the two env var names it reads
// (YOUTUBE_API_KEY, ANTHROPIC_API_KEY).
//
// HONESTY NOTE (same bar as lib/newsAggregator.js / lib/socialBuzz.js):
// - With no YOUTUBE_API_KEY configured, every tracked source falls back
//   to a small set of deterministic MOCK video entries, clearly flagged
//   `isMock: true`. Nothing here ever pretends a mock video is real.
// - With no ANTHROPIC_API_KEY configured (or if the Claude call fails
//   for any reason), each post is built by a simple rule-based/
//   templated extraction off the video's title/metadata instead of an
//   LLM call, and is labeled `usingAi: false` with an honest note — it
//   never silently claims to be AI-written when it isn't.
// - Builds/requests never fail because of a missing key: every network
//   call (YouTube Data API, Claude Messages API) is wrapped in its own
//   try/catch with a hard timeout, and one bad source/video can never
//   take down the whole pipeline.

const FETCH_TIMEOUT_MS = 8000;
const CLAUDE_MODEL = "claude-sonnet-4-5"; // placeholder model string — swap once an exact model is pinned
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// ---------------------------------------------------------------------------
// Tracked sources config — a small, hand-editable list. Each entry is
// either a channel (recent uploads are pulled) or a single direct
// video. These are just the default tracked-source config seeded with
// plausible, well-known finance/trading/macro YouTube channels split
// across both site categories — NOT live-verified channel IDs; swap in
// real channel IDs/URLs for production use.
// ---------------------------------------------------------------------------
export const TRACKED_YOUTUBE_SOURCES = [
  {
    id: "trading-212-macro",
    type: "channel",
    url: "https://www.youtube.com/@TradingView",
    label: "TradingView",
    category: "market-analysis",
  },
  {
    id: "macro-voices",
    type: "channel",
    url: "https://www.youtube.com/@MacroVoices",
    label: "Macro Voices",
    category: "market-analysis",
  },
  {
    id: "the-plain-bagel",
    type: "channel",
    url: "https://www.youtube.com/@ThePlainBagel",
    label: "The Plain Bagel",
    category: "ai-news",
  },
  {
    id: "bloomberg-markets",
    type: "channel",
    url: "https://www.youtube.com/@markets",
    label: "Bloomberg Markets and Finance",
    category: "ai-news",
  },
];

// ---------------------------------------------------------------------------
// Deterministic mock video catalog — one small, fixed set of plausible
// video entries per tracked source, used whenever YOUTUBE_API_KEY is
// absent or the live API call fails for that source. Clearly flagged
// `isMock: true` wherever it flows downstream, same honesty-labeling
// convention as MOCK_FALLBACK_ITEMS in lib/newsAggregator.js.
// ---------------------------------------------------------------------------
function mockVideosForSource(source) {
  const base = [
    {
      videoId: `mock-${source.id}-1`,
      title: `${source.label}: Weekly market outlook and key levels to watch`,
      description:
        "A rundown of this week's price action across major indices, gold, and the dollar, with support/resistance zones and the macro data on deck.",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      videoId: `mock-${source.id}-2`,
      title: `${source.label}: Fed policy path and what it means for risk assets`,
      description:
        "Breaking down the latest central bank commentary and how traders are positioning across equities, rates, and crypto heading into the next session.",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      videoId: `mock-${source.id}-3`,
      title: `${source.label}: Technical setup review — breakouts, pullbacks, and pivots`,
      description:
        "A chart-by-chart technical review covering recent breakouts, failed breakdowns, and the key pivot levels in play for the coming week.",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    },
  ];
  return base.map((v) => ({ ...v, isMock: true }));
}

function withTimeout(signalMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), signalMs);
  return { controller, timeout };
}

/** Best-effort extraction of a YouTube channel handle/id from a tracked URL. */
function extractChannelHandle(url) {
  const match = url.match(/youtube\.com\/@([\w.-]+)/i);
  return match ? match[1] : null;
}

/** Best-effort extraction of a direct video id from a tracked video URL. */
function extractVideoId(url) {
  const watchMatch = url.match(/[?&]v=([\w-]{6,})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([\w-]{6,})/i);
  return shortMatch ? shortMatch[1] : null;
}

/**
 * Attempts a real YouTube Data API v3 call for one tracked source:
 * - "channel" sources: resolve the handle via `channels.list
 *   (forHandle)`, then list recent uploads via `search.list`.
 * - "video" sources: fetch the single video's snippet via
 *   `videos.list`.
 * Never throws — any failure (missing key, network error, bad
 * response, timeout) resolves to `null` so the caller falls back to
 * mock data for that source only, never breaking the whole pipeline.
 */
async function fetchLiveVideosForSource(source, apiKey) {
  const { controller, timeout } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    if (source.type === "video") {
      const videoId = extractVideoId(source.url);
      if (!videoId) return null;

      const videoRes = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=snippet&id=${encodeURIComponent(videoId)}&key=${apiKey}`,
        { signal: controller.signal }
      );
      if (!videoRes.ok) throw new Error(`videos.list responded with ${videoRes.status}`);
      const videoJson = await videoRes.json();
      const item = videoJson?.items?.[0];
      if (!item) return [];

      return [
        {
          videoId: item.id,
          title: item.snippet?.title || "Untitled video",
          description: item.snippet?.description || "",
          publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
          isMock: false,
        },
      ];
    }

    // "channel" source: resolve the handle to a channel id first.
    const handle = extractChannelHandle(source.url);
    if (!handle) return null;

    const channelRes = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`,
      { signal: controller.signal }
    );
    if (!channelRes.ok) throw new Error(`channels.list responded with ${channelRes.status}`);
    const channelJson = await channelRes.json();
    const channelId = channelJson?.items?.[0]?.id;
    if (!channelId) return null;

    const searchRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${encodeURIComponent(
        channelId
      )}&order=date&maxResults=3&type=video&key=${apiKey}`,
      { signal: controller.signal }
    );
    if (!searchRes.ok) throw new Error(`search.list responded with ${searchRes.status}`);
    const searchJson = await searchRes.json();
    const items = Array.isArray(searchJson?.items) ? searchJson.items : [];

    return items.map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title || "Untitled video",
      description: item.snippet?.description || "",
      publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
      isMock: false,
    })).filter((v) => v.videoId);
  } catch {
    // Any failure for this one source falls through to mock data for
    // it — never throws, never breaks the overall pipeline.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function slugify(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "untitled-video";
}

// ---------------------------------------------------------------------------
// Rule-based/templated extraction — a simple string-templating pass
// over the video's title/description, deliberately NOT an LLM call.
// Used whenever ANTHROPIC_API_KEY is absent or the Claude call fails.
// Still produces a complete, well-formed post body so the page is never
// left with a missing/empty post. Mirrors the "coming soon"/rule-based
// honesty labeling already used throughout this project (see
// computeSentiment() in lib/newsAggregator.js and generateAiAnalysis()
// in app/api/market-ai/route.js).
// ---------------------------------------------------------------------------
function templatedExtraction(video, source) {
  const headline = `${video.title}`;
  const body = [
    `${source.label} published "${video.title}" on ${new Date(
      video.publishedAt
    ).toLocaleDateString()}. Based on the video's title and description, this appears to cover current market conditions relevant to ${source.category.replace(
      "-",
      " "
    )}.`,
    video.description
      ? `Summary of the published description: ${video.description.slice(0, 280)}${
          video.description.length > 280 ? "…" : ""
        }`
      : "No further description was published alongside this video.",
    "This is a template-generated placeholder summary, not an AI-written analysis of the video's actual spoken content — no transcript or audio processing is performed here.",
  ];

  return {
    headline,
    body: body.join("\n\n"),
    keyLevels: [
      "Key levels not available — enable AI extraction to generate level estimates",
      "Enable ANTHROPIC_API_KEY to extract technical levels mentioned in the video",
    ],
    fundamentalInsights: [
      "Fundamental insights not available from template-based extraction",
    ],
  };
}

/**
 * Attempts a real Claude API call to extract structured insights
 * (headline, 2-3 paragraph body, key levels, fundamental insights) from
 * a video's title/description. Returns `null` on any failure (missing
 * key, network error, bad response, timeout, unparsable output) so the
 * caller falls back to templatedExtraction() — never throws.
 */
async function aiExtraction(video, source, apiKey) {
  const { controller, timeout } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const prompt = `You are a financial content editor. Given a YouTube video's title and description, write a short structured blog-post-style summary for a finance news site.

Video title: "${video.title}"
Video description: "${(video.description || "").slice(0, 600)}"
Source channel: "${source.label}"
Site category: "${source.category}"

Respond with ONLY valid JSON (no markdown fences) in exactly this shape:
{"headline": "string", "body": "2-3 paragraph string", "keyLevels": ["string", "..."], "fundamentalInsights": ["string", "..."]}

Infer plausible technical levels and fundamental insights from the title/description context — note in the body that these are inferred from the video's metadata, not a transcript.`;

    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API responded with ${res.status}`);

    const json = await res.json();
    const text = json?.content?.[0]?.text;
    if (!text) throw new Error("Anthropic API returned no text content");

    const parsed = JSON.parse(text.trim().replace(/^```json\s*|\s*```$/g, ""));
    if (!parsed.headline || !parsed.body) throw new Error("Malformed AI extraction JSON");

    return {
      headline: parsed.headline,
      body: parsed.body,
      keyLevels: Array.isArray(parsed.keyLevels) ? parsed.keyLevels : [],
      fundamentalInsights: Array.isArray(parsed.fundamentalInsights)
        ? parsed.fundamentalInsights
        : [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Builds one complete post object for a single video, attempting the
 * AI extraction path first (if ANTHROPIC_API_KEY is configured) and
 * always falling back to the templated path on any failure. Never
 * throws.
 */
async function buildPost(video, source, hasAnthropicKey) {
  let extraction = null;
  let usingAi = false;

  if (hasAnthropicKey) {
    extraction = await aiExtraction(video, source, process.env.ANTHROPIC_API_KEY);
    if (extraction) usingAi = true;
  }

  if (!extraction) {
    extraction = templatedExtraction(video, source);
    usingAi = false;
  }

  const sourceVideoUrl = video.videoId?.startsWith("mock-")
    ? source.url
    : `https://www.youtube.com/watch?v=${video.videoId}`;

  return {
    id: `${source.id}-${video.videoId}`,
    title: extraction.headline,
    slug: slugify(extraction.headline),
    category: source.category,
    sourceLabel: source.label,
    sourceUrl: source.url,
    sourceVideoTitle: video.title,
    sourceVideoUrl,
    publishedAt: video.publishedAt,
    summary: extraction.body.split("\n\n")[0] || extraction.body.slice(0, 220),
    keyLevels: extraction.keyLevels,
    fundamentalInsights: extraction.fundamentalInsights,
    body: extraction.body,
    generatedAt: new Date().toISOString(),
    usingAi,
    isMock: Boolean(video.isMock),
  };
}

/**
 * Fetches recent videos for every tracked source (live YouTube Data API
 * when YOUTUBE_API_KEY is configured and reachable, mock data
 * otherwise/on failure), extracts a structured post for each video
 * (real Claude API call when ANTHROPIC_API_KEY is configured and
 * reachable, templated extraction otherwise/on failure), and returns
 * one merged, date-sorted feed. Never throws: every network call above
 * is individually guarded, and a missing/invalid key for either
 * integration degrades gracefully rather than breaking the pipeline or
 * the build.
 */
export async function getYoutubeAutomationFeed() {
  const hasYoutubeKey = Boolean(process.env.YOUTUBE_API_KEY);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

  let anyLiveYoutubeSucceeded = false;

  const videosBySource = await Promise.all(
    TRACKED_YOUTUBE_SOURCES.map(async (source) => {
      let videos = null;

      if (hasYoutubeKey) {
        videos = await fetchLiveVideosForSource(source, process.env.YOUTUBE_API_KEY);
        if (videos && videos.length > 0) anyLiveYoutubeSucceeded = true;
      }

      if (!videos || videos.length === 0) {
        videos = mockVideosForSource(source);
      }

      return { source, videos };
    })
  );

  let anyAiExtractionSucceeded = false;

  const postLists = await Promise.all(
    videosBySource.map(async ({ source, videos }) => {
      return Promise.all(
        videos.map(async (video) => {
          const post = await buildPost(video, source, hasAnthropicKey);
          if (post.usingAi) anyAiExtractionSucceeded = true;
          return post;
        })
      );
    })
  );

  const posts = postLists.flat();

  posts.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  const usingLiveYoutubeApi = hasYoutubeKey && anyLiveYoutubeSucceeded;
  const usingAiExtraction = hasAnthropicKey && anyAiExtractionSucceeded;

  let note;
  if (!hasYoutubeKey && !hasAnthropicKey) {
    note =
      "No YOUTUBE_API_KEY or ANTHROPIC_API_KEY is configured — showing deterministic mock videos with template-generated summaries. Configure both env vars to pull real uploads and AI-extracted insights.";
  } else if (hasYoutubeKey && !usingLiveYoutubeApi) {
    note =
      "A YOUTUBE_API_KEY is configured, but the live YouTube Data API call failed for every tracked source — showing mock videos instead. Check the key and tracked channel handles in lib/youtubeAutomation.js.";
  } else if (!hasYoutubeKey) {
    note =
      "No YOUTUBE_API_KEY is configured — showing deterministic mock videos. Configure it to pull real recent uploads from the tracked channels.";
  } else if (hasAnthropicKey && !usingAiExtraction) {
    note =
      "Live YouTube data is in use, but the Claude API extraction call failed for every video — showing template-generated summaries instead. Check the ANTHROPIC_API_KEY.";
  } else if (!hasAnthropicKey) {
    note =
      "Live YouTube data is in use, with template-generated (non-AI) summaries. Configure ANTHROPIC_API_KEY to generate real AI-extracted insights per video.";
  } else {
    note = "Live YouTube data and AI-extracted insights are both active.";
  }

  return {
    posts,
    usingLiveYoutubeApi,
    usingAiExtraction,
    generatedAt: new Date().toISOString(),
    note,
  };
}
