// app/llms-full.txt/route.js
//
// Serves /llms-full.txt — the exhaustive companion to public/llms.txt
// (that file is a hand-curated, human-readable summary; this is the
// full machine-oriented index llmstxt.org's convention calls the
// "-full" variant: every URL this project actually pre-renders, not a
// representative sample).
//
// DELIBERATELY A DYNAMIC ROUTE, NOT A STATIC public/ FILE: every list
// below (FEATURED_PAIRS, FEATURED_AMOUNT_PAIRS, FEATURED_ZAKAT_GOLD_
// AMOUNTS, FEATURED_UNIT_PAIRS, lessons, blog posts) is the exact same
// single-source-of-truth data app/sitemap.js already reuses for
// exactly this reason — a hand-written static text file listing ~250
// URLs would start drifting out of sync the next time any of those
// arrays changes, silently telling AI crawlers about pages that no
// longer exist (or missing new ones), the same class of bug
// app/sitemap.js's own header comment calls out for its own data.
// Reusing the arrays directly means this file can never drift.
//
// Next.js App Router convention: a route.js inside a folder named
// with the literal target filename (not one of the framework's own
// special conventions like sitemap.xml/robots.txt) serves at that
// exact path — see Next.js's docs on custom route handlers for static
// file-like responses.

import {
  FEATURED_PAIRS,
  FEATURED_BASE_CURRENCIES,
  FEATURED_AMOUNT_PAIRS,
  FEATURED_ZAKAT_GOLD_AMOUNTS,
} from "@/lib/pairSlugs";
import { FEATURED_UNIT_PAIRS } from "@/lib/unitSlugs";
import { getAllLessonsFlat } from "@/lib/academyData";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

function buildLlmsFullText() {
  const siteUrl = getSiteUrl();
  const lines = [];

  lines.push("# OmniFin Portal — Full URL Index for AI Assistants and Crawlers");
  lines.push(`> ${siteUrl}/`);
  lines.push("");
  lines.push(
    "This is the exhaustive companion to /llms.txt (llmstxt.org's \"-full\" convention): " +
      "every URL this project statically pre-renders, generated directly from the same " +
      "data app/sitemap.js uses, so it can never drift out of sync with what's actually " +
      "live. A currency/metal pair or unit combination not listed below may still resolve " +
      "correctly at request time (this site accepts any valid combination), it's simply " +
      "not one of the pre-rendered/sitemapped URLs this index guarantees exists."
  );
  lines.push("");

  lines.push(`## Currency, Crypto & Metal Pairs (${FEATURED_PAIRS.length})`);
  for (const pair of FEATURED_PAIRS) {
    lines.push(`- ${pair.title}: ${siteUrl}/converters/${pair.slug}`);
  }
  lines.push("");

  lines.push(`## Base-Currency Rate Digests (${FEATURED_BASE_CURRENCIES.length})`);
  for (const code of FEATURED_BASE_CURRENCIES) {
    lines.push(`- ${code} vs. every supported currency: ${siteUrl}/converters/${code.toLowerCase()}`);
  }
  lines.push("");

  lines.push(`## Amount-Specific Conversions (${FEATURED_AMOUNT_PAIRS.length})`);
  for (const entry of FEATURED_AMOUNT_PAIRS) {
    lines.push(
      `- ${entry.amount} ${entry.fromCode} to ${entry.toCode}: ${siteUrl}/converters/${entry.slug}`
    );
  }
  lines.push("");

  lines.push(`## Zakat on Gold References (${FEATURED_ZAKAT_GOLD_AMOUNTS.length})`);
  for (const entry of FEATURED_ZAKAT_GOLD_AMOUNTS) {
    lines.push(`- Zakat on ${entry.tolaAmount} tola gold: ${siteUrl}/converters/${entry.slug}`);
  }
  lines.push("");

  lines.push(`## Unit Conversions (${FEATURED_UNIT_PAIRS.length})`);
  for (const pair of FEATURED_UNIT_PAIRS) {
    lines.push(`- ${pair.title || pair.slug}: ${siteUrl}/converters/unit/${pair.slug}`);
  }
  lines.push("");

  const lessons = getAllLessonsFlat();
  lines.push(`## OmniFin Academy Lessons (${lessons.length})`);
  for (const { level, lesson } of lessons) {
    lines.push(`- ${lesson.title || lesson.id} (${level.id}): ${siteUrl}/learn/${level.id}/${lesson.id}`);
  }
  lines.push("");

  lines.push(`## Guides (${BLOG_POSTS.length})`);
  for (const post of BLOG_POSTS) {
    lines.push(`- ${post.title}: ${siteUrl}/blog/${post.slug}`);
  }
  lines.push("");

  lines.push("## Notes");
  lines.push(
    "- All rates and figures on live pages are time-sensitive; cite the live page itself, " +
      "never a cached or remembered value."
  );
  lines.push(`- Human-readable summary: ${siteUrl}/llms.txt`);
  lines.push(`- Full sitemap (XML): ${siteUrl}/sitemap.xml`);

  return lines.join("\n") + "\n";
}

export async function GET() {
  return new Response(buildLlmsFullText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
