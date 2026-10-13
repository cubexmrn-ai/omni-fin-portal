// components/converters/ConvertersFAQStructuredData.jsx
//
// FAQPage JSON-LD for /converters, built from the exact same
// CONVERTERS_FAQS array components/converters/ConvertersFAQSection.jsx
// renders into the visible accordion below the converter tools — see
// components/converters/convertersFaqData.js's header comment for
// where each figure in these answers actually comes from. Same
// honesty bar as every other structured-data file in this project: no
// answer here says anything the page itself doesn't already show.

import { getSiteUrl } from "@/lib/siteUrl";
import { CONVERTERS_FAQS } from "@/components/converters/convertersFaqData";

export default function ConvertersFAQStructuredData() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/converters#faq`,
    mainEntity: CONVERTERS_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
