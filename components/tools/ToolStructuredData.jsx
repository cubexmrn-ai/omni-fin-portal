// components/tools/ToolStructuredData.jsx
//
// Shared SoftwareApplication + FAQPage JSON-LD renderer for the
// Household Utility Suite (app/tools/*) — same "@graph" pattern as
// components/calculators/CalculatorsStructuredData.jsx and
// components/converters/ConvertersFAQStructuredData.jsx, parameterized
// so each new /tools/<slug> page doesn't need its own bespoke
// structured-data file. Honesty note (same bar as those two files): no
// aggregateRating/review fields, and every tool here is genuinely free
// (Offer price: "0") — no paid tier exists anywhere on this site.

import { getSiteUrl } from "@/lib/siteUrl";

/**
 * @param {{
 *   path: string,              // e.g. "/tools/zakat-calculator"
 *   name: string,              // SoftwareApplication name
 *   description: string,
 *   featureList: string[],
 *   faqs: { question: string, answer: string }[],
 *   applicationCategory?: string, // schema.org SoftwareApplication category
 *                                  // — defaults to "FinanceApplication" since
 *                                  // this component's first 4 callers (the
 *                                  // Household Tools) are all genuinely
 *                                  // finance calculators; the 8 Utility
 *                                  // Tools Suite pages (word counter, JSON
 *                                  // formatter, etc.) explicitly pass their
 *                                  // own accurate category instead, since
 *                                  // none of those are finance apps.
 * }} props
 */
export default function ToolStructuredData({
  path,
  name,
  description,
  featureList,
  faqs,
  applicationCategory = "FinanceApplication",
}) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path}`;

  const softwareApplication = {
    "@type": "SoftwareApplication",
    "@id": `${url}#webapp`,
    name,
    url,
    applicationCategory,
    operatingSystem: "All",
    description,
    featureList,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  const faqPage =
    faqs && faqs.length > 0
      ? {
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": faqPage ? [softwareApplication, faqPage] : [softwareApplication],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
