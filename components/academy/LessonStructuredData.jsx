// components/academy/LessonStructuredData.jsx
//
// Per-lesson JSON-LD, added Oct 2026 alongside the LessonViewer.jsx
// un-gating fix (that fix made every lesson's real content crawlable;
// this gives each one its own schema to be crawled/cited AS, rather
// than only the /learn hub's aggregate Course schema — see
// components/academy/AcademyStructuredData.jsx's header comment for
// that one). A pure Server Component (no "use client"), same pattern
// as every other *StructuredData.jsx in this project.
//
// Two entities, both built entirely from the lesson's own real data
// (lib/academyData.js) — same honesty bar as the rest of this
// project's schema: nothing here is invented to look more
// authoritative than the content actually is.
//
//   1. LearningResource — the individual-lesson counterpart to the
//      hub's Course/sub-Course entities, linked back to its level via
//      `isPartOf`'s @id match with AcademyStructuredData.jsx's
//      `${courseUrl}#level-${levelId}` identifier, so a crawler that
//      already indexed the Course graph can resolve this lesson as one
//      of its real parts rather than an orphaned page.
//   2. FAQPage — reuses the lesson's actual Checkpoint Quiz prompt/
//      explanation pairs verbatim as Question/Answer entities. These
//      are genuine question-and-answer content (a quiz question,
//      answered by its own explanation text), not fabricated FAQ copy
//      bolted on for schema's sake — omitted entirely for any lesson
//      without a quiz rather than filled with placeholder Q&A.

import { getSiteUrl } from "@/lib/siteUrl";

export default function LessonStructuredData({ levelId, lessonId, level, lesson }) {
  const siteUrl = getSiteUrl();
  const courseUrl = `${siteUrl}/learn`;
  const pageUrl = `${courseUrl}/${levelId}/${lessonId}`;

  const provider = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "OmniFin Portal",
    url: siteUrl,
  };

  // Real section headings only — "text" sections carry a `heading`,
  // the other section types (proTip/risk/formula/visual/tool/
  // relatedLink) don't, so this never invents one to pad the list.
  const teaches = (lesson.sections || [])
    .filter((section) => section.type === "text" && section.heading)
    .map((section) => section.heading);

  const learningResource = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${pageUrl}#lesson`,
    name: lesson.title,
    url: pageUrl,
    isPartOf: { "@id": `${courseUrl}#level-${levelId}` },
    provider,
    isAccessibleForFree: true,
    inLanguage: "en",
    timeRequired: `PT${lesson.estMinutes}M`,
    educationalLevel: level.title,
    ...(teaches.length > 0 ? { teaches } : {}),
  };

  const faqEntity =
    lesson.quiz?.questions?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          mainEntity: lesson.quiz.questions.map((q) => ({
            "@type": "Question",
            name: q.prompt,
            acceptedAnswer: {
              "@type": "Answer",
              text: q.explanation,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResource) }}
      />
      {faqEntity && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqEntity) }}
        />
      )}
    </>
  );
}
