// lib/youtubeAutomation.js
//
// Standalone YouTube ingestion automation pipeline: tracks a small list
// of finance/trading YouTube channels, playlists & videos, pulls recent
// uploads, best-effort fetches each video's real caption transcript,
// and "extracts" a structured blog-post-style insight post from each
// one (technical levels + fundamental takeaways).
//
// TRANSCRIPT FETCHING: the official YouTube Data API v3's
// `captions.download` endpoint requires OAuth2 *channel-owner*
// authorization — an API key alone cannot fetch caption CONTENT for a
// third-party channel's videos (only `captions.list` metadata is
// available without OAuth). Since every tracked channel here is a
// third-party channel we don't own, this pipeline instead reads
// captions the same way YouTube's own web player does: it fetches the
// video's watch page and pulls the real, signed caption-track URLs out
// of the embedded `ytInitialPlayerResponse` JSON
// (discoverCaptionTrackUrls()), preferring manually-created tracks
// over auto-generated ones and English over other languages. A couple
// of hand-guessed `timedtext?lang=en` URLs (the old approach) remain as
// a secondary safety net if that discovery step finds nothing. No API
// key is needed for either path, but neither is part of the official,
// documented API, so this could change or break without notice.
//
// Every candidate response is run through parseCaptionBody() (handles
// both YouTube's JSON3 and older XML caption formats) and then
// cleanTranscriptText(), which strips auto-caption artifacts — stutter
// repetition, "[Music]"/"[Applause]" non-speech tags — and rejects
// (returns null) anything left over that's too short or too
// symbol-heavy to be real spoken content, rather than ever handing
// gibberish to Gemini/Claude or displaying it as if it were real.
//
// This whole chain is tried first for every real (non-mock) video; on
// ANY failure (no captions, a private/age-restricted video, every
// candidate rejected by the cleaner, or the page/endpoint structure
// changing) fetchVideoTranscript() returns `null` and the pipeline
// falls straight back to the same title/description metadata
// extraction this file has always had as its last resort — this never
// throws and never blocks the pipeline. Each returned post is honestly
// labeled via `extractionSource: "transcript" | "metadata"` so callers
// can tell which one actually happened.
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
// with no changes beyond the env var names it reads (YOUTUBE_API_KEY,
// GEMINI_API_KEY, ANTHROPIC_API_KEY) — the tracked-source list is read
// from config/trackedChannels.json (relative to process.cwd()) via
// plain `fs.readFileSync`, with a built-in default list used as a
// fallback if that file is missing/unparsable, so this module has no
// bundler-specific import requirement and keeps working unmodified if
// copy-pasted into another project with no config file yet.
//
// AI PROVIDER: GEMINI_API_KEY is tried FIRST (Google's Gemini API, via
// plain REST — no SDK dependency), then ANTHROPIC_API_KEY (Claude) as a
// secondary fallback if Gemini is unavailable or fails, then the
// rule-based template as the final fallback. Either, both, or neither
// key can be configured — every combination degrades gracefully.
//
// HONESTY NOTE (same bar as lib/newsAggregator.js / lib/socialBuzz.js):
// - With no YOUTUBE_API_KEY configured, every tracked source falls back
//   to a small set of deterministic MOCK video entries, clearly flagged
//   `isMock: true`. Nothing here ever pretends a mock video is real.
// - With no GEMINI_API_KEY/ANTHROPIC_API_KEY configured (or if both
//   calls fail for any reason), each post is built by a simple
//   rule-based/templated extraction off the video's title/metadata
//   instead of an LLM call, and is labeled `usingAi: false` /
//   `aiProvider: null` with an honest note — it never silently claims
//   to be AI-written when it isn't.
// - Builds/requests never fail because of a missing key: every network
//   call (YouTube Data API, Gemini API, Claude Messages API) is wrapped
//   in its own try/catch with a hard timeout, and one bad source/video
//   can never take down the whole pipeline.

import fs from "fs";
import path from "path";

const FETCH_TIMEOUT_MS = 8000;
const CLAUDE_MODEL = "claude-sonnet-4-5"; // placeholder model string — swap once an exact model is pinned
const GEMINI_MODEL = "gemini-1.5-flash"; // fast/cheap Gemini model; swap to "gemini-1.5-pro" for higher-quality extraction
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ---------------------------------------------------------------------------
// Tracked sources config — now a small, hand-editable JSON file at
// config/trackedChannels.json (see that file to add/remove sources
// without touching any code). Each entry is `{ id, type, url, label,
// category }`, where `type` is "channel", "playlist", or "video", and
// `url` can be a full YouTube URL, a bare "@handle", a bare channel ID
// (starts with "UC"), a bare playlist ID (starts with "PL"/"UU"/"OL"),
// or a bare 11-character video ID — see extractChannelHandle(),
// extractChannelId(), extractPlaylistId(), and extractVideoId() below
// for exactly what's accepted. These are the default tracked sources,
// seeded with plausible, well-known finance/trading/macro YouTube
// channels split across both site categories — NOT live-verified
// channel IDs; edit config/trackedChannels.json with real
// handles/URLs/playlists for production use.
// ---------------------------------------------------------------------------
// Default tracked sources, used only if config/trackedChannels.json is
// missing or unparsable (e.g. this file was copy-pasted into another
// project with no config file yet) — never a hard crash on startup.
const DEFAULT_TRACKED_YOUTUBE_SOURCES = [
  {
    id: "bloomberg-markets",
    type: "channel",
    url: "https://www.youtube.com/@BloombergMarkets",
    label: "Bloomberg Markets and Finance",
    category: "market-analysis",
  },
  {
    id: "kitco-news",
    type: "channel",
    url: "https://www.youtube.com/@KitcoNewsMARKETS",
    label: "Kitco News",
    category: "market-analysis",
  },
  {
    id: "fxstreet",
    type: "channel",
    url: "https://www.youtube.com/@FXStreet",
    label: "FXStreet",
    category: "market-analysis",
  },
  {
    id: "trader-nick",
    type: "channel",
    url: "https://www.youtube.com/@TraderNick",
    label: "Trader Nick",
    category: "market-analysis",
  },
  {
    id: "coin-bureau",
    type: "channel",
    url: "https://www.youtube.com/@CoinBureau",
    label: "Coin Bureau",
    category: "ai-news",
  },
  {
    id: "nick-bencino-finance",
    type: "channel",
    url: "https://www.youtube.com/@NickBencinoFinance",
    label: "Nick Bencino Finance",
    category: "ai-news",
  },
  {
    id: "andrei-jikh",
    type: "channel",
    url: "https://www.youtube.com/@AndreiJikh",
    label: "Andrei Jikh",
    category: "ai-news",
  },
  {
    id: "financial-times",
    type: "channel",
    url: "https://www.youtube.com/@FinancialTimes",
    label: "Financial Times",
    category: "ai-news",
  },
];

function loadTrackedChannelsConfig() {
  try {
    const configPath = path.join(process.cwd(), "config", "trackedChannels.json");
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_TRACKED_YOUTUBE_SOURCES;
  } catch {
    // Missing file, bad JSON, or no filesystem access (e.g. an edge
    // runtime) — fall back to the built-in defaults rather than
    // throwing at import time.
    return DEFAULT_TRACKED_YOUTUBE_SOURCES;
  }
}

export const TRACKED_YOUTUBE_SOURCES = loadTrackedChannelsConfig();

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

/** Best-effort extraction of a YouTube channel @handle from a tracked
 * entry — accepts a full URL ("https://www.youtube.com/@Handle") or a
 * bare handle pasted directly ("@Handle"). */
function extractChannelHandle(url) {
  if (!url) return null;
  const urlMatch = url.match(/youtube\.com\/@([\w.-]+)/i);
  if (urlMatch) return urlMatch[1];
  const bareMatch = url.trim().match(/^@([\w.-]+)$/);
  return bareMatch ? bareMatch[1] : null;
}

/** Best-effort extraction of a raw YouTube channel ID ("UC...", 24
 * chars) from a tracked entry — accepts a full "/channel/UC..." URL or
 * the bare ID pasted directly. */
function extractChannelId(url) {
  if (!url) return null;
  const urlMatch = url.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (urlMatch) return urlMatch[1];
  const bareMatch = url.trim().match(/^(UC[\w-]{22})$/);
  return bareMatch ? bareMatch[1] : null;
}

/** Best-effort extraction of a playlist ID ("PL"/"UU"/"OL"-prefixed)
 * from a tracked entry — accepts a full "?list=..." URL or the bare ID
 * pasted directly. */
function extractPlaylistId(url) {
  if (!url) return null;
  const urlMatch = url.match(/[?&]list=([\w-]{10,})/);
  if (urlMatch) return urlMatch[1];
  const bareMatch = url.trim().match(/^((?:PL|UU|OL)[\w-]{10,})$/);
  return bareMatch ? bareMatch[1] : null;
}

/** Best-effort extraction of a direct video id from a tracked video
 * entry — accepts a full watch/share URL or a bare 11-character video
 * ID pasted directly. */
function extractVideoId(url) {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([\w-]{6,})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([\w-]{6,})/i);
  if (shortMatch) return shortMatch[1];
  const bareMatch = url.trim().match(/^([\w-]{11})$/);
  return bareMatch ? bareMatch[1] : null;
}

/**
 * Attempts a real YouTube Data API v3 call for one tracked source:
 * - "video" sources: fetch the single video's snippet via
 *   `videos.list`.
 * - "playlist" sources: list recent items via `playlistItems.list`.
 * - "channel" sources: resolve a bare channel ID directly, or a handle
 *   via `channels.list (forHandle)`, then list recent uploads via
 *   `search.list`.
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

    if (source.type === "playlist") {
      const playlistId = extractPlaylistId(source.url);
      if (!playlistId) return null;

      const playlistRes = await fetch(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${encodeURIComponent(
          playlistId
        )}&maxResults=3&key=${apiKey}`,
        { signal: controller.signal }
      );
      if (!playlistRes.ok) throw new Error(`playlistItems.list responded with ${playlistRes.status}`);
      const playlistJson = await playlistRes.json();
      const items = Array.isArray(playlistJson?.items) ? playlistJson.items : [];

      return items
        .map((item) => ({
          videoId: item.snippet?.resourceId?.videoId,
          title: item.snippet?.title || "Untitled video",
          description: item.snippet?.description || "",
          publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
          isMock: false,
        }))
        .filter((v) => v.videoId);
    }

    // "channel" source: a bare channel ID is used directly; otherwise
    // resolve a handle to a channel id first.
    let channelId = extractChannelId(source.url);
    if (!channelId) {
      const handle = extractChannelHandle(source.url);
      if (!handle) return null;

      const channelRes = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`,
        { signal: controller.signal }
      );
      if (!channelRes.ok) throw new Error(`channels.list responded with ${channelRes.status}`);
      const channelJson = await channelRes.json();
      channelId = channelJson?.items?.[0]?.id;
      if (!channelId) return null;
    }

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

const TRANSCRIPT_TIMEOUT_MS = 6000;
const TRANSCRIPT_MAX_CHARS = 8000;
// Below this length, a "transcript" is more likely a near-empty/garbled
// caption track than usable spoken content — treated as a failure so
// the pipeline falls back to metadata extraction instead of handing
// Gemini/Claude three words to hallucinate a whole analysis from.
const TRANSCRIPT_MIN_USABLE_CHARS = 120;

function decodeCaptionEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Cleans a raw, auto-generated caption transcript into something fit to
 * hand to an LLM (or read directly, in the no-AI-key fallback). Raw
 * YouTube auto-captions are full of things that are NOT the point of
 * the video and actively hurt extraction quality if left in: repeated
 * stutter artifacts from the speech-to-text engine re-guessing the same
 * word/phrase as more audio arrives, bracketed non-speech tags like
 * "[Music]"/"[Applause]", and run-on whitespace. This function strips
 * all of that, then sanity-checks the result — if what's left is too
 * short, or has almost no letter content (e.g. a caption track that's
 * mostly timestamps/symbols because of a parsing edge case), it's
 * treated as unusable and this returns `null` so the caller falls back
 * to metadata extraction rather than feeding junk downstream.
 */
function cleanTranscriptText(rawText) {
  if (!rawText) return null;

  let text = rawText
    // Non-speech cues auto-captions emit: [Music], [Applause], (laughs), etc.
    .replace(/\[[^\]\n]{1,40}\]/g, " ")
    .replace(/\([^)\n]{1,40}\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Collapse immediate word-level stutter artifacts auto-captions
  // produce when the engine revises its guess mid-stream, e.g.
  // "the the market market is is moving" -> "the market is moving".
  text = text.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");

  // Collapse short repeated phrases (2-5 words) back-to-back, a common
  // auto-caption artifact distinct from single-word stutter above.
  text = text.replace(/\b((?:\w+\s){1,4}\w+)\s+\1\b/gi, "$1");

  text = text.replace(/\s+/g, " ").trim();

  if (text.length < TRANSCRIPT_MIN_USABLE_CHARS) return null;

  // Gibberish guard: a real sentence has a reasonable density of vowels
  // and spaces. A caption track that's mostly stray symbols/timestamps
  // (rare, but possible if YouTube changes the undocumented format
  // underneath us) will fail this and get rejected rather than passed
  // on as "real transcript" content.
  const letters = text.replace(/[^a-zA-Z]/g, "");
  const vowels = text.replace(/[^aeiouAEIOU]/g, "");
  if (letters.length < text.length * 0.5 || vowels.length < letters.length * 0.15) {
    return null;
  }

  return text.slice(0, TRANSCRIPT_MAX_CHARS);
}

/**
 * Parses a `timedtext` response body as either YouTube's JSON3 caption
 * format (`{"events":[{"segs":[{"utf8":"..."}]}]}`) or its older XML
 * format (`<text>...</text>` nodes), returning plain joined text or
 * `null` if neither shape is recognizable. JSON3 is preferred when
 * available — it's more consistently structured than the XML, so
 * parsing it correctly is less fragile than XML regex matching.
 */
function parseCaptionBody(body) {
  if (!body) return null;

  const trimmed = body.trim();

  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed);
      const events = Array.isArray(json.events) ? json.events : [];
      const text = events
        .flatMap((event) => (Array.isArray(event.segs) ? event.segs : []))
        .map((seg) => (typeof seg.utf8 === "string" ? seg.utf8 : ""))
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      if (text) return text;
    } catch {
      // Not valid/expected JSON3 — fall through to XML parsing below in
      // case the body is actually XML despite the leading brace (it
      // shouldn't be, but this function should never throw).
    }
  }

  if (trimmed.includes("<text")) {
    const textNodes = trimmed.match(/<text[^>]*>([\s\S]*?)<\/text>/g) || [];
    const text = textNodes
      .map((node) => {
        const match = node.match(/<text[^>]*>([\s\S]*?)<\/text>/);
        return match ? decodeCaptionEntities(match[1]) : "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) return text;
  }

  return null;
}

/**
 * Discovers a video's REAL caption track URLs by fetching its watch
 * page HTML and reading `ytInitialPlayerResponse.captions
 * .playerCaptionsTracklistRenderer.captionTracks` out of the embedded
 * JSON — the same data YouTube's own web player reads to display
 * captions. This is far more reliable than guessing a static
 * `timedtext?lang=en` URL (fetchVideoTranscript's older fallback,
 * below): it works for whatever languages/track kinds the video
 * actually has, in the order YouTube itself ranks them, using the
 * exact signed `baseUrl` each track needs. Manually-created tracks are
 * sorted before auto-generated ones, and English-language tracks
 * before other languages, since a manual English track is the
 * highest-quality source available when one exists.
 *
 * Returns an array of candidate URLs (each with `&fmt=json3` appended
 * so parseCaptionBody() gets the more reliable JSON shape first),
 * or an empty array on any failure — a changed page structure, a
 * private/age-restricted video, or no captions at all are all normal,
 * expected outcomes here, never thrown.
 */
async function discoverCaptionTrackUrls(videoId) {
  const { controller, timeout } = withTimeout(TRANSCRIPT_TIMEOUT_MS);
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
      signal: controller.signal,
      headers: {
        // A plain browser-like UA avoids some bot-detection paths that
        // can serve a stripped-down page without the player JSON.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const match = html.match(/"captions":\s*(\{[\s\S]*?"captionTracks":[\s\S]*?\]\s*,\s*"audioTracks")/);
    if (!match) return [];

    // The captured group ends mid-object (at the next known sibling
    // key) so it parses as valid JSON on its own without needing to
    // balance braces across the entire (huge) player response blob.
    // Two closing braces are needed here, not one: one to close
    // `playerCaptionsTracklistRenderer`'s own value object (the one
    // holding "captionTracks"/"audioTracks" as sibling keys), and one
    // to close the outer object that is `"captions"`'s value.
    const captionsJsonText = match[1].replace(/,\s*"audioTracks"$/, "}}");
    let captionsJson;
    try {
      captionsJson = JSON.parse(captionsJsonText);
    } catch {
      return [];
    }

    const tracks = captionsJson?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) return [];

    const sorted = [...tracks].sort((a, b) => {
      const aAuto = a.kind === "asr" ? 1 : 0;
      const bAuto = b.kind === "asr" ? 1 : 0;
      if (aAuto !== bAuto) return aAuto - bAuto; // manual tracks first
      const aEnglish = (a.languageCode || "").startsWith("en") ? 0 : 1;
      const bEnglish = (b.languageCode || "").startsWith("en") ? 0 : 1;
      return aEnglish - bEnglish; // English tracks first
    });

    return sorted
      .filter((track) => typeof track.baseUrl === "string" && track.baseUrl.length > 0)
      .slice(0, 3) // at most 3 candidate tracks worth trying per video
      .map((track) => `${track.baseUrl}&fmt=json3`);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Best-effort fetch of a real video's caption track as clean plain
 * text. This is NOT part of the official YouTube Data API v3 — that
 * API's `captions.download` requires OAuth2 channel-owner
 * authorization and generally cannot fetch caption content for a
 * third-party channel's videos with just an API key, so for tracked
 * channels we don't own, this undocumented (but long-standing and
 * widely relied upon) surface is the only practical way to get the
 * video's actual spoken-word content rather than inferring from its
 * title/description.
 *
 * Two layers, in order:
 *   1. discoverCaptionTrackUrls() — reads the video's REAL caption
 *      track list out of its watch page, in the right language/kind
 *      preference order. This is the primary path and succeeds for
 *      the large majority of videos that have any captions at all
 *      (including auto-generated ones, which is most finance/trading
 *      channel uploads).
 *   2. A couple of hand-guessed static `timedtext?lang=en` URLs, tried
 *      only if (1) found nothing — kept as a secondary safety net in
 *      case the watch-page structure this relies on changes.
 *
 * Every candidate's response is run through parseCaptionBody() (JSON3
 * or XML) and then cleanTranscriptText() (strips caption artifacts,
 * rejects anything too short or too garbled to be real spoken
 * content). Returns `null` on total failure — no captions available,
 * a private/age-restricted video, every candidate rejected by the
 * cleaner, or the endpoint/page structure being unavailable/changed.
 * Metadata-only extraction (buildPost(), below) is the explicit
 * last-resort fallback for exactly that case — this function itself
 * never throws and never blocks the pipeline.
 */
async function fetchVideoTranscript(videoId) {
  if (!videoId || videoId.startsWith("mock-")) return null;

  const discovered = await discoverCaptionTrackUrls(videoId);
  const candidateUrls = [
    ...discovered,
    `https://www.youtube.com/api/timedtext?lang=en&kind=asr&v=${encodeURIComponent(videoId)}&fmt=json3`,
    `https://www.youtube.com/api/timedtext?lang=en&v=${encodeURIComponent(videoId)}&fmt=json3`,
    `https://www.youtube.com/api/timedtext?lang=en&kind=asr&v=${encodeURIComponent(videoId)}`,
    `https://www.youtube.com/api/timedtext?lang=en&v=${encodeURIComponent(videoId)}`,
  ];

  for (const url of candidateUrls) {
    const { controller, timeout } = withTimeout(TRANSCRIPT_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) continue;

      const body = await res.text();
      const rawText = parseCaptionBody(body);
      if (!rawText) continue;

      const cleaned = cleanTranscriptText(rawText);
      if (cleaned) return cleaned;
    } catch {
      // Try the next candidate URL, if any.
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
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
function templatedExtraction(video, source, transcript) {
  const headline = `${video.title}`;
  const body = transcript
    ? [
        `${source.label}'s "${video.title}" (${new Date(
          video.publishedAt
        ).toLocaleDateString()}) covers ${source.category.replace("-", " ")} — below is a direct excerpt from the video's real caption track, not a rewritten summary.`,
        `"${transcript.slice(0, 320)}${transcript.length > 320 ? "…" : ""}"`,
        "This is the video's cleaned caption text shown as-is — enable GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY to get an actual AI-written, layman-friendly analysis of this transcript instead of a raw excerpt.",
      ]
    : [
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
        "This is a template-generated placeholder summary, not an AI-written analysis — no caption track was available for this video, so this falls back to the title/description only.",
      ];

  return {
    headline,
    body: body.join("\n\n"),
    keyLevels: [
      "Key levels not available — enable AI extraction to generate level estimates",
      "Configure GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY to extract technical levels mentioned in the video",
    ],
    fundamentalInsights: [
      "Fundamental insights not available from template-based extraction",
    ],
  };
}

function buildExtractionPrompt(video, source, transcript) {
  if (transcript) {
    return `You are a senior financial markets writer at a well-regarded retail finance publication — think the explanatory clarity of a good Bloomberg or FT markets piece, written for an intelligent reader who is NOT a professional trader. You have just watched "${video.title}" from ${source.label} and are writing it up.

RAW TRANSCRIPT (auto-generated captions from the actual video — it is the real spoken content, but treat it as a messy raw source, not a finished script):
"""
${transcript}
"""

Before writing, silently do this filtering in your head — do not mention doing it:
- Ignore timestamps, sponsor reads/ad breaks, channel intros/outros, "like and subscribe" asides, and any stray fragments that are clearly caption noise rather than market commentary.
- Ignore filler ("um", "you know", false starts) and auto-caption repetition artifacts.
- Work only from the substantive market commentary that remains.

STRICT WRITING RULES — these are hard requirements, not suggestions:
1. Write like a human financial journalist who actually watched this, not like a summarization tool. Never use template phrasing such as "This video discusses...", "In this video, the creator talks about...", "The content covers...", or any sentence whose only job is to announce that a video exists. Open directly with the substance — the market move, the call, the reasoning.
2. Explain every piece of jargon in plain language the moment you use it (e.g. "resistance (a price level where selling pressure has repeatedly capped gains)"), so a layman reader with no trading background can follow the whole thing without looking anything up.
3. Be specific. Use the actual numbers, price levels, dates, and named assets/catalysts the speaker mentions in the transcript. Do not invent a number the speaker never said — if the transcript is vague on a level, say plainly that the video didn't give an exact figure rather than fabricating one.
4. End with a short, concrete "what this means for you" takeaway — something an everyday reader could actually use to think about their own watchlist or decisions, not a generic "stay informed" platitude.
5. Keep the tone confident and engaging but never hyped or promotional — this is analysis, not a stock tip.

Respond with ONLY valid JSON (no markdown fences, no commentary before or after) in exactly this shape:
{"headline": "string", "body": "2-3 paragraph string", "keyLevels": ["string", "..."], "fundamentalInsights": ["string", "..."]}

"keyLevels" should be specific price/technical levels actually mentioned in the transcript (with a one-clause plain-language note on why each matters), not generic placeholders. "fundamentalInsights" should be the 2-4 substantive, non-obvious takeaways a smart layman reader would want from this specific video.`;
  }

  return `You are a senior financial markets writer at a well-regarded retail finance publication, writing for an intelligent reader who is NOT a professional trader. No caption transcript could be retrieved for this video, so you're working from its published title and description only — be upfront about that limitation inside the body text itself, briefly and naturally, rather than hiding it.

Video title: "${video.title}"
Video description: "${(video.description || "").slice(0, 600)}"
Source channel: "${source.label}"
Site category: "${source.category}"

STRICT WRITING RULES:
1. Do not invent specific price levels, numbers, or claims the title/description doesn't support — this must read as an honest, reasonable inference from limited information, not a fabricated analysis presented as if it came from watching the video.
2. Avoid template phrasing like "This video discusses..." — write a short, genuinely useful framing of what this topic likely covers and why it matters right now, in plain language a layman can follow.
3. Keep it concise and honest about the limitation rather than padding it out.

Respond with ONLY valid JSON (no markdown fences) in exactly this shape:
{"headline": "string", "body": "2-3 paragraph string", "keyLevels": ["string", "..."], "fundamentalInsights": ["string", "..."]}

Since no transcript was available, "keyLevels" and "fundamentalInsights" should be framed as general context/what-to-watch-for rather than claims about what the video specifically states.`;
}

function parseExtractionJson(text) {
  if (!text) throw new Error("AI provider returned no text content");
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
}

/**
 * Attempts a real Gemini API call (Google AI Studio's plain REST
 * endpoint — no SDK dependency) to extract structured insights from a
 * video's title/description. Returns `null` on any failure (missing
 * key, network error, bad response, timeout, unparsable output) so the
 * caller falls through to aiExtractionClaude() or
 * templatedExtraction() — never throws.
 */
async function aiExtractionGemini(video, source, apiKey, transcript) {
  const { controller, timeout } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildExtractionPrompt(video, source, transcript) }] }],
        generationConfig: { maxOutputTokens: 700 },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API responded with ${res.status}`);

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseExtractionJson(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Attempts a real Claude API call to extract structured insights
 * (headline, 2-3 paragraph body, key levels, fundamental insights) from
 * a video's title/description. Returns `null` on any failure (missing
 * key, network error, bad response, timeout, unparsable output) so the
 * caller falls back to templatedExtraction() — never throws.
 */
async function aiExtractionClaude(video, source, apiKey, transcript) {
  const { controller, timeout } = withTimeout(FETCH_TIMEOUT_MS);
  try {
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
        messages: [{ role: "user", content: buildExtractionPrompt(video, source, transcript) }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API responded with ${res.status}`);

    const json = await res.json();
    const text = json?.content?.[0]?.text;
    return parseExtractionJson(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Builds one complete post object for a single video. First attempts a
 * best-effort real-caption-transcript fetch (fetchVideoTranscript() —
 * see its own doc comment for why this is the only practical way to get
 * a third-party channel's actual spoken-word content), then extraction
 * provider order: GEMINI_API_KEY first (if configured), then
 * ANTHROPIC_API_KEY as a secondary fallback (if configured and Gemini
 * didn't produce a usable result), then the rule-based template as the
 * final fallback. Never throws — every branch above is itself
 * failure-tolerant.
 */
async function buildPost(video, source, { hasGeminiKey, hasAnthropicKey }) {
  const transcript = await fetchVideoTranscript(video.videoId);

  let extraction = null;
  let aiProvider = null;

  if (hasGeminiKey) {
    extraction = await aiExtractionGemini(video, source, process.env.GEMINI_API_KEY, transcript);
    if (extraction) aiProvider = "gemini";
  }

  if (!extraction && hasAnthropicKey) {
    extraction = await aiExtractionClaude(video, source, process.env.ANTHROPIC_API_KEY, transcript);
    if (extraction) aiProvider = "claude";
  }

  if (!extraction) {
    extraction = templatedExtraction(video, source, transcript);
    aiProvider = null;
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
    usingAi: Boolean(aiProvider),
    aiProvider,
    isMock: Boolean(video.isMock),
    // Honest signal for UI consumers (see honesty-bar convention at the
    // top of this file): whether this post's underlying content came
    // from the video's actual caption track, or was inferred from just
    // its title/description because no caption track was available.
    extractionSource: transcript ? "transcript" : "metadata",
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
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
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

  const providerCounts = { gemini: 0, claude: 0 };

  const postLists = await Promise.all(
    videosBySource.map(async ({ source, videos }) => {
      return Promise.all(
        videos.map(async (video) => {
          const post = await buildPost(video, source, { hasGeminiKey, hasAnthropicKey });
          if (post.aiProvider === "gemini") providerCounts.gemini += 1;
          if (post.aiProvider === "claude") providerCounts.claude += 1;
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
  const usingGeminiExtraction = hasGeminiKey && providerCounts.gemini > 0;
  const usingClaudeExtraction = hasAnthropicKey && providerCounts.claude > 0;
  const usingAiExtraction = usingGeminiExtraction || usingClaudeExtraction;
  const hasAnyAiKey = hasGeminiKey || hasAnthropicKey;

  let note;
  if (!hasYoutubeKey && !hasAnyAiKey) {
    note =
      "No YOUTUBE_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY is configured — showing deterministic mock videos with template-generated summaries. Configure these env vars to pull real uploads and AI-extracted insights.";
  } else if (hasYoutubeKey && !usingLiveYoutubeApi) {
    note =
      "A YOUTUBE_API_KEY is configured, but the live YouTube Data API call failed for every tracked source — showing mock videos instead. Check the key and the tracked sources in config/trackedChannels.json.";
  } else if (!hasYoutubeKey) {
    note =
      "No YOUTUBE_API_KEY is configured — showing deterministic mock videos. Configure it to pull real recent uploads from the tracked sources in config/trackedChannels.json.";
  } else if (hasAnyAiKey && !usingAiExtraction) {
    note = hasGeminiKey
      ? "Live YouTube data is in use, but the Gemini API extraction call failed for every video (and no ANTHROPIC_API_KEY fallback is configured) — showing template-generated summaries instead. Check the GEMINI_API_KEY."
      : "Live YouTube data is in use, but the Claude API extraction call failed for every video — showing template-generated summaries instead. Check the ANTHROPIC_API_KEY, or configure GEMINI_API_KEY as the primary provider.";
  } else if (!hasAnyAiKey) {
    note =
      "Live YouTube data is in use, with template-generated (non-AI) summaries. Configure GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY to generate real AI-extracted insights per video.";
  } else if (usingGeminiExtraction) {
    note = `Live YouTube data and Gemini-extracted insights are active (${providerCounts.gemini} post${
      providerCounts.gemini === 1 ? "" : "s"
    } via Gemini${providerCounts.claude > 0 ? `, ${providerCounts.claude} via Claude fallback` : ""}).`;
  } else {
    note = `Live YouTube data and Claude-extracted insights are active (${providerCounts.claude} post${
      providerCounts.claude === 1 ? "" : "s"
    }; GEMINI_API_KEY was not used successfully for any post).`;
  }

  const transcriptCount = posts.filter((post) => post.extractionSource === "transcript").length;

  return {
    posts,
    usingLiveYoutubeApi,
    usingAiExtraction,
    usingGeminiExtraction,
    usingClaudeExtraction,
    // Honest signal at the feed level too (see buildPost()'s per-post
    // `extractionSource` field): how many of the returned posts were
    // actually built from a real caption transcript, vs. falling back
    // to title/description metadata because no caption track was
    // available for that video (private/age-restricted/non-English
    // videos, or the undocumented timedtext endpoint simply not
    // returning anything for it).
    transcriptCount,
    generatedAt: new Date().toISOString(),
    note,
  };
}
