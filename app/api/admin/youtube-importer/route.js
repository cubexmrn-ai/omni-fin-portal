// app/api/admin/youtube-importer/route.js
//
// Backend for /admin/youtube-importer. Every request (GET or POST)
// must carry the admin passkey in an `x-admin-passkey` header — see
// lib/youtubeBlogPipeline.js's isValidAdminPasskey() for the simple
// check this does (and its own comment on why it's deliberately
// simple, not real auth infra).
//
// GET  — returns every submitted row (any status), most recent first,
//        for the admin queue status table.
// POST — body: { urls: string[] }. Enqueues each URL and processes it
//        SEQUENTIALLY, synchronously, within this same request (one
//        video at a time: metadata -> real transcript check -> Gemini
//        article generation -> store). There's no separate job queue/
//        worker infra in this deployment, so "background processing"
//        here means "this request runs until every pasted URL is
//        either published or failed" rather than returning instantly
//        and updating asynchronously — maxDuration below is raised to
//        give that realistic room for a handful of videos at once.
//        Each URL's outcome is independent: one failing (no
//        transcript, no Gemini key, generation error) never blocks or
//        fails the others.

import {
  insertBlogRow,
  listAllBlogRows,
  updateBlogRow,
  processYoutubeUrl,
  isValidAdminPasskey,
  failureLabel,
} from "@/lib/youtubeBlogPipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function unauthorized() {
  return Response.json({ error: "Invalid or missing admin passkey." }, { status: 401 });
}

export async function GET(request) {
  const passkey = request.headers.get("x-admin-passkey");
  if (!isValidAdminPasskey(passkey)) return unauthorized();

  try {
    const rows = await listAllBlogRows();
    return Response.json({ rows });
  } catch (err) {
    // Defensive — the pipeline's own storage functions already
    // swallow their errors, but this route never lets an unexpected
    // throw surface a raw error to the client.
    return Response.json({ rows: [], error: err.message || "Failed to load queue." }, { status: 200 });
  }
}

export async function POST(request) {
  const passkey = request.headers.get("x-admin-passkey");
  if (!isValidAdminPasskey(passkey)) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const urls = Array.isArray(body?.urls)
    ? body.urls.map((u) => (typeof u === "string" ? u.trim() : "")).filter(Boolean)
    : [];

  if (urls.length === 0) {
    return Response.json({ error: "No URLs provided." }, { status: 400 });
  }

  const results = [];

  for (const url of urls) {
    const pendingRow = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      status: "processing",
      failure_reason: null,
      video_id: null,
      video_title: null,
      channel_name: null,
      thumbnail_url: null,
      blog_title: null,
      excerpt: null,
      article_markdown: null,
      source_credit: null,
      tags: [],
      submitted_at: new Date().toISOString(),
      published_at: null,
    };

    const saved = (await insertBlogRow(pendingRow)) || pendingRow;

    try {
      const outcome = await processYoutubeUrl(url);

      if (outcome.status === "published") {
        const patch = {
          status: "published",
          failure_reason: null,
          video_id: outcome.videoId,
          video_title: outcome.videoTitle,
          channel_name: outcome.channelName,
          thumbnail_url: outcome.thumbnailUrl,
          blog_title: outcome.blogTitle,
          excerpt: outcome.excerpt,
          article_markdown: outcome.articleMarkdown,
          source_credit: outcome.sourceCredit,
          tags: outcome.tags,
          published_at: new Date().toISOString(),
        };
        const updated = await updateBlogRow(saved.id, patch);
        results.push(updated || { ...saved, ...patch });
      } else {
        const patch = {
          status: "failed",
          failure_reason: outcome.failureReason,
          video_id: outcome.videoId,
          video_title: outcome.videoTitle,
          channel_name: outcome.channelName,
          thumbnail_url: outcome.thumbnailUrl,
        };
        const updated = await updateBlogRow(saved.id, patch);
        results.push(updated || { ...saved, ...patch });
      }
    } catch (err) {
      // Should be unreachable — processYoutubeUrl() never throws — but
      // guarded anyway so one unexpected error can't take down the
      // whole batch or leave a row stuck at "processing" forever.
      const patch = { status: "failed", failure_reason: "generation_failed" };
      const updated = await updateBlogRow(saved.id, patch);
      results.push(updated || { ...saved, ...patch, _unexpectedError: err.message });
    }
  }

  return Response.json({
    results: results.map((r) => ({ ...r, failure_label: r.failure_reason ? failureLabel(r.failure_reason) : null })),
  });
}
