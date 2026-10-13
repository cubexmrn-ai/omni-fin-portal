// components/academy/AcademyStructuredData.jsx
//
// JSON-LD Course schema for the OmniFin Academy (app/learn/page.jsx) —
// a pure Server Component (no "use client"), same pattern as
// components/ConverterStructuredData.jsx and components/
// SiteStructuredData.jsx. Built entirely from lib/academyData.js's
// real ACADEMY_LEVELS/getLevelStats — every lesson/quiz/minute count
// below is the project's actual curriculum data, not an invented
// figure (same honesty bar as this project's other structured data).
//
// Modeled as one Course (the whole Academy) with `hasPart` listing the
// 5 levels as sub-Course entities — schema.org's documented pattern
// for a curriculum made of ordered modules. No aggregateRating,
// numberOfCredits, or "free certificate" claims are included, since
// none of that is real here.

import { ACADEMY_LEVELS, getLevelStats } from "@/lib/academyData";
import { getSiteUrl } from "@/lib/siteUrl";

export default function AcademyStructuredData() {
  const siteUrl = getSiteUrl();
  const courseUrl = `${siteUrl}/learn`;

  const provider = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "OmniFin Portal",
    url: siteUrl,
  };

  const hasPart = ACADEMY_LEVELS.map((level) => {
    const stats = getLevelStats(level);
    return {
      "@type": "Course",
      "@id": `${courseUrl}#level-${level.id}`,
      name: `Level ${level.order}: ${level.title} — ${level.subtitle}`,
      description: level.description,
      url: `${courseUrl}/${level.id}/${level.lessons[0]?.id || ""}`,
      provider,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: `PT${stats.totalMinutes}M`,
      },
    };
  });

  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${courseUrl}#course`,
    name: "OmniFin Academy — Trading & Personal Finance Curriculum",
    description:
      "A free, gamified trading & personal-finance curriculum: 5 levels from money basics to professional risk management, with bite-sized lessons, visual diagrams, embedded calculators, and end-of-module quizzes.",
    url: courseUrl,
    provider,
    isAccessibleForFree: true,
    inLanguage: "en",
    hasPart,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(course) }}
    />
  );
}
