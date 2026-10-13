// lib/pageMetadata.js
//
// Shared helper for building a Next.js App Router `metadata` object
// with real Open Graph + Twitter Card fields — every page.jsx in this
// project used to export just `{ title, description }`, which left
// `openGraph`/`twitter` inherited unchanged from app/layout.jsx's
// homepage-flavored defaults on every single route (same homepage
// title/image for a shared link to /learn, /calculators, /community,
// etc.). buildMetadata() gives each route its own rich preview instead,
// without every page.jsx having to hand-write the same openGraph/
// twitter boilerplate (and risk drifting out of sync with each other).
//
// `image` defaults to the site's one real Open Graph image
// (public/og-image.png, 1200x630) — there's no per-page illustration
// system in this project, so every route honestly shares that single
// branded image today. The parameter exists so a future page CAN pass
// its own without this helper (or every call site) needing a rewrite.

import { getSiteUrl } from "@/lib/siteUrl";

const SITE_NAME = "OmniFin Portal";
const DEFAULT_OG_IMAGE = "/og-image.png";
const DEFAULT_OG_IMAGE_ALT = "OmniFin Portal — currency, metals & crypto converter, trading calculators, Academy and market analysis";

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   path: string,            // e.g. "/learn" — used for canonical + OG url
 *   image?: string,          // defaults to the shared /og-image.png
 *   imageAlt?: string,
 *   type?: "website" | "article",
 *   noIndex?: boolean,       // for utility pages that shouldn't rank
 * }} options
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  type = "website",
  noIndex = false,
}) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;

  const metadata = {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  if (noIndex) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}
