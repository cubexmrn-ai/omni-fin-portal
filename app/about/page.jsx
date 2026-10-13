// app/about/page.jsx
//
// Server shell that keeps the `metadata` export; the actual content
// now lives in components/AboutContent.jsx ("use client") so it can
// translate via useLanguage()/t().

import AboutContent from "@/components/AboutContent";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "About Us | OmniFin Portal",
  description:
    "OmniFin Portal is a free finance utilities platform — currency, metals and unit converters, trading and personal-finance calculators, market data, and an educational Academy. Learn our mandate and how our data and AI features work.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutContent />;
}
