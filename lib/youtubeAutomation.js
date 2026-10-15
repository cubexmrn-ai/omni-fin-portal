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
// plain REST — no SDK dependency; see getGeminiApiKey() for the
// GOOGLE_GEMINI_KEY/GEMINI_KEY name fallbacks it also recognizes, and
// GEMINI_MODEL_CANDIDATES for why it tries more than one model ID),
// then ANTHROPIC_API_KEY (Claude) as a secondary fallback if Gemini is
// unavailable or fails, then the rule-based template as the final
// fallback. Either, both, or neither key can be configured — every
// combination degrades gracefully.
//
// HONESTY NOTE (same bar as lib/newsAggregator.js and elsewhere in this project):
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
// Tried in order until one responds successfully, NOT a single hardcoded
// model — Google has repeatedly retired/restricted older Gemini model
// IDs. Confirmed via this pipeline's own debug logging
// (recordGeminiError(), below) against a fresh API key:
//   - gemini-1.5-flash: fully retired — "models/gemini-1.5-flash is not
//     found for API version v1beta" (404). No reference to it remains
//     anywhere in this file.
//   - gemini-2.5-flash: NOT retired, but now "limited access" — Google
//     restricts it to API keys/projects that used it before it was
//     superseded, so a brand-new key gets the same kind of 404/
//     not-found behavior even though the model still technically
//     exists. This is why a freshly generated key kept failing even
//     after the 1.5 -> 2.5 change.
// gemini-3.8-flash is Google's current recommended stable Flash model
// for new projects/keys as of this fix, tried first; gemini-3.6-flash
// (previous-generation stable) and gemini-2.5-flash (in case a given
// key DOES have legacy access) are kept as further fallbacks so a
// future model change degrades gracefully instead of hard-failing
// again. Check https://ai.google.dev/gemini-api/docs/models if every
// candidate here ever starts failing — Google's lineup moves fast.
const GEMINI_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const GEMINI_API_URL_FOR = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Passed as generationConfig.responseSchema alongside
// responseMimeType: "application/json" (see aiExtractionGemini()) so
// Gemini's own JSON serializer — not a prompt instruction it can
// ignore — produces syntactically valid, schema-shaped JSON directly,
// with multi-paragraph "body" text properly escaped (real "\n", never
// a raw newline byte inside the string). This is what actually
// prevents "Unterminated string in JSON" at the source, rather than
// relying only on parseExtractionJson()'s post-hoc cleanup — that
// cleanup stays in place too, as a backstop for the Claude fallback
// path (no equivalent schema-mode there) and for any future model that
// doesn't honor this perfectly.
const GEMINI_EXTRACTION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    headline: { type: "STRING" },
    body: { type: "STRING" },
    keyLevels: { type: "ARRAY", items: { type: "STRING" } },
    fundamentalInsights: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["headline", "body", "keyLevels", "fundamentalInsights"],
};

/**
 * Reads the Gemini API key from whichever env var name it was actually
 * configured under. GEMINI_API_KEY is the documented/preferred name,
 * but GOOGLE_GEMINI_KEY and GEMINI_KEY are accepted as fallbacks in
 * case the key was set up under a different name on Vercel — this
 * pipeline should recognize the key either way rather than silently
 * running in fallback mode because of a naming mismatch.
 */
function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_KEY ||
    process.env.GEMINI_KEY ||
    null
  );
}

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

/**
 * Every standard YouTube channel's "uploads" playlist ID is the exact
 * same string as its channel ID with the leading "UC" replaced by
 * "UU" — a stable, well-documented YouTube Data API convention (the
 * same relationship `channels.list`'s own
 * `contentDetails.relatedPlaylists.uploads` field returns for that
 * channel). Used only for a source that already gives us a bare
 * channel ID directly (no API call needed to resolve one) — see
 * fetchLiveVideosForSource()'s "channel" branch for why a
 * handle-based source instead reads the authoritative value from
 * `contentDetails` on the channels.list call it has to make anyway,
 * rather than relying on this string convention. Returns null for the
 * tiny minority of legacy channel ID shapes this doesn't apply to, so
 * the caller can report a clear error instead of requesting a
 * definitely-wrong playlist ID.
 */
function uploadsPlaylistIdFromChannelId(channelId) {
  return channelId && channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : null;
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
 * Per-source map of the most recent YouTube Data API failure, reset at
 * the start of every getYoutubeAutomationFeed() run — same "debug
 * visibility instead of a silent swallow" pattern as
 * geminiErrorByModel/recordGeminiError below. A source's live fetch
 * failing (bad key, exceeded daily quota, a renamed/deleted channel,
 * etc.) used to just resolve to null and fall back to mock data with
 * nothing logged anywhere, so there was no way to tell WHY a source
 * was mocked short of attaching a debugger. Both this file's
 * console.error calls (visible in Vercel's function logs) and
 * getYoutubeAutomationFeed()'s returned `youtubeErrors` field (visible
 * in /api/cron/youtube's and /api/youtube-automation's JSON response —
 * same place `geminiErrors` already surfaces) read from this map.
 */
let youtubeErrorBySource = new Map();

function recordYoutubeError(source, detail) {
  console.error(
    `[youtubeAutomation] YouTube Data API call failed — ${source.label} (${source.type}): ${detail}`
  );
  youtubeErrorBySource.set(source.url || source.label, detail);
}

function getYoutubeErrorSummary() {
  // Ordered to match TRACKED_YOUTUBE_SOURCES rather than whatever order
  // failures happened to occur in — same reasoning as
  // getGeminiErrorSummary() below.
  return TRACKED_YOUTUBE_SOURCES.filter((source) =>
    youtubeErrorBySource.has(source.url || source.label)
  ).map((source) => `${source.label}: ${youtubeErrorBySource.get(source.url || source.label)}`);
}

/**
 * Reads the YouTube Data API's own structured error body
 * (`{"error":{"code","message","errors":[{"reason",...}]}}`) when a
 * call fails, so the REAL reason — quotaExceeded, keyInvalid,
 * channelNotFound, forbidden (region/API-not-enabled), etc. — is
 * captured, not just a bare HTTP status that could mean any of those.
 * Falls back to the bare status if the body isn't valid JSON or has an
 * unexpected shape.
 */
async function youtubeErrorDetail(res, endpointLabel) {
  let detail = `${endpointLabel} responded with HTTP ${res.status}`;
  try {
    const errJson = await res.json();
    const reason = errJson?.error?.errors?.[0]?.reason;
    if (errJson?.error?.message) {
      detail = `${endpointLabel}: HTTP ${res.status}${reason ? ` (${reason})` : ""} — ${errJson.error.message}`;
    }
  } catch {
    // Keep the bare HTTP-status message if the error body isn't JSON.
  }
  return detail;
}

/**
 * Attempts a real YouTube Data API v3 call for one tracked source:
 * - "video" sources: fetch the single video's snippet via
 *   `videos.list`.
 * - "playlist" sources: list recent items via `playlistItems.list`.
 * - "channel" sources: resolve the channel's uploads playlist ID
 *   (derived locally from a bare channel ID, or read from
 *   `channels.list`'s `contentDetails` when resolving a handle), then
 *   list recent uploads via `playlistItems.list` — NOT `search.list`,
 *   which costs 100x the quota for the same result (see the inline
 *   comment in the "channel" branch below).
 * Never throws — any failure (missing key, network error, bad
 * response, timeout) resolves to `null` so the caller falls back to
 * mock data for that source only, never breaking the whole pipeline —
 * but the real reason is now logged via recordYoutubeError() first
 * (see its own comment for why that used to be a silent swallow).
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
      if (!videoRes.ok) throw new Error(await youtubeErrorDetail(videoRes, "videos.list"));
      const videoJson = await videoRes.json();
      const item = videoJson?.items?.[0];
      if (!item) return [];

      return [
        {
          videoId: item.id,
          title: decodeHtmlEntities(item.snippet?.title) || "Untitled video",
          description: decodeHtmlEntities(item.snippet?.description) || "",
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
      if (!playlistRes.ok) throw new Error(await youtubeErrorDetail(playlistRes, "playlistItems.list"));
      const playlistJson = await playlistRes.json();
      const items = Array.isArray(playlistJson?.items) ? playlistJson.items : [];

      return items
        .map((item) => ({
          videoId: item.snippet?.resourceId?.videoId,
          title: decodeHtmlEntities(item.snippet?.title) || "Untitled video",
          description: decodeHtmlEntities(item.snippet?.description) || "",
          publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
          isMock: false,
        }))
        .filter((v) => v.videoId);
    }

    // "channel" source: resolve to that channel's uploads playlist,
    // then read from it with playlistItems.list — NOT search.list,
    // which costs 100 quota units per call vs. playlistItems.list's 1
    // unit (confirmed live: every tracked channel source hitting "HTTP
    // 429 rateLimitExceeded ... Search Queries per day" well before
    // its real per-video quota was anywhere near exhausted). A bare
    // channel ID derives its uploads playlist ID locally for free (see
    // uploadsPlaylistIdFromChannelId()); a handle has to resolve to a
    // channel first via channels.list anyway, so that SAME call also
    // requests `contentDetails` and reads the uploads playlist ID
    // straight from YouTube — the authoritative value, not a
    // re-derivation — at no extra quota cost.
    let uploadsPlaylistId = null;
    const directChannelId = extractChannelId(source.url);

    if (directChannelId) {
      uploadsPlaylistId = uploadsPlaylistIdFromChannelId(directChannelId);
    } else {
      const handle = extractChannelHandle(source.url);
      if (!handle) return null;

      // YouTube Data API v3's `forHandle` parameter expects the value
      // WITH its leading "@" (e.g. "forHandle=@LinusTechTips") — see
      // https://developers.google.com/youtube/v3/docs/channels/list.
      // extractChannelHandle() strips the "@" (useful for display and
      // for the other handle regexes it shares logic with), so it has
      // to be added back here. Omitting it isn't consistently rejected
      // — some handles still resolve without it, which is exactly what
      // made this look like a per-channel data problem (only some
      // tracked channels failing) rather than the systemic, one-line
      // bug it actually was.
      const channelRes = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=contentDetails&forHandle=${encodeURIComponent("@" + handle)}&key=${apiKey}`,
        { signal: controller.signal }
      );
      if (!channelRes.ok) throw new Error(await youtubeErrorDetail(channelRes, "channels.list"));
      const channelJson = await channelRes.json();
      uploadsPlaylistId = channelJson?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
    }

    if (!uploadsPlaylistId) {
      throw new Error("could not resolve an uploads playlist for this channel source");
    }

    const uploadsRes = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${encodeURIComponent(
        uploadsPlaylistId
      )}&maxResults=3&key=${apiKey}`,
      { signal: controller.signal }
    );
    if (!uploadsRes.ok) throw new Error(await youtubeErrorDetail(uploadsRes, "playlistItems.list"));
    const uploadsJson = await uploadsRes.json();
    const items = Array.isArray(uploadsJson?.items) ? uploadsJson.items : [];

    return items
      .map((item) => ({
        videoId: item.snippet?.resourceId?.videoId,
        title: decodeHtmlEntities(item.snippet?.title) || "Untitled video",
        description: decodeHtmlEntities(item.snippet?.description) || "",
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        isMock: false,
      }))
      .filter((v) => v.videoId);
  } catch (err) {
    // Any failure for this one source falls through to mock data for
    // it — never throws, never breaks the overall pipeline — but the
    // real reason (quota exceeded, bad key, timeout, network error,
    // etc.) is logged first instead of silently vanishing. A timeout
    // throws DOMException("The operation was aborted.") with
    // err.name === "AbortError" rather than a message that says
    // "timeout", so that case is named explicitly.
    const detail = err?.name === "AbortError" ? "request timed out" : err?.message || "unknown error";
    recordYoutubeError(source, detail);
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

/**
 * Decodes HTML entities out of plain text. Used both for caption XML
 * (below) and — importantly — for video titles/descriptions coming
 * back from the YouTube Data API itself: that API's JSON responses
 * leave common punctuation HTML-entity-encoded (a long-standing quirk
 * inherited from its older XML-based lineage), so a title like "Don't
 * Miss This" or "Gold & Silver Outlook" is actually returned as
 * "Don&#39;t Miss This" / "Gold &amp; Silver Outlook" and would show up
 * on the site exactly like that unless decoded. Handles the small set
 * of named entities that actually show up in YouTube titles/captions,
 * plus generic numeric entities (&#39; decimal, &#x27; hex) for
 * anything that set misses — never throws on malformed input.
 */
function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    // Generic decimal entities, e.g. &#8217; -> ’
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        return String.fromCodePoint(Number(code));
      } catch {
        return _;
      }
    })
    // Generic hex entities, e.g. &#x2019; -> ’
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
      try {
        return String.fromCodePoint(parseInt(code, 16));
      } catch {
        return _;
      }
    });
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
        return match ? decodeHtmlEntities(match[1]) : "";
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
function templatedExtraction(video, source, transcript, skippedForQuota) {
  const headline = `${video.title}`;
  // The closing line differs depending on WHY this video got a
  // template instead of real AI output — "no key configured"/"the AI
  // call failed" is a different, more honest story than "a key is
  // configured and working, but this specific video was outside the
  // per-run AI batch cap" (see MAX_AI_EXTRACTION_VIDEOS_PER_RUN).
  // Implying the AI call failed when it was never attempted would be
  // its own dishonesty.
  const aiCalloutLine = skippedForQuota
    ? `AI extraction is limited to the ${MAX_AI_EXTRACTION_VIDEOS_PER_RUN} most recent videos per run to stay within the Gemini free-tier rate limit — this video will get a real AI-written analysis once it's among the most recent again on a future run.`
    : "enable GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY to get an actual AI-written, layman-friendly analysis of this transcript instead of a raw excerpt.";
  const body = transcript
    ? [
        `${source.label}'s "${video.title}" (${new Date(
          video.publishedAt
        ).toLocaleDateString()}) covers ${source.category.replace("-", " ")} — below is a direct excerpt from the video's real caption track, not a rewritten summary.`,
        `"${transcript.slice(0, 320)}${transcript.length > 320 ? "…" : ""}"`,
        `This is the video's cleaned caption text shown as-is — ${aiCalloutLine}`,
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
        skippedForQuota
          ? `This is a template-generated placeholder summary, not an AI-written analysis — ${aiCalloutLine}`
          : "This is a template-generated placeholder summary, not an AI-written analysis — no caption track was available for this video, so this falls back to the title/description only.",
      ];

  return {
    headline,
    body: body.join("\n\n"),
    keyLevels: [
      "Key levels not available — enable AI extraction to generate level estimates",
      skippedForQuota
        ? `This video was outside the ${MAX_AI_EXTRACTION_VIDEOS_PER_RUN}-video AI batch cap for this run`
        : "Configure GEMINI_API_KEY (preferred) or ANTHROPIC_API_KEY to extract technical levels mentioned in the video",
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

// Gemini/Claude are asked for "ONLY valid JSON", but live runs showed
// three ways the raw text still isn't directly JSON.parse()-able:
//   1. Wrapped in a ```json ... ``` (or bare ``` ... ```) markdown
//      fence despite the instruction not to.
//   2. A short preamble/postamble sentence before or after the JSON
//      object ("Here's the analysis:\n{...}").
//   3. Most commonly — the actual cause of a live failure
//      ("Unterminated string in JSON at position 124") — the "body"
//      field is genuine 2-3 paragraph prose with a literal newline
//      character between paragraphs instead of an escaped "\n". JSON's
//      spec forbids a raw control character inside a quoted string, so
//      JSON.parse() reads the string as ending at that line break and
//      then chokes on what follows as invalid syntax.
// parseExtractionJson() defends against all three, in order, before
// ever calling JSON.parse().

function stripMarkdownFences(text) {
  return text.replace(/```json/gi, "").replace(/```/g, "");
}

/**
 * Finds the first balanced top-level {...} object in `text`, tracking
 * whether each character is inside a quoted JSON string (and
 * respecting backslash escapes) so a brace that shows up inside
 * generated prose or a string value — e.g. a stray preamble sentence —
 * can never be mistaken for the real object's start/end. Returns null
 * if no balanced object is found (e.g. truncated output).
 */
function extractJsonObject(text) {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

/**
 * Escapes raw control characters (newline, carriage return, tab) found
 * INSIDE a JSON string value, leaving everything outside strings
 * (braces, commas, the formatting whitespace between fields)
 * untouched. This is what actually fixes "Unterminated string in
 * JSON" — see the header comment above.
 */
function escapeControlCharsInStrings(jsonText) {
  let out = "";
  let inString = false;
  let escaped = false;

  for (const char of jsonText) {
    if (inString) {
      if (escaped) {
        out += char;
        escaped = false;
      } else if (char === "\\") {
        out += char;
        escaped = true;
      } else if (char === '"') {
        inString = false;
        out += char;
      } else if (char === "\n") {
        out += "\\n";
      } else if (char === "\r") {
        out += "\\r";
      } else if (char === "\t") {
        out += "\\t";
      } else {
        out += char;
      }
      continue;
    }

    if (char === '"') inString = true;
    out += char;
  }

  return out;
}

function parseExtractionJson(text) {
  if (!text) throw new Error("AI provider returned no text content");

  const withoutFences = stripMarkdownFences(text).trim();
  const objectText = extractJsonObject(withoutFences) || withoutFences;
  const sanitized = escapeControlCharsInStrings(objectText);

  let parsed;
  try {
    parsed = JSON.parse(sanitized);
  } catch (err) {
    throw new Error(`Could not parse AI extraction JSON even after cleanup: ${err.message}`);
  }

  if (!parsed.headline || !parsed.body) throw new Error("Malformed AI extraction JSON (missing headline/body)");
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
 * Per-model map of the most recent Gemini call failure, reset at the
 * start of every getYoutubeAutomationFeed() run. This exists purely
 * for debugging: an earlier version of this pipeline swallowed the
 * actual Gemini HTTP status/error body on failure, so "the key isn't
 * working" could mean anything from a bad key to a wrong model name to
 * a quota limit — and there was no way to tell which from the outside.
 * A later version fixed that but kept only a volume-based ring buffer
 * of the last few failures, which could silently evict an earlier
 * model's error once later models in GEMINI_MODEL_CANDIDATES also
 * failed many times over many videos — exactly what hid
 * gemini-3.8-flash's own failure reason in a live debug run. Keying by
 * model instead guarantees every candidate that was actually attempted
 * has its latest failure visible, however many videos ran. Both this
 * file's console.error calls (visible in Vercel's function logs) and
 * getYoutubeAutomationFeed()'s returned `geminiErrors` field (visible
 * in /api/cron/youtube's and /api/youtube-automation's JSON response)
 * read from this map.
 *
 * A model's entry is also CLEARED the moment it successfully extracts
 * a video (see clearGeminiError(), called from aiExtractionGemini()'s
 * success path) — without that, a model failing on video #2 after
 * already succeeding on video #1 earlier in the same run would
 * overwrite its own success with a stale-looking failure, even though
 * `note`/`usingGeminiExtraction` correctly reported it as working.
 * `geminiErrors` is meant to answer "does any candidate have an
 * UNRESOLVED problem by the end of this run", not "did every single
 * one of this run's videos parse cleanly" — the per-post fallback to
 * templatedExtraction() already handles the latter gracefully, and a
 * clean run should report a clean (empty) geminiErrors array.
 */
let geminiErrorByModel = new Map();

function recordGeminiError(model, detail) {
  console.error(`[youtubeAutomation] Gemini API call failed — ${model}: ${detail}`);
  geminiErrorByModel.set(model, detail);
}

function clearGeminiError(model) {
  geminiErrorByModel.delete(model);
}

function getGeminiErrorSummary() {
  // Ordered to match GEMINI_MODEL_CANDIDATES rather than whatever
  // order failures happened to occur in, so the summary always reads
  // "primary model's reason, then the next fallback's reason, ...".
  return GEMINI_MODEL_CANDIDATES.filter((model) => geminiErrorByModel.has(model)).map(
    (model) => `${model}: ${geminiErrorByModel.get(model)}`
  );
}

const GEMINI_RETRY_DELAY_MS = 1000; // base delay before retrying a 503
const GEMINI_MAX_ATTEMPTS_PER_MODEL = 2; // 1 initial attempt + 1 retry

// With 8 tracked sources x up to 3 videos each, a run can have as many
// as 24 videos — calling Gemini for all of them back-to-back blew past
// the free tier's per-minute request quota (confirmed live: "HTTP 429
// RESOURCE_EXHAUSTED ... limit: 20 ... generate_content_free_tier_
// requests"). Only the N most recently published videos across all
// sources get a real AI extraction attempt per run; the rest get
// templatedExtraction() (still with a real transcript excerpt when
// available — that costs no Gemini quota) and are honestly labeled as
// skipped for the batch cap, not as a failed AI call. Every video
// still gets full AI treatment eventually as it cycles into the top N
// on a later run (helped by the scheduled cron + each page's ISR
// revalidate).
const MAX_AI_EXTRACTION_VIDEOS_PER_RUN = 6;
// Minimum spacing between consecutive Gemini calls within a run, to
// stay under the free tier's per-minute request rate limit — applied
// only between videos that actually attempt a Gemini call (skipped
// videos and Claude-only calls don't need it).
const GEMINI_CALL_SPACING_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempts a real Gemini API call via Google's plain REST endpoint
 * (`POST https://generativelanguage.googleapis.com/v1beta/models/
 * {model}:generateContent?key=API_KEY`, with a `{"contents":[{"parts":
 * [{"text": "..."}]}]}` body) — this project deliberately has no
 * `@google/generative-ai` SDK dependency (see this file's own header
 * comment on being framework/SDK-agnostic), and the REST shape here
 * matches Google's documented API exactly, so a failure is a real API
 * response, not a malformed request.
 *
 * Tries each model in GEMINI_MODEL_CANDIDATES in order. For each
 * model, a 503 ("UNAVAILABLE" / high demand — Google's documented
 * transient-overload response) is retried once after a short
 * exponential-backoff delay (GEMINI_RETRY_DELAY_MS, doubled on the
 * retry) before moving on to the next model, since a 503 means "the
 * model is fine, try again shortly" rather than "this model doesn't
 * work for this key" — treating it the same as a 404 would abandon a
 * model that was about to succeed. Every other non-2xx status (404
 * not-found, 400 bad key, 403 permission, 429 quota, etc.) moves to
 * the next candidate immediately, since retrying those wastes a call
 * without any real chance of a different outcome.
 *
 * Every failure is captured in full via recordGeminiError() (HTTP
 * status + Gemini's own JSON error body's `error.message`/
 * `error.status`, or the exception's own `message`), so the EXACT
 * reason for each candidate model is always visible in Vercel's
 * function logs and in the feed's `geminiErrors` field, instead of
 * this just silently returning null as before. Returns `null` only
 * once every candidate has failed, so the caller falls through to
 * aiExtractionClaude() or templatedExtraction() — never throws.
 */
async function aiExtractionGemini(video, source, apiKey, transcript) {
  const prompt = buildExtractionPrompt(video, source, transcript);

  if (!apiKey) {
    recordGeminiError("n/a", "aiExtractionGemini called with no API key");
    return null;
  }

  for (const model of GEMINI_MODEL_CANDIDATES) {
    let lastDetailForModel = null;

    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const { controller, timeout } = withTimeout(FETCH_TIMEOUT_MS);
      try {
        const res = await fetch(`${GEMINI_API_URL_FOR(model)}?key=${apiKey}`, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 700,
              responseMimeType: "application/json",
              responseSchema: GEMINI_EXTRACTION_RESPONSE_SCHEMA,
            },
          }),
        });

        if (!res.ok) {
          // Capture Gemini's own error body (it returns a structured
          // {"error":{"code","message","status"}} JSON object on
          // failure) so the real reason — bad key, wrong model,
          // quota, region block, high demand, etc. — is visible, not
          // just the HTTP status.
          let detail = `HTTP ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.error?.message) {
              detail = `HTTP ${res.status} (${errJson.error.status || "?"}) — ${errJson.error.message}`;
            } else {
              detail = `HTTP ${res.status} — ${JSON.stringify(errJson).slice(0, 300)}`;
            }
          } catch {
            try {
              const errText = await res.text();
              if (errText) detail = `HTTP ${res.status} — ${errText.slice(0, 300)}`;
            } catch {
              // Keep the bare HTTP status if even reading the body fails.
            }
          }
          lastDetailForModel = detail;

          const isRetryableOverload = res.status === 503;
          if (isRetryableOverload && attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL) {
            recordGeminiError(model, `${detail} — retrying in ${GEMINI_RETRY_DELAY_MS * attempt}ms`);
            await sleep(GEMINI_RETRY_DELAY_MS * attempt); // 1s, then 2s if ever raised to 3 attempts
            continue; // retry the same model
          }

          recordGeminiError(model, detail);
          break; // give up on this model, move to the next candidate
        }

        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          // The call succeeded (2xx) but returned no usable text —
          // e.g. the response was blocked by a safety filter
          // (candidates[0].finishReason) instead of containing
          // content. Not retryable — the content itself was rejected,
          // not a transient server issue.
          const finishReason = json?.candidates?.[0]?.finishReason;
          recordGeminiError(
            model,
            `HTTP ${res.status} but no text in response${finishReason ? ` (finishReason: ${finishReason})` : ""}`
          );
          break;
        }
        const parsed = parseExtractionJson(text);
        if (parsed) {
          // This model worked for this video — forget any earlier
          // failure it had on a different video this run (see
          // geminiErrorByModel's header comment for why).
          clearGeminiError(model);
          return parsed;
        }
        break;
      } catch (err) {
        // Network error, timeout, or parseExtractionJson() throwing
        // on malformed/non-JSON model output. Not retried — these
        // aren't Google's "try again shortly" signal.
        lastDetailForModel = err?.name === "AbortError" ? "request timed out" : err?.message || "unknown error";
        recordGeminiError(model, lastDetailForModel);
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  return null;
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
async function buildPost(video, source, { hasGeminiKey, hasAnthropicKey, aiEligible = true }) {
  const transcript = await fetchVideoTranscript(video.videoId);

  let extraction = null;
  let aiProvider = null;

  // aiEligible is false for videos outside this run's
  // MAX_AI_EXTRACTION_VIDEOS_PER_RUN batch cap — skip the Gemini/
  // Claude calls entirely for those rather than attempting (and
  // paying rate-limit cost for) a call that isn't part of the capped
  // batch; templatedExtraction() below gets `skippedForQuota: true`
  // so its copy is honest about WHY this video has no AI analysis.
  if (aiEligible) {
    if (hasGeminiKey) {
      extraction = await aiExtractionGemini(video, source, getGeminiApiKey(), transcript);
      if (extraction) aiProvider = "gemini";
    }

    if (!extraction && hasAnthropicKey) {
      extraction = await aiExtractionClaude(video, source, process.env.ANTHROPIC_API_KEY, transcript);
      if (extraction) aiProvider = "claude";
    }
  }

  const skippedForQuota = !aiEligible && (hasGeminiKey || hasAnthropicKey) && !extraction;
  if (!extraction) {
    extraction = templatedExtraction(video, source, transcript, skippedForQuota);
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
    // True only when this video had no AI analysis specifically
    // because it fell outside this run's MAX_AI_EXTRACTION_VIDEOS_
    // PER_RUN batch cap (a working, configured AI key — just a quota-
    // respecting limit), not because the AI call itself failed or no
    // key is configured — distinct from the generic `usingAi: false`
    // so a UI can tell "not attempted, by design" apart from "tried
    // and failed".
    aiSkippedForQuota: skippedForQuota,
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
  // Reset the per-model/per-source debug error maps at the start of
  // every run so `geminiErrors`/`youtubeErrors` below only ever
  // reflect THIS run's failures, not a stale error from a previous
  // invocation of a long-lived serverless instance.
  geminiErrorByModel = new Map();
  youtubeErrorBySource = new Map();

  const hasYoutubeKey = Boolean(process.env.YOUTUBE_API_KEY);
  const hasGeminiKey = Boolean(getGeminiApiKey());
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

  // Flatten every (source, video) pair across all tracked sources, then
  // sort most-recent-first so the AI batch cap below picks the
  // freshest videos site-wide rather than e.g. always favoring
  // whichever source happens to iterate first.
  const allPairs = videosBySource.flatMap(({ source, videos }) =>
    videos.map((video) => ({ source, video }))
  );
  allPairs.sort((a, b) => {
    const dateA = a.video.publishedAt ? new Date(a.video.publishedAt).getTime() : 0;
    const dateB = b.video.publishedAt ? new Date(b.video.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Processed SEQUENTIALLY (not Promise.all) rather than in parallel —
  // a live quota error confirmed Gemini's free tier rejects a burst of
  // concurrent requests ("HTTP 429 RESOURCE_EXHAUSTED ... limit: 20").
  // Only the first MAX_AI_EXTRACTION_VIDEOS_PER_RUN pairs (the most
  // recently published, thanks to the sort above) are AI-eligible;
  // GEMINI_CALL_SPACING_MS is awaited after each one that actually
  // attempted a Gemini call, spacing those requests out to stay under
  // the per-minute rate limit. Non-eligible videos (template-only, no
  // Gemini call) run with no added delay.
  const posts = [];
  for (let i = 0; i < allPairs.length; i++) {
    const { source, video } = allPairs[i];
    const aiEligible = i < MAX_AI_EXTRACTION_VIDEOS_PER_RUN;

    const post = await buildPost(video, source, { hasGeminiKey, hasAnthropicKey, aiEligible });
    posts.push(post);

    if (post.aiProvider === "gemini") providerCounts.gemini += 1;
    if (post.aiProvider === "claude") providerCounts.claude += 1;

    // Only throttle when this video actually attempted a live Gemini
    // call (aiEligible, a Gemini key is configured, and there's at
    // least one more pair left that will also attempt one) — spacing
    // out calls that were never made, or spacing after the very last
    // one, just adds dead time for no benefit.
    const nextIsAiEligible = i + 1 < allPairs.length && i + 1 < MAX_AI_EXTRACTION_VIDEOS_PER_RUN;
    if (aiEligible && hasGeminiKey && nextIsAiEligible) {
      await sleep(GEMINI_CALL_SPACING_MS);
    }
  }

  // Already sorted most-recent-first from the pre-processing sort
  // above, but re-sorting here keeps this function's output contract
  // explicit and self-evident rather than relying on processing order.
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
    // The PRIMARY model's own failure reason (not just whichever
    // failure happened to occur last) — this is the one that matters
    // most for "why isn't this working", since it's the one actually
    // relied on.
    const primaryGeminiError = geminiErrorByModel.get(GEMINI_MODEL_CANDIDATES[0]);
    note = hasGeminiKey
      ? `Live YouTube data is in use, but the Gemini API extraction call failed for every video (and no ANTHROPIC_API_KEY fallback is configured) — showing template-generated summaries instead.${
          primaryGeminiError
            ? ` Exact Gemini error (${GEMINI_MODEL_CANDIDATES[0]}): ${primaryGeminiError} — see "geminiErrors" for every model tried.`
            : " Check the GEMINI_API_KEY."
        }`
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
  const aiSkippedForQuotaCount = posts.filter((post) => post.aiSkippedForQuota).length;

  if (hasAnyAiKey && aiSkippedForQuotaCount > 0) {
    note += ` AI analysis ran for the ${Math.min(
      MAX_AI_EXTRACTION_VIDEOS_PER_RUN,
      posts.length
    )} most recent videos this run (free-tier rate limit) — ${aiSkippedForQuotaCount} older video${
      aiSkippedForQuotaCount === 1 ? "" : "s"
    } got template summaries and will get AI analysis on a later run.`;
  }

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
    // How many posts got a template (not real AI) summary specifically
    // because they fell outside this run's MAX_AI_EXTRACTION_VIDEOS_
    // PER_RUN batch cap — see buildPost()'s per-post
    // `aiSkippedForQuota` field for which ones.
    aiSkippedForQuotaCount,
    generatedAt: new Date().toISOString(),
    note,
    // Debug visibility into exactly why Gemini extraction didn't run,
    // if it didn't — one entry per model actually attempted (in
    // GEMINI_MODEL_CANDIDATES order), each "<model>: <HTTP status +
    // Gemini's own error body message, or the exception message>",
    // reflecting that model's MOST RECENT failure from this run (see
    // getGeminiErrorSummary()/the reset at the top of this function).
    // Empty when Gemini wasn't attempted or every attempt succeeded.
    // This is what /api/cron/youtube's JSON response surfaces so the
    // real cause for EVERY candidate model (bad key, wrong/retired
    // model name, quota exceeded, region restriction, safety-filter
    // block, transient overload, etc.) is visible instead of a
    // generic "check the key" message or only the last model's error.
    geminiErrors: getGeminiErrorSummary(),
    // Same debug-visibility pattern as geminiErrors above, but for the
    // YouTube Data API fetches themselves — one entry per tracked
    // source that failed this run (quota exceeded, bad/missing key, a
    // renamed/deleted channel, timeout, etc.), instead of that reason
    // silently vanishing into "fell back to mock data" with no trace.
    // Empty when YOUTUBE_API_KEY isn't configured, or every source's
    // live fetch succeeded.
    youtubeErrors: getYoutubeErrorSummary(),
  };
}
