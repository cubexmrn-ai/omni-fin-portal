// lib/youtubeBlogPipeline.js
//
// YouTube-to-Financial-Blog content pipeline: an admin pastes one or
// more YouTube URLs at /admin/youtube-importer, this module fetches
// each video's REAL caption transcript, sends it to Gemini to generate
// a structured SEO blog article, and stores the result so
// /market-analysis's "Market Insights & Economic Summaries" section
// can render it. Deliberately standalone (no Next.js Request/Response
// dependency, same convention as lib/youtubeAutomation.js and
// lib/newsAggregator.js) — only plain exported async functions.
//
// STRICT REJECTION RULE (per the admin's explicit spec): if a video
// has no fetchable real caption transcript, this pipeline REJECTS it
// outright — no template fallback, no description-based pseudo-
// article, no promo-link dump. The ONLY two end states for a submitted
// URL are `published` (real transcript + real Gemini-generated
// article) or `failed` (with a plain-English reason) — there is no
// degraded-but-still-shown third state, unlike most of this project's
// other AI features, because a transcript-less, AI-less "article"
// would just be noise on the public page.
//
// TRANSCRIPT: two independent layers, tried in order, because a
// direct server-side fetch() scrape of YouTube's watch-page HTML (this
// pipeline's original approach, and still what lib/youtubeAutomation.js
// uses for the tracked-channel feed) is exactly the kind of request
// YouTube's bot-detection targets when it comes from a cloud/datacenter
// IP such as Vercel's — real videos with real captions were being
// marked "Failed: No Transcript" because of this, not because they
// lacked captions.
//   1. The `youtube-transcript` npm package — a maintained library that
//      handles its own caption-track discovery/parsing.
//   2. If that fails, a direct query to YouTube's InnerTube `player`
//      endpoint (the same internal API YouTube's own mobile apps use),
//      impersonating the ANDROID client — a different request surface
//      from both the package above and the watch-page HTML scrape, so
//      it survives failures specific to either of those.
// Both layers reduce to the same plain-text transcript shape before
// being handed to Gemini. See fetchRobustTranscript() below for the
// full orchestration and its failure-reason classification.
//
// AI PROVIDER: Gemini only, per the admin's spec ("Send the raw
// transcript to Gemini API"). No GEMINI_API_KEY (or every model
// candidate failing) is a hard failure for this pipeline — there is no
// rule-based template fallback here, unlike lib/youtubeAutomation.js's
// insight posts, because a templated "article" would violate the
// zero-promo/zero-raw-dump requirement above.
//
// STORAGE: Supabase (`youtube_blog_posts` table, anon key — see
// SUPABASE_SETUP.md's "YouTube Blog Pipeline" section for the schema
// and the RLS trust-boundary note) is the primary store, so published
// articles persist across deployments and are visible to every
// visitor. When Supabase isn't configured (or a call to it fails),
// this falls back to an in-memory array PLUS a best-effort JSON file
// under the OS tmp directory — survives repeated requests to the same
// warm serverless instance / local dev server, but is explicitly NOT
// durable across a cold start or a new deployment. Every read path
// tries Supabase first and only falls back silently; nothing here
// throws up to the caller.

import { YoutubeTranscript } from "youtube-transcript";
import {
  decodeHtmlEntities,
  parseCaptionBody,
  cleanTranscriptText,
  YOUTUBE_SCRAPE_HEADERS,
} from "@/lib/youtubeAutomation";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import os from "os";

const TMP_STORE_PATH = path.join(os.tmpdir(), "omnifin-youtube-blog-posts.json");
const TABLE = "youtube_blog_posts";

// ---------------------------------------------------------------------------
// Transcript fetching — youtube-transcript package, with an InnerTube
// fallback (see this file's header comment for why two layers)
// ---------------------------------------------------------------------------

const TRANSCRIPT_TIMEOUT_MS = 6000;

function withTimeout(signalMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), signalMs);
  return { controller, timeout };
}

/**
 * Layer 1: the `youtube-transcript` npm package. Tries an English
 * track first, then falls back to whatever language track the video
 * actually has if no English track is available (Gemini can still
 * work from a non-English transcript — better than rejecting a video
 * outright just because its only track isn't English). Returns
 * `{ transcript, reason }`, same shape as fetchRobustTranscript()
 * below: `reason` is null on success, or one of
 * `no_caption_tracks_listed` (the package itself reports no
 * captions/disabled), `transcript_too_short_or_garbled`,
 * `transcript_fetch_timeout`, or `transcript_fetch_blocked` (anything
 * else — a network error, an unrecognized library error, etc).
 */
async function fetchViaYoutubeTranscriptPackage(videoId) {
  let lastError = null;

  for (const options of [{ lang: "en" }, undefined]) {
    try {
      const segments = options
        ? await YoutubeTranscript.fetchTranscript(videoId, options)
        : await YoutubeTranscript.fetchTranscript(videoId);

      if (!Array.isArray(segments) || segments.length === 0) {
        lastError = null;
        continue;
      }

      const joined = segments.map((seg) => (typeof seg.text === "string" ? seg.text : "")).join(" ");
      const cleaned = cleanTranscriptText(decodeHtmlEntities(joined));
      if (cleaned) return { transcript: cleaned, reason: null };

      lastError = { tooShortOrGarbled: true };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError?.tooShortOrGarbled) return { transcript: null, reason: "transcript_too_short_or_garbled" };
  if (!lastError) return { transcript: null, reason: "no_caption_tracks_listed" };

  // Matched by message substring rather than error class name/instance
  // — the package's exact error classes can change across versions,
  // but the wording of "no captions for this video" vs. a genuine
  // network/timeout failure is stable enough to classify by.
  const message = String(lastError?.message || lastError?.name || "").toLowerCase();
  if (message.includes("disabled") || message.includes("not available") || message.includes("no transcript")) {
    return { transcript: null, reason: "no_caption_tracks_listed" };
  }
  if (lastError?.name === "AbortError" || message.includes("timeout") || message.includes("timed out")) {
    return { transcript: null, reason: "transcript_fetch_timeout" };
  }
  return { transcript: null, reason: "transcript_fetch_blocked" };
}

// A long-standing public API key used by YouTube's own ANDROID client
// to call this InnerTube endpoint — not a secret, and widely relied
// upon by community tooling (e.g. yt-dlp) for exactly this purpose:
// fetching a video's player response, captions included, from a
// mobile-client surface that gets treated differently than the public
// website by YouTube's bot-detection.
const INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const INNERTUBE_PLAYER_URL = `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`;
const INNERTUBE_CLIENT_CONTEXT = {
  client: {
    clientName: "ANDROID",
    clientVersion: "19.09.37",
    androidSdkVersion: 30,
    hl: "en",
    gl: "US",
  },
};

/**
 * Layer 2a: queries YouTube's InnerTube `player` endpoint directly,
 * impersonating the ANDROID client, and reads the same
 * `captions.playerCaptionsTracklistRenderer.captionTracks` shape the
 * watch-page's embedded JSON carries. Returns `{ tracks, reason }` —
 * `tracks` empty on any failure, `reason` explaining why (an HTTP
 * error, a timeout, or the video genuinely having none listed).
 */
async function fetchInnerTubeCaptionTracks(videoId) {
  const { controller, timeout } = withTimeout(TRANSCRIPT_TIMEOUT_MS);
  try {
    const res = await fetch(INNERTUBE_PLAYER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",
      },
      body: JSON.stringify({ videoId, context: INNERTUBE_CLIENT_CONTEXT }),
    });
    if (!res.ok) return { tracks: [], reason: `innertube_http_${res.status}` };

    const data = await res.json();
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return { tracks: [], reason: "no_caption_tracks_listed" };
    }
    return { tracks, reason: null };
  } catch (err) {
    return { tracks: [], reason: err?.name === "AbortError" ? "transcript_fetch_timeout" : "transcript_fetch_blocked" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Layer 2b: fetches and cleans the actual caption text from a list of
 * InnerTube caption tracks (manually-created preferred over
 * auto-generated, English preferred over other languages — same
 * ordering rule as lib/youtubeAutomation.js's own discovery). Returns
 * `{ transcript, reason }`.
 */
async function fetchTranscriptFromInnerTubeTracks(tracks) {
  const sorted = [...tracks]
    .sort((a, b) => {
      const aAuto = a.kind === "asr" ? 1 : 0;
      const bAuto = b.kind === "asr" ? 1 : 0;
      if (aAuto !== bAuto) return aAuto - bAuto; // manual tracks first
      const aEnglish = (a.languageCode || "").startsWith("en") ? 0 : 1;
      const bEnglish = (b.languageCode || "").startsWith("en") ? 0 : 1;
      return aEnglish - bEnglish; // English tracks first
    })
    .filter((track) => typeof track.baseUrl === "string" && track.baseUrl.length > 0)
    .slice(0, 3); // at most 3 candidate tracks worth trying per video

  let sawTimeout = false;
  let sawHttpOrNetworkError = false;
  let sawTooShortOrGarbled = false;

  for (const track of sorted) {
    const { controller, timeout } = withTimeout(TRANSCRIPT_TIMEOUT_MS);
    try {
      const res = await fetch(`${track.baseUrl}&fmt=json3`, { signal: controller.signal, headers: YOUTUBE_SCRAPE_HEADERS });
      if (!res.ok) {
        sawHttpOrNetworkError = true;
        continue;
      }
      const body = await res.text();
      const rawText = parseCaptionBody(body);
      if (!rawText) {
        sawHttpOrNetworkError = true;
        continue;
      }
      const cleaned = cleanTranscriptText(rawText);
      if (cleaned) return { transcript: cleaned, reason: null };
      sawTooShortOrGarbled = true;
    } catch (err) {
      if (err?.name === "AbortError") sawTimeout = true;
      else sawHttpOrNetworkError = true;
    } finally {
      clearTimeout(timeout);
    }
  }

  if (sawTooShortOrGarbled && !sawHttpOrNetworkError && !sawTimeout) {
    return { transcript: null, reason: "transcript_too_short_or_garbled" };
  }
  if (sawTimeout && !sawHttpOrNetworkError) return { transcript: null, reason: "transcript_fetch_timeout" };
  if (sawHttpOrNetworkError) return { transcript: null, reason: "transcript_fetch_blocked" };
  return { transcript: null, reason: "no_caption_tracks_listed" };
}

// Priority order used when both transcript layers failed and their
// failure reasons disagree — picks the most specific/informative one
// to surface in the admin queue table rather than the vaguest.
const FAILURE_REASON_PRIORITY = [
  "transcript_too_short_or_garbled",
  "transcript_fetch_timeout",
  "transcript_fetch_blocked",
];

function pickMostInformativeReason(reasons) {
  const seen = new Set(reasons.filter(Boolean));
  for (const code of FAILURE_REASON_PRIORITY) {
    if (seen.has(code)) return code;
  }
  return "transcript_fetch_blocked";
}

/**
 * Orchestrates both transcript layers for one video. Returns
 * `{ transcript, reason }` — `transcript` is null only once BOTH
 * layers have failed. `no_captions_available` (the video genuinely
 * has no captions) is only reported when BOTH independent layers — the
 * youtube-transcript package and this module's own InnerTube query —
 * agree there are no caption tracks at all; that double confirmation
 * is a much stronger signal than either one alone reporting it, since
 * either layer reporting "none found" can also mean it got blocked in
 * a way that merely looks like an empty result. Any other case where
 * the two layers disagree falls back to the single most informative
 * reason recorded across both attempts (see pickMostInformativeReason()).
 */
export async function fetchRobustTranscript(videoId) {
  if (!videoId) return { transcript: null, reason: "invalid_video_id" };

  const packageResult = await fetchViaYoutubeTranscriptPackage(videoId);
  if (packageResult.transcript) return packageResult;

  const { tracks, reason: innerTubeDiscoveryReason } = await fetchInnerTubeCaptionTracks(videoId);
  let innerTubeResult = { transcript: null, reason: innerTubeDiscoveryReason };
  if (tracks.length > 0) {
    innerTubeResult = await fetchTranscriptFromInnerTubeTracks(tracks);
    if (innerTubeResult.transcript) return innerTubeResult;
  }

  const bothConfirmNoCaptions =
    packageResult.reason === "no_caption_tracks_listed" && innerTubeResult.reason === "no_caption_tracks_listed";
  if (bothConfirmNoCaptions) return { transcript: null, reason: "no_captions_available" };

  return { transcript: null, reason: pickMostInformativeReason([packageResult.reason, innerTubeResult.reason]) };
}

// ---------------------------------------------------------------------------
// Video ID / metadata
// ---------------------------------------------------------------------------

/**
 * Extracts an 11-character YouTube video ID from any of the common URL
 * shapes (watch?v=, youtu.be/, /shorts/, /embed/) or a bare ID pasted
 * directly. Returns null if nothing recognizable is found — the
 * caller treats that as an immediate per-URL failure, not a crash.
 */
export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  const watchMatch = trimmed.match(/[?&]v=([\w-]{6,})/);
  if (watchMatch) return watchMatch[1].slice(0, 11);
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{6,})/i);
  if (shortMatch) return shortMatch[1].slice(0, 11);
  const shortsMatch = trimmed.match(/\/shorts\/([\w-]{6,})/i);
  if (shortsMatch) return shortsMatch[1].slice(0, 11);
  const embedMatch = trimmed.match(/\/embed\/([\w-]{6,})/i);
  if (embedMatch) return embedMatch[1].slice(0, 11);
  const bareMatch = trimmed.match(/^([\w-]{11})$/);
  return bareMatch ? bareMatch[1] : null;
}

const METADATA_TIMEOUT_MS = 6000;

/**
 * Real video title/channel/thumbnail via YouTube's free, keyless
 * oEmbed endpoint — no YOUTUBE_API_KEY needed (that key is only used
 * elsewhere in this project, by lib/youtubeAutomation.js's tracked-
 * channel feed; this admin tool works for ANY public video someone
 * pastes, with or without that key configured). Returns null on any
 * failure (private/unlisted/deleted video, network error, timeout) —
 * the caller treats a null metadata result as a per-URL failure.
 */
export async function fetchOEmbedMetadata(videoId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), METADATA_TIMEOUT_MS);
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.title) return null;
    return {
      title: data.title,
      channelName: data.author_name || "Unknown channel",
      thumbnailUrl: data.thumbnail_url || null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Gemini article generation
// ---------------------------------------------------------------------------

// Same candidate list/ordering convention as lib/youtubeAutomation.js
// and lib/newsAggregator.js — tried in order, moving to the next
// candidate on a 404/400/403/429 ("this model/key doesn't work") and
// retrying the SAME model once on a 503 ("try again shortly").
const GEMINI_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
const GEMINI_API_URL_FOR = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
// Full-article generation needs materially longer than this project's
// other short Gemini calls (one-sentence summaries, JSON impact tags)
// — both a bigger output budget and a longer per-attempt timeout.
const ARTICLE_TIMEOUT_MS = 45000;
const ARTICLE_MAX_OUTPUT_TOKENS = 3000;
const GEMINI_RETRY_DELAY_MS = 1000;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_KEY || process.env.GEMINI_KEY || null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildArticlePrompt({ transcript, videoTitle, channelName }) {
  // Capped so one very long transcript can't blow Gemini's input
  // budget or this pipeline's own timeout — ~18k characters is well
  // past what's needed for a solid article from a typical 10-40 minute
  // finance video's spoken content.
  const cappedTranscript = transcript.slice(0, 18000);

  return [
    "You are a financial content editor turning a YouTube video transcript into a layman-friendly SEO blog article.",
    "",
    `Video title: ${videoTitle}`,
    `Channel: ${channelName}`,
    "",
    "Transcript (real spoken content from the video):",
    cappedTranscript,
    "",
    "Write a structured blog article from this transcript. Rules:",
    "- Zero promotional/sponsor content, calls to action, or 'subscribe/follow' language — strip any of that out of the transcript entirely.",
    "- Explain market/economic concepts in plain, layman-friendly language, not jargon.",
    "- The article body must be Markdown with H2 (##) and H3 (###) subheadings and real key-takeaway content, not a vague restatement.",
    "- Do not invent facts, numbers, or price levels that are not actually said in the transcript.",
    "",
    "Respond with ONLY a single valid JSON object (no markdown code fences, no commentary before or after), with exactly these keys:",
    "{",
    '  "blogTitle": "a catchy, clear, SEO-friendly layman title (not clickbait, not the raw video title)",',
    '  "excerpt": "a compelling 4-line summary for a card preview (plain text, use \\n between the 4 lines)",',
    '  "articleMarkdown": "the full structured Markdown article with ## and ### subheadings",',
    '  "tags": ["2 to 5 short topic tags, e.g. Macro Economy, Fed Rates, Inflation, Crypto Trends"]',
    "}",
  ].join("\n");
}

/**
 * Extracts the first top-level JSON object from a text blob — Gemini
 * is asked to return raw JSON, but models occasionally wrap it in a
 * ```json code fence anyway, so this strips fences first and then
 * takes the substring between the first `{` and the last `}` before
 * parsing, rather than assuming the whole response is clean JSON.
 */
function extractJsonObject(text) {
  if (!text) return null;
  const withoutFences = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(withoutFences.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Calls Gemini with the transcript and parses its structured JSON
 * response into { blogTitle, excerpt, articleMarkdown, tags }. Returns
 * null on ANY failure (no key configured, every model candidate
 * failing, or a response that doesn't parse into the expected shape)
 * — the caller treats null as a hard pipeline failure for this video,
 * never a partial/fabricated article.
 */
export async function generateArticleFromTranscript({ transcript, videoTitle, channelName }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { error: "no_gemini_key" };

  const prompt = buildArticlePrompt({ transcript, videoTitle, channelName });

  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ARTICLE_TIMEOUT_MS);
      try {
        const res = await fetch(`${GEMINI_API_URL_FOR(model)}?key=${apiKey}`, {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: ARTICLE_MAX_OUTPUT_TOKENS, temperature: 0.4 },
          }),
        });
        if (!res.ok) {
          if (res.status === 503 && attempt < 2) {
            await sleep(GEMINI_RETRY_DELAY_MS * attempt);
            continue;
          }
          break; // try the next model candidate
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = extractJsonObject(text);
        if (
          !parsed ||
          typeof parsed.blogTitle !== "string" ||
          typeof parsed.excerpt !== "string" ||
          typeof parsed.articleMarkdown !== "string" ||
          !parsed.blogTitle.trim() ||
          !parsed.articleMarkdown.trim()
        ) {
          break; // malformed response from this model — try the next candidate
        }
        return {
          blogTitle: parsed.blogTitle.trim(),
          excerpt: parsed.excerpt.trim(),
          articleMarkdown: parsed.articleMarkdown.trim(),
          tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t) => typeof t === "string" && t.trim()).slice(0, 5) : [],
        };
      } catch {
        break; // network error/timeout on this candidate — try the next model
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  return { error: "generation_failed" };
}

// ---------------------------------------------------------------------------
// Storage — Supabase primary, in-memory + tmp-file fallback
// ---------------------------------------------------------------------------

let memoryStore = null; // lazily loaded from the tmp file on first use this process.

function getServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    // persistSession/autoRefreshToken are browser-session concepts that
    // don't apply to a server-side call — explicitly off here, unlike
    // lib/supabase.js's browser client.
    return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

function loadMemoryStore() {
  if (memoryStore !== null) return memoryStore;
  try {
    const raw = fs.readFileSync(TMP_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    memoryStore = Array.isArray(parsed) ? parsed : [];
  } catch {
    memoryStore = [];
  }
  return memoryStore;
}

function saveMemoryStore() {
  try {
    fs.writeFileSync(TMP_STORE_PATH, JSON.stringify(memoryStore), "utf8");
  } catch {
    // Best-effort only — a read-only filesystem (some serverless
    // platforms) just means this falls back to in-memory-for-this-
    // instance persistence, which loadMemoryStore()/this module's
    // module-level `memoryStore` variable already provides.
  }
}

/**
 * Inserts a brand-new queue row (status "pending" or "processing").
 * Returns the row (with its id) on success, or null if even the
 * fallback store failed (should be exceedingly rare — a file-system
 * write is the only thing that can fail here, and that failure is
 * itself swallowed by saveMemoryStore()).
 */
export async function insertBlogRow(row) {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).insert(row).select().single();
    if (!error && data) return data;
    // Falls through to the local fallback below on any Supabase error
    // (missing table/policy, network issue) — never throws up to the
    // caller, same graceful-degradation convention as lib/supabase.js.
  }

  const store = loadMemoryStore();
  store.unshift(row);
  saveMemoryStore();
  return row;
}

/** Updates an existing row by id (status transitions, final article fields). */
export async function updateBlogRow(id, patch) {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).update(patch).eq("id", id).select().single();
    if (!error && data) return data;
  }

  const store = loadMemoryStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx !== -1) {
    store[idx] = { ...store[idx], ...patch };
    saveMemoryStore();
    return store[idx];
  }
  return null;
}

/** All rows (every status), most recent first — for the admin queue table. */
export async function listAllBlogRows() {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(200);
    if (!error && Array.isArray(data)) return data;
  }
  return loadMemoryStore();
}

/**
 * Published posts only, most recent first — for the public
 * /market-analysis "Market Insights & Economic Summaries" cards.
 * Never throws; an empty array just means the section renders
 * nothing, which the page handles gracefully.
 */
export async function getPublishedBlogPosts(limit = 6) {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (!error && Array.isArray(data)) return data;
  }

  const store = loadMemoryStore();
  return store.filter((r) => r.status === "published").slice(0, limit);
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Admin passkey check
// ---------------------------------------------------------------------------
//
// Deliberately simple, per the admin's own spec ("keep the admin
// authentication extremely simple and direct") — a single hardcoded
// passkey, no environment variable, no multi-user auth, no
// rate-limiting/lockout, no session/cookie infrastructure. This is
// intentionally NOT a secret worth relying on for anything sensitive;
// it's a direct string comparison against one fixed value.
const ADMIN_PASSKEY = "admin12354";

export function isValidAdminPasskey(passkey) {
  return passkey === ADMIN_PASSKEY;
}

const FAILURE_LABELS = {
  invalid_url: "Failed: Invalid URL",
  // Legacy code — some older rows may still carry this flat reason
  // from before transcript failures were split out below; kept so
  // those still render a sensible label instead of falling back to
  // the generic "Failed".
  no_transcript: "Failed: No Transcript",
  no_captions_available: "Failed: No Captions Available",
  transcript_fetch_timeout: "Failed: Transcript Fetch Timed Out",
  transcript_fetch_blocked: "Failed: Transcript Fetch Blocked",
  transcript_too_short_or_garbled: "Failed: Captions Too Short/Garbled",
  invalid_video_id: "Failed: Invalid Video ID",
  no_gemini_key: "Failed: No Gemini Key Configured",
  generation_failed: "Failed: AI Generation Error",
};

export function failureLabel(reason) {
  return FAILURE_LABELS[reason] || "Failed";
}

/**
 * Processes ONE submitted URL end-to-end: video ID -> real metadata ->
 * REAL transcript (hard-reject if none) -> Gemini article generation
 * (hard-reject if that fails) -> a finished row ready to insert.
 * Never throws — every failure mode resolves to a `{ status: "failed",
 * failureReason }` row instead.
 */
export async function processYoutubeUrl(url) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return { status: "failed", failureReason: "invalid_url", url, videoId: null };
  }

  const metadata = await fetchOEmbedMetadata(videoId);
  const videoTitle = metadata?.title || null;
  const channelName = metadata?.channelName || null;
  const thumbnailUrl = metadata?.thumbnailUrl || null;

  // STRICT REJECTION RULE — see this file's header comment. No
  // transcript means no article, full stop; never a description-based
  // or templated substitute. `reason` differentiates WHY (genuinely no
  // captions vs. the fetch itself timing out/getting blocked) so the
  // admin queue table shows an accurate, specific failure rather than
  // one flat "no transcript" bucket for every cause — see
  // fetchRobustTranscript()'s own doc comment above for exactly what
  // each reason code means and how the two transcript layers combine.
  const { transcript, reason: transcriptFailureReason } = await fetchRobustTranscript(videoId);
  if (!transcript) {
    return {
      status: "failed",
      failureReason: transcriptFailureReason || "no_transcript",
      url,
      videoId,
      videoTitle,
      channelName,
      thumbnailUrl,
    };
  }

  const generated = await generateArticleFromTranscript({ transcript, videoTitle: videoTitle || url, channelName: channelName || "Unknown channel" });
  if (generated?.error) {
    return {
      status: "failed",
      failureReason: generated.error,
      url,
      videoId,
      videoTitle,
      channelName,
      thumbnailUrl,
    };
  }

  const sourceCredit = `Insights derived from "${videoTitle || "this video"}" by ${channelName || "its creator"}.`;

  return {
    status: "published",
    url,
    videoId,
    videoTitle,
    channelName,
    thumbnailUrl,
    blogTitle: generated.blogTitle,
    excerpt: generated.excerpt,
    articleMarkdown: generated.articleMarkdown,
    sourceCredit,
    tags: generated.tags,
  };
}
