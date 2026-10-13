// components/converters/ConvertersFAQSection.jsx
//
// Visible FAQ section for /converters — renders the same
// CONVERTERS_FAQS array (components/converters/convertersFaqData.js)
// that components/converters/ConvertersFAQStructuredData.jsx turns
// into FAQPage JSON-LD, through the shared components/FAQAccordion.jsx
// UI. Rendered directly from app/converters/page.jsx, below
// ConvertersWorkspace, so it sits right under the interactive tools it
// explains.

import FAQAccordion from "@/components/FAQAccordion";
import { CONVERTERS_FAQS } from "@/components/converters/convertersFaqData";

export default function ConvertersFAQSection() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
      <FAQAccordion
        title="Converter Guide & FAQs"
        subtitle="Rate update frequency, what's included, and South Asian unit conversions explained."
        items={CONVERTERS_FAQS}
      />
    </div>
  );
}
