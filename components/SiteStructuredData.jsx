// components/SiteStructuredData.jsx
//
// Site-wide JSON-LD, rendered once from app/layout.jsx so it's present
// on every page — an Organization entity (so search engines can
// attribute OmniFin Portal as the provider across all its tools) plus
// a WebSite entity (the canonical site record). Same pattern as
// components/ConverterStructuredData.jsx: one <script
// type="application/ld+json"> using "@graph" so both entities share a
// single @context, built from the same getSiteUrl() helper every other
// piece of metadata/structured data in this project uses for absolute
// URLs.
//
// Honesty note (same bar as ConverterStructuredData.jsx): no
// aggregateRating/review/sameAs social-profile fields are included,
// since this project has no real data to back them — adding
// placeholder values would be the kind of fabricated markup search
// engines penalize rather than reward.

import { getSiteUrl } from "@/lib/siteUrl";

export default function SiteStructuredData() {
  const siteUrl = getSiteUrl();

  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "OmniFin Portal",
    url: siteUrl,
    description:
      "A free finance utilities portal: a universal currency, crypto & metals converter, a worldwide unit converter, live market charts and AI-aggregated finance news, trading & personal-finance calculators, and a free Academy curriculum.",
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
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [organization, website],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
