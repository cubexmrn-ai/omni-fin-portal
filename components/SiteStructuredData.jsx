// components/SiteStructuredData.jsx
//
// Site-wide JSON-LD, rendered once from app/layout.jsx so it's present
// on every page — an Organization entity (so search engines can
// attribute OmniFin Portal as the provider across all its tools), a
// WebSite entity (the canonical site record), and a SoftwareApplication
// entity (the portal as an installable, free web app — see
// public/manifest.json, added in the same launch pass). Same pattern
// as components/ConverterStructuredData.jsx: one <script
// type="application/ld+json"> using "@graph" so all three entities
// share a single @context, built from the same getSiteUrl() helper
// every other piece of metadata/structured data in this project uses
// for absolute URLs.
//
// Honesty note (same bar as ConverterStructuredData.jsx): no
// aggregateRating/review/sameAs social-profile fields are included,
// since this project has no real data to back them — adding
// placeholder values would be the kind of fabricated markup search
// engines penalize rather than reward. SoftwareApplication's `offers`
// below is genuinely $0 (every feature on this site is free, no paid
// tier exists), not a placeholder price.

import { getSiteUrl } from "@/lib/siteUrl";

export default function SiteStructuredData() {
  const siteUrl = getSiteUrl();

  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "OmniFin Portal",
    url: siteUrl,
    // Brand Entity SEO/LLMO definition — the same literal etymology
    // text embedded in components/AboutContent.jsx's "Why OmniFin?"
    // callout, app/layout.jsx's SiteFooter, and public/llms.txt's
    // header summary, so a search/answer engine or AI crawler sees
    // one consistent entity definition for "OmniFin Portal" no matter
    // which of those four surfaces it reads.
    description:
      "OmniFin Portal: 'Omni-' (Latin omnis, 'all' or 'universal') + 'Fin' (financial systems, global markets, personal wealth) + 'Portal' (a unified digital gateway) — a free, universal finance utilities portal providing browser-based client utilities, AI analysis, real-time sentiment, news feeds, price charts, trading journals, and interactive calculators, all under one roof.",
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "OmniFin Portal",
    description:
      "Currency, crypto, metals & commodities and unit converters, live market analysis, trading & financial calculators, and a free trading Academy.",
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "en-US",
    // AI/GEO citation booster (site-wide search target): lets search
    // engines and AI retrieval bots offer a direct search box/action
    // into this site's converter tool, per schema.org's standard
    // WebSite + SearchAction pattern. {search_term_string} is the
    // literal schema.org placeholder token a crawler substitutes with
    // the user's query — it is not interpolated here.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/converters?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareApplication = {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#webapp`,
    name: "OmniFin Portal",
    url: siteUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any (web-based, installable as a PWA)",
    description:
      "A free web-based finance utilities app: currency, crypto & metals converters, trading & personal-finance calculators, a demo trading simulator, live market analysis, and a free trading Academy — installable to your home screen.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [organization, website, softwareApplication],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
