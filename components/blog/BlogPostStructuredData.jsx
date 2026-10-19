// components/blog/BlogPostStructuredData.jsx
//
// Article + FAQPage JSON-LD for one /blog/[slug] post — same "@graph"
// pattern as components/tools/ToolStructuredData.jsx and
// components/converters/ConvertersFAQStructuredData.jsx: one <script
// type="application/ld+json"> sharing a single @context, built from
// the same getSiteUrl() every structured-data file in this project
// uses for absolute URLs.
//
// HONESTY NOTE (same bar as those files): `author` and `publisher` are
// both the OmniFin Portal Organization entity (the exact same @id
// components/SiteStructuredData.jsx already defines site-wide) — this
// content has no individual named byline, so it isn't given a
// fabricated one. `datePublished`/`dateModified` come straight from
// the post's own data in lib/blogPosts.js, never invented here.

import { getSiteUrl } from "@/lib/siteUrl";

export default function BlogPostStructuredData({ post }) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/blog/${post.slug}`;
  const organizationRef = { "@id": `${siteUrl}/#organization` };

  const article = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: organizationRef,
    publisher: organizationRef,
    image: `${siteUrl}/og-image.png`,
    articleSection: post.category,
  };

  const faqPage =
    post.faqs && post.faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": faqPage ? [article, faqPage] : [article],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
