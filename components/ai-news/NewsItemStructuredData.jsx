// components/ai-news/NewsItemStructuredData.jsx
//
// JSON-LD for an individual AI News permalink page
// (app/ai-news/[slug]/page.jsx) — deliberately a DIFFERENT shape from
// components/NewsStructuredData.jsx's hub-page ItemList, and for the
// same honesty-bar reason that file documents at its own top: the
// headline itself (`item.title`/`item.excerpt`) is a third-party
// article from an external outlet, not something OmniFin Portal wrote
// or publishes. This page is OmniFin Portal's OWN commentary page
// ABOUT that headline (the AI-generated summary/sentiment read, the
// macro directional note when one exists, and the live related-asset
// rate) — so it's marked up as a WebPage authored/published by OmniFin
// Portal, which `citation`s the original NewsArticle (publisher = the
// real outlet, url = the real original link) rather than claiming
// OmniFin wrote that headline. Never the reverse.
export default function NewsItemStructuredData({ item, pageUrl, siteUrl }) {
  if (!item?.title) return null;

  const organization = {
    "@type": "Organization",
    name: "OmniFin Portal",
    url: siteUrl,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: pageUrl,
    name: `${item.title} — OmniFin Portal AI News`,
    ...(item.summary ? { description: item.summary } : item.excerpt ? { description: item.excerpt } : {}),
    // datePublished only — no dateModified, since there's no real
    // edit-tracking for this page's own commentary (the AI summary/
    // sentiment read is generated once, at the same time the headline
    // was first seen) and this project's honesty bar doesn't fabricate
    // a modification date just to fill the field. publishedAt is the
    // one timestamp this page genuinely has either way it was
    // resolved (store-first or live-fallback — see app/ai-news/[slug]/
    // page.jsx's own header comment for that split).
    ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
    author: organization,
    isPartOf: {
      "@type": "WebSite",
      name: "OmniFin Portal",
      url: siteUrl,
    },
    publisher: organization,
    ...(item.link
      ? {
          citation: {
            "@type": "NewsArticle",
            headline: item.title,
            url: item.link,
            ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
            ...(item.excerpt ? { description: item.excerpt } : {}),
            publisher: {
              "@type": "Organization",
              name: item.source,
            },
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
