// app/api/ai-news/archive/route.js
//
// Thin HTTP wrapper around lib/newsStore.js's getArchivedNews() —
// the client-side "Load More" button on /ai-news's news wire
// (components/ai-news/NewsWireFeed.jsx) calls this once a visitor has
// scrolled past the live 15-minute batch, to keep paging further back
// through every headline OmniFin Portal has ever shown. Added Oct 2026
// alongside the rest of the AI News permanent-archive work (lib/
// newsStore.js's header comment has the full "why").
//
// Cursor-based (keyset) pagination, not page numbers: `before` is the
// ISO `publishedAt` timestamp of the oldest item the client already
// has, and this returns the next `limit` items strictly older than
// that, newest-first — the same WHERE published_at < $cursor ORDER BY
// published_at DESC LIMIT N shape getArchivedNews() itself documents.
// That's what keeps "page 2" stable even as new headlines keep
// inserting at the front of the table between loads, which plain
// offset/page-number pagination would not.
//
// Graceful by construction, not by any special-casing here:
// getArchivedNews() itself always returns a valid
// `{ items: [], nextCursor: null }` shape — never throws, never
// returns null — whether the archive table isn't configured for this
// deployment yet or is simply exhausted. So the client-side Load More
// button sees the same "nothing more to load" result either way,
// which is exactly the degrade-gracefully behavior this project's
// pSEO/AEO work has used everywhere else (lib/marketData.js's provider
// chains, lib/supabase.js).

import { getArchivedNews } from "@/lib/newsStore";

export const dynamic = "force-dynamic";

// Hard cap regardless of what a caller requests — this is a public,
// unauthenticated GET endpoint, so an unbounded `limit` query param
// would be an easy way to force an oversized table scan/response.
const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 8;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const rawLimit = Number(searchParams.get("limit"));
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.trunc(rawLimit), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const before = searchParams.get("before") || null;

  const { items, nextCursor } = await getArchivedNews({ before, limit });

  return Response.json(
    { items, nextCursor },
    {
      status: 200,
      // Short, shared cache only — archive pages are "older than the
      // live batch" by definition, so they're not time-sensitive the
      // way /api/rates is, but this still keeps a burst of Load More
      // clicks from the same cursor from each hitting the database.
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    }
  );
}
