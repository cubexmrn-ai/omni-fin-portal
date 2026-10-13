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
