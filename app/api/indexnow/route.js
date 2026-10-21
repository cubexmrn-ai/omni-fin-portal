// app/api/indexnow/route.js
//
// Protected trigger that submits every featured pSEO converter URL to
// IndexNow (Bing/Yandex/etc — NOT Google; see lib/indexNow.js's header
// comment for why Google's own Indexing API is the wrong tool for
// these pages). Reuses the exact same featured-slug lists
// app/sitemap.js already treats as the single source of truth for
// "every pSEO URL this project has", so this can never drift out of
// sync with what's actually pre-rendered and submitted to Google via
// sitemap.xml.
//
// USAGE: after a deploy that adds/changes pSEO slugs, trigger once:
//   curl -X POST "https://www.omnifinportal.com/api/indexnow?secret=<INDEXNOW_TRIGGER_SECRET>"
// Requires an INDEXNOW_TRIGGER_SECRET env var set in Vercel — without
// one, this route refuses every request rather than running open.
// This is a manual/deploy-hook trigger, not something called on every
// request or build — see lib/indexNow.js for why IndexNow pings are a
// handful of calls per change, not a per-visitor ping.

import { NextResponse } from "next/server";
import { pingIndexNow } from "@/lib/indexNow";
import {
  FEATURED_PAIRS,
  FEATURED_BASE_CURRENCIES,
  FEATURED_AMOUNT_PAIRS,
  FEATURED_ZAKAT_GOLD_AMOUNTS,
} from "@/lib/pairSlugs";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.INDEXNOW_TRIGGER_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "INDEXNOW_TRIGGER_SECRET is not configured for this deployment" },
      { status: 503 }
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const siteUrl = getSiteUrl();
  const urls = [
    ...FEATURED_PAIRS.map((pair) => `${siteUrl}/converters/${pair.slug}`),
    ...FEATURED_BASE_CURRENCIES.map((code) => `${siteUrl}/converters/${code.toLowerCase()}`),
    ...FEATURED_AMOUNT_PAIRS.map((entry) => `${siteUrl}/converters/${entry.slug}`),
    ...FEATURED_ZAKAT_GOLD_AMOUNTS.map((entry) => `${siteUrl}/converters/${entry.slug}`),
  ];

  try {
    const result = await pingIndexNow(urls, siteUrl);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message || "IndexNow submission failed" }, { status: 502 });
  }
}
